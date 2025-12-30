import React, { useEffect, useState } from "react";
import { getUserPlanStats } from "../services/admin";

type Stats = {
  total_users: number;
  free_users: number;
  plus_users: number;
  premium_users: number;
};

export default function UserPlanPie() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getUserPlanStats()
      .then((data) => {
        if (!mounted) return;
        setStats(data);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || err?.message || "Failed to load plan stats");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return (
      <div className="list-card plan-card">
        <h4>User plan breakdown</h4>
        <div>Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="list-card plan-card">
        <h4>User plan breakdown</h4>
        <div className="error-text">{error}</div>
      </div>
    );

  const t = stats?.total_users || 0;
  const freePct = t ? ((stats!.free_users / t) * 100) : 0;
  const plusPct = t ? ((stats!.plus_users / t) * 100) : 0;
  const premiumPct = t ? ((stats!.premium_users / t) * 100) : 0;

  // compute conic gradient stops
  const freeDeg = (freePct / 100) * 360;
  const plusDeg = freeDeg + (plusPct / 100) * 360;

  const gradient = `conic-gradient(#FFB733 0deg ${freeDeg}deg, #FF8A00 ${freeDeg}deg ${plusDeg}deg, #FF5D0D ${plusDeg}deg 360deg)`;

  return (
    <div className="list-card plan-card">
      <h4>User plan breakdown</h4>

      <div className="plan-body">
        <div className="pie-wrap">
          {t === 0 ? (
            <div className="pie-empty">No users</div>
          ) : (
            <div className="pie" style={{ background: gradient }}>
              <div className="pie-center">{t}</div>
            </div>
          )}
        </div>

        <div className="plan-legend">
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: "#FFB733" }} />
            <div>
              <div className="legend-label">Free</div>
              <div className="legend-value">{stats?.free_users ?? 0} ({freePct.toFixed(0)}%)</div>
            </div>
          </div>

          <div className="legend-item">
            <span className="legend-swatch" style={{ background: "#FF8A00" }} />
            <div>
              <div className="legend-label">Plus</div>
              <div className="legend-value">{stats?.plus_users ?? 0} ({plusPct.toFixed(0)}%)</div>
            </div>
          </div>

          <div className="legend-item">
            <span className="legend-swatch" style={{ background: "#FF5D0D" }} />
            <div>
              <div className="legend-label">Premium</div>
              <div className="legend-value">{stats?.premium_users ?? 0} ({premiumPct.toFixed(0)}%)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
