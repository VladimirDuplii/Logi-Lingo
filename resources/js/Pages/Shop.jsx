import React, { useState } from 'react';
import DuoLayout from '../Layouts/DuoLayout';
import ProgressService from '../Services/ProgressService';
import { useToast } from '../Components/Toast';

export default function Shop() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const onRefillWithGems = async () => {
    try {
      setLoading(true);
      await ProgressService.refillHeartsWithGems();
      toast.success('Hearts refilled');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to refill';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DuoLayout rightSidebarEnabled>
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-6 text-2xl font-bold">Shop</h1>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Refill Hearts</div>
              <div className="text-sm text-gray-500">Spend 5 💎 to refill to full</div>
            </div>
            <button
              onClick={onRefillWithGems}
              disabled={loading}
              className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Processing…' : 'Buy (5💎)'}
            </button>
          </div>
        </div>
      </div>
    </DuoLayout>
  );
}
