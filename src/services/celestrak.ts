import { Satellite } from '../types/satellite';
import baselineSatellites from '../assets/baseline-satellites.json';
import { loadCachedSatellites, saveCachedSatellites } from './storage';

export interface TelemetryFetchResult {
  satellites: Satellite[];
  lastUpdated: number;
  isLive: boolean;
  error?: string;
}

export async function fetchLiveSatellites(): Promise<TelemetryFetchResult> {
  const baselineList = baselineSatellites as Satellite[];

  try {
    const fetchPromises = baselineList.map(async (baseSat): Promise<Satellite> => {
      const cid = baseSat.noradId;
      const tleUrl = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${cid}&FORMAT=tle`;
      const satcatUrl = `https://celestrak.org/satcat/records.php?CATNR=${cid}&FORMAT=json`;

      let tleLine1 = baseSat.tleLine1;
      let tleLine2 = baseSat.tleLine2;
      let opsStatusCode = baseSat.opsStatusCode;
      let intlDesignator = baseSat.intlDesignator;
      let launchYear = baseSat.launchYear;

      try {
        const [tleResp, satcatResp] = await Promise.all([
          fetch(tleUrl, { mode: 'cors' }),
          fetch(satcatUrl, { mode: 'cors' })
        ]);

        if (tleResp.ok) {
          const tleText = await tleResp.text();
          const lines = tleText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          if (lines.length >= 3) {
            tleLine1 = lines[1];
            tleLine2 = lines[2];
          } else if (lines.length === 2) {
            tleLine1 = lines[0];
            tleLine2 = lines[1];
          }
        }

        if (satcatResp.ok) {
          const satcatData = await satcatResp.json();
          if (Array.isArray(satcatData) && satcatData.length > 0) {
            const entry = satcatData[0];
            if (entry.OPS_STATUS_CODE) {
              opsStatusCode = entry.OPS_STATUS_CODE;
            }
            if (entry.OBJECT_ID) {
              intlDesignator = entry.OBJECT_ID;
            }
            if (entry.LAUNCH_DATE && typeof entry.LAUNCH_DATE === 'string') {
              const year = parseInt(entry.LAUNCH_DATE.slice(0, 4), 10);
              if (!isNaN(year)) launchYear = year;
            }
          }
        }
      } catch (subErr) {
        console.warn(`Live telemetry fetch failed for ${baseSat.name} (${cid}), using baseline/cache:`, subErr);
      }

      return {
        ...baseSat,
        tleLine1,
        tleLine2,
        opsStatusCode,
        intlDesignator,
        launchYear
      };
    });

    const liveSatellites = await Promise.all(fetchPromises);
    const now = Date.now();

    // Cache successful results
    saveCachedSatellites(liveSatellites);

    return {
      satellites: liveSatellites,
      lastUpdated: now,
      isLive: true
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to fetch from CelesTrak, attempting cache fallback:', errorMsg);

    const cached = loadCachedSatellites();
    if (cached && cached.satellites.length > 0) {
      return {
        satellites: cached.satellites,
        lastUpdated: cached.lastUpdated,
        isLive: false,
        error: errorMsg
      };
    }

    return {
      satellites: baselineList,
      lastUpdated: Date.now(),
      isLive: false,
      error: errorMsg
    };
  }
}

