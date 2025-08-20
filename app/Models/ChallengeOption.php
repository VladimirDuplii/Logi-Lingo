<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChallengeOption extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'challenge_id',
        'text',
        'is_correct',
        'audio_src',
        'image_src',
        'position',
    ];
    
    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }
}
