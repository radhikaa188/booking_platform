from fastapi import FastAPI
from app.routers import events, venues, screens, seats, users, event_seats, bookings, auth
from app.background_jobs import scheduler
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from sqlalchemy import text


# a building no department connected yet
app = FastAPI(title="Event Booking Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "detail": str(e)}
@app.on_event("startup")
def start_scheduler():
    scheduler.start()

limiter = Limiter(key_func=get_remote_address, storage_uri="redis://localhost:6379")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# events dept connected to app
app.include_router(events.router)
app.include_router(venues.router)
app.include_router(screens.router)
app.include_router(seats.router)
app.include_router(users.router)
app.include_router(event_seats.router)
app.include_router(bookings.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Booking platform API is running"}