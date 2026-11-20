import pandas as pd
import json
import joblib

df = pd.read_csv('d:/AIRenewableEnergyOptimization/data/raw/metadata.csv')
df = df.dropna(subset=['building_id', 'site_id', 'primaryspaceusage', 'sqm'])

label_encoders = joblib.load('d:/AIRenewableEnergyOptimization/models/label_encoders.pkl')
valid_buildings = set(label_encoders['building_id'].classes_)

buildings = []
for _, row in df.iterrows():
    b_id = row['building_id']
    if b_id not in valid_buildings:
        continue
        
    parts = b_id.split('_')
    if len(parts) >= 3:
        site = parts[0].capitalize()
        usage = parts[1].capitalize()
        name = ' '.join(parts[2:]).capitalize()
        display_name = f"{usage} Building - {name} ({site})"
    else:
        display_name = b_id

    buildings.append({
        'id': b_id,
        'display_name': display_name,
        'site_id': row['site_id'],
        'primaryspaceusage': row['primaryspaceusage'],
        'sqm': row['sqm']
    })

with open('d:/AIRenewableEnergyOptimization/frontend/src/data/buildings.json', 'w') as f:
    json.dump(buildings, f)

print(f'Saved {len(buildings)} valid buildings.')
