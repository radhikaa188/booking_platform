from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin
from app.redis_client import get_cache, set_cache, delete_cache


#screens_cache = TTLCache(maxsize=100, ttl=300)

router = APIRouter(prefix="/screens", tags=["screens"])

@router.get("/", response_model=list[schemas.ScreenWithVenueOut])
def list_screens(db: Session = Depends(get_db)):
    cached = get_cache("all_screens")
    if cached:
        return cached

    results = (
        db.query(
            models.Screen.id,
            models.Screen.venue_id,
            models.Screen.name,
            models.Screen.screen_type,
            models.Venue.name.label("venue_name")
        )
        .join(models.Venue, models.Screen.venue_id == models.Venue.id)
        .all()
    )
    result = [
        {
            "id": r.id,
            "venue_id": r.venue_id,
            "name": r.name,
            "screen_type": r.screen_type.value,
            "venue_name": r.venue_name
        }
        for r in results
    ]
    set_cache("all_screens", result, ttl_seconds=300)
    return result

@router.post("/{screen_id}/seats", response_model=list[schemas.SeatOut])
def add_seats_to_screen(screen_id: int, layout: list[schemas.SeatLayoutRow], db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    screen = db.query(models.Screen).filter(models.Screen.id == screen_id).first()
    if not screen:
        raise HTTPException(status_code=404, detail="Screen not found")

    try:
        new_seats = []
        for row in layout:
            for seat_num in range(1, row.seat_count + 1):
                seat = models.Seat(
                    screen_id=screen_id,
                    row_id=row.row_id,
                    seat_no=seat_num,
                    seat_category=row.seat_category
                )
                db.add(seat)
                new_seats.append(seat)

        db.commit()
        for s in new_seats:
            db.refresh(s)
        return new_seats
        delete_cache("all_seats")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to add seats: {str(e)}")