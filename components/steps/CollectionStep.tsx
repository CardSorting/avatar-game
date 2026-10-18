import React, { useState, useEffect, useMemo } from 'react';
import { Avatar } from '../../types';
import { Button } from '../Button';
import { AvatarDetailsModal } from '../AvatarDetailsModal';
import { Pagination } from '../Pagination';
import { GalleryGrid } from '../GalleryGrid';
import { InspectorPanel } from '../InspectorPanel';

interface CollectionStepProps {
  avatars: Avatar[];
  selectedAvatarId: string | null;
  onSelect: (id: string) => void;
  onDeleteAll: () => void;
  onNavigateToEditor: () => void;
  onDeleteAvatar?: (id: string) => void; // Keeping singular for backward compat logic if needed
}

const ITEMS_PER_PAGE = 12;

export const CollectionStep: React.FC<CollectionStepProps> = ({ 
  avatars, 
  selectedAvatarId, 
  onSelect, 
  onDeleteAll,
  onNavigateToEditor,
  onDeleteAvatar
}) => {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Sync prop selection with internal batch selection
  useEffect(() => {
    if (selectedAvatarId && !isMultiSelectMode) {
        setSelectedIds([selectedAvatarId]);
    } else if (!selectedAvatarId && !isMultiSelectMode) {
        setSelectedIds([]);
    }
  }, [selectedAvatarId, isMultiSelectMode]);

  // Derived State: Pagination
  const totalPages = Math.ceil(avatars.length / ITEMS_PER_PAGE);
  const paginatedAvatars = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return avatars.slice(start, start + ITEMS_PER_PAGE);
  }, [avatars, currentPage]);

  // Derived State: Selected Objects
  const selectedAvatars = useMemo(() => {
      return avatars.filter(a => selectedIds.includes(a.id));
  }, [avatars, selectedIds]);

  // Handlers
  const handleToggleSelect = (id: string) => {
    if (isMultiSelectMode) {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                const updated = prev.filter(item => item !== id);
                // If we deselect the last item, switch parent context too
                if (updated.length === 0) onSelect(''); 
                return updated;
            } else {
                return [...prev, id];
            }
        });
    } else {
        // Single select mode: simply notify parent
        onSelect(id);
    }
  };

  const handleModeToggle = () => {
    const newMode = !isMultiSelectMode;
    setIsMultiSelectMode(newMode);
    // If turning on, keep current selection. If turning off, keep only the first selection
    if (!newMode && selectedIds.length > 0) {
        onSelect(selectedIds[0]);
    }
  };

  const handleBatchDownload = (targets: Avatar[]) => {
    // Simple staggered download loop
    targets.forEach((avatar, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = avatar.imageData;
            link.download = `nano-banana-${avatar.id.slice(0, 6)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, index * 500); // 500ms delay to prevent browser throttling
    });
  };

  const handleBatchDelete = (ids: string[]) => {
      // If we are deleting everything, use the optimized deleteAll
      if (ids.length === avatars.length) {
          onDeleteAll();
          setSelectedIds([]);
          return;
      }
      
      // Otherwise delete individually (or we could add a bulk delete action to reducer later)
      if (onDeleteAvatar) {
        ids.forEach(id => onDeleteAvatar(id));
      }
      setSelectedIds([]);
      onSelect(''); // Clear parent selection
  };

  const activeAvatarForModal = selectedAvatars.length === 1 ? selectedAvatars[0] : null;

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-8 items-start animate-fade-in pb-12 w-full">
      
      {/* LEFT COLUMN: Library Grid */}
      <div className="flex-1 w-full flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 px-1 bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-4 pl-2">
             <h2 className="text-lg font-bold text-white tracking-tight">Library</h2>
             <span className="text-xs font-mono text-slate-500">{avatars.length} Items</span>
          </div>
          
          <div className="flex items-center gap-2">
             <Button 
                variant={isMultiSelectMode ? 'primary' : 'secondary'} 
                onClick={handleModeToggle}
                className="text-xs px-3 py-1.5"
             >
                {isMultiSelectMode ? 'Done Selecting' : 'Select Multiple'}
             </Button>
          </div>
        </div>

        {/* Grid */}
        <GalleryGrid 
            avatars={paginatedAvatars}
            selectedIds={selectedIds}
            isMultiSelectMode={isMultiSelectMode}
            onToggleSelect={handleToggleSelect}
        />

        {/* Pagination */}
        <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
        />
      </div>

      {/* RIGHT COLUMN: Inspector Panel (Sticky) */}
      <div className="w-full lg:w-[380px] lg:sticky lg:top-8 shrink-0 flex flex-col gap-4">
         <InspectorPanel 
            selectedAvatars={selectedAvatars}
            onClose={() => {
                setSelectedIds([]);
                onSelect('');
            }}
            onNavigateToEditor={onNavigateToEditor}
            onDelete={handleBatchDelete}
            onDownload={handleBatchDownload}
            onViewDetails={(a) => {
                // Ensure selection matches specific item clicked in inspector before opening
                if (!selectedIds.includes(a.id)) onSelect(a.id);
                setIsDetailsOpen(true);
            }}
         />
      </div>

      <AvatarDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        avatar={activeAvatarForModal} 
      />
    </div>
  );
};