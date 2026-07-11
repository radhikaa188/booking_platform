from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Text, DateTime, UniqueConstraint, Numeric
from sqlalchemy.sql import func
from app.database import Base
import enum

class Venue(Base):
    __tablename__ = "venues"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)

class ScreenType(str, enum.Enum):
    standard = "standard"
    imax = "imax"
    fourdx = "4dx"
class Screen(Base):
    __tablename__= "screens"

    id = Column(Integer, primary_key=True)
    venue_id = Column(Integer, ForeignKey("venues.id"))
    name = Column(String, nullable=False)
    screen_type = Column(Enum(ScreenType))

class SeatCategory(str, enum.Enum):
    regular = "regular"
    premium = "premium"
    recliner = "recliner"

class Seat(Base):
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True)
    screen_id = Column(Integer, ForeignKey("screens.id"))
    row_id = Column(String(1), nullable=False)
    seat_no = Column(Integer)
    seat_category = Column(Enum(SeatCategory))


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    screen_id = Column(Integer, ForeignKey("screens.id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)


class SeatStatus(str, enum.Enum):
    available = "available"
    held = "held"
    booked = "booked"

class EventSeat(Base):
    __tablename__ = "event_seats"

    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    seat_id = Column(Integer, ForeignKey("seats.id"))
    seat_status = Column(Enum(SeatStatus), nullable=False, default="available")
    hold_expires_at = Column(DateTime)
    version = Column(Integer, nullable=False, default=0)

    __table_args__ = (UniqueConstraint("event_id", "seat_id"),)


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default="user")
    created_at = Column(DateTime, nullable=False, server_default=func.now())

class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    booking_status = Column(Enum(BookingStatus), nullable=False, default="pending")


class BookingSeat(Base):
    __tablename__ = "booking_seats"

    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    event_seat_id = Column(Integer, ForeignKey("event_seats.id"))
    price_paid = Column(Numeric(10, 2), nullable=False)