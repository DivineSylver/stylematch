'use client';

import { createBrowserClient } from '@supabase/ssr';

const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project');

export function createClient() {
  if (isDemo) {
    // Demo mode: return a stub client so the UI doesn't crash.
    // Real auth is disabled; we simulate a logged-in user via local state in pages.
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({ data: {}, error: { message: 'Demo mode: use the "Enter Demo Mode" button on the page.' } }),
        signInWithPassword: async () => ({ data: {}, error: { message: 'Demo mode active' } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        insert: async () => ({ error: null }),
        update: async () => ({ error: null }),
      }),
    } as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const isDemoMode = isDemo;
