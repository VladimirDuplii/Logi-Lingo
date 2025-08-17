<?php

namespace Database\Seeders;

use App\Models\Challenge;
use App\Models\ChallengeOption;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class LogicChallengesSeeder extends Seeder
{
    /**
     * Seed logic course challenges (questions) for two lessons so they are playable.
     */
    public function run(): void
    {
        $course = Course::where('title', 'Логіка')->first();
        if (!$course) {
            $this->command?->warn('Курс "Логіка" не знайдено. Спочатку запустіть CourseSeeder, UnitSeeder, LessonSeeder.');
            return;
        }

        $unit = Unit::where('course_id', $course->id)->where('title', 'Основи логіки')->first();
        if (!$unit) {
            $this->command?->warn('Розділ "Основи логіки" не знайдено. Запустіть UnitSeeder.');
            return;
        }

        $lesson1 = Lesson::where('unit_id', $unit->id)->where('title', 'Поняття і судження')->first();
        $lesson2 = Lesson::where('unit_id', $unit->id)->where('title', 'Логічні операції')->first();

        if (!$lesson1 || !$lesson2) {
            $this->command?->warn('Потрібні уроки для логіки не знайдені. Запустіть LessonSeeder.');
            return;
        }

        // Helper to upsert a challenge with options
        $seedChallenge = function (Lesson $lesson, int $order, string $question, array $options, string $type = 'SELECT') {
            /** @var Challenge $challenge */
            $challenge = Challenge::updateOrCreate(
                ['lesson_id' => $lesson->id, 'order' => $order],
                ['type' => $type, 'question' => $question]
            );

            // To keep it simple and idempotent, delete old options then recreate
            ChallengeOption::where('challenge_id', $challenge->id)->delete();
            foreach ($options as $opt) {
                ChallengeOption::create([
                    'challenge_id' => $challenge->id,
                    'text' => $opt['text'],
                    'is_correct' => $opt['is_correct'],
                ]);
            }
        };

        // Lesson 1: Поняття і судження
        $seedChallenge($lesson1, 1, 'Яке з наведених є судженням?', [
            ['text' => 'Квадрат має чотири сторони', 'is_correct' => true],
            ['text' => 'Ура!', 'is_correct' => false],
            ['text' => 'Біжи!', 'is_correct' => false],
        ]);

        $seedChallenge($lesson1, 2, 'Визначте істинність: 2 + 2 = 4', [
            ['text' => 'Істина', 'is_correct' => true],
            ['text' => 'Хиба', 'is_correct' => false],
        ]);

        $seedChallenge($lesson1, 3, 'Оберіть поняття:', [
            ['text' => 'Трикутник', 'is_correct' => true],
            ['text' => 'Біжи', 'is_correct' => false],
            ['text' => 'Сьогодні', 'is_correct' => false],
        ]);

        // Lesson 2: Логічні операції
        $seedChallenge($lesson2, 1, 'Яка операція повертає істину, якщо обидва висловлювання істинні?', [
            ['text' => 'Кон’юнкція (AND)', 'is_correct' => true],
            ['text' => 'Диз’юнкція (OR)', 'is_correct' => false],
            ['text' => 'Заперечення (NOT)', 'is_correct' => false],
        ]);

        $seedChallenge($lesson2, 2, 'Результат диз’юнкції (A OR B), якщо A = Хиба, B = Істина:', [
            ['text' => 'Істина', 'is_correct' => true],
            ['text' => 'Хиба', 'is_correct' => false],
        ]);

        $seedChallenge($lesson2, 3, 'Заперечення (NOT) істини дорівнює:', [
            ['text' => 'Хиба', 'is_correct' => true],
            ['text' => 'Істина', 'is_correct' => false],
        ]);
    }
}
