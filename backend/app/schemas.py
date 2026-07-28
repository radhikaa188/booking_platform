from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Because models.py describes how data is stored, while schema.py describes what data the API accepts or returns.
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

#venue
class VenueBase(BaseModel):
    name: str
    address: str
    city: str

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

class EventDetailsOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    screen_name: str
    venue_name: str
    venue_city: str

    class Config:
        from_attributes = True

#seats
class SeatBase(BaseModel):
    screen_id: int
    row_id: str
    seat_no: int
    seat_category: str

class SeatCreate(SeatBase):
    pass

class SeatOut(SeatBase):
    id: int
    class Config:
        from_attributes = True

#users
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str   # plain password comes IN, gets hashed before storage

class UserOut(UserBase):
    id: int
    role: str
    class Config:
        from_attributes = True

#create seats as bulk when an event is created
class EventSeatOut(BaseModel):
    id: int
    event_id: int
    seat_id: int
    seat_status: str
    hold_expires_at: Optional[datetime] = None
    version: int

    class Config:
        from_attributes = True

class SeatLayoutRow(BaseModel):
    row_id: str
    seat_count: int
    seat_category: str

class ScreenOnboard(BaseModel):
    name: str
    screen_type: str
    layout: list[SeatLayoutRow]

class VenueOnboard(BaseModel):
    name: str
    address: str
    city: str
    screens: list[ScreenOnboard]

class BookingRequest(BaseModel):
    event_seat_id: int

class BookingOut(BaseModel):
    id: int
    user_id: int
    booking_status: str

    class Config:
        from_attributes = True

class BookingDetailOut(BookingOut):
    event_name: str
    venue_name: str
    screen_name: str
    seat_numbers: list[str]
    booking_time: datetime
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class PaymentRequest(BaseModel):
    idempotency_key: str