import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Gift, CheckCircle2, ArrowRight } from 'lucide-react';
import { getBookingById, updateBookingDates, BookingRow } from '../services/supabaseAdmin';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format } from 'date-fns';

const RedeemGift = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    getBookingById(id)
      .then(data => {
        setBooking(data);
        if (data.preferred_date) {
          setSelectedDates([new Date(data.preferred_date)]);
        }
      })
      .catch(err => {
        console.error("Error fetching gift booking:", err);
        setError("We couldn't find this gift. Please check the link and try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const extractGiftMessage = (notes: string | null) => {
    if (!notes) return "Enjoy your Aventa session!";
    const match = notes.match(/Message:\s*(.*)/);
    if (match && match[1]) {
      // Clean up the trailing parts if needed
      return match[1].split(' | ')[0].trim();
    }
    return "Enjoy your Aventa session!";
  };

  const handleConfirmDates = async () => {
    if (!id || selectedDates.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const formattedDate = selectedDates[0].toISOString().split('T')[0];
      await updateBookingDates(id, formattedDate);
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to update dates", err);
      alert("There was an issue saving your dates. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin w-8 h-8 border-2 border-ink border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-display mb-4">Oops!</h1>
        <p className="opacity-70 mb-8">{error}</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-ink text-cream rounded-full">Return Home</button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8 p-12 bg-white dark:bg-ink/50 rounded-[3rem] shadow-2xl border border-black/5 dark:border-white/5"
        >
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-display">Dates Confirmed!</h2>
            <p className="text-lg font-light opacity-70">
              Your preferred date has been saved. Nana will be in touch with you shortly to finalize the details of your Aventa.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-ink text-cream dark:bg-cream dark:text-ink rounded-full font-medium hover:scale-105 transition-transform"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  const giftMessage = extractGiftMessage(booking.additional_notes);

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
      <div className="space-y-12 text-center mb-16">
        <div className="w-20 h-20 bg-ink text-cream dark:bg-cream dark:text-ink rounded-full flex items-center justify-center mx-auto shadow-xl">
          <Gift className="w-10 h-10" />
        </div>
        <div className="space-y-4">
          <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-50">You've been gifted an</span>
          <h1 className="text-6xl md:text-8xl font-display leading-[0.9]">Aventa Session</h1>
        </div>
        
        <div className="max-w-2xl mx-auto glass p-8 rounded-3xl mt-8 italic text-lg opacity-80 border border-black/10">
          "{giftMessage}"
          <span className="block mt-4 text-sm font-bold not-italic opacity-100 uppercase tracking-widest">— {booking.client_name}</span>
        </div>
      </div>

      <div className="glass dark:glass-dark p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-2xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-display">When works best for you?</h3>
            <p className="text-sm opacity-70">Please select your preferred dates for the session.</p>
          </div>

          <div className="bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-[2rem] p-6 shadow-inner w-full flex justify-center">
            <DayPicker
              mode="multiple"
              min={1}
              selected={selectedDates}
              onSelect={(dates) => setSelectedDates(dates || [])}
              className="font-sans border-0 w-full flex align-middle justify-center p-0 m-0 [&_.rdp-day_button]:!rounded-full [&_.rdp-day]:hover:!bg-black/5 dark:[&_.rdp-day]:hover:!bg-white/5 [&_.rdp-day_button[aria-selected='true']]:!bg-ink dark:[&_.rdp-day_button[aria-selected='true']]:!bg-cream [&_.rdp-day_button[aria-selected='true']]:!text-cream dark:[&_.rdp-day_button[aria-selected='true']]:!text-ink"
            />
          </div>

          <button
            onClick={handleConfirmDates}
            disabled={selectedDates.length === 0 || isSubmitting}
            className="w-full py-4 bg-ink text-cream dark:bg-cream dark:text-ink rounded-full font-medium hover:scale-105 transition-transform shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            <span>{isSubmitting ? 'Confirming...' : 'Confirm Date'}</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedeemGift;
