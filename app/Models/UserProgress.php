<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProgress extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'active_course_id',
        'hearts',
        'points',
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
