import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Users.css";

const Users = () => {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BACKEND_URL =
    "https://social-media-platform-backend-oxp3.onrender.com";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Get users error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load users"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [token]);

  const filteredUsers = users.filter((person) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    const name = person.name?.toLowerCase() || "";
    const email = person.email?.toLowerCase() || "";
    const bio = person.bio?.toLowerCase() || "";

    return (
      name.includes(searchText) ||
      email.includes(searchText) ||
      bio.includes(searchText)
    );
  });

  if (loading) {
    return (
      <main className="users-page">
        <div className="users-container">
          <div className="users-top-bar">
            <Link
              to="/"
              className="users-home-button"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="users-status-card">
            <div className="users-spinner"></div>
            <p>Loading people...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="users-page">
        <div className="users-container">
          <div className="users-top-bar">
            <Link
              to="/"
              className="users-home-button"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="users-status-card">
            <h2>Something went wrong</h2>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="users-page">
      <div className="users-container">

        {/* BACK TO HOME */}

        <div className="users-top-bar">
          <Link
            to="/"
            className="users-home-button"
          >
            ← Back to Home
          </Link>
        </div>

        {/* HEADER */}

        <header className="users-header">
          <p className="users-label">
            COMMUNITY
          </p>

          <h1>Discover People</h1>

          <p className="users-subtitle">
            Find people and connect with them.
          </p>
        </header>

        {/* SEARCH */}

        {users.length > 0 && (
          <div className="users-search-wrapper">
            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name, email or bio..."
              className="users-search"
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* NO USERS */}

        {users.length === 0 ? (
          <div className="users-status-card">
            <div className="empty-icon">
              ✦
            </div>

            <h2>No other users yet</h2>

            <p>
              Create another account to test
              following.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* NO SEARCH RESULTS */

          <div className="users-status-card">
            <div className="empty-icon">
              ⌕
            </div>

            <h2>No users found</h2>

            <p>
              Try searching with another name,
              email or keyword.
            </p>
          </div>
        ) : (
          /* USERS */

          <div className="users-grid">

            {filteredUsers.map((person) => (
              <Link
                key={person._id}
                to={`/users/${person._id}`}
                className="user-card"
              >

                {/* AVATAR */}

                <div className="user-card-avatar">

                  {person.profilePhoto ? (
                    <img
                      src={`${BACKEND_URL}${person.profilePhoto}`}
                      alt={person.name}
                    />
                  ) : (
                    <span>
                      {person.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "U"}
                    </span>
                  )}

                </div>

                {/* USER INFO */}

                <div className="user-card-info">

                  <h3>
                    {person.name}
                  </h3>

                  <p className="user-card-email">
                    {person.email}
                  </p>

                  <p className="user-card-bio">
                    {person.bio ||
                      "No bio yet."}
                  </p>

                  <span className="view-profile">
                    View Profile →
                  </span>

                </div>

              </Link>
            ))}

          </div>
        )}

        {/* SEARCH COUNT */}

        {users.length > 0 &&
          search.trim() && (
            <p className="search-result-count">
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1
                ? "person"
                : "people"}{" "}
              found
            </p>
          )}

      </div>
    </main>
  );
};

export default Users;