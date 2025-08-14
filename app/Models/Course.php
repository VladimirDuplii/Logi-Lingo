<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'title',
        'image_src',
    ];
    
    public function units()
    {
        return $this->hasMany(Unit::class);
    }
    
    public function userProgress()
    {
        return $this->hasMany(UserProgress::class, 'active_course_id');
    }
}
