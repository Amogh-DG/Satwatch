import React from 'react';
import { Star } from 'lucide-react';
import { Satellite, PropagatedPosition, getOperationalStatus } from '../../types/satellite';

interface SatelliteRowProps {
  satellite: Satellite;
  position?: PropagatedPosition;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}

export const SatelliteRow: React.FC<SatelliteRowProps> = ({
  satellite,
  position,
  isSelected,
  isSaved,
  onSelect,
  onToggleBookmark
}) => {
  const status = getOperationalStatus(satellite.opsStatusCode);
  const isActive = status === 'Active';

  // Format altitude in IBM Plex Mono font
  let altitudeDisplay = '— km';
  if (position && position.altitudeKm !== null && !isNaN(position.altitudeKm)) {
    altitudeDisplay = `${Math.round(position.altitudeKm)} km`;
  }

  return (
    <div
      onClick={() => onSelect(satellite.id)}
      className={`group flex items-center justify-between py-2 px-2 border-b border-hairline/30 transition-colors cursor-pointer select-none ${
        isSelected ? 'bg-charcoal border-amber/50' : 'hover:bg-charcoal/40'
      }`}
    >
      {/* Left: Status Square + Name */}
      <div className="flex items-center space-x-3 overflow-hidden">
        {/* Status Indicator: Solid square for active, hollow for inactive */}
        <div
          className={`w-2 h-2 shrink-0 ${
            isActive ? 'bg-amber' : 'border border-muted bg-transparent'
          }`}
          style={{ borderRadius: 0 }}
          title={`Status: ${status}`}
        />

        <span className="font-semibold text-offwhite text-sm tracking-wide truncate">
          {satellite.name}
        </span>
      </div>

      {/* Right: Altitude + Bookmark Star */}
      <div className="flex items-center space-x-3 shrink-0">
        <span className="font-mono text-xs text-muted">
          {altitudeDisplay}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(satellite.id);
          }}
          className="p-1 text-muted hover:text-amber transition-colors cursor-pointer"
          aria-label={isSaved ? `Remove bookmark for ${satellite.name}` : `Bookmark ${satellite.name}`}
        >
          <Star
            className={`w-3.5 h-3.5 ${
              isSaved ? 'text-amber fill-amber' : 'text-muted/60 stroke-[1.5]'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

