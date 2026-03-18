import React from 'react';
import { cn } from '../../utils';

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressDots = ({ currentStep, totalSteps }: ProgressDotsProps) => {
  return (
    <div className="flex justify-center items-center space-x-4 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={i} className="flex items-center">
            <div
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                isCompleted ? "bg-sand" : isCurrent ? "border-2 border-ink dark:border-cream" : "bg-fog/30"
              )}
            />
            {i < totalSteps - 1 && (
              <div className={cn("w-8 h-[1px] ml-4", isCompleted ? "bg-sand" : "bg-fog/20")} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressDots;
