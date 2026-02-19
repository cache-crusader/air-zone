import React from "react";

interface IconProps {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Power icon — sourced from power.svg provided in the design system.
 * Uses currentColor so it inherits the parent's color via CSS.
 */
export const PowerIcon: React.FC<IconProps> = ({
  className,
  "aria-hidden": ariaHidden = true,
}) => (
  <svg
    className={className}
    width="22"
    height="24"
    viewBox="0 0 22 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={ariaHidden}
    focusable="false"
  >
    {/* Vertical stem */}
    <path
      d="M10.8 10.893692C10.22808 10.893692 9.702128 10.518338 9.702128 9.947488L9.702128 0.946203C9.702128 0.375353 10.22808 0 10.8 0C11.37192 0 11.897872 0.375353 11.897872 0.946203L11.897872 9.947488C11.897872 10.518338 11.37192 10.893692 10.8 10.893692Z"
      fill="currentColor"
    />
    {/* Arc */}
    <path
      d="M10.8 24C4.844047 24 0 19.256871 0 13.425C0 9.223459 2.543248 5.421216 6.483459 3.734625C7.038758 3.501292 7.683248 3.748547 7.924642 4.290039C8.168603 4.834511 7.914108 5.469488 7.358655 5.705956C4.221842 7.048779 2.195745 10.078224 2.195745 13.425C2.195745 18.069729 6.056447 21.85 10.8 21.85C15.543553 21.85 19.404255 18.069729 19.404255 13.425C19.404255 10.078224 17.378158 7.048779 14.242483 5.706442C13.685892 5.469488 13.431397 4.834511 13.675718 4.289238C13.919124 3.748154 14.563029 3.501123 15.12034 3.736236C19.056752 5.421216 21.6 9.223459 21.6 13.425C21.6 19.256871 16.755953 24 10.8 24Z"
      fill="currentColor"
    />
  </svg>
);

export default PowerIcon;
