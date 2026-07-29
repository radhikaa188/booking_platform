import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import EventCard from '../components/events/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/ui/Button';
import { Search, CalendarX } from 'lucide-react';
import { motion } from 'framer-motion';

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const fetchEventsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Concurrently fetch events, screens, and venues to resolve names for user cards
      const [eventsRes, screensRes, venuesRes] = await Promise.allSettled([
        api.get('/events/'),
        api.get('/screens/'),
        api.get('/venues/'),
      ]);

      const rawEvents = eventsRes.status === 'fulfilled' ? eventsRes.value.data || [] : [];
      const screens = screensRes.status === 'fulfilled' ? screensRes.value.data || [] : [];
      const venues = venuesRes.status === 'fulfilled' ? venuesRes.value.data || [] : [];

      const screenMap = new Map(screens.map((s) => [s.id, s]));
      const venueMap = new Map(venues.map((v) => [v.id, v]));

      const enrichedEvents = rawEvents.map((evt) => {
        const screen = screenMap.get(evt.screen_id);
        const venue = screen ? venueMap.get(screen.venue_id) : null;
        return {
          ...evt,
          venue_name: venue ? venue.name : null,
          venue_city: venue ? venue.city : null,
          screen_name: screen ? screen.name : null,
        };
      });

      setEvents(enrichedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.detail || 'Failed to load events from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  // Pure client-side array filtering
  const filteredEvents = events.filter((event) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = event.name?.toLowerCase().includes(term);
    const descMatch = event.description?.toLowerCase().includes(term);
    const venueMatch = event.venue_name?.toLowerCase().includes(term);
    const cityMatch = event.venue_city?.toLowerCase().includes(term);
    return nameMatch || descMatch || venueMatch || cityMatch;
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      setSearchParams({ search: value.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Upcoming Events</h1>
          <p className="text-slate-500 mt-1">Discover and book tickets for live events.</p>
        </div>

        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events, venues, cities..."
              className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm transition-all shadow-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching upcoming events and venue details..." size="lg" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchEventsData} />
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="bg-slate-200/60 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarX className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No events found</h3>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            {searchTerm
              ? `No events matching "${searchTerm}". Try a different keyword.`
              : 'There are currently no events scheduled.'}
          </p>
          {searchTerm && (
            <Button
              variant="ghost"
              className="mt-6 text-primary-600 hover:text-primary-700"
              onClick={() => {
                setSearchTerm('');
                setSearchParams({});
              }}
            >
              Clear search filter
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
