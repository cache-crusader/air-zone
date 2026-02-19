import React from "react";
import { useNavigate } from "react-router-dom";
import { ZonesView } from "../features/zones/components/ZonesView/ZonesView";

/**
 * ZonesPage
 *
 * Thin page wrapper that connects ZonesView (a pure UI component)
 * to React Router. The view doesn't know about routing — it just
 * calls onNavigateZone(id) and the page decides where to go.
 */
const ZonesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateZone = (zoneId: string) => {
    navigate(`/zones/${zoneId}`);
  };

  return <ZonesView onNavigateZone={handleNavigateZone} />;
};

export default ZonesPage;
