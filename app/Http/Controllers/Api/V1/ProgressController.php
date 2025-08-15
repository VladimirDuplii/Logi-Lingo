<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Challenge;
use App\Models\ChallengeProgress;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Unit;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ProgressController extends BaseApiController
{
    /**
     * Отримати прогрес користувача
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserProgress()
    {
        $userProgress = UserProgress::where('user_id', Auth::id())
            ->with('activeCourse')
            ->first();
            
        if (!$userProgress) {
            $userProgress = new UserProgress();
            $userProgress->user_id = Auth::id();
            $userProgress->hearts = 5;
            $userProgress->points = 0;
            $userProgress->save();
        }
        
        return $this->sendResponse($userProgress, 'User progress retrieved successfully.');
    }

    /**
     * Отримати прогрес користувача за конкретним курсом
     *
     * @param  int  $courseId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCourseProgress($courseId)
    {
        $course = Course::find($courseId);
        
        if (is_null($course)) {
            return $this->sendError('Course not found.');
        }
        
        // Отримуємо всі розділи курсу з уроками і завданнями
        $units = Unit::where('course_id', $courseId)
            ->with(['lessons' => function($query) {
                $query->orderBy('order', 'asc');
                $query->with(['challenges' => function($query) {
                    $query->orderBy('order', 'asc');
                    $query->with(['challengeProgress' => function($query) {
                        $query->where('user_id', Auth::id());
                    }]);
                }]);
            }])
            ->orderBy('order', 'asc')
            ->get();
        
        // Форматуємо дані, додаючи статус виконання для кожного уроку
        $formattedUnits = $units->map(function($unit) {
            $lessonsWithCompletedStatus = $unit->lessons->map(function($lesson) {
                if ($lesson->challenges->isEmpty()) {
                    return array_merge($lesson->toArray(), ['completed' => false]);
                }
                
                $allChallengesCompleted = $lesson->challenges->every(function($challenge) {
                    return $challenge->challengeProgress->isNotEmpty() && 
                           $challenge->challengeProgress->every(function($progress) {
                               return $progress->completed;
                           });
                });
                
                return array_merge($lesson->toArray(), ['completed' => $allChallengesCompleted]);
            });
            
            return array_merge($unit->toArray(), ['lessons' => $lessonsWithCompletedStatus]);
        });
        
        return $this->sendResponse($formattedUnits, 'Course progress retrieved successfully.');
    }

    /**
     * Оновити прогрес користувача за конкретним завданням
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $challengeId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateChallengeProgress(Request $request, $challengeId)
    {
        $validator = Validator::make($request->all(), [
            'completed' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors()->toArray(), 422);
        }
        
        $challenge = Challenge::find($challengeId);
        
        if (is_null($challenge)) {
            return $this->sendError('Challenge not found.');
        }
        
        $progress = ChallengeProgress::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'challenge_id' => $challengeId
            ],
            [
                'completed' => $request->completed
            ]
        );
        
        // Якщо завдання виконане успішно, додаємо бали користувачу
        if ($request->completed) {
            $userProgress = UserProgress::where('user_id', Auth::id())->first();
            
            if ($userProgress) {
                $userProgress->points += 10;
                $userProgress->save();
            }
        }
        
        return $this->sendResponse($progress, 'Challenge progress updated successfully.');
    }

    /**
     * Зменшити кількість життів при неправильній відповіді
     *
     * @param  int  $challengeId
     * @return \Illuminate\Http\JsonResponse
     */
    public function reduceHearts($challengeId)
    {
        $challenge = Challenge::find($challengeId);
        
        if (is_null($challenge)) {
            return $this->sendError('Challenge not found.');
        }
        
        $userProgress = UserProgress::where('user_id', Auth::id())->first();
        
        if (!$userProgress) {
            return $this->sendError('User progress not found.');
        }
        
        // Перевіряємо, чи є життя
        if ($userProgress->hearts <= 0) {
            return $this->sendError('No hearts left.', [], 403);
        }
        
        // Зменшуємо кількість життів
        $userProgress->hearts -= 1;
        $userProgress->save();
        
        return $this->sendResponse($userProgress, 'Hearts reduced successfully.');
    }

    /**
     * Відновити життя за бали
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refillHearts()
    {
        $userProgress = UserProgress::where('user_id', Auth::id())->first();
        
        if (!$userProgress) {
            return $this->sendError('User progress not found.');
        }
        
        // Перевіряємо чи повний запас життів
        if ($userProgress->hearts >= 5) {
            return $this->sendError('Hearts are already full.', [], 400);
        }
        
        // Перевіряємо чи достатньо балів (50 балів за одне життя)
        if ($userProgress->points < 50) {
            return $this->sendError('Not enough points.', [], 400);
        }
        
        // Відновлюємо життя і віднімаємо бали
        $userProgress->hearts = 5;
        $userProgress->points -= 50;
        $userProgress->save();
        
        return $this->sendResponse($userProgress, 'Hearts refilled successfully.');
    }
}
