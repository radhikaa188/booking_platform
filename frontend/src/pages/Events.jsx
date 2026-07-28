import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Search, Filter, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events/');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
          <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl h-96 border border-slate-100 animate-pulse">
              <div className="h-48 bg-slate-200 rounded-t-2xl"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-10 bg-slate-200 rounded mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Upcoming Events</h1>
          <p className="text-slate-500 mt-2">Discover and book tickets for the best events in town.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">No events found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
          <Button 
            variant="ghost" 
            className="mt-6"
            onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
          >
            Clear all filters
          </Button>
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
              <Card className="group hover:shadow-xl transition-all duration-300 flex flex-col h-full border-slate-100">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="primary" className="shadow-lg backdrop-blur-md bg-white/90">
                      Featured
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="info">Category TODO</Badge>
                    <span className="text-xs text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {event.name}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                      {new Date(event.start_time).toLocaleDateString(undefined, { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                      Venue ID: {event.screen_id} (TODO: Name)
                    </div>
                  </div>

                  <Link to={`/events/${event.id}`}>
                    <Button className="w-full group/btn">
                      Book Now
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
