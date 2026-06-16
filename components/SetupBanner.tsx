'use client';

import Link from 'next/link';
import { isDemoMode } from '@/lib/supabase/client';

export default function SetupBanner() {
  if (!isDemoMode) return null;

  return (
    <div className="bg-yellow-900/40 border-b border-yellow-800 text-yellow-200 text-sm">
      <div className="max-w-5xl mx-auto px-6 py-3">
        <div className="font-medium mb-1 flex items-center gap-2">
          Demo mode — no account required
          <span className="text-[10px] px-2 py-0.5 bg-yellow-800 rounded">free for everyone</span>
        </div>
        <div className="text-yellow-300/90 text-xs leading-relaxed">
          Generation works right now. Add <code className="bg-black/40 px-1 rounded">ANTHROPIC_API_KEY</code> for real AI output.
          Optional: add Supabase keys for sign-up and saved history.
        </div>
        <div className="mt-2 text-[11px]">
          <Link href="/dashboard" className="underline hover:text-white">Start generating</Link>
        </div>
      </div>
    </div>
  );
}