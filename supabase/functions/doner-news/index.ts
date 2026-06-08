import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_QUERY = "Döner News";
const DEFAULT_LIMIT = 6;
const DEFAULT_MAX_AGE_DAYS = 7;
const REQUEST_TIMEOUT_MS = 10000;
const OG_FETCH_TIMEOUT_MS = 4000;

async function fetchWithTimeout(url: string, timeoutMs = REQUEST_TIMEOUT_MS, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...(init || {}),
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; certified-kebab-tester-news-fetcher/1.0)",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "de-DE,de;q=0.9,en;q=0.8",
        ...((init?.headers as Record<string, string>) || {}),
      },
      signal: controller.signal,
      redirect: "follow",
    });
  } finally {
    clearTimeout(timer);
  }
}

function extractMetaImage(html: string, baseUrl: string): string {
  if (!html) return "";
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      try {
        return new URL(match[1], baseUrl).toString();
      } catch (_) {
        return match[1];
      }
    }
  }
  return "";
}

async function resolveAndFetchOgImage(link: string): Promise<string> {
  try {
    const response = await fetchWithTimeout(link, OG_FETCH_TIMEOUT_MS);
    if (!response.ok) return "";
    const finalUrl = response.url || link;
    const html = await response.text();
    return extractMetaImage(html, finalUrl);
  } catch (_) {
    return "";
  }
}

async function enrichWithImages(items: NewsItem[]): Promise<NewsItem[]> {
  return await Promise.all(items.map(async (item) => {
    if (item.imageUrl) return item;
    const imageUrl = await resolveAndFetchOgImage(item.link);
    return imageUrl ? { ...item, imageUrl } : item;
  }));
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
  imageUrl?: string;
};

function extractImageFromHtml(html: string): string {
  if (!html) return "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : "";
}

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
    const description = String(item.querySelector("description")?.textContent || "");
    const mediaContent = item.querySelector("media\\:content, content")?.getAttribute("url") || "";
    const mediaThumb = item.querySelector("media\\:thumbnail, thumbnail")?.getAttribute("url") || "";
    const enclosure = item.querySelector("enclosure")?.getAttribute("url") || "";
    const imageUrl = mediaContent || mediaThumb || enclosure || extractImageFromHtml(description);

    return {
      title,
      link,
      source,
      publishedAt: pubDateRaw,
      pubDateTs,
      imageUrl,
    };
  }).filter((entry) => {
    if (!entry.title || !entry.link) return false;
    return isRecent(entry.pubDateTs, maxAgeDays);
  });

  return normalizeAndLimit(entries.map(({ title, link, source, publishedAt, imageUrl }) => ({
    title,
    link,
    source,
    publishedAt,
    imageUrl,
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
    const thumbnail = String(item?.thumbnail || "").trim();
    const enclosureLink = String(item?.enclosure?.link || "").trim();
    const description = String(item?.description || "");
    const imageUrl = thumbnail || enclosureLink || extractImageFromHtml(description);

    return {
      title,
      link,
      source,
      publishedAt: pubDateRaw,
      pubDateTs,
      imageUrl,
    };
  }).filter((entry: any) => {
    if (!entry.title || !entry.link) return false;
    return isRecent(entry.pubDateTs, maxAgeDays);
  });

  return normalizeAndLimit(mapped.map(({ title, link, source, publishedAt, imageUrl }: any) => ({
    title,
    link,
    source,
    publishedAt,
    imageUrl,
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

    if (items.length > 0) {
      items = await enrichWithImages(items);
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
