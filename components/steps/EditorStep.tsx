
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar, AvatarState, Trait, QueueItem } from '../../types';
import { Button } from '../Button';
import { TraitSelector } from '../TraitSelector';
import { Modal } from '../Modal';
import { TRAITS } from '../../constants';

const EDIT_JSON_PROMPT_TEMPLATE = `[
  {
    "id": "neon_hair",
    "prompt": "Change hair to bright neon green"
  },
  {
    "id": "retro_glasses",
    "prompt": "Add vintage neon pink 80s sunglasses"
  },
  {
    "id": "galaxy_background",
    "prompt": "Set background to a starry purple galaxy"
  }
]`;

const EDIT_JSON_TEMPLATE = `[
  {
    "id": "pfp_neon_arcade_runner",
    "background": {
      "description": "dark navy gradient with faint pixel glow noise"
    },
    "costume_visible_region_only": {
      "description": "cropped tech-jacket collar with neon piping along neckline and shoulders"
    },
    "accessories": {
      "primary": "neon joystick hair clip near the temple",
      "secondary": "D-pad ear cuff hugging the ear rim",
      "micro_details": "LED pixel face stickers under each eye",
      "material_notes": "chrome polymer, matte nylon, LED acrylic"
    },
    "vfx_sfx": {
      "description": "soft RGB scanline glow washing across the cheeks"
    },
    "additional_elements": {
      "description": "tiny holographic power-up icons floating near the temples"
    },
    "facial_expression": {
      "description": "confident gamer grin, pixel-reflected pupils, electric blush under the eyes"
    }
  },
  {
    "id": "pfp_crimson_samurai",
    "background": {
      "description": "deep crimson fog with falling embers"
    },
    "facial_expression": {
      "description": "stoic focused expression, golden eyes"
    }
  }
]`;

// Helper to convert complex JSON objects into a natural language prompt
const convertJsonToInstruction = (item: any): string => {
  // 1. Direct Instruction (Simple Format)
  if (typeof item.instruction === 'string') return item.instruction;
  if (typeof item.prompt === 'string') return item.prompt;

  // 2. Smart Parsing for Specific Schema (User Provided Format)
  const parts: string[] = [];
  
  if (item.background?.description) {
      parts.push(`Change background to ${item.background.description}`);
  }
  
  if (item.costume_visible_region_only?.description) {
      parts.push(`Wear ${item.costume_visible_region_only.description}`);
  }
  
  if (item.facial_expression?.description) {
      parts.push(`Expression: ${item.facial_expression.description}`);
  }
  
  if (item.accessories) {
      const acc = [];
      if (item.accessories.primary) acc.push(item.accessories.primary);
      if (item.accessories.secondary) acc.push(item.accessories.secondary);
      if (item.accessories.micro_details) acc.push(item.accessories.micro_details);
      
      if (acc.length > 0) {
          parts.push(`Add accessories: ${acc.join(', ')}`);
      }
      if (item.accessories.material_notes) {
          parts.push(`Materials: ${item.accessories.material_notes}`);
      }
  }

  if (item.vfx_sfx?.description) {
      parts.push(`Add visual effects: ${item.vfx_sfx.description}`);
  }
  
  if (item.additional_elements?.description) {
      parts.push(`Details: ${item.additional_elements.description}`);
  }

  // 3. Fallback: Recursive string collection for unknown schemas
  if (parts.length === 0) {
      const collectStrings = (obj: any) => {
          Object.entries(obj).forEach(([key, val]) => {
              if (key === 'id') return; // Skip IDs
              if (typeof val === 'string' && val.length > 0) {
                  parts.push(val);
              } else if (typeof val === 'object' && val !== null) {
                  collectStrings(val);
              }
          });
      };
      collectStrings(item);
  }

  return parts.join('. ');
};

