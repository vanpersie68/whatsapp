const createHttpError = require("http-errors");
const { ConversationModel, UserModel } = require("../models/index.js");

//判断聊天是否存在
exports.doesConversationExist = async(sender_id, receiver_id, isGroup) => {
    //不是群聊
    if (isGroup === false) {
        let convos = await ConversationModel.find({
            isGroup: false, //这表示要查询的对话必须不是群组对话
            $and: [
                //这个条件是通过 $elemMatch 查询来查找包含指定用户 ID（sender_id）的 users 数组。
                { users: { $elemMatch: { $eq: sender_id } } },
                { users: { $elemMatch: { $eq: receiver_id } } },
            ],
        }) /* 用于将对话文档中的 users 字段（可能是一个用户数组）关联到 User 模型，以便在查询结果中将其替换为用户对象。
    第一个参数是要关联的字段名（这里是 users），第二个参数是指定要排除的字段（这里是 -password，意味着排除用户对象
    中的密码字段）。*/
            .populate("users", "-password").populate("latestMessage");

        if (!convos)
            throw createHttpError.BadRequest("Something went wrong!");

        //填充查询结果中的对话对象的 latestMessage 字段中的 sender 字段
        convos = await UserModel.populate(convos, {
            /* 这是填充的选项对象。path 属性指定要填充的字段路径，这里是 latestMessage.sender，
            意味着填充对话对象中的 latestMessage 字段中的 sender 字段 */
            path: "latestMessage.sender",
            select: "name email picture status", //这些字段将会从数据库中取出并填充到结果对象中
        });

        return convos[0];
    } else {
        //是群聊
        let convo = await ConversationModel.findById(isGroup)
            .populate("users admin", "-password")
            .populate("latestMessage");

        if (!convo)
            throw createHttpError.BadRequest("Something went wrong!");

        convo = await UserModel.populate(convo, {
            path: "latestMessage.sender",
            select: "name email picture status",
        })

        return convo;
    }
};

//创建聊天
exports.createConversation = async(convoData) => {
    const newConvo = await ConversationModel.create(convoData);
    if(!newConvo)
        throw createHttpError.BadRequest("Something went wrong!");
    return newConvo;
};

//增加一些聊天 双方用户的信息
exports.populateConversation = async(id, fieldToPopulate, fieldToRemove) => {
    const populateConvo = await ConversationModel.findOne({ _id: id}).populate(fieldToPopulate, fieldToRemove);
    if(!populateConvo)
        throw createHttpError.BadRequest("Something went wrong!");
    return populateConvo;
};

exports.getUserConversations = async(user_id) => {
    let conversations; 
    await ConversationModel.find({
        users: { $elemMatch: { $eq: user_id }},
    })
        .populate("users", "-password")
        .populate("admin", "-password")
        .populate("latestMessage") //最近更新的对话排在前面
        .then(async(results) => {
            //将填充 latestMessage.sender 字段，将其替换为发送者用户对象，同时只选择其名称、邮箱、头像和状态字段
            results = await UserModel.populate(results, {
                path: "latestMessage.sender",
                select: "name, email, picture, status",
            });

            conversations = results;
        })
    .catch((err) => {
        throw createHttpError.BadRequest("Oops...Something went wrong !");
    });

    return conversations;
};

exports.updateLatestMessage = async(convo_id, newMessage) => {
    const updatedConvo = await ConversationModel.findByIdAndUpdate(convo_id, {
        latestMessage: newMessage,
    });

    if(!updatedConvo)
        throw createHttpError.BadRequest("Oops...Something went wrong !");

    return updatedConvo;
};