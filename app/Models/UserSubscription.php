<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'stripe_customer_id',
        'stripe_subscription_id',
        'stripe_current_period_end',
        'is_pro',
    ];

    protected $casts = [
        'stripe_current_period_end' => 'datetime',
        'is_pro' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
