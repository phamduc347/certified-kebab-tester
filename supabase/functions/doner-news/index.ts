import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_QUERY = "Döner News";
const DEFAULT_LIMIT = 6;
const DEFAULT_MAX_AGE_DAYS = 7;
const REQUEST_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: {
        "user-agent": "certified-kebab-tester-news-fetcher/1.0",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isRecent(pubDateTs: number, maxAgeDays: number): boolean {
  if (!Number.isFinite(pubDateTs)) return false;
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  return Date.now() - pubDateTs <= maxAgeMs;
}

type NewsItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
};

function normalizeAndLimit(items: NewsItem[], limit: number): NewsItem[] {
  return items
    .filter((item) => item.title && item.link && item.publishedAt)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

function parseGoogleRss(xmlText: string, maxAgeDays: number): NewsItem[] {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  if (xml.querySelector("parsererror")) {
    throw new Error("rss-parse-failed");
  }

  const entries = Array.from(xml.querySelectorAll("item")).map((item) => {
    const title = String(item.querySelector("title")?.textContent || "").trim();
    const link = String(item.querySelector("link")?.textContent || "").trim();
    const source = String(item.querySelector("source")?.textContent || "Google News").trim();
    const pubDateRaw = String(item.querySelector("pubDate")?.textContent || "").trim();
    const pubDateTs = new Date(pubDateRaw).getTime();

    return {
      title,
      link,
      source,
      publishedAt: pubDateRaw,
      pubDateTs,
    };
  }).filter((entry) => {
    if (!entry.title || !entry.link) return false;
    return isRecent(entry.pubDateTs, maxAgeDays);
  });

  return normalizeAndLimit(entries.map(({ title, link, source, publishedAt }) => ({
    title,
    link,
    source,
    publishedAt,
  })), DEFAULT_LIMIT);
}

function parseRss2Json(payload: any, maxAgeDays: number, limit: number): NewsItem[] {
  const entries = Array.isArray(payload?.items) ? payload.items : [];
  const mapped = entries.map((item: any) => {
    const title = String(item?.title || "").trim();
    const link = String(item?.link || "").trim();
    const source = String(item?.source || "Google News").trim();
    const pubDateRaw = String(item?.pubDate || "").trim();
    const pubDateTs = new Date(pubDateRaw).getTime();

    return {
      title,
      link,
      source,
      publishedAt: pubDateRaw,
      pubDateTs,
    };
  }).filter((entry: any) => {
    if (!entry.title || !entry.link) return false;
    return isRecent(entry.pubDateTs, maxAgeDays);
  });

  return normalizeAndLimit(mapped.map(({ title, link, source, publishedAt }: any) => ({
    title,
    link,
    source,
    publishedAt,
  })), limit);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const query = String(body?.query || DEFAULT_QUERY).trim() || DEFAULT_QUERY;
    const maxAgeDays = clamp(Number(body?.maxAgeDays || DEFAULT_MAX_AGE_DAYS), 1, 14);
    const limit = clamp(Number(body?.limit || DEFAULT_LIMIT), 1, 10);

    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:${maxAgeDays}d`)}&hl=de&gl=DE&ceid=DE:de`;
    const candidates = [
      { url: rssUrl, type: "xml" },
      { url: `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`, type: "json" },
    ] as const;

    let items: NewsItem[] = [];

    for (const candidate of candidates) {
      try {
        const response = await fetchWithTimeout(candidate.url);
        if (!response.ok) continue;

        if (candidate.type === "xml") {
          const xmlText = await response.text();
          if (!xmlText || !xmlText.includes("<rss")) continue;
          items = parseGoogleRss(xmlText, maxAgeDays).slice(0, limit);
        } else {
          const payload = await response.json();
          items = parseRss2Json(payload, maxAgeDays, limit);
        }

        if (items.length > 0) break;
      } catch (_err) {
        // Try the next source.
      }
    }

    return new Response(JSON.stringify({
      query,
      maxAgeDays,
      items,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : "unknown-error",
      items: [],
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
