import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Progress } from '@/Components';
import { ProgressService } from '@/Services';

const ProgressPage = ({ auth }) => {
    const [userProgress, setUserProgress] = useState(null);
    const [courseProgressList, setCourseProgressList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                // Get user's overall progress
                const userProgressResponse = await ProgressService.getUserProgress();
                setUserProgress(userProgressResponse.data.data);
                
                // Get progress for individual courses
                const coursesProgressResponse = await ProgressService.getAllCoursesProgress();
                setCourseProgressList(coursesProgressResponse.data.data || []);
            } catch (err) {
                setError('Failed to load progress data. Please try again later.');
                console.error('Error fetching progress:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Your Progress</h2>}
        >
            <Head title="Progress" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Loading progress data...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline"> {error}</span>
                        </div>
                    ) : (
                        <>
                            {/* User progress overview */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                <div className="p-6 text-gray-900">
                                    <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
                                    {userProgress ? (
                                        <div className="overall-progress">
                                            <div className="stats grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="stat bg-gray-50 p-4 rounded">
                                                    <div className="stat-title text-gray-500">Courses Started</div>
                                                    <div className="stat-value text-2xl">{userProgress.courses_started}</div>
                                                </div>
                                                <div className="stat bg-gray-50 p-4 rounded">
                                                    <div className="stat-title text-gray-500">Courses Completed</div>
                                                    <div className="stat-value text-2xl">{userProgress.courses_completed}</div>
                                                </div>
                                                <div className="stat bg-gray-50 p-4 rounded">
                                                    <div className="stat-title text-gray-500">Total Lessons Completed</div>
                                                    <div className="stat-value text-2xl">{userProgress.total_lessons_completed}</div>
                                                </div>
                                            </div>
                                            <div className="stats grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                <div className="stat bg-gray-50 p-4 rounded">
                                                    <div className="stat-title text-gray-500">Questions Answered</div>
                                                    <div className="stat-value text-2xl">{userProgress.total_questions_answered}</div>
                                                </div>
                                                <div className="stat bg-gray-50 p-4 rounded">
                                                    <div className="stat-title text-gray-500">Correct Answers</div>
                                                    <div className="stat-value text-2xl">
                                                        {userProgress.correct_answers_count} 
                                                        ({Math.round(userProgress.correct_answers_percentage)}%)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">No progress data available. Start a course to track your progress!</p>
                                    )}
                                </div>
                            </div>

                            {/* Individual course progress */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6 text-gray-900">
                                    <h3 className="text-lg font-semibold mb-4">Course Progress</h3>
                                    {courseProgressList.length > 0 ? (
                                        <div className="course-progress-list space-y-6">
                                            {courseProgressList.map(courseProgress => (
                                                <Progress.CourseProgress 
                                                    key={courseProgress.course_id}
                                                    courseProgress={courseProgress}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">You haven't started any courses yet.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ProgressPage;
