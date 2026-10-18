
import React, { useState, useRef } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { DEFAULT_AVATAR_PROMPT } from '../../constants';

interface IdeationStepProps {
  onGenerate: (prompt: string, referenceImage?: string) => void;
  onBatchGenerate: (items: { prompt: string; referenceImage?: string }[]) => void;
  isGenerating: boolean;
}

const JSON_TEMPLATE = `[
  {
    "prompt": "A cyberpunk street vendor selling neon noodles, cinematic lighting"
  },
  {
    "prompt": "A portrait of a robot gardener in a greenhouse, detailed 8k"
  },
  {
    "prompt": "An astronaut floating in a nebula, digital art style, synthwave colors"
  }
]`;

export const IdeationStep: React.FC<IdeationStepProps> = ({ onGenerate, onBatchGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState(DEFAULT_AVATAR_PROMPT);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy Template');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(JSON_TEMPLATE);
    setCopyButtonText("Copied! ✓");
    setTimeout(() => setCopyButtonText("Copy Template"), 2000);
    if (!jsonInput.trim()) {
        setJsonInput(JSON_TEMPLATE);
    }
  };

  const handleBatchSubmit = () => {
    setJsonError(null);
    try {
        const parsed = JSON.parse(jsonInput);
        if (!Array.isArray(parsed)) {
            throw new Error("Input must be a JSON array (start with [ and end with ])");
        }
        
        const validItems = parsed.filter(item => item && typeof item.prompt === 'string' && item.prompt.trim().length > 0);
        
        if (validItems.length === 0) {
            throw new Error("No valid items found. Each item must have a 'prompt' string property.");
        }

        onBatchGenerate(validItems);
        setIsJsonModalOpen(false);
        setJsonInput('');
    } catch (err: any) {
        setJsonError(err.message || "Invalid JSON format");
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in">
      <div className="bg-slate-800/40 rounded-2xl p-8 border border-slate-700/50 shadow-xl backdrop-blur-sm relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 text-3xl">
            💡
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create Your Concept</h2>
          <p className="text-slate-400">Describe your character or upload a reference sketch to start.</p>
        </div>

        {/* Batch Toggle Button */}
        <div className="absolute top-8 right-8 hidden md:block">
            <button 
                onClick={() => setIsJsonModalOpen(true)}
                disabled={isGenerating}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/10 transition-colors disabled:opacity-50"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                Batch JSON
            </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Left: Input Controls */}
          <div className="flex-1 space-y-6">
            
            {/* Prompt Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Text Description</label>
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                  placeholder="E.g., A cyberpunk samurai with neon armor..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-5 text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-40 text-slate-200 placeholder-slate-600 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="absolute bottom-4 right-4 text-xs font-mono text-slate-500 pointer-events-none bg-slate-800/80 px-2 py-1 rounded">
                  {prompt.length} chars
                </div>
              </div>
            </div>

            {/* Image Upload Trigger */}
            {!referenceImage && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Reference Image (Optional)</label>
                <div 
                  onClick={() => !isGenerating && fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-slate-800/50 hover:border-indigo-500/50 group
                    ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-indigo-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-sm text-slate-300 font-medium group-hover:text-indigo-300">Upload Concept Image</p>
                  <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG (Max 5MB)</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isGenerating}
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => onGenerate(prompt, referenceImage || undefined)} 
                  disabled={isGenerating || !prompt.trim()} 
                  isLoading={isGenerating}
                  className="w-full py-4 text-lg shadow-xl shadow-indigo-900/20 mt-2"
                >
                  {isGenerating ? 'Forging Character...' : 'Generate Concept'}
                </Button>
                
                {/* Mobile only batch button */}
                <button 
                    onClick={() => setIsJsonModalOpen(true)}
                    disabled={isGenerating}
                    className="md:hidden w-full text-center text-xs text-indigo-400 py-2 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10 disabled:opacity-50"
                >
                    Or use Batch JSON Import
                </button>
            </div>
          </div>

          {/* Right: Image Preview (Only visible if image uploaded) */}
          {referenceImage && (
            <div className="w-full md:w-64 shrink-0 animate-scale-in">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 mb-2 block">Reference</label>
              <div className="relative group rounded-xl overflow-hidden border border-indigo-500/30 shadow-lg bg-black/40">
                <img 
                  src={referenceImage} 
                  alt="Reference" 
                  className="w-full h-auto max-h-64 object-contain"
                />
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGenerating}
                    className="text-white text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur-sm transition-colors"
                  >
                    Change Image
                  </button>
                  <button 
                    onClick={clearImage}
                    disabled={isGenerating}
                    className="text-red-300 text-xs bg-red-500/10 hover:bg-red-500/30 px-3 py-1.5 rounded-lg border border-red-500/20 backdrop-blur-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-center text-slate-500 mt-2">
                This image will guide the AI generation process.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-6">
          <span>Powered by</span>
          <span className="font-mono text-indigo-400">gemini-2.5-flash-image</span>
        </div>
      </div>

      {/* JSON Batch Modal */}
      <Modal isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} title="Batch Creation via JSON">
         <div className="p-6 space-y-4">
            <p className="text-sm text-slate-300">
                Paste a JSON array of objects to create multiple avatars at once. Each object must have a <code className="text-indigo-300">prompt</code> property.
            </p>

            <div className="relative">
                <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={JSON_TEMPLATE}
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
                <Button variant="primary" onClick={handleBatchSubmit} disabled={!jsonInput.trim()}>
                    Process Batch
                </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
