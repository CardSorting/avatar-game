import React from 'react';

interface StepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  steps: string[];
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, onStepClick, steps }) => {
  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-indigo-600 transition-all duration-500 rounded-full -z-10"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div 
              key={label} 
              className={`flex flex-col items-center gap-2 cursor-pointer group ${isActive || isCompleted ? 'text-indigo-400' : 'text-slate-600'}`}
              onClick={() => onStepClick(stepNum)}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 z-10 bg-slate-900 
                  ${isActive ? 'border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110' : ''}
                  ${isCompleted ? 'border-indigo-600 bg-indigo-600 text-white' : ''}
                  ${!isActive && !isCompleted ? 'border-slate-700 text-slate-500 group-hover:border-slate-500' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};