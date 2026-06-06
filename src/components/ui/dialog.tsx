import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#0c0c14]/90 glass-panel p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          {title && (
            <h3 className="font-display text-base font-semibold text-white tracking-tight">
              {title}
            </h3>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-white/5 bg-white/5 hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-neutral-400 hover:text-white" />
          </Button>
        </div>
        <div className="mt-4 text-sm text-neutral-200">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Dialog;
