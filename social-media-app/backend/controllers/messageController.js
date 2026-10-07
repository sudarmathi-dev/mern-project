const Message = require("../models/Message");
const { emitToUser } = require("../utils/socket");
const { createNotification } = require("../utils/createNotification");

// @desc    Send a DM
// @route   POST /api/messages/:userId
const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const receiverId = req.params.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
    });

    const populated = await message.populate("sender", "username profilePic");

    // Real-time delivery to receiver
    emitToUser(receiverId, "newMessage", populated);

    // Persistent notification
    await createNotification({
      recipient: receiverId,
      sender: req.user._id,
      type: "message",
    });

    res.status(201).json({ message: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation history with a specific user
// @route   GET /api/messages/:userId
const getConversation = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username profilePic")
      .populate("receiver", "username profilePic");

    // Mark messages from the other user as read
    await Message.updateMany(
      { sender: otherUserId, receiver: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of conversations (inbox) with last message per user
// @route   GET /api/messages
const getInbox = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver", userId] }, { $eq: ["$read", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          "user.username": 1,
          "user.profilePic": 1,
          "user._id": 1,
          lastMessage: 1,
          unreadCount: 1,
        },
      },
    ]);

    res.status(200).json({ conversations });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getConversation, getInbox };
