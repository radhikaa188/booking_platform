DROP TABLE IF EXISTS booking_seats;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS event_seats;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS screens;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS user_role_enum;
DROP TYPE IF EXISTS screen_type_enum;
DROP TYPE IF EXISTS seat_category_enum;
DROP TYPE IF EXISTS seat_status_enum;
DROP TYPE IF EXISTS booking_status_enum;
CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL
);

CREATE TYPE screen_type_enum AS ENUM ('standard', 'imax', '4dx');

CREATE TABLE screens (
    id SERIAL PRIMARY KEY,
    venue_id INTEGER REFERENCES venues(id),
    name VARCHAR(255) NOT NULL,
    screen_type screen_type_enum
);

CREATE TYPE seat_category_enum AS ENUM ('regular', 'premium', 'reclinear');

CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    screen_id INTEGER REFERENCES screens(id),
    row_id CHAR(1) NOT NULL,
    seat_no INTEGER,
    seat_category seat_category_enum,
    UNIQUE(screen_id, row_id, seat_no)
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    screen_id INTEGER REFERENCES screens(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL
);

CREATE TYPE seat_status_enum AS ENUM ('available', 'held', 'booked');

CREATE TABLE event_seats (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    seat_id INTEGER REFERENCES seats(id),
    seat_status seat_status_enum NOT NULL DEFAULT 'available',
    hold_expires_at TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    UNIQUE(event_id, seat_id)
);

CREATE TYPE user_role_enum AS ENUM ('user', 'admin');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    booking_time TIMESTAMP NOT NULL DEFAULT NOW(),
    booking_status booking_status_enum NOT NULL DEFAULT 'pending'
);

CREATE TABLE booking_seats (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    event_seat_id INTEGER REFERENCES event_seats(id),
    price_paid DECIMAL(10, 2) NOT NULL
);