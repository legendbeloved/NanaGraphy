import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BookingFormData } from '../../lib/validations/booking';
import { cn } from '../../utils';

const BUDGET_RANGES = [
  { id: '₦50k–₦100k', label: '₦50k–₦100k' },
  { id: '₦100k–₦250k', label: '₦100k–₦250k' },
  { id: '₦250k–₦500k', label: '₦250k–₦500k' },
  { id: '₦500k+', label: '₦500k+' },
];

const STYLE_TAGS = ['Natural', 'Candid', 'Dramatic', 'Minimal', 'Vibrant', 'Editorial'];

const Step3 = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<BookingFormData>();
  const selectedBudget = watch('budget');
  const selectedStyles = watch('styles') || [];

  const toggleStyle = (style: string) => {
    const current = [...selectedStyles];
    const index = current.indexOf(style);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(style);
    }
    setValue('styles', current, { shouldValidate: true });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-sand">Budget Range</label>
        <div className="grid grid-cols-2 gap-4">
          {BUDGET_RANGES.map((range) => (
            <label
              key={range.id}
              className={cn(
                "relative p-4 border rounded-2xl cursor-pointer transition-all text-center",
                selectedBudget === range.id 
                  ? "border-sand bg-sand/5 ring-1 ring-sand" 
                  : "border-black/10 dark:border-white/10 hover:border-sand/50"
              )}
            >
              <input
                type="radio"
                {...register('budget')}
                value={range.id}
                className="sr-only"
              />
              <span className="text-sm font-medium">{range.label}</span>
            </label>
          ))}
        </div>
        {errors.budget && <p className="text-xs text-red-500 mt-1" role="alert">{errors.budget.message}</p>}
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-sand">How would you describe your style?</label>
        <div className="flex flex-wrap gap-3">
          {STYLE_TAGS.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => toggleStyle(style)}
              className={cn(
                "px-4 py-2 rounded-full border text-xs font-medium transition-all",
                selectedStyles.includes(style)
                  ? "border-sand bg-sand text-white"
                  : "border-black/10 dark:border-white/10 hover:border-sand/50"
              )}
            >
              {style}
            </button>
          ))}
        </div>
        {errors.styles && <p className="text-xs text-red-500 mt-1" role="alert">{errors.styles.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-sand">Anything else I should know? (Optional)</label>
        <textarea
          {...register('additionalInfo')}
          rows={3}
          placeholder="Any specific questions or details..."
          className="input-field resize-none"
        />
      </div>
    </div>
  );
};

export default Step3;
