<?php

namespace App\Services;

use App\Models\LeagueTier;
use App\Models\UserLeagueHistory;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LeagueService
{
    /**
     * Seed default tiers if empty
     */
    public static function ensureDefaultTiers(): void
    {
        if (LeagueTier::count() > 0) return;
        $defaults = [
            ['name' => 'Bronze', 'rank' => 1],
            ['name' => 'Silver', 'rank' => 2],
            ['name' => 'Gold', 'rank' => 3],
            ['name' => 'Sapphire', 'rank' => 4],
            ['name' => 'Ruby', 'rank' => 5],
            ['name' => 'Emerald', 'rank' => 6],
        ];
        foreach ($defaults as $d) LeagueTier::create($d);
    }

    /**
     * Compute weekly XP per user based on completed challenges in the week
     * Returns array of [user_id => xp]
     */
    public static function computeWeeklyXp(Carbon $weekStart, Carbon $weekEnd): array
    {
        $rows = DB::table('challenge_progress')
            ->selectRaw('user_id, COUNT(*) * 10 as xp')
            ->where('completed', true)
            ->whereBetween('updated_at', [$weekStart, $weekEnd])
            ->groupBy('user_id')
            ->get();
        $out = [];
        foreach ($rows as $r) { $out[$r->user_id] = (int) $r->xp; }
        return $out;
    }

    /**
     * Assign leagues with simple thresholds and write history per user
     * Promotion: if top 3 by xp in current tier -> move up (unless already max)
     * Demotion: bottom 3 with xp==0 -> move down (unless already lowest)
     * Others stay. This is a simplified example.
     */
    public static function closeWeekAndAssign(Carbon $weekStart): void
    {
        self::ensureDefaultTiers();
        $start = $weekStart->copy()->startOfWeek();
        $end = $weekStart->copy()->endOfWeek();
        $xpMap = self::computeWeeklyXp($start, $end);

        // Build buckets per tier: for now, everyone without prior history is Bronze
        $tiers = LeagueTier::orderBy('rank')->get();
        $tierById = $tiers->keyBy('id');

        // Determine users in last week histories
        $prev = UserLeagueHistory::where('week_start', $start->copy()->subWeek()->toDateString())->get();
        $userTier = [];
        foreach ($prev as $row) { $userTier[$row->user_id] = $row->league_tier_id; }

        // All active users observed this week
        $userIds = array_keys($xpMap);
        foreach ($userIds as $uid) if (!isset($userTier[$uid])) $userTier[$uid] = $tiers->first()->id;

        // Group users per tier with their xp
        $byTier = [];
        foreach ($userTier as $uid => $tierId) {
            $byTier[$tierId][] = ['user_id' => $uid, 'xp' => $xpMap[$uid] ?? 0];
        }

        foreach ($byTier as $tierId => $list) {
            usort($list, fn($a,$b) => $b['xp'] <=> $a['xp']);
            $promote = array_slice($list, 0, 3);
            $demote = array_values(array_filter(array_slice($list, -3), fn($x) => $x['xp'] <= 0));

            foreach ($list as $entry) {
                $uid = $entry['user_id'];
                $xp = $entry['xp'];
                $result = 'stay';
                $targetTierId = $tierId;
                $currRank = $tierById[$tierId]->rank;
                if (in_array($entry, $promote, true) && $currRank < $tiers->max('rank')) {
                    $result = 'promote';
                    $targetTierId = $tiers->firstWhere('rank', $currRank + 1)->id;
                } elseif (in_array($entry, $demote, true) && $currRank > $tiers->min('rank')) {
                    $result = 'demote';
                    $targetTierId = $tiers->firstWhere('rank', $currRank - 1)->id;
                }

                UserLeagueHistory::updateOrCreate(
                    ['user_id' => $uid, 'week_start' => $start->toDateString()],
                    [
                        'league_tier_id' => $targetTierId,
                        'weekly_xp' => $xp,
                        'result' => $result,
                    ]
                );
            }
        }
    }
}
