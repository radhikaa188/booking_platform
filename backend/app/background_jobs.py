from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app import models
from app.logger import logger

def release_expired_holds():
    db = SessionLocal()
    try:
        expired_seats = db.query(models.EventSeat).filter(
            models.EventSeat.seat_status == "held",
            models.EventSeat.hold_expires_at < datetime.utcnow()
        ).all()

        for seat in expired_seats:
            seat.seat_status = "available"
            seat.hold_expires_at = None

        if expired_seats:
            db.commit()
            logger.info(f"Released {len(expired_seats)} expired holds")

    finally:
        db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(release_expired_holds, "interval", seconds=30)