const createHttpError = require("http-errors");
const UserModel = require("../models/userModel.js");

exports.findUser = async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user) throw createHttpError.BadRequest("Please fill all fields.");
    return user;
};

// 查找名字或邮箱包含指定关键词的用户，但排除了特定的用户（即调用此函数的用户本身)
exports.searchUsers = async (keyword, userId) => {
    const users = await UserModel.find({
        $or: [
            {name: {$regex: keyword, $options: "i"}}, //"i"代表不区分大小写
            {email: {$regex: keyword, $options: "i"}},
        ],
    }).find({
        _id: { $ne: userId }, //排除掉用户自己, ne = not equal
    });

    return users;
};