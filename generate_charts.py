import matplotlib.pyplot as plt
import numpy as np

# Set standard academic style
plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif']
plt.rcParams['font.size'] = 9

# Chart 1: Model Benchmark Comparison (R², RMSE, MAE)
fig, ax1 = plt.subplots(figsize=(4.8, 3.2), dpi=300)
models = ['Random Forest', 'XGBoost', 'LightGBM']
r2_scores = [0.9709, 0.9581, 0.8858]
rmse_vals = [43.73, 52.54, 86.68]
mae_vals = [16.00, 24.02, 48.72]

x = np.arange(len(models))
width = 0.26

rects1 = ax1.bar(x - width, r2_scores, width, label='R² Score', color='#1f77b4', edgecolor='black', linewidth=0.6)
ax1.set_ylabel('R² Score', color='#1f77b4', fontweight='bold')
ax1.set_ylim(0.75, 1.02)
ax1.tick_params(axis='y', labelcolor='#1f77b4')

ax2 = ax1.twinx()
rects2 = ax2.bar(x, rmse_vals, width, label='RMSE (kWh)', color='#ff7f0e', edgecolor='black', linewidth=0.6)
rects3 = ax2.bar(x + width, mae_vals, width, label='MAE (kWh)', color='#2ca02c', edgecolor='black', linewidth=0.6)
ax2.set_ylabel('Error (kWh)', color='#333333', fontweight='bold')
ax2.set_ylim(0, 100)

ax1.set_xticks(x)
ax1.set_xticklabels(models, fontweight='bold')
ax1.set_title('Comparative Model Performance Benchmarks', fontweight='bold', pad=10)
ax1.grid(axis='y', linestyle='--', alpha=0.4)

# Combined legend
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left', framealpha=0.9, fontsize=8)

plt.tight_layout()
plt.savefig('fig_model_comparison.png', dpi=300)
plt.close()
print('Chart 1 created: fig_model_comparison.png')

# Chart 2: Solar Capacity Scaling & Sensitivity Analysis
fig, ax1 = plt.subplots(figsize=(4.8, 3.2), dpi=300)
solar_capacities = [25, 50, 75, 100, 125, 150, 177.1, 200]
demand = 177.1
solar_used = [min(demand, s) for s in solar_capacities]
grid_req = [max(demand - s, 0) for s in solar_capacities]
renew_pct = [(u / demand) * 100 for u in solar_used]

ax1.plot(solar_capacities, grid_req, 'ro-', linewidth=1.8, markersize=5, label='Grid Required (kWh)')
ax1.set_xlabel('Solar PV Capacity (kW / kWh)', fontweight='bold')
ax1.set_ylabel('Grid Import Required (kWh)', color='darkred', fontweight='bold')
ax1.tick_params(axis='y', labelcolor='darkred')
ax1.set_ylim(-5, 170)
ax1.grid(True, linestyle='--', alpha=0.4)

ax2 = ax1.twinx()
ax2.plot(solar_capacities, renew_pct, 'gs--', linewidth=1.8, markersize=5, label='Renewable Contribution (%)')
ax2.set_ylabel('Clean Energy Contribution (%)', color='darkgreen', fontweight='bold')
ax2.tick_params(axis='y', labelcolor='darkgreen')
ax2.set_ylim(0, 110)

# Annotate case study operating point (100 kW)
ax1.axvline(x=100, color='blue', linestyle=':', linewidth=1.2, label='Current Campus Setup (100 kW)')
ax1.scatter([100], [77.1], color='red', s=60, zorder=5)
ax1.annotate('100 kW: 77.1 kWh Grid\n(56.47% Solar)', xy=(100, 77.1), xytext=(115, 95),
             arrowprops=dict(arrowstyle='->', color='black', lw=0.8), fontsize=7.5, fontweight='bold',
             bbox=dict(boxstyle='round,pad=0.2', facecolor='yellow', alpha=0.4))

ax1.set_title('Solar Capacity Scaling vs. Grid Import & Renewable %', fontweight='bold', pad=10)
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='center right', framealpha=0.9, fontsize=7.5)

plt.tight_layout()
plt.savefig('fig_solar_scaling.png', dpi=300)
plt.close()
print('Chart 2 created: fig_solar_scaling.png')

# Chart 3: 24-Hour Diurnal Load vs. Solar Generation Profile
fig, ax = plt.subplots(figsize=(4.8, 3.2), dpi=300)
hours = np.arange(0, 24)
# Realistic campus demand curve (baseload at night ~65 kWh, ramp up at 08:00, peak afternoon ~177.1 kWh, tapering off after 18:00)
base_demand = np.array([65, 62, 60, 58, 60, 68, 85, 110, 145, 165, 172, 176, 174, 175, 177.1, 170, 155, 135, 110, 95, 82, 75, 70, 66])
# Solar generation bell curve peaking at 14:00 (100 kWh)
solar_gen = np.array([0, 0, 0, 0, 0, 0, 5, 20, 45, 70, 88, 98, 99, 100, 96, 85, 60, 30, 8, 0, 0, 0, 0, 0])
solar_used = np.minimum(base_demand, solar_gen)
grid_req = np.maximum(base_demand - solar_used, 0)

ax.plot(hours, base_demand, 'b-', linewidth=2, label='Predicted Demand (kWh)')
ax.plot(hours, solar_gen, 'y--', linewidth=1.8, label='Solar Generation (kWh)')
ax.fill_between(hours, 0, solar_used, color='#2ca02c', alpha=0.35, label='Solar Power Used')
ax.fill_between(hours, solar_used, base_demand, color='#d62728', alpha=0.25, label='Grid Power Required')

ax.set_xlabel('Hour of Day (24-Hour Cycle)', fontweight='bold')
ax.set_ylabel('Energy (kWh)', fontweight='bold')
ax.set_xticks(np.arange(0, 24, 3))
ax.set_xticklabels(['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'])
ax.set_ylim(0, 200)
ax.set_title('24-Hour Diurnal Energy Dispatch Profile (Campus)', fontweight='bold', pad=10)
ax.grid(True, linestyle='--', alpha=0.4)
ax.legend(loc='upper left', framealpha=0.9, fontsize=8)

plt.tight_layout()
plt.savefig('fig_diurnal_curve.png', dpi=300)
plt.close()
print('Chart 3 created: fig_diurnal_curve.png')
