const User = require("../models/User");
const Post = require("../models/Post");

const Notification = require("../models/Notification");

const fileToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

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
    const { fullName, username, bio } = req.body;

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
    if (req.file) user.avatar = fileToBase64(req.file);

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

const toggleFollow = async (req, res) => {
  try {
    const userToFollowId = req.params.id;
    const currentUserId = req.user._id.toString();

    if (userToFollowId === currentUserId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const userToFollow = await User.findById(userToFollowId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === userToFollowId,
    );

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userToFollowId,
      );

      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== currentUserId,
      );
    } else {
      currentUser.following.push(userToFollowId);
      userToFollow.followers.push(currentUserId);

      await Notification.create({
        recipient: userToFollowId,
        sender: currentUserId,
        type: "follow",
      });
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      message: isFollowing ? "User unfollowed" : "User followed",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username fullName avatar")
      .populate("following", "username fullName avatar");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .populate("author", "username fullName avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  searchUsers,
  updateProfile,
  toggleFollow,
  getUserById,
  getUserPosts,
};
