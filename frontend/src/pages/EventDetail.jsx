import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SeatButton from '../components/events/SeatButton';
import VenueCard from '../components/events/VenueCard';
import ScreenCard from '../components/events/ScreenCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Calendar, Ticket, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [pendingBookingId, setPendingBookingId] = useState(null);
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSeats = async () => {
    try {
      const response = await api.get(`/events/${eventId}/seats`);
      setSeats(response.data || []);
    } catch (err) {
      console.error('Failed to fetch seats:', err);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch complete event details (Event name, desc, start/end time, venue name, address, city, screen name, screen type)
      const detailsRes = await api.get(`/events/${eventId}/details`);
      setEvent(detailsRes.data);

      // Fetch seat status layout
      await fetchSeats();
    } catch (err) {
      console.error('Failed to load event details:', err);
      setError(err.response?.data?.detail || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const handleHold = async (eventSeatId) => {
    setMessage('');
    setIsProcessing(true);
    try {
      const response = await api.post('/bookings/hold', { event_seat_id: eventSeatId });
      const bookingId = response.data.id;
      setPendingBookingId(bookingId);
      setSelectedSeatId(eventSeatId);
      setMessage(`Seat #${eventSeatId} held! Booking ID: #${bookingId}. Please click "Pay Now" within 5 minutes.`);
      toast.success('Seat held for 5 minutes!');
      await fetchSeats();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to hold seat';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePay = async () => {
    if (!pendingBookingId) return;
    setIsProcessing(true);
    setMessage('Processing payment gateway verification...');

    try {
      const idempotencyKey = `key-${pendingBookingId}-${Date.now()}`;
      const response = await api.post(`/bookings/${pendingBookingId}/pay`, {
        idempotency_key: idempotencyKey,
      });

      const confirmedStatus = response.data.booking_status;
      toast.success('Payment successful! Booking confirmed.');

      const successData = {
        bookingId: pendingBookingId,
        event: event || { id: eventId, name: `Event #${eventId}` },
        seatId: selectedSeatId,
        status: confirmedStatus,
      };

      try {
        sessionStorage.setItem('last_booking_success', JSON.stringify(successData));
      } catch (e) {
        console.error(e);
      }

      navigate('/booking-success', { state: successData });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Payment failed. Seat has been released.';
      setMessage(errorMsg);
      toast.error(errorMsg);
      setPendingBookingId(null);
      setSelectedSeatId(null);
      await fetchSeats();
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <LoadingSpinner message="Loading event, venue, screen details, and seat map..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorMessage message={error} onRetry={fetchEventDetails} />
      </div>
    );
  }

  const startDate = event?.start_time ? new Date(event.start_time) : null;
  const endDate = event?.end_time ? new Date(event.end_time) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* SECTION 1: Event Header */}
      <Card className="border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <Badge variant="primary" className="bg-primary-600 text-white uppercase text-xs tracking-wider">
              Live Event
            </Badge>
            {startDate && (
              <span className="text-xs text-slate-300 flex items-center font-medium bg-white/10 px-3 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-primary-400" />
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {event?.name || `Event #${eventId}`}
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            {event?.description || 'Select your seat from the interactive layout below.'}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-700/60 flex flex-wrap items-center gap-6 text-sm text-slate-300">
            {startDate && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary-400 flex-shrink-0" />
                <span>
                  <strong>Start:</strong> {startDate.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            {endDate && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary-400 flex-shrink-0" />
                <span>
                  <strong>End:</strong> {endDate.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2 & 3: Venue Card & Screen Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VenueCard
          venueName={event?.venue_name}
          address={event?.venue_address}
          city={event?.venue_city}
        />
        <ScreenCard
          screenName={event?.screen_name}
          screenType={event?.screen_type || 'Standard'}
        />
      </div>

      {/* Booking Alert / Action Bar */}
      {message && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          pendingBookingId ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-100 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
          </div>
          {pendingBookingId && (
            <Button onClick={handlePay} isLoading={isProcessing} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              Pay Now for Booking #{pendingBookingId}
            </Button>
          )}
        </div>
      )}

      {/* SECTION 4: Seat Selection Grid */}
      <Card className="border-slate-100 shadow-md">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Seat Map Selection</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click an available seat to lock it for 5 minutes.</p>
            </div>

            {/* Seat Status Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-400"></span>
                <span className="text-slate-600">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-200 border border-amber-400"></span>
                <span className="text-slate-600">Held</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-300 border border-slate-400"></span>
                <span className="text-slate-600">Booked</span>
              </div>
            </div>
          </div>

          {/* Screen Direction Indicator */}
          <div className="w-full max-w-md mx-auto mb-10 text-center">
            <div className="h-2 bg-gradient-to-r from-slate-200 via-primary-300 to-slate-200 rounded-full shadow-inner mb-2"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">SCREEN THIS WAY</span>
          </div>

          {/* Seat Grid Layout */}
          {seats.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No seat layout generated for this event yet.
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto py-4">
              {seats.map((seat) => (
                <SeatButton
                  key={seat.id}
                  seat={seat}
                  disabled={isProcessing}
                  onClick={() => handleHold(seat.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EventDetail;