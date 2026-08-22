const Post = require("../models/Post");
const Follow = require("../models/Follow");

const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    let image = "";

    if (req.file) {
      image = `https://social-media-platform-backend-oxp3.onrender.com/uploads/${req.file.filename}`;
    }

    const post = await Post.create({
      user: req.user._id,
      content: content.trim(),
      image,
    });

    const populatedPost = await Post.findById(
      post._id
    ).populate(
      "user",
      "name profilePhoto"
    );

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate(
        "user",
        "name profilePhoto"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const follows = await Follow.find({
      follower: currentUserId,
    }).select("following");

    const followingIds = follows.map(
      (follow) => follow.following
    );

    followingIds.push(currentUserId);

    const posts = await Post.find({
      user: { $in: followingIds },
    })
      .populate(
        "user",
        "name profilePhoto"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error("Get feed error:", error);
    res.status(500).json({
      message: "Failed to load feed",
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    ).populate(
      "user",
      "name profilePhoto"
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json({
      post,
    });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { content } = req.body;

    const post = await Post.findById(
      req.params.id
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (
      post.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only edit your own posts",
      });
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({
          message:
            "Post content cannot be empty",
        });
      }

      post.content = content.trim();
    }

    await post.save();

    const updatedPost =
      await Post.findById(post._id).populate(
        "user",
        "name profilePhoto"
      );

    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error(
      "Update post error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (
      post.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only delete your own posts",
      });
    }

    await post.deleteOne();

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete post error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
};