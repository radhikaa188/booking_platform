import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function EventDetail() {
  const { eventId } = useParams();
  const [seats, setSeats] = useState([]);
  const [message, setMessage] = useState("");
  const [pendingBookingId, setPendingBookingId] = useState(null);

  const fetchSeats = () => {
    api.get(`/events/${eventId}/seats`)
      .then((response) => setSeats(response.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSeats();
  }, [eventId]);

  const handleHold = async (eventSeatId) => {
    setMessage("");
    try {
      const response = await api.post("/bookings/hold", { event_seat_id: eventSeatId });
      setPendingBookingId(response.data.id);
      setMessage(`Seat held! Booking ID: ${response.data.id}. Click "Pay Now" within 5 minutes.`);
      fetchSeats();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to hold seat");
    }
  };
  const handlePay = async () => {
    if (!pendingBookingId) return;
    setMessage("Processing payment...");
    try {
      const idempotencyKey = `key-${pendingBookingId}-${Date.now()}`;
      const response = await api.post(`/bookings/${pendingBookingId}/pay`, {
        idempotency_key: idempotencyKey,
      });
      setMessage(`Payment successful! Status: ${response.data.booking_status}`);
      setPendingBookingId(null);
      fetchSeats();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Payment failed");
      fetchSeats();
    }
  };

  const getColor = (status) => {
    if (status === "available") return "lightgreen";
    if (status === "held") return "khaki";
    if (status === "booked") return "salmon";
    return "gray";
  };

  return (
    <div>
      <h2>Seat Map — Event {eventId}</h2>
      {message && <p><strong>{message}</strong></p>}
      {pendingBookingId && (
        <button onClick={handlePay} style={{ marginBottom: "10px" }}>
          Pay Now for Booking #{pendingBookingId}
        </button>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {seats.map((seat) => (
          <button
            key={seat.id}
            onClick={() => handleHold(seat.id)}
            disabled={seat.seat_status !== "available"}
            style={{
              backgroundColor: getColor(seat.seat_status),
              padding: "10px",
              width: "60px",
            }}
          >
            {seat.seat_status}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EventDetail;