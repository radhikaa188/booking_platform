from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin
from cachetools import TTLCache
from app.redis_client import get_cache, set_cache, delete_cache


events_cache = TTLCache(maxsize=100, ttl=300)

router = APIRouter(prefix="/events", tags=["events"])
    
@router.get("/", response_model=list[schemas.EventOut])
def list_events(db: Session = Depends(get_db)):
    cached = get_cache("all_events")
    if cached:
        print("✅ Serving from REDIS CACHE")
        return cached

    print("🔍 Querying DATABASE")
    events = db.query(models.Event).all()
    result = [schemas.EventOut.model_validate(e).model_dump() for e in events]
    set_cache("all_events", result, ttl_seconds=300)
    return result
    
@router.post("/", response_model=schemas.EventOut)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    if event.start_time >= event.end_time:
        raise HTTPException(status_code=400, detail="start_time must be before end_time")

    screen = db.query(models.Screen).filter(models.Screen.id == event.screen_id).first()
    if not screen:
        raise HTTPException(status_code=404, detail="Screen not found")
    new_event = models.Event(
        name=event.name,
        description=event.description,
        start_time=event.start_time,
        end_time=event.end_time,
        screen_id=event.screen_id
    )
    db.add(new_event)
    db.flush()

    # Automatically generate event_seats for every seat on this screen
    seats = db.query(models.Seat).filter(models.Seat.screen_id == new_event.screen_id).all()
    for seat in seats:
        db.add(models.EventSeat(event_id=new_event.id, seat_id=seat.id))
    db.commit()
    db.refresh(new_event)
    delete_cache("all_events")
    return new_event


@router.get("/{event_id}", response_model=schemas.EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/{event_id}/details", response_model=schemas.EventDetailsOut)
def get_event_details(event_id: int, db: Session = Depends(get_db)):
    result = (
        db.query(
            models.Event.id,
            models.Event.name,
            models.Event.description,
            models.Event.start_time,
            models.Event.end_time,
            models.Screen.name.label("screen_name"),
            models.Venue.name.label("venue_name"),
            models.Venue.city.label("venue_city"),
        )
        .join(models.Screen, models.Event.screen_id == models.Screen.id)
        .join(models.Venue, models.Screen.venue_id == models.Venue.id)
        .filter(models.Event.id == event_id)
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="Event not found")
    return result