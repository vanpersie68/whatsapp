import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../components/sidebar";
import { getConversations, updateMessagesAndConversations } from "../features/chatSlice";
import { ChatContainer, WhatsappHome } from "../components/chat";
import SocketContext from "../context/SocketContext";
import Call from "../components/chat/call/Call";
import { getConversationId, getConversationName, getConversationPicture } from "../utils/chat";
// SimplePeer 是一个用于简化 WebRTC 连接过程的库，使开发者可以更轻松地建立点对点连接，并进行音视频通话或数据传输
import Peer from "simple-peer";

const callData = {
    socketId: "",
    receiveingCall: false,
    callEnded: false,
    name: "",
    picture: "",
    signal: "",
};

function Home({ socket }){
    const dispatch = useDispatch();
    //online users
    const [onlineUsers, setOnlineUsers] = useState([]);
    //typing
    const [typing, setTyping] = useState(false);
    const { user } = useSelector((state) => state.user);
    const { activeConversation } = useSelector((state) => state.chat);

    //call
    const [call, setCall] = useState(callData);
    const [stream, setStream] = useState(); //同时存储视频和音频的地方
    const [show, setShow] = useState(false);
    const { receiveingCall, callEnded, socketId } = call;
    const [callAccepted, setCallAccepted] = useState(false);
    const [totalSecInCall, setTotalSecInCall] = useState(0);
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    //user join into the socket io
    useEffect(() => {
        socket.emit('join', user._id);
        //get online users
        socket.on("get-online-users", (users) => {
            setOnlineUsers(users);
        });
    }, [user]);

    //get Conversations
    useEffect(() => {
        if(user?.token) {
            dispatch(getConversations(user.token));
        }
    }, [user]);

    //lsitening to receiving a message
    useEffect(() => {
        socket.on("receive message", (message) => {
            dispatch(updateMessagesAndConversations(message));
        });

        //listening when a user is typing
        socket.on("typing", (conversation) => setTyping(conversation));
        socket.on("stop typing", () => setTyping(false));
    }, []);

    //------------------------------------------------------------------------------
    // call useEffect
    useEffect(() => {
        setUpMedia();
        socket.on("setup socket", (id) => {
            setCall({ ...call , socketId: id });
        });

        socket.on("call user", (data) => {
            setCall({
                ...call,
                socketId: data.from,
                name: data.name,
                picture: data.picture,
                signal: data.signal,
                receiveingCall: true,
            });
        });

        socket.on("end call", () => {
            setShow(false);
            setCall({ ...call, callEnded: true, receiveingCall: false });
            myVideo.current.srcObject = null;
            if (callAccepted) {
                connectionRef?.current?.destroy();
            }
        });
    }, []);

    const setUpMedia = () => {
        // 获取用户的摄像头和麦克风权限 video: true 表示请求视频流，audio: true 表示请求音频流。
        navigator.mediaDevices.getUserMedia({
            video: true, audio: true
        }).then((stream) => { //一旦用户授权了权限, 执行 setStream 方法
            setStream(stream); 
        });
    };

    const enableMedia = () => {
        // 将获取的视频流显示在页面上的 <video> 元素中，让用户可以看到他们的摄像头视频。
        myVideo.current.srcObject = stream;
        setShow(true);
    };

    // call user function
    const callUser = () => {
        enableMedia();
        setCall({
            ...call,
            name: getConversationName(user, activeConversation.users),
            picture: getConversationPicture(user, activeConversation.users),
        });

        const peer = new Peer({
            initiator: true, //指定当前 Peer 对象为通信的发起者，即它将尝试建立连接。
            trickle: false, //关闭了 ICE trickle 功能。ICE 是用于在 WebRTC 中建立连接的协议，trickle ICE 允许通过多个通道逐步发送 ICE 候选。
            stream: stream, // 指定了本地视频流，这是在之前的代码中通过 getUserMedia 获取到的视频流
        });

        //console.log("peer: ", peer);
        //当 Peer 对象生成信号时，发送一个 "call user" 事件到服务器
        peer.on("signal", (data) => {
            //console.log("data: ", data);
            socket.emit("call user", {
                userToCall: getConversationId(user, activeConversation.users),
                signal: data, 
                from: socketId,
                name: user.name,
                picture: user.picture,
            });
        });

        /* 当 Peer 对象接收到远程流时，将其分配给 userVideo 元素的 srcObject 属性，以便在页面上显示远程视频流。 */
        peer.on("stream", (stream) => {
            userVideo.current.srcObject = stream;
        });

        socket.on("call accepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        // 用于跟踪当前连接的引用
        connectionRef.current = peer;
    };

    // answer call  funcion
    const answerCall = () => {
        enableMedia();
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false, 
            trickle: false, 
            stream: stream, 
        });

        peer.on("signal", (data) => {
            socket.emit("answer call", {
                signal: data,
                to: call.socketId,
            })
        });

        peer.on("stream", (stream) => {
            userVideo.current.srcObject = stream;
        });

        peer.signal(call.signal);
        connectionRef.current = peer;
    };

    // end call funcion
    const endCall = () => {
        setShow(false);
        setCall({ ...call, callEnded: true, receiveingCall: false});
        myVideo.current.srcObject = null;
        socket.emit("end call", call.socketId);
        if (callAccepted) {
        connectionRef?.current?.destroy();
        }
    };

    return(
        <div className="h-screen dark:bg-dark_bg_1 flex items-center justify-center overflow-hidden">
            {/* container */}
            <div className="container h-screen flex py-[19px]">
                {/* Sidebar */}
                <Sidebar onlineUsers={onlineUsers} typing={typing} />

                {/* 正在活跃的对话 */}
                {activeConversation._id ? (
                    <ChatContainer onlineUsers={onlineUsers} typing={typing} callUser={callUser} />
                ) : (
                    <WhatsappHome />
                )}
            </div>

            {/* Call */}
            <div className={(show || call.signal) && !call.callEnded ? "" : "hidden"}>
                <Call call={call} setCall={setCall} callAccepted={callAccepted} myVideo={myVideo} userVideo={userVideo}
                    stream={stream} answerCall={answerCall} show={show} endCall={endCall} totalSecInCall={totalSecInCall}
                    setTotalSecInCall={setTotalSecInCall} />
            </div>
        </div>
    )
}

/* 这段代码的作用是从 SocketContext 中获取 socket.io 实例，并将其作为 socket 属性传递给 Home 
组件。这样，在 Home 组件中就可以通过 props.socket 来访问到 socket.io 实例，从而实现与服务器的实时通信。 */
const HomeWithSocket = (props) => (
    <SocketContext.Consumer>
        {(socket) => <Home {...props} socket={socket} />}
    </SocketContext.Consumer>
);

export default HomeWithSocket;