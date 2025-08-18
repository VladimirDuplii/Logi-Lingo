<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_progress', function (Blueprint $table) {
            if (!Schema::hasColumn('user_progress', 'daily_goal_xp')) {
                $table->integer('daily_goal_xp')->default(30)->after('points');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_progress', function (Blueprint $table) {
            if (Schema::hasColumn('user_progress', 'daily_goal_xp')) {
                $table->dropColumn('daily_goal_xp');
            }
        });
    }
};
