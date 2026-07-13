from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@router.post("/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=user.password  # ⚠️ placeholder — real hashing comes in Phase 4
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user