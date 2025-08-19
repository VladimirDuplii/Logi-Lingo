<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\LeagueTier;
use App\Models\UserLeagueHistory;
use App\Services\LeagueService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends BaseApiController
{
    /**
     * GET /api/v1/leaderboard?scope=week|all&limit=50
     * - week: uses completed challenges this week (10 XP each) as weekly XP
     * - all: uses total points from user_progress
     */
    public function index(Request $request)
    {
        $scope = $request->query('scope', 'week');
        $limit = (int) $request->query('limit', 50);
        $limit = $limit > 0 && $limit <= 200 ? $limit : 50;
        $userId = Auth::id();

        if ($scope === 'all') {
            return $this->allTime($userId, $limit);
        }
        return $this->weekly($userId, $limit);
    }

    protected function weekly(int $userId, int $limit)
    {
        $start = Carbon::now()->startOfWeek();
        $now = Carbon::now();

        $base = DB::table('challenge_progress as cp')
            ->selectRaw('cp.user_id, COUNT(*) * 10 as xp')
            ->where('cp.completed', true)
            ->whereBetween('cp.updated_at', [$start, $now])
            ->groupBy('cp.user_id');

        $top = DB::query()->fromSub($base, 't')
            ->join('users as u', 'u.id', '=', 't.user_id')
            ->leftJoin('user_progress as up', 'up.user_id', '=', 'u.id')
            ->orderByDesc('t.xp')
            ->limit($limit)
            ->get(['t.user_id', 't.xp', 'u.name', 'u.email', 'up.points']);

        // Your weekly xp (may be null => 0)
        $yourXpRow = DB::query()->fromSub($base, 't')->where('t.user_id', $userId)->first();
        $yourXp = (int) ($yourXpRow->xp ?? 0);
        $yourRank = 0;
        if ($yourXp > 0) {
            $higher = DB::query()->fromSub($base, 't')->where('t.xp', '>', $yourXp)->count();
            $yourRank = $higher + 1;
        }

        // Attach position and is_you
        $result = [];
        $pos = 1;
        foreach ($top as $row) {
            $result[] = [
                'user_id' => $row->user_id,
                'name' => $row->name ?? (explode('@', (string)$row->email)[0] ?? 'User'),
                'xp' => (int) $row->xp,
                'points' => (int) ($row->points ?? 0),
                'position' => $pos,
                'is_you' => $row->user_id === $userId,
            ];
            $pos++;
        }

        return $this->sendResponse([
            'scope' => 'week',
            'top' => $result,
            'you' => [
                'user_id' => $userId,
                'xp' => $yourXp,
                'rank' => $yourRank,
            ],
        ], 'Weekly leaderboard');
    }

    protected function allTime(int $userId, int $limit)
    {
        $top = DB::table('user_progress as up')
            ->join('users as u', 'u.id', '=', 'up.user_id')
            ->orderByDesc('up.points')
            ->limit($limit)
            ->get(['up.user_id', 'up.points', 'u.name', 'u.email']);

        $yourPointsRow = DB::table('user_progress')->where('user_id', $userId)->first(['points']);
        $yourPoints = (int) ($yourPointsRow->points ?? 0);
        $yourRank = 0;
        if ($yourPoints > 0) {
            $higher = DB::table('user_progress')->where('points', '>', $yourPoints)->count();
            $yourRank = $higher + 1;
        }

        $result = [];
        $pos = 1;
        foreach ($top as $row) {
            $result[] = [
                'user_id' => $row->user_id,
                'name' => $row->name ?? (explode('@', (string)$row->email)[0] ?? 'User'),
                'xp' => (int) $row->points, // use points as all-time XP
                'points' => (int) $row->points,
                'position' => $pos,
                'is_you' => $row->user_id === $userId,
            ];
            $pos++;
        }

        return $this->sendResponse([
            'scope' => 'all',
            'top' => $result,
            'you' => [
                'user_id' => $userId,
                'xp' => $yourPoints,
                'rank' => $yourRank,
            ],
        ], 'All-time leaderboard');
    }

    /**
     * GET /api/v1/leaderboard/me
     * Returns current league (latest history or default) and last 12 weeks history
     */
    public function me(Request $request)
    {
        $userId = Auth::id();
        LeagueService::ensureDefaultTiers();

        // Latest history for the user
        $latest = UserLeagueHistory::where('user_id', $userId)
            ->orderByDesc('week_start')
            ->first();

        if ($latest) {
            $tier = LeagueTier::find($latest->league_tier_id);
            $current = [
                'tier' => $tier ? [
                    'id' => $tier->id,
                    'name' => $tier->name,
                    'rank' => (int) $tier->rank,
                ] : null,
                'week_start' => $latest->week_start,
                'weekly_xp' => (int) $latest->weekly_xp,
                'result' => $latest->result,
            ];
        } else {
            // Default to lowest tier
            $tier = LeagueTier::orderBy('rank')->first();
            $current = [
                'tier' => $tier ? [
                    'id' => $tier->id,
                    'name' => $tier->name,
                    'rank' => (int) $tier->rank,
                ] : null,
                'week_start' => null,
                'weekly_xp' => 0,
                'result' => null,
            ];
        }

        // This week's XP (live)
        $start = Carbon::now()->startOfWeek();
        $end = Carbon::now()->endOfWeek();
        $thisWeekXp = (int) DB::table('challenge_progress')
            ->where('user_id', $userId)
            ->where('completed', true)
            ->whereBetween('updated_at', [$start, $end])
            ->count() * 10;

        // History (last 12, newest first)
        $hist = UserLeagueHistory::where('user_id', $userId)
            ->orderByDesc('week_start')
            ->limit(12)
            ->get();
        $tierMap = LeagueTier::all()->keyBy('id');
        $history = $hist->map(function ($row) use ($tierMap) {
            $tier = $tierMap->get($row->league_tier_id);
            return [
                'week_start' => $row->week_start,
                'weekly_xp' => (int) $row->weekly_xp,
                'result' => $row->result,
                'tier' => $tier ? [
                    'id' => $tier->id,
                    'name' => $tier->name,
                    'rank' => (int) $tier->rank,
                ] : null,
            ];
        });

        return $this->sendResponse([
            'current' => $current,
            'this_week' => [
                'week_start' => $start->toDateString(),
                'xp' => $thisWeekXp,
            ],
            'history' => $history,
        ], 'Your league info');
    }
}
