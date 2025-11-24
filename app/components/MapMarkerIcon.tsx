import React from "react";

export default function MapMarkerIcon() {
  return (
    <div className="icon" aria-hidden>
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"
          fill="#FF6A00"
          opacity="0.12"
        />
        <path d="M12 6.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="#FF6A00" />
      </svg>
    </div>
  );
}
