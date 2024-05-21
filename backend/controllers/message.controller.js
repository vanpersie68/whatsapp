const createHttpError = require("http-errors");
const logger = require("../configs/logger.config.js");
const { updateLatestMessage } = require("../services/conversation.service.js");
const {createMessage,  getConvoMessages, populateMessage} = require("../services/message.service.js");

exports.sendMessage = async(req, res, next) => {
    try {
        const user_id = req.user.userId;
        const { message, convo_id, files } = req.body;
        if(!convo_id || (!message && !files)){
            logger.error("Please provider a conversation id and a message body.");
            return res.sendStatus(400);
        }

        const msgData = {
            sender: user_id,
            message,
            conversation: convo_id,
            files: files || [],
        };

        let newMessage = await createMessage(msgData);
        let populatedMessage = await populateMessage(newMessage._id);

        await updateLatestMessage(convo_id, newMessage);
        res.json(populatedMessage);
    } catch (error) {
        next(error);
    }
};

exports.getMessages = async(req, res, next) => {
    try {
        const convo_id = req.params.convo_id;
        if(!convo_id){
            logger.error("Please add a conversation id in params.");
            res.sendStatus(400);
        }

        const messages = await getConvoMessages(convo_id);
        res.json(messages);
    } catch (error) {
        next(error);
    }
};
