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

function isGoogleNewsHost(hostname: string): boolean {
  return /(?:^|\.)google\.[a-z.]+$/i.test(hostname) || /(?:^|\.)googleusercontent\.com$/i.test(hostname);
}

function extractRealArticleUrl(html: string, baseUrl: string): string {
  if (!html) return "";

  const metaRefresh = html.match(/<meta\s+http-equiv=["']?refresh["']?[^>]*content=["'][^"']*url=([^"'>]+)["']/i);
  if (metaRefresh && metaRefresh[1]) {
    try { return new URL(metaRefresh[1].trim(), baseUrl).toString(); } catch (_) { /* ignore */ }
  }

  const dataNAu = html.match(/data-n-au=["']([^"']+)["']/i);
  if (dataNAu && dataNAu[1]) {
    try { return new URL(dataNAu[1], baseUrl).toString(); } catch (_) { /* ignore */ }
  }

  const linkRel = html.match(/<link[^>]+rel=["'](?:canonical|amphtml)["'][^>]+href=["'](https?:\/\/[^"']+)["']/i);
  if (linkRel && linkRel[1]) {
    try {
      const candidate = new URL(linkRel[1]);
      if (!isGoogleNewsHost(candidate.hostname)) return candidate.toString();
    } catch (_) { /* ignore */ }
  }

  const anchorRegex = /<a[^>]+href=["'](https?:\/\/[^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(html)) !== null) {
    try {
      const candidate = new URL(match[1]);
      if (!isGoogleNewsHost(candidate.hostname)) return candidate.toString();
    } catch (_) { /* ignore */ }
  }

  return "";
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

function decodeBase64Url(input: string): Uint8Array | null {
  try {
    let normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4 !== 0) normalized += "=";
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch (_) {
    return null;
  }
}

function decodeGoogleNewsUrl(googleUrl: string): string {
  try {
    const parsed = new URL(googleUrl);
    if (!isGoogleNewsHost(parsed.hostname)) return "";
    const segments = parsed.pathname.split("/");
    const encoded = segments.find((s) => s.startsWith("CBM") || s.startsWith("AU_"));
    if (!encoded) return "";

    const bytes = decodeBase64Url(encoded);
    if (!bytes) return "";

    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const match = text.match(/https?:\/\/[^\x00-\x1f"<>\\^`{|}\s]+/);
    if (!match) return "";

    let url = match[0];
    url = url.replace(/[\x80-\xff].*$/u, "");
    return url;
  } catch (_) {
    return "";
  }
}

async function resolveAndFetchOgImage(link: string): Promise<string> {
  try {
    let candidateUrl = link;
    let candidateHost = "";
    try { candidateHost = new URL(candidateUrl).hostname; } catch (_) { /* ignore */ }

    if (isGoogleNewsHost(candidateHost)) {
      const decoded = decodeGoogleNewsUrl(candidateUrl);
      if (decoded) candidateUrl = decoded;
    }

    const initial = await fetchWithTimeout(candidateUrl, OG_FETCH_TIMEOUT_MS);
    if (!initial.ok) return "";
    let finalUrl = initial.url || candidateUrl;
    let html = await initial.text();

    let finalHost = "";
    try { finalHost = new URL(finalUrl).hostname; } catch (_) { /* ignore */ }

    if (isGoogleNewsHost(finalHost)) {
      const realUrl = extractRealArticleUrl(html, finalUrl);
      if (realUrl) {
        try {
          const second = await fetchWithTimeout(realUrl, OG_FETCH_TIMEOUT_MS);
          if (second.ok) {
            finalUrl = second.url || realUrl;
            html = await second.text();
          }
        } catch (_) { /* ignore, fall through to current html */ }
      }
    }

    return extractMetaImage(html, finalUrl);
  } catch (_) {
    return "";
  }
}

async function enrichWithImages(items: NewsItem[]): Promise<NewsItem[]> {
  return await Promise.all(items.map(async (item) => {
    let resolvedLink = item.link;
    try {
      const host = new URL(item.link).hostname;
      if (isGoogleNewsHost(host)) {
        const decoded = decodeGoogleNewsUrl(item.link);
        if (decoded) resolvedLink = decoded;
      }
    } catch (_) { /* ignore */ }

    const next: NewsItem = resolvedLink !== item.link ? { ...item, link: resolvedLink } : item;
    if (next.imageUrl) return next;
    const imageUrl = await resolveAndFetchOgImage(next.link);
    return imageUrl ? { ...next, imageUrl } : next;
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
