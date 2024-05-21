const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan"); 
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const fileupload = require("express-fileupload");
const cors = require("cors");
const createHttpError = require("http-errors");
const routes = require("./routes/index.js");

const app = express();
if(process.env.NODE_ENV !== "production"){
    app.use(morgan("dev")); //日志记录中间件，用于记录 HTTP 请求的信息。
}

app.use(helmet()); //提高应用的安全性
app.use(express.json()); //解析传入请求的 JSON 格式的数据
app.use(express.urlencoded({extended: true})); //解析传入请求的 URL 编码形式的数据
app.use(mongoSanitize()); //防范 MongoDB 注入攻击
app.use(cookieParser()); //解析请求中的 cookie 数据
app.use(compression()); //对传输的响应d进行压缩，以减少数据传输量，提高性能
app.use(fileupload({
    useTempFiles: true,
})); //将上传的文件存储为临时文件
app.use(cors({
    origin: "http://localhost:3000",
})); //用于处理跨域资源共享

app.use("/api/v1", routes);

dotenv.config();

//捕获所有未匹配到路由的请求
app.use(async(req, res, next) => {
    next(createHttpError.NotFound("This route does not exist."));
});

//处理发生在应用程序中的错误
app.use(async(error, req, res, next) => {
    res.status(error.status || 500);
    res.send({
        error: {
            status: error.status || 500,
            message: error.message,
        }
    });
});

module.exports = app;