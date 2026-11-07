import React from 'react';
import { X } from 'lucide-react';
import { Satellite, PropagatedPosition, getOperationalStatus } from '../../types/satellite';
import { REAL_EARTH_RADIUS_KM } from '../../services/propagator';

interface TelemetryCardProps {
  satellite: Satellite | null;
  position?: PropagatedPosition;
  isSaved: boolean;
  onToggleBookmark: (id: string) => void;
  onClose?: () => void;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  satellite,
  position,
  isSaved,
  onToggleBookmark,
  onClose
}) => {
  if (!satellite) return null;

  const rawStatus = getOperationalStatus(satellite.opsStatusCode);
  const statusDisplay = rawStatus || '—';

  // Format altitude in IBM Plex Mono font
  const altitudeDisplay =
    position && position.altitudeKm !== null && !isNaN(position.altitudeKm)
      ? `${Math.round(position.altitudeKm)} km`
      : '— km';

  // Format relative distance in Earth radii (e.g. "0.07 R⊕")
  const earthRadiiDisplay =
    position && position.altitudeKm !== null && !isNaN(position.altitudeKm)
      ? `${(position.altitudeKm / REAL_EARTH_RADIUS_KM).toFixed(2)} R⊕`
      : '—';

  // Format speed in IBM Plex Mono font
  const speedDisplay =
    position && position.velocityKmS !== null && !isNaN(position.velocityKmS)
      ? `${position.velocityKmS.toFixed(2)} km/s`
      : '— km/s';

  // Format orbit classification (LEO, MEO, GEO, HEO)
  const orbitDisplay = position?.orbitType || '—';

  // Format geographic coordinates (Latitude, Longitude)
  let positionDisplay = '— , —';
  if (
    position &&
    position.latitude !== null &&
    position.longitude !== null &&
    !isNaN(position.latitude) &&
    !isNaN(position.longitude)
  ) {
    const latPrefix = position.latitude >= 0 ? 'N' : 'S';
    const lonPrefix = position.longitude >= 0 ? 'E' : 'W';
    const latFormatted = `${Math.abs(position.latitude).toFixed(1)}° ${latPrefix}`;
    const lonFormatted = `${Math.abs(position.longitude).toFixed(1)}° ${lonPrefix}`;
    positionDisplay = `${latFormatted}, ${lonFormatted}`;
  }

  // Format launch year & international designator
  const launchedDisplay =
    satellite.launchYear !== null && satellite.launchYear !== undefined
      ? String(satellite.launchYear)
      : '—';
  const designatorDisplay = satellite.intlDesignator || '—';

  return (
    <div
      className="fixed bottom-8 right-8 z-40 w-80 sm:w-88 bg-panel border border-hairline p-5 select-none shadow-2xl"
      style={{ borderRadius: 0 }}
      onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to globe canvas
    >
      {/* Header: Satellite Name + Saved Button + Close Control */}
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <h2 className="font-bold text-lg text-offwhite tracking-wide font-sans">
          {satellite.name}
        </h2>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onToggleBookmark(satellite.id)}
            className={`px-3 py-1 text-xs font-sans tracking-wide border transition-colors cursor-pointer ${
              isSaved
                ? 'border-amber text-amber bg-panel'
                : 'border-hairline text-muted hover:border-amber hover:text-offwhite bg-panel'
            }`}
            style={{ borderRadius: 0 }}
          >
            Saved
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-muted hover:text-offwhite border border-hairline hover:border-muted transition-colors cursor-pointer"
              style={{ borderRadius: 0 }}
              title="Close and deselect"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Rows */}
      <div className="pt-2 divide-y divide-hairline/30 text-xs">
        {/* Status */}
        <div className="flex justify-between items-center py-2">
          <span className="font-sans text-muted">Status</span>
          <span className="font-mono text-offwhite font-medium">{statusDisplay}</span>
        </div>

        {/* Altitude */}
        <div className="flex justify-between items-center py-2">
          <span className="font-sans text-muted">Altitude</span>
          <span className="font-mono text-offwhite font-medium">{altitudeDisplay}</span>
        </div>

        {/* Distance in Earth Radii */}
        <div className="flex justify-between items-center py-2">
          <span className="font-sans text-muted">Earth Radii</span>
          <span className="font-mono text-amber font-medium">{earthRadiiDisplay}</span>
        </div>

        {/* Speed */}
        <div className="flex justify-between items-center py-2">
          <span className="font-sans text-muted">Speed</span>
          <span className="font-mono text-offwhite font-medium">{speedDisplay}</span>
        </div>

        {/* Orbit */}
        <div className="flex justify-between items-center py-2">
          <span className="font-sans text-muted">Orbit</span>
          <span className="font-mono text-offwhite font-medium">{orbitDisplay}</span>
        </div>

        {/* Position */}
        <div className="flex justify-between items-center py-2">
          <span className="font-sans text-muted">Position</span>
          <span className="font-mono text-offwhite font-medium">{positionDisplay}</span>
        </div>

        {/* Launched */}
        <div className="flex justify-between items-center py-2">
          <span className="font-sans text-muted">Launched</span>
          <span className="font-mono text-offwhite font-medium">{launchedDisplay}</span>
        </div>

        {/* Designator */}
        <div className="flex justify-between items-center py-2">
          <span className="font-sans text-muted">Designator</span>
          <span className="font-mono text-offwhite font-medium">{designatorDisplay}</span>
        </div>
      </div>
    </div>
  );
};
