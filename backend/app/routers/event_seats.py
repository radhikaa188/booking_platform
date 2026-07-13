from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/events", tags=["event_seats"])

@router.get("/{event_id}/seats", response_model=list[schemas.EventSeatOut])
def list_event_seats(event_id: int, db: Session = Depends(get_db)):
    return db.query(models.EventSeat).filter(models.EventSeat.event_id == event_id).all()