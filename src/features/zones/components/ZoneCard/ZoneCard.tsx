import React, { useEffect, useRef, useState } from "react";
import type { Zone, ZoneStatus } from "../../domain/zone";
import { PowerIcon } from "../ui/icons/PowerIcon";
import { CoolIcon } from "../ui/icons/CoolIcon";
import { HeatIcon } from "../ui/icons/HeatIcon";
import styles from "./zone-card.module.scss";

export interface ZoneCardProps {
  zone: Zone & { calculatedStatus: ZoneStatus };
  onToggle: (id: string) => void;
  onNavigate?: (id: string) => void;
}

interface StateTokens {
  background: string;
  shadow: string;
  tempColor: string;
  nameColor: string;
  statusColor: string;
  powerColor: string;
  bgIconOpacity: number;
}

const STATE_TOKENS: Record<ZoneStatus, StateTokens> = {
  OFF: {
    background: "#ffffff",
    shadow: "0 4px 12px 0 rgba(0,0,0,0.18), 0 2px 6px 0 rgba(0,0,0,0.14)",
    tempColor: "#7b8794",
    nameColor: "#1f2933",
    statusColor: "#9aa5b1",
    powerColor: "#cbd2d9",
    bgIconOpacity: 0,
  },
  COOLING: {
    background: "radial-gradient(at 0% 100%, #40c3f7 0%, #0b69a3 100%)",
    shadow: "0 1px 3px 0 rgba(0,0,0,0.22), 0 1px 2px 0 rgba(0,0,0,0.34)",
    tempColor: "#ffffff",
    nameColor: "#ffffff",
    statusColor: "#b3ecff",
    powerColor: "#b3ecff",
    bgIconOpacity: 0.06,
  },
  COMFORT: {
    background: "radial-gradient(at 3% 99%, #2dcc9a 0%, #01644f 100%)",
    shadow: "0 1px 3px 0 rgba(0,0,0,0.22), 0 1px 2px 0 rgba(0,0,0,0.34)",
    tempColor: "#ffffff",
    nameColor: "#ffffff",
    statusColor: "#c6f7e5",
    powerColor: "#c6f7e5",
    bgIconOpacity: 0,
  },
  HEATING: {
    background: "radial-gradient(at 0% 100%, #ef694e 0%, #cf1e11 100%)",
    shadow: "0 1px 3px 0 rgba(0,0,0,0.22), 0 1px 2px 0 rgba(0,0,0,0.34)",
    tempColor: "#ffffff",
    nameColor: "#ffffff",
    statusColor: "#ffc3bd",
    powerColor: "#ffc8bd",
    bgIconOpacity: 0.08,
  },
};

function getStatusText(status: ZoneStatus, targetTemp: number): string {
  switch (status) {
    case "COOLING":
      return `Cooling to ${targetTemp}°`;
    case "HEATING":
      return `Heating to ${targetTemp}°`;
    case "COMFORT":
      return "Success";
    case "OFF":
    default:
      return "OFF";
  }
}

function getAriaLabel(
  zoneName: string,
  currentTemp: number,
  status: ZoneStatus,
  targetTemp: number,
): string {
  const isOn = status !== "OFF";
  return `${zoneName}, current temperature ${currentTemp} degrees, ${getStatusText(status, targetTemp)}, zone is ${isOn ? "on" : "off"}`;
}

type BgIcon = "cool" | "heat" | null;

function statusToBgIcon(s: ZoneStatus): BgIcon {
  if (s === "COOLING") return "cool";
  if (s === "HEATING") return "heat";
  return null;
}

function useBgIcon(status: ZoneStatus) {
  const FADE_MS = 350;

  const [icon, setIcon] = useState<BgIcon>(statusToBgIcon(status));
  const [fadingOut, setFadingOut] = useState(false);
  const prevRef = useRef<ZoneStatus>(status);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = status;

    const nextIcon = statusToBgIcon(status);
    const prevIcon = statusToBgIcon(prev);

    if (nextIcon === icon && !fadingOut) return;

    const isDirectSwitch =
      prevIcon !== null && nextIcon !== null && prevIcon !== nextIcon;

    if (isDirectSwitch) {
      setFadingOut(true);
      const t = setTimeout(() => {
        setIcon(nextIcon);
        setFadingOut(false);
      }, FADE_MS);
      return () => clearTimeout(t);
    } else {
      setIcon(nextIcon);
      setFadingOut(false);
    }
  }, [status]);

  return { icon, fadingOut };
}

export const ZoneCard: React.FC<ZoneCardProps> = ({
  zone,
  onToggle,
  onNavigate,
}) => {
  const { calculatedStatus: status, name, ambientTemp, setPoint, id } = zone;

  const tokens = STATE_TOKENS[status];
  const { icon: bgIcon, fadingOut } = useBgIcon(status);

  const isActive = status !== "OFF";
  const statusText = getStatusText(status, setPoint);
  const ariaLabel = getAriaLabel(name, ambientTemp, status, setPoint);

  const [liveMsg, setLiveMsg] = useState("");
  const prevStatusRef = useRef<ZoneStatus>(status);
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      prevStatusRef.current = status;
      setLiveMsg(`${name}: ${statusText}`);
    }
  }, [status, statusText, name]);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-power-btn]")) return;
    onNavigate?.(id);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onNavigate?.(id);
    }
  };

  const handlePowerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggle(id);
  };

  const handlePowerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onToggle(id);
    }
  };

  const cssVars = {
    "--zone-bg": tokens.background,
    "--zone-shadow": tokens.shadow,
    "--zone-temp-color": tokens.tempColor,
    "--zone-name-color": tokens.nameColor,
    "--zone-status-color": tokens.statusColor,
    "--zone-power-color": tokens.powerColor,
  } as React.CSSProperties;

  const bgIconOpacity = fadingOut ? 0 : tokens.bgIconOpacity;

  return (
    <div
      className={styles.zoneButton}
      style={cssVars}
      role="button"
      tabIndex={onNavigate ? 0 : -1}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      {bgIcon !== null && (
        <div
          className={styles.modeIconBackground}
          style={{ opacity: bgIconOpacity }}
          aria-hidden="true"
        >
          {bgIcon === "cool" && <CoolIcon className={styles.modeIcon} />}
          {bgIcon === "heat" && <HeatIcon className={styles.modeIcon} />}
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.temperature} aria-hidden="true">
          {ambientTemp}°
        </div>

        <button
          data-power-btn="true"
          className={styles.powerButton}
          type="button"
          onClick={handlePowerClick}
          onKeyDown={handlePowerKeyDown}
          aria-label={`Turn ${isActive ? "off" : "on"} ${name}`}
          aria-pressed={isActive}
        >
          <PowerIcon className={styles.powerIcon} />
        </button>
      </div>

      <div className={styles.info}>
        <div className={styles.zoneName} aria-hidden="true">
          {name}
        </div>
        <div className={styles.status} aria-hidden="true">
          {statusText}
        </div>
      </div>

      <div
        className={styles.srOnly}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveMsg}
      </div>
    </div>
  );
};

export default ZoneCard;
