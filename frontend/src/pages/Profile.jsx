import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import api from '../api/axios';
import { User, Shield, Ticket, CheckCircle2, XCircle, LogOut, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/bookings');
        const bookings = response.data || [];
        
        const summary = bookings.reduce(
          (acc, b) => {
            acc.total += 1;
            if (b.booking_status === 'confirmed') acc.confirmed += 1;
            else if (b.booking_status === 'cancelled') acc.cancelled += 1;
            else acc.pending += 1;
            return acc;
          },
          { total: 0, confirmed: 0, cancelled: 0, pending: 0 }
        );
        setStats(summary);
      } catch (err) {
        console.error('Failed to load booking statistics', err);
        setError('Could not fetch booking history statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userId = user?.id || localStorage.getItem('user_id') || 'N/A';
  const role = user?.role || localStorage.getItem('role') || 'User';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account details and view your booking summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <Card className="md:col-span-1 border-slate-100">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Account Profile</h2>
            <div className="mt-3 inline-flex items-center gap-1.5">
              <Badge variant={role === 'admin' ? 'primary' : 'info'} className="capitalize">
                <Shield className="w-3.5 h-3.5 mr-1" />
                {role}
              </Badge>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3 text-sm">
              <div>
                <span className="text-slate-400 block text-xs">User ID</span>
                <span className="font-semibold text-slate-800">#{userId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Account Status</span>
                <span className="font-medium text-emerald-600 flex items-center mt-0.5">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Active
                </span>
              </div>
            </div>

            <div className="mt-8">
              <Button variant="secondary" onClick={handleLogout} className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Booking Summary & Quick Actions */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <Ticket className="w-5 h-5 mr-2 text-primary-600" />
                  Booking Summary
                </h3>
                <Link to="/my-bookings">
                  <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <LoadingSpinner message="Calculating booking summary..." size="sm" />
              ) : error ? (
                <ErrorMessage message={error} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                    <span className="text-2xl font-black text-slate-900">{stats.total}</span>
                    <span className="block text-xs font-medium text-slate-500 mt-1">Total Bookings</span>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                    <span className="text-2xl font-black text-emerald-700">{stats.confirmed}</span>
                    <span className="block text-xs font-medium text-emerald-600 mt-1">Confirmed</span>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
                    <span className="text-2xl font-black text-rose-700">{stats.cancelled}</span>
                    <span className="block text-xs font-medium text-rose-600 mt-1">Cancelled</span>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                    <span className="text-2xl font-black text-amber-700">{stats.pending}</span>
                    <span className="block text-xs font-medium text-amber-600 mt-1">Pending</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Ready for your next experience?</h3>
              <p className="text-primary-100 text-sm mb-6">
                Browse thousands of live concerts, shows, movies, and sports events.
              </p>
              <Link to="/events">
                <Button className="bg-white text-primary-600 hover:bg-primary-50 border-none font-semibold">
                  Browse Upcoming Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
