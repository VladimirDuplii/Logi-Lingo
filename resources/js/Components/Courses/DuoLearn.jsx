import React, { Fragment, useEffect, useMemo, useState, useRef } from "react";
import { ProgressService } from "../../Services";
import DuoTileButton, { DuoTileIcon } from "./DuoTile";

// Compute tile status from local progress (lessonsCompleted) and tile linear index
const computeTileStatus = (tileIndex, lessonsCompleted, lessonsPerTile = 4) => {
    const tilesCompleted = Math.floor(lessonsCompleted / lessonsPerTile);
    if (tileIndex < tilesCompleted) return "COMPLETE";
    if (tileIndex > tilesCompleted) return "LOCKED";
    return "ACTIVE";
};

// Map our Unit/Lesson data to tiles: for now, create a star tile for each lesson
const mapUnitsToTiles = (units) => {
    return (units || []).map((u) => ({
        // Preserve original identifiers so downstream API calls work
        id: u.id,
        title: u.title,
        order: u.order,
        unitNumber: u.order || u.id,
        description: u.description || u.title || "Unit",
        backgroundColor: "bg-[#58cc02]",
        textColor: "text-[#58cc02]",
        borderColor: "border-[#46a302]",
        lessons: u.lessons || [],
        tiles: (u.lessons || []).map((l) => ({
            type: "star",
            description: l.title || `Lesson ${l.order}`,
            lesson: l,
        })),
    }));
};

const tileLeftClassNames = [
    "left-0",
    "left-[-45px]",
    "left-[-70px]",
    "left-[-45px]",
    "left-0",
    "left-[45px]",
    "left-[70px]",
    "left-[45px]",
];

const getTileLeftClassName = ({ index, unitNumber, tilesLength }) => {
    if (index >= tilesLength - 1) return "left-0";
    const lefts =
        unitNumber % 2 === 1
            ? tileLeftClassNames
            : [
                  ...tileLeftClassNames.slice(4),
                  ...tileLeftClassNames.slice(0, 4),
              ];
    return lefts[index % lefts.length] ?? "left-0";
};

const DuoUnitHeader = ({
    unitNumber,
    description,
    backgroundColor = "bg-[#58cc02]",
    borderColor = "border-[#46a302]",
}) => {
    return (
        <article
            className={[
                "w-full text-white sm:rounded-xl",
                backgroundColor,
            ].join(" ")}
        >
            <header className="flex items-center justify-between gap-4 p-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold">Unit {unitNumber}</h2>
                    <p className="text-lg">{description}</p>
                </div>
                <a
                    href="#"
                    className={[
                        "flex items-center gap-3 rounded-2xl border-2 border-b-4 p-3 transition hover:text-gray-100",
                        borderColor,
                    ].join(" ")}
                >
                    <span className="font-bold uppercase">Guidebook</span>
                </a>
            </header>
        </article>
    );
};

