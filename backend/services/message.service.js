const createHttpError = require("http-errors");
const { MessageModel } = require("../models/index.js");

exports.createMessage = async(msgData) => {
    let newMessage = await MessageModel.create(msgData);
    if(!newMessage) throw createHttpError.BadRequest("Oops...Something went wrong !");
    return newMessage;
};

exports.populateMessage = async(id) => {
    let msg = await MessageModel.findById(id)
        .populate({
            path: "sender",
            select: "name picture",
            model: "UserModel",
        })
        .populate({
            path: "conversation",
            select: "name picture isGroup users",
            model: "ConversationModel",
            populate: {
                path: "users",
                select: "name email picture status",
                model: "UserModel",
            }
        });

    if(!msg) throw createHttpError.BadRequest("Oops...Something went wrong !");
    return msg;
};

exports.getConvoMessages = async(convo_id) => {
    const messages = await MessageModel.find({
        conversation: convo_id
    }).populate("sender", "name picture email status").populate("conversation");

    if(!messages) throw createHttpError.BadRequest("Oops...Something went wrong !");
    return messages;
};