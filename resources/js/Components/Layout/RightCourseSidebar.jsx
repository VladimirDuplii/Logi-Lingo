import React, { useEffect, useMemo, useState } from 'react';
import { CourseService, ProgressService } from '../../Services';
import { useToast } from '../Toast';

const SectionCard = ({ title, children }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <h3 className="mb-3 text-sm font-bold uppercase text-gray-500">{title}</h3>
    {children}
  </div>
);

const StatRow = ({ label, value, icon }) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <div className="flex items-center gap-2 text-gray-700">
      {icon}
      <span>{label}</span>
    </div>
    <div className="font-semibold text-gray-900">{value}</div>
  </div>
);

export default function RightCourseSidebar({ course, hearts, points, otherCourses = [] }) {
  const toast = useToast();
  const currentId = course?.id;
  const [loading, setLoading] = useState(false);
  const [fetchedCourses, setFetchedCourses] = useState([]);
  // Daily quests state
  const [qLoading, setQLoading] = useState(true);
  const [qError, setQError] = useState('');
  const [quests, setQuests] = useState([]);
  const [dailyMeta, setDailyMeta] = useState({ points, hearts, date: '', daily_goal_xp: 30 });
  // inline editing removed; settings page will handle editing

  // Normalize incoming prop and filter current course
  const initialOthers = useMemo(() => {
    const xs = Array.isArray(otherCourses) ? otherCourses : [];
    return xs.filter((c) => c && c.id !== currentId);
  }, [otherCourses, currentId]);

  useEffect(() => {
    // Load daily quests for the current user
    let mounted = true;
    (async () => {
      try {
        setQLoading(true);
        setQError('');
        const res = await ProgressService.getDailyQuests();
        const data = res?.data || res;
        const list = Array.isArray(data?.quests) ? data.quests : [];
        if (mounted) {
          setQuests(list);
          setDailyMeta({ points: data?.points ?? points, hearts: data?.hearts ?? hearts, date: data?.date || '', daily_goal_xp: data?.daily_goal_xp ?? 30 });
        }
      } catch (e) {
        if (mounted) setQError('Не вдалося завантажити квести.');
      } finally {
        if (mounted) setQLoading(false);
      }
    })();
    return () => { mounted = false; };
  // re-run when course context changes (optional)
  }, [currentId]);

  const refreshQuests = async () => {
    try {
      setQLoading(true);
      setQError('');
      const res = await ProgressService.getDailyQuests();
      const data = res?.data || res;
      setQuests(Array.isArray(data?.quests) ? data.quests : []);
      setDailyMeta({ points: data?.points ?? points, hearts: data?.hearts ?? hearts, date: data?.date || '', daily_goal_xp: data?.daily_goal_xp ?? dailyMeta.daily_goal_xp });
    } catch (e) {
      setQError('Не вдалося оновити квести.');
    } finally {
      setQLoading(false);
    }
  };

  // editing goal moved to Settings page

  // Other Courses loader
  useEffect(() => {
    let mounted = true;
    (async () => {
      // If parent didn't supply courses, fetch a list
      if (initialOthers.length > 0) {
        setFetchedCourses([]);
        return;
      }
      try {
        setLoading(true);
        const res = await CourseService.getCourses();
        // Support multiple API envelope shapes
        const list = Array.isArray(res?.data?.courses)
          ? res.data.courses
          : Array.isArray(res?.courses)
          ? res.courses
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        const filtered = list.filter((c) => c && c.id !== currentId);
        if (mounted) setFetchedCourses(filtered);
      } catch (_) {
        if (mounted) setFetchedCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [initialOthers.length, currentId]);

  const others = initialOthers.length > 0 ? initialOthers : fetchedCourses;
  const xpQuest = useMemo(() => quests.find((q) => q.key === 'xp_30'), [quests]);

  return (
    <aside className="flex w-full flex-col gap-4">
      <SectionCard title="Active Course">
        <div className="mb-2 text-lg font-semibold text-gray-900">{course?.title || 'Active course'}</div>
        <div className="divide-y divide-gray-100">
          <StatRow label="Hearts" value={typeof hearts === 'number' ? hearts : '-'} icon={<span className="text-rose-500">❤</span>} />
          <StatRow label="XP" value={typeof points === 'number' ? points : '-'} icon={<span className="text-yellow-500">★</span>} />
        </div>
      </SectionCard>

      <SectionCard title="Daily Quests">
        {qLoading ? (
          <ul className="space-y-2 animate-pulse">
            {[1,2,3].map((i) => (
              <li key={i} className="rounded-lg border border-gray-100 p-3">
                <div className="mb-2 h-4 w-40 rounded bg-gray-200" />
                <div className="h-2 w-full rounded bg-gray-200" />
                <div className="mt-1 h-3 w-10 rounded bg-gray-200 ml-auto" />
              </li>
            ))}
          </ul>
        ) : qError ? (
          <div className="flex items-center justify-between text-sm text-red-600">
            <span>{qError}</span>
            <button onClick={refreshQuests} className="rounded border px-2 py-1 text-xs text-red-700 hover:bg-red-50">Спробувати знову</button>
          </div>
        ) : quests.length === 0 ? (
          <div className="text-sm text-gray-500">No quests for today.</div>
        ) : (
          <>
            <ul className="space-y-2">
              {quests.map((q) => {
                const progress = Number(q.progress || 0);
                const total = Math.max(1, Number(q.total || 0));
                const pct = Math.min(100, Math.round((progress / total) * 100));
                const done = !!q.completed;
                return (
                  <li key={q.key} className={`rounded-lg border p-3 ${done ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-800">{q.title}</div>
                      {done && <span className="text-xs font-semibold text-green-600">✓</span>}
                    </div>
                    <div className="h-2 w-full rounded bg-gray-200">
                      <div className={`h-2 rounded ${done ? 'bg-green-600' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1 text-right text-xs text-gray-500">{progress}/{total}</div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
              <span>Сьогодні: {dailyMeta?.date || ''}</span>
              <button onClick={refreshQuests} className="rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">Оновити</button>
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="Daily Goal">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-gray-700">Earn {dailyMeta?.daily_goal_xp || 30} XP today</div>
          <a href="/settings/coach" className="text-xs text-blue-600 hover:text-blue-700">Edit Goal</a>
        </div>
        <div className="mt-2 h-2 w-full rounded bg-gray-200">
          {qLoading ? (
            <div className="h-2 w-1/3 rounded bg-blue-200 animate-pulse" />
          ) : (
            <div
              className="h-2 rounded bg-blue-500"
              style={{ width: `${Math.min(100, Math.round(((xpQuest?.progress || 0) / Math.max(1, dailyMeta?.daily_goal_xp || xpQuest?.total || 30)) * 100))}%` }}
            />
          )}
        </div>
        <div className="mt-1 text-xs text-gray-500">{xpQuest?.progress || 0}/{dailyMeta?.daily_goal_xp || xpQuest?.total || 30} XP</div>
      </SectionCard>

      <SectionCard title="Other Courses">
        {loading ? (
          <ul className="space-y-2 animate-pulse">
            {[1,2,3].map((i) => (
              <li key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-gray-200" />
                  <div className="h-4 w-40 rounded bg-gray-200" />
                </div>
                <div className="h-4 w-12 rounded bg-gray-200" />
              </li>
            ))}
          </ul>
        ) : others.length === 0 ? (
          <div className="text-sm text-gray-500">No other courses</div>
        ) : (
          <ul className="space-y-2">
            {others.slice(0, 6).map((c) => (
              <li key={c.id}>
                <a
                  href={`/courses/${c.id}`}
                  className="group flex items-center justify-between rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {c.image_url ? (
                      <img
                        src={c.image_url}
                        alt={c.title}
                        className="h-8 w-8 rounded-md object-cover ring-1 ring-gray-200"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\'><rect width=\'100%\' height=\'100%\' fill=\'%23e5e7eb\'/></svg>'; }}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-sm font-semibold text-gray-500 ring-1 ring-gray-200">
                        {c.title?.charAt(0) || 'C'}
                      </div>
                    )}
                    <span className="truncate text-sm font-medium text-gray-800">{c.title}</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700">Open →</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </aside>
  );
}
