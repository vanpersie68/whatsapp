/* 
    on(eventName, callback)：作用：用于在服务器端监听指定事件的发生。
    参数：eventName：要监听的事件名称。callback：事件发生时执行的回调函数，通常用于处理接收到的数据。

    emit(eventName, data)：作用：用于向服务器端或客户端发送指定事件。
    参数：eventName：要发送的事件名称。data：要发送的数据，可以是任何JavaScript对象或原始数据类型。

    in(room)：作用：用于将消息发送到指定的房间。
    参数：room：要发送消息的房间名称或房间ID。
    
    join(room)：作用：将当前连接的Socket加入指定的房间。
    参数：room：要加入的房间名称或房间ID。
*/

let onlineUsers = [];

/* io 是整个服务器的管理者，负责管理所有的连接，而 socket 则是单个连接的代表，
用于与对应的客户端进行通信。 */
exports.SocketServer = (socket, io) => {
    //user joins or opens the application
    socket.on('join', (user) => {
        socket.join(user);
        //add joined user to online users
        //some是一个数组方法，用于检查 onlineUsers 数组中是否存在满足条件的元素
        if(!onlineUsers.some((onlineUser) => onlineUser.userId === user)) {
            onlineUsers.push({
                userId: user,
                socketId: socket.id,
            })
        }

        //send online users to frontend
        io.emit("get-online-users", onlineUsers);
        //send socket id
        io.emit("setup socket", socket.id);
    });

    //socket disconnect
    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit("get-online-users", onlineUsers);
    });

    //join a conversation room
    socket.on("join conversation", (conversation) => {
        socket.join(conversation);
    });

    //send and receive message
    socket.on("send message", (message) => {
        console.log("New message receives: ", message);
        let conversation = message.conversation;
        if (!conversation.users) return;
        conversation.users.forEach((user) => {
            if (user._id === message.sender._id) return;
            // in 表示 将消息发送到指定的房间
            socket.in(user._id).emit("receive message", message);
        });
    });

    //typing
    socket.on("typing", (conversation) => {
        socket.in(conversation).emit("typing", conversation);
    });

    //stop typing
    socket.on("stop typing", (conversation) => {
        socket.in(conversation).emit("stop typing");
    });

    //call
    //---call user
    socket.on("call user", (data) => {
        let userId = data.userToCall;
        let userSocketId = onlineUsers.find((user) => user.userId == userId);
        // 向特定的用户发送 "call user" 事件。在事件中，它传递了一个包含以下数据的对象
        io.to(userSocketId.socketId).emit("call user", {
            signal: data.signal,
            from: data.from,
            name: data.name,
            picture: data.picture,
            //callerId: data.callerId
        });
    });

    //---answer call
    socket.on("answer call", (data) => {
        io.to(data.to).emit("call accepted", data.signal);
    });

    //---end call
    socket.on("end call", (id) => {
        io.to(id).emit("end call");
    });
};
