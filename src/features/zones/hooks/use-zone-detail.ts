import { useCallback, useEffect, useMemo, useState } from "react";
import type { Zone, ZoneStatus } from "../domain/zone";
import { determineZoneStatus } from "../domain/zone-rules";
import { ApiService } from "../services/api-service";
import { zoneRepository } from "../services/in-memory-zone-repository";

export type EnrichedZone = Zone & { calculatedStatus: ZoneStatus };

interface UseZoneDetailReturn {
  zone: EnrichedZone | null;
  isLoading: boolean;
  notFound: boolean;
  handleToggle: () => void;
  handleSetPointUp: () => void;
  handleSetPointDown: () => void;
}

export function useZoneDetail(id: string | undefined): UseZoneDetailReturn {
  const [rawZones, setRawZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Optimistic: show repo state immediately, no loading flash
    const { zones } = zoneRepository.getState();
    setRawZones(zones);

    ApiService.fetchAllZones().then((fetched) => {
      setRawZones(fetched);
      setIsLoading(false);
    });

    const unsubscribe = zoneRepository.subscribe((updatedZones) => {
      setRawZones(updatedZones);
    });

    // Simulate ambient temperature drift
    const tempInterval = setInterval(() => {
      zoneRepository.simulateTempChange();
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(tempInterval);
    };
  }, []);

  const zone = useMemo<EnrichedZone | null>(() => {
    const found = rawZones.find((z) => z.id === id);
    if (!found) return null;
    return { ...found, calculatedStatus: determineZoneStatus(found) };
  }, [rawZones, id]);

  const notFound = !isLoading && zone === null;

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleToggle = useCallback(() => {
    if (!id) return;
    ApiService.toggleZone(id);
  }, [id]);

  const handleSetPointUp = useCallback(() => {
    if (!id) return;
    const current = zoneRepository.getZones().find((z) => z.id === id);
    if (!current) return;
    zoneRepository.updateZone(id, { setPoint: current.setPoint + 1 });
  }, [id]);

  const handleSetPointDown = useCallback(() => {
    if (!id) return;
    const current = zoneRepository.getZones().find((z) => z.id === id);
    if (!current) return;
    zoneRepository.updateZone(id, {
      setPoint: Math.max(10, current.setPoint - 1),
    });
  }, [id]);

  return {
    zone,
    isLoading,
    notFound,
    handleToggle,
    handleSetPointUp,
    handleSetPointDown,
  };
}
