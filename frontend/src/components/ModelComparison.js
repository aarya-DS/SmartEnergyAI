import React from "react";

function ModelComparison({ predictions, recommendedModel, allMetrics }) {
  if (!predictions) return null;

  const entries = [
    { label: "Random Forest", key: "random_forest" },
    { label: "XGBoost",       key: "xgboost" },
    { label: "LightGBM",      key: "lightgbm" },
  ];

  const maxPred = Math.max(...entries.map(e => Number(predictions[e.key]) || 0));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--gray-400)", marginBottom: 4 }}>
          Model Ensemble
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-800)" }}>
          Prediction Comparison
        </div>
        <div style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 4 }}>
          The AI engine selected the best-performing model automatically.
        </div>
      </div>

      <div className="model-grid">
        {entries.map(({ label, key }) => {
          const value   = Number(predictions[key]) || 0;
          const metrics = allMetrics?.[key];
          const best    = recommendedModel === key;
          const pct     = maxPred > 0 ? `${Math.max((value / maxPred) * 100, 6)}%` : "0%";

          return (
            <div key={key} className={`model-box${best ? " best" : ""}`}>
              <div className="model-header">
                <span className="model-name">{label}</span>
                {best && <span className="model-badge">✓ Selected</span>}
              </div>
              <div className="model-pred">{value.toFixed(2)} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--gray-400)" }}>kWh</span></div>
              <div className="model-bar-track">
                <div className="model-bar-fill" style={{ width: pct }} />
              </div>
              {metrics && (
                <div className="model-metrics">
                  <div className="metric-pill">
                    <span className="metric-pill-label">R²</span>
                    <span className="metric-pill-value">{metrics.r2.toFixed(4)}</span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">RMSE</span>
                    <span className="metric-pill-value">{metrics.rmse.toFixed(1)}</span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-pill-label">MAE</span>
                    <span className="metric-pill-value">{metrics.mae.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ModelComparison;
