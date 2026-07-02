const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const {
  getProfile,
  searchUsers,
  updateProfile,
  toggleFollow,
  getUserById,
  getUserPosts,
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, upload.single("avatar"), updateProfile);
router.get("/search", authMiddleware, searchUsers);

router.get("/:id", authMiddleware, getUserById);
router.get("/:id/posts", authMiddleware, getUserPosts);
router.post("/:id/follow", authMiddleware, toggleFollow);

module.exports = router;