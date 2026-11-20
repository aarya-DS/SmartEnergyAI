import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const TYPES = ["Residential","Office","Education","Retail","Healthcare","Lodging/residential","Entertainment/public assembly","Technology/science","Warehouse/storage","Other"];

function BuildingCard({ b, onDelete }) {
  const navigate = useNavigate();
  const solarLabel = b.solar_capacity ? `${b.solar_capacity} kW` : "None installed";

  return (
    <div className="building-card">
      <div className="building-card-header">
        <div className="building-type-badge">🏢 {b.building_type}</div>
        <div className="building-card-name">{b.name}</div>
      </div>
      <div className="building-card-body">
        <div className="building-stat">
          <span className="building-stat-label">Floor Area</span>
          <span className="building-stat-value">{Number(b.area).toLocaleString()} m²</span>
        </div>
        {b.occupancy && (
          <div className="building-stat">
            <span className="building-stat-label">Occupancy</span>
            <span className="building-stat-value">{b.occupancy} people</span>
          </div>
        )}
        <div className="building-stat">
          <span className="building-stat-label">Solar Capacity</span>
          <span className="building-stat-value" style={{ color: b.solar_capacity ? "var(--green)" : "var(--gray-400)" }}>
            {solarLabel}
          </span>
        </div>
      </div>
      <div className="building-card-footer">
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={() => navigate("/analysis", { state: { buildingId: `user_${b.id}`, building: b } })}
        >
          ⚡ Analyse
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(b.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default function MyBuildings() {
  const { token } = useContext(AuthContext);
  const [buildings, setBuildings]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);

  const [name, setName]       = useState("");
  const [type, setType]       = useState("Education");
  const [area, setArea]       = useState("");
  const [occ, setOcc]         = useState("");
  const [solar, setSolar]     = useState("");
  const [saving, setSaving]   = useState(false);

  const fetch_ = React.useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/buildings/", { headers: { token } });
      if (res.ok) {
        const data = await res.json();
        setBuildings(data);
        localStorage.setItem("user_buildings", JSON.stringify(data));
      }
    } catch (_) {} finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/buildings/", {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({
          name, building_type: type, area: Number(area),
          occupancy: occ ? Number(occ) : null,
          solar_capacity: solar ? Number(solar) : null,
        })
      });
      if (res.ok) {
        setShowForm(false); setName(""); setArea(""); setOcc(""); setSolar("");
        fetch_();
      }
    } catch (_) {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this building?")) return;
    await fetch(`http://127.0.0.1:8000/buildings/${id}`, { method: "DELETE", headers: { token } });
    fetch_();
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>My Buildings</h1>
          <p>Register and manage your buildings for personalised energy analysis.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? "✕ Cancel" : "+ Add Building"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form className="card card-pad" style={{ marginBottom: 24 }} onSubmit={handleAdd}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-800)", marginBottom: 20 }}>
            New Building
          </div>
          <div className="form-row form-row-2" style={{ marginBottom: 14 }}>
            <div className="field-group" style={{ gridColumn: "1 / -1" }}>
              <label className="field-label">Building Name *</label>
              <input className="field-input" type="text" placeholder="e.g. Main Campus Library"
                value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="field-group">
              <label className="field-label">Building Type *</label>
              <select className="field-input" value={type} onChange={e => setType(e.target.value)}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Floor Area (m²) *</label>
              <input className="field-input" type="number" min="1" placeholder="e.g. 5000"
                value={area} onChange={e => setArea(e.target.value)} required />
            </div>
            <div className="field-group">
              <label className="field-label">Occupancy (optional)</label>
              <input className="field-input" type="number" min="1" placeholder="e.g. 400"
                value={occ} onChange={e => setOcc(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">Solar Capacity kW (optional)</label>
              <input className="field-input" type="number" min="0" placeholder="e.g. 80"
                value={solar} onChange={e => setSolar(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-green" type="submit" disabled={saving}>
            {saving ? "Saving…" : "✓ Save Building"}
          </button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--gray-400)" }}>Loading buildings…</div>
      ) : buildings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <div className="empty-title">No buildings yet</div>
          <div className="empty-desc">
            Register your first building to get personalised energy forecasts and solar optimisation.
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Your First Building</button>
        </div>
      ) : (
        <div className="building-grid">
          {buildings.map(b => <BuildingCard key={b.id} b={b} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
