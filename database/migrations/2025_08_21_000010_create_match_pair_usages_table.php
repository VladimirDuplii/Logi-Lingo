<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('match_pair_usages')) return; // idempotent
        Schema::create('match_pair_usages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('challenge_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('left');
            $table->string('right');
            $table->boolean('correct')->default(true); // reserved for future (if tracking mistakes)
            $table->timestamps();
            $table->index(['challenge_id']);
            $table->index(['user_id']);
            $table->foreign('challenge_id')->references('id')->on('challenges')->cascadeOnDelete();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('match_pair_usages');
    }
};
