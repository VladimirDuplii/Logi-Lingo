import React, { useEffect, useMemo, useState } from 'react';
import DuoLayout from '@/Layouts/DuoLayout';
import RightCourseSidebar from '@/Components/Layout/RightCourseSidebar';
import apiClient from '@/Services/ApiService';

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

const Row = ({ pos, name, xp, you }) => (
  <div className={`flex items-center justify-between rounded-xl border p-3 ${you ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">{pos}</div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-gray-800">{name}</div>
        <div className="text-xs text-gray-500">{you ? 'You' : 'Learner'}</div>
      </div>
    </div>
    <div className="text-right">
      <div className="text-sm font-bold text-gray-900">{xp} XP</div>
    </div>
  </div>
);

export default function Leaderboard({ auth }) {
  const [scope, setScope] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [top, setTop] = useState([]);
  const [you, setYou] = useState({ xp: 0, rank: 0 });

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

  return (
    <DuoLayout
      right={<RightCourseSidebar course={null} hearts={auth?.user?.hearts} points={auth?.user?.points ?? auth?.user?.xp} otherCourses={auth?.user?.courses || []} />}
      centerMaxClass="xl:max-w-2xl"
    >
      <div className="w-full p-6">
        <h1 className="mb-1 text-2xl font-bold">Leaderboard</h1>
        <p className="mb-4 text-sm text-gray-500">Compete with others and climb the ranks.</p>
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
                <Row key={item.user_id} pos={item.position} name={item.name} xp={item.xp} you={item.is_you} />
              ))
            )}
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
              Your weekly position: <span className="font-semibold">{you.rank || '-'}{scope==='all'?'':' / '}</span>
              {scope==='week' && <span className="font-semibold">{you.xp} XP</span>}
            </div>
          </div>
        )}
      </div>
    </DuoLayout>
  );
}
