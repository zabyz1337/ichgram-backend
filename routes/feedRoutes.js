const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getFeed } = require("../controllers/feedController");

const router = express.Router();

router.get("/", authMiddleware, getFeed);

module.exports = router;