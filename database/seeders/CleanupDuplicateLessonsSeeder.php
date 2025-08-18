<?php

namespace Database\Seeders;

use App\Models\Lesson;
use App\Models\Challenge;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CleanupDuplicateLessonsSeeder extends Seeder
{
    /**
     * Remove duplicate lessons per (unit_id, title), keep lowest id, relink challenges.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $dupeGroups = Lesson::select('unit_id', 'title', DB::raw('COUNT(*) as cnt'))
                ->groupBy('unit_id', 'title')
                ->having('cnt', '>', 1)
                ->get();

            foreach ($dupeGroups as $g) {
                $lessons = Lesson::where('unit_id', $g->unit_id)
                    ->where('title', $g->title)
                    ->orderBy('id')
                    ->get();

                $keep = $lessons->first();
                $drop = $lessons->slice(1);

                foreach ($drop as $d) {
                    // Relink challenges to kept lesson
                    Challenge::where('lesson_id', $d->id)->update(['lesson_id' => $keep->id]);
                    // Delete duplicate lesson
                    $d->delete();
                }
            }
        });
    }
}
