import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Following.css";

const Following = () => {
  const { userId } = useParams();
  const { token, user: currentUser } = useAuth();

  const [following, setFollowing] = useState([]);
  const [followLoading, setFollowLoading] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const BACKEND_URL =
    "https://social-media-platform-backend-oxp3.onrender.com";

  const currentUserId = String(
    currentUser?._id ||
      currentUser?.id ||
      ""
  );

  const isOwnProfile =
    currentUserId === String(userId);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/users/${userId}/following`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFollowing(
          response.data.following || []
        );
      } catch (error) {
        console.error(
          "Fetch following error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load following"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchFollowing();
    } else {
      setLoading(false);
    }
  }, [token, userId]);

  const handleUnfollow = async (personId) => {
    if (followLoading[personId]) return;

    try {
      setFollowLoading((prev) => ({
        ...prev,
        [personId]: true,
      }));

      setError("");

      await api.post(
        `/users/${personId}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFollowing((prev) =>
        prev.filter(
          (person) =>
            String(person._id) !==
            String(personId)
        )
      );
    } catch (error) {
      console.error(
        "Unfollow error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to unfollow user"
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
      <main className="following-page">
        <div className="following-container">
          <div className="following-state">

            <div className="loading-spinner"></div>

            <p>Loading following...</p>

          </div>
        </div>
      </main>
    );
  }

  if (error && following.length === 0) {
    return (
      <main className="following-page">
        <div className="following-container">

          <div className="following-state error-state">

            <span>!</span>

            <p>{error}</p>

            <Link
              to={
                isOwnProfile
                  ? "/profile"
                  : `/users/${userId}`
              }
              className="back-link"
            >
              ← Back to Profile
            </Link>

            {!isOwnProfile && (
              <Link
                to="/users"
                className="back-link"
              >
                ← Back to Discover
              </Link>
            )}

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="following-page">
      <div className="following-container">

        <div className="following-header">

          <div className="following-navigation">

            <Link
              to={
                isOwnProfile
                  ? "/profile"
                  : `/users/${userId}`
              }
              className="back-link"
            >
              ← Back to Profile
            </Link>

            {!isOwnProfile && (
              <Link
                to="/users"
                className="back-link"
              >
                ← Back to Discover
              </Link>
            )}

          </div>

          <h1>Following</h1>

          <p>
            People this user follows
          </p>

        </div>

        {following.length === 0 ? (
          <div className="empty-following">

            <div className="empty-icon">
              ○
            </div>

            <h3>
              Not following anyone
            </h3>

            <p>
              This user hasn't followed anyone yet.
            </p>

          </div>
        ) : (
          <div className="following-list">

            {following.map((person) => {
              const personId =
                String(person._id);

              const isLoading =
                Boolean(
                  followLoading[personId]
                );

              return (
                <article
                  key={personId}
                  className="following-card"
                >

                  <div className="following-person">

                    <Link
                      to={`/users/${personId}`}
                      className="following-info"
                    >

                      {person.profilePhoto ? (
                        <img
                          src={`${BACKEND_URL}${person.profilePhoto}`}
                          alt={person.name}
                          className="following-avatar"
                        />
                      ) : (
                        <div className="following-avatar placeholder-avatar">
                          {person.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "U"}
                        </div>
                      )}

                      <div className="following-details">

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
                      className="unfollow-button"
                      onClick={() =>
                        handleUnfollow(
                          personId
                        )
                      }
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Updating..."
                        : "Following"}
                    </button>

                  </div>

                </article>
              );
            })}

          </div>
        )}

        {error && following.length > 0 && (
          <p className="following-error">
            {error}
          </p>
        )}

      </div>
    </main>
  );
};

export default Following;