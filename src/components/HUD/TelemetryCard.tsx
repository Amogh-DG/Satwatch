import React from 'react';
import { Satellite, PropagatedPosition, getOperationalStatus } from '../../types/satellite';

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
  onClose: _onClose
}) => {
  if (!satellite) return null;

  const status = getOperationalStatus(satellite.opsStatusCode);

  // Format altitude
  const altitudeDisplay =
    position && position.altitudeKm !== null && !isNaN(position.altitudeKm)
      ? `${Math.round(position.altitudeKm)} km`
      : '— km';

  // Format speed
  const speedDisplay =
    position && position.velocityKmS !== null && !isNaN(position.velocityKmS)
      ? `${position.velocityKmS.toFixed(2)} km/s`
      : '— km/s';

  // Format orbit type
  const orbitDisplay = position?.orbitType || '—';

  // Format coordinates (Latitude, Longitude)
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

  // Format launch year & designator
  const launchedDisplay = satellite.launchYear !== null ? String(satellite.launchYear) : '—';
  const designatorDisplay = satellite.intlDesignator || '—';

  return (
    <div
      className="fixed bottom-8 right-8 z-40 w-80 sm:w-88 bg-panel border border-hairline p-5 select-none shadow-2xl"
      style={{ borderRadius: 0 }}
      onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to globe background
    >
      {/* Header: Satellite Name + Bookmark Toggle Button */}
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <h2 className="font-bold text-lg text-offwhite tracking-wide font-sans">
          {satellite.name}
        </h2>

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
      </div>

      {/* Telemetry Rows */}
      <div className="pt-2 divide-y divide-hairline/30 text-xs">
        {/* Status */}
        <div className="flex justify-between items-center py-2">
          <span className="font-sans text-muted">Status</span>
          <span className="font-mono text-offwhite font-medium">{status}</span>
        </div>

        {/* Altitude */}
        <div className="flex justify-between items-center py-2">
          <span className="font-sans text-muted">Altitude</span>
          <span className="font-mono text-offwhite font-medium">{altitudeDisplay}</span>
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

