import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserPlanPie from "../components/UserPlanPie";
import "./AdminDashboard.css";

const AdminPlanStats: React.FC = () => {
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
      {/* Sidebar is shared from AdminDashboard (route will keep sidebar) */}
      <aside className="sidebar">
        <div className="sidebar-card">
          <div className="logo">BOWIZZY</div>
          <nav className="nav">
            <a className="nav-item" onClick={() => navigate('/admin/dashboard')}>Overview</a>
            <a className="nav-item">Users</a>
            <a className="nav-item">Interviews</a>
            <a className="nav-item">Resumes</a>
            <a className="nav-item">Plans</a>
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={() => navigate('/login')}>Logout</button>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="main-inner">
          <header className="main-header">
            <div>
              <h2>Plan details</h2>
              <div className="sub">Overview of subscription plans</div>
            </div>
          </header>

          <section className="lists-row" style={{ marginTop: 12 }}>
            <UserPlanPie />
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminPlanStats;
