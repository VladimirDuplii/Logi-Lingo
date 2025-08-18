<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class LogicLessonsSeeder extends Seeder
{
    /**
     * Ensure the first Logic unit ("Основи логіки") has core lessons.
     */
    public function run(): void
    {
        $course = Course::where('title', 'Логіка')->first();
        if (!$course) {
            $this->command?->warn('Курс "Логіка" не знайдено. Запустіть CourseSeeder.');
            return;
        }

        $unit = Unit::where('course_id', $course->id)->where('title', 'Основи логіки')->first();
        if (!$unit) {
            $this->command?->warn('Юніт "Основи логіки" не знайдено. Запустіть UnitSeeder.');
            return;
        }

        $desired = [
            ['title' => 'Поняття і судження', 'order' => 1],
            ['title' => 'Логічні операції', 'order' => 2],
        ];

        foreach ($desired as $d) {
            // If lesson exists anywhere by title, relink to the target unit; otherwise create
            $existing = Lesson::where('title', $d['title'])->first();
            if ($existing) {
                if ($existing->unit_id !== $unit->id) {
                    $existing->unit_id = $unit->id;
                    $existing->order = $d['order'];
                    $existing->save();
                } else {
                    // Ensure order is correct
                    if ((int) $existing->order !== (int) $d['order']) {
                        $existing->order = $d['order'];
                        $existing->save();
                    }
                }
                continue;
            }

            Lesson::create([
                'unit_id' => $unit->id,
                'title' => $d['title'],
                'order' => $d['order'],
            ]);
        }
    }
}
