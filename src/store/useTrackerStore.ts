import { useState, useEffect } from 'react';
import { Satellite, PropagatedPosition, FilterSelection } from '../types/satellite';
import { loadSavedSatelliteIds, saveSavedSatelliteIds } from '../services/storage';

export interface TrackerState {
  satellites: Satellite[];
  positions: Map<string, PropagatedPosition>;
  selectedSatelliteId: string | null;
  isPanelOpen: boolean;
  savedSatelliteIds: Set<string>;
  filters: FilterSelection;
  lastUpdated: number | null;
  isLive: boolean;
}

type Listener = () => void;

class TrackerStore {
  private state: TrackerState = {
    satellites: [],
    positions: new Map(),
    selectedSatelliteId: null,
    isPanelOpen: false,
    savedSatelliteIds: loadSavedSatelliteIds(),
    filters: {
      searchQuery: '',
      category: 'All',
      activeOnly: false,
      country: 'All'
    },
    lastUpdated: null,
    isLive: false
  };

  private listeners = new Set<Listener>();

  public getState(): TrackerState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  public setSatellites(satellites: Satellite[], lastUpdated: number, isLive: boolean): void {
    this.state = {
      ...this.state,
      satellites,
      lastUpdated,
      isLive
    };
    this.notify();
  }

  public setPositions(positions: Map<string, PropagatedPosition>): void {
    this.state.positions = positions;
    // Don't full-notify to prevent 60 FPS DOM re-renders unless components subscribe specifically
  }

  public setSelectedSatelliteId(id: string | null): void {
    if (this.state.selectedSatelliteId !== id) {
      this.state = {
        ...this.state,
        selectedSatelliteId: id
      };
      this.notify();
    }
  }

  public setPanelOpen(open: boolean): void {
    if (this.state.isPanelOpen !== open) {
      this.state = {
        ...this.state,
        isPanelOpen: open
      };
      this.notify();
    }
  }

  public togglePanel(): void {
    this.setPanelOpen(!this.state.isPanelOpen);
  }

  public toggleBookmark(satelliteId: string): void {
    const updated = new Set(this.state.savedSatelliteIds);
    if (updated.has(satelliteId)) {
      updated.delete(satelliteId);
    } else {
      updated.add(satelliteId);
    }
    saveSavedSatelliteIds(updated);
    this.state = {
      ...this.state,
      savedSatelliteIds: updated
    };
    this.notify();
  }

  public setFilters(filters: Partial<FilterSelection>): void {
    this.state = {
      ...this.state,
      filters: {
        ...this.state.filters,
        ...filters
      }
    };
    this.notify();
  }
}

export const trackerStore = new TrackerStore();

export function useTrackerStore(): TrackerState & {
  setSelectedSatelliteId: (id: string | null) => void;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  toggleBookmark: (id: string) => void;
  setFilters: (filters: Partial<FilterSelection>) => void;
} {
  const [state, setState] = useState(() => trackerStore.getState());

  useEffect(() => {
    return trackerStore.subscribe(() => {
      setState(trackerStore.getState());
    });
  }, []);

  return {
    ...state,
    setSelectedSatelliteId: (id) => trackerStore.setSelectedSatelliteId(id),
    setPanelOpen: (open) => trackerStore.setPanelOpen(open),
    togglePanel: () => trackerStore.togglePanel(),
    toggleBookmark: (id) => trackerStore.toggleBookmark(id),
    setFilters: (f) => trackerStore.setFilters(f)
  };
}

