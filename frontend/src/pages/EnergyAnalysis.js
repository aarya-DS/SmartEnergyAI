import React, { useState } from "react";
import PredictionForm from "../components/PredictionForm";

function FlowNode({ emoji, label, value, cls }) {
  return (
    <div className={`flow-node ${cls}`}>
      <span className="flow-emoji">{emoji}</span>
      <span className="flow-value">{value} kWh</span>
      <span className="flow-label">{label}</span>
    </div>
  );
}

function ResultPanel({ result }) {
  const { final_predicted_demand: demand, solar_available, optimization: opt, display_title } = result;

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Forecast banner */}
      <div className="forecast-banner">
        <div className="forecast-eyebrow">AI Energy Forecast</div>
        <div className="forecast-value">{demand} <span style={{ fontSize: 24, fontWeight: 400, opacity: 0.6 }}>kWh</span></div>
        <div className="forecast-building">Predicted electricity demand · {display_title}</div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--gray-100)" }}>
        {[
          { label: "Available Solar", value: `${solar_available} kWh`,    color: "#f59e0b" },
          { label: "Solar Used",      value: `${opt.solar_used} kWh`,     color: "#10b981" },
          { label: "Grid Required",   value: `${opt.grid_required} kWh`,  color: "#ef4444" },
          { label: "Renewable %",     value: `${opt.solar_percentage}%`,  color: "#4f46e5" },
        ].map(k => (
          <div key={k.label} style={{ background: "#fff", padding: "18px 20px" }}>
            <div style={{ fontSize: 11, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color, letterSpacing: "-0.5px" }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="section-divider" />

      {/* Energy flow */}
      <div style={{ padding: "24px 28px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--gray-400)", marginBottom: 16 }}>
          Energy Flow
        </div>
        <div className="energy-flow">
          <FlowNode emoji="☀️" label="Solar"   value={opt.solar_used}        cls="solar" />
          <span className="flow-op">+</span>
          <FlowNode emoji="🔌" label="Grid"    value={opt.grid_required}     cls="grid" />
          <span className="flow-op">=</span>
          <FlowNode emoji="🏢" label="Demand"  value={demand}                cls="bldg" />
        </div>
      </div>

      <div className="section-divider" />

      {/* Insights */}
      <div style={{ padding: "24px 28px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--gray-400)", marginBottom: 16 }}>
          AI Insights
        </div>
        <div className="insight-list">
          <div className="insight-item">
            <div className="insight-icon green">☀️</div>
            <span>Solar generation can satisfy <strong>{opt.solar_percentage}%</strong> of the predicted electricity demand for this scenario.</span>
          </div>
          <div className="insight-item">
            <div className="insight-icon orange">🔌</div>
            <span>Approximately <strong>{opt.grid_required} kWh</strong> will still need to be supplied by the grid.</span>
          </div>
          {opt.grid_required > 0 && (
            <div className="insight-item">
              <div className="insight-icon blue">💡</div>
              <span>Adding <strong>{opt.grid_required} kWh</strong> more renewable capacity would theoretically eliminate the grid requirement for this scenario.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EnergyAnalysis() {
  const [result, setResult] = useState(null);

  const handleResult = (data) => {
    setResult(data);
    localStorage.setItem("last_analysis", JSON.stringify(data));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Energy Analysis</h1>
        <p>Forecast demand and optimise your renewable energy allocation.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24, alignItems: "start" }}>
        {/* Form */}
        <div className="card card-pad" style={{ position: "sticky", top: 76 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-700)", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--gray-100)" }}>
            Scenario Setup
          </div>
          <PredictionForm onResult={handleResult} />
        </div>

        {/* Result */}
        <div>
          {result
            ? <ResultPanel result={result} />
            : (
              <div className="empty-state" style={{ minHeight: 500 }}>
                <div className="empty-icon">⚡</div>
                <div className="empty-title">Ready for Analysis</div>
                <div className="empty-desc">
                  Configure your building scenario on the left and click
                  "Run Energy Analysis" to generate an AI demand forecast.
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
