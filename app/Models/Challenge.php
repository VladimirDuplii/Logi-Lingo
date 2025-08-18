<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'lesson_id',
        'type',
        'question',
        'order',
        'audio_src',
        'image_src',
        'content',
    ];
    
    protected $casts = [
        'content' => 'array',
    ];
    
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
    
    public function options()
    {
        return $this->hasMany(ChallengeOption::class);
    }
    
    public function challengeProgress()
    {
        return $this->hasMany(ChallengeProgress::class);
    }
    
    public function progress()
    {
        return $this->hasMany(ChallengeProgress::class);
    }
}
