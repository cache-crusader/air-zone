import type { Zone } from "../domain/zone";
import { zoneRepository } from "./in-memory-zone-repository";

export const ApiService = {
  // Simulate GET /zones
  fetchAllZones: (): Promise<Zone[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(zoneRepository.getZones());
      }, 500); // Fake network delay
    });
  },

  // Simulate POST /zones/:id/toggle
  toggleZone: (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const zone = zoneRepository.getZones().find((z) => z.id === id);
        if (zone) {
          // Write to DB
          zoneRepository.updateZone(id, { isOn: !zone.isOn });
        }
        resolve();
      }, 300);
    });
  },
  // NEW: Toggle an entire group
  toggleGroup: (groupId: string, turnOn: boolean): Promise<void> => {
    return new Promise((resolve) => {
      // 1. Find all zones in this group
      const zonesInGroup = zoneRepository
        .getZones()
        .filter((z) => z.groupId === groupId);

      // 2. Update them all in the "Database"
      zonesInGroup.forEach((zone) => {
        zoneRepository.updateZone(zone.id, { isOn: turnOn });
      });

      resolve();
    });
  },
};
