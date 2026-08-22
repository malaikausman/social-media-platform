const express = require("express");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createPost,
  getPosts,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");

const router = express.Router();

router.get(
  "/feed",
  protect,
  getFeed
);

router.get(
  "/",
  protect,
  getPosts
);

router.get(
  "/:id",
  protect,
  getPostById
);

router.post(
  "/",
  protect,
  upload.single("image"),
  createPost
);

router.put(
  "/:id",
  protect,
  updatePost
);

router.delete(
  "/:id",
  protect,
  deletePost
);

module.exports = router;