// Internal component for optimized image rendering with double-buffering
const ImagePreview: React.FC<{ src: string; alt: string; isLoading: boolean; loadingMessage?: string }> = ({ src, alt, isLoading, loadingMessage }) => {
  const [displaySrc, setDisplaySrc] = useState(src);
  const [previousSrc, setPreviousSrc] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // If the incoming source is different from what we are displaying
    if (src !== displaySrc) {
      setPreviousSrc(displaySrc); // Capture current state as previous
      setIsTransitioning(true);   // Start transition state (hides foreground)
      
      // Create a loader to ensure data is ready before flipping switch
      const loader = new Image();
      loader.src = src;
      loader.onload = () => {
        setDisplaySrc(src);
        // Short delay to ensure DOM update, then reveal
        requestAnimationFrame(() => {
            setIsTransitioning(false);
        });
      };
    }
  }, [src, displaySrc]);

  return (
    <div className="relative w-full h-full bg-slate-900">
      {/* Background Layer (Previous Image) - Keeps view stable during transition */}
      {previousSrc && (isTransitioning || isLoading) && (
        <img 
            src={previousSrc} 
            alt="Previous State" 
            className="absolute inset-0 w-full h-full object-contain opacity-50 blur-[2px] scale-105 transition-all duration-700" 
        />
      )}
      
      {/* Foreground Layer (Active Image) */}
      <img 
        ref={imgRef}
        src={displaySrc} 
        alt={alt} 
        decoding="async"
        className={`w-full h-full object-contain relative z-10 transition-all duration-500 ease-out transform
          ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
      />

      {/* Loading Overlay */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-20 transition-all duration-300
        ${isLoading ? 'bg-slate-900/60 opacity-100 visible' : 'bg-transparent opacity-0 invisible pointer-events-none'}`}
      >
        <div className="bg-slate-900/80 p-4 rounded-2xl shadow-2xl border border-indigo-500/30 flex flex-col items-center animate-bounce-in">
            <svg className="animate-spin h-8 w-8 text-indigo-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-indigo-200 font-bold text-xs uppercase tracking-widest">{loadingMessage || 'Processing'}</span>
        </div>
      </div>
    </div>
  );
};

