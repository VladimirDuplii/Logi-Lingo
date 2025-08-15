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
        return <div className="loading">Loading courses...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (courses.length === 0) {
        return <div className="no-courses">No courses available at this time.</div>;
    }

    return (
        <div className="course-list">
            <h2>Available Courses</h2>
            <div className="course-grid">
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
