import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onTeaserClick?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onTeaserClick }) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search satellites"
          className="w-full h-9 bg-charcoal border border-hairline px-3 text-sm text-offwhite placeholder:text-muted focus:outline-none focus:border-amber transition-colors font-sans"
          style={{ borderRadius: 0 }}
        />
      </div>
      <button
        type="button"
        onClick={onTeaserClick}
        className="text-left text-xs text-amber hover:underline cursor-pointer font-sans tracking-wide transition-opacity hover:opacity-90 self-start"
      >
        Describe what to track
      </button>
    </div>
  );
};

