import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Free for all — no subscription check needed anymore.

  const url = new URL(req.url);
  let handle = (url.searchParams.get('handle') || '').replace(/^@/, '').toLowerCase().trim();

  if (!handle) {
    return NextResponse.json({ error: 'handle is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Total unique watchers
  const { data: logs, error } = await admin
    .from('watcher_log')
    .select('watcher_id, timestamp')
    .eq('creator_handle', handle)
    .order('timestamp', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to query logs' }, { status: 500 });
  }

  const uniqueWatchers = new Set((logs || []).map((l) => l.watcher_id));
  const total = uniqueWatchers.size;

  // Get user details for the watchers (email)
  let watchers: any[] = [];
  if (total > 0) {
    const { data: watcherUsers } = await admin
      .from('users')
      .select('id, email, created_at')
      .in('id', Array.from(uniqueWatchers));

    watchers = (watcherUsers || []).map((u) => ({
      id: u.id,
      email: u.email,
      // For MVP we show full email. You can mask here if you want (e.g. u***@g***.com)
    }));
  }

  const mostRecent = logs && logs.length > 0 ? logs[0].timestamp : null;

  return NextResponse.json({
    handle,
    totalWatchers: total,
    watchers,
    mostRecentStudy: mostRecent,
  });
}