const DuoUnitSection = ({ unit, onStartLesson, completedCount, prevUnitCompleted = true }) => {
    const [selectedTile, setSelectedTile] = useState(null);

    useEffect(() => {
        const unselect = () => setSelectedTile(null);
        window.addEventListener("scroll", unselect);
        window.addEventListener("click", unselect);
        return () => {
            window.removeEventListener("scroll", unselect);
            window.removeEventListener("click", unselect);
        };
    }, []);

    return (
        <>
            <DuoUnitHeader
                unitNumber={unit.unitNumber}
                description={unit.description}
                backgroundColor={unit.backgroundColor}
                borderColor={unit.borderColor}
            />
            <div className="relative mb-8 mt-[67px] flex max-w-2xl flex-col items-center gap-4">
                {unit.tiles.map((tile, i) => {
                    const flatIndex = i;
                    let status = computeTileStatus(flatIndex, completedCount, 1);
                    
                    // Gate the very first lesson of a unit until previous unit is fully completed
                    if (i === 0 && !prevUnitCompleted) status = "LOCKED";
                    
                    return (
                        <Fragment key={i}>
                            <div
                                className={[
                                    "relative -mb-4 h-[93px] w-[98px]",
                                    getTileLeftClassName({
                                        index: i,
                                        unitNumber: unit.unitNumber,
                                        tilesLength: unit.tiles.length,
                                    }),
                                ].join(" ")}
                            >
                                {/* Hover label for active tiles */}
                                {selectedTile !== i && status === "ACTIVE" && (
                                    <HoverLabel text="Start" textColor={unit.textColor} />
                                )}
                                
                                {/* Progress ring overlay */}
                                <LessonCompletionSvg
                                    segmentsTotal={(() => {
                                        const segTotal = tile.lesson?.segments?.total;
                                        if (Number.isFinite(segTotal) && segTotal > 0) return segTotal;
                                        return 4;
                                    })()}
                                    segmentsFilled={(() => {
                                        const segFilled = tile.lesson?.segments?.filled;
                                        const segTotal = tile.lesson?.segments?.total;
                                        if (Number.isFinite(segFilled) && Number.isFinite(segTotal)) {
                                            return Math.max(0, Math.min(segFilled, segTotal));
                                        }
                                        const l = tile.lesson;
                                        const c = l?.progress?.completed_challenges ?? 0;
                                        const t = l?.progress?.total_challenges ?? 0;
                                        if (!t) return 0;
                                        const ratio = Math.max(0, Math.min(1, c / t));
                                        return Math.max(0, Math.min(4, Math.floor(ratio * 4)));
                                    })()}
                                    status={status}
                                />
                                
                                <button
                                    className={[
                                        "absolute m-3 rounded-full border-b-8 p-4",
                                        getTileColors({
                                            tileType: tile.type,
                                            status,
                                            defaultColors: `${unit.borderColor} ${unit.backgroundColor}`,
                                        }),
                                    ].join(" ")}
                                    onClick={() => {
                                        if (status === "LOCKED") {
                                            // Show locked tooltip briefly
                                            return;
                                        }
                                        setSelectedTile(i);
                                        if (tile.lesson && status !== "LOCKED") {
                                            onStartLesson(tile.lesson, unit);
                                        }
                                    }}
                                >
                                    <DuoTileIcon type={tile.type} status={status} />
                                    <span className="sr-only">Show lesson</span>
                                </button>
                            </div>
                            
                            {/* Tile tooltip */}
                            <TileTooltip
                                selectedTile={selectedTile}
                                index={i}
                                unitNumber={unit.unitNumber}
                                tilesLength={unit.tiles.length}
                                description={tile.description}
                                status={status}
                                onClose={() => setSelectedTile(null)}
                                onStartLesson={() => {
                                    if (tile.lesson && status !== "LOCKED") {
                                        onStartLesson(tile.lesson, unit);
                                    }
                                }}
                            />
                        </Fragment>
                    );
                })}
            </div>
        </>
    );
};

// Helper function for tile colors (matches reference)
const getTileColors = ({ tileType, status, defaultColors }) => {
    switch (status) {
        case "LOCKED":
            if (tileType === "fast-forward") return defaultColors;
            return "border-[#b7b7b7] bg-[#e5e5e5]";
        case "COMPLETE":
            return "border-yellow-500 bg-yellow-400";
        case "ACTIVE":
            return defaultColors;
    }
};

// Hover label component (matches reference)
const HoverLabel = ({ text, textColor }) => {
    const hoverElement = useRef(null);
    const [width, setWidth] = useState(72);

    useEffect(() => {
        setWidth(hoverElement.current?.clientWidth ?? width);
    }, [hoverElement.current?.clientWidth, width]);

    return (
        <div
            className={`absolute z-10 w-max animate-bounce rounded-lg border-2 border-gray-200 bg-white px-3 py-2 font-bold uppercase ${textColor}`}
            style={{
                top: "-25%",
                left: `calc(50% - ${width / 2}px)`,
            }}
            ref={hoverElement}
        >
            {text}
            <div
                className="absolute h-3 w-3 rotate-45 border-b-2 border-r-2 border-gray-200 bg-white"
                style={{ left: "calc(50% - 8px)", bottom: "-8px" }}
            />
        </div>
    );
};

// Lesson completion SVG (matches reference)
const LessonCompletionSvg = ({ segmentsTotal = 4, segmentsFilled = 0, status }) => {
    if (status !== "ACTIVE") return null;

    switch (segmentsFilled) {
        case 0:
            return <LessonCompletionSvg0 />;
        case 1:
            return <LessonCompletionSvg1 />;
        case 2:
            return <LessonCompletionSvg2 />;
        case 3:
            return <LessonCompletionSvg3 />;
        default:
            return null;
    }
};

// Individual progress ring SVGs (matches reference exactly)
const LessonCompletionSvg0 = () => (
    <svg
        viewBox="0 0 100 100"
        style={{ transitionDuration: "400ms" }}
        className="absolute h-[93px] w-[98px]"
    >
        <defs>
            <clipPath id="clip-session/ProgressRing1">
                <path d="M3.061616997868383e-15,-50L2.5717582782094417e-15,-42Z" />
            </clipPath>
        </defs>
        <g transform="translate(50, 50)">
            <path
                d="M3.061616997868383e-15,-50L2.5717582782094417e-15,-42Z"
                fill="rgb(255,200,0)"
            />
        </g>
    </svg>
);

