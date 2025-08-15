import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CourseService, ProgressService } from '@/Services';
import { Courses, Progress } from '@/Components';

export default function Dashboard({ auth }) {
    const [recentCourses, setRecentCourses] = useState([]);
    const [inProgressCourses, setInProgressCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Get recent courses
                const coursesResponse = await CourseService.getCourses();
                // Just showing the latest 3 courses
                setRecentCourses((coursesResponse.data.data || []).slice(0, 3));
                
                // Get courses in progress
                const progressResponse = await ProgressService.getAllCoursesProgress();
                const coursesInProgress = (progressResponse.data.data || [])
                    .filter(course => course.completion_percentage > 0 && course.completion_percentage < 100)
                    .sort((a, b) => b.last_activity_date - a.last_activity_date);
                
                setInProgressCourses(coursesInProgress);
            } catch (err) {
                setError('Failed to load dashboard data. Please try again later.');
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleCourseSelect = (course) => {
        window.location.href = `/courses/${course.id}`;
    };

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
