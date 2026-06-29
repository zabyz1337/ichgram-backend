const User = require("../models/User");

const getProfile = async (req, res) => {
  res.json(req.user);
};

const searchUsers = async (req, res) => {
  try {
    const search = req.query.q;

    if (!search) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { username: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ],
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  searchUsers,
};