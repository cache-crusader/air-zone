import { useCallback, useEffect, useMemo, useState } from "react";
import type { Zone, ZoneStatus } from "../domain/zone";
import type { Group } from "../domain/group";
import { determineZoneStatus } from "../domain/zone-rules";
import { ApiService } from "../services/api-service";
import { zoneRepository } from "../services/in-memory-zone-repository";

export type EnrichedZone = Zone & { calculatedStatus: ZoneStatus };

export interface ZonesViewState {
  /** Ordered list of groups */
  groups: Group[];
  /** groupId → enriched zones in that group (empty groups included) */
  groupedZones: Map<string, EnrichedZone[]>;
  /** Zones with no group (groupId === null) */
  orphanZones: EnrichedZone[];
  /** True while the initial fetch is in flight */
  isLoading: boolean;
  handleToggleZone: (zoneId: string) => void;
  handleToggleGroup: (groupId: string, turnOn: boolean) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useZonesView = (): ZonesViewState => {
  const [rawZones, setRawZones] = useState<Zone[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { zones: initZones, groups: initGroups } = zoneRepository.getState();
    setRawZones(initZones);
    setGroups(initGroups);
    ApiService.fetchAllZones().then((fetched) => {
      setRawZones(fetched);
      setIsLoading(false);
    });

    const unsubscribe = zoneRepository.subscribe(
      (updatedZones, updatedGroups) => {
        setRawZones(updatedZones);
        setGroups(updatedGroups);
      },
    );

    const tempInterval = setInterval(() => {
      zoneRepository.simulateTempChange();
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(tempInterval);
    };
  }, []);

  const enrichedZones = useMemo<EnrichedZone[]>(
    () =>
      rawZones.map((z) => ({ ...z, calculatedStatus: determineZoneStatus(z) })),
    [rawZones],
  );

  const groupedZones = useMemo<Map<string, EnrichedZone[]>>(() => {
    const map = new Map<string, EnrichedZone[]>();

    groups.forEach((g) => map.set(g.id, []));

    enrichedZones.forEach((zone) => {
      if (zone.groupId !== null && map.has(zone.groupId)) {
        map.get(zone.groupId)!.push(zone);
      }
    });

    return map;
  }, [enrichedZones, groups]);

  const orphanZones = useMemo<EnrichedZone[]>(
    () => enrichedZones.filter((z) => z.groupId === null),
    [enrichedZones],
  );

  const handleToggleZone = useCallback((zoneId: string) => {
    ApiService.toggleZone(zoneId);
  }, []);

  const handleToggleGroup = useCallback((groupId: string, turnOn: boolean) => {
    ApiService.toggleGroup(groupId, turnOn);
  }, []);

  return {
    groups,
    groupedZones,
    orphanZones,
    isLoading,
    handleToggleZone,
    handleToggleGroup,
  };
};
