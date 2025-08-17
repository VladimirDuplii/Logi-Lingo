<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChallengeProgress extends Model
{
    use HasFactory;
    protected $table = 'challenge_progress';
    
    protected $fillable = [
        'user_id',
        'challenge_id',
        'completed',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }
}
