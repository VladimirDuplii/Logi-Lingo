import React, { Fragment, useEffect, useMemo, useState } from "react";
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
        textColor: "text-[#58cc02] ",
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
    const [lockedTipIndex, setLockedTipIndex] = useState(null);
    const tipTimerRef = React.useRef(null);
    useEffect(() => {
        const unselect = () => {
            setSelectedTile(null);
            setLockedTipIndex(null);
            if (tipTimerRef.current) {
                clearTimeout(tipTimerRef.current);
                tipTimerRef.current = null;
            }
        };
        window.addEventListener("scroll", unselect);
        return () => {
            window.removeEventListener("scroll", unselect);
            if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
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
            <div className="relative mb-8 mt-[20px] flex flex-col items-center gap-4">
                {unit.tiles.map((tile, i) => {
                    const flatIndex = i; // since per unit mapping
                    let status = computeTileStatus(
                        flatIndex,
                        completedCount,
                        1
                    );
                    // Gate the very first lesson of a unit until previous unit is fully completed
                    if (i === 0 && !prevUnitCompleted) status = "LOCKED";
                    const lockedMsg = i === 0 && !prevUnitCompleted ? "Заблоковано. Завершіть попередній юніт." : "Поки недоступно";
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
                                {/* Animated tooltip above ACTIVE tile */}
                                {status === "ACTIVE" && (
                                    <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full">
                                        <div className="mx-auto inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-100 px-3 py-1 text-[12px] font-semibold text-yellow-800 shadow-sm animate-bounce">
                                            <span aria-hidden>👉</span>
                                            <span>Почати урок</span>
                                        </div>
                                        <div className="mx-auto mt-1 h-2.5 w-2.5 rotate-45 border border-yellow-200 bg-yellow-100" />
                                    </div>
                                )}
                                <DuoTileButton
                                    type={tile.type}
                                    status={status}
                                    defaultColors={`${unit.borderColor} ${unit.backgroundColor}`}
                                    // Prefer backend-provided segments; fallback to computed quarters
                                    ringSegmentsTotal={(() => {
                                        const segTotal = tile.lesson?.segments?.total;
                                        if (Number.isFinite(segTotal) && segTotal > 0) return segTotal;
                                        return 4;
                                    })()}
                                    ringSegmentsFilled={(() => {
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
                                    onClick={() => {
                                        if (status === "LOCKED") {
                                            setLockedTipIndex(i);
                                            if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
                                            tipTimerRef.current = setTimeout(() => setLockedTipIndex(null), 1800);
                                            return;
                                        }
                                        if (tile.lesson && status !== "LOCKED") {
                                            onStartLesson(tile.lesson, unit);
                                            setSelectedTile(i);
                                        }
                                    }}
                                >
                                    <DuoTileIcon
                                        type={tile.type}
                                        status={status}
                                    />
                                </DuoTileButton>
                                {/* Locked tooltip on click */}
                                {status === "LOCKED" && lockedTipIndex === i && (
                                    <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full">
                                        <div className="mx-auto inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-[12px] font-semibold text-gray-700 shadow-sm">
                                            <span aria-hidden>🔒</span>
                                            <span>{lockedMsg}</span>
                                        </div>
                                        <div className="mx-auto mt-1 h-2.5 w-2.5 rotate-45 border border-gray-200 bg-gray-100" />
                                    </div>
                                )}
                            </div>
                        </Fragment>
                    );
                })}
            </div>
        </>
    );
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
