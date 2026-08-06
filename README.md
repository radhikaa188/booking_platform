# Eventify — Concurrency-Safe Event Ticket Booking Platform

A full-stack event ticket booking system (BookMyShow/Ticketmaster-style) built to solve a real, hard problem: **preventing double-booking when multiple users try to book the same seat simultaneously.** Deployed end-to-end on AWS EC2 with Docker, Nginx, and a free SSL certificate.

**Live demo:** https://booking-platform-five-plum.vercel.app
**Backend API:** https://booking-platform.duckdns.org/docs

---

## Why this project exists

Most beginner backend projects are CRUD wrappers around a database. This one is built around a genuine distributed-systems problem: what happens when two people click "book" on the same seat at the exact same millisecond? The answer — and the process of discovering, reproducing, and fixing it — is the core of this project.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Cache / Rate Limiting | Redis |
| Frontend | React, Vite, Tailwind CSS |
| Auth | JWT (python-jose), bcrypt |
| Background Jobs | APScheduler |
| Containerization | Docker, Docker Compose |
| Reverse Proxy / SSL | Nginx, Let's Encrypt (Certbot) |
| Hosting | AWS EC2 (backend), Vercel (frontend) |
| DNS | DuckDNS |

---

## Core Feature: Concurrency-Safe Booking

The project's centerpiece. Here's the actual process, not just the outcome:

