import { createClient } from '@supabase/supabase-js';

function isConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return (
    url.length > 20 &&
    !url.includes('your-project') &&
    key.length > 20 &&
    !key.includes('...')
  );
}

export function createAdminClient() {
  if (!isConfigured()) {
    throw new Error('Supabase not configured');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}