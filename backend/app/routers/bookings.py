from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/", response_model=schemas.BookingOut)
def book_seat(request: schemas.BookingRequest, db: Session = Depends(get_db)):
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
    new_booking = models.Booking(user_id=request.user_id, booking_status="confirmed")
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking