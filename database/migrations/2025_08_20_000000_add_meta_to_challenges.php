<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('challenges', function (Blueprint $table) {
            $table->json('meta')->nullable()->after('image_src');
        });

        // Normalize existing type values to lowercase for consistency
        DB::table('challenges')->update([
            'type' => DB::raw('LOWER(type)')
        ]);
    }

    public function down(): void
    {
        Schema::table('challenges', function (Blueprint $table) {
            $table->dropColumn('meta');
        });
        // No reliable down migration for case normalization
    }
};