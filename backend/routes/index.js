const express = require("express");
const authRoutes = require("./auth.route.js");
const CoversationRoutes = require("./conversation.route.js");
const MessageRoutes = require("./message.route.js");
const userRoutes = require("./user.route.js");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/conversation", CoversationRoutes);
router.use("/message", MessageRoutes);
router.use("/user", userRoutes);

module.exports = router;