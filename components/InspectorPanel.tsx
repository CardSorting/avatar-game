import React from 'react';
import { Avatar } from '../types';
import { Button } from './Button';

interface InspectorPanelProps {
  selectedAvatars: Avatar[];
  onClose: () => void;
  onNavigateToEditor: () => void;
  onDelete: (ids: string[]) => void;
  onDownload: (avatars: Avatar[]) => void;
  onViewDetails: (avatar: Avatar) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedAvatars,
  onClose,
  onNavigateToEditor,
  onDelete,
  onDownload,
  onViewDetails,
}) => {
  const count = selectedAvatars.length;
  const isBatch = count > 1;
  const primaryAvatar = selectedAvatars[0];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Empty State
  if (count === 0) {
    return (
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl h-[400px] flex flex-col items-center justify-center p-8 text-center text-slate-500 shadow-xl">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            </div>
            <p className="text-sm font-medium">Select an item to inspect</p>
            <p className="text-xs opacity-70 mt-1">Click multiple items to batch action</p>
        </div>
    );
  }

  // Batch Mode
  if (isBatch) {
      return (
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-in-right">
             <div className="p-4 border-b border-slate-700/50 bg-indigo-900/20 flex items-center justify-between">
                 <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Batch Selection</span>
                 <span className="text-[10px] font-mono text-indigo-200 bg-indigo-500/20 px-2 py-0.5 rounded-full">{count} items</span>
             </div>
             
             <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {selectedAvatars.slice(0, 9).map(avatar => (
                        <img key={avatar.id} src={avatar.imageData} alt="" className="w-full h-full object-cover rounded-md aspect-square border border-slate-600/50" />
                    ))}
                    {count > 9 && (
                        <div className="bg-slate-800 rounded-md flex items-center justify-center border border-slate-700 text-xs text-slate-400">
                            +{count - 9}
                        </div>
                    )}
                </div>
                <p className="text-sm text-slate-300 text-center mb-6">
                    You have selected {count} avatars. You can download them all or delete them in bulk.
                </p>
             </div>

             <div className="p-5 border-t border-slate-700/50 bg-slate-900/30 flex flex-col gap-3">
                <Button variant="primary" onClick={() => onDownload(selectedAvatars)} className="w-full justify-center">
                    Download {count} Images
                </Button>
                <Button variant="danger" onClick={() => onDelete(selectedAvatars.map(a => a.id))} className="w-full justify-center">
                    Delete Selection
                </Button>
                <Button variant="ghost" onClick={onClose} className="w-full justify-center text-xs">
                    Clear Selection
                </Button>
             </div>
        </div>
      );
  }

  // Single Mode
  return (
    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl animate-slide-in-right">
        <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inspector</span>
            <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">ID: {primaryAvatar.id}</span>
        </div>

        <div className="p-6 bg-slate-900/30 flex justify-center border-b border-slate-700/50">
            <div 
                className="relative rounded-lg overflow-hidden shadow-lg cursor-zoom-in ring-1 ring-white/10 group bg-black"
                onClick={() => onViewDetails(primaryAvatar)}
            >
                <img 
                    src={primaryAvatar.imageData} 
                    alt="Preview" 
                    className="max-h-[250px] object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium flex items-center gap-2">
                        Zoom
                    </span>
                </div>
            </div>
        </div>

        <div className="p-5 space-y-6">
            <div className="space-y-2">
                <label className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Prompt</label>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <p className="text-xs text-slate-300 leading-relaxed max-h-[100px] overflow-y-auto custom-scrollbar italic">
                        "{primaryAvatar.prompt}"
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700/30">
                <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Created</span>
                    <span className="text-xs text-slate-300 font-mono">{formatDate(primaryAvatar.createdAt)}</span>
                </div>
                <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Type</span>
                    <span className="text-xs text-slate-300 font-mono">
                        {primaryAvatar.parentId ? 'Evolved' : 'Original'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
                <Button onClick={onNavigateToEditor} variant="primary" className="w-full justify-center">
                    Edit Avatar
                </Button>
                <div className="flex gap-2">
                    <Button onClick={() => onDownload([primaryAvatar])} variant="secondary" className="flex-1 justify-center text-xs">
                        Download
                    </Button>
                    <Button onClick={() => onDelete([primaryAvatar.id])} variant="danger" className="flex-1 justify-center text-xs">
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
};