export type StyleProfile = {
  avgLength: number;
  lengthStyle: 'short' | 'medium' | 'long';
  hookStyles: ('question' | 'claim' | 'contrarian' | 'observation' | 'list' | 'story' | 'imperative')[];
  tone: 'earnest' | 'hype' | 'deadpan' | 'curious';
  lowercase: boolean;
  usesEmphasisCaps: boolean;
  usesQuestions: boolean;
  usesExclamations: boolean;
  usesEllipsis: boolean;
  usesEmDash: boolean;
  usesEmoji: boolean;
  emojiSample: string;
  usesLineBreaks: boolean;
  usesSecondPerson: boolean;
  commonOpeners: string[];
  signatureWords: string[];
};

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'it', 'its',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'my', 'your',
  'his', 'her', 'our', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all',
  'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'don', 'now', 'rt', 'https',
]);

const TOPIC_ANGLES = [
  'starting before you feel ready',
  'doing the unglamorous work daily',
  'building systems instead of chasing motivation',
  'learning in public and iterating fast',
  'cutting noise and focusing on one bet',
  'treating constraints as creative fuel',
  'compounding small wins over months',
  'asking better questions before acting',
  'shipping ugly v1s and improving in the open',
  'studying what actually works, not what sounds smart',
];

function clampTweet(text: string): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= 280) return trimmed;
  const cut = trimmed.slice(0, 277).replace(/\s+\S*$/, '');
  return cut.endsWith('...') ? cut : `${cut}...`;
}

