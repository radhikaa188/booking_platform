from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/seats", tags=["seats"])

@router.get("/", response_model=list[schemas.SeatOut])
def list_seats(db: Session = Depends(get_db)):
    return db.query(models.Seat).all()

@router.get("/{seat_id}", response_model=schemas.SeatOut)
def get_seat(seat_id: int, db: Session = Depends(get_db)):
    seat = db.query(models.Seat).filter(models.Seat.id == seat_id).first()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    return seat