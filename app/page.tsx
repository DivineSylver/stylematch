import Link from 'next/link';
import { ArrowRight, Twitter, Zap, Users, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-[#222] bg-[#0a0a0a]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1d9bf0] flex items-center justify-center">
              <Twitter className="w-4 h-4" />
            </div>
            <span className="font-semibold text-xl tracking-tight">StyleMatch</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/creator" className="nav-link">For Creators</Link>
            <Link href="/login" className="nav-link">Log in</Link>
            <Link href="/dashboard" className="btn-primary text-sm px-5 py-2">Start generating</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111] border border-[#222] text-xs mb-6">
          <Zap className="w-3.5 h-3.5 text-[#1d9bf0]" /> 100% free — no account required
        </div>

        <h1 className="text-6xl font-semibold tracking-tighter leading-none mb-6">
          Study how creators<br />write. Generate in<br />their exact voice.
        </h1>
        <p className="text-xl text-[#9ca3af] max-w-md mx-auto mb-10">
          Paste any Twitter creator&apos;s tweets. Get 7 new posts written in their style on any topic.
          Completely free. Unlimited. No payments.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/signup" className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-3">
            Create account
          </Link>
        </div>
        <p className="mt-4 text-xs text-[#666]">No login needed • Unlimited generations • Creator insights included</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="tweet-card p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#1d9bf0]/10 flex items-center justify-center mb-4">
              <Twitter className="w-5 h-5 text-[#1d9bf0]" />
            </div>
            <h3 className="font-semibold text-lg mb-2">1. Study any creator</h3>
            <p className="text-[#9ca3af] text-sm">Paste 5–15 of their tweets + a topic. We analyze hook style, sentence length, tone, vocabulary and formatting.</p>
          </div>
          <div className="tweet-card p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#1d9bf0]/10 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-[#1d9bf0]" />
            </div>
            <h3 className="font-semibold text-lg mb-2">2. Get 7 posts in their voice</h3>
            <p className="text-[#9ca3af] text-sm">Claude generates fresh tweets under 280 characters. Never copies. Completely free and unlimited.</p>
          </div>
          <div className="tweet-card p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#1d9bf0]/10 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-[#1d9bf0]" />
            </div>
            <h3 className="font-semibold text-lg mb-2">3. Creators see the data</h3>
            <p className="text-[#9ca3af] text-sm">Claim your handle and see who has been studying your style — also free, no subscription needed.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#222] bg-[#111]">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="flex justify-center gap-8 text-sm text-[#666] mb-6">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Optional Supabase auth</div>
            <div className="flex items-center gap-2">Claude Sonnet 4</div>
            <div className="flex items-center gap-2">Deploy on Vercel</div>
          </div>
          <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base">
            Open the generator <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <footer className="text-center text-xs text-[#555] py-8">
        StyleMatch — free for everyone.
      </footer>
    </div>
  );
}