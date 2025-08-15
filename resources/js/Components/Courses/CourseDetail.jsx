import React, { useState, useEffect } from 'react';
import { CourseService } from '../../Services';
import UnitList from './UnitList';

const CourseDetail = ({ courseId, onUnitSelect }) => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourseDetails = async () => {
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
    }, [courseId]);

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
