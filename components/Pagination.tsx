import React from 'react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-6 mt-4 border-t border-slate-800/50">
      <Button 
        variant="secondary" 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="text-xs px-3 py-1.5"
      >
        ← Prev
      </Button>
      
      <span className="text-sm text-slate-400 font-mono">
        Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
      </span>

      <Button 
        variant="secondary" 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="text-xs px-3 py-1.5"
      >
        Next →
      </Button>
    </div>
  );
};