from fastapi import FastAPI
from app.routers import events, venues, screens, seats, users, event_seats, bookings, auth

# a building no department connected yet
app = FastAPI(title="Event Booking Platform")

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