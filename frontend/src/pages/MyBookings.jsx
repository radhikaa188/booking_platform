import { useState, useEffect } from "react";
import api from "../api/axios";
import { Card } from "../components/ui/Card";
import  Button  from "../components/ui/Button";
import  Badge  from "../components/ui/Badge";
import { toast } from "react-hot-toast";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings/");
      setBookings(response.data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{booking.event_name}</h2>
                  <p className="text-sm text-gray-600">{booking.venue_name} - {booking.screen_name}</p>
                  <p className="text-sm">Seats: {booking.seat_numbers.join(", ")}</p>
                  <p className="text-sm">Date: {new Date(booking.booking_time).toLocaleString()}</p>
                </div>
                <Badge>{booking.booking_status}</Badge>
              </div>
              {booking.booking_status === "confirmed" && (
                <Button onClick={() => handleCancel(booking.id)} className="mt-4" variant="danger">
                  Cancel Booking
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
