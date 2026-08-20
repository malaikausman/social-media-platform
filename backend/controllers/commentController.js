const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification");


const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      content: content.trim(),
      user: userId,
      post: postId,
    });

    
    if (post.user.toString() !== userId.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: userId,
        type: "comment",
        post: postId,
      });
    }

    const populatedComment = await Comment.findById(
      comment._id
    ).populate("user", "name email");

    res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    res.status(500).json({
      message: "Failed to create comment",
    });
  }
};


const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      message: "Failed to get comments",
    });
  }
};


const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const comment = await Comment.findById(
      req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (
      comment.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You can only edit your own comments",
      });
    }

    comment.content = content.trim();

    await comment.save();

    const updatedComment =
      await Comment.findById(comment._id).populate(
        "user",
        "name email"
      );

    res.status(200).json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);

    res.status(500).json({
      message: "Failed to update comment",
    });
  }
};


const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(
      req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (
      comment.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    res.status(500).json({
      message: "Failed to delete comment",
    });
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};