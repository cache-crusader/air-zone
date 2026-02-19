import type { Zone, ZoneStatus } from "./zone";

export const determineZoneStatus = (zone: Zone): ZoneStatus => {
  if (!zone.isOn) return "OFF";

  if (zone.ambientTemp > zone.setPoint) return "COOLING";
  if (zone.ambientTemp < zone.setPoint) return "HEATING";
  return "COMFORT";
};
