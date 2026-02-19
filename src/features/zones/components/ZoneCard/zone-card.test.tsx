import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ZoneCard } from "./ZoneCard";

vi.mock("./zone-card.module.scss", () => ({ default: {} }));
vi.mock("../ui/icons/PowerIcon", () => ({
  PowerIcon: () => <svg data-testid="power-icon" />,
}));
vi.mock("../ui/icons/CoolIcon", () => ({
  CoolIcon: () => <svg data-testid="cool-icon" />,
}));
vi.mock("../ui/icons/HeatIcon", () => ({
  HeatIcon: () => <svg data-testid="heat-icon" />,
}));

const baseZone = {
  id: "zone-1",
  name: "Living Room",
  ambientTemp: 22,
  setPoint: 20,
  groupId: "group-1",
  isOn: true,
};

function renderCard(
  status: "OFF" | "COOLING" | "HEATING" | "COMFORT" = "OFF",
  onToggle = vi.fn(),
  onNavigate = vi.fn(),
) {
  render(
    <ZoneCard
      zone={{ ...baseZone, calculatedStatus: status }}
      onToggle={onToggle}
      onNavigate={onNavigate}
    />,
  );
  return { onToggle, onNavigate };
}

describe("ZoneCard", () => {
  it("renders the zone name and current temperature", () => {
    renderCard();
    expect(screen.getByText("Living Room")).toBeInTheDocument();
    expect(screen.getByText(/22°/)).toBeInTheDocument();
  });

  it('shows "OFF" status when zone is off', () => {
    renderCard("OFF");
    expect(screen.getByText("OFF")).toBeInTheDocument();
  });

  it("shows cooling status text when zone is cooling", () => {
    renderCard("COOLING");
    expect(screen.getByText(/cooling to 20°/i)).toBeInTheDocument();
  });

  it("shows heating status text when zone is heating", () => {
    renderCard("HEATING");
    expect(screen.getByText(/heating to 20°/i)).toBeInTheDocument();
  });

  it("shows cool background icon when cooling", () => {
    renderCard("COOLING");
    expect(screen.getByTestId("cool-icon")).toBeInTheDocument();
  });

  it("shows heat background icon when heating", () => {
    renderCard("HEATING");
    expect(screen.getByTestId("heat-icon")).toBeInTheDocument();
  });

  it("calls onToggle with the zone id when power button is clicked", async () => {
    const user = userEvent.setup();
    const { onToggle } = renderCard("OFF");

    await user.click(
      screen.getByRole("button", { name: /turn on living room/i }),
    );

    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith("zone-1");
  });

  it("power button label switches based on active state", () => {
    const { rerender } = render(
      <ZoneCard
        zone={{ ...baseZone, calculatedStatus: "OFF" }}
        onToggle={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /turn on living room/i }),
    ).toBeInTheDocument();

    rerender(
      <ZoneCard
        zone={{ ...baseZone, calculatedStatus: "COOLING" }}
        onToggle={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /turn off living room/i }),
    ).toBeInTheDocument();
  });

  it("calls onNavigate when the card body is clicked", async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderCard("OFF");

    await user.click(screen.getByText("Living Room"));

    expect(onNavigate).toHaveBeenCalledWith("zone-1");
  });

  it("clicking the power button does not trigger onNavigate", async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderCard("OFF");

    await user.click(
      screen.getByRole("button", { name: /turn on living room/i }),
    );

    expect(onNavigate).not.toHaveBeenCalled();
  });
});
