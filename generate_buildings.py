import pandas as pd
import json
import os

df = pd.read_csv('d:/AIRenewableEnergyOptimization/data/raw/metadata.csv')

# Drop nulls in essential columns
df = df.dropna(subset=['building_id', 'site_id', 'primaryspaceusage', 'sqm'])

buildings = []
for _, row in df.iterrows():
    b_id = row['building_id']
    
    # parse the id to make a nice name
    # e.g., Panther_lodging_Dean
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

os.makedirs('d:/AIRenewableEnergyOptimization/frontend/src/data', exist_ok=True)
with open('d:/AIRenewableEnergyOptimization/frontend/src/data/buildings.json', 'w') as f:
    json.dump(buildings, f)

print(f'Saved {len(buildings)} buildings.')
