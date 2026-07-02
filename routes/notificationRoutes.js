const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  getNotifications,
  markNotificationsAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/read", authMiddleware, markNotificationsAsRead);

module.exports = router;