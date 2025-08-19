<?php

namespace App\Console;

use App\Console\Commands\MigrateMediaToPublic;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        MigrateMediaToPublic::class,
    ];

    protected function schedule(Schedule $schedule): void
    {
    // Close leagues weekly: run early Monday morning (00:05)
    $schedule->command('league:close-week')->weeklyOn(1, '00:05');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
        // Register additional commands here if needed
    }
}
