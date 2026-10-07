const express = require("express");
const {
  createPost,
  getFeed,
  getPost,
  getUserPosts,
  toggleLike,
  addComment,
  updatePost,
  deletePost,
  searchPosts,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // all post routes require login

router.post("/", createPost);
router.get("/feed", getFeed);
router.get("/search", searchPosts);
router.get("/user/:userId", getUserPosts);
router.get("/:id", getPost);
router.put("/:id/like", toggleLike);
router.post("/:id/comments", addComment);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

module.exports = router;
