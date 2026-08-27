import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-lg',
  className = ''
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm transition-all duration-200"
      onClick={onClose}
    >
      <div 
        className={`w-full ${maxWidth} bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200 flex flex-col max-h-[95vh] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-dark-border bg-dark-surface shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-dark-textMain line-clamp-1">{title}</h3>
          <button
            onClick={onClose}
            className="group p-1.5 rounded-lg text-dark-textMuted hover:text-rose-400 hover:bg-rose-500/15 active:scale-90 transition-all duration-200"
            title="Cerrar modal (Esc)"
          >
            <X className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto grow flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
