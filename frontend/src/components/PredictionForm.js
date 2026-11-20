import React, { useState, useEffect, useMemo, useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { predictEnergy } from "../services/api";
import buildingsData from "../data/buildings.json";

const WEATHER_OPTIONS = [
  { label: "Sunny",        emoji: "☀️",  value: "Sunny" },
  { label: "Partly Cloudy",emoji: "⛅",  value: "Partly Cloudy" },
  { label: "Cloudy",       emoji: "☁️",  value: "Cloudy" },
  { label: "Rainy",        emoji: "🌧️",  value: "Rainy" },
];

export default function PredictionForm({ onResult }) {
  const { token } = useContext(AuthContext);
  const location = useLocation();

  const [mode, setMode]               = useState("dataset");
  const [selectedBuildingId, setSelId]= useState("");
  const [searchQuery, setSearch]      = useState("");
  const [customName, setCustomName]   = useState("");
  const [customType, setCustomType]   = useState("Education");
  const [customSqm, setCustomSqm]     = useState(1000);

  // User-registered buildings state
  const [userBuildings, setUserBuildings] = useState(() => {
    try {
      const cached = localStorage.getItem("user_buildings");
      return cached ? JSON.parse(cached) : [];
    } catch (_) {
      return [];
    }
  });

  const today = new Date();
  const [dateStr, setDateStr] = useState(today.toISOString().split("T")[0]);
  const [timeStr, setTimeStr] = useState("12:00");

  const [airTemp, setAirTemp]         = useState(22);
  const [condition, setCondition]     = useState("Partly Cloudy");
  const [solarAvail, setSolarAvail]   = useState(80);

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  // Fetch latest user buildings from backend on mount or when token updates
  useEffect(() => {
    const fetchUserBuildings = async () => {
      const authToken = token || localStorage.getItem("token");
      if (!authToken) return;
      try {
        const res = await fetch("http://127.0.0.1:8000/buildings/", {
          headers: { token: authToken }
        });
        if (res.ok) {
          const data = await res.json();
          setUserBuildings(data);
          localStorage.setItem("user_buildings", JSON.stringify(data));
        }
      } catch (err) {
        console.warn("Could not fetch user buildings:", err);
      }
    };
    fetchUserBuildings();
  }, [token]);

  // Format user-registered buildings to merge smoothly with dataset buildings
  const formattedUserBuildings = useMemo(() => {
    return userBuildings.map(ub => ({
      id: `user_${ub.id}`,
      db_id: ub.id,
      is_user_building: true,
      name: ub.name,
      display_name: `⭐ ${ub.name} (${ub.building_type}) — My Building`,
      site_id: "Custom",
      primaryspaceusage: ub.building_type,
      sqm: Number(ub.area),
      occupancy: ub.occupancy,
      solar_capacity: ub.solar_capacity ? Number(ub.solar_capacity) : null
    }));
  }, [userBuildings]);

  // All buildings with user's buildings given first priority
  const allBuildings = useMemo(() => {
    return [...formattedUserBuildings, ...buildingsData];
  }, [formattedUserBuildings]);

  // If navigated here with a pre-selected building from My Buildings page
  useEffect(() => {
    if (location.state?.buildingId) {
      setSelId(location.state.buildingId);
      setMode("dataset");
      if (location.state.building?.solar_capacity) {
        setSolarAvail(Number(location.state.building.solar_capacity));
      }
    }
  }, [location.state]);

  // Filter user buildings by search query (checks name, type, and display title)
  const filteredUserBuildings = useMemo(() => {
    if (!searchQuery.trim()) return formattedUserBuildings;
    const q = searchQuery.toLowerCase().trim();
    return formattedUserBuildings.filter(b => {
      const nameMatch = b.name && b.name.toLowerCase().includes(q);
      const displayMatch = b.display_name && b.display_name.toLowerCase().includes(q);
      const usageMatch = b.primaryspaceusage && b.primaryspaceusage.toLowerCase().includes(q);
      return nameMatch || displayMatch || usageMatch;
    });
  }, [formattedUserBuildings, searchQuery]);

  // Filter dataset buildings by search query
  const filteredDatasetBuildings = useMemo(() => {
    if (!searchQuery.trim()) return buildingsData.slice(0, 80);
    const q = searchQuery.toLowerCase().trim();
    return buildingsData.filter(b => {
      const displayMatch = b.display_name && b.display_name.toLowerCase().includes(q);
      const usageMatch = b.primaryspaceusage && b.primaryspaceusage.toLowerCase().includes(q);
      const idMatch = b.id && b.id.toLowerCase().includes(q);
      return displayMatch || usageMatch || idMatch;
    }).slice(0, 80);
  }, [searchQuery]);

  const selectedBuilding = useMemo(() => {
    return allBuildings.find(b => b.id === selectedBuildingId);
  }, [allBuildings, selectedBuildingId]);

  const uniqueTypes = useMemo(() =>
    Array.from(new Set(buildingsData.map(b => b.primaryspaceusage))).sort(), []);

  const handleBuildingChange = (id) => {
    setSelId(id);
    const b = allBuildings.find(item => item.id === id);
    if (b && b.solar_capacity && Number(b.solar_capacity) > 0) {
      setSolarAvail(Number(b.solar_capacity));
    }
  };

  const loadDemo = () => {
    setMode("dataset");
    setSelId(buildingsData[2].id);
    setAirTemp(25);
    setCondition("Sunny");
    setSolarAvail(150);
    setDateStr("2026-10-15");
    setTimeStr("14:00");
  };

  const normalizeUsage = (usage) => {
    if (!usage) return "Office";
    if (usage.toLowerCase().includes("residential") || usage.toLowerCase().includes("lodging")) {
      return "Lodging/residential";
    }
    if (usage.toLowerCase().includes("assembly") || usage.toLowerCase().includes("entertainment")) {
      return "Entertainment/public assembly";
    }
    const match = uniqueTypes.find(t => t.toLowerCase() === usage.toLowerCase());
    return match || usage;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");

    try {
      const dt     = new Date(`${dateStr}T${timeStr}`);
      const hour   = dt.getHours();
      const day    = dt.getDate();
      const month  = dt.getMonth() + 1;
      const year   = dt.getFullYear();
      const dow    = dt.getDay() === 0 ? 6 : dt.getDay() - 1;
      const isWeek = (dt.getDay() === 0 || dt.getDay() === 6) ? 1 : 0;

      let b_id, s_id, p_usage, b_sqm, display_title;

      if (mode === "custom") {
        const targetUsage = normalizeUsage(customType);
        const rep = buildingsData.find(b => b.primaryspaceusage === targetUsage) || buildingsData[0];
        b_id = rep.id;
        s_id = rep.site_id;
        p_usage = targetUsage;
        b_sqm = Number(customSqm);
        display_title = customName || "My Custom Building";
      } else {
        if (!selectedBuilding) {
          setError("Please select a building from the list.");
          setLoading(false);
          return;
        }

        if (selectedBuilding.is_user_building) {
          const targetUsage = normalizeUsage(selectedBuilding.primaryspaceusage);
          const rep = buildingsData.find(b => b.primaryspaceusage === targetUsage) || buildingsData[0];
          b_id = rep.id;
          s_id = rep.site_id;
          p_usage = targetUsage;
          b_sqm = Number(selectedBuilding.sqm);
          display_title = selectedBuilding.name || selectedBuilding.display_name;
        } else {
          b_id = selectedBuilding.id;
          s_id = selectedBuilding.site_id;
          p_usage = selectedBuilding.primaryspaceusage;
          b_sqm = Number(selectedBuilding.sqm);
          display_title = selectedBuilding.display_name;
        }
      }

      const result = await predictEnergy({
        building_id: b_id,
        site_id: s_id,
        primaryspaceusage: p_usage,
        sqm: b_sqm,
        weather_condition: condition,
        airTemperature: Number(airTemp),
        hour,
        day_of_week: dow,
        month,
        day,
        year,
        is_weekend: isWeek,
        solar_available: Number(solarAvail),
      });

      onResult({ ...result, display_title });
    } catch (err) {
      setError(err.message || "Unable to run energy analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Mode tabs ── */}
      <div className="mode-tabs">
        <button
          type="button"
          className={`mode-tab${mode === "dataset" ? " active" : ""}`}
          onClick={() => setMode("dataset")}
        >
          Select Building {userBuildings.length > 0 ? `(${userBuildings.length} saved)` : ""}
        </button>
        <button
          type="button"
          className={`mode-tab${mode === "custom" ? " active" : ""}`}
          onClick={() => setMode("custom")}
        >
          Quick Custom
        </button>
        <button type="button" className="mode-tab demo" onClick={loadDemo}>
          ✦ Demo
        </button>
      </div>

      {/* ── Building Selection ── */}
      <div className="form-section">
        <div className="form-section-title">
          {mode === "dataset" ? "Choose Building" : "Quick Custom Building"}
        </div>

        {mode === "dataset" ? (
          <>
            {/* Quick badge pills for user's registered buildings */}
            {userBuildings.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-700)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                  ⭐ My Saved Buildings:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {formattedUserBuildings.map(b => (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => handleBuildingChange(b.id)}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "5px 12px",
                        borderRadius: "var(--radius-full)",
                        border: selectedBuildingId === b.id ? "1.5px solid var(--brand-600)" : "1px solid var(--brand-200)",
                        background: selectedBuildingId === b.id ? "var(--brand-600)" : "var(--brand-50)",
                        color: selectedBuildingId === b.id ? "#fff" : "var(--brand-800)",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      🏢 {b.name} ({b.primaryspaceusage})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Input */}
            <div className="field-group" style={{ marginBottom: 10 }}>
              <input
                className="field-input"
                type="text"
                placeholder="🔍  Search by name or type (e.g. Education, Anurag, Library)…"
                value={searchQuery}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Dropdown with Optgroups */}
            <div className="field-group">
              <select
                className="field-input"
                value={selectedBuildingId}
                onChange={e => handleBuildingChange(e.target.value)}
                required={mode === "dataset"}
              >
                <option value="" disabled>Select a building from list…</option>

                {filteredUserBuildings.length > 0 && (
                  <optgroup label="⭐ My Registered Buildings">
                    {filteredUserBuildings.map(b => (
                      <option key={b.id} value={b.id}>
                        ⭐ {b.name} ({b.primaryspaceusage}) — {Number(b.sqm).toLocaleString()} m²
                      </option>
                    ))}
                  </optgroup>
                )}

                {filteredDatasetBuildings.length > 0 && (
                  <optgroup label="📚 Dataset Reference Buildings">
                    {filteredDatasetBuildings.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.display_name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {filteredUserBuildings.length === 0 && filteredDatasetBuildings.length === 0 && (
                  <option value="" disabled>
                    No buildings matching "{searchQuery}"
                  </option>
                )}
              </select>
            </div>

            {/* Info Pill of selected building */}
            {selectedBuilding && (
              <div className="building-info-pill" style={{ marginTop: 12, flexWrap: "wrap", borderLeft: selectedBuilding.is_user_building ? "4px solid var(--solar)" : undefined }}>
                {selectedBuilding.is_user_building && (
                  <>
                    <span className="info-pill-item" style={{ color: "var(--brand-800)", fontWeight: 800 }}>
                      ⭐ My Building
                    </span>
                    <span className="info-pill-sep">·</span>
                  </>
                )}
                <span className="info-pill-item">
                  <strong>Type:</strong> {selectedBuilding.primaryspaceusage}
                </span>
                <span className="info-pill-sep">·</span>
                <span className="info-pill-item">
                  <strong>Area:</strong> {Number(selectedBuilding.sqm).toLocaleString()} m²
                </span>
                {selectedBuilding.solar_capacity && (
                  <>
                    <span className="info-pill-sep">·</span>
                    <span className="info-pill-item" style={{ color: "var(--green)", fontWeight: 700 }}>
                      <strong>Solar:</strong> {selectedBuilding.solar_capacity} kW
                    </span>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="form-row form-row-2">
            <div className="field-group" style={{ gridColumn: "1 / -1" }}>
              <label className="field-label">Building Name</label>
              <input
                className="field-input"
                type="text"
                placeholder="e.g. Green Valley College"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                required={mode === "custom"}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Building Type</label>
              <select
                className="field-input"
                value={customType}
                onChange={e => setCustomType(e.target.value)}
              >
                {uniqueTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Floor Area (m²)</label>
              <input
                className="field-input"
                type="number"
                min="10"
                value={customSqm}
                onChange={e => setCustomSqm(e.target.value)}
                required={mode === "custom"}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Date & Time ── */}
      <div className="form-section">
        <div className="form-section-title">Analysis Timeframe</div>
        <div className="form-row form-row-2">
          <div className="field-group">
            <label className="field-label">Date</label>
            <input
              className="field-input-date"
              type="date"
              value={dateStr}
              onChange={e => setDateStr(e.target.value)}
              required
            />
          </div>
          <div className="field-group">
            <label className="field-label">Time</label>
            <input
              className="field-input-date"
              type="time"
              value={timeStr}
              onChange={e => setTimeStr(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* ── Weather & Solar ── */}
      <div className="form-section">
        <div className="form-section-title">Conditions &amp; Supply</div>

        <div className="field-group" style={{ marginBottom: 14 }}>
          <label className="field-label">Temperature (°C)</label>
          <input
            className="field-input"
            type="number"
            step="any"
            value={airTemp}
            onChange={e => setAirTemp(e.target.value)}
            required
          />
        </div>

        <div className="field-group" style={{ marginBottom: 14 }}>
          <label className="field-label">Weather Condition</label>
          <div className="weather-grid">
            {WEATHER_OPTIONS.map(opt => (
              <button
                type="button"
                key={opt.value}
                className={`weather-btn${condition === opt.value ? " active" : ""}`}
                onClick={() => setCondition(opt.value)}
              >
                <span className="weather-emoji">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Available Solar Generation (kWh)</label>
          <input
            className="field-input"
            type="number"
            min="0"
            step="any"
            value={solarAvail}
            onChange={e => setSolarAvail(e.target.value)}
            required
          />
          <span style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 4, display: "block" }}>
            Estimated renewable energy available for this building and time period.
          </span>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={loading || (mode === "dataset" && !selectedBuilding)}
      >
        {loading ? <><span className="spinner"></span> Analysing building energy…</> : "⚡ RUN ENERGY ANALYSIS"}
      </button>
    </form>
  );
}
