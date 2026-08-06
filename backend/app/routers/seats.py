from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.redis_client import get_cache, set_cache
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/seats", tags=["seats"])

@router.get("/", response_model=list[schemas.SeatOut])
def list_seats(db: Session = Depends(get_db)):
    cached = get_cache("all_seats")
    if cached:
        return cached

    seats = db.query(models.Seat).all()
    result = [schemas.SeatOut.model_validate(s).model_dump() for s in seats]
    set_cache("all_seats", result, ttl_seconds=300)
    return result
    
@router.get("/{seat_id}", response_model=schemas.SeatOut)
def get_seat(seat_id: int, db: Session = Depends(get_db)):
    seat = db.query(models.Seat).filter(models.Seat.id == seat_id).first()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    return seat

@router.delete("/{seat_id}")
def delete_seat(seat_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    seat = db.query(models.Seat).filter(models.Seat.id == seat_id).first()
    active_booking = db.query(models.EventSeat).join(models.BookingSeat).join(models.Booking).filter(
    models.EventSeat.seat_id == seat_id,
    models.Booking.booking_status == "confirmed"
    ).first()

    if active_booking:
        raise HTTPException(status_code=400, detail="Cannot delete seat with active confirmed booking")
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")

    event_seat_ids = db.query(models.EventSeat.id).filter(models.EventSeat.seat_id == seat_id).subquery()
    db.query(models.BookingSeat).filter(models.BookingSeat.event_seat_id.in_(event_seat_ids)).delete(synchronize_session=False)
    db.query(models.EventSeat).filter(models.EventSeat.seat_id == seat_id).delete(synchronize_session=False)
    db.delete(seat)
    db.commit()

    delete_cache("all_seats")

    return {"detail": f"Seat {seat_id} deleted"}