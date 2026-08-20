import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Notifications.css";

const Notifications = () => {
  const { token } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(response.data.notifications || []);
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await api.put(
        "/notifications/read",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setMessage("Notifications marked as read");
      setError("");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to mark notifications as read"
      );

      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <main className="notifications-page">
      <div className="notifications-container">

        {/* Toast Notifications */}

        {message && (
          <div className="notification-toast success-toast">
            {message}
          </div>
        )}

        {error && (
          <div className="notification-toast error-toast">
            {error}
          </div>
        )}

        {/* Header */}

        <div className="notifications-header">
          <div>
            <Link
              to="/"
              className="notifications-back"
            >
              ← Back to home
            </Link>

            <h1>Notifications</h1>

            <p>
              Stay updated with activity on your account.
            </p>
          </div>

          {!loading && notifications.length > 0 && (
            <button
              className="mark-read-button"
              onClick={markAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications */}

        <section className="notifications-list">
          {loading ? (
            <div className="empty-notifications">
              <div className="notifications-spinner"></div>

              <h3>Loading notifications...</h3>

              <p>
                Please wait while we load your latest
                activity.
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-notifications">
              <div className="empty-notification-icon">
                🔔
              </div>

              <h3>No notifications</h3>

              <p>
                You're all caught up. New activity will
                appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <article
                key={notification._id}
                className={`notification-card ${
                  notification.read
                    ? "notification-read"
                    : "notification-unread"
                }`}
              >
                <div className="notification-avatar">
                  {notification.sender?.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div className="notification-content">
                  <p className="notification-text">
                    <strong>
                      {notification.sender?.name ||
                        "Someone"}
                    </strong>{" "}

                    {notification.type === "like" &&
                      "liked your post."}

                    {notification.type === "comment" &&
                      "commented on your post."}

                    {notification.type === "follow" &&
                      "followed you."}
                  </p>

                  {notification.post?.content && (
                    <div className="notification-post">
                      "{notification.post.content}"
                    </div>
                  )}

                  <div className="notification-meta">
                    <span>
                      {notification.read
                        ? "Read"
                        : "Unread"}
                    </span>

                    <span>•</span>

                    <span>
                      {notification.createdAt
                        ? new Date(
                            notification.createdAt
                          ).toLocaleString()
                        : ""}
                    </span>
                  </div>
                </div>

                {!notification.read && (
                  <div className="unread-indicator"></div>
                )}
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
};

export default Notifications;