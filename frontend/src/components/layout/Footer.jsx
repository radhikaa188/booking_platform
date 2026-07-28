import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Eventify
            </span>
            <p className="mt-4 text-slate-500 text-sm">
              Making event booking simple and accessible for everyone. Book your favorite events with ease.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Platform</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/events" className="text-sm text-slate-600 hover:text-primary-600">Browse Events</Link></li>
              <li><Link to="/venues" className="text-sm text-slate-600 hover:text-primary-600">Venues</Link></li>
              <li><Link to="/pricing" className="text-sm text-slate-600 hover:text-primary-600">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/help" className="text-sm text-slate-600 hover:text-primary-600">Help Center</Link></li>
              <li><Link to="/contact" className="text-sm text-slate-600 hover:text-primary-600">Contact Us</Link></li>
              <li><Link to="/faq" className="text-sm text-slate-600 hover:text-primary-600">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/privacy" className="text-sm text-slate-600 hover:text-primary-600">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-slate-600 hover:text-primary-600">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-8 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Eventify Inc. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {/* Social icons placeholder */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
