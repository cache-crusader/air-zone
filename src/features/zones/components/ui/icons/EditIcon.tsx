import React from "react";

interface EditIconProps {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

export const EditIcon: React.FC<EditIconProps> = ({
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
      d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5.5 12.5l-3 .75.75-3L11.5 2.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default EditIcon;
