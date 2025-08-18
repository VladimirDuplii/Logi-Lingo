<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Course;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Course routes
    Route::get('/courses', function () {
        return Inertia::render('Courses/Index');
    })->name('courses.index');

    Route::get('/courses/{course}', function (Course $course) {
        return Inertia::render('Courses/Show', [
            'course' => $course->load('units.lessons')
        ]);
    })->name('courses.show');

    // Progress routes
    Route::get('/progress', function () {
        return Inertia::render('Progress/Index');
    })->name('progress.index');

    // Settings - Coach (Daily Goal)
    Route::get('/settings/coach', function () {
        return Inertia::render('Settings/Coach');
    })->name('settings.coach');

    // Shop (spend gems)
    Route::get('/shop', function () {
        return Inertia::render('Shop');
    })->name('shop');
});

require __DIR__ . '/auth.php';
