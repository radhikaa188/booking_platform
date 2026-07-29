import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';

const EventCard = ({ event }) => {
  const startDate = event.start_time ? new Date(event.start_time) : null;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 flex flex-col h-full border-slate-100">
      <div className="relative h-48 overflow-hidden rounded-t-xl bg-slate-100">
        <img
          src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="primary" className="shadow-md bg-white/90 backdrop-blur-sm text-primary-700">
            Live
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          {startDate && (
            <span className="text-xs text-slate-500 flex items-center font-medium bg-slate-100 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
          {event.name}
        </h3>

        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">
          {event.description || 'No description available for this event.'}
        </p>

        <div className="space-y-2 mb-6 pt-2 border-t border-slate-100">
          {startDate && (
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
              <span>
                {startDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
            <span>
              {event.venue_name ? `${event.venue_name}${event.venue_city ? ` (${event.venue_city})` : ''}` : `Screen #${event.screen_id}`}
            </span>
          </div>
        </div>

        <Link to={`/events/${event.id}`} className="mt-auto">
          <Button className="w-full group/btn">
            View Seats
            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default EventCard;
