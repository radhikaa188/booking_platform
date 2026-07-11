from fastapi import FastAPI
from app.routers import events, venues, screens

# a building no department connected yet
app = FastAPI(title="Event Booking Platform")

# events dept connected to app
app.include_router(events.router)
app.include_router(venues.router)
app.include_router(screens.router)

@app.get("/")
def root():
    return {"message": "Booking platform API is running"}