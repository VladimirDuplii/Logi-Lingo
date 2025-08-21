<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_progress', function (Blueprint $table) {
            if (!Schema::hasColumn('user_progress', 'max_streak')) {
                $table->integer('max_streak')->default(0)->after('streak');
            }
            if (!Schema::hasColumn('user_progress', 'streak_freezes')) {
                $table->integer('streak_freezes')->default(0)->after('max_streak');
            }
            if (!Schema::hasColumn('user_progress', 'streak_frozen_until')) {
                $table->date('streak_frozen_until')->nullable()->after('streak_freezes');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_progress', function (Blueprint $table) {
            if (Schema::hasColumn('user_progress', 'streak_frozen_until')) {
                $table->dropColumn('streak_frozen_until');
            }
            if (Schema::hasColumn('user_progress', 'streak_freezes')) {
                $table->dropColumn('streak_freezes');
            }
            if (Schema::hasColumn('user_progress', 'max_streak')) {
                $table->dropColumn('max_streak');
            }
        });
    }
};
