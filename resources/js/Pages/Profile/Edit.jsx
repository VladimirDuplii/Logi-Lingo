import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ProgressService from '@/Services/ProgressService';

export default function Edit({ mustVerifyEmail, status }) {
    const [league, setLeague] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await ProgressService.getMyLeague?.();
                const data = res?.data?.data || res?.data || res;
                if (mounted) setLeague(data || null);
            } catch (_) {
                if (mounted) setLeague(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <h3 className="mb-3 text-sm font-bold uppercase text-gray-500">League</h3>
                        {loading ? (
                            <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold text-gray-800">{league?.current?.tier?.name || 'Unranked'}</div>
                                    <div className="text-xs text-gray-500">This week</div>
                                </div>
                                <div className="text-sm font-bold text-gray-900">{league?.this_week?.xp ?? 0} XP</div>
                            </div>
                        )}
                        <a href="/leaderboard" className="mt-3 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700">View leaderboard →</a>
                    </div>
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
