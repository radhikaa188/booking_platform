from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
from app.payment_gateway import process_payment, process_refund
from app.logger import logger
import os

router = APIRouter(prefix="/bookings", tags=["bookings"])

limiter = Limiter(key_func=get_remote_address, storage_uri=os.getenv("REDIS_URL"))

HOLD_DURATION_MINUTES = 5
@router.post("/hold", response_model=schemas.BookingOut)
@limiter.limit("5/minute")
def hold_seat(request: Request, body: schemas.BookingRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    event_seat = db.query(models.EventSeat).filter(
        models.EventSeat.id == body.event_seat_id   # ← request.event_seat_id NAHI, body.event_seat_id
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
    logger.info(f"Seat {body.event_seat_id} held by user {current_user.id}, booking {new_booking.id}")
    return new_booking



@router.post("/{booking_id}/pay", response_model=schemas.BookingOut)
def pay_for_booking(booking_id: int, payment: schemas.PaymentRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):

    # Step 1: Idempotency check — same key se pehle try to nahi hua?
    existing = db.query(models.Booking).filter(
        models.Booking.idempotency_key == payment.idempotency_key
    ).first()

    if existing:
        # Ye request pehle bhi aayi thi — dobara process mat karo, seedha purana result do
        return existing

    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking or booking.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.booking_status != "pending":
        raise HTTPException(status_code=400, detail="Booking is not pending payment")

    booking_seat = db.query(models.BookingSeat).filter(models.BookingSeat.booking_id == booking_id).first()
    event_seat = db.query(models.EventSeat).filter(
        models.EventSeat.id == booking_seat.event_seat_id
    ).with_for_update().first()

    if event_seat.seat_status != "held":
        raise HTTPException(status_code=400, detail="Hold has expired")

    # Step 2: Payment process karo (simulated gateway)
    payment_result = process_payment(booking_seat.price_paid)

    # Step 3: Result ke hisaab se booking update karo
    if payment_result["status"] == "success":
        logger.info(f"Payment SUCCESS for booking {booking_id}, transaction {payment_result['transaction_id']}")
        event_seat.seat_status = "booked"
        event_seat.hold_expires_at = None
        booking.booking_status = "confirmed"
    else:
        logger.warning(f"Payment FAILED for booking {booking_id}, transaction {payment_result['transaction_id']}")
        event_seat.seat_status = "available"
        event_seat.hold_expires_at = None
        booking.booking_status = "cancelled"

    booking.idempotency_key = payment.idempotency_key
    db.commit()
    db.refresh(booking)

    if payment_result["status"] != "success":
        raise HTTPException(status_code=402, detail="Payment failed. Seat released.")

    return booking

@router.post("/{booking_id}/cancel", response_model=schemas.BookingOut)
def cancel_booking(booking_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()

    if not booking or booking.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.booking_status != "confirmed":
        raise HTTPException(status_code=400, detail="Only confirmed bookings can be cancelled")

    booking_seat = db.query(models.BookingSeat).filter(models.BookingSeat.booking_id == booking_id).first()
    event_seat = db.query(models.EventSeat).filter(
        models.EventSeat.id == booking_seat.event_seat_id
    ).with_for_update().first()

    # Refund process karo
    refund_result = process_refund(booking_seat.price_paid, booking.idempotency_key)

    event_seat.seat_status = "available"
    event_seat.hold_expires_at = None
    booking.booking_status = "cancelled"
    booking.refund_transaction_id = refund_result["refund_id"]

    db.commit()
    db.refresh(booking)

    logger.info(f"Booking {booking_id} cancelled, refund {refund_result['refund_id']} issued for ₹{booking_seat.price_paid}")

    return booking