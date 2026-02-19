// src/services/mockDatabase.ts
import type { Zone } from "../domain/zone";
import type { Group } from "../domain/group";

// 1. Initial Data (so the app isn't empty on start)
const INITIAL_GROUPS: Group[] = [
  { id: "g1", name: "Planta baja" },
  { id: "g2", name: "Primer piso" },
];
const INITIAL_ZONES: Zone[] = [
  {
    id: "1",
    name: "Sala de estar",
    groupId: "g1",
    ambientTemp: 21,
    setPoint: 22,
    isOn: true,
  },
  {
    id: "2",
    name: "Cocina",
    groupId: "g1",
    ambientTemp: 23,
    setPoint: 21,
    isOn: true,
  },
  {
    id: "3",
    name: "Dormitorio principal",
    groupId: "g2",
    ambientTemp: 24,
    setPoint: 20,
    isOn: false,
  },
  {
    id: "4",
    name: "Habitación de invitados",
    groupId: null,
    ambientTemp: 19,
    setPoint: 22,
    isOn: false,
  },
  {
    id: "5",
    name: "Oficina",
    groupId: "g2",
    ambientTemp: 22,
    setPoint: 23,
    isOn: true,
  },
  {
    id: "6",
    name: "Baño",
    groupId: "g3",
    ambientTemp: 20,
    setPoint: 24,
    isOn: true,
  },
  {
    id: "7",
    name: "Comedor",
    groupId: "g1",
    ambientTemp: 21,
    setPoint: 21,
    isOn: false,
  },
  {
    id: "8",
    name: "Sótano",
    groupId: "g1",
    ambientTemp: 17,
    setPoint: 19,
    isOn: true,
  },
  {
    id: "9",
    name: "Garaje",
    groupId: "g1",
    ambientTemp: 15,
    setPoint: 18,
    isOn: false,
  },
  {
    id: "10",
    name: "Dormitorio de niños",
    groupId: "g2",
    ambientTemp: 23,
    setPoint: 22,
    isOn: true,
  },
];

class InMemoryZoneRepository {
  private zones: Zone[] = [...INITIAL_ZONES];
  private groups: Group[] = [...INITIAL_GROUPS];
  private listeners: ((zones: Zone[], groups: Group[]) => void)[] = [];

  // --- GETTERS ---
  getState() {
    return {
      zones: [...this.zones],
      groups: [...this.groups],
    };
  }

  // ADD THESE BACK for the ApiService
  getZones() {
    return [...this.zones];
  }

  getGroups() {
    return [...this.groups];
  }

  // --- ZONE ACTIONS ---
  updateZone(id: string, updates: Partial<Zone>) {
    this.zones = this.zones.map((z) =>
      z.id === id ? { ...z, ...updates } : z,
    );
    this.notify();
  }

  // --- GROUP ACTIONS (NEW) ---
  addGroup(group: Group) {
    this.groups = [...this.groups, group];
    this.notify();
  }

  removeGroup(groupId: string) {
    // 1. Delete the group
    this.groups = this.groups.filter((g) => g.id !== groupId);

    // 2. IMPORTANT: "Release" the zones (set groupId to null)
    // This mimics a database "ON DELETE SET NULL"
    this.zones = this.zones.map((z) =>
      z.groupId === groupId ? { ...z, groupId: null } : z,
    );

    this.notify();
  }

  // --- SIMULATION ---
  simulateTempChange() {
    this.zones = this.zones.map((z) => {
      if (!z.isOn) return z; // Don't change temp if off (optional realism)
      const change = Math.random() > 0.5 ? 1 : -1;
      return {
        ...z,
        ambientTemp: z.ambientTemp + change,
      };
    });
    this.notify();
  }

  // --- INFRASTRUCTURE ---
  subscribe(callback: (zones: Zone[], groups: Group[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    // We send the WHOLE state now (Zones + Groups)
    this.listeners.forEach((cb) => cb(this.zones, this.groups));
  }
}

// Export a SINGLE INSTANCE (Singleton)
export const zoneRepository = new InMemoryZoneRepository();
