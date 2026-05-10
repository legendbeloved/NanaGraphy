import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar as CalendarIcon, User, Phone, MessageSquare, ArrowRight, ArrowLeft, CheckCircle2, Star, Gift, CreditCard } from 'lucide-react';
import { AVENTA_PACKAGES } from '../constants';
import { cn } from '../utils';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { getSiteSettings } from '../services/supabaseAdmin';

const bookingSchema = z.object({
  clientName: z.string().min(2, 'Name is required'),
  clientPhone: z.string().min(5, 'Valid phone number required'),
  isGift: z.boolean(),
  giftRecipientName: z.string().optional(),
  giftRecipientPhone: z.string().min(5, 'Valid phone number required').optional().or(z.literal('')),
  giftMessage: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  serviceType: z.enum(['Basic', 'Standard', 'Premium']),
  datePreference: z.array(z.date()).optional(),
  message: z.string().min(10, 'Please provide a bit more detail (min 10 chars)'),
}).superRefine((data, ctx) => {
  if (data.isGift) {
    if (!data.giftRecipientName || data.giftRecipientName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Recipient name is required',
        path: ['giftRecipientName']
      });
    }
    if (!data.giftRecipientPhone || data.giftRecipientPhone.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valid recipient phone required',
        path: ['giftRecipientPhone']
      });
    }
  } else {
    if (!data.datePreference || data.datePreference.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select at least one date',
        path: ['datePreference']
      });
    }
  }
});

type BookingFormData = z.infer<typeof bookingSchema>;

