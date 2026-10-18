
import React, { useState, useEffect, useRef } from 'react';
import { useAvatarStudio } from './hooks/useAvatarStudio';
import { Stepper } from './components/Stepper';
import { IdeationStep } from './components/steps/IdeationStep';
import { EditorStep } from './components/steps/EditorStep';
import { CollectionStep } from './components/steps/CollectionStep';

const STEPS = ['Ideation', 'Collection', 'Edit'];

const App: React.FC = () => {
  const { state, selectedAvatar, actions } = useAvatarStudio();
  const [currentStep, setCurrentStep] = useState(1);
  const prevAvatarIdRef = useRef<string | null>(null);

  // Auto-navigation logic
  useEffect(() => {
    // Detect if a NEW avatar has been selected (due to generation or selection)
    if (state.selectedAvatarId && state.selectedAvatarId !== prevAvatarIdRef.current) {
        // If we are on Step 1 (Ideation), move to Step 2 (Collection) after generation
        // This works for batch too, as soon as the first item is done, it switches to view the results
        if (currentStep === 1) {
            setCurrentStep(2);
        }
    }
    
    // Update ref
    prevAvatarIdRef.current = state.selectedAvatarId;
  }, [state.selectedAvatarId, currentStep]);

  const handleStepClick = (step: number) => {
    // Prevent entering Editor(3) if no avatar is selected
    if (step === 3 && !selectedAvatar) {
        return; 
    }
    setCurrentStep(step);
  };

  const handleCollectionSelect = (id: string) => {
    actions.selectAvatar(id);
    // Stay on collection step to show the action menu
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentStep(1)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-lg" role="img" aria-label="logo">🍌</span>
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight text-white">
              Nano<span className="text-indigo-400">Banana</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-xs text-slate-500 font-mono bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">
               gemini-2.5-flash-image
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
        
        {/* Stepper Navigation */}
        <Stepper 
          currentStep={currentStep} 
          onStepClick={handleStepClick}
          steps={STEPS} 
        />

        {/* View Switcher */}
        <div className="w-full mt-8">
            {currentStep === 1 && (
                <IdeationStep 
                    onGenerate={actions.generate}
                    onBatchGenerate={actions.generateBatch}
                    isGenerating={state.loadingState === 'generating' || state.loadingState === 'batching'}
                />
            )}

            {currentStep === 2 && (
                <CollectionStep 
                    avatars={state.avatars}
                    selectedAvatarId={state.selectedAvatarId}
                    onSelect={handleCollectionSelect}
                    onDeleteAll={actions.deleteAll}
                    onDeleteAvatar={actions.deleteAvatar}
                    onNavigateToEditor={() => setCurrentStep(3)}
                />
            )}

            {currentStep === 3 && !selectedAvatar && (
                <div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                    <p className="text-slate-500 mb-4">No avatar selected.</p>
                    <button 
                       onClick={() => setCurrentStep(2)}
                       className="text-indigo-400 hover:text-indigo-300 font-medium underline"
                    >
                        Go to Collection
                    </button>
                </div>
            )}

            {currentStep === 3 && selectedAvatar && (
                <EditorStep 
                    avatar={selectedAvatar}
                    state={state}
                    actions={actions}
                />
            )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-800 mt-auto">
         <p>Powered by Google Gemini API • NanoBanana Project</p>
      </footer>

      {/* Global Error Toast */}
      {state.error && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-red-950/90 text-red-50 p-4 rounded-xl shadow-2xl border border-red-500/50 flex items-start gap-3 backdrop-blur-md z-[100] animate-bounce-in">
          <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-red-200">System Error</h4>
            <p className="text-sm mt-1 opacity-90">{state.error}</p>
            <button onClick={actions.dismissError} className="text-xs font-semibold text-red-300 underline mt-3 hover:text-white transition-colors">Dismiss Message</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
