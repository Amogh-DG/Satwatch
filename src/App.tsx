import React, { useEffect, useState } from 'react';
import { useTrackerStore, trackerStore } from './store/useTrackerStore';
import { fetchLiveSatellites } from './services/celestrak';
import { GlobeCanvas } from './components/Globe/GlobeCanvas';
import { MenuButton } from './components/Common/MenuButton';
import { ControlPanel } from './components/Panel/ControlPanel';

export const App: React.FC = () => {
  const {
    satellites,
    positions,
    selectedSatelliteId,
    isPanelOpen,
    savedSatelliteIds,
    filters,
    setSelectedSatelliteId,
    togglePanel,
    toggleBookmark,
    setFilters
  } = useTrackerStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initData() {
      try {
        const result = await fetchLiveSatellites();
        if (isMounted) {
          trackerStore.setSatellites(result.satellites, result.lastUpdated, result.isLive);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    initData();

    // Periodic live TLE refresh every 15 minutes
    const intervalId = setInterval(initData, 15 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-charcoal select-none">
      {/* 3D Real-Time Globe Viewport */}
      <GlobeCanvas
        satellites={satellites}
        selectedSatelliteId={selectedSatelliteId}
        onSelectSatellite={setSelectedSatelliteId}
        onPositionsUpdate={(posMap) => trackerStore.setPositions(posMap)}
      />

      {/* Top-Left Square Menu Button */}
      <MenuButton
        isOpen={isPanelOpen}
        onClick={togglePanel}
      />

      {/* Slide-In Mission Control Panel */}
      <ControlPanel
        isOpen={isPanelOpen}
        satellites={satellites}
        positions={positions}
        selectedSatelliteId={selectedSatelliteId}
        savedSatelliteIds={savedSatelliteIds}
        filters={filters}
        onSelectSatellite={setSelectedSatelliteId}
        onToggleBookmark={toggleBookmark}
        onFilterChange={setFilters}
      />

      {/* Subtle Initial Loading Indicator */}
      {isLoading && (
        <div className="fixed bottom-6 left-6 z-50 pointer-events-none text-muted font-mono text-xs flex items-center space-x-2">
          <span className="inline-block w-2 h-2 bg-amber animate-pulse"></span>
          <span>INITIALIZING ORBITAL EPHEMERIDES...</span>
        </div>
      )}
    </div>
  );
};

export default App;
