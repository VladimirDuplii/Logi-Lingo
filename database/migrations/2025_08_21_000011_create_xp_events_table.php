<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('xp_events')) return;
        Schema::create('xp_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('source_type', 40); // challenge_first, challenge_practice, lesson_completion
            $table->unsignedBigInteger('source_id')->nullable();
            $table->integer('amount');
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
            $table->index(['source_type']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('xp_events');
    }
};
