import React, { useEffect, useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
// AuthenticatedLayout not used; DuoLayout handles the shell
import DuoLayout from "@/Layouts/DuoLayout";
import { Courses } from "@/Components";
import RightCourseSidebar from "@/Components/Layout/RightCourseSidebar";
// Removed duplicated sidebars; DuoLayout handles left nav and right sidebar

const CourseDetailsPage = ({ auth, course }) => {
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [useDuoView, setUseDuoView] = useState(true);
    const [showPath, setShowPath] = useState(false); // MagicPatterns LearningPath toggle

    // Derive data structure for LearningPath component
    const learningPathUnits = useMemo(() => {
        if (!course?.units) return [];
        return course.units.map((u, idx) => {
            const lessons = (u.lessons || []).map((l) => {
                const name = l.title || l.name || `Lesson ${l.id}`;
                const completed = !!(
                    l.completed ||
                    l.is_completed ||
                    l.passed ||
                    l.completed_at ||
                    l.status === "completed"
                );
                return {
                    name,
                    completed,
                    stars: l.stars || 0,
                    character: l.icon || l.emoji || (completed ? "📗" : "📘"),
                };
            });
            const anyCompleted = lessons.some((l) => l.completed);
            const unlocked =
                u.unlocked !== undefined
                    ? !!u.unlocked
                    : idx === 0 || anyCompleted;
            // Heuristic: current unit = first unlocked that isn't fully completed
            const unitCompleted = lessons.length > 0 && lessons.every((l) => l.completed);
            const current =
                unlocked && !unitCompleted &&
                // ensure only one current (first matching)
                !course.units.slice(0, idx).some((prev, pIdx) => {
                    const prevLessons = (prev.lessons || []).map((pl) => !!(
                        pl.completed ||
                        pl.is_completed ||
                        pl.passed ||
                        pl.completed_at ||
                        pl.status === "completed"
                    ));
                    const prevUnitCompleted =
                        prevLessons.length > 0 && prevLessons.every(Boolean);
                    const prevUnlocked = prev.unlocked !== undefined ? !!prev.unlocked : pIdx === 0 || prevLessons.some(Boolean);
                    return prevUnlocked && !prevUnitCompleted;
                });
            // Simple rotating themes
            const themes = ["purple", "blue", "teal"];
            return {
                title: u.title || u.name || `Unit ${idx + 1}`,
                theme: themes[idx % themes.length],
                icon: u.icon || u.emoji || "📦",
                lessons,
                unlocked,
                current,
            };
        });
    }, [course]);

    // If user came with ?start=1, auto-select first unit/lesson when available
    useEffect(() => {
        if (typeof window === "undefined") return;
        const url = new URL(window.location.href);
        const shouldStart = url.searchParams.get("start") === "1";
        if (
            shouldStart &&
            course?.units?.length &&
            !selectedUnit &&
            !selectedLesson
        ) {
            const u =
                course.units.find(
                    (u) => Array.isArray(u.lessons) && u.lessons.length > 0
                ) || course.units[0];
            setSelectedUnit(u);
            if (u?.lessons?.length) {
                setSelectedLesson(u.lessons[0]);
            }
        }
    }, [course, selectedUnit, selectedLesson]);

    const handleUnitSelect = (unit) => {
        setSelectedUnit(unit);
        setSelectedLesson(null);
    };

    const handleLessonSelect = (lesson, unit) => {
        if (unit) setSelectedUnit(unit);
        setSelectedLesson(lesson);
    };

    // lock body scroll while lesson is open
    useEffect(() => {
        if (typeof document === "undefined") return;
        if (selectedLesson) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [selectedLesson]);

    const renderContent = () => {
    if (selectedLesson) {
            return (
                <div
                    id="lesson-overlay"
                    className="fixed inset-0 z-[9999] bg-white overflow-auto"
                >
                    <div
                        id="lesson-container"
                        className="mx-auto max-w-5xl min-h-screen flex flex-col px-4 py-6 sm:px-6"
                    >
                        <Courses.DuoLesson
                            courseId={course.id}
                            unitId={selectedUnit.id}
                            lessonId={selectedLesson.id}
                            onExit={() => {
                                setSelectedLesson(null);
                                // Add a query flag so DuoLearn can refetch progress on mount
                                if (typeof window !== "undefined") {
                                    const url = new URL(window.location.href);
                                    url.searchParams.set("refresh", "1");
                                    window.history.replaceState(
                                        {},
                                        "",
                                        url.toString()
                                    );
                                }
                            }}
                        />
                    </div>
                </div>
            );
        }

        if (showPath) {
            return (
                <div className="w-full">
                    <Courses.LearningPath units={learningPathUnits} />
                </div>
            );
        }

        if (useDuoView) {
            return (
                <div className="w-full">
                    <div id="learn-tree" className="min-w-0 w-full">
                        <Courses.DuoLearn
                            course={course}
                            onUnitSelect={handleUnitSelect}
                            onLessonSelect={handleLessonSelect}
                        />
                    </div>
                </div>
            );
        }

        if (selectedUnit) {
            return (
                <Courses.LessonList
                    courseId={course.id}
                    unitId={selectedUnit.id}
                    onLessonSelect={handleLessonSelect}
                />
            );
        }

        return (
            <Courses.CourseDetail
                courseId={course.id}
                initialCourse={course}
                onUnitSelect={handleUnitSelect}
                onLessonSelect={handleLessonSelect}
            />
        );
    };

    // Generate breadcrumb navigation
    const getBreadcrumbs = () => {
        const breadcrumbs = [
            {
                name: "Courses",
                href: "/courses",
                current: !selectedUnit && !selectedLesson,
            },
        ];

        if (course) {
            breadcrumbs.push({
                name: course.title,
                href: `/courses/${course.id}`,
                current: !selectedUnit && !selectedLesson,
            });
        }

        if (selectedUnit) {
            breadcrumbs.push({
                name: selectedUnit.title,
                href: "#",
                current: !!selectedUnit && !selectedLesson,
            });
        }

        if (selectedLesson) {
            breadcrumbs.push({
                name: selectedLesson.title,
                href: "#",
                current: true,
            });
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <DuoLayout
            right={
                selectedLesson ? null : (
                    <RightCourseSidebar
                        course={course}
                        hearts={auth?.user?.hearts ?? undefined}
                        points={
                            auth?.user?.points ?? auth?.user?.xp ?? undefined
                        }
                        otherCourses={(auth?.user?.courses || []).filter(
                            (c) => c.id !== course.id
                        )}
                    />
                )
            }
            centerMaxClass="xl:max-w-2xl"
        >
            <Head title={course.title} />

            {selectedLesson ? (
                // Fullscreen lesson overlay already rendered above via renderContent
                renderContent()
            ) : (
                <div id="course-page" className="w-full">
                    <div
                        id="course-container"
                        className={`mx-auto w-full ${
                            useDuoView ? "" : "max-w-5xl"
                        }`}
                    >
                        <div
                            id="course-header"
                            className="mb-4 flex items-center justify-between"
                        >
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                {course.title}
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        Path
                                    </span>
                                    <button
                                        className={`rounded-2xl border-2 border-b-4 px-3 py-1 text-sm font-bold transition ${
                                            showPath
                                                ? "border-indigo-600 bg-indigo-500 text-white"
                                                : "border-gray-300 bg-white text-gray-500"
                                        }`}
                                        onClick={() => setShowPath((v) => !v)}
                                    >
                                        {showPath ? "ON" : "OFF"}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        Tree
                                    </span>
                                    <button
                                        className={`rounded-2xl border-2 border-b-4 px-3 py-1 text-sm font-bold transition ${
                                            useDuoView && !showPath
                                                ? "border-green-600 bg-green-500 text-white"
                                                : "border-gray-300 bg-white text-gray-500"
                                        }`}
                                        onClick={() =>
                                            setUseDuoView((x) => !x)
                                        }
                                        disabled={showPath}
                                    >
                                        {useDuoView && !showPath ? "ON" : "OFF"}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {renderContent()}
                    </div>
                </div>
            )}
        </DuoLayout>
    );
};

export default CourseDetailsPage;
