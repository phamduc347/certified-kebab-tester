import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_QUERY = "Döner News";
const DEFAULT_LIMIT = 6;
const DEFAULT_MAX_AGE_DAYS = 7;
const REQUEST_TIMEOUT_MS = 10000;
const OG_FETCH_TIMEOUT_MS = 5000;

// Well-known German news source → domain mapping for favicon fallback
const SOURCE_DOMAIN_MAP: Record<string, string> = {
  "bild": "bild.de",
  "spiegel": "spiegel.de",
  "spiegel online": "spiegel.de",
  "faz": "faz.net",
  "frankfurter allgemeine": "faz.net",
  "süddeutsche zeitung": "sueddeutsche.de",
  "sz": "sueddeutsche.de",
  "zeit": "zeit.de",
  "zeit online": "zeit.de",
  "die zeit": "zeit.de",
  "welt": "welt.de",
  "die welt": "welt.de",
  "stern": "stern.de",
  "focus": "focus.de",
  "focus online": "focus.de",
  "taz": "taz.de",
  "t-online": "t-online.de",
  "n-tv": "n-tv.de",
  "ntv": "n-tv.de",
  "rtl": "rtl.de",
  "zdf": "zdf.de",
  "ard": "ard.de",
  "tagesschau": "tagesschau.de",
  "berliner zeitung": "berliner-zeitung.de",
  "berliner morgenpost": "morgenpost.de",
  "morgenpost": "morgenpost.de",
  "tagesspiegel": "tagesspiegel.de",
  "handelsblatt": "handelsblatt.de",
  "rnd": "rnd.de",
  "watson": "watson.de",
  "chip": "chip.de",
  "heise": "heise.de",
  "golem": "golem.de",
  "mopo": "mopo.de",
  "hamburger morgenpost": "mopo.de",
  "hamburger abendblatt": "abendblatt.de",
  "abendblatt": "abendblatt.de",
  "ruhr nachrichten": "ruhrnachrichten.de",
  "westfälische nachrichten": "wn.de",
  "merkur": "merkur.de",
  "münchner merkur": "merkur.de",
  "tz": "tz.de",
  "express": "express.de",
  "kölner stadt-anzeiger": "ksta.de",
  "ksta": "ksta.de",
  "rheinische post": "rp-online.de",
  "rp online": "rp-online.de",
  "stuttgarter zeitung": "stuttgarter-zeitung.de",
  "stuttgarter nachrichten": "stuttgarter-nachrichten.de",
  "badische zeitung": "badische-zeitung.de",
  "nordbayern": "nordbayern.de",
  "nürnberger nachrichten": "nordbayern.de",
  "freie presse": "freiepresse.de",
  "mdr": "mdr.de",
  "ndr": "ndr.de",
  "wdr": "wdr.de",
  "br": "br.de",
  "swr": "swr.de",
  "hr": "hr.de",
  "rbb": "rbb24.de",
  "deutschlandfunk": "deutschlandfunk.de",
  "euronews": "euronews.com",
  "dw": "dw.com",
  "deutsche welle": "dw.com",
  "the guardian": "theguardian.com",
  "bbc": "bbc.com",
  "reuters": "reuters.com",
  "ap": "apnews.com",
  "vice": "vice.com",
};

function resolveSourceDomain(source: string): string {
  if (!source) return "";
  const normalized = source.trim().toLowerCase();
  if (SOURCE_DOMAIN_MAP[normalized]) return SOURCE_DOMAIN_MAP[normalized];

  // Try partial match (e.g. "BILD.de" → "bild")
  for (const [key, domain] of Object.entries(SOURCE_DOMAIN_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) return domain;
  }

  // Heuristic: strip common suffixes and try as domain
  const cleaned = normalized.replace(/\s+/g, "").replace(/\.de$|\.com$|\.net$|\.org$/i, "");
  if (cleaned && cleaned !== "googlenews" && cleaned !== "google news") {
    return cleaned + ".de";
  }
  return "";
}

