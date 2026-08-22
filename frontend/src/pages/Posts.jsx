import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Posts.css";

const Posts = () => {
  const { token, user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const [comments, setComments] = useState({});
  const [commentContent, setCommentContent] = useState({});
  const [likes, setLikes] = useState({});

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [creatingPost, setCreatingPost] = useState(false);

  const BACKEND_URL =
    "https://social-media-platform-backend-oxp3.onrender.com";

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    return `${BACKEND_URL}${
      imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;
  };

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  useEffect(() => {
    const fetchPostsAndData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/posts/feed", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const loadedPosts = response.data.posts || [];

        setPosts(loadedPosts);

        const commentsData = {};
        const likesData = {};

        await Promise.all(
          loadedPosts.map(async (post) => {
            try {
              const commentResponse = await api.get(
                `/comments/${post._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              commentsData[post._id] =
                commentResponse.data.comments || [];
            } catch (error) {
              console.error(
                `Comments error for post ${post._id}:`,
                error
              );

              commentsData[post._id] = [];
            }

            try {
              const likeResponse = await api.get(
                `/likes/${post._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              likesData[post._id] = {
                liked: likeResponse.data.liked,
                likeCount:
                  likeResponse.data.likeCount || 0,
              };
            } catch (error) {
              console.error(
                `Likes error for post ${post._id}:`,
                error
              );

              likesData[post._id] = {
                liked: false,
                likeCount: 0,
              };
            }
          })
        );

        setComments(commentsData);
        setLikes(likesData);
      } catch (error) {
        console.error("Feed loading error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load social feed."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPostsAndData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!content.trim() && !selectedImage) {
      setError(
        "Please write something or select an image."
      );
      return;
    }

    try {
      setCreatingPost(true);
      setError("");

      const formData = new FormData();

      formData.append("content", content.trim());

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await api.post(
        "/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newPost = response.data.post;

      setPosts((prevPosts) => [
        newPost,
        ...prevPosts,
      ]);

      setComments((prev) => ({
        ...prev,
        [newPost._id]: [],
      }));

      setLikes((prev) => ({
        ...prev,
        [newPost._id]: {
          liked: false,
          likeCount: 0,
        },
      }));

      setContent("");
      setSelectedImage(null);

      const fileInput =
        document.getElementById("post-image");

      if (fileInput) {
        fileInput.value = "";
      }

      showMessage("Post created successfully!");
    } catch (error) {
      console.error("Create post error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create post."
      );
    } finally {
      setCreatingPost(false);
    }
  };

  const handleEdit = (post) => {
    setEditingId(post._id);
    setEditContent(post.content || "");

    setMessage("");
    setError("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditContent("");
    setError("");
  };

  const handleUpdate = async (postId) => {
    if (!editContent.trim()) {
      setError("Post content cannot be empty.");
      return;
    }

    try {
      setError("");

      const response = await api.put(
        `/posts/${postId}`,
        {
          content: editContent.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedPost = response.data.post;

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                ...updatedPost,
                image:
                  updatedPost.image !== undefined
                    ? updatedPost.image
                    : post.image,
              }
            : post
        )
      );

      setEditingId(null);
      setEditContent("");

      showMessage("Post updated successfully!");
    } catch (error) {
      console.error("Update post error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update post."
      );
    }
  };

  const handleDelete = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts((prevPosts) =>
        prevPosts.filter(
          (post) => post._id !== postId
        )
      );

      setComments((prev) => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });

      setLikes((prev) => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });

      setError("");

      showMessage("Post deleted successfully!");
    } catch (error) {
      console.error("Delete post error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to delete post."
      );
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await api.post(
        `/likes/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLikes((prev) => ({
        ...prev,
        [postId]: {
          liked: response.data.liked,
          likeCount:
            response.data.likeCount || 0,
        },
      }));

      setError("");

      showMessage(
        response.data.liked
          ? "Post liked!"
          : "Post unliked!"
      );
    } catch (error) {
      console.error("Like error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to like post."
      );
    }
  };

  const handleCommentChange = (
    postId,
    value
  ) => {
    setCommentContent((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleCreateComment = async (postId) => {
    const newComment =
      commentContent[postId]?.trim();

    if (!newComment) {
      return;
    }

    try {
      const response = await api.post(
        `/comments/${postId}`,
        {
          content: newComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments((prev) => ({
        ...prev,
        [postId]: [
          response.data.comment,
          ...(prev[postId] || []),
        ],
      }));

      setCommentContent((prev) => ({
        ...prev,
        [postId]: "",
      }));

      setError("");

      showMessage("Comment added successfully!");
    } catch (error) {
      console.error("Comment error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to add comment."
      );
    }
  };

  const handleDeleteComment = async (
    commentId,
    postId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(
          (comment) => comment._id !== commentId
        ),
      }));

      setError("");

      showMessage("Comment deleted successfully!");
    } catch (error) {
      console.error(
        "Delete comment error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete comment."
      );
    }
  };

  if (loading) {
    return (
      <main className="posts-page">
        <div className="posts-container">
          <div className="posts-loading">
            <div className="posts-spinner"></div>

            <h2>Loading Social Feed...</h2>

            <p>
              Please wait while we load your posts.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="posts-page">
      <div className="posts-container">

        <div className="posts-topbar">
          <Link
            to="/"
            className="back-home-button"
          >
            ← Back to Home
          </Link>
        </div>

        <header className="posts-header">
          <h1 className="posts-title">
            Social Feed
          </h1>

          <p className="posts-subtitle">
            Share something with your community ✨
          </p>
        </header>

        {message && (
          <div className="toast-message">
            {message}
          </div>
        )}

        {error && (
          <div className="toast-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreatePost}
          className="create-post-card"
        >
          <div className="create-post-header">
            <div>
              <h2>Create a Post</h2>

              <p>
                Share your thoughts or a photo.
              </p>
            </div>
          </div>

          <textarea
            className="create-post-input"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
            rows="4"
          />

          <div className="create-post-toolbar">
            <div className="image-upload-wrapper">

              <input
                id="post-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file =
                    e.target.files[0] || null;

                  setSelectedImage(file);
                  setError("");
                }}
              />

              <label
                htmlFor="post-image"
                className="image-upload-label"
              >
                📷 Add Image
              </label>

              {selectedImage && (
                <span className="selected-image-name">
                  {selectedImage.name}
                </span>
              )}

            </div>

            <button
              type="submit"
              className="create-post-button"
              disabled={creatingPost}
            >
              {creatingPost
                ? "Posting..."
                : "Create Post"}
            </button>

          </div>

          {selectedImage && (
            <div className="image-preview-wrapper">

              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected preview"
                className="post-image-preview"
              />

              <button
                type="button"
                className="remove-image-button"
                onClick={() => {
                  setSelectedImage(null);

                  const fileInput =
                    document.getElementById(
                      "post-image"
                    );

                  if (fileInput) {
                    fileInput.value = "";
                  }
                }}
              >
                Remove Image
              </button>

            </div>
          )}

        </form>

        {posts.length === 0 ? (
          <div className="empty-posts">

            <div className="empty-posts-icon">
              ✨
            </div>

            <h2>No posts yet</h2>

            <p>
              Be the first to share something
              with your community!
            </p>

          </div>
        ) : (
          posts.map((post) => {

            const postUserId =
              post.user?._id?.toString() ||
              post.user?.toString();

            const currentUserId =
              user?._id?.toString() ||
              user?.id?.toString();

            const isOwner =
              postUserId === currentUserId;

            const postLike =
              likes[post._id] || {
                liked: false,
                likeCount: 0,
              };

            const userName =
              post.user?.name?.trim() || "User";

            const initials = userName
              .split(/\s+/)
              .filter(Boolean)
              .map((word) =>
                word.charAt(0).toUpperCase()
              )
              .slice(0, 2)
              .join("");

            const profilePhoto = getImageUrl(
              post.user?.profilePhoto
            );

            const postImage = getImageUrl(
              post.image
            );

            return (
              <article
                key={post._id}
                className="post-card"
              >

                <div className="post-user">

                  <div className="post-user-avatar">

                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt={`${userName} profile`}
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <span>
                        {initials}
                      </span>
                    )}

                  </div>

                  {postUserId ? (
                    <Link
                      to={`/users/${postUserId}`}
                      className="post-user-name"
                    >
                      {userName}
                    </Link>
                  ) : (
                    <span className="post-user-name">
                      {userName}
                    </span>
                  )}

                </div>

                {editingId === post._id ? (
                  <div className="edit-area">

                    {postImage && (
                      <div className="edit-image-wrapper">

                        <img
                          src={postImage}
                          alt="Current post"
                          className="post-image"
                        />

                        <p className="edit-image-note">
                          Current image will be kept.
                        </p>

                      </div>
                    )}

                    <textarea
                      value={editContent}
                      onChange={(e) =>
                        setEditContent(
                          e.target.value
                        )
                      }
                      rows="4"
                      placeholder="Edit your post..."
                    />

                    <div className="edit-actions">

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate(
                            post._id
                          )
                        }
                      >
                        Save Changes
                      </button>

                      <button
                        type="button"
                        onClick={handleCancel}
                        className="cancel-button"
                      >
                        Cancel
                      </button>

                    </div>

                  </div>
                ) : (
                  <>
                    {post.content && (
                      <p className="post-content">
                        {post.content}
                      </p>
                    )}

                    {postImage && (
                      <div className="post-image-wrapper">

                        <img
                          src={postImage}
                          alt="Post"
                          className="post-image"
                        />

                      </div>
                    )}

                    {isOwner && (
                      <div className="post-actions">

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleEdit(post)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              post._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>
                    )}

                  </>
                )}

                <div className="post-meta">
                  {post.createdAt
                    ? new Date(
                        post.createdAt
                      ).toLocaleString()
                    : ""}
                </div>

                <div className="post-interaction-section">

                  <div className="like-row">

                    <button
                      type="button"
                      className={
                        postLike.liked
                          ? "like-button liked"
                          : "like-button"
                      }
                      onClick={() =>
                        handleLike(
                          post._id
                        )
                      }
                    >
                      {postLike.liked
                        ? "♥️ Liked"
                        : "♡ Like"}
                    </button>

                    <span className="like-count">
                      {postLike.likeCount}{" "}
                      {postLike.likeCount === 1
                        ? "like"
                        : "likes"}
                    </span>

                  </div>

                </div>

                <section className="comments-section">

                  <div className="comments-header">

                    <h3>
                      Comments
                    </h3>

                    <span>
                      {comments[post._id]
                        ?.length || 0}
                    </span>

                  </div>

                  {comments[post._id]?.length > 0 ? (
                    <div className="comments-list">

                      {comments[post._id].map(
                        (comment) => {

                          const commentUserId =
                            comment.user?._id?.toString() ||
                            comment.user?.toString();

                          const currentUserId =
                            user?._id?.toString() ||
                            user?.id?.toString();

                          const isCommentOwner =
                            commentUserId ===
                            currentUserId;

                          return (
                            <div
                              key={comment._id}
                              className="comment-item"
                            >

                              <div className="comment-header-row">

                                <strong className="comment-user">
                                  {comment.user?.name ||
                                    "User"}
                                </strong>

                                {isCommentOwner && (
                                  <button
                                    type="button"
                                    className="comment-delete-button"
                                    onClick={() =>
                                      handleDeleteComment(
                                        comment._id,
                                        post._id
                                      )
                                    }
                                  >
                                    Delete
                                  </button>
                                )}

                              </div>

                              <p className="comment-text">
                                {comment.content}
                              </p>

                            </div>
                          );
                        }
                      )}

                    </div>
                  ) : (
                    <p className="no-comments">
                      No comments yet. Be the first!
                    </p>
                  )}

                  <div className="comment-form">

                    <textarea
                      className="comment-input"
                      placeholder="Write a comment..."
                      value={
                        commentContent[
                          post._id
                        ] || ""
                      }
                      onChange={(e) =>
                        handleCommentChange(
                          post._id,
                          e.target.value
                        )
                      }
                      rows="2"
                    />

                    <button
                      type="button"
                      className="comment-button"
                      onClick={() =>
                        handleCreateComment(
                          post._id
                        )
                      }
                    >
                      Add Comment
                    </button>

                  </div>

                </section>

              </article>
            );
          })
        )}

      </div>
    </main>
  );
};

export default Posts;