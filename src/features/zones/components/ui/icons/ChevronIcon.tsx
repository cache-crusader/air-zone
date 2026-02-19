import React from "react";

interface ChevronIconProps {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

export const ChevronIcon: React.FC<ChevronIconProps> = ({
  className,
  "aria-hidden": ariaHidden = true,
}) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={ariaHidden}
    focusable="false"
  >
    <path
      d="M3.5 6L8 10.5L12.5 6"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ChevronIcon;
