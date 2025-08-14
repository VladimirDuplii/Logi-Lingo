<?php

namespace Database\Seeders;

use App\Models\Lesson;
use App\Models\Unit;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LessonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Отримуємо ID перших розділів кожного курсу для прикладу
        $mathUnit = Unit::where('title', 'Основи арифметики')->first();
        $ukrainianUnit = Unit::where('title', 'Фонетика')->first();
        $logicUnit = Unit::where('title', 'Основи логіки')->first();

        if (!$mathUnit || !$ukrainianUnit || !$logicUnit) {
            $this->command->info('Розділи не знайдено. Спершу запустіть UnitSeeder.');
            return;
        }

        // Уроки для розділу математики "Основи арифметики"
        $mathLessons = [
            [
                'unit_id' => $mathUnit->id,
                'title' => 'Додавання і віднімання',
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'unit_id' => $mathUnit->id,
                'title' => 'Множення',
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'unit_id' => $mathUnit->id,
                'title' => 'Ділення',
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Уроки для розділу української мови "Фонетика"
        $ukrainianLessons = [
            [
                'unit_id' => $ukrainianUnit->id,
                'title' => 'Голосні звуки',
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'unit_id' => $ukrainianUnit->id,
                'title' => 'Приголосні звуки',
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'unit_id' => $ukrainianUnit->id,
                'title' => 'Наголос',
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Уроки для розділу логіки "Основи логіки"
        $logicLessons = [
            [
                'unit_id' => $logicUnit->id,
                'title' => 'Поняття і судження',
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'unit_id' => $logicUnit->id,
                'title' => 'Логічні операції',
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'unit_id' => $logicUnit->id,
                'title' => 'Логічні закони',
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Додаємо всі уроки до бази даних
        foreach (array_merge($mathLessons, $ukrainianLessons, $logicLessons) as $lesson) {
            Lesson::create($lesson);
        }
    }
}
