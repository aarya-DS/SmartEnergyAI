import React, { useState } from "react";

export default function Analytics() {
  const r = JSON.parse(localStorage.getItem("last_analysis") || "null");
  const [activeTab, setActiveTab] = useState("diurnal"); // "diurnal", "scaling", "weather"

  if (!r) {
    return (
      <div>
        <div className="page-header">
          <h1>Energy Analytics &amp; Optimization</h1>
          <p>Deep-dive dispatch simulation, sensitivity curves, and environmental impact.</p>
        </div>
        <div className="empty-state" style={{ minHeight: 420 }}>
          <div className="empty-icon">📊</div>
          <div className="empty-title">No Analysis Data Available</div>
          <div className="empty-desc">
            Run an Energy Analysis scenario first to unlock 24-hour diurnal dispatch models,
            solar sensitivity curves, and carbon-reduction analytics.
          </div>
        </div>
      </div>
    );
  }

  // Base metrics from latest analysis
  const peakDemand = Number(r.final_predicted_demand) || 160;
  const currentSolar = Number(r.solar_available) || 100;
  const solarUsed = Number(r.optimization?.solar_used) || Math.min(peakDemand, currentSolar);
  const gridReq = Number(r.optimization?.grid_required) || Math.max(peakDemand - solarUsed, 0);

  // Environmental & Financial Impact Calculations (Standard grid emissions ~0.82 kg CO2 / kWh, ₹8.5 / kWh or $0.12 / kWh)
  const co2AvoidedKg = (solarUsed * 0.82).toFixed(1);
  const costSavingsPerHour = (solarUsed * 8.5).toFixed(0);
  const peakShavingPct = ((solarUsed / peakDemand) * 100).toFixed(1);

  // 1. Synthesize 24-Hour Diurnal Dispatch Curve anchored to the predicted peak demand
  // Typical campus load: night baseload ~38%, morning ramp ~60%, afternoon peak ~100%, evening decline ~50%
  const hourlyFactors = [
    0.38, 0.36, 0.35, 0.35, 0.37, 0.42, 0.52, 0.68,
    0.85, 0.94, 0.98, 0.99, 0.98, 0.99, 1.00, 0.96,
    0.88, 0.76, 0.64, 0.55, 0.48, 0.44, 0.41, 0.39
  ];

  // Solar generation bell curve peaking around 13:00-14:00
  const solarFactors = [
    0.00, 0.00, 0.00, 0.00, 0.00, 0.02, 0.08, 0.22,
    0.46, 0.70, 0.88, 0.97, 1.00, 0.98, 0.92, 0.75,
    0.52, 0.26, 0.07, 0.00, 0.00, 0.00, 0.00, 0.00
  ];

  const diurnalData = hourlyFactors.map((f, h) => {
    const demand = Math.round(peakDemand * f * 10) / 10;
    const solar = Math.round(currentSolar * solarFactors[h] * 10) / 10;
    const sUsed = Math.min(demand, solar);
    const gReq = Math.max(demand - sUsed, 0);
    const hourLabel = `${h < 10 ? "0" + h : h}:00`;
    return { hour: hourLabel, demand, solar, solarUsed: sUsed, gridReq: gReq };
  });

  const maxDiurnalVal = Math.max(...diurnalData.map(d => Math.max(d.demand, d.solar)));

  // 2. Solar Scaling What-If Data
  const scalingSteps = [
    { label: "25 kW", cap: Math.round(currentSolar * 0.25) || 25 },
    { label: "50 kW", cap: Math.round(currentSolar * 0.5) || 50 },
    { label: "75 kW", cap: Math.round(currentSolar * 0.75) || 75 },
    { label: `${currentSolar} kW (Current)`, cap: currentSolar, isCurrent: true },
    { label: "150 kW", cap: Math.round(currentSolar * 1.5) || 150 },
    { label: "200 kW", cap: Math.round(currentSolar * 2.0) || 200 }
  ];

  const scalingData = scalingSteps.map(step => {
    const sUsed = Math.min(peakDemand, step.cap);
    const gReq = Math.max(peakDemand - sUsed, 0);
    const rPct = Math.min((sUsed / peakDemand) * 100, 100);
    return { ...step, solarUsed: sUsed, gridReq: gReq, renewPct: rPct.toFixed(1) };
  });

  // 3. Weather Scenario Comparison Data
  const weatherScenarios = [
    { name: "Sunny", emoji: "☀️", demandMult: 1.02, solarMult: 1.0, desc: "Clear skies & full irradiance" },
    { name: "Partly Cloudy", emoji: "⛅", demandMult: 0.98, solarMult: 0.72, desc: "Intermittent cloud cover" },
    { name: "Overcast / Cloudy", emoji: "☁️", demandMult: 0.93, solarMult: 0.38, desc: "Diffuse light & reduced PV" },
    { name: "Rainy", emoji: "🌧️", demandMult: 0.88, solarMult: 0.15, desc: "Heavy rain & high attenuation" },
  ];

  const weatherData = weatherScenarios.map(w => {
    const d = Math.round(peakDemand * w.demandMult * 10) / 10;
    const s = Math.round(currentSolar * w.solarMult * 10) / 10;
    const sUsed = Math.min(d, s);
    const gReq = Math.max(d - sUsed, 0);
    const rPct = ((sUsed / d) * 100).toFixed(1);
    return { ...w, demand: d, solar: s, solarUsed: sUsed, gridReq: gReq, renewPct: rPct };
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Energy Intelligence &amp; Dispatch Analytics</h1>
          <p>
            Detailed engineering simulation, 24-hour diurnal profiles, and sensitivity modeling for{" "}
            <strong>{r.display_title || "Evaluated Building"}</strong>.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="building-type-badge" style={{ fontSize: 12, padding: "6px 14px", background: "var(--brand-50)", color: "var(--brand-700)" }}>
            ⚡ Baseline: {peakDemand} kWh
          </span>
          <span className="building-type-badge" style={{ fontSize: 12, padding: "6px 14px", background: "var(--green-bg)", color: "var(--green)" }}>
            ☀️ Solar PV: {currentSolar} kW
          </span>
        </div>
      </div>

      {/* ESG, Financial & Grid Relief KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card used">
          <div className="kpi-icon used">🌱</div>
          <div className="kpi-label">CO₂ Emissions Avoided</div>
          <div className="kpi-value used">{co2AvoidedKg}</div>
          <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>kg CO₂ per hour</div>
        </div>

        <div className="kpi-card solar">
          <div className="kpi-icon solar">💰</div>
          <div className="kpi-label">Estimated Savings</div>
          <div className="kpi-value solar">₹{costSavingsPerHour}</div>
          <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>hourly bill offset (@ ₹8.5/kWh)</div>
        </div>

        <div className="kpi-card pct">
          <div className="kpi-icon pct">📉</div>
          <div className="kpi-label">Peak Grid Shaving</div>
          <div className="kpi-value pct">{peakShavingPct}%</div>
          <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>utility demand reduction</div>
        </div>

        <div className="kpi-card grid">
          <div className="kpi-icon grid">🔌</div>
          <div className="kpi-label">Remaining Grid Reliance</div>
          <div className="kpi-value grid">{gridReq.toFixed(1)}</div>
          <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>kWh utility import</div>
        </div>
      </div>

      {/* Analytical Tab Navigation */}
      <div className="mode-tabs" style={{ marginBottom: 20 }}>
        <button
          type="button"
          className={`mode-tab ${activeTab === "diurnal" ? "active" : ""}`}
          onClick={() => setActiveTab("diurnal")}
        >
          📈 24-Hour Diurnal Load vs. Solar Dispatch
        </button>
        <button
          type="button"
          className={`mode-tab ${activeTab === "scaling" ? "active" : ""}`}
          onClick={() => setActiveTab("scaling")}
        >
          🔬 Solar Capacity Scaling Sensitivity
        </button>
        <button
          type="button"
          className={`mode-tab ${activeTab === "weather" ? "active" : ""}`}
          onClick={() => setActiveTab("weather")}
        >
          ⛅ Weather Scenario Impact
        </button>
      </div>

      {/* TAB 1: 24-HOUR DIURNAL DISPATCH SIMULATION */}
      {activeTab === "diurnal" && (
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">24-Hour Diurnal Energy Dispatch Profile</div>
              <div className="card-subtitle">
                Hourly building demand load curve versus rooftop solar generation and required grid imports
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 12, background: "var(--green)", borderRadius: 3 }} /> Solar Used (Clean)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 12, background: "var(--red)", borderRadius: 3 }} /> Grid Required
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 2, background: "var(--blue)" }} /> Total Demand
              </span>
            </div>
          </div>

          {/* 24-Column Vertical Bar Chart */}
          <div style={{ overflowX: "auto", paddingBottom: 8 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(24, minmax(36px, 1fr))",
                gap: 6,
                alignItems: "end",
                height: 260,
                padding: "20px 8px 10px",
                borderBottom: "1.5px solid var(--gray-200)",
                position: "relative"
              }}
            >
              {diurnalData.map((d, idx) => {
                const totalHeightPct = (d.demand / maxDiurnalVal) * 100;
                const isPeak = idx === 14;

                return (
                  <div
                    key={d.hour}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      justifyContent: "flex-end",
                      position: "relative"
                    }}
                    title={`${d.hour} -> Demand: ${d.demand} kWh | Solar: ${d.solar} kWh | Solar Used: ${d.solarUsed} kWh | Grid: ${d.gridReq} kWh`}
                  >
                    {/* Hover Value Tooltip on Peak */}
                    {isPeak && (
                      <span
                        style={{
                          position: "absolute",
                          top: -24,
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--brand-700)",
                          background: "var(--brand-50)",
                          padding: "2px 6px",
                          borderRadius: 4,
                          whiteSpace: "nowrap"
                        }}
                      >
                        Peak {d.demand} kWh
                      </span>
                    )}

                    {/* Stacked Bar (Grid on top, Solar on bottom) */}
                    <div
                      style={{
                        width: "100%",
                        height: `${totalHeightPct}%`,
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "4px 4px 0 0",
                        overflow: "hidden",
                        border: isPeak ? "1.5px solid var(--brand-600)" : "none"
                      }}
                    >
                      {/* Grid segment */}
                      <div
                        style={{
                          height: `${(d.gridReq / d.demand) * 100}%`,
                          background: "rgba(239, 68, 68, 0.85)",
                          transition: "height 0.4s ease"
                        }}
                      />
                      {/* Solar segment */}
                      <div
                        style={{
                          height: `${(d.solarUsed / d.demand) * 100}%`,
                          background: "rgba(16, 185, 129, 0.9)",
                          transition: "height 0.4s ease"
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Hour Labels */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(24, minmax(36px, 1fr))",
                gap: 6,
                padding: "8px 8px 0",
                fontSize: 10,
                color: "var(--gray-500)",
                textAlign: "center"
              }}
            >
              {diurnalData.map(d => (
                <span key={d.hour}>{d.hour.split(":")[0]}</span>
              ))}
            </div>
          </div>

          {/* Diurnal Insights Box */}
          <div style={{ marginTop: 20, padding: 16, background: "var(--gray-50)", borderRadius: "var(--radius)", border: "1px solid var(--gray-200)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-800)", marginBottom: 6 }}>
              💡 Dispatch Synergy Observation:
            </div>
            <div style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: 1.6 }}>
              Notice how building electrical demand ramps sharply from <strong>08:00 to 14:00</strong> as HVAC cooling loads,
              workstations, and lighting activate. This curve aligns almost synchronously with the rooftop solar generation profile,
              allowing clean energy to shave peak utility grid tariffs right when electricity demand is highest.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOLAR CAPACITY SENSITIVITY & WHAT-IF SCALING */}
      {activeTab === "scaling" && (
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Solar Capacity Scaling &amp; Grid Abatement Curve</div>
              <div className="card-subtitle">
                Sensitivity analysis showing how adding solar photovoltaic capacity reduces grid dependence toward net-zero
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {scalingData.map(step => (
              <div
                key={step.label}
                style={{
                  padding: "16px 20px",
                  background: step.isCurrent ? "var(--brand-50)" : "var(--surface)",
                  borderRadius: "var(--radius)",
                  border: step.isCurrent ? "2px solid var(--brand-500)" : "1px solid var(--gray-200)",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: step.isCurrent ? "var(--brand-700)" : "var(--gray-800)" }}>
                      {step.label}
                    </span>
                    {step.isCurrent && (
                      <span className="building-type-badge" style={{ marginLeft: 10, background: "var(--brand-600)", color: "#fff" }}>
                        CURRENT SETUP
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    <span style={{ color: "var(--green)" }}>☀️ Solar: {step.solarUsed} kWh</span>
                    <span style={{ margin: "0 8px", color: "var(--gray-300)" }}>|</span>
                    <span style={{ color: step.gridReq === 0 ? "var(--green)" : "var(--red)" }}>
                      🔌 Grid: {step.gridReq} kWh
                    </span>
                    <span style={{ margin: "0 8px", color: "var(--gray-300)" }}>|</span>
                    <span style={{ color: "var(--brand-600)" }}>Renewable: {step.renewPct}%</span>
                  </div>
                </div>

                {/* Split Bar Representation */}
                <div style={{ height: 12, background: "var(--gray-100)", borderRadius: 6, overflow: "hidden", display: "flex" }}>
                  <div
                    style={{
                      width: `${step.renewPct}%`,
                      background: "var(--green)",
                      transition: "width 0.6s ease"
                    }}
                    title={`Solar Contribution: ${step.renewPct}%`}
                  />
                  <div
                    style={{
                      width: `${100 - step.renewPct}%`,
                      background: "var(--red)",
                      transition: "width 0.6s ease"
                    }}
                    title={`Grid Dependency: ${(100 - step.renewPct).toFixed(1)}%`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="recommendation-box" style={{ marginTop: 20 }}>
            🎯 <strong>Capacity Optimization Rule:</strong> For this {peakDemand} kWh scenario, scaling the rooftop solar installation from{" "}
            <strong>{currentSolar} kW</strong> to <strong>{Math.ceil(peakDemand)} kW</strong> achieves complete 100% solar self-sufficiency during peak hours,
            reducing grid demand charges to exactly zero.
          </div>
        </div>
      )}

      {/* TAB 3: WEATHER SCENARIO SENSITIVITY */}
      {activeTab === "weather" && (
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Weather Condition Impact on Energy Balance</div>
              <div className="card-subtitle">
                How cloud cover, temperature changes, and rainfall alter both demand load and clean solar output
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {weatherData.map(w => (
              <div
                key={w.name}
                style={{
                  background: "var(--surface)",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: "var(--radius)",
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>{w.emoji}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--gray-900)" }}>{w.name}</div>
                      <div style={{ fontSize: 11, color: "var(--gray-500)" }}>{w.desc}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: 12, marginTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: "var(--gray-600)" }}>Demand Load:</span>
                      <strong style={{ color: "var(--blue)" }}>{w.demand} kWh</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: "var(--gray-600)" }}>Solar Generation:</span>
                      <strong style={{ color: "var(--solar)" }}>{w.solar} kWh</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: "var(--gray-600)" }}>Grid Import:</span>
                      <strong style={{ color: "var(--red)" }}>{w.gridReq} kWh</strong>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    <span style={{ color: "var(--gray-500)" }}>Renewable Coverage</span>
                    <span style={{ color: "var(--green)" }}>{w.renewPct}%</span>
                  </div>
                  <div style={{ height: 8, background: "var(--gray-100)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${w.renewPct}%`, height: "100%", background: "var(--green)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
