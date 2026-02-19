import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useZoneDetail } from "../features/zones/hooks/use-zone-detail";
import type { ZoneStatus } from "../features/zones/domain/zone";
import { PowerIcon } from "../features/zones/components/ui/icons/PowerIcon";
import { CoolIcon } from "../features/zones/components/ui/icons/CoolIcon";
import { HeatIcon } from "../features/zones/components/ui/icons/HeatIcon";
import styles from "./zone-detail-page.module.scss";

// ─── State config ─────────────────────────────────────────────────────────────

interface StateConfig {
  label: string;
  bgColor: string;
  bgImage: string;
  shadow: string;
}

const STATE_CONFIG: Record<ZoneStatus, StateConfig> = {
  OFF: {
    label: "Off",
    bgColor: "#ffffff",
    bgImage: "none",
    shadow: "0 8px 32px 0 rgba(0,0,0,0.10)",
  },
  COOLING: {
    label: "Cooling",
    bgColor: "transparent",
    bgImage: "radial-gradient(at 0% 100%, #40c3f7 0%, #0b69a3 100%)",
    shadow: "0 8px 32px 0 rgba(11,105,163,0.40)",
  },
  COMFORT: {
    label: "Comfort",
    bgColor: "transparent",
    bgImage: "radial-gradient(at 3% 99%, #2dcc9a 0%, #01644f 100%)",
    shadow: "0 8px 32px 0 rgba(1,100,79,0.40)",
  },
  HEATING: {
    label: "Heating",
    bgColor: "transparent",
    bgImage: "radial-gradient(at 0% 100%, #ef694e 0%, #cf1e11 100%)",
    shadow: "0 8px 32px 0 rgba(207,30,17,0.35)",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const ZoneDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    zone,
    isLoading,
    notFound,
    handleToggle,
    handleSetPointUp,
    handleSetPointDown,
  } = useZoneDetail(id);

  if (isLoading) {
    return (
      <main className={styles.page}>
        <BackButton onClick={() => navigate(-1)} />
        <div className={styles.loadingState} role="status" aria-live="polite">
          <div className={styles.spinner} aria-hidden="true" />
          <span>Loading zone…</span>
        </div>
      </main>
    );
  }

  if (notFound || !zone) {
    return (
      <main className={styles.page}>
        <BackButton onClick={() => navigate(-1)} />
        <div className={styles.notFound} role="alert">
          <p className={styles.notFoundTitle}>Zone not found</p>
          <p className={styles.notFoundSub}>No zone with ID «{id}».</p>
          <button
            className={styles.goBackBtn}
            type="button"
            onClick={() => navigate("/zones")}
          >
            Back to all zones
          </button>
        </div>
      </main>
    );
  }

  const cfg = STATE_CONFIG[zone.calculatedStatus];
  const isOn = zone.calculatedStatus !== "OFF";
  const diff = parseFloat((zone.ambientTemp - zone.setPoint).toFixed(1));

  const heroVars = {
    "--hero-bg-color": cfg.bgColor,
    "--hero-bg-image": cfg.bgImage,
    "--hero-shadow": cfg.shadow,
  } as React.CSSProperties;

  return (
    <main className={styles.page}>
      <BackButton onClick={() => navigate(-1)} />

      {/* ── Hero card ────────────────────────────────────────────────────────── */}
      <div
        className={`${styles.hero} ${isOn ? styles.heroOn : styles.heroOff}`}
        style={heroVars}
        aria-label={`${zone.name}, ${zone.ambientTemp}°, ${cfg.label}`}
      >
        {/* Decorative background icon */}
        {zone.calculatedStatus === "COOLING" && (
          <span className={styles.heroBgIcon} aria-hidden="true">
            <CoolIcon className={styles.heroBgIconSvg} />
          </span>
        )}
        {zone.calculatedStatus === "HEATING" && (
          <span className={styles.heroBgIcon} aria-hidden="true">
            <HeatIcon className={styles.heroBgIconSvg} />
          </span>
        )}

        {/* Status badge + power button */}
        <div className={styles.heroTop}>
          <span className={styles.statusBadge}>{cfg.label}</span>
          <button
            className={`${styles.powerBtn} ${isOn ? styles.powerBtnOn : ""}`}
            type="button"
            onClick={handleToggle}
            aria-label={`Turn ${isOn ? "off" : "on"} ${zone.name}`}
            aria-pressed={isOn}
          >
            <PowerIcon className={styles.powerIcon} />
          </button>
        </div>

        {/* Ambient temperature — the hero number */}
        <div
          className={styles.heroTemp}
          aria-label={`Ambient: ${zone.ambientTemp}°`}
        >
          {zone.ambientTemp}
          <span className={styles.heroTempUnit}>°</span>
        </div>

        {/* Zone name */}
        <div className={styles.heroName}>{zone.name}</div>
      </div>

      {/* ── Set-point control ─────────────────────────────────────────────────── */}
      <section
        className={styles.setPointCard}
        aria-label="Target temperature control"
      >
        <span className={styles.setPointLabel}>Target temperature</span>
        <div className={styles.setPointRow}>
          <button
            className={styles.setPointBtn}
            type="button"
            onClick={handleSetPointDown}
            disabled={!isOn}
            aria-label="Decrease target temperature"
          >
            −
          </button>
          <div
            className={styles.setPointValue}
            aria-live="polite"
            aria-atomic="true"
          >
            {zone.setPoint}
            <span className={styles.setPointUnit}>°</span>
          </div>
          <button
            className={styles.setPointBtn}
            type="button"
            onClick={handleSetPointUp}
            disabled={!isOn}
            aria-label="Increase target temperature"
          >
            +
          </button>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────────── */}
      <div
        className={styles.statsGrid}
        role="list"
        aria-label="Zone statistics"
      >
        <StatCard
          label="Ambient"
          value={`${zone.ambientTemp}°`}
          sub="Current temp"
        />
        <StatCard label="Target" value={`${zone.setPoint}°`} sub="Set point" />
        <StatCard
          label="Difference"
          value={`${diff > 0 ? "+" : ""}${diff}°`}
          sub={
            diff > 0 ? "Above target" : diff < 0 ? "Below target" : "At target"
          }
          accent={diff !== 0}
        />
        <StatCard
          label="Status"
          value={cfg.label}
          sub={isOn ? "Active" : "Off"}
        />
      </div>
    </main>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className={styles.backBtn}
      type="button"
      onClick={onClick}
      aria-label="Go back"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 12L6 8l4-4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back
    </button>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`${styles.statCard} ${accent ? styles.statCardAccent : ""}`}
      role="listitem"
    >
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statSub}>{sub}</span>
    </div>
  );
}

export default ZoneDetailPage;
