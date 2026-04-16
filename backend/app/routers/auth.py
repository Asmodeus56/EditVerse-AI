from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.app.db.database import get_db
from backend.app.db.models import User
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.routers.jobs import get_current_user_id # Re-use the dependency we fixed!


router = APIRouter()

# --- SCHEMAS (Put here for simplicity, or move to schemas.py) ---
class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- ENDPOINTS ---

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Create new user
    hashed_pw = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 3. Return Token immediately so they are logged in
    access_token = create_access_token(data={"sub": str(new_user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Find user
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # 2. Verify password
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # 3. Generate Token
    access_token = create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_current_user_profile(
    user_id: int = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return the user info (You can customize this!)
    return {
        "id": user.id,
        "email": user.email,
        # If you don't have a 'name' column yet, we'll generate one from the email
        "name": user.email.split("@")[0].capitalize(),
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.email}"
    }