async function fetchWithTimeout(url: string, timeoutMs = REQUEST_TIMEOUT_MS, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...(init || {}),
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
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

  // 1. Meta refresh redirect
  const metaRefresh = html.match(/<meta\s+http-equiv=["']?refresh["']?[^>]*content=["'][^"']*url=([^"'>]+)["']/i);
  if (metaRefresh && metaRefresh[1]) {
    try { return new URL(metaRefresh[1].trim(), baseUrl).toString(); } catch (_) { /* ignore */ }
  }

  // 2. data-n-au attribute (Google News specific)
  const dataNAu = html.match(/data-n-au=["']([^"']+)["']/i);
  if (dataNAu && dataNAu[1]) {
    try { return new URL(dataNAu[1], baseUrl).toString(); } catch (_) { /* ignore */ }
  }

  // 3. jsaction redirect data attribute
  const jsData = html.match(/data-redirect=["']([^"']+)["']/i);
  if (jsData && jsData[1]) {
    try { return new URL(jsData[1], baseUrl).toString(); } catch (_) { /* ignore */ }
  }

  // 4. Canonical or AMP URL
  const linkRel = html.match(/<link[^>]+rel=["'](?:canonical|amphtml)["'][^>]+href=["'](https?:\/\/[^"']+)["']/i);
  if (linkRel && linkRel[1]) {
    try {
      const candidate = new URL(linkRel[1]);
      if (!isGoogleNewsHost(candidate.hostname)) return candidate.toString();
    } catch (_) { /* ignore */ }
  }

  // 5. First non-Google anchor href
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

function isPlaceholderNewsImage(imageUrl: string): boolean {
  if (!imageUrl) return true;
  const raw = String(imageUrl).trim();
  if (!raw) return true;

  const normalized = raw.toLowerCase();
  if (normalized.includes("/s2/favicons")) return true;
  if (normalized.includes("/favicon")) return true;
  if (normalized.includes("apple-touch-icon")) return true;
  if (normalized.includes("googlelogo") || normalized.includes("news_icon")) return true;
  if (normalized.includes("gstatic.com/images/branding")) return true;
  if (normalized.includes("gstatic.com/favicon")) return true;

  // Very small images (1x1 tracking pixels, tiny logos)
  const sizeMatch = normalized.match(/[?&](?:w|width|sz)=(\d+)/);
  if (sizeMatch && parseInt(sizeMatch[1]) < 32) return true;

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    if ((host === "news.google.com" || host.endsWith(".news.google.com")) && path.includes("/favicon")) {
      return true;
    }
  } catch (_) {
    // Ignore parse errors and rely on string heuristics above.
  }

  return false;
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

    // Try all known encoding prefixes
    const encoded = segments.find((s) => s.startsWith("CBM") || s.startsWith("AU_") || s.startsWith("CCA"));
    if (!encoded) return "";

    const bytes = decodeBase64Url(encoded);
    if (!bytes) return "";

    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

    // Extract all URLs from decoded text and pick the first non-Google one
    const urlRegex = /https?:\/\/[^\x00-\x1f"<>\\^`{|}\s]+/g;
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(text)) !== null) {
      let url = match[0].replace(/[\x80-\xff].*$/u, "");
      // Clean trailing junk characters
      url = url.replace(/[)\]}>'"]+$/, "");
      try {
        const candidate = new URL(url);
        if (!isGoogleNewsHost(candidate.hostname)) return url;
      } catch (_) { /* skip invalid URLs */ }
    }

    return "";
  } catch (_) {
    return "";
  }
}

async function resolveAndFetchOgImage(link: string): Promise<string> {
  try {
    let candidateUrl = link;
    let candidateHost = "";
    try { candidateHost = new URL(candidateUrl).hostname; } catch (_) { /* ignore */ }

    // Step 1: Decode Google News redirect URL
    if (isGoogleNewsHost(candidateHost)) {
      const decoded = decodeGoogleNewsUrl(candidateUrl);
      if (decoded) candidateUrl = decoded;
    }

    // Step 2: Fetch the article page
    const initial = await fetchWithTimeout(candidateUrl, OG_FETCH_TIMEOUT_MS);
    if (!initial.ok) return "";
    let finalUrl = initial.url || candidateUrl;
    let html = await initial.text();

    let finalHost = "";
    try { finalHost = new URL(finalUrl).hostname; } catch (_) { /* ignore */ }

    // Step 3: If we're still on Google, extract real URL from the intermediate page
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

    // Step 4: Extract OG image from the final page
    const metaImage = extractMetaImage(html, finalUrl);
    return isPlaceholderNewsImage(metaImage) ? "" : metaImage;
  } catch (_) {
    return "";
  }
}

