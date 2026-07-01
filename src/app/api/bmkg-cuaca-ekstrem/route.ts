import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ── Types ──────────────────────────────────────────────────────────────
interface NowcastAlert {
  id: string;
  headline: string;
  event: string;
  severity: string;
  urgency: string;
  certainty: string;
  effective: string;
  expires: string;
  description: string;
  areaDesc: string;
  infografis: string | null;
  detailUrl: string;
}

// ── XML helpers (no external dependency) ──────────────────────────────
function extractTag(xml: string, tag: string): string {
  // Handles both <tag>value</tag> and namespaced variants
  const regex = new RegExp(`<(?:[\\w]+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:[\\w]+:)?${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

function extractAllItems(rssXml: string): Array<{ title: string; link: string; description: string; pubDate: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(rssXml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTag(block, "title"),
      link: extractTag(block, "link"),
      description: extractTag(block, "description"),
      pubDate: extractTag(block, "pubDate"),
    });
  }
  return items;
}

function extractAlertIdFromUrl(url: string): string {
  // e.g. https://www.bmkg.go.id/alerts/nowcast/id/CKR20260701002_alert.xml → CKR20260701002
  const match = url.match(/\/([A-Z0-9]+)_alert\.xml/i);
  return match ? match[1] : url;
}

// ── Parse a single CAP XML into structured alert ─────────────────────
function parseCapXml(xml: string, detailUrl: string): NowcastAlert | null {
  try {
    const info = xml.match(/<info>([\s\S]*?)<\/info>/i)?.[1] || xml;

    const headline = extractTag(info, "headline");
    const event = extractTag(info, "event");
    const severity = extractTag(info, "severity");
    const urgency = extractTag(info, "urgency");
    const certainty = extractTag(info, "certainty");
    const effective = extractTag(info, "effective");
    const expires = extractTag(info, "expires");
    const description = extractTag(info, "description");
    const areaDesc = extractTag(info, "areaDesc");
    const web = extractTag(info, "web") || null;

    if (!headline && !event) return null;

    return {
      id: extractAlertIdFromUrl(detailUrl),
      headline,
      event,
      severity,
      urgency,
      certainty,
      effective,
      expires,
      description,
      areaDesc,
      infografis: web,
      detailUrl,
    };
  } catch {
    return null;
  }
}

// ── Mock fallback when BMKG is unreachable ────────────────────────────
const MOCK_ALERTS: NowcastAlert[] = [
  {
    id: "MOCK001",
    headline: "Hujan Lebat disertai Petir di Jawa Barat",
    event: "Hujan Lebat dan Petir",
    severity: "Moderate",
    urgency: "Immediate",
    certainty: "Observed",
    effective: new Date(Date.now() - 30 * 60_000).toISOString(),
    expires: new Date(Date.now() + 120 * 60_000).toISOString(),
    description:
      "Hujan lebat disertai petir akan terjadi di sebagian wilayah Jawa Barat. Kondisi ini berpotensi menimbulkan dampak berupa jarak pandang berkurang, angin kencang, dan banjir lokal. Masyarakat dihimbau untuk tetap waspada.",
    areaDesc: "Jawa Barat",
    infografis: null,
    detailUrl: "#",
  },
  {
    id: "MOCK002",
    headline: "Angin Kencang di Sulawesi Selatan",
    event: "Angin Kencang",
    severity: "Severe",
    urgency: "Expected",
    certainty: "Likely",
    effective: new Date(Date.now() - 60 * 60_000).toISOString(),
    expires: new Date(Date.now() + 90 * 60_000).toISOString(),
    description:
      "Angin kencang dengan kecepatan 40-60 km/jam diperkirakan terjadi di pesisir Sulawesi Selatan. Hindari aktivitas di laut dan wilayah terbuka.",
    areaDesc: "Sulawesi Selatan",
    infografis: null,
    detailUrl: "#",
  },
];

// ── Main handler ─────────────────────────────────────────────────────
export async function GET() {
  try {
    // 1. Fetch the RSS feed
    const rssRes = await fetch("https://www.bmkg.go.id/alerts/nowcast/id", {
      next: { revalidate: 60 },
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    });

    if (!rssRes.ok) throw new Error(`RSS feed returned ${rssRes.status}`);

    const rssText = await rssRes.text();
    const items = extractAllItems(rssText);

    if (items.length === 0) {
      // No active warnings — return empty with success
      return NextResponse.json({
        success: true,
        source: "BMKG Nowcasting CAP Alert",
        lastUpdate: new Date().toISOString(),
        alerts: [],
      });
    }

    // 2. Fetch detail CAP XML for each item (max 10 to respect rate limits)
    const detailPromises = items.slice(0, 10).map(async (item) => {
      try {
        const capRes = await fetch(item.link, { next: { revalidate: 60 } });
        if (!capRes.ok) return null;
        const capText = await capRes.text();
        return parseCapXml(capText, item.link);
      } catch {
        // If individual CAP fetch fails, construct from RSS item data
        return {
          id: extractAlertIdFromUrl(item.link),
          headline: item.title,
          event: item.title.split(" di ")[0] || item.title,
          severity: "Unknown",
          urgency: "Unknown",
          certainty: "Unknown",
          effective: new Date(item.pubDate).toISOString(),
          expires: "",
          description: item.description,
          areaDesc: item.title.split(" di ").pop() || "",
          infografis: null,
          detailUrl: item.link,
        } as NowcastAlert;
      }
    });

    const rawAlerts = await Promise.all(detailPromises);

    // 3. Filter: non-null and not yet expired
    const now = new Date();
    const activeAlerts = rawAlerts.filter((a): a is NowcastAlert => {
      if (!a) return false;
      if (a.expires) {
        const expiresDate = new Date(a.expires);
        if (!isNaN(expiresDate.getTime()) && expiresDate < now) return false;
      }
      return true;
    });

    return NextResponse.json({
      success: true,
      source: "BMKG Nowcasting CAP Alert",
      lastUpdate: new Date().toISOString(),
      alerts: activeAlerts,
    });
  } catch (error: any) {
    console.warn("BMKG Nowcast fetch failed, using mock fallback:", error.message);
    return NextResponse.json({
      success: true,
      source: "Offline Fallback",
      lastUpdate: new Date().toISOString(),
      alerts: MOCK_ALERTS,
    });
  }
}
