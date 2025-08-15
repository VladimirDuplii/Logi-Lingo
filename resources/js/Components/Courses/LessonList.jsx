import React, { useState, useEffect } from 'react';
import { CourseService, ProgressService } from '../../Services';

const LessonList = ({ courseId, unitId, onLessonSelect }) => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLessons = async () => {
            if (!courseId || !unitId) return;
            
            try {
                const response = await CourseService.getLessons(courseId, unitId);
                setLessons(response.data.data || []);
            } catch (err) {
                setError('Failed to load lessons. Please try again later.');
                console.error('Error fetching lessons:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [courseId, unitId]);

    const handleLessonClick = async (lesson) => {
        // Track that user viewed this lesson
        try {
            await ProgressService.trackLessonStart(courseId, unitId, lesson.id);
        } catch (error) {
            console.error('Error tracking lesson start:', error);
            // Continue anyway as this is just tracking
        }
        
        if (onLessonSelect) {
            onLessonSelect(lesson);
        }
    };

    if (loading) {
        return <div className="loading">Loading lessons...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (lessons.length === 0) {
        return <div className="no-lessons">No lessons available for this unit.</div>;
    }

    return (
        <div className="lesson-list">
            <h2>Unit Lessons</h2>
            <div className="lessons">
                {lessons.map(lesson => (
                    <div 
                        key={lesson.id} 
                        className="lesson-item"
                        onClick={() => handleLessonClick(lesson)}
                    >
                        <div className="lesson-number">{lesson.order}</div>
                        <div className="lesson-content">
                            <h3>{lesson.title}</h3>
                            <p>{lesson.description}</p>
                            <div className="lesson-meta">
                                <span className="question-count">{lesson.questions_count || 0} questions</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LessonList;
