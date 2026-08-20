import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./UserProfile.css";

const UserProfile = () => {
  const { userId } = useParams();
  const { token, user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);

  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const [error, setError] = useState("");

  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const BACKEND_URL =
    "https://social-media-platform-backend-oxp3.onrender.com";

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        const userResponse = await api.get(
          `/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const loadedUser = userResponse.data.user;

        setUser(loadedUser);

        setFollowerCount(
          userResponse.data.followerCount || 0
        );

        setFollowingCount(
          userResponse.data.followingCount || 0
        );

        const followResponse = await api.get(
          `/users/${userId}/follow-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFollowing(
          Boolean(followResponse.data.following)
        );

        setFollowerCount(
          followResponse.data.followerCount || 0
        );

        setFollowingCount(
          followResponse.data.followingCount || 0
        );
      } catch (error) {
        console.error(
          "Load profile error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load user profile"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      loadUser();
    }
  }, [token, userId]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowPhotoModal(false);
      }
    };

    if (showPhotoModal) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showPhotoModal]);

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      setError("");

      const response = await api.post(
        `/users/${userId}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFollowing(
        Boolean(response.data.following)
      );

      setFollowerCount(
        response.data.followerCount || 0
      );

      setFollowingCount(
        response.data.followingCount || 0
      );
    } catch (error) {
      console.error(
        "Follow error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update follow status"
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleProfilePhotoClick = () => {
    setShowPhotoModal(true);
  };

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
  };

  if (loading) {
    return (
      <main className="user-profile-page">
        <div className="profile-status-card">
          <div className="profile-loader"></div>

          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="user-profile-page">
        <div className="profile-status-card">
          <h2>Something went wrong</h2>

          <p>{error}</p>

          <Link
            to="/users"
            className="profile-back-button"
          >
            ← Back to Discover
          </Link>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="user-profile-page">
        <div className="profile-status-card">
          <h2>User not found</h2>

          <Link
            to="/users"
            className="profile-back-button"
          >
            ← Back to Discover
          </Link>
        </div>
      </main>
    );
  }

  const currentUserId = String(
    currentUser?._id ||
      currentUser?.id ||
      ""
  );

  const profileUserId = String(user._id);

  const isOwnProfile =
    currentUserId === profileUserId;

  return (
    <main className="user-profile-page">
      <div className="user-profile-container">

        <div className="profile-navigation">
          <Link
            to="/users"
            className="profile-back-button"
          >
            ← Back to Discover
          </Link>
        </div>

        <section className="user-profile-card">

          {/* PROFILE PHOTO */}

          <div className="profile-photo-wrapper">

            <button
              type="button"
              className="profile-photo-button"
              onClick={handleProfilePhotoClick}
              aria-label="View profile photo"
            >
              {user.profilePhoto ? (
                <img
                  src={`${BACKEND_URL}${user.profilePhoto}`}
                  alt={user.name}
                  className="profile-photo"
                />
              ) : (
                <div className="profile-photo-placeholder">
                  {user.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>
              )}
            </button>

          </div>

          {/* NAME */}

          <h1 className="profile-name">
            {user.name}
          </h1>

          {/* EMAIL */}

          <p className="profile-email">
            {user.email}
          </p>

          {/* BIO */}

          <p className="profile-bio">
            {user.bio || "No bio yet."}
          </p>

          {/* STATS */}

          <div className="profile-stats">

            <Link
              to={`/users/${user._id}/followers`}
              className="profile-stat"
            >
              <strong>
                {followerCount}
              </strong>

              <span>
                Followers
              </span>
            </Link>

            <div className="stat-divider"></div>

            <Link
              to={`/users/${user._id}/following`}
              className="profile-stat"
            >
              <strong>
                {followingCount}
              </strong>

              <span>
                Following
              </span>
            </Link>

          </div>

          {/* FOLLOW BUTTON */}

          {!isOwnProfile && (
            <button
              type="button"
              className={`follow-button ${
                following
                  ? "following"
                  : ""
              }`}
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading
                ? "Please wait..."
                : following
                ? "Following"
                : "Follow"}
            </button>
          )}

          {/* OWN PROFILE LABEL */}

          {isOwnProfile && (
            <Link
              to="/profile"
              className="own-profile-button"
            >
              Edit My Profile
            </Link>
          )}

          {/* ERROR */}

          {error && (
            <p className="profile-error">
              {error}
            </p>
          )}

        </section>
      </div>

      {showPhotoModal && (
        <div
          className="user-profile-photo-modal"
          onClick={handleClosePhotoModal}
          role="dialog"
          aria-modal="true"
          aria-label="Profile photo preview"
        >
          <div
            className="user-profile-photo-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="user-profile-photo-modal-close"
              onClick={handleClosePhotoModal}
              aria-label="Close photo"
            >
              ×
            </button>

            {user.profilePhoto ? (
              <img
                src={`${BACKEND_URL}${user.profilePhoto}`}
                alt={`${user.name}'s enlarged profile`}
                className="user-profile-photo-modal-image"
              />
            ) : (
              <div className="user-profile-photo-modal-placeholder">
                {user.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default UserProfile;