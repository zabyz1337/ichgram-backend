const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
} = require("../controllers/postController");

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/", authMiddleware, getPosts);
router.get("/:id", authMiddleware, getPostById);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/like", authMiddleware, toggleLikePost);

module.exports = router;