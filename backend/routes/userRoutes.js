const express = require("express");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");

const {
  getProfile,
  getUsers,
  getUserProfile,
  getFollowers,
  getFollowing,
  updateProfile,
  toggleFollow,
  getFollowStatus,
} = require("../controllers/userController");

const router = express.Router();

router.get(
  "/me",
  protect,
  getProfile
);

router.get(
  "/",
  protect,
  getUsers
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

router.post(
  "/:userId/follow",
  protect,
  toggleFollow
);

router.get(
  "/:userId/follow-status",
  protect,
  getFollowStatus
);

router.get(
  "/:userId",
  protect,
  getUserProfile
);

router.put(
  "/profile",
  protect,
  async (req, res) => {
    try {
      const {
        name,
        bio,
        profilePhoto,
      } = req.body;

      const user = await User.findById(
        req.user._id
      );

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
        message:
          "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePhoto:
            user.profilePhoto,
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
  }
);

router.post(
  "/profile/photo",
  protect,
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload an image",
        });
      }

      const user = await User.findById(
        req.user._id
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const result = await new Promise(
        (resolve, reject) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "social-media-platform/profile-photos",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          uploadStream.end(req.file.buffer);
        }
      );

      user.profilePhoto =
        result.secure_url;

      await user.save();

      res.status(200).json({
        message:
          "Profile photo uploaded successfully",
        profilePhoto:
          user.profilePhoto,
      });
    } catch (error) {
      console.error(
        "Profile photo upload error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

router.get(
  "/admin-test",
  protect,
  admin,
  (req, res) => {
    res.status(200).json({
      message: "Welcome Admin",
    });
  }
);

module.exports = router;