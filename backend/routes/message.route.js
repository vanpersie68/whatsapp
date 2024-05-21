const express = require("express");
const trimRequest = require("trim-request");
const authMiddleware = require("../middlewares/authMiddleware.js");
const {sendMessage, getMessages} = require("../controllers/message.controller.js");
const router = express.Router();

router.route("/").post(trimRequest.all, authMiddleware, sendMessage); 
router.route("/:convo_id").get(trimRequest.all, authMiddleware, getMessages); 

module.exports = router;