const BatchFilmstrip: React.FC<{ 
  avatars: Avatar[]; 
  selectedId: string; 
  onSelect: (id: string) => void; 
}> = ({ avatars, selectedId, onSelect }) => {
  if (avatars.length === 0) return null;

  return (
    <div className="mt-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800 backdrop-blur-sm animate-fade-in">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session Buffer</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">Latest {avatars.length}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 snap-x">
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => onSelect(avatar.id)}
            className={`
              relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border transition-all snap-start group
              ${avatar.id === selectedId 
                ? 'border-indigo-500 ring-2 ring-indigo-500/30 opacity-100 scale-105 z-10' 
                : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500 hover:scale-105'}
            `}
          >
            <img 
              src={avatar.imageData} 
              alt={avatar.prompt} 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
            {/* Active Indicator */}
            {avatar.id === selectedId && (
              <div className="absolute inset-0 ring-inset ring-2 ring-indigo-500 rounded-lg"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

interface EditorStepProps {
  avatar: Avatar;
  state: AvatarState;
  actions: any;
}

type EditorMode = 'instant' | 'batch';
type TabType = 'traits' | 'text';

export const EditorStep: React.FC<EditorStepProps> = ({ avatar, state, actions }) => {
  const [mode, setMode] = useState<EditorMode>('instant');
  const [activeTab, setActiveTab] = useState<TabType>('traits');
  
  // Instant mode state
  const [editPrompt, setEditPrompt] = useState('');

  // Batch text mode state
  const [textInput, setTextInput] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [isBulkPasteMode, setIsBulkPasteMode] = useState(false);

  // JSON Modal State
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy Template');
  const [selectedTemplateTab, setSelectedTemplateTab] = useState<'prompt' | 'schema'>('prompt');

  const [activeTraitId, setActiveTraitId] = useState<string | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  
  // Ref for auto-scrolling the queue
  const queueEndRef = useRef<HTMLDivElement>(null);

  // Buffer state: Recent 20 avatars for filmstrip
  const bufferAvatars = state.avatars.slice(0, 20);

  // Switch mode automatically if batch is running
  useEffect(() => {
    if (state.loadingState === 'batching') {
      setMode('batch');
    }
  }, [state.loadingState]);

  // Auto-scroll queue when items added
  useEffect(() => {
    if (state.queue.length > 0) {
      queueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.queue.length]);

  const handleManualEditSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim()) return;
    
    if (mode === 'instant') {
        actions.edit(editPrompt);
        setEditPrompt('');
    }
  }, [actions, editPrompt, mode]);

  const handleSingleTextSubmit = useCallback(() => {
      if (!textInput.trim()) return;
      actions.addTextToQueue(textInput);
      setTextInput('');
  }, [textInput, actions]);

  const handleBulkTextSubmit = useCallback(() => {
      if (!bulkText.trim()) return;
      const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      lines.forEach(line => actions.addTextToQueue(line));
      setBulkText('');
      setIsBulkPasteMode(false); // Switch back to single mode after bulk add
  }, [bulkText, actions]);

  const handleCopyTemplate = () => {
    const activeTemplate = selectedTemplateTab === 'prompt' ? EDIT_JSON_PROMPT_TEMPLATE : EDIT_JSON_TEMPLATE;
    navigator.clipboard.writeText(activeTemplate);
    setCopyButtonText("Copied! ✓");
    setTimeout(() => setCopyButtonText("Copy Template"), 1500);
    if (!jsonInput.trim()) {
        setJsonInput(activeTemplate);
    }
  };

  const handleTabChange = (tab: 'prompt' | 'schema') => {
    setSelectedTemplateTab(tab);
    const otherTemplate = tab === 'prompt' ? EDIT_JSON_TEMPLATE : EDIT_JSON_PROMPT_TEMPLATE;
    const currentTemplate = tab === 'prompt' ? EDIT_JSON_PROMPT_TEMPLATE : EDIT_JSON_TEMPLATE;
    if (!jsonInput.trim() || jsonInput.trim() === otherTemplate.trim()) {
      setJsonInput(currentTemplate);
    }
  };

  const handleBatchJsonSubmit = () => {
    setJsonError(null);
    try {
        const parsed = JSON.parse(jsonInput);
        if (!Array.isArray(parsed)) {
            throw new Error("Input must be a JSON array (start with [ and end with ])");
        }
        
        const validItems: QueueItem[] = parsed
            .map((item: any): QueueItem | null => {
                // Use smart helper to convert object to string
                const instruction = convertJsonToInstruction(item);
                if (!instruction) return null;

                return {
                    id: crypto.randomUUID(),
                    type: 'text',
                    label: item.id || (instruction.length > 30 ? instruction.slice(0, 30) + '...' : instruction),
                    prompt: instruction,
                    icon: '⚡'
                };
            })
            .filter((item): item is QueueItem => item !== null);
        
        if (validItems.length === 0) {
            throw new Error("No valid instructions could be parsed from the JSON.");
        }

        // Append to existing queue
        actions.setQueue([...state.queue, ...validItems]);
        setIsJsonModalOpen(false);
        setJsonInput('');
    } catch (err: any) {
        setJsonError(err.message || "Invalid JSON format");
    }
  };

  const handleTraitClick = useCallback(async (trait: Trait) => {
    if (mode === 'instant') {
      setActiveTraitId(trait.id);
      await actions.edit(trait.promptSuffix);
      setActiveTraitId(null);
    } else {
      actions.addTraitToQueue(trait);
    }
  }, [actions, mode]);

  const handleRandomize = useCallback(async () => {
    if (state.loadingState !== 'idle') return;
    
    // Shuffle and pick 2-3 traits
    const shuffled = [...TRAITS].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 2) + 2; 
    const selected = shuffled.slice(0, count);

    if (mode === 'instant') {
      setIsRandomizing(true);
      const prompt = selected.map(t => t.promptSuffix).join('. ');
      await actions.edit(prompt);
      setIsRandomizing(false);
    } else {
      // In sequence mode, randomize adds to the queue
      const queueItems: QueueItem[] = selected.map(t => ({
          id: crypto.randomUUID(),
          type: 'trait',
          label: t.name,
          prompt: t.promptSuffix,
          icon: t.icon,
          traitId: t.id
      }));
      actions.setQueue([...state.queue, ...queueItems]);
    }
  }, [state.loadingState, state.queue, actions, mode]);

  const downloadAvatar = useCallback(() => {
    const link = document.createElement('a');
    link.href = avatar.imageData;
    link.download = `nano-banana-${avatar.id.slice(0, 6)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [avatar.imageData, avatar.id]);

  const isLoading = state.loadingState !== 'idle';
  const isBatching = state.loadingState === 'batching';

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full animate-fade-in">
      {/* Left Column: Visualizer */}
      <div className="flex-1 lg:max-w-md">
        <div className="sticky top-24 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl aspect-square group ring-1 ring-white/5">
             <ImagePreview 
                src={avatar.imageData} 
                alt={avatar.prompt} 
                isLoading={isLoading}
                loadingMessage={isBatching ? `Processing Variation ${state.batchProgress?.current} of ${state.batchProgress?.total}` : undefined}
             />
            
            {/* Download Button */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
              <button 
                onClick={downloadAvatar}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur border border-white/10 transition-colors shadow-lg"
                title="Download"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
            
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 z-20 pointer-events-none">
              <div className="flex items-center gap-2 mb-1">
                 {mode === 'batch' && (
                   <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/30 border border-emerald-500/30 px-1.5 rounded uppercase">Variations Mode</span>
                 )}
                 {avatar.parentId && (
                   <span className="text-[10px] font-mono text-slate-400 bg-slate-800/50 px-1.5 rounded uppercase">Evolved</span>
                 )}
              </div>
              <p className="text-white/90 text-sm font-medium line-clamp-2 drop-shadow-md">{avatar.prompt}</p>
            </div>
          </div>

          {/* New Image Buffer Filmstrip */}
          <BatchFilmstrip 
            avatars={bufferAvatars}
            selectedId={avatar.id}
            onSelect={actions.selectAvatar}
          />
          
          {/* Instant Mode Manual Input */}
          {mode === 'instant' && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm animate-fade-in">
               <form onSubmit={handleManualEditSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Custom instruction (e.g., 'Make it cybernetic')"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    isLoading={state.loadingState === 'editing' && !activeTraitId && !isRandomizing}
                    disabled={!editPrompt.trim()}
                    variant="secondary"
                    className="whitespace-nowrap"
                  >
                    Apply
                  </Button>
                </form>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Controls */}
      <div className="flex-1 bg-slate-800/40 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-6 lg:max-h-[800px] lg:overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* Mode Switcher Header */}
        <div className="mb-6 pb-4 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 w-fit">
               <button 
                  onClick={() => setMode('instant')}
                  disabled={isBatching}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'instant' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                  Instant Edit
               </button>
               <button 
                  onClick={() => setMode('batch')}
                  disabled={isBatching}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'batch' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                  Batch Variations
               </button>
            </div>
            
            <button 
              onClick={handleRandomize}
              disabled={isLoading}
              className="text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRandomizing ? (
                 <>
                   <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   <span>Thinking...</span>
                 </>
              ) : (
                <>
                  <span>🎲</span> {mode === 'instant' ? 'Surprise Me' : 'Add Random'}
                </>
              )}
            </button>
        </div>

        {/* Sequence Queue UI (Only in Batch Mode) */}
        {mode === 'batch' && (
           <div className={`mb-8 p-5 rounded-xl border border-dashed transition-all animate-scale-in flex flex-col gap-4 
             ${state.queue.length > 0 ? 'bg-slate-950 border-indigo-500/30' : 'bg-slate-800/30 border-slate-700/30'}
           `}>
             
             {/* HEADER AND CLEAR BUTTON */}
             <div className="flex items-center justify-between border-b border-slate-800 pb-2">
               <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                   <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Staging Area</span>
                   <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-mono border border-slate-700">{state.queue.length} Pending</span>
               </div>
               {state.queue.length > 0 && !isBatching && (
                   <button onClick={actions.clearQueue} className="text-xs text-red-400 hover:text-red-300 transition-colors opacity-70 hover:opacity-100">Clear All</button>
               )}
             </div>

             {/* GLOBAL PROGRESS BAR */}
             {isBatching && state.batchProgress && (
               <div className="w-full space-y-1.5 bg-slate-900 p-3 rounded-lg border border-indigo-500/20 shadow-inner">
                 <div className="flex justify-between text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                    <span>Batch Progress</span>
                    <span>{Math.round((state.batchProgress.current / state.batchProgress.total) * 100)}%</span>
                 </div>
                 <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-500 ease-out relative"
                      style={{ width: `${(state.batchProgress.current / state.batchProgress.total) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite] w-full h-full"></div>
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-500 text-center pt-1">
                    Processing {state.batchProgress.current} of {state.batchProgress.total} variations...
                 </p>
               </div>
             )}
             
             {/* QUEUE LIST */}
             {state.queue.length === 0 ? (
               <div className="text-center py-8 text-slate-500 text-sm flex flex-col items-center">
                 <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-3 border border-slate-800">
                    <span className="text-xl opacity-50">🎨</span>
                 </div>
                 <p className="font-medium text-slate-400">Variations Queue Empty</p>
                 <span className="text-xs opacity-60 mt-1 max-w-[200px]">Add traits or custom instructions below to build a batch job.</span>
               </div>
             ) : (
               <div className="relative pl-4">
                   {/* Vertical Connector Line for Branching */}
                   <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-900/50 rounded-full"></div>
                   
                   <div className="grid grid-cols-1 gap-2 relative max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                       {state.queue.map((item, idx) => {
                         const currentStep = state.batchProgress?.current || 0;
                         const hasError = !!state.error;

                         // Determine Status
                         let status: 'pending' | 'processing' | 'success' | 'failure' = 'pending';
                         if (state.batchProgress) {
                            if (idx + 1 < currentStep) status = 'success';
                            else if (idx + 1 === currentStep) {
                                status = hasError ? 'failure' : 'processing';
                            }
                         }

                         return (
                           <div key={item.id} className="relative group">
                             {/* Connector Branch */}
                             <div className="absolute -left-4 top-1/2 w-4 h-0.5 bg-indigo-900/50 -translate-y-1/2"></div>
                             
                             <div 
                               className={`flex items-center gap-3 bg-slate-900 text-slate-300 text-sm p-3 rounded-lg border shadow-sm animate-pop-in transition-all duration-300 overflow-hidden
                                 ${status === 'processing' ? 'border-indigo-500 ring-1 ring-indigo-500/50 bg-indigo-950/80 shadow-indigo-900/20' : ''}
                                 ${status === 'success' ? 'border-emerald-800 bg-emerald-950/30 opacity-75 grayscale-[0.3]' : ''}
                                 ${status === 'failure' ? 'border-red-500 bg-red-900/20' : ''}
                                 ${status === 'pending' ? 'border-slate-800 hover:border-slate-600' : ''}
                               `}
                             >
                               {/* Status Indicator */}
                               <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono border z-10 shrink-0 transition-all duration-300
                                   ${status === 'processing' ? 'bg-indigo-600 border-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/50' : ''}
                                   ${status === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : ''}
                                   ${status === 'failure' ? 'bg-red-600 border-red-500 text-white' : ''}
                                   ${status === 'pending' ? 'bg-slate-800 border-slate-700 text-slate-500' : ''}
                                 `}>
                                   {status === 'processing' ? (
                                     <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                     </svg>
                                   ) : status === 'success' ? (
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                   ) : status === 'failure' ? (
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                   ) : (
                                      idx + 1
                                   )}
                               </span>

                               {/* Icon / Content */}
                               <span className="text-xl w-8 text-center">{item.icon}</span>
                               <div className="flex-1 min-w-0">
                                 <p className={`font-medium truncate transition-colors text-xs uppercase tracking-wide
                                   ${status === 'processing' ? 'text-indigo-300' : 'text-slate-400'}
                                 `}>
                                   Variation {idx + 1}
                                 </p>
                                 <p className={`text-sm truncate ${status === 'processing' ? 'text-white' : 'text-slate-200'}`}>
                                    {item.label}
                                 </p>
                                 
                                 {status === 'processing' && <p className="text-[10px] text-indigo-400 animate-pulse mt-0.5">Processing...</p>}
                               </div>

                               {/* Actions (Only visible when pending) */}
                               {!isBatching && (
                                 <button 
                                   onClick={() => actions.removeQueueItem(item.id)}
                                   className="text-slate-600 hover:text-red-400 transition-all p-2 rounded-lg hover:bg-slate-800"
                                   title="Remove variation"
                                 >
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                 </button>
                               )}
                             </div>
                           </div>
                         );
                       })}
                       <div ref={queueEndRef} />
                   </div>
               </div>
             )}

             <Button 
               onClick={actions.runBatch}
               className="w-full mt-2 py-3 text-sm font-bold shadow-lg shadow-indigo-900/20"
               isLoading={isBatching}
               disabled={state.queue.length === 0}
               variant="primary"
             >
               {isBatching ? 'Processing Batch...' : `Launch Batch (${state.queue.length} Variations)`}
             </Button>
           </div>
        )}

        {/* Tools Tabs */}
        <div>
            <div className="flex border-b border-slate-700 mb-4">
                <button
                    onClick={() => setActiveTab('traits')}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 
                        ${activeTab === 'traits' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}
                    `}
                >
                    Visual Traits
                </button>
                <button
                    onClick={() => setActiveTab('text')}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2
                        ${activeTab === 'text' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}
                    `}
                >
                    Custom Instructions
                </button>
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'traits' && (
                    <TraitSelector 
                        onTraitClick={handleTraitClick}
                        disabled={isLoading} 
                        selectedTraitIds={mode === 'batch' ? state.queue.map(i => i.traitId || '').filter(Boolean) : []} 
                        loadingTraitId={activeTraitId}
                    />
                )}

                {activeTab === 'text' && (
                    <div className="animate-fade-in space-y-4">
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                {mode === 'batch' ? 'Add Custom Instructions' : 'Enter Instruction'}
                            </label>
                            
                            {mode === 'batch' ? (
                                isBulkPasteMode ? (
                                    <>
                                        <textarea
                                            value={bulkText}
                                            onChange={(e) => setBulkText(e.target.value)}
                                            placeholder={`Enter multiple instructions, one per line.\nExample:\nMake it blue\nAdd sunglasses\nChange background to mars`}
                                            className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-3 placeholder-slate-600"
                                            disabled={isLoading}
                                        />
                                        <div className="flex flex-col gap-2">
                                            <Button 
                                                onClick={handleBulkTextSubmit}
                                                disabled={!bulkText.trim() || isLoading}
                                                className="w-full"
                                                variant="secondary"
                                            >
                                                Add All to Queue
                                            </Button>
                                            <button 
                                                onClick={() => setIsBulkPasteMode(false)}
                                                className="text-xs text-slate-500 hover:text-indigo-400 underline transition-colors"
                                            >
                                                Back to single entry
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSingleTextSubmit();
                                                    }
                                                }}
                                                placeholder="e.g., Change hair to neon green"
                                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600 disabled:opacity-50"
                                                disabled={isLoading}
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSingleTextSubmit}
                                                disabled={!textInput.trim() || isLoading}
                                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-3 flex items-center justify-center transition-colors"
                                                title="Add to queue"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-500 text-center mb-4">
                                            Press <span className="font-mono bg-slate-800 px-1 rounded text-slate-400">Enter</span> to add. Each item creates a unique variation.
                                        </p>
                                        <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-700/50">
                                            <button 
                                                onClick={() => setIsBulkPasteMode(true)}
                                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors group"
                                            >
                                                <span className="opacity-50 group-hover:opacity-100">📋</span> Paste Text List
                                            </button>
                                            <div className="w-px h-3 bg-slate-700"></div>
                                            <button 
                                                onClick={() => setIsJsonModalOpen(true)}
                                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors group"
                                            >
                                                <span className="opacity-50 group-hover:opacity-100">{}</span> Import JSON
                                            </button>
                                        </div>
                                    </>
                                )
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <p className="mb-2">Switch to "Batch Variations" mode above to enter multiple custom text instructions.</p>
                                    <p className="text-xs">In Instant Edit mode, use the input box under the image.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

       {/* JSON Batch Modal */}
      <Modal isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} title="Batch Edit via JSON">
         <div className="p-6 space-y-4">
            {/* Tabs Selector for Templates */}
            <div className="flex border-b border-slate-700/60 pb-1 gap-4">
              <button
                type="button"
                onClick={() => handleTabChange('prompt')}
                className={`pb-2 text-xs font-semibold border-b-2 transition-all ${
                  selectedTemplateTab === 'prompt'
                    ? 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Simple Prompt Template
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('schema')}
                className={`pb-2 text-xs font-semibold border-b-2 transition-all ${
                  selectedTemplateTab === 'schema'
                    ? 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Structured Schema Template
              </button>
            </div>

            {selectedTemplateTab === 'prompt' ? (
              <p className="text-sm text-slate-300 transition-all">
                Paste a JSON array of objects to create multiple avatars at once. Each object must have a <code className="text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded font-mono">prompt</code> property.
              </p>
            ) : (
              <p className="text-sm text-slate-300 transition-all">
                Paste a JSON array of objects to add multiple variations to your queue. You can use standard instructions or detailed schema objects.
              </p>
            )}

            <div className="relative">
                <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={selectedTemplateTab === 'prompt' ? EDIT_JSON_PROMPT_TEMPLATE : EDIT_JSON_TEMPLATE}
                    className="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-xs text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none custom-scrollbar"
                />
                 <button 
                    onClick={handleCopyTemplate}
                    className="absolute top-2 right-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600 transition-colors"
                >
                    {copyButtonText}
                </button>
            </div>

            {jsonError && (
                <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-200 text-xs flex items-center gap-2">
                    <span>⚠️</span> {jsonError}
                </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
                <Button variant="secondary" onClick={() => setIsJsonModalOpen(false)}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleBatchJsonSubmit} disabled={!jsonInput.trim()}>
                    Add to Queue
                </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
