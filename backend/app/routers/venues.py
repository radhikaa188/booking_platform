from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/venues", tags=["venues"])

@router.get("/", response_model=list[schemas.VenueOut])
def list_venues(db: Session = Depends(get_db)):
    return db.query(models.Venue).all()

@router.post("/", response_model=schemas.VenueOut)
def create_venue(venue: schemas.VenueCreate, db: Session = Depends(get_db)):
    new_venue = models.Venue(**venue.model_dump())
    db.add(new_venue)
    db.commit()
    db.refresh(new_venue)
    return new_venue