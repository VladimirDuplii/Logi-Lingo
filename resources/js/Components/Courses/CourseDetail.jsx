import React, { useState, useEffect } from 'react';
import { CourseService } from '../../Services';
import UnitList from './UnitList';

const CourseDetail = ({ courseId, initialCourse, onUnitSelect }) => {
    const [course, setCourse] = useState(initialCourse || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            // If we already have initial course from server, don't refetch
            if (initialCourse) {
                setLoading(false);
                return;
            }
            if (!courseId) return;
            try {
                const response = await CourseService.getCourseById(courseId);
                setCourse(response.data.data);
            } catch (err) {
                setError('Failed to load course details. Please try again later.');
                console.error('Error fetching course details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId, initialCourse]);

    if (loading) {
        return <div className="loading">Loading course details...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!course) {
        return <div className="no-course">Course not found.</div>;
    }

    return (
        <div className="course-detail">
            <div className="course-header">
                <h1>{course.title}</h1>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                    <span className="course-level">Level: {course.level}</span>
                    <span className="course-units-count">Units: {course.units_count}</span>
                </div>
                <div className="mt-4">
                    <button
                        className="inline-flex items-center justify-center rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        onClick={() => {
                            if (!course?.units?.length) return;
                            setStarting(true);
                            const firstUnit = course.units[0];
                            if (onUnitSelect) onUnitSelect(firstUnit);
                            setStarting(false);
                        }}
                        disabled={starting || !course?.units?.length}
                    >
                        Почати навчання
                    </button>
                </div>
            </div>
            
            <UnitList 
                courseId={courseId} 
                onUnitSelect={onUnitSelect} 
                units={course.units || []}
            />
        </div>
    );
};

export default CourseDetail;