async function enrichWithImages(items: NewsItem[]): Promise<NewsItem[]> {
  // Process items in parallel with individual error isolation
  const enriched = await Promise.allSettled(items.map(async (item) => {
    let resolvedLink = item.link;
    let resolvedDomain = "";

    // Decode Google News redirect to get the real article URL
    try {
      const host = new URL(item.link).hostname;
      if (isGoogleNewsHost(host)) {
        const decoded = decodeGoogleNewsUrl(item.link);
        if (decoded) {
          resolvedLink = decoded;
          try { resolvedDomain = new URL(decoded).hostname.replace(/^www\./, ""); } catch (_) { /* ignore */ }
        }
      } else {
        resolvedDomain = host.replace(/^www\./, "");
      }
    } catch (_) { /* ignore */ }

    const hasValidImage = !!item.imageUrl && !isPlaceholderNewsImage(item.imageUrl);
    const next: NewsItem = {
      ...item,
      link: resolvedLink,
      // Attach source domain for client-side favicon fallback
      sourceDomain: resolvedDomain || item.sourceDomain || resolveSourceDomain(item.source),
    };
    if (hasValidImage) return next;

    // Try to fetch OG image from the real article
    const imageUrl = await resolveAndFetchOgImage(next.link);
    return imageUrl ? { ...next, imageUrl } : next;
  }));

  return enriched.map((result, i) =>
    result.status === "fulfilled" ? result.value : items[i]
  );
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
  sourceDomain?: string;
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
  if (!xmlText) return [];

  const items: NewsItem[] = [];
  // Match item blocks case-insensitively
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  const extractTagContent = (block: string, tagName: string): string => {
    const regex = new RegExp(`<${tagName}(?:\\s+[^>]*)*>([\\s\\S]*?)<\/${tagName}>`, "i");
    const m = block.match(regex);
    if (m && m[1]) {
      return m[1]
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .trim();
    }
    return "";
  };

  const getAttr = (block: string, tag: string, attr: string): string => {
    const escapedTag = tag.replace(":", "\\:");
    const regex = new RegExp(`<${escapedTag}\\s+[^>]*\\b${attr}=["']([^"']+)["']`, "i");
    const m = block.match(regex);
    return m ? m[1].trim() : "";
  };

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];
    const title = extractTagContent(block, "title");
    const link = extractTagContent(block, "link");
    const source = extractTagContent(block, "source") || "Google News";
    
    let sourceUrl = "";
    const sourceTagMatch = block.match(/<source\s+[^>]*\burl=["']([^"']+)["']/i);
    if (sourceTagMatch && sourceTagMatch[1]) {
      sourceUrl = sourceTagMatch[1].trim();
    }

    const pubDateRaw = extractTagContent(block, "pubDate");
    const pubDateTs = new Date(pubDateRaw).getTime();
    const description = extractTagContent(block, "description");

    const mediaContent = getAttr(block, "media:content", "url") || getAttr(block, "content", "url");
    const mediaThumb = getAttr(block, "media:thumbnail", "url") || getAttr(block, "thumbnail", "url");
    const enclosure = getAttr(block, "enclosure", "url");
    const imageCandidate = mediaContent || mediaThumb || enclosure || extractImageFromHtml(description);
    const imageUrl = isPlaceholderNewsImage(imageCandidate) ? "" : imageCandidate;

    items.push({
      title,
      link,
      source,
      publishedAt: pubDateRaw,
      pubDateTs,
      imageUrl,
      sourceDomain: sourceUrl ? new URL(sourceUrl).hostname.replace(/^www\./, "") : "",
    });
  }

  const filtered = items.filter((entry) => {
    if (!entry.title || !entry.link) return false;
    return isRecent(entry.pubDateTs, maxAgeDays);
  });

  return normalizeAndLimit(filtered.map(({ title, link, source, publishedAt, imageUrl, sourceDomain }) => ({
    title,
    link,
    source,
    publishedAt,
    imageUrl,
    sourceDomain,
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
    const imageCandidate = thumbnail || enclosureLink || extractImageFromHtml(description);
    const imageUrl = isPlaceholderNewsImage(imageCandidate) ? "" : imageCandidate;

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
