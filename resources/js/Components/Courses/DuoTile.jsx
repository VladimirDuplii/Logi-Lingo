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
    const base = "h-12 w-12 drop-shadow-[0_1px_0_rgba(0,0,0,0.1)]";
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
    // Optional segmented ring: when provided, displays N discrete segments with K filled
    ringSegmentsTotal,
    ringSegmentsFilled,
}) => {
    // Exact colors from reference: locked/complete/active
    const colors = 
        status === "LOCKED"
            ? "border-[#b7b7b7] bg-[#e5e5e5]"
            : status === "COMPLETE"
            ? "border-yellow-500 bg-yellow-400"
            : defaultColors;
    
    const segTotal = Number.isFinite(ringSegmentsTotal)
        ? Math.max(0, Math.floor(ringSegmentsTotal))
        : undefined;
    const segFilledRaw = Number.isFinite(ringSegmentsFilled)
        ? Math.floor(ringSegmentsFilled)
        : undefined;
    const segFilled = segTotal !== undefined
        ? Math.max(0, Math.min(segFilledRaw ?? 0, segTotal))
        : undefined;

    return (
        <div className="relative h-[93px] w-[98px]">
            {/* Progress ring - only for ACTIVE status */}
            {status === "ACTIVE" && (
                <LessonCompletionSvg 
                    segmentsTotal={segTotal} 
                    segmentsFilled={segFilled}
                />
            )}
            
            {/* Main tile button */}
            <button
                className={`absolute m-3 rounded-full border-b-8 p-4 ${colors} ${
                    status === "LOCKED" ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={onClick}
                disabled={status === "LOCKED"}
            >
                {children}
                
                {/* Complete badge */}
                {status === "COMPLETE" && (
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 border-2 border-white">
                        <CheckIcon className="h-5 w-5 text-white" />
                    </div>
                )}
            </button>
        </div>
    );
};

// Progress ring component that matches reference exactly
const LessonCompletionSvg = ({ segmentsTotal = 4, segmentsFilled = 0 }) => {
    const size = 100;
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    
    if (segmentsTotal > 0) {
        // Segmented ring
        const gapAngle = 8; // degrees
        const segmentAngle = (360 - segmentsTotal * gapAngle) / segmentsTotal;
        
        return (
            <svg
                viewBox="0 0 100 100"
                className="absolute h-[93px] w-[98px]"
                style={{ transitionDuration: "400ms" }}
            >
                <defs>
                    {Array.from({ length: segmentsTotal }).map((_, i) => (
                        <clipPath key={i} id={`clip-segment-${i}`}>
                            <path
                                d={`M 50,50 L 50,8 A 42,42 0 0,1 ${
                                    50 + 42 * Math.sin((segmentAngle * Math.PI) / 180)
                                },${
                                    50 - 42 * Math.cos((segmentAngle * Math.PI) / 180)
                                } Z`}
                                transform={`rotate(${i * (segmentAngle + gapAngle)} 50 50)`}
                            />
                        </clipPath>
                    ))}
                </defs>
                
                {/* Background segments */}
                {Array.from({ length: segmentsTotal }).map((_, i) => (
                    <circle
                        key={`bg-${i}`}
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#e9edf3"
                        strokeWidth="8"
                        clipPath={`url(#clip-segment-${i})`}
                    />
                ))}
                
                {/* Filled segments */}
                {Array.from({ length: segmentsFilled }).map((_, i) => (
                    <circle
                        key={`fill-${i}`}
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="rgb(255,200,0)"
                        strokeWidth="8"
                        clipPath={`url(#clip-segment-${i})`}
                    />
                ))}
            </svg>
        );
    }
    
    // Continuous ring fallback
    const strokeDasharray = `${(segmentsFilled / 4) * circumference} ${circumference}`;
    
    return (
        <svg
            viewBox="0 0 100 100"
            className="absolute h-[93px] w-[98px]"
            style={{ transitionDuration: "400ms" }}
        >
            <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#e9edf3"
                strokeWidth="8"
            />
            <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgb(255,200,0)"
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default DuoTileButton;
