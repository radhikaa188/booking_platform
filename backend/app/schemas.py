from pydantic import BaseModel
from datetime import datetime
from typing import Optional

#event
class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    screen_id: int

#write side
class EventCreate(EventBase):
    pass

#read side
class EventOut(EventBase):
    id: int

    class Config:
        from_attributes = True

class VenueBase(BaseModel):
    name: str
    address: str
    city: str

#venue
class VenueCreate(VenueBase):
    pass

class VenueOut(VenueBase):
    id: int

    class Config:
        from_attributes = True

#screen
class ScreenBase(BaseModel):
    venue_id: int
    name: str
    screen_type: str

class ScreenCreate(ScreenBase):
    pass

class ScreenOut(ScreenBase):
    id: int

    class Config:
        from_attributes = True