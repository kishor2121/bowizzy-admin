import React, { useEffect, useState } from "react";
import { getInterviewers, confirmInterviewer } from "../services/admin";
import AdminLayout from "../components/AdminLayout";
import "./AdminDashboard.css";

// (removed example pending users — actual pending users are loaded from the API)

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

  const [pendingUsers, setPendingUsers] = useState<Array<any>>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [confirmingIds, setConfirmingIds] = useState<Array<number | string>>([]);

  useEffect(() => {
    let mounted = true;
    setLoadingPending(true);
    setPendingError(null);
    getInterviewers()
      .then((res) => {
        if (!mounted) return;
        // response is an array of users; pending users are those not verified
        // backend may use boolean or string values (e.g. "requesting"). Treat only
        // explicit truthy/verified values as verified; everything else is pending.
        const isVerified = (u: any) => {
          const v = u.is_interviewer_verified;
          if (v === true || v === "true" || v === "verified" || v === 1) return true;
          return false;
        };
        const pending = (res || []).filter((u: any) => {
          if (typeof u.is_interviewer_verified !== "undefined" && u.is_interviewer_verified !== null) {
            return !isVerified(u);
          }
          return !u.is_verified;
        });
        setPendingUsers(pending);
      })
      .catch((err: any) => {
        // show a friendly message (don't leak raw errors)
        setPendingError(err?.response?.data?.message || err?.message || "Failed to load pending users");
      })
      .finally(() => {
        if (mounted) setLoadingPending(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const pendingCount = pendingUsers.length;

  const content = (
    <>
      <section className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Pending User Confirmations</div>
          <div className="stat-number">{loadingPending ? "..." : pendingCount}</div>
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
        <div className="list-card pending-card">
          <h4>Recent Pending Users</h4>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingPending && (
                  <tr>
                    <td colSpan={3}>Loading...</td>
                  </tr>
                )}
                {pendingError && (
                  <tr>
                    <td colSpan={3} className="error-text">
                      {pendingError}
                    </td>
                  </tr>
                )}
                {!loadingPending &&
                  !pendingError &&
                  pendingUsers.map((u) => (
                    <tr key={u.user_id || u.email}>
                      <td>
                        {[u.first_name, u.middle_name, u.last_name]
                          .filter(Boolean)
                          .join(" ") || u.email}
                      </td>
                      <td className="mono">{u.email}</td>
                      <td>
                        <button
                          className="tiny"
                          disabled={confirmingIds.includes(u.user_id)}
                          onClick={async () => {
                            const id = u.user_id || u.email;
                            setConfirmingIds((prev) => [...prev, id]);
                            try {
                              await confirmInterviewer(u.user_id);
                              setPendingUsers((prev) =>
                                prev.filter(
                                  (p) => (p.user_id || p.email) !== id
                                )
                              );
                            } catch (err: any) {
                              setPendingError(
                                err?.response?.data?.message ||
                                  err?.message ||
                                  "Failed to confirm user"
                              );
                            } finally {
                              setConfirmingIds((prev) =>
                                prev.filter((x) => x !== id)
                              );
                            }
                          }}
                        >
                          {confirmingIds.includes(u.user_id)
                            ? "Confirming..."
                            : "Confirm"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="list-card">
          <h4>Upcoming Interview Confirmations</h4>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Slot</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {upcomingInterviews.map((it) => (
                <tr key={it.slot}>
                  <td>{it.user}</td>
                  <td className="mono">{it.slot}</td>
                  <td>
                    <button className="tiny">Confirm</button>
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentResumes.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td className="mono">{r.submitted}</td>
                  <td>
                    <button className="tiny">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  return <AdminLayout>{content}</AdminLayout>
};

export default AdminDashboard;
