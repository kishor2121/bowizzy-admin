import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInterviewers } from "../services/admin";
import AdminLayout from "../components/AdminLayout";
import "./AdminDashboard.css";

const upcomingInterviews = [
  { user: "David G.", slot: "2025-12-28 10:00 AM" },
  { user: "Eva R.", slot: "2025-12-28 12:00 PM" },
];

const recentResumes = [
  { name: "Frank H.", submitted: "2025-12-20" },
  { name: "Grace K.", submitted: "2025-12-21" },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.classList.add("full-bleed");
    return () => {
      if (root) root.classList.remove("full-bleed");
    };
  }, []);

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoadingPending(true);
    setPendingError(null);

    getInterviewers()
      .then((res) => {
        if (!mounted) return;

        const isVerified = (u: any) =>
          u.is_interviewer_verified === true ||
          u.is_interviewer_verified === "true" ||
          u.is_interviewer_verified === "verified" ||
          u.is_interviewer_verified === 1;

        const pending = (res || []).filter((u: any) => !isVerified(u));
        setPendingUsers(pending);
      })
      .catch((err: any) => {
        setPendingError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load pending users"
        );
      })
      .finally(() => {
        if (mounted) setLoadingPending(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminLayout>
      <div className="dashboard-root">
        {/* HEADER */}
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <p>Overview of platform activity</p>
        </div>

        {/* STATS */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-title">Pending Users</span>
            <span className="stat-value">
              {loadingPending ? "…" : pendingUsers.length}
            </span>
            <button onClick={() => navigate("/admin/users")}>
              Manage Users
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-title">Interview Confirmations</span>
            <span className="stat-value">7</span>
            <button>View</button>
          </div>

          <div className="stat-card">
            <span className="stat-title">Resumes Pending</span>
            <span className="stat-value">21</span>
            <button>Review</button>
          </div>
        </div>

        {/* LISTS */}
        <div className="dashboard-lists">
          <div className="list-card">
            <h4>Upcoming Interviews</h4>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Slot</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {upcomingInterviews.map((it) => (
                  <tr key={it.slot}>
                    <td>{it.user}</td>
                    <td className="mono">{it.slot}</td>
                    <td>
                      <button className="tiny-btn">Confirm</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="list-card">
            <h4>Recent Resumes</h4>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentResumes.map((r) => (
                  <tr key={r.name}>
                    <td>{r.name}</td>
                    <td className="mono">{r.submitted}</td>
                    <td>
                      <button className="tiny-btn">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {pendingError && <div className="error">{pendingError}</div>}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
