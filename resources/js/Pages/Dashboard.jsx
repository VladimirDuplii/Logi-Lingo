import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DuoLayout from "@/Layouts/DuoLayout";
import { setAuthToken } from "@/Services/ApiService";
// Use existing UI primitives (lowercase file names)
import { Card } from '@/Components/UI/card';
import { Button } from '@/Components/UI/button';
import { Headline } from '@/Components/UI/Headline';
import { ProgressBar, Skeleton, CourseCardSkeleton } from '@/Components/ui';
import { CourseService, ProgressService } from "@/Services";
import { Courses, Progress } from "@/Components";
import { useToast } from "@/Components/Toast";

export default function Dashboard({ auth }) {
    const toast = useToast();
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
            setError("Будь ласка, увійдіть в систему для перегляду дашборду.");
            setLoading(false);
            return;
        }
        let cancelled = false;
        const mark = (name) => { if (typeof performance !== 'undefined') performance.mark(name); };
        const measure = (name, start, end) => { if (typeof performance !== 'undefined') { try { performance.measure(name, start, end); } catch(_){} } };
        (async () => {
            mark('dash-start');
            try {
                try { setAuthToken(null); } catch(_){}
                // Fetch user progress first (needed for hearts + active course id)
                const upPromise = ProgressService.getUserProgress();
                const up = await upPromise; // Only await progress now
                const upData = up?.data || up?.userProgress || null;
                if (cancelled) return;
                setUserProgress(upData);
                const activeCourseId = upData?.active_course_id || upData?.activeCourse?.id;

                // Kick off secondary requests in parallel
                const requests = [];
                if (activeCourseId) {
                    requests.push(
                        ProgressService.getCourseProgress(activeCourseId)
                            .then(cp => { if (cancelled) return; const units = cp?.data || []; const totals = units.reduce((acc,u)=>{ const lessons=Array.isArray(u?.lessons)?u.lessons:[]; acc.total+=lessons.length; acc.completed+=lessons.filter(l=>!!l?.completed).length; return acc;}, {total:0,completed:0}); const percent = totals.total?Math.round((totals.completed/totals.total)*100):0; setActiveAgg({ totalLessons: totals.total, completedLessons: totals.completed, percent }); const unitChips = units.map(u=>{ const ls = Array.isArray(u?.lessons)?u.lessons:[]; const total=ls.length; const completed=ls.filter(l=>!!l?.completed).length; const pct = total?Math.round((completed/total)*100):0; return { id:u.id, title:u.title || `Розділ ${u.order ?? ''}`.trim(), completed, total, percent:pct }; }); setActiveUnits(unitChips); })
                            .catch(()=>{ if(cancelled) return; setActiveAgg({ totalLessons:0, completedLessons:0, percent:0}); setActiveUnits([]); })
                    );
                } else {
                    setActiveAgg({ totalLessons:0, completedLessons:0, percent:0});
                    setActiveUnits([]);
                }
                // Recent courses & progress list in parallel
                requests.push(
                    CourseService.getCourses().then(cr=>{ if(cancelled) return; if(cr?.data?.courses) setRecentCourses(cr.data.courses.slice(0,3)); })
                );
                requests.push(
                    ProgressService.getAllCoursesProgress().then(pr=>{ if(cancelled) return; if(pr?.data?.data){ const coursesInProgress = pr.data.data.filter(c=>(c.completion_percentage||0)>0 && (c.completion_percentage||0)<100).sort((a,b)=>(b.last_activity_date||0)-(a.last_activity_date||0)); setInProgressCourses(coursesInProgress); } })
                );
                await Promise.allSettled(requests);
            } catch (err) {
                if (cancelled) return;
                setError("Failed to load dashboard data. Please try again later.");
                setDebugInfo({ message: err?.message, stack: err?.stack, response: err?.response?{ status:err.response.status, statusText:err.response.statusText, data:err.response.data }:'No response data', request: err?.request? 'Request was made but no response received':'No request made' });
            } finally {
                if (!cancelled) { setLoading(false); mark('dash-end'); measure('dashboard-total','dash-start','dash-end'); }
            }
        })();
        return ()=>{ cancelled = true; };
    }, [authenticated]);

    const handleCourseSelect = (course) => {
        window.location.href = `/courses/${course.id}`;
    };

    const handleContinue = () => {
        const courseId =
            userProgress?.active_course_id || userProgress?.activeCourse?.id;
        if (courseId) {
            window.location.href = `/courses/${courseId}?start=1`;
            return;
        }
        window.location.href = "/courses";
    };

    const [refilling, setRefilling] = useState(false);
    const handleRefill = async () => {
        try {
            setRefilling(true);
            const res = await ProgressService.refillHearts();
            const data = res?.data || res;
            if (data) {
                setUserProgress((prev) => ({ ...(prev || {}), ...data }));
                toast?.success?.("Життя відновлено!");
            }
        } catch (e) {
            const msg =
                e?.response?.data?.message || "Не вдалося відновити життя";
            toast?.error?.(msg);
        } finally {
            setRefilling(false);
        }
    };

    const hearts = Math.max(0, Math.min(5, Number(userProgress?.hearts || 0)));
    const points = Number(userProgress?.points || 0);
    const canRefill = hearts < 5 && points >= 50;
    const activeCourseTitle =
        userProgress?.activeCourse?.title || "Почнімо навчання";

    // If not authenticated, show login button
    if (!authenticated) {
        return (
            <DuoLayout>
                <Head title="Dashboard" />

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                            role="alert"
                        >
                            <strong className="font-bold">
                                Необхідна авторизація!
                            </strong>
                            <span className="block sm:inline"> {error}</span>
                            <div className="mt-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Увійти в систему
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </DuoLayout>
        );
    }

    return (
        <DuoLayout>
            <Head title="Dashboard" />

            <div className="py-8 lg:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="space-y-8" aria-busy="true" aria-label="Завантаження дашборду">
                            <Card className="p-6 md:p-8">
                                <div className="flex items-center gap-5">
                                    <Skeleton className="h-14 w-14 rounded-2xl" />
                                    <div className="flex-1 min-w-0">
                                        <Skeleton className="h-5 w-48 mb-2" />
                                        <Skeleton className="h-3 w-64" />
                                    </div>
                                    <div className="flex gap-3">
                                        <Skeleton className="h-7 w-20 rounded-full" />
                                        <Skeleton className="h-7 w-28 rounded-full" />
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-6 md:p-8">
                                <Skeleton className="h-4 w-24 mb-4" />
                                <Skeleton className="h-5 w-80 mb-4" />
                                <Skeleton className="h-2 w-full mb-2" />
                                <Skeleton className="h-2 w-2/3" />
                            </Card>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(3)].map((_,i)=>(<CourseCardSkeleton key={i} />))}
                            </div>
                        </div>
                    ) : error ? (
                        <div
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                            role="alert"
                        >
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline"> {error}</span>

                            {debugInfo && (
                                <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-60">
                                    <h4 className="font-bold mb-2">
                                        Debug Information:
                                    </h4>
                                    <pre className="text-xs">
                                        {JSON.stringify(debugInfo, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Duo-style header: avatar, hearts, points */}
                            <Card id="dash-header" className={`mb-8 overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-brand-gradient text-white text-xl font-bold flex items-center justify-center shadow-soft-lg">
                                            {auth?.user?.name?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <h1 className="text-gradient-brand text-2xl font-bold tracking-tight">
                                                Привіт, {auth.user.name}
                                            </h1>
                                            <p className="text-sm text-gray-500 mt-1">Повернімося до навчання</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="badge-pill brand">
                                            <span className="text-sm">⚡</span>
                                            <span className="text-sm font-semibold">{points}</span>
                                        </div>
                                        <div className="badge-pill accent">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i} className={`text-sm ${i < hearts ? "opacity-100" : "opacity-30"}`}>❤</span>
                                            ))}
                                        </div>
                                        {canRefill && (
                                            <Button onClick={handleRefill} disabled={refilling} className={refilling ? 'opacity-70 cursor-not-allowed' : ''}>
                                                {refilling ? 'Виконується…' : 'Відновити життя -50 ⚡'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Continue card */}
                            <Card id="dash-continue" className={`mb-8 transition-all duration-500 delay-75 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                                <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium tracking-wide text-brand-600 mb-2 uppercase">Активний курс</p>
                                        <h2 className="text-xl font-semibold text-gray-800 truncate">{activeCourseTitle}</h2>
                                        <div className="mt-4 w-full max-w-md">
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                <span>Прогрес</span>
                                                <span>{activeAgg?.percent ?? 0}%</span>
                                            </div>
                                            <ProgressBar value={activeAgg?.percent ?? 0} />
                                            <div className="mt-2 text-[11px] text-gray-500 tracking-wide">
                                                {activeAgg?.completedLessons ?? 0} / {activeAgg?.totalLessons ?? 0} уроків завершено
                                            </div>
                                            {activeUnits?.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {activeUnits.map(u => (
                                                        <span key={u.id} className={`badge-pill ${u.percent === 100 ? 'brand' : 'accent'} !px-3 !py-1`}> 
                                                            <span className="truncate max-w-[7rem]">{u.title}</span>
                                                            <span className="opacity-70">{u.percent}%</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <Button onClick={handleContinue}>Продовжити</Button>
                                        <Link href="/courses" className="relative inline-flex items-center gap-2 font-medium rounded-full border border-brand-300 hover:border-brand-400 bg-white text-brand-600 px-6 py-2 text-sm transition-colors">Курси</Link>
                                    </div>
                                </div>
                            </Card>

                            {/* In Progress Courses */}
                            {inProgressCourses.length > 0 && (
                                <Card id="dash-in-progress" className={`mb-8 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                    <div className="p-6 md:p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <Headline level={3}>Продовжити навчання</Headline>
                                            <Link href="/progress" className="text-brand-600 hover:text-brand-700 text-sm font-medium">Переглянути прогрес →</Link>
                                        </div>
                                        <div className="space-y-5">
                                            {inProgressCourses.map(course => (
                                                <Progress.CourseProgress key={course.course_id} courseProgress={course} />
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Recent Courses */}
                            {recentCourses.length > 0 && (
                                <Card id="dash-recent" className={`transition-all duration-500 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                    <div className="p-6 md:p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <Headline level={3}>Нещодавні курси</Headline>
                                            <Link href="/courses" className="text-brand-600 hover:text-brand-700 text-sm font-medium">Усі курси →</Link>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {recentCourses.map(course => (
                                                <Courses.CourseCard key={course.id} course={course} onClick={() => handleCourseSelect(course)} />
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Empty state */}
                            {inProgressCourses.length === 0 &&
                                recentCourses.length === 0 && (
                                    <Card className="text-center py-16 mb-8">
                                        <Headline level={3} className="mb-2">Почнімо навчання</Headline>
                                        <p className="text-gray-500 mb-6 max-w-md mx-auto">Обери курс і почни перший урок просто зараз.</p>
                                        <Button onClick={() => (window.location.href='/courses')}>Переглянути курси</Button>
                                    </Card>
                                )}
                        </>
                    )}
                </div>
            </div>
        </DuoLayout>
    );
}
