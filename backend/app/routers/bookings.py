from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/", response_model=schemas.BookingOut)
def book_seat(request: schemas.BookingRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Step 1: Check if seat is available
    event_seat = db.query(models.EventSeat).filter(
        models.EventSeat.id == request.event_seat_id
    ).with_for_update().first()

    if not event_seat:
        raise HTTPException(status_code=404, detail="Seat not found")

    if event_seat.seat_status != "available":
        raise HTTPException(status_code=400, detail="Seat already booked")

    # Step 2: Mark seat as booked
    event_seat.seat_status = "booked"
    db.commit()

    # Step 3: Create booking record
    new_booking = models.Booking(user_id=current_user.id, booking_status="confirmed")
    db.add(new_booking)
    db.flush()  # booking.id chahiye BookingSeat ke liye

    # Price nikaalo seat ki category se
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