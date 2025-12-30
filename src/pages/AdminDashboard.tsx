import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/admin";
import "./AdminDashboard.css";

const pendingUsers = [
  { name: "Alice Johnson", email: "alice.johnsonalice@example.com" },
  { name: "Bob Martin", email: "bob@example.com" },
  { name: "Cara Lee", email: "cara@example.com" }
];

const upcomingInterviews = [
  { user: "David G.", slot: "2025-12-28 10:00 AM" },
  { user: "Eva R.", slot: "2025-12-28 12:00 PM" }
];

const recentResumes = [
  { name: "Frank H.", submitted: "2025-12-20" },
  { name: "Grace K.", submitted: "2025-12-21" }
];

const AdminDashboard: React.FC = () => {
  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.classList.add("full-bleed");
    return () => {
      if (root) root.classList.remove("full-bleed");
    };
  }, []);
  const navigate = useNavigate();
  return (
    <div className="admin-root">
      <aside className="sidebar">
        <div className="logo">BOWIZZY</div>
        <nav className="nav">
          <a className="nav-item active">Overview</a>
          <a className="nav-item">Users</a>
          <a className="nav-item">Interviews</a>
          <a className="nav-item">Resumes</a>
        </nav>

        <button
          className="logout-btn"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </aside>

      <main className="main">
        <header className="main-header">
          <div>
            <h2>Welcome to BoWizzy Admin</h2>
            <div className="sub">superadmin</div>
          </div>

          <div className="header-actions">
            <button className="pill">Search</button>
            <button className="pill">Notifications</button>
            <button
              className="pill"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Pending User Confirmations</div>
            <div className="stat-number">12</div>
            <button className="small-btn">Manage</button>
          </div>

          <div className="stat-card">
            <div className="stat-label">Interview Confirmations</div>
            <div className="stat-number">7</div>
            <button className="small-btn">Manage</button>
          </div>

          <div className="stat-card">
            <div className="stat-label">Resumes to Review</div>
            <div className="stat-number">21</div>
            <button className="small-btn">Manage</button>
          </div>
        </section>

        <section className="lists-row">
          <div className="list-card">
            <h4>Recent Pending Users</h4>
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Action</th></tr>
              </thead>
              <tbody>
                {pendingUsers.map((u) => (
                  <tr key={u.email}>
                    <td>{u.name}</td>
                    <td className="mono">{u.email}</td>
                    <td><button className="tiny">Confirm</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="list-card">
            <h4>Upcoming Interview Confirmations</h4>
            <table>
              <thead>
                <tr><th>User</th><th>Slot</th><th>Action</th></tr>
              </thead>
              <tbody>
                {upcomingInterviews.map((it) => (
                  <tr key={it.slot}>
                    <td>{it.user}</td>
                    <td className="mono">{it.slot}</td>
                    <td><button className="tiny">Confirm</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="list-card">
            <h4>Recent Resumes</h4>
            <table>
              <thead>
                <tr><th>Name</th><th>Submitted</th><th>Action</th></tr>
              </thead>
              <tbody>
                {recentResumes.map((r) => (
                  <tr key={r.name}>
                    <td>{r.name}</td>
                    <td className="mono">{r.submitted}</td>
                    <td><button className="tiny">Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;
