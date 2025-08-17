import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import DuoTileButton, { DuoTileIcon } from './DuoTile';

// Compute tile status from local progress (lessonsCompleted) and tile linear index
const computeTileStatus = (tileIndex, lessonsCompleted, lessonsPerTile = 4) => {
    const tilesCompleted = Math.floor(lessonsCompleted / lessonsPerTile);
    if (tileIndex < tilesCompleted) return 'COMPLETE';
    if (tileIndex > tilesCompleted) return 'LOCKED';
    return 'ACTIVE';
};

// Map our Unit/Lesson data to tiles: for now, create a star tile for each lesson
const mapUnitsToTiles = (units) => {
    return (units || []).map((u) => ({
        // Preserve original identifiers so downstream API calls work
        id: u.id,
        title: u.title,
        order: u.order,
        unitNumber: u.order || u.id,
        description: u.description || u.title || 'Unit',
        backgroundColor: 'bg-[#58cc02]',
        textColor: 'text-[#58cc02] ',
        borderColor: 'border-[#46a302]',
        lessons: u.lessons || [],
        tiles: (u.lessons || []).map((l) => ({ type: 'star', description: l.title || `Lesson ${l.order}`, lesson: l })),
    }));
};

const tileLeftClassNames = [
    'left-0',
    'left-[-45px]',
    'left-[-70px]',
    'left-[-45px]',
    'left-0',
    'left-[45px]',
    'left-[70px]',
    'left-[45px]',
];

const getTileLeftClassName = ({ index, unitNumber, tilesLength }) => {
    if (index >= tilesLength - 1) return 'left-0';
    const lefts = unitNumber % 2 === 1 ? tileLeftClassNames : [...tileLeftClassNames.slice(4), ...tileLeftClassNames.slice(0, 4)];
    return lefts[index % lefts.length] ?? 'left-0';
};

const DuoUnitHeader = ({ unitNumber, description, backgroundColor = 'bg-[#58cc02]', borderColor = 'border-[#46a302]' }) => {
    return (
        <article className={["max-w-2xl text-white sm:rounded-xl", backgroundColor].join(' ')}>
            <header className="flex items-center justify-between gap-4 p-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold">Unit {unitNumber}</h2>
                    <p className="text-lg">{description}</p>
                </div>
                <a href="#" className={["flex items-center gap-3 rounded-2xl border-2 border-b-4 p-3 transition hover:text-gray-100", borderColor].join(' ')}>
                    <span className="font-bold uppercase">Guidebook</span>
                </a>
            </header>
        </article>
    );
};

const DuoUnitSection = ({ unit, onStartLesson, lessonsCompleted }) => {
    const [selectedTile, setSelectedTile] = useState(null);
    useEffect(() => {
        const unselect = () => setSelectedTile(null);
        window.addEventListener('scroll', unselect);
        return () => window.removeEventListener('scroll', unselect);
    }, []);

    return (
        <>
            <DuoUnitHeader unitNumber={unit.unitNumber} description={unit.description} backgroundColor={unit.backgroundColor} borderColor={unit.borderColor} />
            <div className="relative mb-8 mt-[20px] flex max-w-2xl flex-col items-center gap-4">
                {unit.tiles.map((tile, i) => {
                    const flatIndex = i; // since per unit mapping
                    const status = computeTileStatus(flatIndex, lessonsCompleted);
                    return (
                        <Fragment key={i}>
                            <div
                                className={[
                                    'relative -mb-4 h-[93px] w-[98px]',
                                    getTileLeftClassName({ index: i, unitNumber: unit.unitNumber, tilesLength: unit.tiles.length }),
                                ].join(' ')}
                            >
                                <DuoTileButton
                                    type={tile.type}
                                    status={status}
                                    defaultColors={`${unit.borderColor} ${unit.backgroundColor}`}
                                    onClick={() => {
                                        if (tile.lesson) onStartLesson(tile.lesson, unit);
                                        setSelectedTile(i);
                                    }}
                                >
                                    <DuoTileIcon type={tile.type} status={status} />
                                </DuoTileButton>
                            </div>
                        </Fragment>
                    );
                })}
            </div>
        </>
    );
};

const DuoLearn = ({ course, onUnitSelect, onLessonSelect }) => {
    const [lessonsCompleted, setLessonsCompleted] = useState(0);
    // For now, keep local in-memory progress; can be wired to API later

    const units = useMemo(() => mapUnitsToTiles(course?.units || []), [course]);

    return (
        <div className="flex max-w-5xl grow flex-col">
            {units.map((unit) => (
                <DuoUnitSection
                    key={unit.unitNumber}
                    unit={unit}
                    lessonsCompleted={lessonsCompleted}
                    onStartLesson={(lesson, mappedUnit) => {
                        // mappedUnit contains id/order/title copied from original
                        if (onUnitSelect) onUnitSelect({ id: mappedUnit.id, title: mappedUnit.title, order: mappedUnit.order, ...mappedUnit });
                        if (onLessonSelect) onLessonSelect(lesson, { id: mappedUnit.id, title: mappedUnit.title, order: mappedUnit.order, ...mappedUnit });
                        setLessonsCompleted((x) => x + 1);
                    }}
                />
            ))}
        </div>
    );
};

export default DuoLearn;
