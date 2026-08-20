const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  toggleLike,
  getLikes,
} = require("../controllers/likeController");

const router = express.Router();


router.post("/:postId", protect, toggleLike);


router.get("/:postId", protect, getLikes);

module.exports = router;