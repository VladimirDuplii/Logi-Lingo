<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('challenges', 'meta')) {
            Schema::table('challenges', function (Blueprint $table) {
                $table->json('meta')->nullable()->after('image_src');
            });
        }
    }
    public function down(): void
    {
        if (Schema::hasColumn('challenges', 'meta')) {
            Schema::table('challenges', function (Blueprint $table) {
                $table->dropColumn('meta');
            });
        }
    }
};
