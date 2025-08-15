import React from 'react';

const UserProgress = ({ userProgress }) => {
    if (!userProgress) return null;

    return (
        <div className="user-progress">
            <div className="stats-grid">
                <div className="stat-item">
                    <div className="stat-label">Courses Started</div>
                    <div className="stat-value">{userProgress.courses_started}</div>
                </div>
                
                <div className="stat-item">
                    <div className="stat-label">Courses Completed</div>
                    <div className="stat-value">{userProgress.courses_completed}</div>
                </div>
                
                <div className="stat-item">
                    <div className="stat-label">Total Lessons Completed</div>
                    <div className="stat-value">{userProgress.total_lessons_completed}</div>
                </div>
                
                <div className="stat-item">
                    <div className="stat-label">Questions Answered</div>
                    <div className="stat-value">{userProgress.total_questions_answered}</div>
                </div>
                
                <div className="stat-item">
                    <div className="stat-label">Correct Answers</div>
                    <div className="stat-value">
                        {userProgress.correct_answers_count} 
                        ({Math.round(userProgress.correct_answers_percentage)}%)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProgress;
