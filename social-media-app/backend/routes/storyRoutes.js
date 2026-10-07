const express = require("express");
const {
  createStory,
  getStoriesFeed,
  getUserStories,
  viewStory,
  deleteStory,
} = require("../controllers/storyController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", createStory);
router.get("/", getStoriesFeed);
router.get("/user/:userId", getUserStories);
router.put("/:id/view", viewStory);
router.delete("/:id", deleteStory);

module.exports = router;
