<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\Fluent\AssertableJson;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthAndCoursesTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_login_and_get_courses(): void
    {
        // Register
        $register = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $register->assertCreated();

        // Login
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $login->assertOk()
            ->assertJson(fn(AssertableJson $json) => $json
                ->where('success', true)
                ->has('data.access_token')
                ->etc()
            );

        $token = $login->json('data.access_token');
        $this->assertNotEmpty($token);

        // Access protected endpoint with Bearer token
        $courses = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/courses');

        $courses->assertOk();
    }

    public function test_courses_requires_auth(): void
    {
        $this->getJson('/api/v1/courses')->assertUnauthorized();
    }
}
