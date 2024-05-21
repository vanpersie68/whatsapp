const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");

async function authenticateToken(req, res, next) {
    if (!req.headers["authorization"])
        return next(createHttpError.Unauthorized());
    const bearerToken = req.headers["authorization"];
    const token = bearerToken.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            return next(createHttpError.Unauthorized());
        }
        req.user = payload;
        next();
    });
}

// 使用 CommonJS 语法导出
module.exports = authenticateToken;