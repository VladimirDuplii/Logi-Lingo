# Logi‑Lingo — Local Development Setup

Follow this guide to run the project on your local machine.

## 1) Prerequisites
- PHP 8.1+ (with extensions: OpenSSL, PDO, Mbstring, Tokenizer, JSON, Ctype, BCMath, Fileinfo)
- Composer 2.x
- Node.js 18+ and npm 9+
- MySQL 8+ (or MariaDB 10.6+) and a database user
- Git

Optional:
- Postman or similar REST client (for testing APIs)

## 2) Clone the repository
```bash
git clone https://github.com/VladimirDuplii/Logi-Lingo.git
cd Logi-Lingo
```

## 3) Environment configuration
Copy the example env and generate app key:
```bash
cp .env.example .env
php artisan key:generate
```
Update .env with your local settings, at minimum:
```env
APP_NAME="Logi Lingo"
APP_ENV=local
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=logi_lingo
DB_USERNAME=root
DB_PASSWORD=secret

FILESYSTEM_DISK=public
```

## 4) Install dependencies
```bash
composer install
npm install
```

## 5) Storage symlink
Laravel needs a symlink for public files (images/audio uploaded via Filament):
```bash
php artisan storage:link
```

## 6) Migrate and seed the database
Create the database in MySQL, then run:
```bash
php artisan migrate --seed
```
This seeds initial courses/lessons/challenges (see database/seeders/) including logic challenges.

## 7) Run the application
Start the backend server:
```bash
php artisan serve
```
Start the frontend/Vite dev server in another terminal:
```bash
npm run dev
```

## 8) Accessing the app
- API base: http://127.0.0.1:8000
- Filament admin: http://127.0.0.1:8000/admin

Authentication:
- Register a user via API (see tests/Manual_API_Testing_Steps.md) or your app's UI.
- Then log in and access protected endpoints with the Bearer token.
- If your Filament install prompts for admin login, use your user credentials. If you don't have a user yet, create one via the API and try again.

## 9) API usage and testing
- API endpoints overview: docs/api-documentation.md
- Manual API testing: tests/Manual_API_Testing_Steps.md
- Postman testing guides: tests/Postman_Testing_Guide.md and tests/Postman_Instructions.md
- API testing plan: tests/API_Testing_Plan.md

## 10) Troubleshooting
- 401 Unauthorized: See tests/Fixing_401_Errors.md, ensure Authorization: Bearer <token>, correct APP_URL, and Sanctum config.
- CORS issues: Check config/sanctum.php for stateful domains configuration. For local dev, ensure your frontend domain is included.
- Missing files/images: Ensure `php artisan storage:link` and FILESYSTEM_DISK=public.
- Database errors: Confirm DB credentials and that the database exists.

## 11) Useful commands
```bash
# Rerun only database migrations
php artisan migrate:fresh --seed

# Cache clear (if configs/views are cached)
php artisan optimize:clear

# Create a user via Filament command (if available)
php artisan make:filament-user
```

Happy hacking!