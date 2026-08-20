const User = require("../models/User");
const Follow = require("../models/Follow");
const Notification = require("../models/Notification");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const followerCount = await Follow.countDocuments({
      following: user._id,
    });

    const followingCount = await Follow.countDocuments({
      follower: user._id,
    });

    res.status(200).json({
      user,
      followerCount,
      followingCount,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
    })
      .select("name email profilePhoto bio")
      .sort({ name: 1 });

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Failed to get users",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const followerCount = await Follow.countDocuments({
      following: user._id,
    });

    const followingCount = await Follow.countDocuments({
      follower: user._id,
    });

    res.status(200).json({
      user,
      followerCount,
      followingCount,
    });
  } catch (error) {
    console.error(
      "Get user profile error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getFollowers = async (req, res) => {
  try {
    const targetUser = await User.findById(
      req.params.userId
    );

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const followRecords = await Follow.find({
      following: req.params.userId,
    }).populate(
      "follower",
      "name email profilePhoto bio"
    );

    const followers = followRecords
      .map((record) => record.follower)
      .filter((person) => person !== null);

    res.status(200).json({
      followers,
    });
  } catch (error) {
    console.error(
      "Get followers error:",
      error
    );

    res.status(500).json({
      message: "Failed to get followers",
    });
  }
};

const getFollowing = async (req, res) => {
  try {
    const targetUser = await User.findById(
      req.params.userId
    );

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const followRecords = await Follow.find({
      follower: req.params.userId,
    }).populate(
      "following",
      "name email profilePhoto bio"
    );

    const following = followRecords
      .map((record) => record.following)
      .filter((person) => person !== null);

    res.status(200).json({
      following,
    });
  } catch (error) {
    console.error(
      "Get following error:",
      error
    );

    res.status(500).json({
      message: "Failed to get following",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePhoto } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (profilePhoto !== undefined) {
      user.profilePhoto = profilePhoto;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

const toggleFollow = async (req, res) => {
  try {
    const followerId = req.user._id;
    const followingId = req.params.userId;

    if (
      followerId.toString() ===
      followingId.toString()
    ) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const targetUser = await User.findById(
      followingId
    );

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

      
      const followerCount =
        await Follow.countDocuments({
          following: followingId,
        });

      
      const followingCount =
        await Follow.countDocuments({
          follower: followingId,
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

    
    const followerCount =
      await Follow.countDocuments({
        following: followingId,
      });

    
    const followingCount =
      await Follow.countDocuments({
        follower: followingId,
      });

    return res.status(200).json({
      message: "User followed successfully",
      following: true,
      followerCount,
      followingCount,
    });
  } catch (error) {
    console.error(
      "Toggle follow error:",
      error
    );

    return res.status(500).json({
      message: "Failed to follow/unfollow user",
      error: error.message,
    });
  }
};

const getFollowStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    const targetUser = await User.findById(
      targetUserId
    );

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: targetUserId,
    });

    const followerCount =
      await Follow.countDocuments({
        following: targetUserId,
      });

    const followingCount =
      await Follow.countDocuments({
        follower: targetUserId,
      });

    return res.status(200).json({
      following: Boolean(existingFollow),
      followerCount,
      followingCount,
    });
  } catch (error) {
    console.error(
      "Get follow status error:",
      error
    );

    return res.status(500).json({
      message: "Failed to get follow status",
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  getUsers,
  getUserProfile,
  getFollowers,
  getFollowing,
  updateProfile,
  toggleFollow,
  getFollowStatus,
};