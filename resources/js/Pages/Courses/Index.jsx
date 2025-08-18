import React from 'react';
import { Head } from '@inertiajs/react';
import DuoLayout from '@/Layouts/DuoLayout';
import RightCourseSidebar from '@/Components/Layout/RightCourseSidebar';
import { Courses } from '@/Components';

const CoursesPage = ({ auth }) => {
    const handleCourseSelect = (course) => {
        window.location.href = `/courses/${course.id}`;
    };

    return (
        <DuoLayout
            right={
                <RightCourseSidebar
                    course={null}
                    hearts={auth?.user?.hearts ?? undefined}
                    points={auth?.user?.points ?? auth?.user?.xp ?? undefined}
                    otherCourses={auth?.user?.courses || []}
                />
            }
            centerMaxClass="xl:max-w-2xl"
        >
            <Head title="Courses" />
            <div id="courses-page" className="w-full">
                <div id="courses-header" className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Courses</h2>
                </div>
                <Courses.CourseList onCourseSelect={handleCourseSelect} />
            </div>
        </DuoLayout>
    );
};

export default CoursesPage;
