<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Course;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends BaseApiController
{
    /**
     * Отримати список усіх курсів
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $courses = Course::all();
        
        // Отримуємо активний курс користувача, якщо він є
        $userProgress = UserProgress::where('user_id', Auth::id())->first();
        $activeCourseId = $userProgress ? $userProgress->active_course_id : null;
        
        $data = [
            'courses' => $courses,
            'activeCourseId' => $activeCourseId
        ];
        
        return $this->sendResponse($data, 'Courses retrieved successfully.');
    }

    /**
     * Отримати деталі конкретного курсу
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $course = Course::with('units.lessons')->find($id);
        
        if (is_null($course)) {
            return $this->sendError('Course not found.');
        }
        
        return $this->sendResponse($course, 'Course retrieved successfully.');
    }

    /**
     * Встановити активний курс для користувача
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function setActive($id)
    {
        $course = Course::find($id);
        
        if (is_null($course)) {
            return $this->sendError('Course not found.');
        }
        
        $userProgress = UserProgress::updateOrCreate(
            ['user_id' => Auth::id()],
            ['active_course_id' => $id]
        );
        
        return $this->sendResponse($userProgress, 'Active course set successfully.');
    }
}
