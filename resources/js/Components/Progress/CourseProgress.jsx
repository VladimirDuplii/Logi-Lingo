import React from 'react';
import { Link } from '@inertiajs/react';

const CourseProgress = ({ courseProgress }) => {
    if (!courseProgress) return null;

    const completionPercentage = courseProgress.completion_percentage || 0;
    
    return (
        <div className="course-progress-card">
            <div className="course-info">
                <h3>{courseProgress.course_title}</h3>
                <p className="course-description">{courseProgress.course_description}</p>
            </div>
            
            <div className="progress-stats">
                <div className="progress-bar">
                    <div 
                        className="progress-filled" 
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
                
                <div className="progress-percentage">{completionPercentage}% complete</div>
                
                <div className="detailed-stats">
                    <div className="stat">
                        <span className="label">Units Completed:</span>
                        <span className="value">{courseProgress.completed_units} / {courseProgress.total_units}</span>
                    </div>
                    
                    <div className="stat">
                        <span className="label">Lessons Completed:</span>
                        <span className="value">{courseProgress.completed_lessons} / {courseProgress.total_lessons}</span>
                    </div>
                    
                    <div className="stat">
                        <span className="label">Questions Answered:</span>
                        <span className="value">{courseProgress.total_questions_answered}</span>
                    </div>
                    
                    <div className="stat">
                        <span className="label">Correct Answers:</span>
                        <span className="value">{courseProgress.correct_answers_count} ({Math.round(courseProgress.correct_answers_percentage)}%)</span>
                    </div>
                </div>
            </div>
            
            <div className="actions">
                <Link 
                    href={`/courses/${courseProgress.course_id}`} 
                    className="btn btn-primary"
                >
                    {completionPercentage === 100 ? 'Review Course' : 'Continue Learning'}
                </Link>
            </div>
        </div>
    );
};

export default CourseProgress;
