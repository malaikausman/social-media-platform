const Like = require("../models/Like");
const Post = require("../models/Post");
const Notification = require("../models/Notification");


const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    
    const existingLike = await Like.findOne({
      user: userId,
      post: postId,
    });

    
    if (existingLike) {
      await Like.deleteOne({
        _id: existingLike._id,
      });

      
      await Notification.deleteOne({
        recipient: post.user,
        sender: userId,
        post: postId,
        type: "like",
      });

      const likeCount = await Like.countDocuments({
        post: postId,
      });

      return res.status(200).json({
        liked: false,
        likeCount,
        message: "Post unliked",
      });
    }

    
    await Like.create({
      user: userId,
      post: postId,
    });

    
    if (
      post.user.toString() !==
      userId.toString()
    ) {
      await Notification.create({
        recipient: post.user,
        sender: userId,
        type: "like",
        post: postId,
      });
    }

    const likeCount = await Like.countDocuments({
      post: postId,
    });

    return res.status(200).json({
      liked: true,
      likeCount,
      message: "Post liked",
    });
  } catch (error) {
    console.error("Toggle like error:", error);

    res.status(500).json({
      message: "Failed to like post",
    });
  }
};


const getLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const likeCount = await Like.countDocuments({
      post: postId,
    });

    const userLike = await Like.findOne({
      post: postId,
      user: userId,
    });

    res.status(200).json({
      likeCount,
      liked: !!userLike,
    });
  } catch (error) {
    console.error("Get likes error:", error);

    res.status(500).json({
      message: "Failed to get likes",
    });
  }
};

module.exports = {
  toggleLike,
  getLikes,
};