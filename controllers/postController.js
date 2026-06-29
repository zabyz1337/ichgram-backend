const Post = require("../models/Post");

const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Post text is required",
      });
    }

    const post = await Post.create({
      text,
      image,
      author: req.user._id,
    });

    const populatedPost = await post.populate(
      "author",
      "username fullName avatar"
    );

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username fullName avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
};