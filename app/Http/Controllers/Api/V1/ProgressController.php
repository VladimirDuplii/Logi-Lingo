<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Challenge;
use App\Models\ChallengeProgress;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Unit;
use App\Models\UserProgress;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Cache;

class ProgressController extends BaseApiController
{
    /**
     * Increment today's XP for the user in cache (resets daily).
     */
    protected function addDailyXp(int $userId, int $amount): void
    {
        if ($amount <= 0) return;
        $today = Carbon::today();
        $key = 'daily_xp_' . $userId . '_' . $today->toDateString();
        $current = (int) Cache::get($key, 0);
        // Expire at end of day
        $ttl = $today->copy()->endOfDay();
        Cache::put($key, $current + $amount, $ttl);
    }
    /** Ensure hearts and points are initialized */
    protected function normalizeUserProgress(UserProgress $progress): UserProgress
    {
        $changed = false;
        if (!is_int($progress->hearts)) {
            $progress->hearts = is_numeric($progress->hearts) ? (int) $progress->hearts : 5;
            $changed = true;
        }
        if (!is_int($progress->points)) {
            $progress->points = is_numeric($progress->points) ? (int) $progress->points : 0;
            $changed = true;
        }
        // Optional meta if columns exist (backward compatible)
        if (Schema::hasColumn('user_progress', 'gems')) {
            if (!is_int($progress->gems ?? null)) {
                $progress->gems = is_numeric($progress->gems ?? null) ? (int) $progress->gems : 0;
                $changed = true;
            }
        }
        if (Schema::hasColumn('user_progress', 'streak')) {
            if (!is_int($progress->streak ?? null)) {
                $progress->streak = is_numeric($progress->streak ?? null) ? (int) $progress->streak : 0;
                $changed = true;
            }
        }
        if ($changed) {
            $progress->save();
        }
        return $progress;
    }

