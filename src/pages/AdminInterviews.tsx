import { useEffect, useState } from "react";
import { getInterviewSlotStats } from "../services/admin";
import AdminLayout from "../components/AdminLayout";
import "./AdminInterviews.redesign.css";

type Slot = {
  interview_slot_id: number;
  interview_code: string;
  candidate_id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile_number?: string;
  job_role: string;
  interview_mode: string;
  experience: string;
  skills: string[];
  resume_url?: string;
  interview_status: string;
  start_time_utc: string;
  end_time_utc: string;
  is_payment_done?: boolean;
};

export default function AdminInterviews() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [mode, setMode] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [apiOnlineCount, setApiOnlineCount] = useState<number | null>(null);
  const [apiOfflineCount, setApiOfflineCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const normalizeMode = (m?: string) =>
    (m || "").toString().trim().toLowerCase();

  const computedOnlineCount = slots.filter(
    (s) => normalizeMode(s.interview_mode) === "online"
  ).length;

  const computedOfflineCount = slots.filter(
    (s) => normalizeMode(s.interview_mode) === "offline"
  ).length;

  const onlineCount = apiOnlineCount ?? computedOnlineCount;
  const offlineCount = apiOfflineCount ?? computedOfflineCount;

  const totalPages = Math.ceil(slots.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedSlots = slots.slice(startIdx, startIdx + itemsPerPage);

  const fetchSlots = async (opts?: { from?: string; to?: string; mode?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const fromParam = opts?.from ?? from;
      const toParam = opts?.to ?? to;
      const modeParam = opts?.mode ?? mode;

      const data = await getInterviewSlotStats({
        from: fromParam,
        to: toParam,
        mode: modeParam || undefined,
      });

      // rows may come directly or under .rows
      const rows = Array.isArray(data) ? data : data?.rows || [];

      // Normalize candidate fields coming from API to the local Slot shape
      const normalized = (rows || []).map((r: any) => ({
        ...r,
        first_name:
          r.first_name ?? r.candidate_first_name ?? r.candidate?.first_name ?? r.candidate?.firstName ?? null,
        last_name:
          r.last_name ?? r.candidate_last_name ?? r.candidate?.last_name ?? r.candidate?.lastName ?? null,
        email: r.email ?? r.candidate_email ?? r.candidate?.email ?? null,
        mobile_number:
          r.mobile_number ?? r.candidate_mobile_number ?? r.candidate?.mobile_number ?? r.candidate?.phone ?? null,
        resume_url: r.resume_url ?? r.candidate_resume_url ?? r.candidate?.resume_url ?? r.candidate?.resumeUrl ?? r.cv_url ?? null,
      }));

      // Sort so the most recent slots appear first. Prefer start_time_utc, fallback to created_at.
      const safeTime = (obj: any) => {
        const t = obj?.start_time_utc ?? obj?.created_at ?? obj?.ts_range ?? null;
        const parsed = Date.parse(t || "");
        return Number.isNaN(parsed) ? 0 : parsed;
      };

      normalized.sort((a: any, b: any) => safeTime(b) - safeTime(a));

      setSlots(normalized || []);

      // Try to parse counts from multiple possible keys returned by the API
      const getNumber = (v: any) => (typeof v === "number" ? v : null);

      const onlineCandidates = getNumber(data?.online_count) ?? getNumber(data?.onlineCount) ?? getNumber(data?.counts?.online) ?? getNumber(data?.stats?.online) ?? getNumber(data?.meta?.online) ?? null;
      const offlineCandidates = getNumber(data?.offline_count) ?? getNumber(data?.offlineCount) ?? getNumber(data?.counts?.offline) ?? getNumber(data?.stats?.offline) ?? getNumber(data?.meta?.offline) ?? null;

      setApiOnlineCount(onlineCandidates);
      setApiOfflineCount(offlineCandidates);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load interview slots"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateShort = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
  };

  const formatExperience = (exp?: string) => {
    if (!exp) return "Fresher";
    const yMatch = exp.match(/(\d+)\s*years?/i);
    const mMatch = exp.match(/(\d+)\s*months?/i);
    const years = yMatch ? parseInt(yMatch[1], 10) : 0;
    const months = mMatch ? parseInt(mMatch[1], 10) : 0;
    const total = years + months / 12;
    if (Math.round(total * 10) === 0) return "Fresher";
    return `${total.toFixed(1)} years`;
  };

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.classList.add("full-bleed");
    fetchSlots();
    return () => {
      if (root) root.classList.remove("full-bleed");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to page 1 when slots change (e.g., after filter)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [slots.length, totalPages, currentPage]);

  return (
    <AdminLayout
      headerTitle="Interviews"
      headerSubtitle="Filter by date and mode"
    >
      <section className="interviews-page">
        {/* ================= FILTERS TOP ================= */}
        <div className="filter-bar">
              <div className="filter-fields">
            <div>
              <label className="field-label">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  const v = e.target.value;
                  setFrom(v);
                  fetchSlots({ from: v });
                }}
                className="input"
              />
            </div>

            <div>
              <label className="field-label">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  const v = e.target.value;
                  setTo(v);
                  fetchSlots({ to: v });
                }}
                min={from}
                className="input"
              />
            </div>

            <div>
              <label className="field-label">Mode</label>
              <select
                value={mode}
                onChange={(e) => {
                  const v = e.target.value;
                  setMode(v);
                  // fetch immediately when mode changes using the new value
                  fetchSlots({ mode: v });
                }}
                className="input"
              >
                <option value="">All</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="filter-apply">
              <button className="apply-btn" onClick={() => fetchSlots()}>
                Apply
              </button>
            </div>
          </div>

          <div className="status-badges">
            <div
              className={`status-badge clickable ${mode === "online" ? "active" : ""}`}
              onClick={() => {
                const newMode = mode === "online" ? "" : "online";
                setMode(newMode);
                fetchSlots({ mode: newMode });
              }}
            >
              <div className="status-dot online" />
              <span className="status-label">Online</span>
              <span className="status-count">{onlineCount}</span>
            </div>

            <div
              className={`status-badge clickable ${mode === "offline" ? "active" : ""}`}
              onClick={() => {
                const newMode = mode === "offline" ? "" : "offline";
                setMode(newMode);
                fetchSlots({ mode: newMode });
              }}
            >
              <div className="status-dot offline" />
              <span className="status-label">Offline</span>
              <span className="status-count">{offlineCount}</span>
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="list-card slots-card">
          <h4>Interview Slots</h4>

          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="error-text">{error}</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Skills</th>
                    <th>Mode</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSlots.map((s, idx) => (
                    <tr
                      key={s.interview_slot_id}
                      className="slot-row"
                      onClick={() => {
                        setSelectedSlot(s);
                        setShowModal(true);
                      }}
                    >
                      <td className="sn-cell">{startIdx + idx + 1}</td>
                      <td className="candidate-cell">
                        {s.first_name || ""} {s.last_name || ""}
                      </td>
                      <td className="role-cell">
                        <div className="role-title">{s.job_role}</div>
                      </td>
                      <td className="skills-cell">
                        <div className="skills-row">
                          {(s.skills || []).slice(0, 6).map((sk) => (
                            <span key={sk} className="skill-badge">{sk}</span>
                          ))}
                        </div>
                      </td>
                      <td className="mode-cell capitalize">{s.interview_mode}</td>
                      <td className="date-cell mono">{formatDateShort(s.start_time_utc)}</td>
                      <td className="payment-cell">{s.is_payment_done ? "Paid" : "Unpaid"}</td>
                      <td className="resume-cell">
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (s.resume_url) window.open(s.resume_url, "_blank");
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================= PAGINATION ================= */}
        {slots.length > 0 && totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
              .map((page) => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        )}

        {/* ================= MODAL ================= */}
        {showModal && selectedSlot && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedSlot.interview_code}</h3>
                <button className="tiny" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Code:</strong> {selectedSlot.interview_code}</p>
                <p><strong>Name:</strong> {selectedSlot.first_name || ""} {selectedSlot.last_name || ""}</p>
                <p><strong>Email:</strong> {selectedSlot.email || "-"}</p>
                <p><strong>Mobile:</strong> {selectedSlot.mobile_number || "-"}</p>
                <p><strong>Role:</strong> {selectedSlot.job_role}</p>
                <p><strong>Mode:</strong> {selectedSlot.interview_mode}</p>
                <p><strong>Experience:</strong> {formatExperience(selectedSlot.experience)}</p>
                <p><strong>Start:</strong> {formatTime(selectedSlot.start_time_utc)}</p>
                <p><strong>End:</strong> {formatTime(selectedSlot.end_time_utc)}</p>
                <p><strong>Payment:</strong> {selectedSlot.is_payment_done ? "Paid" : "Unpaid"}</p>
                <p><strong>Skills:</strong></p>
                <div className="skills-row">
                  {(selectedSlot.skills || []).map((sk) => (
                    <span key={sk} className="skill-badge">{sk}</span>
                  ))}
                </div>
                {selectedSlot.resume_url && (
                  <p style={{ marginTop: 12 }}>
                    <button className="action-btn" onClick={() => window.open(selectedSlot.resume_url, "_blank")}>Open Resume</button>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
