const Post = require("../models/Post");
const User = require("../models/User");
const { createNotification } = require("../utils/createNotification");

// @desc    Create a new post
// @route   POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { caption, image } = req.body;

    if (!caption && !image) {
      return res.status(400).json({ message: "Post must have a caption or image" });
    }

    const post = await Post.create({
      user: req.user._id,
      caption,
      image,
    });

    const populatedPost = await post.populate("user", "username profilePic");

    res.status(201).json({ post: populatedPost });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feed - posts from users the logged-in user follows + own posts
// @route   GET /api/posts/feed
const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id).select("following");
    const feedUserIds = [...currentUser.following, req.user._id];

    const posts = await Post.find({ user: { $in: feedUserIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic");

    const total = await Post.countDocuments({ user: { $in: feedUserIds } });

    res.status(200).json({
      posts,
      page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts by a specific user (profile page)
// @route   GET /api/posts/user/:userId
const getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");

    res.status(200).json({ posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Like or unlike a post (toggle)
// @route   PUT /api/posts/:id/like
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    if (!alreadyLiked) {
      await createNotification({
        recipient: post.user,
        sender: req.user._id,
        type: "like",
        post: post._id,
      });
    }

    res.status(200).json({
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({ user: req.user._id, text });
    await post.save();

    const populatedPost = await post.populate("comments.user", "username profilePic");
    const newComment = populatedPost.comments[populatedPost.comments.length - 1];

    await createNotification({
      recipient: post.user,
      sender: req.user._id,
      type: "comment",
      post: post._id,
    });

    res.status(201).json({ comment: newComment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post's caption/image (only by owner)
// @route   PUT /api/posts/:id
const updatePost = async (req, res, next) => {
  try {
    const { caption, image } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    if (caption !== undefined) post.caption = caption;
    if (image !== undefined) post.image = image;
    post.edited = true;

    await post.save();
    const populated = await post.populate("user", "username profilePic");

    res.status(200).json({ post: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post (only by owner)
// @route   DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Search posts by caption text
// @route   GET /api/posts/search?q=
const searchPosts = async (req, res, next) => {
  try {
    const query = req.query.q || "";

    if (!query.trim()) {
      return res.status(200).json({ posts: [] });
    }

    const posts = await Post.find({ caption: { $regex: query, $options: "i" } })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("user", "username profilePic");

    res.status(200).json({ posts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getFeed,
  getPost,
  getUserPosts,
  toggleLike,
  addComment,
  updatePost,
  deletePost,
  searchPosts,
};
