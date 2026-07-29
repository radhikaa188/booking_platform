import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Calendar, Ticket, Shield, Zap, ArrowRight, Star, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white overflow-hidden pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
            >
              <h1>
                <span className="block text-sm font-semibold uppercase tracking-wider text-primary-600">
                  Introducing Eventify
                </span>
                <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                  <span className="block text-slate-900">The easiest way to</span>
                  <span className="block text-primary-600">book your next event</span>
                </span>
              </h1>
              <p className="mt-4 text-base text-slate-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Experience seamless ticket booking for live concerts, movies, sports, and theatre.
                Fast, secure seat holding with instant payment confirmation.
              </p>

              {/* Search Bar CTA */}
              <form onSubmit={handleSearchSubmit} className="mt-8 sm:max-w-lg sm:mx-auto lg:mx-0">
                <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-200">
                  <div className="relative flex-grow flex items-center pl-3">
                    <Search className="w-5 h-5 text-slate-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search live events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent text-slate-900 focus:outline-none text-sm placeholder-slate-400 py-2"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    Search Events
                  </Button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap gap-4 items-center sm:justify-center lg:justify-start">
                <Link to="/events">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Explore All Events
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/signup">
                  <span className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
                    New user? Create account &rarr;
                  </span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
            >
              <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden">
                <img
                  className="w-full h-96 object-cover"
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Event atmosphere"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="font-medium text-lg italic">"Instant hold and smooth payment!"</p>
                    <p className="text-sm opacity-80">- Verified Booking Experience</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Why Choose Eventify?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500">
              Built for speed, fairness, and reliability during high-demand ticket sales.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Real-Time Seat Locks',
                  description: 'Hold your seat for 5 minutes while completing payment without losing your spot.',
                  icon: Zap,
                  color: 'text-blue-600',
                  bg: 'bg-blue-100',
                },
                {
                  title: 'Idempotent Payments',
                  description: 'Safe payment processing prevents duplicate charges even during network retries.',
                  icon: Shield,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-100',
                },
                {
                  title: 'Instant Confirmation',
                  description: 'Get immediate booking references and manage your tickets directly from your profile.',
                  icon: Ticket,
                  color: 'text-purple-600',
                  bg: 'bg-purple-100',
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className={`inline-flex items-center justify-center p-3 rounded-xl ${feature.bg} ${feature.color} mb-5`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to book your next live event?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Browse upcoming concerts, shows, and venues now.
          </p>
          <div className="mt-8">
            <Link to="/events">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50 font-bold border-none">
                Browse Events Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
