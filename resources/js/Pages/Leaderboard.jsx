import React, { useEffect, useMemo, useState } from 'react';
import DuoLayout from '@/Layouts/DuoLayout';
import RightCourseSidebar from '@/Components/Layout/RightCourseSidebar';
import apiClient from '@/Services/ApiService';
import ProgressService from '@/Services/ProgressService';

const ScopeTabs = ({ scope, setScope }) => (
  <div className="mb-4 flex gap-2 rounded-lg bg-gray-100 p-1 text-sm">
    {['week','all'].map(s => (
      <button
        key={s}
        onClick={() => setScope(s)}
        className={`rounded-md px-3 py-1 font-semibold ${scope===s ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
      >
        {s === 'week' ? 'This Week' : 'All Time'}
      </button>
    ))}
  </div>
);

const leagues = [
  { name: 'Bronze', min: 0, color: 'bg-amber-200 text-amber-800', chip: 'bg-amber-100 text-amber-700', emoji: '🥉' },
  { name: 'Silver', min: 100, color: 'bg-gray-200 text-gray-800', chip: 'bg-gray-100 text-gray-700', emoji: '🥈' },
  { name: 'Gold', min: 200, color: 'bg-yellow-200 text-yellow-800', chip: 'bg-yellow-100 text-yellow-700', emoji: '🥇' },
  { name: 'Sapphire', min: 400, color: 'bg-blue-200 text-blue-800', chip: 'bg-blue-100 text-blue-700', emoji: '🔷' },
  { name: 'Ruby', min: 700, color: 'bg-red-200 text-red-800', chip: 'bg-red-100 text-red-700', emoji: '🔴' },
  { name: 'Emerald', min: 1000, color: 'bg-green-200 text-green-800', chip: 'bg-green-100 text-green-700', emoji: '🟢' },
];

const getLeague = (xp) => {
  let curr = leagues[0];
  for (const lg of leagues) {
    if (xp >= lg.min) curr = lg; else break;
  }
  // next threshold
  const idx = leagues.findIndex(l => l.name === curr.name);
  const next = leagues[idx + 1] || null;
  return { ...curr, nextMin: next?.min ?? null, nextName: next?.name ?? null };
};

const Medal = ({ pos }) => {
  const map = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return map[pos] ? (
    <span className="absolute -right-1 -top-1 select-none" title="Top placement">{map[pos]}</span>
  ) : null;
};

const Avatar = ({ name, pos }) => {
  const letter = (name || 'U').charAt(0).toUpperCase();
  return (
    <div className="relative">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600 ring-2 ring-white">
        {letter}
      </div>
      <Medal pos={pos} />
    </div>
  );
};

const Row = ({ pos, name, xp, you, scope }) => {
  const lg = scope === 'week' ? getLeague(xp) : null;
  return (
    <div className={`flex items-center justify-between rounded-xl border p-3 ${you ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700 ring-1 ring-gray-200">
          {pos}
        </div>
        <Avatar name={name} pos={pos} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-800">{name}</div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{you ? 'You' : 'Learner'}</span>
            {lg && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${lg.chip}`}>
                <span aria-hidden>{lg.emoji}</span>
                <span>{lg.name}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-gray-900">{xp} XP</div>
      </div>
    </div>
  );
};

export default function Leaderboard({ auth }) {
  const [scope, setScope] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [top, setTop] = useState([]);
  const [you, setYou] = useState({ xp: 0, rank: 0 });
  const [myLeague, setMyLeague] = useState(null);
  const yourLeague = useMemo(() => {
    if (scope !== 'week') return null;
    // Prefer server-provided tier name when available
    if (myLeague?.current?.tier?.name) {
      const serverTier = myLeague.current.tier.name;
      const fallback = getLeague(you?.xp || 0);
      // match by name if we have a known league
      const found = leagues.find(l => l.name.toLowerCase() === serverTier.toLowerCase());
      return found ? { ...found, nextMin: getLeague(you?.xp || 0).nextMin, nextName: getLeague(you?.xp || 0).nextName } : fallback;
    }
    return getLeague(you?.xp || 0);
  }, [you, scope, myLeague]);

  const load = async (sc) => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get(`/leaderboard?scope=${sc}`);
      const data = res?.data?.data || res?.data || res;
      setTop(Array.isArray(data?.top) ? data.top : []);
      setYou(data?.you || { xp: 0, rank: 0 });
    } catch (e) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(scope); }, [scope]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await ProgressService.getMyLeague?.();
        const data = res?.data?.data || res?.data || res;
        if (mounted) setMyLeague(data || null);
      } catch (e) {
        if (mounted) setMyLeague({ error: true });
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DuoLayout
      right={<RightCourseSidebar course={null} hearts={auth?.user?.hearts} points={auth?.user?.points ?? auth?.user?.xp} otherCourses={auth?.user?.courses || []} />}
      centerMaxClass="xl:max-w-2xl"
    >
      <div className="w-full p-6">
        <h1 className="mb-1 text-2xl font-bold">Leaderboard</h1>
        <p className="mb-4 text-sm text-gray-500">Compete with others and climb the ranks.</p>
        {scope === 'week' && (
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${yourLeague?.color || 'bg-gray-200 text-gray-700'}`}>
                  <span aria-hidden>{yourLeague?.emoji || '🏆'}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Your League</div>
                  <div className="text-xs text-gray-500">{myLeague?.current?.tier?.name || yourLeague?.name || 'Unranked'}</div>
                </div>
              </div>
              <div className="text-right text-sm font-semibold text-gray-800">{myLeague?.this_week?.xp ?? you?.xp ?? 0} XP this week</div>
            </div>
            {myLeague?.error && (
              <div className="mt-2 text-xs text-gray-400">Leagues initializing…</div>
            )}
            {yourLeague?.nextMin != null && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Progress to {yourLeague.nextName}</span>
                  <span>{Math.max(0, yourLeague.nextMin - ((myLeague?.this_week?.xp ?? you?.xp) || 0))} XP left</span>
                </div>
                <div className="mt-1 h-2 w-full rounded bg-gray-200">
                  <div
                    className="h-2 rounded bg-blue-500"
                    style={{ width: `${Math.min(100, Math.round(((((myLeague?.this_week?.xp ?? you?.xp) || 0) - yourLeague.min) / Math.max(1, (yourLeague.nextMin - yourLeague.min))) * 100))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        <ScopeTabs scope={scope} setScope={setScope} />
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => load(scope)} className="rounded border px-2 py-1 text-xs text-red-700 hover:bg-red-100">Retry</button>
          </div>
        ) : (
          <div className="space-y-2">
            {top.length === 0 ? (
              <div className="text-sm text-gray-500">No entries yet.</div>
            ) : (
              top.map(item => (
                <Row key={item.user_id} pos={item.position} name={item.name} xp={item.xp} you={item.is_you} scope={scope} />
              ))
            )}
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
              {scope==='all' ? (
                <>Your all time position: <span className="font-semibold">{you.rank || '-'}</span></>
              ) : (
                <>Your weekly position: <span className="font-semibold">{you.rank || '-'}</span> / <span className="font-semibold">{you.xp} XP</span></>
              )}
            </div>
          </div>
        )}
      </div>
    </DuoLayout>
  );
}
