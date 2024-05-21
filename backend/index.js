const app =  require("./app");
const { Server } = require("socket.io");
//const SocketServer = require("./SocketServer.js");
const logger = require("./configs/logger.config.js");
const mongoose = require("mongoose");
const { SocketServer } = require("./SocketServer.js");

const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.DATABASE_URL,
    {useNewUrlParser: true, useUnifiedTopology: true,})
    .then(() => logger.info("Database connected successfully"));

mongoose.connection.on("error", (err) => {
    logger.error(`Mongodb connection error: ${err}`);
    process.exit(1);
});

if(process.env.NODE_ENV !== "production"){
    mongoose.set("debug", true);
}

let server;

server = app.listen(PORT, () => {
    logger.info(`server is listening at ${PORT}`);
});

//socket io
/* 创建了一个新的 socket.io 服务器实例; 第一个参数是一个已经存在的 HTTP 
服务器实例（在这里是 server），第二个参数是一个配置对象 */
const io = new Server(server, {
    //如果客户端在 60 秒内没有响应服务器的 ping 消息，那么服务器将视为客户端已断开连接
    pingTimeout: 60000,
    /* 这个配置选项指定了跨域资源共享（CORS）的设置。origin 表示允许哪些源的请求访问该服务器 */
    cors: {
        origin: process.env.CLIENT_ENDPOINT,
    },
});

/* 这一行代码监听客户端的连接事件。当客户端连接到服务器时，将触发这个事件，并执行回调函数。
回调函数接收一个 socket 参数，表示与客户端建立的 socket 连接 */
io.on("connection", (socket) => {
    logger.info("socket io connected successfully.");
    /* 用来处理客户端的消息和事件的函数，将 socket 和 io 对象传递给它，以便处理与客户端的通信 
        io 是整个服务器的管理者，负责管理所有的连接，而 socket 则是单个连接的代表，用于与对应的客户端进行通信。
    */
    SocketServer(socket, io);
});

const exitHandler = ()=>{
    if(server){
        logger.info("Server closed");
        process.exit(1);
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
};

//当应用程序发生未捕获的异常时，触发 uncaughtException 事件，
process.on("uncaughtException", unexpectedErrorHandler);
//当一个 Promise 被拒绝但未被处理时，触发 unhandledRejection 事件
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", ()=>{
    if(server){
        logger.info("Server closed");
        process.exit(1);
    }
});