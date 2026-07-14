from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import hash_password

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@router.post("/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        hashed = hash_password(user.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user