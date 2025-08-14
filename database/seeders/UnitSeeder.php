<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Unit;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Отримуємо ID курсів
        $mathCourse = Course::where('title', 'Математика')->first();
        $ukrainianCourse = Course::where('title', 'Українська мова')->first();
        $logicCourse = Course::where('title', 'Логіка')->first();

        if (!$mathCourse || !$ukrainianCourse || !$logicCourse) {
            $this->command->info('Курси не знайдено. Спершу запустіть CourseSeeder.');
            return;
        }

        // Розділи для курсу математики
        $mathUnits = [
            [
                'course_id' => $mathCourse->id,
                'title' => 'Основи арифметики',
                'description' => 'Вивчення базових арифметичних операцій: додавання, віднімання, множення та ділення.',
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $mathCourse->id,
                'title' => 'Дроби',
                'description' => 'Вивчення звичайних та десяткових дробів, а також операцій з ними.',
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $mathCourse->id,
                'title' => 'Алгебраїчні вирази',
                'description' => 'Основи алгебри та роботи з алгебраїчними виразами.',
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Розділи для курсу української мови
        $ukrainianUnits = [
            [
                'course_id' => $ukrainianCourse->id,
                'title' => 'Фонетика',
                'description' => 'Вивчення звуків української мови та правил їх вимови.',
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $ukrainianCourse->id,
                'title' => 'Орфографія',
                'description' => 'Правила правопису української мови.',
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $ukrainianCourse->id,
                'title' => 'Морфологія',
                'description' => 'Вивчення частин мови та їх граматичних категорій.',
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Розділи для курсу логіки
        $logicUnits = [
            [
                'course_id' => $logicCourse->id,
                'title' => 'Основи логіки',
                'description' => 'Вивчення базових понять логіки та логічних операцій.',
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $logicCourse->id,
                'title' => 'Логічні задачі',
                'description' => 'Розв\'язання різноманітних логічних задач і головоломок.',
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $logicCourse->id,
                'title' => 'Аргументація',
                'description' => 'Вивчення техніки аргументації та логічних помилок.',
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Додаємо всі розділи до бази даних
        foreach (array_merge($mathUnits, $ukrainianUnits, $logicUnits) as $unit) {
            Unit::create($unit);
        }
    }
}
