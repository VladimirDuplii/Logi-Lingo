<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('challenges')) return;
        // Use Doctrine schema manager (available by default in Laravel) to avoid duplicate index creation
        $indexes = [];
        try {
            $indexes = Schema::getConnection()->getDoctrineSchemaManager()->listTableIndexes('challenges');
        } catch (\Throwable $e) {
            // If doctrine not available, we'll attempt creation and ignore failures
        }
        Schema::table('challenges', function (Blueprint $table) use ($indexes) {
            if (!isset($indexes['challenges_lesson_order_index'])) {
                try { $table->index(['lesson_id','order'], 'challenges_lesson_order_index'); } catch (\Throwable $e) {}
            }
            if (!isset($indexes['challenges_type_index'])) {
                try { $table->index(['type'], 'challenges_type_index'); } catch (\Throwable $e) {}
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('challenges')) return;
        Schema::table('challenges', function (Blueprint $table) {
            try { $table->dropIndex('challenges_lesson_order_index'); } catch (\Throwable $e) {}
            try { $table->dropIndex('challenges_type_index'); } catch (\Throwable $e) {}
        });
    }
};
