const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createPost,
  getPosts,
} = require("../controllers/postController");

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/", authMiddleware, getPosts);

module.exports = router;