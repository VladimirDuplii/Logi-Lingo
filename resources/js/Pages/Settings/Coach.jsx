import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import DuoLayout from '@/Layouts/DuoLayout';
import RightCourseSidebar from '@/Components/Layout/RightCourseSidebar';
import { ProgressService } from '@/Services';
import { useToast } from '@/Components/Toast';

export default function CoachSettingsPage({ auth }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [value, setValue] = useState(30);
  const options = [10, 20, 30, 40, 50];
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await ProgressService.getDailyQuests();
        const data = res?.data || res;
        if (!mounted) return;
        setSummary(data);
        setValue(Number(data?.daily_goal_xp ?? 30));
      } catch (e) {
        if (mounted) setError('Не вдалося завантажити дані.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const save = async () => {
    const v = Math.max(10, Math.min(200, Number(value) || 30));
    try {
      setSaving(true);
      const res = await ProgressService.updateDailyGoal(v);
      const goal = res?.data?.daily_goal_xp ?? v;
      setValue(goal);
      toast?.success('Щоденна ціль оновлена');
    } catch (e) {
  const msg = e?.response?.data?.message || e?.message || 'Помилка збереження';
  toast?.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const right = (
    <RightCourseSidebar
      course={summary?.active_course || null}
      hearts={summary?.hearts}
      points={summary?.points}
      otherCourses={auth?.user?.courses || []}
    />
  );

  return (
    <DuoLayout right={right} centerMaxClass="xl:max-w-2xl" currentPath="/settings/coach">
      <Head title="Daily Goal" />
      <div className="w-full">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Daily Goal</h1>
          <p className="text-sm text-gray-500">Set how much XP you want to earn each day.</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="animate-pulse">
              <div className="mb-4 h-5 w-40 rounded bg-gray-200" />
              <div className="h-10 w-64 rounded bg-gray-200" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-between text-sm text-red-600">
              <span>{error}</span>
              <button onClick={() => window.location.reload()} className="rounded border px-2 py-1 text-xs text-red-700 hover:bg-red-50">Reload</button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Choose your daily XP goal</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {options.map((opt) => {
                    const selected = Number(value) === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setValue(opt)}
                        className={`rounded-xl border px-4 py-3 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                      >
                        <div className="text-lg font-bold text-gray-900">{opt} XP</div>
                        <div className="text-xs text-gray-500">per day</div>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">You can change this anytime.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className={`rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60`}
                >
                  {saving ? 'Saving...' : 'Save Goal'}
                </button>
                <a href="/courses" className="text-sm text-gray-600 hover:text-gray-800">Cancel</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </DuoLayout>
  );
}
