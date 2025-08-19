<?php

namespace App\Console\Commands;

use App\Services\LeagueService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CloseLeagueWeek extends Command
{
    protected $signature = 'league:close-week {--date= : Any date in the target week (YYYY-MM-DD)}';
    protected $description = 'Compute weekly XP, assign leagues and write user league history';

    public function handle(): int
    {
        $date = $this->option('date');
        $when = $date ? Carbon::parse($date) : Carbon::now();
        LeagueService::closeWeekAndAssign($when);
        $this->info('League week closed for week of '.$when->startOfWeek()->toDateString());
        return self::SUCCESS;
    }
}
