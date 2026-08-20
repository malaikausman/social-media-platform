import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Login.css";
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const email = formData.email.trim();
    const password = formData.password;
    if (!email) {
      setError("Email address is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    try {
      setLoading(true);
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      login(
        response.data.user,
        response.data.token
      );
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <Link to="/">Socially</Link>
        </div>
        <section className="auth-card">
          <div className="auth-header">
            <h1>Welcome back</h1>
            <p>
              Sign in to continue to your account.
            </p>
          </div>
          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
                required
              />
            </div>
            {error && (
              <div
                className="auth-error"
                role="alert"
              >
                {error}
              </div>
            )}
            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
          <div className="auth-footer">
            <span>
              Don't have an account?
            </span>
            <Link to="/signup">
              Create an account
            </Link>
          </div>
        </section>
        <p className="auth-bottom-text">
          Secure access to your Socially account.
        </p>
      </div>
    </main>
  );
};
export default Login;