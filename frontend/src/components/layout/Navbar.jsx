import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { LogOut, User, Menu, X, Calendar, LayoutDashboard, History } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Events', path: '/events', icon: Calendar },
    ...(user ? [
      { label: 'My Bookings', path: '/my-bookings', icon: History },
      ...(user.role === 'admin' ? [{ label: 'Admin', path: '/admin', icon: LayoutDashboard }] : [])
    ] : [])
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Eventify
              </span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                >
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-slate-600 hover:text-primary-600">
                  <User className="w-5 h-5" />
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-100">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-3 text-base font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50"
              >
                <link.icon className="w-5 h-5 mr-3" />
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-100 px-4 space-y-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center text-base font-medium text-slate-600 hover:text-primary-600"
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left text-base font-medium text-slate-600 hover:text-primary-600"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
