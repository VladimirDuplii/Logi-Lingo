<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLeagueHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'league_tier_id', 'week_start', 'weekly_xp', 'result'
    ];
}
