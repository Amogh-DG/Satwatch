import React from 'react';
import { Satellite, PropagatedPosition, FilterSelection } from '../../types/satellite';
import { SearchBar } from './SearchBar';
import { FilterGroup } from './FilterGroup';
import { SatelliteList } from './SatelliteList';

interface ControlPanelProps {
  isOpen: boolean;
  satellites: Satellite[];
  positions: Map<string, PropagatedPosition>;
  selectedSatelliteId: string | null;
  savedSatelliteIds: Set<string>;
  filters: FilterSelection;
  onSelectSatellite: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onFilterChange: (filters: Partial<FilterSelection>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isOpen,
  satellites,
  positions,
  selectedSatelliteId,
  savedSatelliteIds,
  filters,
  onSelectSatellite,
  onToggleBookmark,
  onFilterChange
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 w-84 sm:w-92 bg-panel border-r border-hairline flex flex-col p-6 space-y-4 transition-transform duration-200 ease-out select-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Top Row: Close Button Spacer + Search Bar */}
      <div className="flex items-start space-x-3">
        {/* Placeholder spacer matching width and height of MenuButton (36px = w-9) */}
        <div className="w-9 h-9 shrink-0" aria-hidden="true" />

        <div className="flex-1">
          <SearchBar
            value={filters.searchQuery}
            onChange={(q) => onFilterChange({ searchQuery: q })}
            onTeaserClick={() => {
              alert('Phase 2 AI Recommendation Search will be implemented in a future release.');
            }}
          />
        </div>
      </div>

      {/* Filter Buttons: Flush with left padding */}
      <div className="pt-1">
        <FilterGroup
          filters={filters}
          onChange={onFilterChange}
        />
      </div>

      {/* Satellite Catalog List */}
      <SatelliteList
        satellites={satellites}
        positions={positions}
        selectedSatelliteId={selectedSatelliteId}
        savedSatelliteIds={savedSatelliteIds}
        filters={filters}
        onSelectSatellite={onSelectSatellite}
        onToggleBookmark={onToggleBookmark}
      />
    </aside>
  );
};
