const Story = require("../models/Story");
const User = require("../models/User");

// @desc    Create a new story
// @route   POST /api/stories
const createStory = async (req, res, next) => {
  try {
    const { image, caption } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Story requires an image" });
    }

    const story = await Story.create({ user: req.user._id, image, caption });
    const populated = await story.populate("user", "username profilePic");

    res.status(201).json({ story: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active stories from people the user follows + own stories, grouped by user
// @route   GET /api/stories
const getStoriesFeed = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id).select("following");
    const userIds = [...currentUser.following, req.user._id];

    const stories = await Story.find({ user: { $in: userIds } })
      .sort({ createdAt: 1 })
      .populate("user", "username profilePic");

    // Group stories by user for a stories-bar UI
    const grouped = {};
    for (const story of stories) {
      const uid = story.user._id.toString();
      if (!grouped[uid]) {
        grouped[uid] = { user: story.user, stories: [] };
      }
      grouped[uid].stories.push(story);
    }

    res.status(200).json({ storyGroups: Object.values(grouped) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific user's active stories
// @route   GET /api/stories/user/:userId
const getUserStories = async (req, res, next) => {
  try {
    const stories = await Story.find({ user: req.params.userId })
      .sort({ createdAt: 1 })
      .populate("user", "username profilePic")
      .populate("viewers", "username profilePic");

    res.status(200).json({ stories });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a story as viewed by the logged-in user
// @route   PUT /api/stories/:id/view
const viewStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Story not found (may have expired)" });
    }

    const alreadyViewed = story.viewers.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!alreadyViewed) {
      story.viewers.push(req.user._id);
      await story.save();
    }

    res.status(200).json({ message: "Story marked as viewed" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own story
// @route   DELETE /api/stories/:id
const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await story.deleteOne();
    res.status(200).json({ message: "Story deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createStory, getStoriesFeed, getUserStories, viewStory, deleteStory };
