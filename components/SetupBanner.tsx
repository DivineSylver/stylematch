'use client';

import Link from 'next/link';
import { isDemoMode } from '@/lib/supabase/client';

export default function SetupBanner() {
  if (!isDemoMode) return null;

  return (
    <div className="bg-yellow-900/40 border-b border-yellow-800 text-yellow-200 text-sm">
      <div className="max-w-5xl mx-auto px-6 py-3">
        <div className="font-medium mb-1 flex items-center gap-2">
          Optional setup
          <span className="text-[10px] px-2 py-0.5 bg-yellow-800 rounded">$0 to run</span>
        </div>
        <div className="text-yellow-300/90 text-xs leading-relaxed">
          Generation works with zero config — no API keys, no payments.
          Add Supabase keys only if you want sign-up and saved history.
        </div>
        <div className="mt-2 text-[11px]">
          <Link href="/dashboard" className="underline hover:text-white">Start generating</Link>
        </div>
      </div>
    </div>
  );
}