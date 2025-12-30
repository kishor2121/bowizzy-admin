import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

import { useEffect } from "react";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.classList.add("full-bleed");
    return () => {
      if (root) root.classList.remove("full-bleed");
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with real auth logic
    navigate("/admin/dashboard");
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

            <button className="submit-btn" type="submit">
              Login
            </button>

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
