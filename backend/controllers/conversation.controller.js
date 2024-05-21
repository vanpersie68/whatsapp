const createHttpError = require("http-errors");
const logger = require("../configs/logger.config.js");
const { doesConversationExist, createConversation, populateConversation, getUserConversations } = require("../services/conversation.service.js");
const { UserModel } = require("../models/index.js");

exports.create_open_conversation = async(req, res, next) => {
    try {
        const sender_id = req.user.userId;
        const { receiver_id, isGroup } = req.body;

        if (isGroup == false) {
            if (!receiver_id) {
                logger.error("Please provide the user id you wanna start a conversation with! ");
                throw createHttpError.BadGateway("Something went wrong !");
            }

            //检查聊天是否存在
            const existed_conversation = await doesConversationExist(sender_id, receiver_id, false);

            if (existed_conversation) {
                res.json(existed_conversation);
            } else {
                // let receiver_user = await UserModel.findById(receiver_id);
                let convoData = {
                    name: "conversation name",
                    picture: "conversation picture",
                    isGroup: false,
                    users: [sender_id, receiver_id],
                };

                //创建聊天
                const newConv = await createConversation(convoData);

                //增加一些聊天 双方用户的信息
                const populateConvo = await populateConversation(
                    newConv._id,
                    "users",
                    "-password"
                )
                res.status(200).json(populateConvo);
            }
        } else {
            console.log("进来了", isGroup);
            const existed_group_conversation = await doesConversationExist("", "", isGroup);
            res.status(200).json(existed_group_conversation);
        }
    } catch(error) {
        next(error);
    }
};

exports.getConversations = async(req, res, next) => {
    try {
        const user_id = req.user.userId;
        const conversations = await getUserConversations(user_id);
        res.status(200).json(conversations);
    } catch(error) {
        next(error);
    }
};

exports.createGroup = async(req, res, next) => {
    const {name, users} = req.body;
    //add current user to users
    users.push(req.user.userId);

    if (!name || !users) {
        throw createHttpError.BadRequest("Please fill all fields.");
    }
    if (users.length < 2) {
        throw createHttpError.BadRequest(
            "At least 2 users are required to start a group chat."
        );
    }

    let convoData = {
        name,
        users,
        isGroup: true,
        admin: req.user.userId,
        picture: process.env.DEFAULT_GROUP_PICTURE,
    };

    try {
        const newConvo = await createConversation(convoData);
        const populatedConvo = await populateConversation(
            newConvo._id, "users admin", "-password"
        );

        console.log("输出", populatedConvo);
        res.status(200).json(populatedConvo);
    } catch(error) {
        next(error);
    }
};