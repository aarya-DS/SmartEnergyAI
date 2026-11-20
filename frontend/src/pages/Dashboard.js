import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function BarRow({ label, value, max, cls }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 0) : 0;
  return (
    <div className="bar-row">
      <div className="bar-meta">
        <span className="bar-label">{label}</span>
        <span className="bar-value">{value} kWh</span>
      </div>
      <div className="bar-track">
        <div className={`bar-fill ${cls}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Donut({ solar_pct }) {
  const r = 46, circ = 2 * Math.PI * r;
  const solarDash = (solar_pct / 100) * circ;
  return (
    <div className="donut-wrapper">
      <div className="donut-ring">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
          <circle cx="60" cy="60" r={r} fill="none" stroke="#10b981" strokeWidth="12"
            strokeDasharray={`${solarDash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="donut-center">
          <span className="donut-pct">{solar_pct}%</span>
          <span className="donut-lbl">Solar</span>
        </div>
      </div>
      <div className="donut-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: "#10b981" }} />
          <span className="legend-label">Solar</span>
          <span className="legend-value text-green">{solar_pct}%</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: "#ef4444" }} />
          <span className="legend-label">Grid</span>
          <span className="legend-value text-red">{(100 - solar_pct).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const r = JSON.parse(localStorage.getItem("last_analysis") || "null");
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] || "User";

  return (
    <div>
      {/* Page header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>{greeting}, {firstName} 👋</h1>
          <p>Here's your building energy overview.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/analysis")}>
          ⚡ Run New Analysis
        </button>
      </div>

      {r ? (
        <>
          {/* KPI row */}
          <div className="kpi-grid">
            <div className="kpi-card demand">
              <div className="kpi-icon demand">📈</div>
              <div className="kpi-label">Predicted Demand</div>
              <div className="kpi-value demand">{r.final_predicted_demand}</div>
              <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>kWh</div>
            </div>
            <div className="kpi-card solar">
              <div className="kpi-icon solar">☀️</div>
              <div className="kpi-label">Available Solar</div>
              <div className="kpi-value solar">{r.solar_available}</div>
              <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>kWh</div>
            </div>
            <div className="kpi-card used">
              <div className="kpi-icon used">✅</div>
              <div className="kpi-label">Solar Used</div>
              <div className="kpi-value used">{r.optimization.solar_used}</div>
              <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>kWh</div>
            </div>
            <div className="kpi-card grid">
              <div className="kpi-icon grid">🔌</div>
              <div className="kpi-label">Grid Required</div>
              <div className="kpi-value grid">{r.optimization.grid_required}</div>
              <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>kWh</div>
            </div>
            <div className="kpi-card pct">
              <div className="kpi-icon pct">♻️</div>
              <div className="kpi-label">Renewable %</div>
              <div className="kpi-value pct">{r.optimization.solar_percentage}</div>
              <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>percent</div>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Bar chart */}
            <div className="card card-pad">
              <div className="card-header">
                <div>
                  <div className="card-title">Energy Overview</div>
                  <div className="card-subtitle">{r.display_title || "Latest Analysis"}</div>
                </div>
              </div>
              <div className="bar-chart">
                <BarRow label="Total Demand"  value={r.final_predicted_demand}      max={r.final_predicted_demand} cls="demand" />
                <BarRow label="Solar Used"    value={r.optimization.solar_used}     max={r.final_predicted_demand} cls="solar" />
                <BarRow label="Grid Required" value={r.optimization.grid_required}  max={r.final_predicted_demand} cls="grid" />
              </div>
            </div>

            {/* Donut */}
            <div className="card card-pad">
              <div className="card-header">
                <div>
                  <div className="card-title">Renewable Contribution</div>
                  <div className="card-subtitle">Solar vs Grid split</div>
                </div>
              </div>
              <div style={{ padding: "12px 0" }}>
                <Donut solar_pct={r.optimization.solar_percentage} />
              </div>
            </div>
          </div>

          {/* Recommendation card */}
          <div className="card card-pad">
            <div className="card-title" style={{ marginBottom: 12 }}>AI Recommendation</div>
            <div className="recommendation-box">
              {r.optimization.grid_required > 0 ? (
                <span>
                  ☀️ Increasing available solar by <strong>{r.optimization.grid_required} kWh</strong> would eliminate grid dependency entirely for this scenario.
                </span>
              ) : (
                <span>
                  ✅ Current solar capacity fully satisfies building demand. Consider battery storage to bank any excess generation.
                </span>
              )}
            </div>
            <div style={{ marginTop: 16 }}>
              <Link to="/analysis" className="btn btn-primary" style={{ display: "inline-flex" }}>
                Run New Analysis →
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state" style={{ minHeight: 400 }}>
          <div className="empty-icon">⚡</div>
          <div className="empty-title">No analysis yet</div>
          <div className="empty-desc">
            Run your first energy analysis to see demand forecasts, solar allocation
            and grid dependency on this dashboard.
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/analysis")}>
            Start Energy Analysis
          </button>
        </div>
      )}
    </div>
  );
}
