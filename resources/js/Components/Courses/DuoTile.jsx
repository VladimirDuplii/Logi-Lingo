import React from "react";

// Minimal inline SVGs to approximate the Duolingo icons
const StarIcon = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
            fill="currentColor"
            d="M12 2l2.9 6.2 6.8.6-5.1 4.4 1.6 6.6L12 16.8 5.8 19.8l1.6-6.6L2.3 8.8l6.8-.6L12 2z"
        />
    </svg>
);

const BookIcon = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
            fill="currentColor"
            d="M4 3h12a3 3 0 0 1 3 3v12a1 1 0 0 1-1.4.9L16 18.6l-1.6.7A3 3 0 0 1 12 20H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm0 2v13h8a1 1 0 0 0 .4-.1L16 17V5H4z"
        />
    </svg>
);

const DumbbellIcon = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
            fill="currentColor"
            d="M4 10h3v4H4v-4zm13 0h3v4h-3v-4zM8 9h8v6H8V9z"
        />
    </svg>
);

const TrophyIcon = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
            fill="currentColor"
            d="M18 2h-2V1a1 1 0 1 0-2 0v1H10V1a1 1 0 1 0-2 0v1H6a1 1 0 0 0-1 1v2a4 4 0 0 0 3 3.86A6 6 0 0 0 11 14v2H7a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2h-4v-2a6 6 0 0 0 3-5.14A4 4 0 0 0 19 5V3a1 1 0 0 0-1-1zm-11 3V4h1v2a6 6 0 0 0 .08.99A2 2 0 0 1 7 5zm11 0a2 2 0 0 1-1.08 1.74A6 6 0 0 0 15 6V4h3v1z"
        />
    </svg>
);

const TreasureIcon = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
            fill="currentColor"
            d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8zm2-4h14a2 2 0 0 1 2 2v2H3V6a2 2 0 0 1 2-2zm3 6h2v4H8v-4zm6 0h2v4h-2v-4z"
        />
    </svg>
);

const LockIcon = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
            fill="currentColor"
            d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1zm2 0h6V7a3 3 0 0 0-6 0v3z"
        />
    </svg>
);

const CheckIcon = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
            fill="currentColor"
            d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z"
        />
    </svg>
);

export const DuoTileIcon = ({ type, status }) => {
    const base = "h-10 w-10";
    const color =
        status === "COMPLETE"
            ? "text-yellow-500"
            : status === "ACTIVE"
            ? "text-white"
            : "text-gray-400";
    switch (type) {
        case "star":
            return <StarIcon className={`${base} ${color}`} />;
        case "book":
            return <BookIcon className={`${base} ${color}`} />;
        case "dumbbell":
            return <DumbbellIcon className={`${base} ${color}`} />;
        case "trophy":
            return <TrophyIcon className={`${base} ${color}`} />;
        case "treasure":
            return <TreasureIcon className={`${base} ${color}`} />;
        default:
            return <LockIcon className={`${base} ${color}`} />;
    }
};

export const DuoTileButton = ({
    type,
    status,
    defaultColors,
    onClick,
    children,
    ringPercent = 0,
}) => {
    const colors =
        status === "LOCKED"
            ? "border-gray-300 bg-gray-200"
            : status === "COMPLETE"
            ? "border-yellow-500 bg-yellow-400"
            : defaultColors;
    const pct = Math.max(0, Math.min(100, ringPercent));
    // SVG circle dimensions
    const size = 88;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const dash = (pct / 100) * circumference;
    const anim = status === "ACTIVE" ? "animate-pulse" : "";
    return (
        <button
            className={`relative m-3 rounded-full border-b-8 p-4 ${colors} ${anim} transition hover:brightness-105`}
            onClick={onClick}
            disabled={status === "LOCKED"}
            aria-disabled={status === "LOCKED"}
        >
            {/* Background ring */}
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeLinecap="round"
                    fill="none"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            {/* COMPLETE overlay check */}
            {status === "COMPLETE" && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-md ring-2 ring-white">
                    <CheckIcon className="h-4 w-4" />
                </span>
            )}
            {children}
        </button>
    );
};

export default DuoTileButton;
