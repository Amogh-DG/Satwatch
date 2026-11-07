import React from 'react';
import { FilterSelection } from '../../types/satellite';

interface FilterGroupProps {
  filters: FilterSelection;
  onChange: (filters: Partial<FilterSelection>) => void;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({ filters, onChange }) => {
  const categories: Array<FilterSelection['category']> = ['All', 'Weather', 'Navigation'];
  const countries: Array<FilterSelection['country']> = ['All', 'India', 'Russia', 'International'];

  const cycleCountry = () => {
    const currentIndex = countries.indexOf(filters.country);
    const nextIndex = (currentIndex + 1) % countries.length;
    onChange({ country: countries[nextIndex] });
  };

  return (
    <div className="flex flex-col space-y-2 select-none w-full">
      {/* Row 1: Primary Categories */}
      <div className="flex space-x-2">
        {categories.map((cat) => {
          const isSelected = filters.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange({ category: cat })}
              className={`px-3 py-1.5 text-xs font-mono tracking-tight border transition-colors cursor-pointer ${
                isSelected
                  ? 'border-amber text-amber bg-panel'
                  : 'border-hairline text-offwhite hover:border-muted bg-panel'
              }`}
              style={{ borderRadius: 0 }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Row 2: Secondary Facets */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => onChange({ activeOnly: !filters.activeOnly })}
          className={`px-3 py-1.5 text-xs font-mono tracking-tight border transition-colors cursor-pointer ${
            filters.activeOnly
              ? 'border-amber text-amber bg-panel'
              : 'border-hairline text-offwhite hover:border-muted bg-panel'
          }`}
          style={{ borderRadius: 0 }}
        >
          Active
        </button>

        <button
          type="button"
          onClick={cycleCountry}
          className={`px-3 py-1.5 text-xs font-mono tracking-tight border transition-colors cursor-pointer ${
            filters.country !== 'All'
              ? 'border-amber text-amber bg-panel'
              : 'border-hairline text-offwhite hover:border-muted bg-panel'
          }`}
          style={{ borderRadius: 0 }}
          title="Click to cycle countries (All -> India -> Russia -> International)"
        >
          {filters.country === 'All' ? 'Country' : filters.country}
        </button>
      </div>
    </div>
  );
};
