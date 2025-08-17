import React, { useMemo, useState } from 'react';
import { ProgressService } from '../../Services';

const connectorClass =
    'absolute left-1/2 -translate-x-1/2 w-0.5 bg-green-300';

const LessonNode = ({ lesson, index, total, onClick }) => {
    const isLeft = index % 2 === 0;
    const isLast = index === total - 1;
    return (
        <div className={`relative flex items-center ${isLeft ? 'justify-start' : 'justify-end'} min-h-[90px]`}>
            {/* Connector above */}
            {index > 0 && (
                <div className={`${connectorClass}`} style={{ top: 0, height: '40px' }} />
            )}
            <button
                onClick={onClick}
                className={`relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-full border-2 ${
                    isLeft ? 'ml-2' : 'mr-2'
                } border-green-400 bg-white text-lg font-bold text-green-700 shadow-md hover:shadow-lg hover:scale-105 transition`}
                aria-label={`Open lesson ${lesson.title || lesson.order}`}
            >
                {lesson.order}
            </button>
            {/* Connector below */}
            {!isLast && (
                <div className={`${connectorClass}`} style={{ bottom: 0, height: '40px' }} />
            )}
        </div>
    );
};

const UnitList = ({ courseId, units, onUnitSelect, onLessonSelect }) => {
    const [expanded, setExpanded] = useState(() => new Set());

    if (!units || units.length === 0) {
        return <div className="text-gray-600">No units available for this course.</div>;
    }

    const toggle = (id) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleUnitOpen = async (unit) => {
        try {
            await ProgressService.trackUnitView(courseId, unit.id);
        } catch (error) {
            // non-blocking
        }
        toggle(unit.id);
        if (onUnitSelect) onUnitSelect(unit);
    };

    const handleLessonClick = async (unit, lesson) => {
        try {
            await ProgressService.trackLessonStart(courseId, unit.id, lesson.id);
        } catch (error) {
            // non-blocking
        }
        if (onUnitSelect) onUnitSelect(unit);
        if (onLessonSelect) onLessonSelect(lesson, unit);
    };

    return (
        <div className="space-y-4">
            <h2 className="mb-2 text-xl font-semibold text-gray-800">Розділи курсу</h2>
            {units.map((unit) => (
                <div key={unit.id} className="overflow-hidden rounded-2xl ring-1 ring-gray-100 bg-white shadow-sm">
                    {/* Unit header */}
                    <button
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-green-50"
                        onClick={() => handleUnitOpen(unit)}
                        aria-expanded={expanded.has(unit.id)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-500 text-white font-bold shadow-inner">
                                {unit.order}
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-800">{unit.title}</h3>
                                <p className="text-sm text-gray-600">{unit.description}</p>
                            </div>
                        </div>
                        <div className="shrink-0 text-sm text-gray-600">
                            {unit.lessons_count} уроків
                        </div>
                    </button>

                    {/* Accordion content: lesson path */}
                    <div className={`px-5 pb-5 ${expanded.has(unit.id) ? 'block' : 'hidden'}`}>
                        {Array.isArray(unit.lessons) && unit.lessons.length > 0 ? (
                            <div className="relative mx-auto max-w-xl">
                                {/* Vertical path rail */}
                                <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-green-200" />
                                <div className="relative grid grid-cols-1 gap-3">
                                    {unit.lessons.map((lesson, idx) => (
                                        <LessonNode
                                            key={lesson.id}
                                            lesson={lesson}
                                            index={idx}
                                            total={unit.lessons.length}
                                            onClick={() => handleLessonClick(unit, lesson)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">Немає уроків у цьому розділі.</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UnitList;
