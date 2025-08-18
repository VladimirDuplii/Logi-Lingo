import React from 'react';
import { router } from '@inertiajs/react';
import { CourseService } from '../../Services';

const CourseCard = ({ course, onClick }) => {
    const handleView = (e) => {
        e.stopPropagation();
        if (onClick) onClick();
        else router.visit(`/courses/${course.id}`);
    };

    const handleStart = async (e) => {
        e.stopPropagation();
        try {
            await CourseService.setActiveCourse(course.id);
        } catch (err) {
            // non-blocking
            console.error('Failed to set active course:', err);
        }
        router.visit(`/courses/${course.id}?start=1`);
    };

    return (
        <div
            className="group relative flex flex-col rounded-2xl bg-white shadow-md ring-1 ring-gray-100 hover:shadow-xl transition-transform hover:-translate-y-0.5 cursor-pointer"
            onClick={handleView}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' ? handleView(e) : null)}
        >
            <div className="flex items-center gap-4 p-5">
                <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-500 text-white text-2xl font-bold shadow-inner">
                    {course.image_url ? (
                        <img
                            className="h-14 w-14 rounded-2xl object-cover"
                            src={course.image_url}
                            alt={course.title}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'56\' height=\'56\'><rect width=\'100%\' height=\'100%\' fill=\'%23e5e7eb\'/></svg>'; }}
                        />
                    ) : (
                        <span aria-hidden>{course.title?.charAt(0) || 'C'}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="truncate text-lg font-semibold text-gray-800">
                        {course.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">{course.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 font-medium">
                            {course.level || 'Beginner'}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 font-medium">
                            {course.units_count} units
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-3 px-5 pb-5">
                <button
                    onClick={handleStart}
                    className="inline-flex items-center justify-center rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    aria-label="Start learning"
                >
                    Почати навчання
                </button>
                <button
                    onClick={handleView}
                    className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-600 ring-1 ring-inset ring-green-300 hover:bg-green-50"
                >
                    Переглянути курс
                </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

export default CourseCard;