const LessonCompletionSvg1 = () => (
    <svg
        viewBox="0 0 100 100"
        style={{ transitionDuration: "400ms" }}
        className="absolute h-[93px] w-[98px]"
    >
        <defs>
            <clipPath id="clip-session/ProgressRing614">
                <path d="M3.061616997868383e-15,-50A50,50 0 0,1 35.35533905932738,-35.35533905932737L29.69846310392954,-29.69846310392954A42,42 0 0,0 2.5717582782094417e-15,-42Z" />
            </clipPath>
        </defs>
        <g transform="translate(50, 50)">
            <path
                d="M3.061616997868383e-15,-50A50,50 0 0,1 35.35533905932738,-35.35533905932737L29.69846310392954,-29.69846310392954A42,42 0 0,0 2.5717582782094417e-15,-42Z"
                fill="rgb(255,200,0)"
            />
        </g>
    </svg>
);

const LessonCompletionSvg2 = () => (
    <svg
        viewBox="0 0 100 100"
        style={{ transitionDuration: "400ms" }}
        className="absolute h-[93px] w-[98px]"
    >
        <defs>
            <clipPath id="clip-session/ProgressRing1043">
                <path d="M3.061616997868383e-15,-50A50,50 0 0,1 50,6.123233995736766e-15L42,5.1432506368746615e-15A42,42 0 0,0 2.5717582782094417e-15,-42Z" />
            </clipPath>
        </defs>
        <g transform="translate(50, 50)">
            <path
                d="M3.061616997868383e-15,-50A50,50 0 0,1 50,6.123233995736766e-15L42,5.1432506368746615e-15A42,42 0 0,0 2.5717582782094417e-15,-42Z"
                fill="rgb(255,200,0)"
            />
        </g>
    </svg>
);

const LessonCompletionSvg3 = () => (
    <svg
        viewBox="0 0 100 100"
        style={{ transitionDuration: "400ms" }}
        className="absolute h-[93px] w-[98px]"
    >
        <defs>
            <clipPath id="clip-session/ProgressRing1577">
                <path d="M3.061616997868383e-15,-50A50,50 0 0,1 35.35533905932738,35.35533905932738L29.69846310392954,29.69846310392954A42,42 0 0,0 2.5717582782094417e-15,-42Z" />
            </clipPath>
        </defs>
        <g transform="translate(50, 50)">
            <path
                d="M3.061616997868383e-15,-50A50,50 0 0,1 35.35533905932738,35.35533905932738L29.69846310392954,29.69846310392954A42,42 0 0,0 2.5717582782094417e-15,-42Z"
                fill="rgb(255,200,0)"
            />
        </g>
    </svg>
);

// Tooltip component (matches reference)
const TileTooltip = ({
    selectedTile,
    index,
    unitNumber,
    tilesLength,
    description,
    status,
    onClose,
    onStartLesson,
}) => {
    const tileTooltipRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectedTile !== index) return;
            const clickIsInsideTooltip = tileTooltipRef.current?.contains(event.target);
            if (clickIsInsideTooltip) return;
            onClose();
        };

        window.addEventListener("click", handleClickOutside, true);
        return () => window.removeEventListener("click", handleClickOutside, true);
    }, [selectedTile, index, onClose]);

    const activeBackgroundColor = "bg-green-500";
    const activeTextColor = "text-green-500";

    return (
        <div
            className={[
                "relative h-0 w-full",
                index === selectedTile ? "" : "invisible",
            ].join(" ")}
            ref={tileTooltipRef}
        >
            <div
                className={[
                    "absolute z-30 flex w-[300px] flex-col gap-4 rounded-xl p-4 font-bold transition-all duration-300",
                    status === "ACTIVE"
                        ? activeBackgroundColor
                        : status === "LOCKED"
                        ? "border-2 border-gray-200 bg-gray-100"
                        : "bg-yellow-400",
                    index === selectedTile ? "top-4 scale-100" : "-top-14 scale-0",
                ].join(" ")}
                style={{ left: "calc(50% - 150px)" }}
            >
                <div
                    className={[
                        "absolute left-[140px] top-[-8px] h-4 w-4 rotate-45",
                        status === "ACTIVE"
                            ? activeBackgroundColor
                            : status === "LOCKED"
                            ? "border-l-2 border-t-2 border-gray-200 bg-gray-100"
                            : "bg-yellow-400",
                    ].join(" ")}
                    style={{
                        left: getTileTooltipLeftOffset({ index, unitNumber, tilesLength }),
                    }}
                />
                <div
                    className={[
                        "text-lg",
                        status === "ACTIVE"
                            ? "text-white"
                            : status === "LOCKED"
                            ? "text-gray-400"
                            : "text-yellow-600",
                    ].join(" ")}
                >
                    {description}
                </div>
                {status === "ACTIVE" ? (
                    <button
                        onClick={onStartLesson}
                        className={[
                            "flex w-full items-center justify-center rounded-xl border-b-4 border-gray-200 bg-white p-3 uppercase",
                            activeTextColor,
                        ].join(" ")}
                    >
                        Start +10 XP
                    </button>
                ) : status === "LOCKED" ? (
                    <button
                        className="w-full rounded-xl bg-gray-200 p-3 uppercase text-gray-400"
                        disabled
                    >
                        Locked
                    </button>
                ) : (
                    <button
                        onClick={onStartLesson}
                        className="flex w-full items-center justify-center rounded-xl border-b-4 border-yellow-200 bg-white p-3 uppercase text-yellow-400"
                    >
                        Practice +5 XP
                    </button>
                )}
            </div>
        </div>
    );
};

