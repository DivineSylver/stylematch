'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient, isDemoMode } from '@/lib/supabase/client';
import { StudySession, User } from '@/lib/types';
import Nav from '@/components/Nav';
import { Copy, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type GeneratedResult = {
  posts: string[];
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const [tweetsText, setTweetsText] = useState('');
  const [creatorHandle, setCreatorHandle] = useState('');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeneratedResult | null>(null);

  const supabase = createClient();

  async function loadData() {
    if (isDemoMode) {
      setUser(null);
      setSessions([]);
      setLoading(false);
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setUser(null);
      setSessions([]);
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    setUser(userData as User);

    const { data: sess } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('watcher_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(8);

    setSessions((sess as StudySession[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleGenerate() {
    setError('');
    setResult(null);

    const tweets = tweetsText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (tweets.length < 3) {
      setError('Paste at least 3-5 tweets from the creator (one per line).');
      return;
    }
    if (!creatorHandle.trim() || !topic.trim()) {
      setError('Please enter the creator handle and a topic.');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tweets,
          topic: topic.trim(),
          creator_handle: creatorHandle.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Generation failed');
        toast.error(data.error || 'Generation failed');
        return;
      }

      setResult({ posts: data.posts });
      toast.success('7 posts generated in their style!');

      if (user) {
        await loadData();
      }
    } catch {
      setError('Network error. Try again.');
      toast.error('Network error');
    } finally {
      setIsGenerating(false);
    }
  }

  function copyPost(post: string) {
    navigator.clipboard.writeText(post);
    toast.success('Copied to clipboard');
  }

  function copyAll() {
    if (!result) return;
    const text = result.posts.map((p, i) => `${i + 1}. ${p}`).join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('All 7 posts copied');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Nav />
        <div className="max-w-4xl mx-auto p-6">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-[#9ca3af]">Generate posts in any creator&apos;s voice. Free and unlimited.</p>
          </div>
          <div className="text-xs text-[#1d9bf0] px-3 py-1 bg-[#1d9bf0]/10 rounded-full">
            Free for everyone
          </div>
        </div>

        {!user && !isDemoMode && (
          <div className="mb-6 p-4 rounded-2xl bg-[#111] border border-[#222] text-sm text-[#9ca3af]">
            No account needed to generate.{' '}
            <Link href="/signup" className="text-[#1d9bf0] hover:underline">Sign up</Link>
            {' '}to save your generation history.
          </div>
        )}

        <div className="tweet-card p-6 md:p-8 rounded-3xl mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#1d9bf0]" />
            <h2 className="font-semibold text-xl">Generate in a creator&apos;s style</h2>
            {isDemoMode && <span className="ml-auto text-[10px] bg-yellow-900 text-yellow-300 px-2 py-0.5 rounded">DEMO</span>}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs uppercase tracking-[1px] text-[#888] mb-1.5">Creator handle</label>
              <input
                value={creatorHandle}
                onChange={(e) => setCreatorHandle(e.target.value)}
                placeholder="@naval or naval"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[1px] text-[#888] mb-1.5">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="building in public, AI agents, first principles..."
                className="input"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs uppercase tracking-[1px] text-[#888] mb-1.5">
              Paste their tweets (one per line, 5–15 recommended)
            </label>
            <textarea
              value={tweetsText}
              onChange={(e) => setTweetsText(e.target.value)}
              className="textarea font-mono text-sm"
              placeholder={`The best founders I know are obsessed with...
Problems are opportunities in disguise.
Most advice is cope for not shipping.`}
            />
            <p className="text-[10px] text-[#666] mt-1">Raw tweets are only used for this generation — not stored unless you&apos;re signed in.</p>
          </div>

          {error && (
            <div className="mb-4 text-sm bg-red-950/40 border border-red-900 text-red-400 px-4 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              'Generate 7 posts — free'
            )}
          </button>
        </div>

        {result && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Your {result.posts.length} generated posts</div>
              <button onClick={copyAll} className="text-xs flex items-center gap-1 text-[#1d9bf0]">
                <Copy className="w-3.5 h-3.5" /> Copy all
              </button>
            </div>
            <div className="space-y-3">
              {result.posts.map((post, idx) => (
                <div key={idx} className="generated-post group relative">
                  {post}
                  <button
                    onClick={() => copyPost(post)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[#666] hover:text-white p-1.5 rounded bg-[#1a1a1a]"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {user && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              Recent generations <span className="text-xs text-[#555]">({sessions.length})</span>
            </h3>

            {sessions.length === 0 && (
              <p className="text-sm text-[#666]">No saved generations yet.</p>
            )}

            <div className="space-y-4">
              {sessions.map((s) => (
                <div key={s.id} className="tweet-card p-5 rounded-2xl">
                  <div className="flex justify-between text-xs text-[#888] mb-3">
                    <div>
                      <span className="text-white font-medium">@{s.creator_handle}</span> • {s.topic}
                    </div>
                    <div>{new Date(s.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="grid gap-2 text-sm">
                    {(s.generated_posts || []).slice(0, 3).map((p, i) => (
                      <div key={i} className="text-[#ccc] line-clamp-2">{p}</div>
                    ))}
                  </div>
                  <div className="text-[10px] text-[#555] mt-2">{s.generated_posts?.length || 0} posts generated</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';