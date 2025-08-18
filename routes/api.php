<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\ProgressController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Публічні маршрути
Route::prefix('v1')->group(function () {
    // Автентифікація
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    
    // Маршрути, що потребують автентифікації
    Route::middleware('auth:sanctum')->group(function () {
        // Автентифікація - вихід і профіль
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        
        // Курси
        Route::get('/courses', [CourseController::class, 'index']);
        Route::get('/courses/{id}', [CourseController::class, 'show']);
        Route::post('/courses/{id}/active', [CourseController::class, 'setActive']);
    Route::get('/courses/{courseId}/units/{unitId}/lessons', [CourseController::class, 'lessons']);
    Route::get('/courses/{courseId}/units/{unitId}/lessons/{lessonId}/questions', [CourseController::class, 'questions']);
        
        // Прогрес
        Route::get('/progress', [ProgressController::class, 'getUserProgress']);
    Route::get('/progress/daily', [ProgressController::class, 'getDaily']);
    Route::post('/progress/daily-goal', [ProgressController::class, 'updateDailyGoal']);
        Route::get('/progress/courses/{courseId}', [ProgressController::class, 'getCourseProgress']);
        Route::post('/progress/challenges/{challengeId}', [ProgressController::class, 'updateChallengeProgress']);
    Route::post('/progress/lessons/{lessonId}/complete', [ProgressController::class, 'completeLesson']);
        Route::post('/progress/hearts/reduce/{challengeId}', [ProgressController::class, 'reduceHearts']);
        Route::post('/progress/hearts/refill', [ProgressController::class, 'refillHearts']);
    });
});
