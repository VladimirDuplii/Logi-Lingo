<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Guard: prevent seeding in non-local environments (skip on staging/production)
        if (!app()->environment('local')) {
            return; // Safe no-op outside local dev
        }

        // User::factory(10)->create();
        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        // Local development seeders for courses, units, lessons & challenges
        $this->call([
            CourseSeeder::class,
            UnitSeeder::class,
            LessonSeeder::class,
            LogicLessonsSeeder::class,
            LogicChallengesSeeder::class,
            // Cleanup duplicates from earlier iterations
            CleanupDuplicateLessonsSeeder::class,
        ]);
    }
}
