import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, User, Mail, MessageSquare, ArrowRight, ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import { SERVICE_TYPES } from '../constants';
import { cn } from '../utils';
import { storage } from '../services/storageService';
import { sendBookingNotification } from '../services/emailService';

const bookingSchema = z.object({
  clientName: z.string().min(2, 'Name is required'),
  clientEmail: z.string().email('Invalid email address'),
  serviceType: z.enum(['Portrait', 'Lifestyle', 'Event', 'Other']),
  datePreference: z.string().min(1, 'Date preference is required'),
  message: z.string().min(10, 'Please provide a bit more detail (min 10 chars)'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const Book = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceType: 'Portrait'
    }
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof BookingFormData)[] = [];
    if (step === 1) fieldsToValidate = ['clientName', 'clientEmail'];
    if (step === 2) fieldsToValidate = ['serviceType', 'datePreference'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  };

  const onSubmit = async (data: BookingFormData) => {
    const booking = {
      id: crypto.randomUUID(),
      ...data,
      status: 'Pending' as const,
      createdAt: new Date()
    };
    
    storage.saveBooking(booking);
    
    // Send email notification
    await sendBookingNotification(booking);
    
    setIsSubmitted(true);
  };

  if (isSubmitted) {
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
            <h2 className="text-4xl font-display">Inquiry Sent</h2>
            <p className="text-lg font-light opacity-70">
              Thank you for reaching out, Nana will get back to you within 48 hours to discuss your session.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-ink text-cream rounded-full font-medium hover:scale-105 transition-transform"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div className="space-y-4">
            <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-50">Booking</span>
            <h1 className="text-6xl md:text-8xl font-display leading-[0.9]">Let's Work Together</h1>
          </div>
          
          <div className="space-y-8">
            <p className="text-xl font-light leading-relaxed opacity-70">
              I'm thrilled that you're considering me to capture your story. Please fill out the form, and I'll be in touch soon.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-sand/20 flex items-center justify-center">
                  <Star className="w-4 h-4 opacity-50" />
                </div>
                <p className="text-sm font-medium uppercase tracking-widest opacity-60">Personalized Experience</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-sand/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 opacity-50" />
                </div>
                <p className="text-sm font-medium uppercase tracking-widest opacity-60">Flexible Scheduling</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="glass dark:glass-dark p-8 md:p-12 rounded-[3rem] shadow-2xl">
            {/* Progress Bar */}
            <div className="flex justify-between mb-12">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={cn(
                    "w-full h-1 rounded-full transition-all duration-500",
                    s <= step ? "bg-ink dark:bg-cream" : "bg-black/10 dark:bg-white/10",
                    s < 3 ? "mr-4" : ""
                  )}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-50 ml-4">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                        <input
                          {...register('clientName')}
                          placeholder="Your Name"
                          className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                        />
                      </div>
                      {errors.clientName && <p className="text-xs text-red-500 ml-4">{errors.clientName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-50 ml-4">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                        <input
                          {...register('clientEmail')}
                          placeholder="hello@example.com"
                          className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                        />
                      </div>
                      {errors.clientEmail && <p className="text-xs text-red-500 ml-4">{errors.clientEmail.message}</p>}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-50 ml-4">Service Type</label>
                      <select
                        {...register('serviceType')}
                        className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all appearance-none"
                      >
                        {SERVICE_TYPES.map(type => (
                          <option key={type} value={type}>{type} Session</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-50 ml-4">Preferred Date / Month</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                        <input
                          {...register('datePreference')}
                          placeholder="e.g. Mid-October or Oct 15th"
                          className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                        />
                      </div>
                      {errors.datePreference && <p className="text-xs text-red-500 ml-4">{errors.datePreference.message}</p>}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-50 ml-4">Tell me more</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 w-4 h-4 opacity-30" />
                        <textarea
                          {...register('message')}
                          rows={5}
                          placeholder="Tell me about your vision for the session..."
                          className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all resize-none"
                        />
                      </div>
                      {errors.message && <p className="text-xs text-red-500 ml-4">{errors.message.message}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex items-center space-x-2 text-sm font-medium uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}
                <div className="flex-grow" />
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center space-x-2 px-8 py-4 bg-ink text-cream rounded-full font-medium hover:scale-105 transition-transform"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-10 py-4 bg-ink text-cream rounded-full font-medium hover:scale-105 transition-transform shadow-xl"
                  >
                    Send Inquiry
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