1. **Built a naive booking endpoint** — read seat status, check if available, write "booked." Three unprotected steps.
2. **Reproduced the race condition on purpose** using Python's `threading` module — fired 10 simultaneous booking requests at the same seat, with an artificial `time.sleep()` inserted between the read and write to widen the race window. Result: **10 out of 10 requests succeeded**, meaning the same seat was "booked" ten times.
3. **Fixed it with PostgreSQL row-level locking** (`SELECT ... FOR UPDATE` / SQLAlchemy's `.with_for_update()`) — the row is locked the moment it's read, and any concurrent transaction has to wait until the lock is released.
4. **Re-ran the same test** — confirmed only 1 of 10 requests ever succeeds now, even without the artificial delay.

This is documented, testable, and something I can walk through code-first in an interview — not just a resume bullet point.

---

## Architecture

```
Venues ──< Screens ──< Seats
                          ↘
Events ──────────────→ EventSeats ←── (locking happens here)
                          ↑
Users ──< Bookings ──< BookingSeats
```

- **EventSeat** is the junction table tracking per-event seat state (`available` / `held` / `booked`) — this is deliberately separate from `Seat` (which is permanent/physical) since status only makes sense in the context of one specific event.
- **BookingSeat** links a booking to the specific seat and snapshots the price paid at that moment (so historical receipts stay accurate even if prices change later).

---

## Feature Overview

### Booking Flow (proper state machine, not a single-step "book")
```
available → held (5 min) → confirmed (on payment success)
                          → available again (on payment failure or hold timeout)
```
- Seat holds auto-expire via a background job (APScheduler, runs every 30s) — no seat can be held indefinitely by an abandoned session.
- Booking cancellation with refund tracking — both the original payment `idempotency_key` and the `refund_transaction_id` are preserved, so cancelled bookings remain a full audit trail rather than being overwritten.

### Payments
- Idempotency-key-based payment processing — a duplicate payment attempt with the same key never gets re-processed, it returns the original result.
- Payment gateway is **simulated** (UUID transaction IDs, realistic success/failure rates) — I attempted real integration with Razorpay, Stripe, and PayPal; all three required business/PAN verification even for sandbox/test access on an individual account. Core payment *logic* (idempotency, failure handling, refunds) is fully real and tested; only the external bank connection is abstracted.

### Auth
- JWT-based, stateless auth with bcrypt password hashing.
- Role-based access control (`user` vs `admin`) — admin role is deliberately **not** self-servable at signup; it's assigned via direct database access, to prevent any signed-up user from granting themselves admin privileges.
- Found and fixed a real security bug during development: the booking endpoint originally took `user_id` in the request body (client-controlled, meaning a malicious client could book on someone else's behalf). Fixed by deriving the user from the authenticated JWT instead.

### Caching & Rate Limiting
- Redis-backed (not in-process `cachetools`/default `slowapi` storage) — specifically to solve the multi-instance consistency problem: if this were scaled to multiple backend servers behind a load balancer, in-memory caching/rate-limiting would be inconsistent across instances. Redis gives every instance the same shared source of truth.
- Cache invalidation is event-driven, not purely TTL-based — creating a new venue/event proactively clears the relevant cache key instead of waiting up to 5 minutes for staleness to resolve itself.
- Rate limits on login (brute-force protection), signup (spam prevention), and seat-hold (scalping/spam protection).

### Admin Dashboard
- Atomic, cascading venue onboarding (venue + screens + seat layout in a single transaction — a failure partway through rolls back everything, no orphaned data).
- Dynamic multi-screen, multi-row-layout builder.
- Delete endpoints for venues/screens/events/seats — each cascades correctly through the foreign-key chain (e.g., deleting a venue also cleans up its screens, seats, events, event-seats, and booking-seats, in the correct dependency order).
- A Python seeding script (`seed_data.py`) that populates realistic demo data via the live API rather than requiring manual form entry.

---

## Deployment (fully manual, no PaaS shortcuts)

This was deliberately done the "hard way" — raw EC2 + Docker + Nginx — rather than a one-click platform like Railway/Render, specifically to learn the underlying infrastructure.

1. **Dockerized the backend** — `python:3.11-slim` base, `requirements.txt` copied and installed before the rest of the code (Docker layer caching — dependencies rarely change, code changes often, so this ordering avoids re-running `pip install` on every code change).
2. **Docker Compose** orchestrates three services: backend (custom build), `postgres:16`, `redis:7-alpine`.
3. **AWS EC2** (Ubuntu, t2.micro) — provisioned manually, SSH key pair auth, Security Group configured for ports 22/80/443/8000.
4. **Nginx** as a reverse proxy in front of the backend container.
5. **DuckDNS** for a free subdomain (no purchased domain), **Certbot/Let's Encrypt** for a free SSL certificate — HTTPS end-to-end.
6. **Vercel** for the frontend, with environment-variable-based API URL configuration (build-time injection, not runtime).

### Real bugs hit and fixed during deployment (a genuine debugging log, not a highlight reel)
- A `NameError` from a missing module-level import that had never surfaced locally — Docker's clean, cache-free environment exposed it immediately on first container run.
- Docker networking: `localhost` inside a container refers to the container itself, not sibling containers. Hit this twice — once for the database connection string, once for the Redis client — both fixed by switching to Docker Compose service names (`postgres`, `redis`) instead of `localhost`.
- A fresh Postgres container starts empty — `schema.sql` (previously only ever run locally) had to be explicitly executed against the new container.
- Learned the hard way that **CORS errors in the browser console are often a red herring** — a Redis connection failure was crashing several endpoints with 500 errors, and because the browser can't read CORS headers off a failed request, it reported the failure as a CORS problem on unrelated endpoints. Real fix required reading backend container logs, not chasing the CORS message.
- SPA routing 404 on Vercel (direct navigation to `/admin` failed on refresh) — fixed with a `vercel.json` rewrite rule.
- Vite environment variables are baked in at *build* time — changing a value in the Vercel dashboard does nothing until a fresh build is triggered.

---

## Known Gaps (honest, not hidden)

- No automated test suite (pytest) — all testing has been manual, via `/docs` and live end-to-end testing.
- No CI/CD pipeline — deployment is currently manual (`git pull` + `docker compose up --build` on the EC2 instance).
- Real payment gateway integration was attempted but blocked by KYC/business-verification requirements across three providers; a well-designed simulated gateway is used instead.
- Google OAuth, a waiting-list system, and email notifications were scoped, partially attempted, and consciously deprioritized in favor of strengthening the core (concurrency, security, deployment) rather than chasing feature breadth.

---

## Project Structure

```
booking_platform/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entrypoint, CORS, scheduler startup
│   │   ├── database.py        # SQLAlchemy engine/session
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── auth.py            # JWT, bcrypt, auth dependencies
│   │   ├── redis_client.py    # Cache get/set/delete helpers
│   │   ├── payment_gateway.py # Simulated payment/refund processing
│   │   ├── background_jobs.py # Expired-hold release job
│   │   └── routers/           # venues, screens, seats, events, users, auth, bookings
│   ├── schema.sql
│   ├── seed_data.py
│   ├── Dockerfile
│   └── docker-compose.yml
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   └── pages/              # Login, Signup, Events, EventDetail, MyBookings, Profile, AdminDashboard
    └── vercel.json
