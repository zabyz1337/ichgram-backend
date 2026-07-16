const Post = require("../models/Post");

const getExplorePosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      { $match: { placement: "explore" } },
      { $sample: { size: 10 } },
    ]);

    await Post.populate(posts, [
      { path: "author", select: "username fullName avatar" },
      { path: "comments.author", select: "username fullName avatar" },
    ]);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExplorePosts,
};
