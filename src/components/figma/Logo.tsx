export function Logo({
  className = '',
  size = 120,
}: {
  className?: string;
  size?: number;
}) {
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
        <line
          x1="20"
          y1="30"
          x2="80"
          y2="30"
          stroke="#2C3E50"
          strokeWidth="2"
        />
        <line
          x1="15"
          y1="45"
          x2="85"
          y2="45"
          stroke="#2C3E50"
          strokeWidth="2"
        />
        <line
          x1="25"
          y1="60"
          x2="90"
          y2="60"
          stroke="#2C3E50"
          strokeWidth="2"
        />
        <line
          x1="30"
          y1="35"
          x2="30"
          y2="85"
          stroke="#2C3E50"
          strokeWidth="2"
        />
        <line
          x1="50"
          y1="25"
          x2="50"
          y2="90"
          stroke="#2C3E50"
          strokeWidth="2"
        />
        <line
          x1="70"
          y1="30"
          x2="70"
          y2="80"
          stroke="#2C3E50"
          strokeWidth="2"
        />
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

      {/* Spoon */}
      <g transform="translate(63, 28)">
        <path
          d="M3 4C3 4 3 6 3 7C3 8 4 9 5 9C6 9 7 8 7 7C7 6 7 4 7 4M5 9L5 18"
          stroke="#2C3E50"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
