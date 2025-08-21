<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

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
            // If meta column not yet migrated, avoid touching or persisting it
            $hasMeta = Schema::hasColumn('challenges', 'meta');
            if (!$hasMeta) {
                // Ensure attribute not sent in insert/update
                if (array_key_exists('meta', $challenge->getAttributes())) {
                    unset($challenge->meta);
                }
                // Still allow saving other fields
                return;
            }
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
                    $leftText = isset($pair['left']) ? trim((string)$pair['left']) : '';
                    $rightText = isset($pair['right']) ? trim((string)$pair['right']) : '';
                    $leftImage = isset($pair['left_image']) ? trim((string)$pair['left_image']) : '';
                    $rightImage = isset($pair['right_image']) ? trim((string)$pair['right_image']) : '';
                    // Accept if we have at least something on each side (text or image)
                    if (($leftText === '' && $leftImage === '') || ($rightText === '' && $rightImage === '')) continue;
                    // Use composite key to enforce uniqueness by text+image path
                    $key = mb_strtolower(($leftText ?: $leftImage).'|'.($rightText ?: $rightImage));
                    if (isset($seen[$key])) continue;
                    $seen[$key] = true;
                    $clean[] = [
                        'left' => $leftText,
                        'right' => $rightText,
                        'left_image' => $leftImage ?: null,
                        'right_image' => $rightImage ?: null,
                    ];
                }
                if (count($clean) === 0) {
                    throw new \Exception('Match challenges require at least one valid pair (text or image on each side).');
                }
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
