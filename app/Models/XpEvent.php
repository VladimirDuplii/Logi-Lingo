<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class XpEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id','source_type','source_id','amount','meta'
    ];

    protected $casts = [
        'meta' => 'array',
    ];
}
