const express = require("express");
const { getNotifications, markAllAsRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.put("/read", markAllAsRead);

module.exports = router;
