import React, { useState, useEffect } from 'react';
import { ProgressService } from '../../Services';
import CourseProgress from './CourseProgress';

const UserProgress = () => {
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProgress = async () => {
            try {
                const response = await ProgressService.getUserProgress();
                setProgress(response.data.data || []);
            } catch (err) {
                setError('Failed to load your progress. Please try again later.');
                console.error('Error fetching progress:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProgress();
    }, []);

    if (loading) {
        return <div className="loading">Loading your progress...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (progress.length === 0) {
        return (
            <div className="no-progress">
                <h2>No Progress Yet</h2>
                <p>You haven't started any courses yet. Start learning to track your progress!</p>
            </div>
        );
    }

    return (
        <div className="user-progress">
            <h1>Your Learning Progress</h1>
            
            <div className="overall-stats">
                <div className="stat-item">
                    <div className="stat-value">{progress.length}</div>
                    <div className="stat-label">Courses Started</div>
                </div>
                
                <div className="stat-item">
                    <div className="stat-value">
                        {progress.filter(course => course.completion_percentage === 100).length}
                    </div>
                    <div className="stat-label">Courses Completed</div>
                </div>
                
                <div className="stat-item">
                    <div className="stat-value">
                        {progress.reduce((total, course) => total + course.completed_lessons, 0)}
                    </div>
                    <div className="stat-label">Lessons Completed</div>
                </div>
            </div>
            
            <div className="course-progress-list">
                <h2>Course Progress</h2>
                {progress.map(courseProgress => (
                    <CourseProgress 
                        key={courseProgress.course_id} 
                        courseProgress={courseProgress} 
                    />
                ))}
            </div>
        </div>
    );
};

export default UserProgress;
