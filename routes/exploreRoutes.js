const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getExplorePosts } = require("../controllers/exploreController");

const router = express.Router();

router.get("/", authMiddleware, getExplorePosts);

module.exports = router;