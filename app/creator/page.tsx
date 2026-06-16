'use client';

import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import { createClient, isDemoMode } from '@/lib/supabase/client';
import { User } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';

type Insights = {
  handle: string;
  totalWatchers: number;
  watchers: { id: string; email: string }[];
  mostRecentStudy: string | null;
};

export default function CreatorDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [handle, setHandle] = useState('');
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      if (isDemoMode) {
        setAuthChecked(true);
        return;
      }
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        setUser(data as User);
      }
      setAuthChecked(true);
    }
    init();
  }, []);

  async function loadInsights() {
    if (!handle.trim()) {
      setError('Enter your Twitter handle');
      return;
    }

    if (isDemoMode) {
      setInsights({
        handle: handle.replace(/^@/, '').toLowerCase(),
        totalWatchers: 3,
        watchers: [
          { id: '1', email: 'user1@example.com' },
          { id: '2', email: 'user2@example.com' },
          { id: '3', email: 'user3@example.com' },
        ],
        mostRecentStudy: new Date().toISOString(),
      });
      toast.success('Demo insights loaded');
      return;
    }

    if (!user) {
      setError('Sign in to view creator insights.');
      return;
    }

    setLoading(true);
    setError('');
    setInsights(null);

    try {
      const res = await fetch(`/api/creator/insights?handle=${encodeURIComponent(handle)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load insights');
        return;
      }

      setInsights(data as Insights);
      toast.success(`Loaded insights for @${handle}`);
    } catch {
      setError('Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Nav />
        <div className="max-w-3xl mx-auto px-6 py-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Creator Insights</h1>
        <p className="text-[#9ca3af] mb-8">See who has been studying your writing style — completely free.</p>

        {!user && !isDemoMode && (
          <div className="mb-6 p-4 rounded-2xl bg-[#111] border border-[#222] text-sm text-[#9ca3af]">
            <Link href="/login" className="text-[#1d9bf0] hover:underline">Sign in</Link>
            {' '}to view insights for your handle.
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="yourhandle (without @)"
            className="input flex-1"
          />
          <button
            onClick={loadInsights}
            disabled={loading || !handle.trim()}
            className="btn-secondary whitespace-nowrap"
          >
            {loading ? 'Loading...' : 'View my insights'}
          </button>
        </div>

        {error && <div className="text-sm text-[#f87171] mb-6">{error}</div>}

        {insights && (
          <div className="tweet-card p-8 rounded-3xl">
            <div className="uppercase text-xs tracking-widest text-[#1d9bf0] mb-1">@{insights.handle}</div>

            <div className="text-6xl font-semibold tracking-[-2px] mb-1">{insights.totalWatchers}</div>
            <div className="text-[#9ca3af] mb-6">unique accounts have studied your style</div>

            {insights.mostRecentStudy && (
              <div className="mb-6 text-sm">
                Most recent study: <span className="text-white">{new Date(insights.mostRecentStudy).toLocaleString()}</span>
              </div>
            )}

            <div>
              <div className="text-sm font-medium mb-3">Accounts that studied you</div>
              {insights.watchers.length === 0 ? (
                <p className="text-[#666] text-sm">No one yet — share your handle and let people study your style.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  {insights.watchers.map((w, idx) => (
                    <div key={idx} className="bg-[#0a0a0a] border border-[#222] px-4 py-2 rounded-xl font-mono text-xs">
                      {w.email}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';