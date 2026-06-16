'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient, isDemoMode } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Twitter } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isDemoMode) {
      setError('Supabase is not configured. You can use the app without an account — go to the Dashboard.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1d9bf0] rounded-full flex items-center justify-center">
              <Twitter className="w-5 h-5" />
            </div>
            <span className="text-2xl font-semibold">StyleMatch</span>
          </div>
        </div>

        <div className="tweet-card p-8 rounded-3xl">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Create your account</h1>
          <p className="text-[#9ca3af] mb-6 text-sm">Optional — save your generation history. Everything is free.</p>

          {isDemoMode && (
            <div className="mb-4 p-3 rounded-xl bg-yellow-900/30 border border-yellow-800 text-yellow-200 text-xs">
              No account needed right now. <Link href="/dashboard" className="underline">Use the dashboard</Link> without signing up.
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#666] block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#666] block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            {error && <p className="text-[#f87171] text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? 'Creating account...' : 'Sign up free'}
            </button>
          </form>

          <p className="text-center text-sm text-[#666] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#1d9bf0] hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';