const Follow = require("../models/Follow");
const User = require("../models/User");
const Notification = require("../models/Notification");



const toggleFollow = async (req, res) => {
  try {
    const followerId = req.user._id;
    const followingId = req.params.userId;

    if (followerId.toString() === followingId.toString()) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const targetUser = await User.findById(followingId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    

    if (existingFollow) {
      await Follow.deleteOne({
        _id: existingFollow._id,
      });

      await Notification.deleteOne({
        recipient: followingId,
        sender: followerId,
        type: "follow",
      });

      const followerCount = await Follow.countDocuments({
        following: followingId,
      });

      const followingCount = await Follow.countDocuments({
        follower: followerId,
      });

      return res.status(200).json({
        message: "User unfollowed successfully",
        following: false,
        followerCount,
        followingCount,
      });
    }

    

    await Follow.create({
      follower: followerId,
      following: followingId,
    });

    await Notification.create({
      recipient: followingId,
      sender: followerId,
      type: "follow",
    });

    const followerCount = await Follow.countDocuments({
      following: followingId,
    });

    const followingCount = await Follow.countDocuments({
      follower: followerId,
    });

    return res.status(201).json({
      message: "User followed successfully",
      following: true,
      followerCount,
      followingCount,
    });
  } catch (error) {
    console.error("FOLLOW ERROR:", error);

    return res.status(500).json({
      message: "Failed to follow/unfollow user",
      error: error.message,
    });
  }
};



const getFollowStatus = async (req, res) => {
  try {
    const followerId = req.user._id;
    const followingId = req.params.userId;

    const targetUser = await User.findById(followingId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    const followerCount = await Follow.countDocuments({
      following: followingId,
    });

    const followingCount = await Follow.countDocuments({
      follower: followingId,
    });

    return res.status(200).json({
      following: Boolean(follow),
      followerCount,
      followingCount,
    });
  } catch (error) {
    console.error("FOLLOW STATUS ERROR:", error);

    return res.status(500).json({
      message: "Failed to get follow status",
      error: error.message,
    });
  }
};



const getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const follows = await Follow.find({
      following: userId,
    })
      .populate(
        "follower",
        "name email profilePhoto bio"
      )
      .lean();

    const followers = follows
      .map((follow) => follow.follower)
      .filter(Boolean);

    return res.status(200).json({
      followers,
    });
  } catch (error) {
    console.error("GET FOLLOWERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to get followers",
      error: error.message,
    });
  }
};



const getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const follows = await Follow.find({
      follower: userId,
    })
      .populate(
        "following",
        "name email profilePhoto bio"
      )
      .lean();

    const following = follows
      .map((follow) => follow.following)
      .filter(Boolean);

    return res.status(200).json({
      following,
    });
  } catch (error) {
    console.error("GET FOLLOWING ERROR:", error);

    return res.status(500).json({
      message: "Failed to get following",
      error: error.message,
    });
  }
};

module.exports = {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
};