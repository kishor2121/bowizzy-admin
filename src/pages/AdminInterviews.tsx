import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInterviewSlotStats } from "../services/admin";
import "./AdminDashboard.css";

type Slot = {
  interview_slot_id: number;
  interview_code: string;
  candidate_id: number;
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
  const navigate = useNavigate();
  const [from, setFrom] = useState(() => {
    // default last 30 days
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [mode, setMode] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showModal, setShowModal] = useState(false);

  // normalize helper and quick counts
  const normalizeMode = (m?: string) => (m || "").toString().trim().toLowerCase();
  const onlineCount = slots.filter((s) => normalizeMode(s.interview_mode) === "online").length;
  const offlineCount = slots.filter((s) => normalizeMode(s.interview_mode) === "offline").length;

  const fetchSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInterviewSlotStats({ from, to, mode: mode || undefined });
      // Expect array; guard if server returns object
      setSlots(Array.isArray(data) ? data : data?.rows || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load interview slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.classList.add("full-bleed");
    fetchSlots();
    return () => { if (root) root.classList.remove("full-bleed"); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="admin-root">
      <aside className="sidebar">
        <div className="sidebar-card">
          <div className="logo">BOWIZZY</div>
          <nav className="nav">
            <a className="nav-item" onClick={() => navigate('/admin/dashboard')}>Overview</a>
            <a className="nav-item" onClick={() => navigate('/admin/users')}>Users</a>
            <a className="nav-item active">Interviews</a>
            <a className="nav-item" onClick={() => navigate('/admin/resumes')}>Resumes</a>
            <a className="nav-item" onClick={() => navigate('/admin/plans')}>Plans</a>
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
              <h2>Interviews</h2>
              <div className="sub">Filter by date and mode</div>
            </div>
          </header>

          <section className="lists-row lists-row--interviews" style={{ alignItems: 'flex-start' }}>
            <div className="list-card filter-card" style={{ padding: 18 }}>
              <h4>Filters</h4>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label className="field-label">From</label>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
                  </div>

                  <div>
                    <label className="field-label">To</label>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
                  </div>

                  <div>
                    <label className="field-label">Mode</label>
                    <select value={mode} onChange={(e) => setMode(e.target.value)} className="input">
                      <option value="">All</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>

                  <div>
                    <button className="apply-btn" onClick={fetchSlots}>Apply</button>
                  </div>
                </div>

                {/* quick stats for online/offline counts */}
                <div className="filter-stats">
                  <div className="stat-mini" onClick={() => { setMode('online'); fetchSlots(); }} style={{ cursor: 'pointer' }}>
                    <div className="stat-mini-swatch online" />
                    <div>
                      <div className="stat-mini-label">Online</div>
                      <div className="stat-mini-value">{onlineCount}</div>
                    </div>
                  </div>

                  <div className="stat-mini" onClick={() => { setMode('offline'); fetchSlots(); }} style={{ cursor: 'pointer' }}>
                    <div className="stat-mini-swatch offline" />
                    <div>
                      <div className="stat-mini-label">Offline</div>
                      <div className="stat-mini-value">{offlineCount}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="list-card slots-card" style={{ flex: '2 1 0' }}>
              <h4>Interview slots</h4>
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="error-text">{error}</div>
              ) : (
                <div style={{ overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Role</th>
                        <th>Mode</th>
                        <th>Start (UTC)</th>
                        <th>End (UTC)</th>
                        <th>Payment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((s) => (
                        <tr key={s.interview_slot_id} onClick={() => { setSelectedSlot(s); setShowModal(true); }} className="slot-row">
                          <td title={s.interview_code}>{s.interview_code}</td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{s.job_role}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{s.experience}</div>
                            <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {(s.skills || []).slice(0,4).map((sk: string) => (
                                <span key={sk} className="skill-badge">{sk}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{s.interview_mode}</td>
                          <td className="mono">{new Date(s.start_time_utc).toLocaleString()}</td>
                          <td className="mono">{new Date(s.end_time_utc).toLocaleString()}</td>
                          <td>{s.is_payment_done ? 'Paid' : 'Free'}</td>
                          <td>
                            <button className="action-btn" onClick={(e) => { e.stopPropagation(); window.open(s.resume_url, '_blank'); }}>Resume</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
          {/* Modal for slot details */}
          {showModal && selectedSlot && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{selectedSlot.interview_code}</h3>
                  <button className="tiny" onClick={() => setShowModal(false)}>Close</button>
                </div>
                <div className="modal-body">
                  <p><strong>Role:</strong> {selectedSlot.job_role}</p>
                  <p><strong>Mode:</strong> {selectedSlot.interview_mode}</p>
                  <p><strong>Experience:</strong> {selectedSlot.experience}</p>
                  <p><strong>Start:</strong> {new Date(selectedSlot.start_time_utc).toLocaleString()}</p>
                  <p><strong>End:</strong> {new Date(selectedSlot.end_time_utc).toLocaleString()}</p>
                  <p><strong>Payment:</strong> {selectedSlot.is_payment_done ? 'Paid' : 'Free'}</p>
                  <p><strong>Skills:</strong> {(selectedSlot.skills || []).join(', ')}</p>
                  <p><a href={selectedSlot.resume_url} target="_blank" rel="noreferrer" className="action-btn">Open Resume</a></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
