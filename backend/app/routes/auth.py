from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import hashlib
import secrets
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# Simple token storage (in-memory for demo purposes)
# In production, use JWT or store sessions in DB
active_sessions = {}

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/signup")
def signup(req: SignupRequest):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)", 
                       (req.full_name, req.email, hash_password(req.password)))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        if "UNIQUE" in str(e):
            raise HTTPException(status_code=400, detail="Email already exists")
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        conn.close()

@router.post("/login")
def login(req: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, full_name, password_hash FROM users WHERE email = ?", (req.email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or user["password_hash"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = secrets.token_hex(16)
    active_sessions[token] = {"user_id": user["id"], "full_name": user["full_name"], "email": req.email}
    
    return {"status": "success", "token": token, "user": active_sessions[token]}

@router.post("/logout")
def logout(token: str):
    if token in active_sessions:
        del active_sessions[token]
    return {"status": "success"}

def get_current_user(token: str = None):
    # This will be used in depends if needed, but for manual verification:
    if token not in active_sessions:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return active_sessions[token]
