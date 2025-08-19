<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_league_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('league_tier_id');
            $table->string('week_start'); // YYYY-MM-DD (start of week)
            $table->integer('weekly_xp')->default(0);
            $table->enum('result', ['stay','promote','demote'])->default('stay');
            $table->timestamps();
            $table->unique(['user_id','week_start']);
            $table->index(['league_tier_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_league_histories');
    }
};
