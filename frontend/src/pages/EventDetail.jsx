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

  const getSeatClass = (status) => {
    if (status === "available") return "seat-btn seat-available";
    if (status === "held") return "seat-btn seat-held";
    if (status === "booked") return "seat-btn seat-booked";
    return "seat-btn seat-disabled";
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Seat Map — Event {eventId}</h2>
      {message && <p className="event-detail-msg">{message}</p>}
      {pendingBookingId && (
        <button onClick={handlePay} className="btn-pay">
          Pay Now for Booking #{pendingBookingId}
        </button>
      )}
      <div className="seat-grid">
        {seats.map((seat) => (
          <button
            key={seat.id}
            onClick={() => handleHold(seat.id)}
            disabled={seat.seat_status !== "available"}
            className={getSeatClass(seat.seat_status)}
          >
            {seat.seat_status}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EventDetail;