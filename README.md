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

LogicLingo includes a powerful admin panel built with Filament that allows administrators to:

#### Course Management
- Manage courses, units, lessons, and challenges
- Upload media files for challenges including images and audio
- Control the order of lessons and challenges
- Monitor user progress and subscriptions

#### Challenge Management
- **Drag & Drop Reordering**: Reorder challenges within lessons using intuitive drag-and-drop interface
- **Bulk Actions**: Renumber challenge orders sequentially per lesson
- **Advanced Filtering**: Filter challenges by Course → Unit → Lesson (cascading filters) and by challenge type
- **Search**: Search challenges by question text for quick access

#### Challenge Types & Validations
The admin panel enforces data quality through type-specific validations:

- **Select**: Ensures exactly one option is marked as correct
- **Arrange/Fill-blank**: Requires at least 2 options; correct options must have unique numeric positions
- **Match**: Validates that match pairs contain at least 1 pair with non-empty left/right values; prevents duplicate pairs
- **Listen**: Requires audio source file
- **Speak**: Automatically uses question text as expected answer if meta.expected_text is empty

#### Options Management
- **Auto-numbering**: New options automatically get the next available position number
- **Position Normalization**: Automatically fixes duplicate or missing positions before saving
- **Type-aware Interface**: Position fields only appear for arrange/fill-blank challenges

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
