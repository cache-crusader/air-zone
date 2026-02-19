import { test, expect, type Page } from "@playwright/test";

// ─── Constants ────────────────────────────────────────────────────────────────
// These match INITIAL_ZONES / INITIAL_GROUPS in in-memory-zone-repository.ts

const ZONES = {
  salaDeEstar: { id: "1", name: "Sala de estar" }, // g1, isOn: true
  cocina: { id: "2", name: "Cocina" }, // g1, isOn: true
  dormitorio: { id: "3", name: "Dormitorio principal" }, // g2, isOn: false
  habitacion: { id: "4", name: "Habitación de invitados" }, // orphan, isOn: false
};

const GROUPS = {
  plantaBaja: "Planta baja", // g1
  primerPiso: "Primer piso", // g2
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Navigate to /zones and wait until all groups have rendered */
async function goToZones(page: Page) {
  await page.goto("http://localhost:5173/zones");
  // The main element sets aria-busy="true" while loading and flips it to
  // "false" once ApiService.fetchAllZones() resolves (~500 ms fake delay).
  await page.waitForSelector(
    '[aria-label="Zone controls"][aria-busy="false"]',
    {
      timeout: 5000,
    },
  );
}

function zonePowerBtn(page: Page, zoneName: string) {
  return page
    .locator("[data-power-btn]", {
      hasText: "", // just type-narrows to buttons with that attr
    })
    .and(
      page.getByRole("button", {
        name: new RegExp(`(Turn off|Turn on) ${zoneName}`, "i"),
      }),
    );
}

function groupBulkBtn(page: Page, groupName: string, action: "ON" | "OFF") {
  return page
    .getByRole("group", { name: `${groupName} bulk controls` })
    .getByRole("button", { name: action, exact: true });
}

test.describe("Zones list — initial render", () => {
  test("shows group headings from seed data", async ({ page }) => {
    await goToZones(page);
    await expect(page.getByText(GROUPS.plantaBaja)).toBeVisible();
    await expect(page.getByText(GROUPS.primerPiso)).toBeVisible();
  });

  test("shows orphan zones in the 'Other Zones' section", async ({ page }) => {
    await goToZones(page);
    await expect(page.getByText(ZONES.habitacion.name)).toBeVisible();
  });

  test("each zone card is accessible via role=button", async ({ page }) => {
    await goToZones(page);
    // ZoneCard root has role="button" + aria-label containing the zone name
    await expect(
      page
        .getByRole("button", { name: new RegExp(ZONES.salaDeEstar.name) })
        .first(),
    ).toBeVisible();
  });
});

test.describe("ZoneCard — power toggle", () => {
  test.beforeEach(async ({ page }) => {
    await goToZones(page);
  });

  test("power button reflects correct initial aria-pressed state", async ({
    page,
  }) => {
    // 'Sala de estar' seeds with isOn: true
    await expect(zonePowerBtn(page, ZONES.salaDeEstar.name)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // 'Dormitorio principal' seeds with isOn: false
    await expect(zonePowerBtn(page, ZONES.dormitorio.name)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("clicking an ON zone's power button turns it OFF", async ({ page }) => {
    const btn = zonePowerBtn(page, ZONES.salaDeEstar.name);
    await expect(btn).toHaveAttribute("aria-pressed", "true");

    await btn.click();

    // ApiService.toggleZone has a 300 ms fake delay → allow 2 s for the
    // repository to notify and React to re-render.
    // FIX: don't re-use the old label — the locator regex covers both states,
    // so `btn` still resolves after the aria-label flips.
    await expect(btn).toHaveAttribute("aria-pressed", "false", {
      timeout: 2000,
    });
  });

  test("clicking an OFF zone's power button turns it ON", async ({ page }) => {
    const btn = zonePowerBtn(page, ZONES.dormitorio.name);
    await expect(btn).toHaveAttribute("aria-pressed", "false");

    await btn.click();

    await expect(btn).toHaveAttribute("aria-pressed", "true", {
      timeout: 2000,
    });
  });

  test("power button click does NOT navigate away from /zones", async ({
    page,
  }) => {
    await zonePowerBtn(page, ZONES.salaDeEstar.name).click();
    await expect(page).toHaveURL(/\/zones$/);
  });
});

test.describe("ZoneCard — navigation", () => {
  test.beforeEach(async ({ page }) => {
    await goToZones(page);
  });

  test("clicking the zone name navigates to /zones/:id", async ({ page }) => {
    // Click the text node (not the power button) to trigger onNavigate
    await page.getByText(ZONES.salaDeEstar.name).first().click();
    await expect(page).toHaveURL(new RegExp(`/zones/${ZONES.salaDeEstar.id}$`));
  });

  test("Back button returns to /zones", async ({ page }) => {
    await page.getByText(ZONES.salaDeEstar.name).first().click();
    await expect(page).toHaveURL(new RegExp(`/zones/${ZONES.salaDeEstar.id}`));

    await page.getByRole("button", { name: "Go back" }).click();
    await expect(page).toHaveURL(/\/zones$/);
  });
});

test.describe("ZoneGroup — bulk ON / OFF controls", () => {
  test.beforeEach(async ({ page }) => {
    await goToZones(page);
  });

  test("group OFF button turns all zones in the group off", async ({
    page,
  }) => {
    await groupBulkBtn(page, GROUPS.plantaBaja, "OFF").click();

    // A zone that seeded ON (Sala de estar) must now have aria-pressed="false"
    await expect(zonePowerBtn(page, ZONES.salaDeEstar.name)).toHaveAttribute(
      "aria-pressed",
      "false",
      { timeout: 2000 },
    );

    // Summary badge updates to "All off"
    await expect(page.getByLabel(`${GROUPS.plantaBaja}: All off`)).toBeVisible({
      timeout: 2000,
    });
  });

  test("group ON button turns all zones in the group on", async ({ page }) => {
    // Take everything off first, then bring it back on
    await groupBulkBtn(page, GROUPS.plantaBaja, "OFF").click();
    await expect(page.getByLabel(`${GROUPS.plantaBaja}: All off`)).toBeVisible({
      timeout: 2000,
    });

    await groupBulkBtn(page, GROUPS.plantaBaja, "ON").click();

    await expect(page.getByLabel(`${GROUPS.plantaBaja}: All on`)).toBeVisible({
      timeout: 2000,
    });
  });

  test("OFF bulk button gets aria-pressed=true when all zones are off", async ({
    page,
  }) => {
    const offBtn = groupBulkBtn(page, GROUPS.plantaBaja, "OFF");
    await offBtn.click();

    await expect(offBtn).toHaveAttribute("aria-pressed", "true", {
      timeout: 2000,
    });
  });

  test("ON bulk button gets aria-pressed=true when all zones are on", async ({
    page,
  }) => {
    const onBtn = groupBulkBtn(page, GROUPS.plantaBaja, "ON");
    await onBtn.click();

    await expect(onBtn).toHaveAttribute("aria-pressed", "true", {
      timeout: 2000,
    });
  });
});
