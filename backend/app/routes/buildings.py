from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.routes.auth import get_current_user

router = APIRouter(prefix="/buildings", tags=["Buildings"])

class BuildingCreate(BaseModel):
    name: str
    building_type: str
    area: float
    occupancy: Optional[int] = None
    solar_capacity: Optional[float] = None

@router.get("/")
def get_user_buildings(token: str = Header(None)):
    user = get_current_user(token)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM buildings WHERE user_id = ?", (user["user_id"],))
    buildings = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return buildings

@router.post("/")
def create_building(building: BuildingCreate, token: str = Header(None)):
    user = get_current_user(token)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO buildings (user_id, name, building_type, area, occupancy, solar_capacity)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user["user_id"], building.name, building.building_type, building.area, building.occupancy, building.solar_capacity))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"status": "success", "id": new_id}

@router.delete("/{building_id}")
def delete_building(building_id: int, token: str = Header(None)):
    user = get_current_user(token)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM buildings WHERE id = ? AND user_id = ?", (building_id, user["user_id"]))
    conn.commit()
    conn.close()
    return {"status": "success"}
