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
        'position',
        'audio_src',
        'image_src',
    ];
    
    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }
}
