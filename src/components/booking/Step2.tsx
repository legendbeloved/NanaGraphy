import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BookingFormData } from '../../lib/validations/booking';
import { cn } from '../../utils';

const SERVICE_TYPES = [
  { id: 'Portraits', label: 'Portraits' },
  { id: 'Lifestyle Session', label: 'Lifestyle Session' },
  { id: 'Event Coverage', label: 'Event Coverage' },
  { id: 'Brand Shoot', label: 'Brand Shoot' },
];

const TIMES_OF_DAY = [
  { id: 'Golden Hour Morning', label: 'Golden Hour Morning' },
  { id: 'Midday', label: 'Midday' },
  { id: 'Golden Hour Evening', label: 'Golden Hour Evening' },
];

const Step2 = () => {
  const { register, watch, formState: { errors } } = useFormContext<BookingFormData>();
  const selectedService = watch('serviceType');
  const selectedTime = watch('preferredTime');
  const visionText = watch('vision') || '';

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-sand">Service Type</label>
        <div className="grid grid-cols-2 gap-4">
          {SERVICE_TYPES.map((type) => (
            <label
              key={type.id}
              className={cn(
                "relative p-4 border rounded-2xl cursor-pointer transition-all text-center",
                selectedService === type.id 
                  ? "border-sand bg-sand/5 ring-1 ring-sand" 
                  : "border-black/10 dark:border-white/10 hover:border-sand/50"
              )}
            >
              <input
                type="radio"
                {...register('serviceType')}
                value={type.id}
                className="sr-only"
              />
              <span className="text-sm font-medium">{type.label}</span>
            </label>
          ))}
        </div>
        {errors.serviceType && <p className="text-xs text-red-500 mt-1" role="alert">{errors.serviceType.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-sand">Preferred Date</label>
          <input
            {...register('preferredDate')}
            type="date"
            className={`input-field ${errors.preferredDate ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.preferredDate && <p className="text-xs text-red-500 mt-1" role="alert">{errors.preferredDate.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-sand">Location Preference</label>
          <input
            {...register('location')}
            placeholder="e.g. Lekki Conservation Centre"
            className={`input-field ${errors.location ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.location && <p className="text-xs text-red-500 mt-1" role="alert">{errors.location.message}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-sand">Preferred Time of Day</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIMES_OF_DAY.map((time) => (
            <label
              key={time.id}
              className={cn(
                "relative p-3 border rounded-xl cursor-pointer transition-all text-center text-xs",
                selectedTime === time.id 
                  ? "border-sand bg-sand/5 ring-1 ring-sand" 
                  : "border-black/10 dark:border-white/10 hover:border-sand/50"
              )}
            >
              <input
                type="radio"
                {...register('preferredTime')}
                value={time.id}
                className="sr-only"
              />
              <span className="font-medium">{time.label}</span>
            </label>
          ))}
        </div>
        {errors.preferredTime && <p className="text-xs text-red-500 mt-1" role="alert">{errors.preferredTime.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold uppercase tracking-widest text-sand">Brief description of what you envision</label>
          <span className={cn("text-[10px] font-medium", visionText.length > 180 ? "text-red-500" : "opacity-40")}>
            {visionText.length}/200
          </span>
        </div>
        <textarea
          {...register('vision')}
          rows={4}
          placeholder="Tell me about the mood, the story, and any specific ideas you have..."
          className={`input-field resize-none ${errors.vision ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        {errors.vision && <p className="text-xs text-red-500 mt-1" role="alert">{errors.vision.message}</p>}
      </div>
    </div>
  );
};

export default Step2;
