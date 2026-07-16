const express = require("express");
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
  addComment,
  deleteComment,
  toggleLikeComment,
} = require("../controllers/postController");

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), createPost);
router.get("/", authMiddleware, getPosts);
router.get("/:id", authMiddleware, getPostById);
router.put("/:id", authMiddleware, upload.single("image"), updatePost);
router.delete("/:id", authMiddleware, deletePost);

router.post("/:id/like", authMiddleware, toggleLikePost);

router.post("/:id/comments", authMiddleware, addComment);
router.delete("/:postId/comments/:commentId", authMiddleware, deleteComment);
router.post("/:postId/comments/:commentId/like", authMiddleware, toggleLikeComment);

module.exports = router;
