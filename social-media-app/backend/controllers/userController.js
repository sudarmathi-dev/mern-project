const User = require("../models/User");
const { createNotification } = require("../utils/createNotification");

// @desc    Get a user's public profile
// @route   GET /api/users/:username
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-refreshToken")
      .populate("followers", "username profilePic")
      .populate("following", "username profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow or unfollow a user (toggle)
// @route   PUT /api/users/:id/follow
const toggleFollow = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(req.user._id);

    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetId
    );

    if (alreadyFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      currentUser.following.push(targetId);
      targetUser.followers.push(req.user._id);
    }

    await currentUser.save();
    await targetUser.save();

    if (!alreadyFollowing) {
      await createNotification({
        recipient: targetUser._id,
        sender: req.user._id,
        type: "follow",
      });
    }

    res.status(200).json({
      following: !alreadyFollowing,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by username
// @route   GET /api/users/search?q=
const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q || "";

    if (!query.trim()) {
      return res.status(200).json({ users: [] });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
      ],
    })
      .select("username fullName profilePic")
      .limit(20);

    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/me
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio, profilePic } = req.body;

    const user = await User.findById(req.user._id);

    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) user.profilePic = profilePic;

    await user.save();

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, toggleFollow, searchUsers, updateProfile };
