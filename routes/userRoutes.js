const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  getProfile,
  searchUsers,
  updateProfile,
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);
router.get("/search", authMiddleware, searchUsers);

module.exports = router;