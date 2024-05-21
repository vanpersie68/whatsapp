const createHttpError = require("http-errors");
const validator = require("validator");
const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.createUser = async(userData) => {
    const {name, email, picture, status, password} = userData;

    if(!name || !email || !password){
        throw createHttpError.BadRequest("Please fill all fields.");
    }

    if(!validator.isLength(name, {min: 2, max: 16})) {
        throw createHttpError.BadRequest("Please make sure your name is between 2 and 16 characters."); 
    }

    if(status){
        if(status.length > 64){
            throw createHttpError.BadRequest("Please make sure your status is less than 64 characters."); 
        }
    }

    if(!validator.isEmail(email)){
        throw createHttpError.BadRequest("Please make sure to provide a valid email address.");
    }

    const checkDb = await UserModel.findOne({email});

    if(checkDb){
        throw createHttpError.Conflict("Please try again with a different email address, this email address already exist.");
    }

    if(!validator.isLength(password, {min: 6, max:128})){
        throw createHttpError.Conflict("Please make sure your password is between 6 and 128 characters.");
    }

    const user = await new UserModel({
        name, 
        email, 
        picture: picture || process.env.DEFAULT_PICTUER, 
        status: status || process.env.DEFAULT_STATUS, 
        password,
    }).save();

    return user;
};

exports.signUser = async(email, password) => {
    //调用 lean() 会使查询结果更轻量，不包含 Mongoose 特定的方法和属性。
    const user = await UserModel.findOne({email: email.toLowerCase()}).lean();

    if(!user){
        throw createHttpError.NotFound("Invalid credentials.");
    } 

    let passwordMatches = await bcrypt.compare(password, user.password);

    if(!passwordMatches) {
        throw createHttpError.NotFound("Invalid credentials.");
    }

    return user;
};