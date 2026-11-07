import React from 'react';
import { Menu, X } from 'lucide-react';

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ isOpen, onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className={`fixed top-6 left-6 z-50 w-9 h-9 bg-panel border border-hairline flex items-center justify-center text-offwhite hover:border-amber transition-colors cursor-pointer ${className}`}
      style={{ borderRadius: 0 }}
    >
      {isOpen ? (
        <X className="w-4 h-4 text-offwhite stroke-[1.5]" />
      ) : (
        <Menu className="w-4 h-4 text-offwhite stroke-[1.5]" />
      )}
    </button>
  );
};

