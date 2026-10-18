
import React from 'react';
import { Avatar, AvatarState, Trait, QueueItem } from '../../types';
import { Button } from '../Button';
import { TraitSelector } from '../TraitSelector';
import { TRAITS } from '../../constants';

interface SequencerStepProps {
  avatar: Avatar;
  state: AvatarState;
  actions: any;
}

export const SequencerStep: React.FC<SequencerStepProps> = ({ avatar, state, actions }) => {
  
  const handleRandomize = () => {
    // Shuffle and pick 3 to 5 traits
    const shuffled = [...TRAITS].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
    const selected = shuffled.slice(0, count);
    
    // Map selected traits to QueueItems
    const queueItems: QueueItem[] = selected.map(t => ({
      id: crypto.randomUUID(),
      type: 'trait',
      label: t.name,
      prompt: t.promptSuffix,
      icon: t.icon,
      traitId: t.id
    }));

    actions.setQueue(queueItems);
  };

  const handleTraitClick = (trait: Trait) => {
    const existing = state.queue.find(q => q.traitId === trait.id);
    if (existing) {
      actions.removeQueueItem(existing.id);
    } else {
      actions.addTraitToQueue(trait);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full animate-fade-in">
      {/* Left Column: Visualizer */}
      <div className="flex-1 lg:max-w-md">
        <div className="sticky top-24 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl aspect-square group">
            <img 
              src={avatar.imageData} 
              alt="Active Edit" 
              className="w-full h-full object-contain"
            />
            
            {/* Loading Overlay */}
            {state.loadingState === 'batching' && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center backdrop-blur-md z-10 transition-all">
                <div className="relative">
                  <svg className="animate-spin h-16 w-16 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="mt-6 text-center space-y-2">
                  <p className="text-indigo-200 font-display font-bold text-xl animate-pulse">Running Sequence...</p>
                  {state.batchProgress && (
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-indigo-400 text-sm font-mono">
                          Step {state.batchProgress.current} / {state.batchProgress.total}
                        </p>
                        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                            style={{ width: `${(state.batchProgress.current / state.batchProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4">
               <div className="flex items-center gap-2">
                 <span className="text-xs font-mono text-indigo-400 bg-indigo-900/30 border border-indigo-500/30 px-1.5 rounded">SEQ MODE</span>
                 <p className="text-white/90 text-sm font-medium line-clamp-1">{avatar.prompt}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Controls */}
      <div className="flex-1 bg-slate-800/40 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-6 lg:max-h-[800px] lg:overflow-y-auto custom-scrollbar">
        <div className="mb-6 pb-4 border-b border-slate-700/50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Sequence Builder</h3>
              <p className="text-xs text-slate-500">Select multiple traits to apply them in order.</p>
            </div>
            <button 
              onClick={handleRandomize}
              disabled={state.loadingState !== 'idle'}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>🎲</span> Randomize
            </button>
        </div>

        {/* Queue Visualization */}
        <div className={`mb-8 p-5 rounded-xl border transition-all ${state.queue.length > 0 ? 'bg-indigo-900/10 border-indigo-500/30' : 'bg-slate-800/30 border-slate-700/30 border-dashed'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Processing Queue</span>
            {state.queue.length > 0 && state.loadingState === 'idle' && (
                <button onClick={actions.clearQueue} className="text-xs text-red-400 hover:text-red-300">Clear All</button>
            )}
          </div>
          
          {state.queue.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              <span className="block mb-1 text-2xl opacity-50">📋</span>
              Select traits below to add to your sequence
            </div>
          ) : (
            <div className="space-y-2 mb-4 relative">
                {/* Visual Connector Line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-indigo-900/50 -z-10"></div>
                
                {state.queue.map((t, idx) => {
                  const isProcessing = state.loadingState === 'batching' && state.batchProgress?.current === idx + 1;
                  const isCompleted = state.loadingState === 'batching' && state.batchProgress && state.batchProgress.current > idx + 1;
                  
                  return (
                    <div 
                      key={`${t.id}-${idx}`} 
                      className={`flex items-center gap-3 bg-slate-900 text-slate-300 text-sm p-3 rounded-lg border shadow-sm animate-pop-in group transition-colors 
                        ${isProcessing ? 'border-indigo-500 ring-1 ring-indigo-500/50 bg-indigo-900/20' : 'border-slate-700'}
                        ${isCompleted ? 'border-green-800 opacity-70' : ''}
                      `}
                    >
                      <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-mono border z-10 
                          ${isProcessing ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}
                          ${isCompleted ? 'bg-green-700 border-green-600 text-green-100' : ''}
                        `}>
                          {isProcessing ? (
                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : isCompleted ? (
                             '✓'
                          ) : (
                             idx + 1
                          )}
                      </span>
                      <span className="text-lg">{t.icon}</span>
                      <span className={`font-medium flex-1 ${isProcessing ? 'text-indigo-300' : 'text-indigo-100'}`}>
                        {isProcessing ? `Applying ${t.label}...` : t.label}
                      </span>
                      {state.loadingState === 'idle' && (
                        <button 
                          onClick={() => actions.removeQueueItem(t.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          <Button 
            onClick={actions.runBatch}
            className="w-full"
            isLoading={state.loadingState === 'batching'}
            disabled={state.queue.length === 0}
            variant="primary"
          >
            Run Sequence ({state.queue.length})
          </Button>
        </div>

        <TraitSelector 
            onTraitClick={handleTraitClick}
            disabled={state.loadingState !== 'idle'} 
            selectedTraitIds={state.queue.map(t => t.traitId).filter((id): id is string => !!id)}
        />
      </div>
    </div>
  );
};
