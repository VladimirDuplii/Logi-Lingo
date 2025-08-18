import React, { useState, useEffect } from 'react';
import { CourseService } from '../../Services';
import CourseCard from './CourseCard';

const CourseList = ({ onCourseSelect }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await CourseService.getCourses();
                // API returns { success, data: { courses, activeCourseId }, message }
                setCourses((response?.data?.courses) || []);
            } catch (err) {
                setError('Failed to load courses. Please try again later.');
                console.error('Error fetching courses:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-48 animate-pulse rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-sm text-red-600">{error}</div>;
    }

    if (courses.length === 0) {
        return <div className="text-sm text-gray-500">No courses available at this time.</div>;
    }

    return (
        <div className="course-list">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Курси</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map(course => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        onClick={() => onCourseSelect(course)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CourseList;
