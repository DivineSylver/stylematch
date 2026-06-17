import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateStyledPosts } from '@/lib/style-engine';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isDemoUser = !user || process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project');

    const body = await req.json();
    const { tweets, topic, creator_handle } = body as {
      tweets?: string[];
      topic?: string;
      creator_handle?: string;
    };

    if (!tweets || !Array.isArray(tweets) || tweets.length === 0 || !topic || !creator_handle) {
      return NextResponse.json({ error: 'Missing tweets, topic, or creator_handle' }, { status: 400 });
    }

    const cleanTweets = tweets
      .map((t) => t.trim())
      .filter((t) => t.length > 3)
      .slice(0, 20);

    if (cleanTweets.length === 0) {
      return NextResponse.json({ error: 'Please paste at least a few real tweets' }, { status: 400 });
    }

    const posts = generateStyledPosts(cleanTweets, topic.trim(), creator_handle.trim());

    try {
      const admin = createAdminClient();
      const now = new Date().toISOString();
      const handle = creator_handle.replace(/^@/, '').toLowerCase();

      if (!isDemoUser && user) {
        await admin.from('study_sessions').insert({
          watcher_id: user.id,
          creator_handle: handle,
          topic: topic.trim(),
          generated_posts: posts,
          created_at: now,
        });

        await admin.from('watcher_log').insert({
          watcher_id: user.id,
          creator_handle: handle,
          timestamp: now,
        });
      }
    } catch {
      // Logging optional when Supabase isn't configured
    }

    return NextResponse.json({ posts });
  } catch (err: any) {
    console.error('Generate API error:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}