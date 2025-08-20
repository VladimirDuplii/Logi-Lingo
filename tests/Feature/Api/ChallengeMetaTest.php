<?php

namespace Tests\Feature\Api;

use App\Models\Challenge;
use App\Models\ChallengeOption;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChallengeMetaTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_includes_meta_field_in_challenges(): void
    {
        // Create a user and authenticate
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
        Sanctum::actingAs($user);

        // Create the full course structure
        $course = Course::create(['title' => 'Test Course']);
        $unit = Unit::create(['course_id' => $course->id, 'title' => 'Test Unit', 'order' => 1]);
        $lesson = Lesson::create(['unit_id' => $unit->id, 'title' => 'Test Lesson', 'order' => 1]);
        
        // Create a challenge with meta data
        $challenge = Challenge::create([
            'lesson_id' => $lesson->id,
            'type' => 'match',
            'question' => 'Match the pairs',
            'order' => 1,
            'meta' => [
                'pairs' => [
                    ['left' => 'A', 'right' => 'Apple'],
                    ['left' => 'B', 'right' => 'Banana']
                ]
            ]
        ]);

        // Create an option with position
        ChallengeOption::create([
            'challenge_id' => $challenge->id,
            'text' => 'Option 1',
            'is_correct' => true,
            'position' => 1
        ]);

        // Make API request
        $response = $this->getJson("/api/v1/courses/{$course->id}/units/{$unit->id}/lessons/{$lesson->id}/questions");

        // Assert the response structure includes meta
        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'text',
                        'type',
                        'order',
                        'image_url',
                        'audio_url',
                        'meta',
                        'options' => [
                            '*' => [
                                'id',
                                'text',
                                'is_correct',
                                'image_url',
                                'audio_url'
                            ]
                        ]
                    ]
                ]
            ]);

        // Assert meta data is included correctly
        $responseData = $response->json('data.0');
        $this->assertEquals('match', $responseData['type']);
        $this->assertArrayHasKey('pairs', $responseData['meta']);
        $this->assertCount(2, $responseData['meta']['pairs']);
        $this->assertEquals('A', $responseData['meta']['pairs'][0]['left']);
        $this->assertEquals('Apple', $responseData['meta']['pairs'][0]['right']);
    }

    public function test_challenge_with_null_meta_returns_null(): void
    {
        // Create a user and authenticate
        $user = User::create([
            'name' => 'Test User 2',
            'email' => 'test2@example.com',
            'password' => bcrypt('password'),
        ]);
        Sanctum::actingAs($user);

        // Create the full course structure
        $course = Course::create(['title' => 'Test Course 2']);
        $unit = Unit::create(['course_id' => $course->id, 'title' => 'Test Unit 2', 'order' => 1]);
        $lesson = Lesson::create(['unit_id' => $unit->id, 'title' => 'Test Lesson 2', 'order' => 1]);
        
        // Create a challenge without meta data
        $challenge = Challenge::create([
            'lesson_id' => $lesson->id,
            'type' => 'select',
            'question' => 'Select the correct answer',
            'order' => 1,
            'meta' => null
        ]);

        // Make API request
        $response = $this->getJson("/api/v1/courses/{$course->id}/units/{$unit->id}/lessons/{$lesson->id}/questions");

        // Assert meta is null for select type
        $response->assertOk();
        $responseData = $response->json('data.0');
        $this->assertEquals('select', $responseData['type']);
        $this->assertNull($responseData['meta']);
    }
}