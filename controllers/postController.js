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
    res.status(500).json({ message: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username fullName avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username fullName avatar"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { text, image } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can update only your own posts" });
    }

    if (text !== undefined) post.text = text;
    if (image !== undefined) post.image = image;

    await post.save();

    const updatedPost = await post.populate(
      "author",
      "username fullName avatar"
    );

    res.json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can delete only your own posts" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id.toString();

    const isLiked = post.likes.some(
      (like) => like.toString() === userId
    );

    if (isLiked) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== userId
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    const updatedPost = await post.populate(
      "author",
      "username fullName avatar"
    );

    res.json({
      message: isLiked ? "Post unliked" : "Post liked",
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
};