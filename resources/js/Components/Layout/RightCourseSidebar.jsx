import React, { useEffect, useMemo, useState } from "react";
import { CourseService, ProgressService } from "../../Services";
import { useToast } from "../Toast";

const SectionCard = ({ title, children }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold uppercase text-gray-500">
            {title}
        </h3>
        {children}
    </div>
);

const StatRow = ({ label, value, icon }) => (
    <div className="flex items-center justify-between py-1 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
            {icon}
            <span>{label}</span>
        </div>
        <div className="font-semibold text-gray-900">{value}</div>
    </div>
);

export default function RightCourseSidebar({
    course,
    hearts,
    points,
    otherCourses = [],
}) {
    const toast = useToast();
    const currentId = course?.id;
    const [loading, setLoading] = useState(false);
    const [fetchedCourses, setFetchedCourses] = useState([]);
    const [activeCourseId, setActiveCourseId] = useState(currentId || null);
    const [courseMenuOpen, setCourseMenuOpen] = useState(false);
    const [streakOpen, setStreakOpen] = useState(false);
    // Daily quests state
    const [qLoading, setQLoading] = useState(true);
    const [qError, setQError] = useState("");
    const [quests, setQuests] = useState([]);
    const [dailyMeta, setDailyMeta] = useState({
        points,
        hearts,
        date: "",
        daily_goal_xp: 30,
        gems: 0,
        streak: 0,
    });
    // inline editing removed; settings page will handle editing

    // Normalize incoming prop and filter current course
    const initialOthers = useMemo(() => {
        const xs = Array.isArray(otherCourses) ? otherCourses : [];
        return xs.filter((c) => c && c.id !== currentId);
    }, [otherCourses, currentId]);

    useEffect(() => {
        // Load daily quests for the current user
        let mounted = true;
        (async () => {
            try {
                setQLoading(true);
                setQError("");
                const res = await ProgressService.getDailyQuests();
                const data = res?.data || res;
                const list = Array.isArray(data?.quests) ? data.quests : [];
        if (mounted) {
                    setQuests(list);
                    setDailyMeta({
                        points: data?.points ?? points,
                        hearts: data?.hearts ?? hearts,
                        date: data?.date || "",
            daily_goal_xp: data?.daily_goal_xp ?? 30,
            gems: data?.gems ?? 0,
            streak: data?.streak ?? 0,
                    });
                }
            } catch (e) {
                if (mounted) setQError("Не вдалося завантажити квести.");
            } finally {
                if (mounted) setQLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
        // re-run when course context changes (optional)
    }, [currentId]);

    const refreshQuests = async () => {
        try {
            setQLoading(true);
            setQError("");
            const res = await ProgressService.getDailyQuests();
            const data = res?.data || res;
            setQuests(Array.isArray(data?.quests) ? data.quests : []);
            setDailyMeta({
                points: data?.points ?? points,
                hearts: data?.hearts ?? hearts,
                date: data?.date || "",
                daily_goal_xp: data?.daily_goal_xp ?? dailyMeta.daily_goal_xp,
                gems: data?.gems ?? dailyMeta.gems,
                streak: data?.streak ?? dailyMeta.streak,
            });
        } catch (e) {
            setQError("Не вдалося оновити квести.");
        } finally {
            setQLoading(false);
        }
    };

    // editing goal moved to Settings page

    // Other Courses loader
    useEffect(() => {
        let mounted = true;
        (async () => {
            // If parent didn't supply courses, fetch a list
            if (initialOthers.length > 0) {
                setFetchedCourses([]);
                return;
            }
            try {
                setLoading(true);
                const res = await CourseService.getCourses();
                // Support multiple API envelope shapes
                const list = Array.isArray(res?.data?.courses)
                    ? res.data.courses
                    : Array.isArray(res?.courses)
                    ? res.courses
                    : Array.isArray(res?.data?.data)
                    ? res.data.data
                    : Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                    ? res
                    : [];
                const filtered = list.filter((c) => c && c.id !== currentId);
                const activeId = res?.data?.activeCourseId ?? res?.activeCourseId ?? null;
                if (mounted) {
                    setFetchedCourses(filtered);
                    if (activeId) setActiveCourseId(activeId);
                }
            } catch (_) {
                if (mounted) setFetchedCourses([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [initialOthers.length, currentId]);

    const others = initialOthers.length > 0 ? initialOthers : fetchedCourses;
    const xpQuest = useMemo(
        () => quests.find((q) => q.key === "xp_30"),
        [quests]
    );

    const allCourses = useMemo(() => {
        const base = Array.isArray(otherCourses) ? otherCourses : [];
        const merged = initialOthers.length > 0 ? base : fetchedCourses.concat(course ? [course] : []);
        const seen = new Set();
        return merged.filter((c) => {
            if (!c || !c.id) return false;
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
        });
    }, [otherCourses, fetchedCourses, initialOthers.length, course]);

    const activeCourse = useMemo(() => {
        if (course && course.id) return course;
        return allCourses.find((c) => c.id === activeCourseId) || null;
    }, [course, allCourses, activeCourseId]);

    const switchCourse = async (cId) => {
        try {
            await CourseService.setActiveCourse(cId);
            setActiveCourseId(cId);
            setCourseMenuOpen(false);
            toast.success("Active course updated");
        } catch (e) {
            toast.error("Не вдалося змінити курс");
        }
    };

    const today = new Date();
    const month = today.toLocaleString("en-US", { month: "long" });
    const year = today.getFullYear();
    const start = new Date(year, today.getMonth(), 1);
    const end = new Date(year, today.getMonth() + 1, 0);
    const days = Array.from({ length: end.getDate() }, (_, i) => i + 1);

    return (
        <aside className="flex w-full flex-col gap-4">
            {/* Top bar like sample: course dropdown, streak, gems */}
            <div className="my-1 flex items-center justify-between gap-3">
                {/* Course dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        className="relative flex cursor-pointer items-center gap-2 rounded-xl p-2 font-bold uppercase text-gray-600 hover:bg-gray-100"
                        onClick={() => setCourseMenuOpen((v) => !v)}
                    >
                        {/* flag placeholder */}
                        <div className="h-6 w-8 rounded bg-gray-200" aria-hidden />
                        <div>{activeCourse?.title || "Course"}</div>
                    </button>
                    {courseMenuOpen && (
                        <div className="absolute left-1/2 top-full z-10 w-72 -translate-x-1/2 overflow-hidden rounded-2xl border-2 border-gray-300 bg-white shadow-xl">
                            <h2 className="px-5 py-3 text-sm font-bold uppercase text-gray-400">My courses</h2>
                            <div className="max-h-64 overflow-y-auto">
                                {allCourses.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => switchCourse(c.id)}
                                        className={`flex w-full items-center gap-3 border-t-2 border-gray-300 px-5 py-3 text-left text-sm font-bold ${
                                            c.id === activeCourseId ? "bg-blue-100 text-blue-600" : "hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className="h-6 w-8 rounded bg-gray-200" aria-hidden />
                                        <span className={c.id === activeCourseId ? "text-blue-600" : "text-gray-700"}>{c.title}</span>
                                    </button>
                                ))}
                            </div>
                            <a href="/courses" className="flex w-full items-center gap-3 rounded-b-2xl border-t-2 border-gray-300 px-5 py-3 text-left text-sm font-bold hover:bg-gray-100">
                                <span className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-gray-400 text-lg font-bold text-gray-400">+</span>
                                <span className="text-gray-600">Add new course</span>
                            </a>
                        </div>
                    )}
                </div>

                {/* Streak */}
                <div className="relative">
                    <button
                        type="button"
                        className="relative flex items-center gap-2 rounded-xl p-2 font-bold text-orange-500 hover:bg-gray-100"
                        onClick={() => setStreakOpen((v) => !v)}
                    >
                        <span aria-hidden className="pointer-events-none">🔥</span>
                        <span className="text-gray-400">{dailyMeta.streak || 0}</span>
                    </button>
                    {streakOpen && (
                        <div className="absolute left-1/2 top-full z-10 w-96 -translate-x-1/2 rounded-2xl border-2 border-gray-300 bg-white p-5 text-black shadow-xl">
                            <h2 className="text-center text-lg font-bold">Streak</h2>
                            <p className="text-center text-sm font-normal text-gray-400">Practice daily to keep your streak growing.</p>
                            <article className="mt-3 rounded-xl border-2 border-gray-300 p-3 text-gray-600">
                                <header className="mb-2 flex items-center justify-between gap-3">
                                    <div className="text-lg font-bold uppercase text-gray-500">{month} {year}</div>
                                </header>
                                <div className="grid grid-cols-7 gap-1 px-1 py-2 text-center text-xs text-gray-500">
                                    {["S","M","T","W","T","F","S"].map((d) => (<div key={d} className="h-6 leading-6">{d}</div>))}
                                </div>
                                <div className="grid grid-cols-7 gap-1 px-1 py-2 text-center text-sm">
                                    {Array.from({ length: start.getDay() }).map((_, i) => (
                                        <div key={`pad-${i}`} className="h-8" />
                                    ))}
                                    {days.map((d) => {
                                        const isToday = d === today.getDate();
                                        return (
                                            <div key={d} className={`flex h-8 w-8 items-center justify-center rounded-full mx-auto ${isToday ? 'bg-gray-300 text-gray-700' : ''}`}>{d}</div>
                                        );
                                    })}
                                </div>
                            </article>
                        </div>
                    )}
                </div>

                {/* Gems */}
                <div className="relative flex items-center gap-2 rounded-xl p-2 font-bold text-red-500 hover:bg-gray-100">
                    <span aria-hidden>💎</span>
                    <span className="text-gray-400">{dailyMeta.gems || 0}</span>
                    <div className="absolute left-1/2 top-full z-10 hidden w-72 -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-gray-300 bg-white p-5 md:flex">
                        <div className="flex flex-col gap-3">
                            <h2 className="text-xl font-bold text-black">Gems</h2>
                            <p className="text-sm font-normal text-gray-400">You have {dailyMeta.gems || 0} gems.</p>
                            <a className="uppercase text-blue-400 transition hover:brightness-110" href="/shop">Go to shop</a>
                        </div>
                    </div>
                </div>
            </div>

            <SectionCard title="Daily Quests">
                {qLoading ? (
                    <ul className="space-y-2 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <li
                                key={i}
                                className="rounded-lg border border-gray-100 p-3"
                            >
                                <div className="mb-2 h-4 w-40 rounded bg-gray-200" />
                                <div className="h-2 w-full rounded bg-gray-200" />
                                <div className="mt-1 h-3 w-10 rounded bg-gray-200 ml-auto" />
                            </li>
                        ))}
                    </ul>
                ) : qError ? (
                    <div className="flex items-center justify-between text-sm text-red-600">
                        <span>{qError}</span>
                        <button
                            onClick={refreshQuests}
                            className="rounded border px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                            Спробувати знову
                        </button>
                    </div>
                ) : quests.length === 0 ? (
                    <div className="text-sm text-gray-500">
                        No quests for today.
                    </div>
                ) : (
                    <>
                        <ul className="space-y-2">
                            {quests.map((q) => {
                                const progress = Number(q.progress || 0);
                                const total = Math.max(1, Number(q.total || 0));
                                const pct = Math.min(
                                    100,
                                    Math.round((progress / total) * 100)
                                );
                                const done = !!q.completed;
                                return (
                                    <li
                                        key={q.key}
                                        className={`rounded-lg border p-3 ${
                                            done
                                                ? "border-green-200 bg-green-50"
                                                : "border-gray-100"
                                        }`}
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="text-sm font-medium text-gray-800">
                                                {q.title}
                                            </div>
                                            {done && (
                                                <span className="text-xs font-semibold text-green-600">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                        <div className="h-2 w-full rounded bg-gray-200">
                                            <div
                                                className={`h-2 rounded ${
                                                    done
                                                        ? "bg-green-600"
                                                        : "bg-green-500"
                                                }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <div className="mt-1 text-right text-xs text-gray-500">
                                            {progress}/{total}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                            <span>Сьогодні: {dailyMeta?.date || ""}</span>
                            <button
                                onClick={refreshQuests}
                                className="rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                            >
                                Оновити
                            </button>
                        </div>
                    </>
                )}
            </SectionCard>

            <SectionCard title="Daily Goal">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-sm text-gray-700">
                        Earn {dailyMeta?.daily_goal_xp || 30} XP today
                    </div>
                    <a
                        href="/settings/coach"
                        className="text-xs text-blue-600 hover:text-blue-700"
                    >
                        Edit Goal
                    </a>
                </div>
                <div className="mt-2 h-2 w-full rounded bg-gray-200">
                    {qLoading ? (
                        <div className="h-2 w-1/3 rounded bg-blue-200 animate-pulse" />
                    ) : (
                        <div
                            className="h-2 rounded bg-blue-500"
                            style={{
                                width: `${Math.min(
                                    100,
                                    Math.round(
                                        ((xpQuest?.progress || 0) /
                                            Math.max(
                                                1,
                                                dailyMeta?.daily_goal_xp ||
                                                    xpQuest?.total ||
                                                    30
                                            )) *
                                            100
                                    )
                                )}%`,
                            }}
                        />
                    )}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    {xpQuest?.progress || 0}/
                    {dailyMeta?.daily_goal_xp || xpQuest?.total || 30} XP
                </div>
            </SectionCard>

            <SectionCard title="Other Courses">
                {loading ? (
                    <ul className="space-y-2 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <li
                                key={i}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-md bg-gray-200" />
                                    <div className="h-4 w-40 rounded bg-gray-200" />
                                </div>
                                <div className="h-4 w-12 rounded bg-gray-200" />
                            </li>
                        ))}
                    </ul>
                ) : others.length === 0 ? (
                    <div className="text-sm text-gray-500">
                        No other courses
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {others.slice(0, 6).map((c) => (
                            <li key={c.id}>
                                <a
                                    href={`/courses/${c.id}`}
                                    className="group flex items-center justify-between rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        {c.image_url ? (
                                            <img
                                                src={c.image_url}
                                                alt={c.title}
                                                className="h-8 w-8 rounded-md object-cover ring-1 ring-gray-200"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-sm font-semibold text-gray-500 ring-1 ring-gray-200">
                                                {c.title?.charAt(0) || "C"}
                                            </div>
                                        )}
                                        <span className="truncate text-sm font-medium text-gray-800">
                                            {c.title}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                                        Open →
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionCard>
        </aside>
    );
}
