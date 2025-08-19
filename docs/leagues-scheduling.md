# Leagues: Weekly Scheduling

This app assigns promotions/demotions weekly based on each user’s weekly XP.

## Artisan command
- Close the week and assign leagues:
  - Run now: `php artisan league:close-week`
  - Close a specific week: `php artisan league:close-week --date=2025-08-18`

## Laravel Scheduler
We schedule the command to run every Monday at 00:05 (server time) in `app/Console/Kernel.php`:

- `$schedule->command('league:close-week')->weeklyOn(1, '00:05');`

To make this run, you must run Laravel’s scheduler every minute.

### Linux (cron)
1. Edit crontab:
   - `* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1`

### Windows (Task Scheduler)
1. Create a Basic Task (run every 1 minute):
   - Program/script: `php`
   - Add arguments: `artisan schedule:run`
   - Start in: `V:\project\LogiсLingo`

2. Ensure the task runs even if the user is not logged in.

## Notes
- Migrations must be applied (`league_tiers`, `user_league_histories`).
- The endpoint `/api/v1/leaderboard/me` uses live weekly XP and latest history.
- You can reseed tiers with `LeagueService::ensureDefaultTiers()` (called automatically).
