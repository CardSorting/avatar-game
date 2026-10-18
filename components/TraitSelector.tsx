
import React from 'react';
import { Trait } from '../types';
import { TRAITS } from '../constants';

interface TraitSelectorProps {
  onTraitClick: (trait: Trait) => void;
  disabled?: boolean;
  selectedTraitIds?: string[]; // IDs of traits currently active in queue or selected
  loadingTraitId?: string | null; // ID of the trait currently being processed
}

export const TraitSelector: React.FC<TraitSelectorProps> = ({ 
  onTraitClick, 
  disabled,
  selectedTraitIds = [],
  loadingTraitId = null,
}) => {
  // Dynamically extract unique categories
  const categories = Array.from(new Set(TRAITS.map(t => t.category)));

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryTraits = TRAITS.filter(t => t.category === category);
        if (categoryTraits.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="h-px bg-slate-700 flex-1"></div>
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{category}</h3>
                <div className="h-px bg-slate-700 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categoryTraits.map((trait) => {
                const isSelected = selectedTraitIds.includes(trait.id);
                const isLoading = loadingTraitId === trait.id;
                
                // Active style indicates it's selected/in queue
                let baseStyle = "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-600";
                if (isSelected) {
                  baseStyle = "bg-indigo-900/50 border-indigo-500/50 text-indigo-100 ring-1 ring-indigo-500/30";
                }
                
                // Loading override
                if (isLoading) {
                   baseStyle = "bg-slate-700 border-indigo-500/50 text-indigo-200 cursor-wait";
                }

                return (
                  <button
                    key={trait.id}
                    onClick={() => onTraitClick(trait)}
                    disabled={disabled}
                    className={`relative flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 text-left text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm ${baseStyle}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center w-6 h-6 shrink-0">
                        <svg className="animate-spin h-4 w-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    ) : (
                      <span className="text-lg w-6 shrink-0 text-center grayscale group-hover:grayscale-0 transition-all scale-100 group-hover:scale-110" role="img" aria-label={trait.name}>{trait.icon}</span>
                    )}
                    
                    <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium leading-tight">{isLoading ? 'Applying...' : trait.name}</span>
                    </div>
                    
                    {isSelected && !isLoading && (
                      <span className="absolute top-1 right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
