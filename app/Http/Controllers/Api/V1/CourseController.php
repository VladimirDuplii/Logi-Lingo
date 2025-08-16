<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Course;
use App\Models\Unit;
use App\Models\Lesson;
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

    /**
     * Отримати уроки для конкретного юніту курсу
     */
    public function lessons($courseId, $unitId)
    {
        $unit = Unit::where('id', $unitId)->where('course_id', $courseId)->first();
        if (!$unit) {
            return $this->sendError('Unit not found.', [], 404);
        }

        $lessons = Lesson::where('unit_id', $unit->id)
            ->orderBy('order')
            ->withCount('challenges')
            ->get()
            ->map(function ($lesson) {
                $arr = $lesson->toArray();
                // Align naming with frontend (expects questions_count)
                $arr['questions_count'] = $lesson->challenges_count ?? 0;
                unset($arr['challenges_count']);
                return $arr;
            });

        return $this->sendResponse($lessons, 'Lessons retrieved successfully.');
    }

    /**
     * Отримати питання (challenges) для конкретного уроку
     */
    public function questions($courseId, $unitId, $lessonId)
    {
        $lesson = Lesson::where('id', $lessonId)
            ->where('unit_id', $unitId)
            ->first();
        if (!$lesson) {
            return $this->sendError('Lesson not found.', [], 404);
        }

        $lesson->load(['unit' => function ($q) use ($courseId) {
            $q->where('course_id', $courseId);
        }]);

        if (!$lesson->unit) {
            return $this->sendError('Lesson does not belong to this course/unit.', [], 404);
        }

        $challenges = $lesson->challenges()
            ->with(['options' => function ($q) {
                $q->orderBy('id');
            }])
            ->orderBy('order')
            ->get()
            ->map(function ($challenge) {
                return [
                    'id' => $challenge->id,
                    // Frontend expects `text` instead of `question`
                    'text' => $challenge->question,
                    'type' => $challenge->type,
                    'order' => $challenge->order,
                    'image_url' => $challenge->image_src,
                    'audio_url' => $challenge->audio_src,
                    'options' => $challenge->options->map(function ($opt) {
                        return [
                            'id' => $opt->id,
                            'text' => $opt->text,
                            'is_correct' => (bool) $opt->is_correct,
                            'image_url' => $opt->image_src,
                            'audio_url' => $opt->audio_src,
                        ];
                    })->values()->all(),
                ];
            })->values();

        return $this->sendResponse($challenges, 'Questions retrieved successfully.');
    }
}
