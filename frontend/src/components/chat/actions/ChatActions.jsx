import React from 'react';
import EmojiPickerApp from './EmojiPicker';
import { ClipLoader } from "react-spinners";
import { SendIcon } from "../../../svg";
import { Attachments } from './attachments';
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Input from "./Input";
import { sendMessage } from '../../../features/chatSlice';
import SocketContext from "../../../context/SocketContext";

function ChatActions({ socket }) {
    const dispatch = useDispatch();
    const { activeConversation, status } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.user);
    const { token } = user;

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);

    const values = {
        message,
        convo_id: activeConversation._id,
        files: [],
        token,
    };
    
    const SendMessageHandler = async(e) => {
        e.preventDefault(); // 阻止事件的默认行为
        setLoading(true);
        let newMsg = await dispatch(sendMessage(values));
        socket.emit("send message", newMsg.payload);
        setMessage("");
        setLoading(false);
    };
    const textRef = useRef();

    return (
        <form onSubmit={(e)=> SendMessageHandler(e)}
        className="dark:bg-dark_bg_2 h-[60px] w-full flex items-center absolute bottom-0 py-2 px-4 select-none">
            {/*Container*/}
            <div className='w-full flex items-center gap-x-2'>
                {/*Emojis and attachpments*/}
                <ul className="flex gap-x-2">
                    <EmojiPickerApp message={message} setMessage={setMessage} setShowAttachments={setShowAttachments}
                        showPicker={showPicker} setShowPicker={setShowPicker} textRef={textRef} />

                    <Attachments setShowPicker={setShowPicker} showAttachments={showAttachments} 
                        setShowAttachments={setShowAttachments}/>
                </ul>

                {/*Input*/}
                <Input message={message} setMessage={setMessage} textRef={textRef} />

                {/*Send button*/}
                <button type="submit" className="btn">
                    {status === "loading" && loading ? (
                        <ClipLoader color="#E9EDEF" size={25} /> 
                    ) : (
                        <SendIcon className="dark:fill-dark_svg_1" />
                    )}
                </button>
            </div>
        </form>
    )
}

const ChatActionsWithSocket = (props) => (
    <SocketContext.Consumer>
        {(socket) => <ChatActions {...props} socket={socket} />}
    </SocketContext.Consumer>
);
export default ChatActionsWithSocket;