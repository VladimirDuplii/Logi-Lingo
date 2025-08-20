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
        'meta',
    ];
    
    protected $casts = [
        'meta' => 'array',
    ];
    
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($challenge) {
            // Handle 'speak' type fallback
            if ($challenge->type === 'speak') {
                $meta = $challenge->meta ?? [];
                if (empty($meta['expected_text'])) {
                    $meta['expected_text'] = $challenge->question;
                    $challenge->meta = $meta;
                }
            }
        });
    }
    
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
