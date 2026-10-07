const express = require("express");
const {
  getUserProfile,
  toggleFollow,
  searchUsers,
  updateProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // all user routes require login

router.get("/search", searchUsers);
router.put("/me", updateProfile);
router.put("/:id/follow", toggleFollow);
router.get("/:username", getUserProfile);

module.exports = router;
