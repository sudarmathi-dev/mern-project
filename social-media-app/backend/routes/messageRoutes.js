const express = require("express");
const { sendMessage, getConversation, getInbox } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getInbox);
router.get("/:userId", getConversation);
router.post("/:userId", sendMessage);

module.exports = router;
