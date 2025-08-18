<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProgress extends Model
{
    use HasFactory;
    // The table name and PK differ from Laravel's defaults
    protected $table = 'user_progress';
    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'int';
    
    protected $fillable = [
        'user_id',
        'active_course_id',
        'user_name',
        'user_image_src',
        'hearts',
        'points',
    'daily_goal_xp',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function activeCourse()
    {
        return $this->belongsTo(Course::class, 'active_course_id');
    }
}