    /**
     * Повертає стан щоденних квестів за сьогодні
     */
    public function getDaily()
    {
        $userId = Auth::id();
        $today = Carbon::today();

        // Base user points/hearts
        $userProgress = UserProgress::firstOrCreate(
            ['user_id' => $userId],
            ['hearts' => 5, 'points' => 0]
        );
        $userProgress = $this->normalizeUserProgress($userProgress);

        // Maintain daily streak when corresponding columns exist
        $hasStreak = Schema::hasColumn('user_progress', 'streak');
        $hasLast = Schema::hasColumn('user_progress', 'last_activity_date');
        if ($hasStreak && $hasLast) {
            $yesterday = Carbon::yesterday();
            $last = $userProgress->last_activity_date ? Carbon::parse($userProgress->last_activity_date) : null;
            if (!$last) {
                // start streak on first activity
                $userProgress->streak = max(1, (int) ($userProgress->streak ?? 0));
            } elseif ($last->isSameDay($today)) {
                // already recorded today
            } elseif ($last->isSameDay($yesterday)) {
                $userProgress->streak = (int) ($userProgress->streak ?? 0) + 1;
            } else {
                $userProgress->streak = 1; // reset and start again
            }
            $userProgress->last_activity_date = $today->toDateString();
            $userProgress->save();
        }

        // Count answered questions today via ChallengeProgress updated today
        $answeredToday = ChallengeProgress::where('user_id', $userId)
            ->where('completed', true)
            ->whereDate('updated_at', '>=', $today)
            ->count();

        // Lessons completed today: infer by challenges all-complete updated today per lesson
        $lessonIds = Lesson::pluck('id');
        $lessonsCompletedToday = 0;
        foreach ($lessonIds as $lid) {
            $total = Challenge::where('lesson_id', $lid)->count();
            if ($total === 0)
                continue;
            $completed = Challenge::where('lesson_id', $lid)
                ->whereHas('challengeProgress', function ($q) use ($userId, $today) {
                    $q->where('user_id', $userId)
                        ->where('completed', true)
                        ->whereDate('updated_at', '>=', $today);
                })
                ->count();
            if ($completed >= $total) {
                $lessonsCompletedToday++;
            }
        }

        // XP earned today from cache-based ledger
        $xpKey = 'daily_xp_' . $userId . '_' . $today->toDateString();
        $xpToday = (int) Cache::get($xpKey, 0);
        // Fallback: if cache is empty, approximate from today's progress and hydrate cache
        if ($xpToday <= 0) {
            $approx = ($answeredToday * 10) + ($lessonsCompletedToday * 10);
            if ($approx > 0) {
                $xpToday = $approx;
                Cache::put($xpKey, $xpToday, $today->copy()->endOfDay());
            }
        }

        // Resolve goal even if column does not exist yet (temporary cache fallback)
        if (Schema::hasColumn('user_progress', 'daily_goal_xp')) {
            $goal = (int) ($userProgress->daily_goal_xp ?? 30);
        } else {
            $goal = (int) Cache::get('daily_goal_xp_user_' . $userId, 30);
        }
            $quests = [];
            $quests[] = [
                'key' => 'lesson_1',
                'title' => 'Complete 1 lesson',
                'progress' => min(1, $lessonsCompletedToday),
                'total' => 1,
                'completed' => $lessonsCompletedToday >= 1,
            ];
            $quests[] = [
                'key' => 'questions_20',
                'title' => 'Answer 20 questions',
                'progress' => min(20, $answeredToday),
                'total' => 20,
                'completed' => $answeredToday >= 20,
            ];
            $quests[] = [
                'key' => 'xp_30',
                'title' => 'Earn ' . $goal . ' XP',
                'progress' => $xpToday ?? 0,
                'total' => $goal,
                'completed' => ($xpToday ?? 0) >= $goal,
            ];

        return $this->sendResponse([
            'quests' => $quests,
            'points' => (int) $userProgress->points,
            'gems' => Schema::hasColumn('user_progress', 'gems') ? (int) ($userProgress->gems ?? 0) : 0,
            'hearts' => (int) $userProgress->hearts,
            'date' => $today->toDateString(),
            'streak' => Schema::hasColumn('user_progress', 'streak') ? (int) ($userProgress->streak ?? 0) : 0,
            'daily_goal_xp' => $goal,
        ], 'Daily quests summary');
    }

