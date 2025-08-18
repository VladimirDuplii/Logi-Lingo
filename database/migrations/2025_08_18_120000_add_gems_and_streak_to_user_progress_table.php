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
            if (!Schema::hasColumn('user_progress', 'gems')) {
                $table->integer('gems')->default(0)->after('points');
            }
            if (!Schema::hasColumn('user_progress', 'streak')) {
                $table->integer('streak')->default(0)->after('gems');
            }
            if (!Schema::hasColumn('user_progress', 'last_activity_date')) {
                $table->date('last_activity_date')->nullable()->after('streak');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_progress', function (Blueprint $table) {
            if (Schema::hasColumn('user_progress', 'last_activity_date')) {
                $table->dropColumn('last_activity_date');
            }
            if (Schema::hasColumn('user_progress', 'streak')) {
                $table->dropColumn('streak');
            }
            if (Schema::hasColumn('user_progress', 'gems')) {
                $table->dropColumn('gems');
            }
        });
    }
};
