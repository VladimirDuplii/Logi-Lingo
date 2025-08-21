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
            // Sanitize & validate 'match' pairs structure
            if ($challenge->type === 'match') {
                $meta = $challenge->meta ?? [];
                $pairs = $meta['pairs'] ?? [];
                if (!is_array($pairs)) {
                    $pairs = [];
                }
                $clean = [];
                $seen = [];
                foreach ($pairs as $pair) {
                    if (!is_array($pair)) continue;
                    $left = isset($pair['left']) ? trim((string)$pair['left']) : '';
                    $right = isset($pair['right']) ? trim((string)$pair['right']) : '';
                    if ($left === '' || $right === '') continue; // skip incomplete
                    $key = mb_strtolower($left.'|'.$right);
                    if (isset($seen[$key])) continue; // enforce uniqueness
                    $seen[$key] = true;
                    $clean[] = ['left' => $left, 'right' => $right];
                }
                if (count($clean) === 0) {
                    throw new \Exception('Match challenges require at least one valid pair (left & right).');
                }
                // Enforce reasonable cap
                if (count($clean) > 20) {
                    $clean = array_slice($clean, 0, 20);
                }
                $meta['pairs'] = array_values($clean);
                $challenge->meta = $meta;
            } else {
                // If switching away from match, remove stale pairs to avoid confusion
                if (is_array($challenge->meta) && array_key_exists('pairs', $challenge->meta)) {
                    $meta = $challenge->meta;
                    unset($meta['pairs']);
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
