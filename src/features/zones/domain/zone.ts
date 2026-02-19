export interface Zone {
  id: string;
  groupId: string | null;
  name: string;
  ambientTemp: number;
  setPoint: number;
  isOn: boolean;
}

export type ZoneStatus = "OFF" | "COOLING" | "HEATING" | "COMFORT";
