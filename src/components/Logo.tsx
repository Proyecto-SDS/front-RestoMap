export function Logo({ className = "", size = 120 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Map background subtle lines */}
      <g opacity="0.15">
        <line x1="20" y1="30" x2="80" y2="30" stroke="#2C3E50" strokeWidth="2" />
        <line x1="15" y1="45" x2="85" y2="45" stroke="#2C3E50" strokeWidth="2" />
        <line x1="25" y1="60" x2="90" y2="60" stroke="#2C3E50" strokeWidth="2" />
        <line x1="30" y1="35" x2="30" y2="85" stroke="#2C3E50" strokeWidth="2" />
        <line x1="50" y1="25" x2="50" y2="90" stroke="#2C3E50" strokeWidth="2" />
        <line x1="70" y1="30" x2="70" y2="80" stroke="#2C3E50" strokeWidth="2" />
      </g>

      {/* Location Pin */}
      <path
        d="M60 15C46.7452 15 36 25.7452 36 39C36 48.5 46 65 60 80C74 65 84 48.5 84 39C84 25.7452 73.2548 15 60 15Z"
        fill="#FF6B35"
        stroke="#2C3E50"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner circle */}
      <circle cx="60" cy="39" r="18" fill="#FFD23F" />

      {/* Fork */}
      <g transform="translate(52, 28)">
        <path
          d="M3 4L3 18M1 4L1 10C1 11 2 12 3 12M5 4L5 10C5 11 4 12 3 12"
          stroke="#2C3E50"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Knife */}
      <g transform="translate(62, 28)">
        <path
          d="M5 4L5 18M5 4C5 4 3 4 3 6L3 8C3 9 4 10 5 10"
          stroke="#2C3E50"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Info card at bottom */}
      <rect
        x="25"
        y="85"
        width="70"
        height="28"
        rx="6"
        fill="white"
        stroke="#2C3E50"
        strokeWidth="3"
      />

      {/* Stars */}
      <g transform="translate(32, 91)">
        {[0, 9, 18, 27, 36].map((x, i) => (
          <path
            key={i}
            d="M4.5 0L5.5 3H8.5L6 4.5L7 7.5L4.5 5.5L2 7.5L3 4.5L0.5 3H3.5L4.5 0Z"
            fill="#FF6B35"
            transform={`translate(${x}, 0) scale(0.7)`}
          />
        ))}
      </g>

      {/* Time text placeholder */}
      <rect x="30" y="103" width="3" height="3" rx="0.5" fill="#27AE60" />
      <rect x="35" y="103" width="8" height="3" rx="0.5" fill="#E0E0E0" />
      <rect x="45" y="103" width="8" height="3" rx="0.5" fill="#E0E0E0" />
      <rect x="55" y="103" width="8" height="3" rx="0.5" fill="#E0E0E0" />
    </svg>
  );
}
