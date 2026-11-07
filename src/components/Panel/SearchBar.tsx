import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onTeaserClick?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onTeaserClick }) => {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search satellites"
        className="w-full h-9 bg-charcoal border border-hairline px-3 text-xs text-offwhite placeholder:text-muted focus:outline-none focus:border-amber transition-colors font-mono"
        style={{ borderRadius: 0 }}
      />
      <button
        type="button"
        onClick={onTeaserClick}
        className="text-left text-xs text-amber hover:underline cursor-pointer font-sans tracking-wide self-start transition-opacity hover:opacity-90"
      >
        Describe what to track
      </button>
    </div>
  );
};
