import React from 'react';
import { Satellite, PropagatedPosition, FilterSelection, getOperationalStatus } from '../../types/satellite';
import { SatelliteRow } from './SatelliteRow';

interface SatelliteListProps {
  satellites: Satellite[];
  positions: Map<string, PropagatedPosition>;
  selectedSatelliteId: string | null;
  savedSatelliteIds: Set<string>;
  filters: FilterSelection;
  onSelectSatellite: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}

export const SatelliteList: React.FC<SatelliteListProps> = ({
  satellites,
  positions,
  selectedSatelliteId,
  savedSatelliteIds,
  filters,
  onSelectSatellite,
  onToggleBookmark
}) => {
  // Apply filtering rules
  const filteredSatellites = satellites.filter((sat) => {
    // 1. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = sat.name.toLowerCase().includes(q);
      const matchId = sat.intlDesignator.toLowerCase().includes(q);
      const matchNorad = sat.noradId.includes(q);
      if (!matchName && !matchId && !matchNorad) return false;
    }

    // 2. Category Filter
    if (filters.category !== 'All') {
      if (filters.category === 'Weather' && sat.category !== 'Weather') return false;
      if (filters.category === 'Navigation' && sat.category !== 'Navigation') return false;
    }

    // 3. Active Only Filter
    if (filters.activeOnly) {
      const status = getOperationalStatus(sat.opsStatusCode);
      if (status !== 'Active') return false;
    }

    // 4. Country Filter
    if (filters.country !== 'All') {
      if (sat.country !== filters.country) return false;
    }

    return true;
  });

  // Separate into Saved and All Satellites
  const savedSatellites = filteredSatellites.filter((sat) => savedSatelliteIds.has(sat.id));
  const otherSatellites = filteredSatellites.filter((sat) => !savedSatelliteIds.has(sat.id));

  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
      {/* Saved Section */}
      {savedSatellites.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-sans text-muted tracking-wide px-2 py-1">
            Saved
          </div>
          <div className="space-y-0.5">
            {savedSatellites.map((sat) => (
              <SatelliteRow
                key={sat.id}
                satellite={sat}
                position={positions.get(sat.id)}
                isSelected={selectedSatelliteId === sat.id}
                isSaved={true}
                onSelect={onSelectSatellite}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        </div>
      )}

      {/* Divider if both exist */}
      {savedSatellites.length > 0 && otherSatellites.length > 0 && (
        <div className="border-t border-hairline/40 my-2" />
      )}

      {/* All Satellites Section */}
      <div className="space-y-1">
        <div className="text-xs font-sans text-muted tracking-wide px-2 py-1">
          All satellites
        </div>
        {otherSatellites.length > 0 ? (
          <div className="space-y-0.5">
            {otherSatellites.map((sat) => (
              <SatelliteRow
                key={sat.id}
                satellite={sat}
                position={positions.get(sat.id)}
                isSelected={selectedSatelliteId === sat.id}
                isSaved={false}
                onSelect={onSelectSatellite}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        ) : savedSatellites.length === 0 ? (
          <div className="py-8 text-center font-mono text-xs text-muted">
            — No matching satellites —
          </div>
        ) : null}
      </div>
    </div>
  );
};

