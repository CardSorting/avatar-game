import React from 'react';
import { Avatar } from '../types';

interface AvatarCardProps {
  avatar: Avatar;
  isSelected?: boolean;
  isMultiSelectMode?: boolean;
  onClick: () => void;
}

export const AvatarCard: React.FC<AvatarCardProps> = ({ 
  avatar, 
  isSelected, 
  isMultiSelectMode,
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group
        ${isSelected 
          ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900 z-10' 
          : 'ring-1 ring-slate-700 hover:ring-slate-500 hover:shadow-xl'
        }
      `}
    >
      <img 
        src={avatar.imageData} 
        alt={avatar.prompt} 
        className={`w-full h-full object-cover transition-transform duration-700 ${isSelected ? 'scale-105' : 'group-hover:scale-110'}`}
        loading="lazy"
      />
      
      {/* Gradient Overlay */}
      <div className={`
        absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300
        ${isSelected || isMultiSelectMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `} />

      {/* Selection Indicator (Multi-Select Mode) */}
      {isMultiSelectMode && (
        <div className="absolute top-2 right-2">
          <div className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
            ${isSelected 
              ? 'bg-indigo-600 border-indigo-500 text-white' 
              : 'bg-black/40 border-slate-400 text-transparent hover:border-white'
            }
          `}>
             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
             </svg>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`
        absolute inset-0 p-3 flex flex-col justify-end transition-opacity duration-300
        ${isSelected || isMultiSelectMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}>
         <div className="flex items-center justify-between">
           <span className="text-[10px] font-mono text-slate-300 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/10 truncate max-w-[80%]">
             {new Date(avatar.createdAt).toLocaleDateString()}
           </span>
         </div>
      </div>
    </div>
  );
};