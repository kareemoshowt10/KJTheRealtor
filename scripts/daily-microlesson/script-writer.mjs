// Turns one ranked source item into a script + visual brief.
// buildPrompt/parseModelJSON/assemble/renderMarkdown are pure and covered by
// verify.mjs. requestScript is the only piece that needs ANTHROPIC_API_KEY.

const BRAND_VOICE = `
Voice rules (non-negotiable — this is Kareem Jamal, REALTOR, Rodeo Realty, West San Fernando Valley + Simi Valley):
- Straight talk, coach energy: explain the play, never sell the ticket.
- Second person ("you need a target," not "one needs").
- Numbers over adjectives, and every number carries its source and month/date from the item below. Never invent a figure that isn't in the source material.
- Banned words: stunning, dream home, don't miss out, act now, hot market, unbelievable, luxury (unless literal).
- No filler opens ("In today's market...", "As a realtor, I..."). Start on the claim.
- At most 1 exclamation point, usually 0.
- The viewer is the hero. Kareem is the one who did the math.
- Must teach something concrete in 5-10 seconds — if it doesn't teach, it doesn't ship.
`.trim();

const BRAND_TOKENS = `
Brand tokens for the visual brief: Navy #0B1E3E, Gold #C9A84C (reserve for the one number worth remembering), Warm White #FAF8F3, White #FFFFFF, Black #111111. Display font Fraunces (300-500 weight, never all-caps). Utility font Inter. Footer: Kareem Jamal · REALTOR® · Rodeo Realty · DRE #01998956.
`.trim();

export function buildPrompt({ item, category, date }) {
  return `You are drafting ONE short-form video script for a real estate education brand. Return ONLY valid JSON, no markdown fences, matching exactly this shape:

{
  "hook": "1-2 second line, spoken and on-screen",
  "lesson": "3-6 second line, one clear insight or action, cite the number/source inline",
  "cta": "1-2 second line, simple next step",
  "onScreenText": "the single stat or phrase to display big on screen",
  "visualStyle": "e.g. bold text animation / aerial footage / clean infographic / talking head",
  "colorPalette": "e.g. navy + gold for authority",
  "voiceoverTone": "e.g. confident, urgent, calm and authoritative",
  "backgroundVisual": "e.g. luxury home exterior / city skyline / mortgage document close-up",
  "toolRecommendation": "one of: Midjourney, DALL-E, Runway ML, HeyGen, CapCut"
}

${BRAND_VOICE}

${BRAND_TOKENS}

Today is ${date}. Today's rotation slot: "${category.label}" — audience: ${category.audience}.

Source material (the ONLY facts you may cite — do not add numbers that aren't here):
Title: ${item.title}
Source: ${item.source}
Date: ${item.date || "undated"}
URL: ${item.url}
Snippet: ${item.snippet || "(none)"}

If the source material doesn't actually contain a citable number, write the lesson as an actionable tip or mindset point instead of inventing a stat.`;
}

/** Strips accidental code fences and parses the model's JSON reply. */
export function parseModelJSON(text) {
  const cleaned = text.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  const required = ["hook", "lesson", "cta", "onScreenText", "visualStyle", "colorPalette", "voiceoverTone", "backgroundVisual", "toolRecommendation"];
  for (const key of required) {
    if (!parsed[key] || typeof parsed[key] !== "string") throw new Error(`Model response missing "${key}"`);
  }
  return parsed;
}

/** Combines the model's script with the source item into the final packet (Step 5 format). */
export function assemble({ modelOutput, item, category, contentType, date }) {
  return {
    contentDate: date,
    category: category.label,
    targetAudience: category.audience,
    platform: ["TikTok", "Instagram Reels", "YouTube Shorts"],
    contentType,
    script: { hook: modelOutput.hook, lesson: modelOutput.lesson, cta: modelOutput.cta },
    visualStyle: modelOutput.visualStyle,
    colorPalette: modelOutput.colorPalette,
    onScreenText: modelOutput.onScreenText,
    voiceoverTone: modelOutput.voiceoverTone,
    backgroundVisual: modelOutput.backgroundVisual,
    toolRecommendation: modelOutput.toolRecommendation,
    source: { title: item.title, url: item.url, date: item.date, feed: item.source, score: item.score },
  };
}

/** Renders the packet in the exact visual-brief block format from the spec, plus a source line. */
export function renderMarkdown(p) {
  return `CONTENT DATE: ${p.contentDate}
CATEGORY: ${p.category}
TARGET AUDIENCE: ${p.targetAudience}
PLATFORM: ${p.platform.join(" | ")}

SCRIPT (5-10 sec):
[Hook] ${p.script.hook}
[Lesson] ${p.script.lesson}
[CTA] ${p.script.cta}

VISUAL STYLE: ${p.visualStyle}
COLOR PALETTE: ${p.colorPalette}
ON-SCREEN TEXT: ${p.onScreenText}
VOICEOVER TONE: ${p.voiceoverTone}
BACKGROUND VISUAL: ${p.backgroundVisual}
TOOL RECOMMENDATION: ${p.toolRecommendation}

CONTENT TYPE: ${p.contentType}
SOURCE: ${p.source.title} — ${p.source.feed}, ${p.source.date || "undated"} (${p.source.url})
`;
}

/** The only impure function here: one Anthropic Messages API call. */
export async function requestScript({ item, category, date, apiKey, model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001" }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      messages: [{ role: "user", content: buildPrompt({ item, category, date }) }],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Anthropic API returned no text content");
  return parseModelJSON(text);
}
