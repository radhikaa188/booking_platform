from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/screens", tags=["screens"])

@router.get("/", response_model=list[schemas.ScreenOut])
def list_screens(db: Session = Depends(get_db)):
    return db.query(models.Screen).all()

@router.post("/", response_model=schemas.ScreenOut)
def create_screen(screen: schemas.ScreenCreate, db: Session = Depends(get_db)):
    new_screen = models.Screen(**screen.model_dump())
    db.add(new_screen)
    db.commit()
    db.refresh(new_screen)
    return new_screen