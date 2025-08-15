import React from 'react';

const CourseCard = ({ course, onClick }) => {
    return (
        <div className="course-card" onClick={onClick}>
            <div className="course-image">
                {course.image_url ? (
                    <img src={course.image_url} alt={course.title} />
                ) : (
                    <div className="placeholder-image">{course.title.charAt(0)}</div>
                )}
            </div>
            <div className="course-content">
                <h3>{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                    <span className="course-level">{course.level}</span>
                    <span className="course-units">{course.units_count} units</span>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
