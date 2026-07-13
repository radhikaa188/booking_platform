import threading
import requests

EVENT_SEAT_ID = 6 # naya available seat ka ID daalo (GET /events/{id}/seats se check karke)
url = "http://127.0.0.1:8000/bookings/"

results = []

def book(user_id):
    response = requests.post(url, json={"user_id": user_id, "event_seat_id": EVENT_SEAT_ID})
    results.append((user_id, response.status_code, response.json()))

threads = []
for i in range(10):  # 10 users ek saath try karenge
    t = threading.Thread(target=book, args=(1,))
    threads.append(t)

for t in threads:
    t.start()

for t in threads:
    t.join()

print("Results:")
success_count = 0
for r in results:
    print(r)
    if r[1] == 200:
        success_count += 1

print(f"\nTotal successful bookings: {success_count} (should be 1, not more!)")