import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Calendar, Ticket, Shield, Zap, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden pt-16 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
            >
              <h1>
                <span className="block text-sm font-semibold uppercase tracking-wide text-primary-600">
                  Introducing Eventify
                </span>
                <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                  <span className="block text-slate-900">The easiest way to</span>
                  <span className="block text-primary-600">book your next event</span>
                </span>
              </h1>
              <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Experience seamless ticket booking for concerts, movies, sports, and more. 
                Fast, secure, and hassle-free booking at your fingertips.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/events">
                    <Button size="lg" className="w-full sm:w-auto">
                      Explore Events
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      Sign Up Now
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
            >
              <div className="relative mx-auto w-full rounded-2xl shadow-lg lg:max-w-md overflow-hidden">
                <img
                  className="w-full"
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Event background"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="font-medium text-lg italic">"Best booking experience ever!"</p>
                    <p className="text-sm opacity-80">- Sarah Jenkins, Music Lover</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Everything you need to book tickets
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500">
              Our platform provides a robust and intuitive experience for both users and organizers.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Real-time Availability',
                  description: 'See live seat availability and book your favorite spot instantly.',
                  icon: Zap,
                  color: 'text-blue-600',
                  bg: 'bg-blue-100',
                },
                {
                  title: 'Secure Payments',
                  description: 'Rest easy with our industry-standard secure payment processing.',
                  icon: Shield,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-100',
                },
                {
                  title: 'Instant Confirmation',
                  description: 'Get your tickets delivered to your dashboard and email immediately.',
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
                  <p className="text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Simple Steps</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              How it works
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-12 left-1/2 -ml-0.5 w-0.5 h-full bg-slate-100 hidden lg:block" />
            <div className="space-y-16 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
              {[
                { step: '01', title: 'Find Event', description: 'Browse our extensive list of upcoming events.' },
                { step: '02', title: 'Choose Seats', description: 'Pick your preferred seats from the interactive map.' },
                { step: '03', title: 'Book & Enjoy', description: 'Complete payment and get ready for the show!' },
              ].map((item, index) => (
                <div key={item.step} className="relative text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-4">
                    <span className="text-5xl font-black text-slate-100 absolute -top-8 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 z-0">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg relative z-10 shadow-lg shadow-primary-200">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">{item.title}</h3>
                  <p className="text-slate-500 relative z-10">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to experience something new?
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Join thousands of users who book their tickets with Eventify.
          </p>
          <div className="mt-8">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
