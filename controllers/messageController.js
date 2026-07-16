const Message = require("../models/Message");
const User = require("../models/User");

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text?.trim()) {
      return res.status(400).json({ message: "Receiver and message text are required" });
    }
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }
    if (!(await User.exists({ _id: receiverId }))) {
      return res.status(404).json({ message: "User not found" });
    }
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: text.trim(),
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    }).sort({ createdAt: -1 });
    const latestByUser = new Map();
    for (const message of messages) {
      const otherId = message.sender.toString() === myId.toString()
        ? message.receiver.toString()
        : message.sender.toString();
      if (!latestByUser.has(otherId)) latestByUser.set(otherId, message);
    }
    const users = await User.find({ _id: { $in: [...latestByUser.keys()] } }).select("-password");
    const usersById = new Map(users.map((user) => [user._id.toString(), user]));
    res.json([...latestByUser.entries()]
      .filter(([userId]) => usersById.has(userId))
      .map(([userId, lastMessage]) => ({ user: usersById.get(userId), lastMessage })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!(await User.exists({ _id: userId }))) {
      return res.status(404).json({ message: "User not found" });
    }
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getConversations, getMessages };
