const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/me", authMiddleware, getProfile);

module.exports = router;