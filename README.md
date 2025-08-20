<p align="center">
<img src="https://example.com/logiclingo-logo.png" width="400" alt="LogicLingo Logo">
</p>

<p align="center">
<a href="https://github.com/your-username/LogicLingo/actions"><img src="https://github.com/your-username/LogicLingo/workflows/tests/badge.svg" alt="Build Status"></a>
</p>

# LogicLingo - Interactive Platform for Language Learning

LogicLingo is an interactive web application for language learning, inspired by platforms like Duolingo. It offers engaging exercises, personalized learning paths, and gamification elements to make language learning fun and effective.

## Features

- **Multiple Language Courses**: Learn various languages through structured courses
- **Progressive Learning Path**: Advance through units and lessons at your own pace
- **Interactive Challenges**: Variety of challenge types including multiple choice, writing and listening exercises
- **Points & Hearts System**: Gamification elements to keep users motivated
- **User Progress Tracking**: Track your progress across different languages
- **Subscription Options**: Free tier and premium subscription with additional features

## Tech Stack

- **Backend**: Laravel 12.x
- **Frontend**: React with Inertia.js
- **Styling**: Tailwind CSS
- **Authentication**: Laravel Breeze
- **Admin Panel**: Filament
- **Database**: MySQL
- **Containerization**: Docker

## Project Structure

The project follows standard Laravel architecture with some additional components:

### Database Models

- **User**: Base user account data and authentication
- **Course**: Available language courses
- **Unit**: Organized units within courses
- **Lesson**: Individual lessons within units
- **Challenge**: Different types of learning exercises
- **ChallengeOption**: Options for multiple-choice challenges
- **ChallengeProgress**: User's progress on specific challenges
- **UserProgress**: Overall user progress, including hearts and points
- **UserSubscription**: Premium subscription details

### Admin Panel

The admin panel (Filament) now supports multiple challenge types out of the box:

- Select: Standard multiple choice using options
- Arrange / Fill in the blank: Use options as tiles; mark correct ones and set their order via the new "position" field
- Match: Build pairs directly in the challenge form (stored in `meta.pairs`)
- Listen: Requires audio; use `audio_src`
- Speak: Optional expected phrase in `meta.expected_text`

These enhancements are backward compatible. Existing select questions continue to work. The API now also returns a `meta` field for challenges.

LogicLingo includes a powerful admin panel built with Filament that allows administrators to:

- Manage courses, units, lessons, and challenges
- Create and edit multiple-choice options for challenges
- Upload media files for challenges including images and audio
- Sort and organize content with intuitive interfaces
- Control the order of lessons and challenges
- Monitor user progress and subscriptions

## Setup and Installation

1. Clone this repository
2. Set up Docker containers:
   ```bash
   docker-compose up -d
   ```
3. Install dependencies:
   ```bash
   composer install
   npm install
   ```
4. Run migrations:
   ```bash
   php artisan migrate
   ```
5. Set up admin user:
   ```bash
   php artisan make:filament-user
   ```
6. Start development server:
   ```bash
   php artisan serve
   npm run dev
   ```
7. Access the admin panel at `/admin`

## License

The LogicLingo app is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
