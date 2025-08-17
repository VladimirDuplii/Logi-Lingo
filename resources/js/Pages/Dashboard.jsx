import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CourseService, ProgressService } from '@/Services';
import { Courses, Progress } from '@/Components';

export default function Dashboard({ auth }) {
    const [recentCourses, setRecentCourses] = useState([]);
    const [inProgressCourses, setInProgressCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const [userProgress, setUserProgress] = useState(null);
    const [activeAgg, setActiveAgg] = useState(null);
    const [activeUnits, setActiveUnits] = useState([]);
    const [mounted, setMounted] = useState(false);

    const authenticated = !!auth?.user;

    useEffect(() => {
        // trigger entry animations
        const t = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!authenticated) {
            setError('Будь ласка, увійдіть в систему для перегляду дашборду.');
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // 1) Fetch user progress (hearts/points/active course)
                const up = await ProgressService.getUserProgress();
                const upData = up?.data || up?.userProgress || null;
                setUserProgress(upData);

                // If active course exists, compute aggregation for lessons
                const activeCourseId = upData?.active_course_id || upData?.activeCourse?.id;
                if (activeCourseId) {
                    try {
                        const cp = await ProgressService.getCourseProgress(activeCourseId);
                        const units = cp?.data || [];
                        const totals = units.reduce(
                            (acc, unit) => {
                                const lessons = Array.isArray(unit?.lessons) ? unit.lessons : [];
                                acc.total += lessons.length;
                                acc.completed += lessons.filter((l) => !!l?.completed).length;
                                return acc;
                            },
                            { total: 0, completed: 0 }
                        );
                        const percent = totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0;
                        setActiveAgg({
                            totalLessons: totals.total,
                            completedLessons: totals.completed,
                            percent,
                        });

                        // compute unit chips
                        const unitChips = units.map((u) => {
                            const ls = Array.isArray(u?.lessons) ? u.lessons : [];
                            const total = ls.length;
                            const completed = ls.filter((l) => !!l?.completed).length;
                            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                            return {
                                id: u.id,
                                title: u.title || `Розділ ${u.order ?? ''}`.trim(),
                                completed,
                                total,
                                percent: pct,
                            };
                        });
                        setActiveUnits(unitChips);
                    } catch (_) {
                        setActiveAgg({ totalLessons: 0, completedLessons: 0, percent: 0 });
                        setActiveUnits([]);
                    }
                } else {
                    setActiveAgg({ totalLessons: 0, completedLessons: 0, percent: 0 });
                    setActiveUnits([]);
                }

                // 2) Recent courses
                const coursesResponse = await CourseService.getCourses();
                if (coursesResponse?.data?.courses) {
                    setRecentCourses(coursesResponse.data.courses.slice(0, 3));
                }

                // 3) In-progress courses (MVP uses active course aggregation)
                const progressResponse = await ProgressService.getAllCoursesProgress();
                if (progressResponse?.data?.data) {
                    const coursesInProgress = progressResponse.data.data
                        .filter((course) => (course.completion_percentage || 0) > 0 && (course.completion_percentage || 0) < 100)
                        .sort((a, b) => (b.last_activity_date || 0) - (a.last_activity_date || 0));
                    setInProgressCourses(coursesInProgress);
                }
            } catch (err) {
                setError('Failed to load dashboard data. Please try again later.');
                setDebugInfo({
                    message: err?.message,
                    stack: err?.stack,
                    response: err?.response ? {
                        status: err.response.status,
                        statusText: err.response.statusText,
                        data: err.response.data,
                    } : 'No response data',
                    request: err?.request ? 'Request was made but no response received' : 'No request made',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [authenticated]);

    const handleCourseSelect = (course) => {
        window.location.href = `/courses/${course.id}`;
    };

    const handleContinue = () => {
        const courseId = userProgress?.active_course_id || userProgress?.activeCourse?.id;
        if (courseId) {
            window.location.href = `/courses/${courseId}?start=1`;
            return;
        }
        window.location.href = '/courses';
    };

    const handleRefill = async () => {
        try {
            const res = await ProgressService.refillHearts();
            const data = res?.data || res;
            if (data) setUserProgress((prev) => ({ ...(prev || {}), ...data }));
        } catch (e) {
            // non-blocking; could show toast
        }
    };

    const hearts = Math.max(0, Math.min(5, Number(userProgress?.hearts || 0)));
    const points = Number(userProgress?.points || 0);
    const canRefill = hearts < 5 && points >= 50;
    const activeCourseTitle = userProgress?.activeCourse?.title || 'Почнімо навчання';

    // If not authenticated, show login button
    if (!authenticated) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
            >
                <Head title="Dashboard" />

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Необхідна авторизація!</strong>
                            <span className="block sm:inline"> {error}</span>
                            <div className="mt-4">
                                <Link href="/login" className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                    Увійти в систему
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
        header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Loading dashboard data...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline"> {error}</span>

                            {debugInfo && (
                                <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-60">
                                    <h4 className="font-bold mb-2">Debug Information:</h4>
                                    <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Duo-style header: avatar, hearts, points */}
                            <div className={`overflow-hidden sm:rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 mb-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-500 text-white text-lg font-bold shadow-inner">
                                                {auth?.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold text-gray-800">Привіт, {auth.user.name}</div>
                                                <div className="text-sm text-gray-500">Повернімося до навчання</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Points */}
                                            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-orange-700 ring-1 ring-orange-200">
                                                <span className="text-sm font-semibold">⚡</span>
                                                <span className="text-sm font-semibold">{points}</span>
                                            </div>
                                            {/* Hearts */}
                                            <div className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-rose-700 ring-1 ring-rose-200">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span key={i} className={`text-sm ${i < hearts ? 'opacity-100' : 'opacity-30'}`}>❤</span>
                                                ))}
                                            </div>
                                            {canRefill && (
                                                <button
                                                    onClick={handleRefill}
                                                    className="rounded-full bg-rose-500 px-3 py-1 text-sm font-semibold text-white shadow hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                                                >
                                                    Відновити життя (-50 ⚡)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Continue card */}
                            <div className={`overflow-hidden sm:rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 mb-6 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                <div className="p-6 flex items-center justify-between">
                                    <div className="min-w-0">
                                        <div className="text-sm text-gray-500 mb-1">Активний курс</div>
                                        <div className="text-lg font-semibold text-gray-800 truncate">{activeCourseTitle}</div>
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                                <span>Прогрес</span>
                                                <span>{(activeAgg?.percent ?? 0)}%</span>
                                            </div>
                                            <div className="relative h-2 w-64 max-w-full overflow-hidden rounded-full bg-gray-200">
                                                <div
                                                    className="h-full bg-green-500 transition-all duration-500"
                                                    style={{ width: `${Math.min(100, Math.max(0, activeAgg?.percent ?? 0))}%` }}
                                                />
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {activeAgg?.completedLessons ?? 0} / {activeAgg?.totalLessons ?? 0} уроків завершено
                                            </div>
                                            {activeUnits?.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {activeUnits.map((u) => (
                                                        <span
                                                            key={u.id}
                                                            title={`${u.completed} / ${u.total}`}
                                                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${u.percent === 100 ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-gray-50 text-gray-700 ring-gray-200'}`}
                                                        >
                                                            <span className="truncate max-w-[10rem]">{u.title}</span>
                                                            <span className="opacity-70">{u.percent}%</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleContinue}
                                            className="rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                        >
                                            Продовжити
                                        </button>
                                        <Link href="/courses" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-green-600 ring-1 ring-inset ring-green-300 hover:bg-green-50">
                                            Курси
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* In Progress Courses */}
                            {inProgressCourses.length > 0 && (
                                <div className={`overflow-hidden sm:rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 mb-6 transition-all duration-500 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                    <div className="p-6 text-gray-900">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">Продовжити навчання</h3>
                                            <Link href="/progress" className="text-blue-600 hover:text-blue-800 text-sm">
                                                Переглянути прогрес →
                                            </Link>
                                        </div>

                                        <div className="space-y-4">
                                            {inProgressCourses.map((course) => (
                                                <Progress.CourseProgress key={course.course_id} courseProgress={course} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Courses */}
                            {recentCourses.length > 0 && (
                                <div className={`overflow-hidden sm:rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                    <div className="p-6 text-gray-900">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">Нещодавні курси</h3>
                                            <Link href="/courses" className="text-blue-600 hover:text-blue-800 text-sm">
                                                Усі курси →
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {recentCourses.map((course) => (
                                                <div key={course.id} className="course-card-wrapper" onClick={() => handleCourseSelect(course)}>
                                                    <Courses.CourseCard course={course} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Empty state */}
                            {inProgressCourses.length === 0 && recentCourses.length === 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                    <div className="p-6 text-gray-900 text-center">
                                        <h3 className="text-lg font-semibold mb-2">Почнімо навчання</h3>
                                        <p className="text-gray-600 mb-4">Обери курс і почни перший урок.</p>
                                        <Link href="/courses" className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                            Переглянути курси
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
