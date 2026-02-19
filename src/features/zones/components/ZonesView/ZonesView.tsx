import React from "react";
import { ZoneGroup } from "../ZoneGroup/ZoneGroup";
import { ZoneCard } from "../ZoneCard/ZoneCard";
import { useZonesView } from "../../hooks/use-zones-view";
import styles from "./zones-view.module.scss";

export interface ZonesViewProps {
  onNavigateZone?: (zoneId: string) => void;
}

export const ZonesView: React.FC<ZonesViewProps> = ({ onNavigateZone }) => {
  const {
    groups,
    groupedZones,
    orphanZones,
    isLoading,
    handleToggleZone,
    handleToggleGroup,
  } = useZonesView();

  const hasContent = groups.length > 0 || orphanZones.length > 0;

  return (
    <main
      className={styles.view}
      aria-label="Zone controls"
      aria-busy={isLoading}
    >
      {isLoading && (
        <div
          className={styles.loadingState}
          role="status"
          aria-live="polite"
          aria-label="Loading zones…"
        >
          <div className={styles.spinner} aria-hidden="true" />
          <span className={styles.loadingText}>Loading zones…</span>
        </div>
      )}

      {!isLoading &&
        groups.map((group) => (
          <ZoneGroup
            key={group.id}
            group={group}
            zones={groupedZones.get(group.id) ?? []}
            onToggleZone={handleToggleZone}
            onToggleGroup={handleToggleGroup}
            onNavigateZone={onNavigateZone}
            defaultExpanded
          />
        ))}

      {!isLoading && orphanZones.length > 0 && (
        <section aria-label="Other zones" className={styles.orphanSection}>
          {groups.length > 0 && (
            <h2 className={styles.orphanHeading}>Other Zones</h2>
          )}
          <div className={styles.grid}>
            {orphanZones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                onToggle={handleToggleZone}
                onNavigate={onNavigateZone}
              />
            ))}
          </div>
        </section>
      )}

      {!isLoading && !hasContent && (
        <div className={styles.emptyState} role="status">
          <p>No zones configured.</p>
        </div>
      )}
    </main>
  );
};

export default ZonesView;
