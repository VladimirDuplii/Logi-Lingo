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
        Schema::create('challenge_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained()->onDelete('cascade');
            $table->text('text');
            $table->boolean('is_correct');
            $table->string('audio_src')->nullable();
            $table->string('image_src')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenge_options');
    }
};
