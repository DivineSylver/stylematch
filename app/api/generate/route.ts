import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('...');

let anthropic: Anthropic | null = null;
if (hasClaudeKey) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
}

const MODEL = 'claude-sonnet-4-20250514'; // Update to latest Sonnet 4 / 3.5/4-6 as available

const SYSTEM_PROMPT = `You are an expert Twitter voice mimic. The user will provide a list of real tweets from a creator plus a new topic.

Your job:
1. Carefully analyze the source tweets for:
   - Typical hook / opening style (question, bold claim, story, joke, contrarian take, etc.)
   - Average and variance in sentence length
   - Overall tone (sarcastic, deadpan, earnest, hype, nihilistic, curious, etc.)
   - Vocabulary level and signature words/phrases
   - Formatting habits (short paragraphs, line breaks inside tweets, emojis or lack thereof, all-caps for emphasis, numbering, quotes)
   - Pacing and rhythm — how ideas are delivered
   - Use of questions, calls-to-action, or subtle asks

2. Then write EXACTLY 7 brand new tweets on the requested topic that feel like they were written by the same person.

Strict rules:
- Each tweet must be under 280 characters (hard limit).
- Do NOT copy any phrases, sentences or distinctive word combinations from the source tweets. Paraphrase everything.
- Sound natural in the creator's voice — not a caricature.
- Return ONLY a raw JSON array of 7 strings. Example: ["tweet one here", "tweet two here", ...]
- No markdown, no backticks, no explanations, no object keys, no numbering. Just the JSON array.`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // In demo mode or without real auth, we still allow generation (free for all)
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
      .slice(0, 20); // safety

    if (cleanTweets.length === 0) {
      return NextResponse.json({ error: 'Please paste at least a few real tweets' }, { status: 400 });
    }

    let posts: string[] = [];

    try {
      if (!hasClaudeKey || !anthropic) {
        // DEMO / no key: return realistic sample posts (free for everyone)
        posts = [
          "The best way to learn is to ship something small today and iterate in public.",
          "Most people overthink the first version. Start ugly, improve in the open.",
          "If it feels obvious, you're probably on the right track. Obvious ideas win.",
          "Distribution is the new product. Build in public and the audience compounds.",
          "Constraints are features, not bugs. Limited time forces better decisions.",
          "The meta-game is simple: consistent small steps beat occasional genius.",
          "Your network is your second product. Treat every post as an invitation to collaborate."
        ];
      } else {
        // Real Claude call (still free, no points required)
        const userContent = `Here are the source tweets from @${creator_handle.replace(/^@/, '')}:

${cleanTweets.map((t, i) => `${i + 1}. ${t}`).join('\n\n')}

Topic to write about: ${topic}

Generate exactly 7 tweets now.`;

        const response = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 1800,
          temperature: 0.85,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: userContent,
            },
          ],
        });

        const text = response.content
          .filter((block) => block.type === 'text')
          .map((block) => (block as any).text)
          .join('\n')
          .trim();

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('Claude did not return a JSON array');
        }

        posts = JSON.parse(jsonMatch[0]);

        if (!Array.isArray(posts) || posts.length !== 7) {
          throw new Error('Expected exactly 7 posts');
        }

        posts = posts.map((p) => String(p).trim().slice(0, 279)).filter(Boolean);

        if (posts.length !== 7) {
          throw new Error('Invalid number of posts returned');
        }
      }
    } catch (claudeError: any) {
      console.error('Claude error or parse error:', claudeError);
      return NextResponse.json(
        { error: hasClaudeKey ? 'Generation failed. Please try again.' : 'Demo mode: showing sample posts (add ANTHROPIC_API_KEY for real generations).' },
        { status: 500 }
      );
    }

    // Logging (best effort, free for all)
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
    } catch (logErr) {
      // Logging is optional in free mode / demo
      console.log('Logging skipped (demo or no DB):', logErr);
    }

    return NextResponse.json({ posts });
  } catch (err: any) {
    console.error('Generate API error:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