// Helper for tooltip positioning (matches reference)
const tileTooltipLeftOffsets = [140, 95, 70, 95, 140, 185, 210, 185];

const getTileTooltipLeftOffset = ({ index, unitNumber, tilesLength }) => {
    if (index >= tilesLength - 1) {
        return tileTooltipLeftOffsets[0];
    }

    const offsets =
        unitNumber % 2 === 1
            ? tileTooltipLeftOffsets
            : [
                  ...tileTooltipLeftOffsets.slice(4),
                  ...tileTooltipLeftOffsets.slice(0, 4),
              ];

    return offsets[index % offsets.length] ?? tileTooltipLeftOffsets[0];
};

const DuoLearn = ({ course, onUnitSelect, onLessonSelect }) => {
    // Per-unit completed lessons count fetched from backend progress
    const [completedByUnit, setCompletedByUnit] = useState({});

    const units = useMemo(() => mapUnitsToTiles(course?.units || []), [course]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!course?.id) return;
                const cp = await ProgressService.getCourseProgress(course.id);
                const unitsData = cp?.data || [];
                const byUnit = {};
                unitsData.forEach((u) => {
                    const lessons = Array.isArray(u?.lessons) ? u.lessons : [];
                    byUnit[u.id] = lessons.filter((l) => !!l?.completed).length;
                });
                if (mounted) setCompletedByUnit(byUnit);
            } catch (_) {
                if (mounted) setCompletedByUnit({});
            }
        })();
        return () => {
            mounted = false;
        };
    }, [course?.id]);

    // Auto-refresh when ?refresh=1 is present
    useEffect(() => {
        if (typeof window === "undefined") return;
        const url = new URL(window.location.href);
        const shouldRefresh = url.searchParams.get("refresh") === "1";
        if (!shouldRefresh) return;
        (async () => {
            try {
                if (!course?.id) return;
                const cp = await ProgressService.getCourseProgress(course.id);
                const unitsData = cp?.data || [];
                const byUnit = {};
                unitsData.forEach((u) => {
                    const lessons = Array.isArray(u?.lessons) ? u.lessons : [];
                    byUnit[u.id] = lessons.filter((l) => !!l?.completed).length;
                });
                setCompletedByUnit(byUnit);
            } catch (_) {
                /* noop */
            } finally {
                // Clear flag so it doesn't repeat
                url.searchParams.delete("refresh");
                window.history.replaceState({}, "", url.toString());
            }
        })();
    }, [course?.id]);

    return (
        <div className="flex max-w-5xl grow flex-col">
            {units.map((unit, idx) => {
                const prev = idx > 0 ? units[idx - 1] : null;
                const prevUnitLessons = prev ? (prev.lessons?.length || 0) : 0;
                const prevCompleted = prev ? (completedByUnit[prev.id] || 0) : 0;
                const prevUnitCompleted = prev ? prevCompleted >= prevUnitLessons && prevUnitLessons > 0 : true;
                return (
                    <DuoUnitSection
                        key={unit.unitNumber}
                        unit={unit}
                        prevUnitCompleted={prevUnitCompleted}
                        completedCount={completedByUnit[unit.id] || 0}
                        onStartLesson={(lesson, mappedUnit) => {
                            if (onUnitSelect)
                                onUnitSelect({
                                    id: mappedUnit.id,
                                    title: mappedUnit.title,
                                    order: mappedUnit.order,
                                    ...mappedUnit,
                                });
                            if (onLessonSelect)
                                onLessonSelect(lesson, {
                                    id: mappedUnit.id,
                                    title: mappedUnit.title,
                                    order: mappedUnit.order,
                                    ...mappedUnit,
                                });
                        }}
                    />
                );
            })}
        </div>
    );
};

export default DuoLearn;