    /**
     * Оновити щоденну ціль користувача (XP)
     */
    public function updateDailyGoal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'daily_goal_xp' => 'required|integer|min:10|max:200',
        ]);
        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors()->toArray(), 422);
        }

        $userId = Auth::id();
        $value = (int) $request->integer('daily_goal_xp');

        // If the column wasn't migrated yet, avoid 500 and use a cache fallback so UI can work.
        if (!Schema::hasColumn('user_progress', 'daily_goal_xp')) {
            Cache::forever('daily_goal_xp_user_' . $userId, $value);
            return $this->sendResponse([
                'daily_goal_xp' => $value,
                'persisted' => false,
                'note' => 'Temporarily stored in cache. Run migrations to persist to DB.'
            ], 'Daily goal updated (temporary).');
        }

        $userProgress = UserProgress::firstOrCreate(
            ['user_id' => Auth::id()],
            ['hearts' => 5, 'points' => 0, 'daily_goal_xp' => 30]
        );
        $userProgress = $this->normalizeUserProgress($userProgress);
        $userProgress->daily_goal_xp = $value;
        $userProgress->save();

        return $this->sendResponse([
            'daily_goal_xp' => (int) $userProgress->daily_goal_xp,
        ], 'Daily goal updated successfully.');
    }
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
        $userProgress = $this->normalizeUserProgress($userProgress);
        return $this->sendResponse($userProgress, 'User progress retrieved successfully.');
    }

    /**
     * Зарахувати бали за проходження уроку
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $lessonId
     * @return \Illuminate\Http\JsonResponse
     */
    public function completeLesson(Request $request, $lessonId)
    {
        $validator = Validator::make($request->all(), [
            'correct' => 'required|integer|min:0',
            'total' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors()->toArray(), 422);
        }

        $lesson = Lesson::find($lessonId);
        if (is_null($lesson)) {
            return $this->sendError('Lesson not found.');
        }

        $userProgress = UserProgress::firstOrCreate(
            ['user_id' => Auth::id()],
            ['hearts' => 5, 'points' => 0]
        );
        $userProgress = $this->normalizeUserProgress($userProgress);

        // Completion bonus only (per-challenge XP is handled in updateChallengeProgress)
        $correct = (int) $request->integer('correct');
        $total = (int) $request->integer('total');

        // Base completion bonus + flawless bonus
        $xp = 10;
        if ($total > 0 && $correct === $total) {
            $xp += 10; // flawless bonus
        }

    $userProgress->points += $xp;
        if (Schema::hasColumn('user_progress', 'gems')) {
            // Award gems: flawless = 2, otherwise 1
            $userProgress->gems = (int) ($userProgress->gems ?? 0) + ($total > 0 && $correct === $total ? 2 : 1);
        }
        $userProgress->save();

    // Track daily XP
    $this->addDailyXp(Auth::id(), $xp);

        // Mark all challenges in this lesson as completed for this user to unlock the next lesson
        $challengeIds = $lesson->challenges()->pluck('id');
        foreach ($challengeIds as $cid) {
            ChallengeProgress::updateOrCreate(
                [
                    'user_id' => Auth::id(),
                    'challenge_id' => $cid,
                ],
                [
                    'completed' => true,
                ]
            );
        }

        return $this->sendResponse([
            'awarded_xp' => $xp,
            'points' => $userProgress->points,
            'gems' => Schema::hasColumn('user_progress', 'gems') ? (int) ($userProgress->gems ?? 0) : 0,
            'hearts' => $userProgress->hearts,
            'lesson_completed' => true,
        ], 'Lesson completed and points awarded.');
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
            ->with([
                'lessons' => function ($query) {
                    $query->orderBy('order', 'asc');
                    $query->with([
                        'challenges' => function ($query) {
                            $query->orderBy('order', 'asc');
                            $query->with([
                                'challengeProgress' => function ($query) {
                                    $query->where('user_id', Auth::id());
                                }
                            ]);
                        }
                    ]);
                }
            ])
            ->orderBy('order', 'asc')
            ->get();

        // Форматуємо дані, додаючи статус виконання для кожного уроку
        $formattedUnits = $units->map(function ($unit) {
            $lessonsWithStatus = $unit->lessons->map(function ($lesson) {
                $totalChallenges = $lesson->challenges->count();
                if ($totalChallenges === 0) {
                    return array_merge($lesson->toArray(), [
                        'completed' => false,
                        'progress' => [
                            'completed_challenges' => 0,
                            'total_challenges' => 0,
                        ],
                    ]);
                }

                $completedCount = 0;
                foreach ($lesson->challenges as $challenge) {
                    if (
                        $challenge->challengeProgress->isNotEmpty() &&
                        $challenge->challengeProgress->every(function ($progress) {
                            return $progress->completed; })
                    ) {
                        $completedCount++;
                    }
                }

                $allChallengesCompleted = ($completedCount >= $totalChallenges);

                return array_merge($lesson->toArray(), [
                    'completed' => $allChallengesCompleted,
                    'progress' => [
                        'completed_challenges' => $completedCount,
                        'total_challenges' => $totalChallenges,
                    ],
                ]);
            });

            return array_merge($unit->toArray(), ['lessons' => $lessonsWithStatus]);
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

        // Якщо завдання виконане успішно, додаємо бали користувачу (створюємо запис при необхідності)
        $userProgress = UserProgress::firstOrCreate(
            ['user_id' => Auth::id()],
            ['hearts' => 5, 'points' => 0]
        );
        $userProgress = $this->normalizeUserProgress($userProgress);
        if ($request->completed) {
            $userProgress->points += 10;
            if (Schema::hasColumn('user_progress', 'gems')) {
                $userProgress->gems = (int) ($userProgress->gems ?? 0) + 1;
            }
            $userProgress->save();
            // Track daily XP
            $this->addDailyXp(Auth::id(), 10);
        }

        return $this->sendResponse([
            'progress' => $progress,
            'points' => $userProgress?->points,
            'gems' => Schema::hasColumn('user_progress', 'gems') ? $userProgress?->gems : 0,
            'hearts' => $userProgress?->hearts,
        ], 'Challenge progress updated successfully.');
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

        $userProgress = UserProgress::firstOrCreate(
            ['user_id' => Auth::id()],
            ['hearts' => 5, 'points' => 0]
        );
        $userProgress = $this->normalizeUserProgress($userProgress);

        // Перевіряємо, чи є життя
        if ((int) $userProgress->hearts <= 0) {
            return $this->sendError('No hearts left.', [], 403);
        }

        // Зменшуємо кількість життів
        $userProgress->hearts = max(0, (int) $userProgress->hearts - 1);
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
        $userProgress = $this->normalizeUserProgress($userProgress);

        // Перевіряємо чи повний запас життів
        if ((int) $userProgress->hearts >= 5) {
            return $this->sendError('Hearts are already full.', [], 400);
        }

        // Перевіряємо чи достатньо балів (50 балів за одне життя)
        if ((int) $userProgress->points < 50) {
            return $this->sendError('Not enough points.', [], 400);
        }

        // Відновлюємо життя і віднімаємо бали
        $userProgress->hearts = 5;
        $userProgress->points -= 50;
        $userProgress->save();

        return $this->sendResponse($userProgress, 'Hearts refilled successfully.');
    }

    /**
     * Refill hearts using gems currency
     */
    public function refillHeartsWithGems()
    {
        // Ensure gems column exists
        if (!Schema::hasColumn('user_progress', 'gems')) {
            return $this->sendError('Gems feature is not available. Run migrations.', [], 503);
        }

        $userProgress = UserProgress::where('user_id', Auth::id())->first();
        if (!$userProgress) {
            return $this->sendError('User progress not found.');
        }
        $userProgress = $this->normalizeUserProgress($userProgress);

        // Already full
        if ((int) $userProgress->hearts >= 5) {
            return $this->sendError('Hearts are already full.', [], 400);
        }

        // Cost to fully refill
        $cost = 5; // gems
        if ((int) ($userProgress->gems ?? 0) < $cost) {
            return $this->sendError('Not enough gems.', [], 400);
        }

        $userProgress->gems = (int) $userProgress->gems - $cost;
        $userProgress->hearts = 5;
        $userProgress->save();

        return $this->sendResponse([
            'hearts' => (int) $userProgress->hearts,
            'gems' => (int) $userProgress->gems,
            'points' => (int) $userProgress->points,
        ], 'Hearts refilled using gems.');
    }

    /**
     * Return practiced days within a given month for the authenticated user
     * Query params: month (1-12), year (YYYY). Defaults to current month/year.
     */
    public function getPracticeCalendar(Request $request)
    {
        $userId = Auth::id();
        $today = Carbon::today();
        $month = (int) ($request->query('month', $today->month));
        $year = (int) ($request->query('year', $today->year));

        // Normalize bounds
        if ($month < 1 || $month > 12) {
            $month = $today->month;
        }
        if ($year < 1970 || $year > 2100) {
            $year = $today->year;
        }

        $start = Carbon::create($year, $month, 1)->startOfDay();
        $end = (clone $start)->endOfMonth();

        // Consider a day "practiced" if the user completed any challenge that day
        $records = ChallengeProgress::where('user_id', $userId)
            ->where('completed', true)
            ->whereBetween('updated_at', [$start, $end])
            ->get(['updated_at']);

        $days = $records->map(function ($r) {
            return Carbon::parse($r->updated_at)->day;
        })->unique()->values()->all();

        return $this->sendResponse([
            'month' => $month,
            'year' => $year,
            'days' => array_values($days),
        ], 'Practice calendar');
    }
}
