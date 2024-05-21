const createHttpError = require("http-errors");
const { createUser, signUser } = require("../services/auth.service");
const { generateToken, verifyToken } = require("../services/token.service.js");
const { findUser } = require("../services/user.service.js");

exports.register = async(req, res, next) => {
    try{
        const {name, email, picture, status, password} = req.body;
        console.log("picture path: ", picture);
        const newUser = await createUser({
            name, email, picture, status, password
        });

        const access_token = await generateToken({userId: newUser._id}, "1d", process.env.ACCESS_TOKEN_SECRET);
        const refresh_token = await generateToken({userId: newUser._id}, "30d", process.env.REFRESH_TOKEN_SECRET);
        
        res.cookie("refreshtoken", refresh_token, {
            httpOnly: true,
            path: "/api/v1/auth/refreshtoken",
            maxAge: 30*24*60*60*1000,
        });
        
        res.json({
            message: "register success.",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                picture: newUser.picture,
                status: newUser.status,
                token: access_token,
            },
        });
    } catch(error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await signUser(email, password);
        const access_token = await generateToken({ userId: user._id }, "1d", process.env.ACCESS_TOKEN_SECRET);
        const refresh_token = await generateToken({ userId: user._id }, "30d", process.env.REFRESH_TOKEN_SECRET);

        res.cookie("refreshtoken", refresh_token, {
            httpOnly: true,
            path: "/api/v1/auth/refreshtoken",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({
            message: "login success.",
            access_token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                status: user.status,
                token: access_token,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async(req, res, next) => {
    try{
        res.clearCookie("refreshtoken", {path: "/api/v1/auth/refreshtoken"});
        res.json({
            message: "logout!",
        })
    } catch(error) {
        next(error);
    }
};

exports.refreshtoken = async(req, res, next) => {
    try{
        const refresh_token = req.cookies.refreshtoken;
        if(!refresh_token){
            throw createHttpError.Unauthorized("Please login.");
        }

        const check = await verifyToken(
            refresh_token,
            process.env.REFRESH_TOKEN_SECRET 
        );
        
        const user = await findUser(check.userId);
        const access_token = await generateToken(
            {userId: user._id}, "1d", process.env.ACCESS_TOKEN_SECRET
        );

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                status: user.status,
                token: access_token,
            },
        });
    } catch(error) {
        next(error);
    }
};