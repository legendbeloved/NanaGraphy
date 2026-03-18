import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BookingFormData } from '../../lib/validations/booking';

const Step1 = () => {
  const { register, formState: { errors } } = useFormContext<BookingFormData>();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-sand">Full Name</label>
        <input
          {...register('fullName')}
          placeholder="John Doe"
          className={`input-field ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
          aria-invalid={errors.fullName ? "true" : "false"}
        />
        {errors.fullName && <p className="text-xs text-red-500 mt-1" role="alert">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-sand">Email Address</label>
        <input
          {...register('email')}
          type="email"
          placeholder="john@example.com"
          className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && <p className="text-xs text-red-500 mt-1" role="alert">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-sand">Phone Number</label>
        <input
          {...register('phone')}
          placeholder="+234 800 000 0000"
          className={`input-field ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
          aria-invalid={errors.phone ? "true" : "false"}
        />
        {errors.phone && <p className="text-xs text-red-500 mt-1" role="alert">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-sand">How did you find me?</label>
        <select
          {...register('referral')}
          className={`input-field appearance-none ${errors.referral ? 'border-red-500 focus:ring-red-500' : ''}`}
          aria-invalid={errors.referral ? "true" : "false"}
        >
          <option value="">Select an option</option>
          <option value="Instagram">Instagram</option>
          <option value="Google">Google</option>
          <option value="Referral">Referral</option>
          <option value="Other">Other</option>
        </select>
        {errors.referral && <p className="text-xs text-red-500 mt-1" role="alert">{errors.referral.message}</p>}
      </div>
    </div>
  );
};

export default Step1;
