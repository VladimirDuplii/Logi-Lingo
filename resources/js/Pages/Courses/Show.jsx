import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Courses } from '@/Components';

const CourseDetailsPage = ({ auth, course }) => {
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);

    // If user came with ?start=1, auto-select first unit/lesson when available
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        const shouldStart = url.searchParams.get('start') === '1';
        if (shouldStart && course?.units?.length && !selectedUnit && !selectedLesson) {
            const u = course.units.find((u) => Array.isArray(u.lessons) && u.lessons.length > 0) || course.units[0];
            setSelectedUnit(u);
            if (u?.lessons?.length) {
                setSelectedLesson(u.lessons[0]);
            }
        }
    }, [course, selectedUnit, selectedLesson]);

    const handleUnitSelect = (unit) => {
        setSelectedUnit(unit);
        setSelectedLesson(null);
    };

    const handleLessonSelect = (lesson, unit) => {
        if (unit) setSelectedUnit(unit);
        setSelectedLesson(lesson);
    };

    const renderContent = () => {
        if (selectedLesson) {
            return (
                <Courses.QuestionList 
                    courseId={course.id} 
                    unitId={selectedUnit.id}
                    lessonId={selectedLesson.id}
                />
            );
        }
        
        if (selectedUnit) {
            return (
                <Courses.LessonList 
                    courseId={course.id}
                    unitId={selectedUnit.id}
                    onLessonSelect={handleLessonSelect}
                />
            );
        }
        
        return (
            <Courses.CourseDetail 
                courseId={course.id}
                initialCourse={course}
                onUnitSelect={handleUnitSelect}
                onLessonSelect={handleLessonSelect}
            />
        );
    };

    // Generate breadcrumb navigation
    const getBreadcrumbs = () => {
        const breadcrumbs = [
            { 
                name: 'Courses', 
                href: '/courses', 
                current: !selectedUnit && !selectedLesson 
            }
        ];
        
        if (course) {
            breadcrumbs.push({
                name: course.title,
                href: `/courses/${course.id}`,
                current: !selectedUnit && !selectedLesson
            });
        }
        
        if (selectedUnit) {
            breadcrumbs.push({
                name: selectedUnit.title,
                href: '#',
                current: !!selectedUnit && !selectedLesson
            });
        }
        
        if (selectedLesson) {
            breadcrumbs.push({
                name: selectedLesson.title,
                href: '#',
                current: true
            });
        }
        
        return breadcrumbs;
    };
    
    const breadcrumbs = getBreadcrumbs();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col space-y-2">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {course.title}
                    </h2>
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            {breadcrumbs.map((breadcrumb, index) => (
                                <li key={index} className="inline-flex items-center">
                                    {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                                    <a
                                        href={breadcrumb.href}
                                        className={`inline-flex items-center text-sm font-medium ${
                                            breadcrumb.current 
                                                ? 'text-gray-800 cursor-default' 
                                                : 'text-blue-600 hover:text-blue-700'
                                        }`}
                                        onClick={(e) => {
                                            if (index === 0) {
                                                // Allow normal navigation to courses page
                                            } else if (index === 1) {
                                                e.preventDefault();
                                                setSelectedUnit(null);
                                                setSelectedLesson(null);
                                            } else {
                                                e.preventDefault();
                                                // Don't do anything on the current level
                                            }
                                        }}
                                    >
                                        {breadcrumb.name}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>
            }
        >
            <Head title={course.title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default CourseDetailsPage;
