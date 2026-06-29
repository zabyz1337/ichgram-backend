const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  getProfile,
  searchUsers,
  updateProfile,
  toggleFollow,
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);
router.get("/search", authMiddleware, searchUsers);
router.post("/:id/follow", authMiddleware, toggleFollow);

module.exports = router;