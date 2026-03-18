import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Calendar, User, Camera } from 'lucide-react';

const BookingConfirmation = () => {
  const location = useLocation();
  const booking = location.state?.booking;

  if (!booking) {
    return <Navigate to="/book" replace />;
  }

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-cream dark:bg-ink">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-8"
        >
          <CheckCircle size={48} />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-display mb-6"
        >
          Your inquiry has been received!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-fog font-light text-lg mb-12"
        >
          Thank you for reaching out, {booking.fullName.split(' ')[0]}. 
          Nana will review your vision and get in touch within 48 hours to discuss the next steps.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass dark:glass-dark p-8 rounded-[2rem] text-left space-y-6 mb-12"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-sand border-b border-black/5 pb-4">
            Summary of your inquiry
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <Camera className="w-5 h-5 text-sand mt-1" />
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-50">Service</p>
                <p className="font-medium">{booking.serviceType}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Calendar className="w-5 h-5 text-sand mt-1" />
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-50">Preferred Date</p>
                <p className="font-medium">{booking.preferredDate}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <User className="w-5 h-5 text-sand mt-1" />
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-50">Contact</p>
                <p className="font-medium">{booking.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <p className="text-sm italic opacity-60">
            In the meantime, explore the latest stories in the portfolio.
          </p>
          <Link to="/portfolio" className="btn-primary inline-flex items-center space-x-2">
            <span>Explore Portfolio</span>
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
