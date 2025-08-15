import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CourseService, ProgressService, AuthService } from '@/Services';
import { Courses, Progress } from '@/Components';

export default function Dashboard({ auth }) {
    const [recentCourses, setRecentCourses] = useState([]);
    const [inProgressCourses, setInProgressCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const [authenticated, setAuthenticated] = useState(AuthService.isAuthenticated());

    useEffect(() => {
        // Check authentication first
        if (!authenticated) {
            setError('Будь ласка, увійдіть в систему для перегляду дашборду.');
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // Get recent courses
                console.log('Fetching courses...');
                const coursesResponse = await CourseService.getCourses();
                console.log('Courses response:', coursesResponse);

                // Just showing the latest 3 courses
                if (coursesResponse.data && coursesResponse.data.courses) {
                    setRecentCourses(coursesResponse.data.courses.slice(0, 3));
                }

                // Get courses in progress
                console.log('Fetching progress...');
                const progressResponse = await ProgressService.getAllCoursesProgress();
                console.log('Progress response:', progressResponse);

                if (progressResponse.data && progressResponse.data.data) {
                    const coursesInProgress = progressResponse.data.data
                        .filter(course => course.completion_percentage > 0 && course.completion_percentage < 100)
                        .sort((a, b) => b.last_activity_date - a.last_activity_date);

                    setInProgressCourses(coursesInProgress);
                }
            } catch (err) {
                console.error('Dashboard error details:', err);
                setError('Failed to load dashboard data. Please try again later.');

                // Save debug info
                setDebugInfo({
                    message: err.message,
                    stack: err.stack,
                    response: err.response ? {
                        status: err.response.status,
                        statusText: err.response.statusText,
                        data: err.response.data
                    } : 'No response data',
                    request: err.request ? 'Request was made but no response received' : 'No request made'
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
                            {/* Welcome section */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                <div className="p-6 text-gray-900">
                                    <h3 className="text-lg font-semibold mb-2">Welcome back, {auth.user.name}!</h3>
                                    <p className="text-gray-600">Continue your language learning journey.</p>

                                    <div className="mt-4 flex space-x-4">
                                        <Link href="/courses" className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                            Browse All Courses
                                        </Link>
                                        <Link href="/progress" className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                                            View My Progress
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Alternate content when no progress/courses */}
                            {inProgressCourses.length === 0 && recentCourses.length === 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                    <div className="p-6 text-gray-900 text-center">
                                        <h3 className="text-lg font-semibold mb-2">Get Started with Learning</h3>
                                        <p className="text-gray-600 mb-4">
                                            It looks like you haven't started any courses yet. Browse our available courses to begin your learning journey.
                                        </p>
                                        <Link href="/courses" className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                            Browse Courses
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* In Progress Courses */}
                            {inProgressCourses.length > 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                    <div className="p-6 text-gray-900">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">Continue Learning</h3>
                                            <Link href="/progress" className="text-blue-600 hover:text-blue-800 text-sm">
                                                View All Progress →
                                            </Link>
                                        </div>

                                        <div className="space-y-4">
                                            {inProgressCourses.map(course => (
                                                <Progress.CourseProgress
                                                    key={course.course_id}
                                                    courseProgress={course}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Courses */}
                            {recentCourses.length > 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6 text-gray-900">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">Recent Courses</h3>
                                            <Link href="/courses" className="text-blue-600 hover:text-blue-800 text-sm">
                                                View All Courses →
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {recentCourses.map(course => (
                                                <div key={course.id} className="course-card-wrapper" onClick={() => handleCourseSelect(course)}>
                                                    <Courses.CourseCard course={course} />
                                                </div>
                                            ))}
                                        </div>
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
