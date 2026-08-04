import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  Building2,
  Calendar,
  Monitor,
  Ticket,
  Plus,
  Trash2,
  LayoutDashboard,
  MapPin,
  Armchair,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function AdminDashboard() {
  const role = localStorage.getItem('role');

  const [activeTab, setActiveTab] = useState('venues'); // 'venues' | 'screens' | 'events'

  // Aggregated Collections & Loading States
  const [allVenues, setAllVenues] = useState([]);
  const [allScreens, setAllScreens] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State 1: Onboard Venue
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [venueScreens, setVenueScreens] = useState([
    { name: '', screen_type: 'standard', layout: [{ row_id: 'A', seat_count: 5, seat_category: 'regular' }] },
  ]);

  // Form State 2: Add Screen to Venue
  const [targetVenueId, setTargetVenueId] = useState('');
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenType, setNewScreenType] = useState('standard');
  const [newScreenLayout, setNewScreenLayout] = useState([
    { row_id: 'A', seat_count: 5, seat_category: 'regular' },
  ]);

  // Form State 3: Add Seats to Screen
  const [targetScreenId, setTargetScreenId] = useState('');
  const [customSeatsLayout, setCustomSeatsLayout] = useState([
    { row_id: 'A', seat_count: 5, seat_category: 'regular' },
  ]);

  // Form State 4: Create Event
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventScreenId, setEventScreenId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [venuesRes, screensRes, eventsRes, bookingsRes] = await Promise.allSettled([
        api.get('/venues/'),
        api.get('/screens/'),
        api.get('/events/'),
        api.get('/bookings/'),
      ]);

      const venuesData = venuesRes.status === 'fulfilled' ? venuesRes.value.data || [] : [];
      const screensData = screensRes.status === 'fulfilled' ? screensRes.value.data || [] : [];
      const eventsData = eventsRes.status === 'fulfilled' ? eventsRes.value.data || [] : [];
      const bookingsData = bookingsRes.status === 'fulfilled' ? bookingsRes.value.data || [] : [];

      setAllVenues(venuesData);
      setAllScreens(screensData);
      setAllEvents(eventsData);
      setAllBookings(bookingsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      setError('Failed to sync admin platform collections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchDashboardData();
    }
  }, [role]);

  if (role !== 'admin') {
    return <Navigate to="/events" replace />;
  }

  // --- Handlers for Venue Onboarding ---
  const addScreenToVenueOnboard = () => {
    setVenueScreens([
      ...venueScreens,
      { name: '', screen_type: 'standard', layout: [{ row_id: 'A', seat_count: 5, seat_category: 'regular' }] },
    ]);
  };

  const removeScreenFromVenueOnboard = (index) => {
    setVenueScreens(venueScreens.filter((_, i) => i !== index));
  };

  const updateVenueScreenField = (screenIndex, field, value) => {
    const updated = [...venueScreens];
    updated[screenIndex][field] = value;
    setVenueScreens(updated);
  };

  const addRowToVenueScreen = (screenIndex) => {
    const updated = [...venueScreens];
    updated[screenIndex].layout.push({ row_id: '', seat_count: 5, seat_category: 'regular' });
    setVenueScreens(updated);
  };

  const removeRowFromVenueScreen = (screenIndex, rowIndex) => {
    const updated = [...venueScreens];
    updated[screenIndex].layout = updated[screenIndex].layout.filter((_, i) => i !== rowIndex);
    setVenueScreens(updated);
  };

  const updateVenueRowField = (screenIndex, rowIndex, field, value) => {
    const updated = [...venueScreens];
    updated[screenIndex].layout[rowIndex][field] = value;
    setVenueScreens(updated);
  };

  const handleOnboardVenue = async (e) => {
    e.preventDefault();
    if (!venueName || !address || !city) {
      toast.error('Please complete venue information');
      return;
    }

    try {
      const response = await api.post('/venues/onboard', {
        name: venueName,
        address,
        city,
        screens: venueScreens.map((s) => ({
          ...s,
          layout: s.layout.map((r) => ({ ...r, seat_count: Number(r.seat_count) })),
        })),
      });

      toast.success(`Venue onboarded! ID: #${response.data.id}`);
      setVenueName('');
      setAddress('');
      setCity('');
      setVenueScreens([{ name: '', screen_type: 'standard', layout: [{ row_id: 'A', seat_count: 5, seat_category: 'regular' }] }]);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to onboard venue');
    }
  };

  // --- Handlers for Add Screen to Venue ---
  const handleAddScreenToVenue = async (e) => {
    e.preventDefault();
    if (!targetVenueId || !newScreenName) {
      toast.error('Select a venue and provide screen name');
      return;
    }

    try {
      const response = await api.post(`/venues/${targetVenueId}/screens`, {
        name: newScreenName,
        screen_type: newScreenType,
        layout: newScreenLayout.map((r) => ({ ...r, seat_count: Number(r.seat_count) })),
      });

      toast.success(`Screen added to venue! Screen ID: #${response.data.id}`);
      setTargetVenueId('');
      setNewScreenName('');
      setNewScreenType('standard');
      setNewScreenLayout([{ row_id: 'A', seat_count: 5, seat_category: 'regular' }]);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add screen to venue');
    }
  };

  // --- Handlers for Add Seats to Screen ---
  const handleAddSeatsToScreen = async (e) => {
    e.preventDefault();
    if (!targetScreenId) {
      toast.error('Select a target screen');
      return;
    }

    try {
      const payload = customSeatsLayout.map((r) => ({ ...r, seat_count: Number(r.seat_count) }));
      const response = await api.post(`/screens/${targetScreenId}/seats`, payload);

      toast.success(`Added ${response.data?.length || 0} seats to Screen #${targetScreenId}`);
      setTargetScreenId('');
      setCustomSeatsLayout([{ row_id: 'A', seat_count: 5, seat_category: 'regular' }]);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add seats to screen');
    }
  };

  // --- Handlers for Create Event ---
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventName || !eventScreenId || !startTime || !endTime) {
      toast.error('Please complete all event fields');
      return;
    }

    try {
      const response = await api.post('/events/', {
        name: eventName,
        description: eventDescription,
        start_time: startTime,
        end_time: endTime,
        screen_id: Number(eventScreenId),
      });

      toast.success(`Event created! ID: #${response.data.id}`);
      setEventName('');
      setEventDescription('');
      setEventScreenId('');
      setStartTime('');
      setEndTime('');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create event');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center">
            <LayoutDashboard className="w-8 h-8 mr-3 text-primary-600" />
            Admin Platform Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Manage venues, screens, seats, events, and system resources.</p>
        </div>

        <Badge variant="primary" className="self-start md:self-auto text-xs px-3 py-1 uppercase tracking-wider">
          Super Admin Mode
        </Badge>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Total Venues</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : allVenues.length}</h2>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Building2 className="w-5 h-5" /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Total Screens</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : allScreens.length}</h2>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Monitor className="w-5 h-5" /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Total Events</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : allEvents.length}</h2>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Calendar className="w-5 h-5" /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Total Bookings</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : allBookings.length}</h2>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Ticket className="w-5 h-5" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 space-x-8">
        <button
          onClick={() => setActiveTab('venues')}
          className={`pb-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'venues' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          1. Venue Management ({allVenues.length})
        </button>
        <button
          onClick={() => setActiveTab('screens')}
          className={`pb-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'screens' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          2. Screen & Seat Setup ({allScreens.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'events' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          3. Event Management ({allEvents.length})
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

      {/* TAB 1: VENUE MANAGEMENT */}
      {activeTab === 'venues' && (
        <div className="space-y-8">
          {/* Create / Onboard Venue */}
          <Card className="border-slate-100">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-primary-600" />
                Onboard New Venue (with Screens & Seats)
              </h3>

              <form onSubmit={handleOnboardVenue} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Venue Name</label>
                    <input
                      placeholder="e.g. Cinema Central"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                    <input
                      placeholder="e.g. 500 Grand Ave"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      placeholder="e.g. San Francisco"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Screens Builder */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Configure Screens for Venue</h4>
                  {venueScreens.map((screen, screenIndex) => (
                    <div key={screenIndex} className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">Screen #{screenIndex + 1}</span>
                        {venueScreens.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScreenFromVenueOnboard(screenIndex)}
                            className="text-xs font-semibold text-rose-600 hover:underline flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove Screen
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          placeholder="Screen Name (e.g. Screen 1 / IMAX)"
                          value={screen.name}
                          onChange={(e) => updateVenueScreenField(screenIndex, 'name', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
                          required
                        />
                        <select
                          value={screen.screen_type}
                          onChange={(e) => updateVenueScreenField(screenIndex, 'screen_type', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-white"
                        >
                          <option value="standard">Standard</option>
                          <option value="imax">IMAX</option>
                          <option value="4dx">4dx</option>
                        </select>
                      </div>

                      {/* Rows Configuration */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Seat Rows</span>
                        {screen.layout.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg">
                            <input
                              placeholder="Row ID (e.g. A)"
                              value={row.row_id}
                              onChange={(e) => updateVenueRowField(screenIndex, rowIndex, 'row_id', e.target.value)}
                              className="w-24 px-2.5 py-1.5 rounded border border-slate-200 text-xs outline-none bg-white"
                              required
                            />
                            <input
                              type="number"
                              placeholder="Seat Count"
                              value={row.seat_count}
                              onChange={(e) => updateVenueRowField(screenIndex, rowIndex, 'seat_count', e.target.value)}
                              className="w-28 px-2.5 py-1.5 rounded border border-slate-200 text-xs outline-none bg-white"
                              required
                            />
                            <select
                              value={row.seat_category}
                              onChange={(e) => updateVenueRowField(screenIndex, rowIndex, 'seat_category', e.target.value)}
                              className="w-32 px-2 py-1.5 rounded border border-slate-200 text-xs outline-none bg-white"
                            >
                              <option value="regular">regular</option>
                              <option value="premium">premium</option>
                              <option value="reclinear">reclinear</option>
                            </select>
                            {screen.layout.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRowFromVenueScreen(screenIndex, rowIndex)}
                                className="text-rose-600 text-xs font-medium px-2"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addRowToVenueScreen(screenIndex)}
                          className="text-xs font-bold text-primary-600 flex items-center pt-1"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Row
                        </button>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="secondary" size="sm" onClick={addScreenToVenueOnboard}>
                    + Add Another Screen
                  </Button>
                </div>

                <div>
                  <Button type="submit">Onboard Venue</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* List Existing Venues */}
          <Card className="border-slate-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-primary-600" />
                Existing Venues
              </h3>

              {allVenues.length === 0 ? (
                <p className="text-slate-400 text-sm">No venues onboarded yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allVenues.map((v) => (
                    <div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-400">ID #{v.id}</span>
                        <Badge variant="info">{v.city}</Badge>
                      </div>
                      <h4 className="font-bold text-slate-900">{v.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {v.address}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: SCREEN & SEAT SETUP */}
      {activeTab === 'screens' && (
        <div className="space-y-8">
          {/* Add Screen to Existing Venue */}
          <Card className="border-slate-100">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-primary-600" />
                Add Screen to Existing Venue
              </h3>

              <form onSubmit={handleAddScreenToVenue} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Venue</label>
                  <select
                    value={targetVenueId}
                    onChange={(e) => setTargetVenueId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-white"
                    required
                  >
                    <option value="">-- Select Venue --</option>
                    {allVenues.map((v) => (
                      <option key={v.id} value={v.id}>
                        #{v.id} — {v.name} ({v.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Screen Name</label>
                    <input
                      placeholder="e.g. Screen 2 / 4dx"
                      value={newScreenName}
                      onChange={(e) => setNewScreenName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Screen Type</label>
                    <select
                      value={newScreenType}
                      onChange={(e) => setNewScreenType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-white"
                    >
                      <option value="standard">Standard</option>
                      <option value="imax">IMAX</option>
                      <option value="4dx">4dx</option>
                    </select>
                  </div>
                </div>

                <Button type="submit">Add Screen to Venue</Button>
              </form>
            </CardContent>
          </Card>

          {/* Add Seats to Screen */}
          <Card className="border-slate-100">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Armchair className="w-5 h-5 mr-2 text-primary-600" />
                Add Seat Rows Layout to Screen
              </h3>

              <form onSubmit={handleAddSeatsToScreen} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Screen</label>
                  <select
                    value={targetScreenId}
                    onChange={(e) => setTargetScreenId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-white"
                    required
                  >
                    <option value="">-- Select Screen --</option>
                    {allScreens.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.venue_name} — {s.name} ({s.screen_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Seat Rows Configuration</span>
                  {customSeatsLayout.map((row, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg">
                      <input
                        placeholder="Row (e.g. B)"
                        value={row.row_id}
                        onChange={(e) => {
                          const updated = [...customSeatsLayout];
                          updated[idx].row_id = e.target.value;
                          setCustomSeatsLayout(updated);
                        }}
                        className="w-24 px-2.5 py-1.5 rounded border border-slate-200 text-xs outline-none bg-white"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Count"
                        value={row.seat_count}
                        onChange={(e) => {
                          const updated = [...customSeatsLayout];
                          updated[idx].seat_count = e.target.value;
                          setCustomSeatsLayout(updated);
                        }}
                        className="w-24 px-2.5 py-1.5 rounded border border-slate-200 text-xs outline-none bg-white"
                        required
                      />
                      <select
                        value={row.seat_category}
                        onChange={(e) => {
                          const updated = [...customSeatsLayout];
                          updated[idx].seat_category = e.target.value;
                          setCustomSeatsLayout(updated);
                        }}
                        className="w-32 px-2 py-1.5 rounded border border-slate-200 text-xs outline-none bg-white"
                      >
                        <option value="regular">regular</option>
                        <option value="premium">premium</option>
                        <option value="reclinear">reclinear</option>
                      </select>
                    </div>
                  ))}
                </div>

                <Button type="submit">Generate & Save Seats</Button>
              </form>
            </CardContent>
          </Card>

          {/* List Existing Screens */}
          <Card className="border-slate-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-primary-600" />
                Active Screens List
              </h3>

              {allScreens.length === 0 ? (
                <p className="text-slate-400 text-sm">No screens created yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {allScreens.map((s) => (
                    <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-400">ID #{s.id}</span>
                        <Badge variant="info" className="uppercase text-[10px]">{s.screen_type}</Badge>
                      </div>
                      <h4 className="font-bold text-slate-900 mt-1">{s.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">Venue ID: #{s.venue_id}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: EVENT MANAGEMENT */}
      {activeTab === 'events' && (
        <div className="space-y-8">
          {/* Create Event Form */}
          <Card className="border-slate-100">
            <CardContent className="p-6 max-w-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                Publish New Event
              </h3>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Title</label>
                  <input
                    placeholder="e.g. World Concert Tour"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    placeholder="Event details..."
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Screen</label>
                  <select
                    value={eventScreenId}
                    onChange={(e) => setEventScreenId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-white"
                    required
                  >
                    <option value="">-- Choose Screen --</option>
                    {allScreens.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.venue_name}  — {s.name} ({s.screen_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
                      required
                    />
                  </div>
                </div>

                <Button type="submit">Create Event</Button>
              </form>
            </CardContent>
          </Card>

          {/* List Created Events */}
          <Card className="border-slate-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                Created Events
              </h3>

              {allEvents.length === 0 ? (
                <p className="text-slate-400 text-sm">No events scheduled.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Event Name</th>
                        <th className="py-3 px-4">Screen ID</th>
                        <th className="py-3 px-4">Start Time</th>
                        <th className="py-3 px-4">End Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allEvents.map((evt) => (
                        <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900">#{evt.id}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{evt.name}</td>
                          <td className="py-3 px-4">Screen #{evt.screen_id}</td>
                          <td className="py-3 px-4">{new Date(evt.start_time).toLocaleString()}</td>
                          <td className="py-3 px-4">{new Date(evt.end_time).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;