const Book = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors }, trigger, watch, control } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceType: 'Basic',
      isGift: false,
      isAnonymous: false,
      datePreference: [],
    }
  });

  const isGift = watch('isGift');
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  React.useEffect(() => {
    getSiteSettings().then(settings => {
      if (settings?.about_content?.payment_link) {
        setPaymentLink(settings.about_content.payment_link);
      }
    });
  }, []);

  const nextStep = async () => {
    let fieldsToValidate: (keyof BookingFormData)[] = [];
    if (step === 1) {
      fieldsToValidate = ['clientName', 'clientPhone'];
      if (isGift) {
        fieldsToValidate.push('giftRecipientName', 'giftRecipientPhone');
      }
    }
    if (step === 2) fieldsToValidate = ['serviceType', 'datePreference'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  };

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit booking');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('There was an issue sending your inquiry. Please try again.');
    }
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
              Thank you for reaching out, Nana will get back to you within 48 hours to discuss your Aventa.
            </p>
          </div>
          <div className="space-y-4">
            {paymentLink && (
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium hover:scale-105 transition-transform"
              >
                <CreditCard className="w-5 h-5" />
                <span>Proceed to Payment</span>
              </a>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-4 bg-ink text-cream dark:bg-cream dark:text-ink rounded-full font-medium hover:scale-105 transition-transform"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div className="space-y-4">
            <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-50">Purchase an Aventa</span>
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
                  <CalendarIcon className="w-4 h-4 opacity-50" />
                </div>
                <p className="text-sm font-medium uppercase tracking-widest opacity-60">Flexible Scheduling</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-sand/20 flex items-center justify-center">
                  <Gift className="w-4 h-4 opacity-50" />
                </div>
                <p className="text-sm font-medium uppercase tracking-widest opacity-60">Beautifully Gifted</p>
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
                      <label className="text-xs font-medium uppercase tracking-widest opacity-50 ml-4">Phone Number (WhatsApp)</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                        <input
                          type="tel"
                          {...register('clientPhone')}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                        />
                      </div>
                      {errors.clientPhone && <p className="text-xs text-red-500 ml-4">{errors.clientPhone.message}</p>}
                    </div>

                    <div className="pt-4 pb-2">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          {...register('isGift')}
                          className="w-5 h-5 rounded border-black/20 text-ink focus:ring-ink transition-colors"
                        />
                        <span className="text-sm font-medium uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">Purchase as a Gift?</span>
                      </label>
                    </div>

                    {isGift && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6 pt-4 border-t border-black/10 dark:border-white/10"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-widest opacity-50 ml-4">Recipient Name</label>
                          <input
                            {...register('giftRecipientName')}
                            placeholder="Recipient Name"
                            className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                          />
                          {errors.giftRecipientName && <p className="text-xs text-red-500 ml-4">{errors.giftRecipientName.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-widest opacity-50 ml-4">Recipient Phone (WhatsApp)</label>
                          <input
                            type="tel"
                            {...register('giftRecipientPhone')}
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                          />
                          {errors.giftRecipientPhone && <p className="text-xs text-red-500 ml-4">{errors.giftRecipientPhone.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-widest opacity-50 ml-4">Gift Message (Optional)</label>
                          <textarea
                            {...register('giftMessage')}
                            rows={3}
                            placeholder="Add a special note..."
                            className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all resize-none"
                          />
                        </div>

                        <div className="pt-2 pb-2">
                          <label className="flex items-center space-x-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              {...register('isAnonymous')}
                              className="w-5 h-5 rounded border-black/20 text-ink focus:ring-ink transition-colors"
                            />
                            <span className="text-sm font-medium uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">Send Anonymously?</span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-50 ml-4">Aventa Package</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {AVENTA_PACKAGES.map(pkg => (
                          <label key={pkg.id} className="relative cursor-pointer group">
                            <input
                              type="radio"
                              value={pkg.id}
                              {...register('serviceType')}
                              className="peer sr-only"
                            />
                            <div className="p-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl peer-checked:border-ink peer-checked:bg-ink peer-checked:text-cream dark:peer-checked:bg-cream dark:peer-checked:border-cream dark:peer-checked:text-ink transition-all flex flex-col items-center justify-center text-center space-y-2 h-full">
                              <span className="font-display text-lg">{pkg.label}</span>
                              <span className="text-[10px] uppercase tracking-widest opacity-70 block">{pkg.basePrice}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {!isGift && (
                      <div className="space-y-4 flex flex-col items-center justify-center pt-4">
                        <label className="text-xs font-medium uppercase tracking-widest opacity-50 pb-2 w-full ml-4">Preferred Dates (Select Multiple)</label>
                        <div className="bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-[2rem] p-6 shadow-inner w-full flex justify-center">
                          <Controller
                            name="datePreference"
                            control={control}
                            render={({ field }) => (
                              <DayPicker
                                mode="multiple"
                                min={1}
                                selected={field.value || []}
                                onSelect={field.onChange}
                                className="font-sans border-0 w-full flex align-middle justify-center p-0 m-0 [&_.rdp-day_button]:!rounded-full [&_.rdp-day]:hover:!bg-black/5 dark:[&_.rdp-day]:hover:!bg-white/5 [&_.rdp-day_button[aria-selected='true']]:!bg-ink dark:[&_.rdp-day_button[aria-selected='true']]:!bg-cream [&_.rdp-day_button[aria-selected='true']]:!text-cream dark:[&_.rdp-day_button[aria-selected='true']]:!text-ink"
                              />
                            )}
                          />
                        </div>
                        {errors.datePreference && <p className="text-xs text-red-500 w-full text-center">{errors.datePreference.message}</p>}
                      </div>
                    )}
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
                          rows={6}
                          placeholder={isGift ? "Any specific vision or details the recipient would love for their Aventa..." : "Tell me about your vision for the Aventa..."}
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
                    className="flex items-center space-x-2 px-8 py-4 bg-ink text-cream dark:bg-cream dark:text-ink rounded-full font-medium hover:scale-105 transition-transform shadow-lg"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-10 py-4 bg-ink text-cream dark:bg-cream dark:text-ink rounded-full font-medium hover:scale-105 transition-transform shadow-xl"
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
