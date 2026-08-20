const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
} = require("../controllers/followController");

const router = express.Router();


router.post(
  "/:userId",
  protect,
  toggleFollow
);


router.get(
  "/:userId/status",
  protect,
  getFollowStatus
);


router.get(
  "/:userId/followers",
  protect,
  getFollowers
);


router.get(
  "/:userId/following",
  protect,
  getFollowing
);

module.exports = router;