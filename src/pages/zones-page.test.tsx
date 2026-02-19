import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ZonesPage from "./ZonesPage";

// Mock useNavigate so we can assert on it
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: vi.fn() };
});

// Mock ZonesView — expose onNavigateZone via a button so we can trigger it
vi.mock("../features/zones/components/ZonesView/ZonesView", () => ({
  ZonesView: ({ onNavigateZone }: { onNavigateZone: (id: string) => void }) => (
    <div>
      <span>Zones list</span>
      <button onClick={() => onNavigateZone("zone-42")}>Open zone</button>
    </div>
  ),
}));

function renderPage() {
  const navigateMock = vi.fn();
  (useNavigate as Mock).mockReturnValue(navigateMock);

  render(
    <MemoryRouter>
      <ZonesPage />
    </MemoryRouter>,
  );

  return { navigateMock };
}

describe("ZonesPage", () => {
  it("renders the zones view", () => {
    renderPage();
    expect(screen.getByText("Zones list")).toBeInTheDocument();
  });

  it("navigates to the zone detail page when a zone is selected", async () => {
    const user = userEvent.setup();
    const { navigateMock } = renderPage();

    await user.click(screen.getByRole("button", { name: "Open zone" }));

    expect(navigateMock).toHaveBeenCalledOnce();
    expect(navigateMock).toHaveBeenCalledWith("/zones/zone-42");
  });
});
