import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Profile.css";

const Profile = () => {
  const { token } = useAuth();

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [selectedFile, setSelectedFile] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const photoInputRef = useRef(null);

  

  useEffect(() => {
    if (!message && !error) return;

    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, error]);

  

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

  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentUser = response.data.user;

        setUser(currentUser);

        setName(currentUser.name || "");
        setBio(currentUser.bio || "");

        setFollowerCount(
          response.data.followerCount || 0
        );

        setFollowingCount(
          response.data.followingCount || 0
        );
      } catch (error) {
        console.error("Get profile error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  

  const handleUpdate = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const trimmedName = name.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (trimmedName.length > 50) {
      setError("Name cannot exceed 50 characters.");
      return;
    }

    if (trimmedBio.length > 250) {
      setError("Bio cannot exceed 250 characters.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        "/users/profile",
        {
          name: trimmedName,
          bio: trimmedBio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data.user;

      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      setName("");
      setBio("");

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Update profile error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  

  const handleProfilePhotoClick = () => {
    setShowPhotoModal(true);
  };

  

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
  };

  

  const handlePhotoUpload = async () => {
    setMessage("");
    setError("");

    if (!selectedFile) {
      setError("Please choose an image first.");
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    try {
      setUploadLoading(true);

      const formData = new FormData();

      formData.append(
        "profilePhoto",
        selectedFile
      );

      const response = await api.post(
        "/users/profile/photo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser((prev) => ({
        ...prev,
        profilePhoto: response.data.profilePhoto,
      }));

      setSelectedFile(null);

      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }

      setMessage(
        "Profile photo uploaded successfully!"
      );
    } catch (error) {
      console.error(
        "Profile photo upload error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to upload profile photo."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            <div className="profile-spinner"></div>

            <h2>Loading Profile...</h2>

            <p>
              Please wait while we load your profile.
            </p>
          </div>
        </div>
      </main>
    );
  }

  

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-error">
            <h2>Profile unavailable</h2>

            <p>
              {error ||
                "We couldn't load your profile."}
            </p>

            <Link
              to="/"
              className="profile-back-button"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }


  return (
    <main className="profile-page">
      <div className="profile-container">

        {/* TOP BAR */}

        <div className="profile-topbar">
          <Link
            to="/"
            className="profile-back-button"
          >
            ← Back to Home
          </Link>
        </div>

        {/* PROFILE HEADER */}

        <section className="profile-card profile-header">

          <div className="profile-avatar-wrapper">

            <button
              type="button"
              className="profile-avatar-button"
              onClick={handleProfilePhotoClick}
              aria-label="View profile photo"
            >
              {user.profilePhoto ? (
                <img
                  src={`http://localhost:5000${user.profilePhoto}`}
                  alt={`${user.name}'s profile`}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar profile-avatar-placeholder">
                  {user.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>
              )}
            </button>

          </div>

          <h1>{user.name}</h1>

          <p className="profile-email">
            {user.email}
          </p>

          <p className="profile-bio">
            {user.bio || "No bio yet."}
          </p>

          {/* FOLLOWERS / FOLLOWING */}

          <div className="profile-stats">

            <Link
              to={`/users/${user._id}/followers`}
              className="profile-stat"
            >
              <strong>{followerCount}</strong>
              <span>Followers</span>
            </Link>

            <div className="profile-stat-divider"></div>

            <Link
              to={`/users/${user._id}/following`}
              className="profile-stat"
            >
              <strong>{followingCount}</strong>
              <span>Following</span>
            </Link>

          </div>
        </section>

        {/* PROFILE PHOTO UPLOAD */}

        <section className="profile-card profile-section">

          <div className="section-heading">
            <div>
              <h2>Profile Photo</h2>

              <p>
                Keep your profile photo up to date.
              </p>
            </div>
          </div>

          <div className="photo-upload">

            <input
              ref={photoInputRef}
              id="profile-photo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file =
                  e.target.files[0] || null;

                setSelectedFile(file);
                setError("");
                setMessage("");
              }}
            />

            <label
              htmlFor="profile-photo"
              className="file-label"
            >
              Choose Image
            </label>

            {selectedFile && (
              <span className="selected-file">
                {selectedFile.name}
              </span>
            )}

            <button
              type="button"
              onClick={handlePhotoUpload}
              disabled={uploadLoading}
              className="primary-button"
            >
              {uploadLoading
                ? "Uploading..."
                : "Upload Photo"}
            </button>

          </div>
        </section>

        {/* EDIT PROFILE */}

        <section className="profile-card profile-section edit-profile-section">

          <div className="section-heading">
            <div>
              <h2>Edit Profile</h2>

              <p>
                Update your public profile information.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdate}>

            <div className="form-group">

              <label htmlFor="name">
                Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Your name"
                maxLength={50}
              />

              <small>
                {name.length}/50
              </small>

            </div>

            <div className="form-group">

              <label htmlFor="bio">
                Bio
              </label>

              <textarea
                id="bio"
                value={bio}
                onChange={(e) =>
                  setBio(e.target.value)
                }
                placeholder="Tell people a little about yourself..."
                rows="4"
                maxLength={250}
              />

              <small>
                {bio.length}/250
              </small>

            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </form>
        </section>

        {/* TOASTS */}

        {message && (
          <div
            className="profile-toast success"
            role="status"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            className="profile-toast error"
            role="alert"
          >
            {error}
          </div>
        )}

      </div>

      {showPhotoModal && (
        <div
          className="profile-photo-modal"
          onClick={handleClosePhotoModal}
          role="dialog"
          aria-modal="true"
          aria-label="Profile photo preview"
        >
          <div
            className="profile-photo-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="profile-photo-modal-close"
              onClick={handleClosePhotoModal}
              aria-label="Close photo"
            >
              ×
            </button>

            {user.profilePhoto ? (
              <img
                src={`http://localhost:5000${user.profilePhoto}`}
                alt={`${user.name}'s enlarged profile`}
                className="profile-photo-modal-image"
              />
            ) : (
              <div className="profile-photo-modal-placeholder">
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

export default Profile;