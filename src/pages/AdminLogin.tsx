import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./AdminLogin.css";
import { authLogin } from "../services/admin";
import bowizzyLogo from "../assets/bowizzy.png"; // ✅ IMPORT LOGO

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
    setError(null);
    setLoading(true);

    authLogin({ email, password })
      .then(() => navigate("/admin/dashboard"))
      .catch((err) => {
        const msg =
          err?.response?.data?.message || err?.message || "Login failed";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="login-root">
      {/* LEFT PANEL */}
      <div className="promo-panel">
        <div className="promo-logo">
          <img
            src={bowizzyLogo}
            alt="Bowizzy Admin"
            className="promo-logo-img"
          />
        </div>

        <div className="promo-content">
          <h2>Bowizzy Admin</h2>
          <h2></h2>
        </div>

        <div className="promo-footer">
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="form-panel">
        <div className="form-card">
          <h3 className="form-title">Sign In</h3>

          <form onSubmit={handleSubmit} className="login-form">
            {/* EMAIL */}
            <label className="field">
              <span className="field-label">Email</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </label>

            {/* PASSWORD */}
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
                  className="eye-btn"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#ff7a2b" />
                  ) : (
                    <Eye size={20} color="#475569" />
                  )}
                </button>
              </div>
            </label>

            {/* SUBMIT */}
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            {/* ERROR */}
            {error && (
              <div className="error-text" role="alert">
                {error}
              </div>
            )}

            {/* LINKS */}
            <div className="links-row">
              <a className="link-muted" href="#">
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
