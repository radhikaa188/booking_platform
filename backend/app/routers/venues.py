from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin

from app.redis_client import get_cache, set_cache, delete_cache


#venues_cache = TTLCache(maxsize=100, ttl=300)

router = APIRouter(prefix="/venues", tags=["venues"])

@router.get("/", response_model=list[schemas.VenueOut])
def list_venues(db: Session = Depends(get_db)):
    cached = get_cache("all_venues")
    if cached:
        return cached

    venues = db.query(models.Venue).all()
    result = [schemas.VenueOut.model_validate(v).model_dump() for v in venues]
    set_cache("all_venues", result, ttl_seconds=300)
    return result

@router.post("/onboard", response_model=schemas.VenueOut)
def onboard_venue(payload: schemas.VenueOnboard, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    try:
        new_venue = models.Venue(name=payload.name, address=payload.address, city=payload.city)
        db.add(new_venue)
        db.flush()  # assigns new_venue.id WITHOUT permanently committing yet

        for screen_data in payload.screens:
            new_screen = models.Screen(
                venue_id=new_venue.id,
                name=screen_data.name,
                screen_type=screen_data.screen_type
            )
            db.add(new_screen)
            db.flush()  # assigns new_screen.id WITHOUT permanently committing yet

            for row in screen_data.layout:
                for seat_num in range(1, row.seat_count + 1):
                    db.add(models.Seat(
                        screen_id=new_screen.id,
                        row_id=row.row_id,
                        seat_no=seat_num,
                        seat_category=row.seat_category
                    ))

        db.commit()  # ONE commit — everything saved together, only if we reach this line
        db.refresh(new_venue)
        delete_cache("all_venues")   # ← naya add karo
        delete_cache("all_screens")  # ← screens bhi banی, isliye ye bhi clear karo
        delete_cache("all_seats")
        return new_venue

    except Exception as e:
        db.rollback()  # undo EVERYTHING staged so far, since something failed
        raise HTTPException(status_code=400, detail=f"Onboarding failed: {str(e)}")

@router.post("/{venue_id}/screens", response_model=schemas.ScreenOut)
def add_screen_to_venue(venue_id: int, screen_data: schemas.ScreenOnboard, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    venue = db.query(models.Venue).filter(models.Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")

    try:
        new_screen = models.Screen(
            venue_id=venue_id,
            name=screen_data.name,
            screen_type=screen_data.screen_type
        )
        db.add(new_screen)
        db.flush()

        for row in screen_data.layout:
            for seat_num in range(1, row.seat_count + 1):
                db.add(models.Seat(
                    screen_id=new_screen.id,
                    row_id=row.row_id,
                    seat_no=seat_num,
                    seat_category=row.seat_category
                ))

        db.commit()
        db.refresh(new_screen)
        delete_cache("all_screens")
        return new_screen

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to add screen: {str(e)}")