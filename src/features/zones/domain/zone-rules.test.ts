// @vitest-environment node
import { describe, it, expect } from "vitest";
import { determineZoneStatus } from "./zone-rules";
import type { Zone } from "./zone";

describe("determineZoneStatus", () => {
  const baseZone: Zone = {
    id: "zone-1",
    groupId: null,
    name: "Living Room",
    ambientTemp: 20,
    setPoint: 20,
    isOn: true,
  };

  it("returns OFF when zone is turned off", () => {
    const zone: Zone = { ...baseZone, isOn: false };

    expect(determineZoneStatus(zone)).toBe("OFF");
  });

  it("returns COOLING when ambientTemp is higher than setPoint", () => {
    const zone: Zone = { ...baseZone, ambientTemp: 25, setPoint: 20 };

    expect(determineZoneStatus(zone)).toBe("COOLING");
  });

  it("returns HEATING when ambientTemp is lower than setPoint", () => {
    const zone: Zone = { ...baseZone, ambientTemp: 18, setPoint: 20 };

    expect(determineZoneStatus(zone)).toBe("HEATING");
  });

  it("returns COMFORT when ambientTemp equals setPoint", () => {
    const zone: Zone = { ...baseZone, ambientTemp: 20, setPoint: 20 };

    expect(determineZoneStatus(zone)).toBe("COMFORT");
  });
});
