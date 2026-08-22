import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Followers.css";

const Followers = () => {
  const { userId } = useParams();
  const { token, user: currentUser } = useAuth();

  const [followers, setFollowers] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [followLoading, setFollowLoading] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const currentUserId = String(
    currentUser?._id ||
      currentUser?.id ||
      ""
  );

  const isOwnProfile =
    currentUserId === String(userId);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/users/${userId}/followers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const rawFollowers =
          response.data.followers || [];

        const loadedFollowers = rawFollowers
          .map((item) => item.follower || item)
          .filter(
            (person) => person && person._id
          );

        setFollowers(loadedFollowers);

        const statusData = {};

        await Promise.all(
          loadedFollowers.map(async (person) => {
            try {
              const statusResponse =
                await api.get(
                  `/users/${person._id}/follow-status`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

              statusData[String(person._id)] =
                Boolean(
                  statusResponse.data.following
                );
            } catch (error) {
              console.error(
                `Follow status error for ${person._id}:`,
                error
              );

              statusData[String(person._id)] = false;
            }
          })
        );

        setFollowStatus(statusData);
      } catch (error) {
        console.error(
          "Fetch followers error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load followers"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchFollowers();
    } else {
      setLoading(false);
    }
  }, [token, userId]);

  const handleFollowToggle = async (personId) => {
    if (followLoading[personId]) return;

    try {
      setFollowLoading((prev) => ({
        ...prev,
        [personId]: true,
      }));

      setError("");

      const response = await api.post(
        `/users/${personId}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newStatus = Boolean(
        response.data.following
      );

      setFollowStatus((prev) => ({
        ...prev,
        [personId]: newStatus,
      }));
    } catch (error) {
      console.error(
        "Follow toggle error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update follow status"
      );
    } finally {
      setFollowLoading((prev) => ({
        ...prev,
        [personId]: false,
      }));
    }
  };

  if (loading) {
    return (
      <main className="followers-page">
        <div className="followers-status-card">
          <div className="followers-loader"></div>

          <p>Loading followers...</p>
        </div>
      </main>
    );
  }

  if (error && followers.length === 0) {
    return (
      <main className="followers-page">
        <div className="followers-status-card">
          <h2>Something went wrong</h2>

          <p>{error}</p>

          <Link
            to={
              isOwnProfile
                ? "/profile"
                : `/users/${userId}`
            }
            className="followers-back"
          >
            ← Back to Profile
          </Link>

          {!isOwnProfile && (
            <Link
              to="/users"
              className="followers-back"
            >
              ← Back to Discover
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="followers-page">
      <div className="followers-container">

        <div className="followers-header">

          <div className="followers-navigation">

            <Link
              to={
                isOwnProfile
                  ? "/profile"
                  : `/users/${userId}`
              }
              className="followers-back"
            >
              ← Back to Profile
            </Link>

            {!isOwnProfile && (
              <Link
                to="/users"
                className="followers-back"
              >
                ← Back to Discover
              </Link>
            )}

          </div>

          <h1>Followers</h1>

          <p>
            {followers.length}{" "}
            {followers.length === 1
              ? "person follows"
              : "people follow"}{" "}
            this profile
          </p>

        </div>

        {followers.length === 0 ? (
          <div className="empty-followers">

            <div className="empty-icon">
              ◎
            </div>

            <h2>No followers yet</h2>

            <p>
              When people follow this profile,
              they will appear here.
            </p>

          </div>
        ) : (
          <div className="followers-list">

            {followers.map((person) => {
              const personId =
                String(person._id);

              const isFollowing =
                Boolean(
                  followStatus[personId]
                );

              const isLoading =
                Boolean(
                  followLoading[personId]
                );

              return (
                <article
                  key={personId}
                  className="follower-card"
                >

                  <Link
                    to={`/users/${personId}`}
                    className="follower-info"
                  >

                    {person.profilePhoto ? (
                      <img
                        src={person.profilePhoto}
                        alt={person.name}
                        className="follower-avatar"
                      />
                    ) : (
                      <div className="follower-avatar-placeholder">
                        {person.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "U"}
                      </div>
                    )}

                    <div className="follower-details">

                      <strong>
                        {person.name ||
                          "Unknown User"}
                      </strong>

                      <span>
                        {person.email || ""}
                      </span>

                    </div>

                  </Link>

                  <button
                    type="button"
                    className={`follower-button ${
                      isFollowing
                        ? "is-following"
                        : ""
                    }`}
                    onClick={() =>
                      handleFollowToggle(
                        personId
                      )
                    }
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Please wait..."
                      : isFollowing
                      ? "Following"
                      : "Follow"}
                  </button>

                </article>
              );
            })}

          </div>
        )}

        {error && followers.length > 0 && (
          <p className="followers-error">
            {error}
          </p>
        )}

      </div>
    </main>
  );
};

export default Followers;