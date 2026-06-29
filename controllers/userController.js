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
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, username, bio, avatar } = req.body;

    if (username) {
      const existingUser = await User.findOne({ username });

      if (
        existingUser &&
        existingUser._id.toString() !== req.user._id.toString()
      ) {
        return res.status(400).json({
          message: "Username already exists",
        });
      }
    }

    const user = await User.findById(req.user._id);

    if (fullName !== undefined) user.fullName = fullName;
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  searchUsers,
  updateProfile,
};