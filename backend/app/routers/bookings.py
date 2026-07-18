from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

router = APIRouter(prefix="/bookings", tags=["bookings"])

limiter = Limiter(key_func=get_remote_address)

HOLD_DURATION_MINUTES = 5

@router.post("/hold", response_model=schemas.BookingOut)

@limiter.limit("5/minute")

def hold_seat(request: schemas.BookingRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    event_seat = db.query(models.EventSeat).filter(
        models.EventSeat.id == request.event_seat_id
    ).with_for_update().first()

    if not event_seat:
        raise HTTPException(status_code=404, detail="Seat not found")

    if event_seat.seat_status != "available":
        raise HTTPException(status_code=400, detail="Seat not available")

    event_seat.seat_status = "held"
    event_seat.hold_expires_at = datetime.utcnow() + timedelta(minutes=HOLD_DURATION_MINUTES)
    db.commit()

    new_booking = models.Booking(user_id=current_user.id, booking_status="pending")
    db.add(new_booking)
    db.flush()

    seat = db.query(models.Seat).filter(models.Seat.id == event_seat.seat_id).first()
    price_map = {"regular": 150.0, "premium": 300.0, "recliner": 500.0}
    price = price_map.get(seat.seat_category.value, 150.0)

    booking_seat = models.BookingSeat(
        booking_id=new_booking.id,
        event_seat_id=event_seat.id,
        price_paid=price
    )
    db.add(booking_seat)
    db.commit()
    db.refresh(new_booking)

    return new_booking


@router.post("/{booking_id}/confirm", response_model=schemas.BookingOut)
def confirm_booking(booking_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking or booking.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.booking_status != "pending":
        raise HTTPException(status_code=400, detail="Booking cannot be confirmed")

    booking_seat = db.query(models.BookingSeat).filter(models.BookingSeat.booking_id == booking_id).first()
    event_seat = db.query(models.EventSeat).filter(
        models.EventSeat.id == booking_seat.event_seat_id
    ).with_for_update().first()

    if event_seat.seat_status != "held":
        raise HTTPException(status_code=400, detail="Hold has expired")

    event_seat.seat_status = "booked"
    event_seat.hold_expires_at = None
    booking.booking_status = "confirmed"
    db.commit()
    db.refresh(booking)

    return booking