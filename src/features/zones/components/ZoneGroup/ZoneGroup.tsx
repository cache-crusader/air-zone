import React, { useCallback, useId, useState } from "react";
import type { Zone, ZoneStatus } from "../../domain/zone";
import type { Group } from "../../domain/group";
import { ZoneCard } from "../ZoneCard/ZoneCard";
import { ChevronIcon } from "../ui/icons/ChevronIcon";
import { EditIcon } from "../ui/icons/EditIcon";
import styles from "./zone-group.module.scss";

export type EnrichedZone = Zone & { calculatedStatus: ZoneStatus };

export interface ZoneGroupProps {
  group: Group;
  zones: EnrichedZone[];
  onToggleZone: (zoneId: string) => void;
  onToggleGroup: (groupId: string, turnOn: boolean) => void;
  onNavigateZone?: (zoneId: string) => void;
  defaultExpanded?: boolean;
}

export const ZoneGroup: React.FC<ZoneGroupProps> = ({
  group,
  zones,
  onToggleZone,
  onToggleGroup,
  onNavigateZone,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const headingId = useId();
  const regionId = useId();

  const totalZones = zones.length;
  const activeCount = zones.filter((z) => z.isOn).length;
  const allOn = totalZones > 0 && activeCount === totalZones;
  const allOff = totalZones > 0 && activeCount === 0;

  const groupSummary =
    totalZones === 0
      ? "No zones"
      : allOff
        ? "All off"
        : allOn
          ? "All on"
          : `${activeCount} of ${totalZones} on`;

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleGroupOff = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onToggleGroup(group.id, false);
    },
    [group.id, onToggleGroup],
  );

  const handleGroupOn = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onToggleGroup(group.id, true);
    },
    [group.id, onToggleGroup],
  );

  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <div className={styles.header}>
        <button
          id={headingId}
          className={styles.collapseBtn}
          type="button"
          aria-expanded={isExpanded}
          aria-controls={regionId}
          onClick={handleToggleExpand}
        >
          <ChevronIcon
            className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ""}`}
          />
          <span className={styles.groupName}>{group.name}</span>
        </button>

        <span
          className={styles.groupSummary}
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${group.name}: ${groupSummary}`}
        >
          {groupSummary}
        </span>

        <div
          className={styles.controls}
          role="group"
          aria-label={`${group.name} bulk controls`}
        >
          <button
            className={`${styles.controlBtn} ${allOff ? styles.controlBtnActive : ""}`}
            type="button"
            disabled={totalZones === 0}
            aria-pressed={allOff}
            onClick={handleGroupOff}
          >
            OFF
          </button>

          <button
            className={`${styles.controlBtn} ${allOn ? styles.controlBtnActive : ""}`}
            type="button"
            disabled={totalZones === 0}
            aria-pressed={allOn}
            onClick={handleGroupOn}
          >
            ON
          </button>

          <button
            className={styles.editBtn}
            type="button"
            aria-label={`Edit group ${group.name}`}
          >
            <EditIcon />
          </button>
        </div>
      </div>

      <div
        id={regionId}
        role="region"
        aria-label={`${group.name} zones`}
        aria-hidden={!isExpanded}
        className={`${styles.collapseWrapper} ${isExpanded ? styles.collapseOpen : ""}`}
      >
        <div className={styles.collapseInner}>
          {totalZones === 0 ? (
            <p className={styles.emptyNote}>No zones in this group.</p>
          ) : (
            <div className={styles.grid}>
              {zones.map((zone) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  onToggle={onToggleZone}
                  onNavigate={onNavigateZone}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ZoneGroup;
