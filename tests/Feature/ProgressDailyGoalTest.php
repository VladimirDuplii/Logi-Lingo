<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProgressDailyGoalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_update_daily_goal_validates_bounds(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Lower than min
        $res = $this->postJson('/api/v1/progress/daily-goal', ['daily_goal_xp' => 9]);
        $res->assertStatus(422);

        // Higher than max
        $res = $this->postJson('/api/v1/progress/daily-goal', ['daily_goal_xp' => 201]);
        $res->assertStatus(422);

        // Non-integer
        $res = $this->postJson('/api/v1/progress/daily-goal', ['daily_goal_xp' => 'abc']);
        $res->assertStatus(422);
    }

    public function test_update_daily_goal_persists_to_db_when_column_exists(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Simulate that the column exists
        Schema::partialMock();
        Schema::shouldReceive('hasColumn')->with('user_progress', 'daily_goal_xp')->andReturn(true);

        // Prepare a progress row
        UserProgress::firstOrCreate(['user_id' => $user->id], ['hearts' => 5, 'points' => 0, 'daily_goal_xp' => 30]);

        $res = $this->postJson('/api/v1/progress/daily-goal', ['daily_goal_xp' => 50]);
        $res->assertStatus(200)
            ->assertJsonPath('data.daily_goal_xp', 50);

        $this->assertDatabaseHas('user_progress', [
            'user_id' => $user->id,
            'daily_goal_xp' => 50,
        ]);
    }

    public function test_update_daily_goal_uses_cache_when_column_missing(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Simulate that the column is missing
        Schema::partialMock();
        Schema::shouldReceive('hasColumn')->with('user_progress', 'daily_goal_xp')->andReturn(false);

        $res = $this->postJson('/api/v1/progress/daily-goal', ['daily_goal_xp' => 40]);
        $res->assertStatus(200)
            ->assertJsonPath('data.daily_goal_xp', 40)
            ->assertJsonPath('data.persisted', false);

        $this->assertSame(40, (int) Cache::get('daily_goal_xp_user_' . $user->id));
    }

    public function test_get_daily_returns_goal_from_db_when_column_exists(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Schema::partialMock();
        Schema::shouldReceive('hasColumn')->with('user_progress', 'daily_goal_xp')->andReturn(true);

        $progress = UserProgress::firstOrCreate(['user_id' => $user->id], ['hearts' => 5, 'points' => 0, 'daily_goal_xp' => 50]);
        $progress->daily_goal_xp = 50;
        $progress->save();

        $res = $this->getJson('/api/v1/progress/daily');
        $res->assertStatus(200)
            ->assertJsonPath('data.daily_goal_xp', 50)
            ->assertJsonStructure([
                'data' => [
                    'quests',
                    'points',
                    'hearts',
                    'date',
                    'daily_goal_xp'
                ]
            ]);
    }

    public function test_get_daily_returns_goal_from_cache_when_column_missing(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Schema::partialMock();
        Schema::shouldReceive('hasColumn')->with('user_progress', 'daily_goal_xp')->andReturn(false);

        Cache::forever('daily_goal_xp_user_' . $user->id, 20);

        $res = $this->getJson('/api/v1/progress/daily');
        $res->assertStatus(200)
            ->assertJsonPath('data.daily_goal_xp', 20);
    }
}
