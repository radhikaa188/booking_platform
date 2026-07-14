from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/", response_model=list[schemas.EventOut])
def list_events(db: Session = Depends(get_db)):
    events = db.query(models.Event).all()
    return events

@router.post("/", response_model=schemas.EventOut)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_event = models.Event(
        name=event.name,
        description=event.description,
        start_time=event.start_time,
        end_time=event.end_time,
        screen_id=event.screen_id
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    # Automatically generate event_seats for every seat on this screen
    seats = db.query(models.Seat).filter(models.Seat.screen_id == new_event.screen_id).all()
    for seat in seats:
        db.add(models.EventSeat(event_id=new_event.id, seat_id=seat.id))
    db.commit()

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