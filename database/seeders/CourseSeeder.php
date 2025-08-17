<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            [
                'title' => 'Математика',
                'image_src' => 'courses/math.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Українська мова',
                'image_src' => 'courses/ukrainian.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Логіка',
                'image_src' => 'courses/logic.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($courses as $course) {
            Course::updateOrCreate(
                ['title' => $course['title']],
                [
                    'image_src' => $course['image_src'],
                    'updated_at' => now(),
                ] + (isset($course['created_at']) ? [] : ['created_at' => now()])
            );
        }
    }
}
