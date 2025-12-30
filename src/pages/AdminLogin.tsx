import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

import { useEffect } from "react";
import { authLogin } from "../services/admin";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.classList.add("full-bleed");
    return () => {
      if (root) root.classList.remove("full-bleed");
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // call backend auth endpoint
    setError(null);
    setLoading(true);
    authLogin({ email, password })
      .then(() => {
        navigate("/admin/dashboard");
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || "Login failed";
        setError(String(msg));
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="login-root">
      <div className="promo-panel">
        <div className="promo-logo">BOWIZZY</div>
        <div className="promo-content">
          <h2>Prep for interviews.</h2>
          <h2>Grow your career.</h2>
        </div>
        <div className="promo-footer">Ready to get started? Sign up for free.</div>
      </div>

      <div className="form-panel">
        <div className="form-card">
          <h3 className="form-title">Sign In</h3>
          <form onSubmit={handleSubmit} className="login-form">
            <label className="field">
              <span className="field-label">Email</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <div className="password-row">
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  className="eye-btn"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            {error && <div className="error-text" role="alert">{error}</div>}

            <div className="links-row">
              <a className="link-muted" href="#">Forgot Password?</a>
            </div>

            <div className="signup-row">
              Don't have an account? <a href="#">Sign Up</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
