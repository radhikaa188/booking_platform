import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/events/")
      .then((response) => {
        setEvents(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading events...</p>;

  return (
    <div>
      <h2>Events</h2>
      {events.length === 0 && <p>No events found.</p>}
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <Link to={`/events/${event.id}`}>
              {event.name} — {new Date(event.start_time).toLocaleString()}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Events;