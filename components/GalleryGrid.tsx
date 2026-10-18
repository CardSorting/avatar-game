import React from 'react';
import { Avatar } from '../types';
import { AvatarCard } from './AvatarCard';

interface GalleryGridProps {
  avatars: Avatar[];
  selectedIds: string[];
  isMultiSelectMode: boolean;
  onToggleSelect: (id: string) => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ 
  avatars, 
  selectedIds, 
  isMultiSelectMode, 
  onToggleSelect 
}) => {
  if (avatars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <span className="text-3xl grayscale opacity-40">🖼️</span>
        </div>
        <h3 className="text-lg font-bold text-slate-300 mb-2">Collection Empty</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">Generate content to build your library.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
      {avatars.map((avatar) => (
        <AvatarCard
          key={avatar.id}
          avatar={avatar}
          isSelected={selectedIds.includes(avatar.id)}
          isMultiSelectMode={isMultiSelectMode}
          onClick={() => onToggleSelect(avatar.id)}
        />
      ))}
    </div>
  );
};