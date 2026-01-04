import type React from "react";

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 60"
      fill="none"
      className={className}
      {...props}
    >
      <title>WillFit Logo</title>

      <defs>
        {/* Main lime green gradient (oklch 0.72 0.19 145) */}
        <linearGradient id="limeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7AED8D" />
          <stop offset="50%" stopColor="#5DD970" />
          <stop offset="100%" stopColor="#4BC45F" />
        </linearGradient>

        {/* Highlight gradient for 3D effect on bars */}
        <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9FF5AB" />
          <stop offset="40%" stopColor="#5DD970" />
          <stop offset="100%" stopColor="#3DA84A" />
        </linearGradient>

        {/* Subtle drop shadow only */}
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="0.8"
            floodColor="#1A5C2A"
            floodOpacity="0.35"
          />
        </filter>
      </defs>

      <g transform="translate(30, 30)" filter="url(#shadow)">
        {/* Left vertical bar */}
        <rect
          x="-22"
          y="-12"
          width="5"
          height="24"
          rx="1.5"
          fill="url(#highlightGrad)"
        />

        {/* Right vertical bar */}
        <rect
          x="17"
          y="-12"
          width="5"
          height="24"
          rx="1.5"
          fill="url(#highlightGrad)"
        />

        {/* W shape */}
        <path
          d="M-15 -10 L-15 12 L-8 12 L-8 -2 L0 15 L8 -2 L8 12 L15 12 L15 -10"
          fill="url(#limeGrad)"
        />
      </g>
    </svg>
  );
}
