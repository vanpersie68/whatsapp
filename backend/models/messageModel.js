const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const messageSchema = mongoose.Schema({
    sender: {
        type: ObjectId,
        ref: "UserModel",
    },
    message: {
        type: String,
        trim: true,
    },
    conversation: {
        type: ObjectId,
        ref: "ConversationModel",
    },
    files: [],
}, {
    collection: "messages",
    timestamps: true,
});

module.exports = mongoose.models.MessageModel || mongoose.model("MessageModel", messageSchema);