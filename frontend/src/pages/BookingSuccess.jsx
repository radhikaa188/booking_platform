import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { CheckCircle2, Ticket, Calendar, MapPin, ArrowRight, History } from 'lucide-react';

const BookingSuccess = () => {
  const location = useLocation();

  // Try reading state from location or fallback to sessionStorage
  let bookingData = location.state;
  if (!bookingData) {
    try {
      const stored = sessionStorage.getItem('last_booking_success');
      if (stored) bookingData = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse cached booking', e);
    }
  }

  if (!bookingData || !bookingData.bookingId) {
    return <Navigate to="/my-bookings" replace />;
  }

  const { bookingId, event, seatId, status = 'confirmed' } = bookingData;
  const startDate = event?.start_time ? new Date(event.start_time) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Card className="border-slate-100 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-emerald-600 text-white p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold">Booking Confirmed!</h1>
          <p className="mt-2 text-emerald-100 text-sm">
            Thank you for your purchase. Your ticket has been booked successfully.
          </p>
        </div>

        <CardContent className="p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Booking Reference</span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">#{bookingId}</h2>
            </div>
            <Badge variant="success" className="text-sm px-3 py-1 uppercase tracking-wider">
              {status}
            </Badge>
          </div>

          <div className="py-6 space-y-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Ticket className="w-5 h-5 mr-2 text-primary-600" />
              {event?.name || `Event #${event?.id || 'Details'}`}
            </h3>

            {event?.description && (
              <p className="text-slate-500 text-sm">{event.description}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {startDate && (
                <div className="flex items-start text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <Calendar className="w-4 h-4 mr-2 text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold text-slate-700">Date & Time</span>
                    <span>
                      {startDate.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                <MapPin className="w-4 h-4 mr-2 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-semibold text-slate-700">Venue & Screen</span>
                  <span>
                    {event?.venue_name || 'Venue'} — {event?.screen_name || `Screen #${event?.screen_id || 'N/A'}`}
                  </span>
                </div>
              </div>
            </div>

            {seatId && (
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-primary-900">Assigned Seat:</span>
                <span className="text-lg font-black text-primary-700 bg-white px-3 py-1 rounded border border-primary-200">
                  Seat #{seatId}
                </span>
              </div>
            )}
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-end">
            <Link to="/my-bookings">
              <Button variant="secondary" className="w-full sm:w-auto">
                <History className="w-4 h-4 mr-2" />
                View My Bookings
              </Button>
            </Link>
            <Link to="/events">
              <Button className="w-full sm:w-auto">
                Explore More Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingSuccess;
