'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/types';
import { LogOut } from 'lucide-react';

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setUser(data as User);
      }
      setLoading(false);
    }
    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <nav className="border-b border-[#222] bg-[#0a0a0a]/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            StyleMatch
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm">
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/creator" className="nav-link">Creator insights</Link>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {!loading && user && (
            <>
              <div className="text-[#666] hidden sm:block">
                {user.email.split('@')[0]}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-[#888] hover:text-white px-3 py-1.5 rounded-full hover:bg-[#1f2937]"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <Link href="/login" className="nav-link text-sm">Log in</Link>
              <Link href="/signup" className="btn-primary text-sm px-4 py-1.5">Sign up free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}