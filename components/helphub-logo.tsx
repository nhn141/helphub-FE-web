import React from "react";

interface HelpHubLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function HelpHubLogo({ size = 36, className = "", ...props }: HelpHubLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label="HelpHub logo"
      className={className}
      {...props}
    >
      {/* Left H : requester / community in need - deep volunteer green */}
      <g fill="#2F6B3A">
        <rect x="8" y="18" width="15" height="84" rx="7.5" />
        <rect x="41" y="18" width="15" height="84" rx="7.5" />
        <rect x="8" y="52" width="52" height="16" />
      </g>
      {/* Right H : volunteer / supporter - warm amber */}
      <g fill="#E99A17">
        <rect x="64" y="18" width="15" height="84" rx="7.5" />
        <rect x="97" y="18" width="15" height="84" rx="7.5" />
        <rect x="60" y="52" width="52" height="16" />
      </g>
      {/* The Hub : where both sides meet */}
      <circle cx="60" cy="60" r="11" fill="#FFFFFF" />
      <circle cx="60" cy="60" r="5.5" fill="#2F6B3A" />
    </svg>
  );
}

export default HelpHubLogo;

