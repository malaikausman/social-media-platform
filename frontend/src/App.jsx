import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Posts from "./pages/Posts";
import Notifications from "./pages/Notifications";
import UserProfile from "./pages/UserProfile";
import Followers from "./pages/Followers";
import Following from "./pages/Following";
import Users from "./pages/Users";
import { useAuth } from "./context/AuthContext";
import api from "./api/axios";
import "./Home.css";

function Home() {
  const { user, token, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await api.get(
        "/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const notifications =
        response.data.notifications || [];

      const unread = notifications.filter(
        (notification) => !notification.read
      ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error(
        "Failed to load notification count:",
        error
      );
    }
  };

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [token]);

  return (
    <main className="home-page">
      <div className="home-container">

        {/* Header */}
        <header className="home-header">
          <Link
            to="/"
            className="home-logo"
          >
            Socially
          </Link>

          {user && (
            <nav className="home-nav-bar">
              <Link to="/posts">
                Posts
              </Link>

              <Link to="/users">
                Users
              </Link>

              <Link to="/notifications">
                Notifications

                {unreadCount > 0 && (
                  <span className="notification-count">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link to="/profile">
                Profile
              </Link>
            </nav>
          )}
        </header>

        {/* Logged In */}
        {user ? (
          <>
            {/* Welcome */}
            <section className="home-welcome-card">
              <p className="home-label">
                YOUR SOCIAL SPACE
              </p>

              <h1>
                Welcome, {user.name}
              </h1>

              <p className="home-description">
                Connect with people, share your
                thoughts, and stay updated.
              </p>

              <Link
                to="/posts"
                className="home-primary-link"
              >
                Explore Posts
              </Link>
            </section>

            {/* Quick Links */}
            <section className="home-grid">

              <Link
                to="/profile"
                className="home-feature-card"
              >
                <span className="feature-number">
                  01
                </span>

                <h3>
                  My Profile
                </h3>

                <p>
                  Manage your profile,
                  information and connections.
                </p>
              </Link>

              <Link
                to="/users"
                className="home-feature-card"
              >
                <span className="feature-number">
                  02
                </span>

                <h3>
                  Discover Users
                </h3>

                <p>
                  Find people and connect
                  with your community.
                </p>
              </Link>

              <Link
                to="/notifications"
                className="home-feature-card"
              >
                <span className="feature-number">
                  03
                </span>

                <h3>
                  Notifications
                </h3>

                <p>
                  Keep track of your latest
                  activity and updates.
                </p>
              </Link>

            </section>

            {/* Account */}
            <section className="home-account-card">
              <button
                onClick={logout}
                className="home-logout"
              >
                Logout
              </button>
            </section>

            <footer className="home-footer">
              Socially · Your social space
            </footer>
          </>
        ) : (
          /* Logged Out */
          <section className="home-auth-card">
            <p className="home-label">
              SOCIAL PLATFORM
            </p>

            <h1>
              Welcome to Socially
            </h1>

            <p>
              Connect, share and discover
              something new.
            </p>

            <div className="home-auth-buttons">
              <Link
                to="/login"
                className="home-primary-link"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="home-secondary-link"
              >
                Create Account
              </Link>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/posts"
          element={<Posts />}
        />

        <Route
          path="/users"
          element={<Users />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/users/:userId"
          element={<UserProfile />}
        />

        <Route
          path="/users/:userId/followers"
          element={<Followers />}
        />

        <Route
          path="/users/:userId/following"
          element={<Following />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;