import React from "react";

export type IconName = "plus" | "more" | "close" | "grip" | "arrow";

export function Icon({
  name,
  className = "w-4 h-4",
}: {
  name: IconName;
  className?: string;
}) {
  if (name === "plus") {
    return (
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 4v12M4 10h12" />
      </svg>
    );
  }
  if (name === "close") {
    return (
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 5 10 10M15 5 5 15" />
      </svg>
    );
  }
  if (name === "more") {
    return (
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className={className}
        fill="currentColor"
      >
        <circle cx="4" cy="10" r="1.5" />
        <circle cx="10" cy="10" r="1.5" />
        <circle cx="16" cy="10" r="1.5" />
      </svg>
    );
  }
  if (name === "grip") {
    return (
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className={className}
        fill="currentColor"
      >
        <circle cx="5" cy="4" r="1.2" />
        <circle cx="11" cy="4" r="1.2" />
        <circle cx="5" cy="8" r="1.2" />
        <circle cx="11" cy="8" r="1.2" />
        <circle cx="5" cy="12" r="1.2" />
        <circle cx="11" cy="12" r="1.2" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h12m-5-5 5 5-5 5" />
    </svg>
  );
}
