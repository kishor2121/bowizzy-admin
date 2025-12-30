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
        <div className="promo-logo">BOWIZZY ADMIN</div>
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
                  {/* Inline SVG icons so no new dependency is required */}
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 3l18 18" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10.7 5.1c1.3-.15 2.62-.11 3.9.12 3.9.74 6.4 4.51 6.4 4.51s-2.5 3.76-6.4 4.51c-4.16.8-8.6-2.5-9.95-4.08" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
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
