import React, { useState, useEffect } from 'react';
import { CourseService } from '../../Services';
import CourseCard from './CourseCard';
import { Headline, CourseCardSkeleton } from '@/Components/ui';

const CourseList = ({ onCourseSelect }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startedIds, setStartedIds] = useState(new Set());

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const [allRes, startedRes] = await Promise.all([
                    CourseService.getCourses(),
                    CourseService.getStartedCourses().catch(() => null),
                ]);
                // API returns { success, data: { courses, activeCourseId }, message }
                setCourses((allRes?.data?.courses) || []);
                if (startedRes) {
                    const list = Array.isArray(startedRes?.data?.courses)
                        ? startedRes.data.courses
                        : [];
                    setStartedIds(new Set(list.map((c) => c.id)));
                } else {
                    setStartedIds(new Set());
                }
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
            <div className="grid grid-cols-1 gap-5" aria-label="Завантаження курсів" aria-busy="true">
                {[...Array(6)].map((_,i)=>(<CourseCardSkeleton key={i} />))}
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
                        <div className="mb-6">
                            <Headline level={2} kicker="Навчання">Курси</Headline>
                        </div>
            <div className="grid grid-cols-1 gap-5">
        {courses.map(course => (
                    <CourseCard
                        key={course.id}
            course={course}
            isStarted={startedIds.has(course.id)}
                        onClick={() => onCourseSelect(course)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CourseList;