function titleCaseTopic(topic: string): string {
  return topic
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function detectHook(text: string): StyleProfile['hookStyles'][number] {
  const t = text.trim();
  if (t.includes('?')) return 'question';
  if (/^(most|everyone|nobody|never|always|the best|the worst)/i.test(t)) return 'claim';
  if (/^(hot take|unpopular|contrary|actually|wrong)/i.test(t)) return 'contrarian';
  if (/^(here'?s|thread|list|\d+\.|- )/i.test(t)) return 'list';
  if (/^(i |when i|years ago|used to)/i.test(t)) return 'story';
  if (/^(stop|start|don'?t|do |try |build |ship )/i.test(t)) return 'imperative';
  return 'observation';
}

export function analyzeStyle(tweets: string[]): StyleProfile {
  const lengths = tweets.map((t) => t.length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

  const hooks = tweets.map(detectHook);
  const hookCounts = hooks.reduce(
    (acc, h) => {
      acc[h] = (acc[h] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const hookStyles = (Object.entries(hookCounts).sort((a, b) => b[1] - a[1]).map(([k]) => k) as StyleProfile['hookStyles']);

  const allText = tweets.join(' ');
  const lowerRatio = (allText.match(/[a-z]/g)?.length || 0) / Math.max(allText.match(/[a-zA-Z]/g)?.length || 1, 1);
  const hypeWords = (allText.match(/\b(incredible|amazing|insane|huge|massive|game.?changer)\b/gi) || []).length;
  const deadpanWords = (allText.match(/\b(obviously|anyway|fine|sure|whatever)\b/gi) || []).length;

  let tone: StyleProfile['tone'] = 'earnest';
  if (hypeWords >= 2) tone = 'hype';
  else if (deadpanWords >= 2) tone = 'deadpan';
  else if (hooks.filter((h) => h === 'question').length >= Math.ceil(tweets.length / 3)) tone = 'curious';

  const openers = tweets
    .map((t) => t.trim().split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '') || '')
    .filter(Boolean);
  const openerCounts = openers.reduce((acc, w) => {
    acc[w.toLowerCase()] = (acc[w.toLowerCase()] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const commonOpeners = Object.entries(openerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);

  const words = allText
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, '')
    .match(/[a-z']{4,}/g) || [];
  const wordCounts = words.reduce((acc, w) => {
    if (!STOP_WORDS.has(w)) acc[w] = (acc[w] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const signatureWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);

  const emojiMatch = allText.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  const lengthStyle: StyleProfile['lengthStyle'] =
    avgLength < 100 ? 'short' : avgLength < 180 ? 'medium' : 'long';

  return {
    avgLength,
    lengthStyle,
    hookStyles: hookStyles.length ? hookStyles : ['observation', 'claim', 'question'],
    tone,
    lowercase: lowerRatio > 0.85,
    usesEmphasisCaps: /\b[A-Z]{2,}\b/.test(allText),
    usesQuestions: tweets.some((t) => t.includes('?')),
    usesExclamations: tweets.some((t) => t.includes('!')),
    usesEllipsis: tweets.some((t) => t.includes('...')),
    usesEmDash: tweets.some((t) => t.includes('—') || t.includes(' - ')),
    usesEmoji: !!emojiMatch,
    emojiSample: emojiMatch?.[0] || '',
    usesLineBreaks: tweets.some((t) => t.includes('\n')),
    usesSecondPerson: /\byou\b|\byour\b/i.test(allText),
    commonOpeners,
    signatureWords,
  };
}

function applyStyle(text: string, style: StyleProfile, index: number): string {
  let out = text;

  if (style.lowercase) {
    out = out.charAt(0).toLowerCase() + out.slice(1);
  }

  if (style.usesEmphasisCaps) {
    const words = out.split(/\s+/);
    if (words.length > 3) {
      const idx = Math.min(2, words.length - 1);
      words[idx] = words[idx].toUpperCase();
      out = words.join(' ');
    }
  }

  if (style.usesEllipsis && !out.endsWith('?') && !out.endsWith('!') && index % 2 === 0) {
    out = out.replace(/\.$/, '') + '...';
  }

  if (style.usesEmoji && style.emojiSample) {
    out = `${out} ${style.emojiSample}`;
  }

  return clampTweet(out);
}

function pickAngle(index: number): string {
  return TOPIC_ANGLES[index % TOPIC_ANGLES.length];
}

function buildTweet(
  hook: StyleProfile['hookStyles'][number],
  topic: string,
  style: StyleProfile,
  index: number,
  handle: string
): string {
  const t = topic.trim().toLowerCase();
  const T = titleCaseTopic(topic);
  const angle = pickAngle(index);
  const sig = style.signatureWords[index % Math.max(style.signatureWords.length, 1)] || 'work';
  const opener = style.commonOpeners[0] || 'the';

  const templates: Record<typeof hook, string[]> = {
    question: [
      `What if ${t} isn't talent - it's ${angle}?`,
      `Why do so many people talk about ${t} but skip ${angle}?`,
      `Is ${t} actually hard — or are we just avoiding ${angle}?`,
    ],
    claim: [
      `${T} rewards people who commit to ${angle}.`,
      `The best ${t} advice is boring: ${angle}.`,
      `${T} is underrated because everyone wants shortcuts, not ${angle}.`,
    ],
    contrarian: [
      `Hot take: most ${t} advice is noise. ${titleCaseTopic(angle)} wins.`,
      `Everyone wants ${t}. Almost nobody will do ${angle}.`,
      `Unpopular opinion: you don't need more ${t} content. You need ${angle}.`,
    ],
    observation: [
      `The pattern I keep seeing with ${t}: ${angle}.`,
      `${opener.charAt(0).toUpperCase() + opener.slice(1)} thing about ${t} - it compounds when you focus on ${angle}.`,
      `@${handle.replace(/^@/, '')} energy applied to ${t}: ${angle}.`,
    ],
    list: [
      `${T} in 3 moves:\n→ ${angle}\n→ ship one small thing\n→ repeat for 30 days`,
      `How I'd approach ${t} today:\n1) ${angle}\n2) cut distractions\n3) publish the learning`,
    ],
    story: [
      `I ignored ${t} for years. ${titleCaseTopic(angle)} changed how I think about it.`,
      `When I started taking ${t} seriously, the unlock was ${angle}.`,
      `I used to overcomplicate ${t}. Now I just focus on ${angle}.`,
    ],
    imperative: [
      `If you're serious about ${t}, start with ${angle}.`,
      `Stop collecting ${t} tips. Pick one path: ${angle}.`,
      `Build ${t} the unsexy way - ${angle}, every week.`,
    ],
  };

  const options = templates[hook] || templates.observation;
  let text = options[index % options.length];

  if (style.usesSecondPerson && index % 2 === 1 && !text.includes('you')) {
    text = `If you're working on ${t}, remember: ${angle}.`;
  }

  if (style.usesEmDash) {
    text = text.replace(' — ', ' — ').replace('. ', ' — ');
  }

  if (style.lengthStyle === 'short' && text.length > 140) {
    text = `${T}? ${angle}.`;
  }

  if (style.tone === 'hype') {
    text = text.replace(/\.$/, '!').replace('underrated', 'MASSIVELY underrated');
  } else if (style.tone === 'deadpan') {
    text = text.replace(/!+/g, '.').replace(/\?$/, '.');
  }

  if (style.signatureWords.length && index === 0) {
    text = text.replace(angle, `${angle} - ${sig} mindset`);
  }

  return applyStyle(text, style, index);
}

export function generateStyledPosts(
  tweets: string[],
  topic: string,
  creatorHandle: string
): string[] {
  const style = analyzeStyle(tweets);
  const hooks = [...style.hookStyles];

  while (hooks.length < 7) {
    hooks.push('observation', 'claim', 'question', 'imperative', 'contrarian', 'story', 'list');
  }

  const posts = Array.from({ length: 7 }, (_, i) =>
    buildTweet(hooks[i % hooks.length], topic, style, i, creatorHandle)
  );

  return posts.map((p) => clampTweet(p.trim()));
}