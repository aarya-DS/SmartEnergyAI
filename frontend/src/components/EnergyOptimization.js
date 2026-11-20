import React from "react";

function EnergyOptimization({ result }) {
  if (!result) return null;

  const optimization = result.optimization;
  const solarWidth = `${optimization.solar_percentage}%`;
  const gridWidth = `${optimization.grid_percentage}%`;

  return (
    <div className="result-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Supply allocation</p>

          <h2>Energy Optimization</h2>
        </div>
      </div>

      <div className="optimization-grid">
        <div className="metric">
          <h3>Predicted Demand</h3>
          <strong>{result.final_predicted_demand} kWh</strong>
        </div>

        <div className="metric">
          <h3>Solar Available</h3>
          <strong>{result.solar_available} kWh</strong>
        </div>

        <div className="metric">
          <h3>Solar Used</h3>
          <strong>{optimization.solar_used} kWh</strong>
        </div>

        <div className="metric">
          <h3>Grid Required</h3>
          <strong>{optimization.grid_required} kWh</strong>
        </div>
      </div>

      <div className="allocation-bar">
        <div className="solar-fill" style={{ width: solarWidth }}></div>
        <div className="grid-fill" style={{ width: gridWidth }}></div>
      </div>

      <div className="energy-summary">
        <div>
          <span>Solar Contribution</span>
          <strong>{optimization.solar_percentage}%</strong>
        </div>

        <div>
          <span>Grid Contribution</span>
          <strong>{optimization.grid_percentage}%</strong>
        </div>
      </div>
    </div>
  );
}

export default EnergyOptimization;
