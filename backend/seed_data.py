import requests

BASE_URL = "https://booking-platform.duckdns.org"

# Step 1: Admin login karke token lo
ADMIN_EMAIL = "radhika@ex.com"
ADMIN_PASSWORD = "radhika"

login_response = requests.post(f"{BASE_URL}/auth/login", json={
    "email": ADMIN_EMAIL,
    "password": ADMIN_PASSWORD
})

if login_response.status_code != 200:
    print("Login failed:", login_response.text)
    exit()

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Step 2: Venues data
venues = [
    {
        "name": "PVR Priya",
        "address": "Vasant Vihar Market",
        "city": "Delhi",
        "screens": [
            {
                "name": "Screen 1",
                "screen_type": "standard",
                "layout": [
                    {"row_id": "A", "seat_count": 8, "seat_category": "premium"},
                    {"row_id": "B", "seat_count": 10, "seat_category": "regular"},
                ]
            },
            {
                "name": "Screen 2",
                "screen_type": "imax",
                "layout": [
                    {"row_id": "A", "seat_count": 6, "seat_category": "reclinear"},
                    {"row_id": "B", "seat_count": 10, "seat_category": "premium"},
                ]
            }
        ]
    },
    {
        "name": "INOX Cyber Hub",
        "address": "DLF Cyber Hub",
        "city": "Gurugram",
        "screens": [
            {
                "name": "Screen 1",
                "screen_type": "standard",
                "layout": [
                    {"row_id": "A", "seat_count": 8, "seat_category": "regular"},
                    {"row_id": "B", "seat_count": 10, "seat_category": "regular"},
                ]
            }
        ]
    }
]

# Step 3: Venues create karo, screen IDs collect karo
screen_ids = []

for venue in venues:
    response = requests.post(f"{BASE_URL}/venues/onboard", json=venue, headers=headers)
    if response.status_code == 200:
        print(f"✅ Created venue: {venue['name']}")
    else:
        print(f"❌ Failed: {venue['name']} — {response.text}")

# Step 4: Screens fetch karo (IDs ke liye)
screens_response = requests.get(f"{BASE_URL}/screens/")
all_screens = screens_response.json()
print(f"\nAvailable screens: {[(s['id'], s['venue_name'], s['name']) for s in all_screens]}")

# Step 5: Events create karo (manually screen_id map karke, ya upar wale output se dekh ke)
events = [
    {
        "name": "Pathaan Returns",
        "description": "Action-packed sequel",
        "start_time": "2026-08-15T18:00:00",
        "end_time": "2026-08-15T20:30:00",
        "screen_id": all_screens[0]["id"]  # pehla screen use kar rahe hain example ke liye
    },
]

for event in events:
    response = requests.post(f"{BASE_URL}/events/", json=event, headers=headers)
    if response.status_code == 200:
        print(f"✅ Created event: {event['name']}")
    else:
        print(f"❌ Failed: {event['name']} — {response.text}")

print("\n🎉 Seeding complete!")