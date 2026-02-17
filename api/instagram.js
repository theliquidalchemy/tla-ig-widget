export default async function handler(req, res) {
  try {
    const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
    const IG_USER_ID = process.env.IG_USER_ID;

    if (!ACCESS_TOKEN || !IG_USER_ID) {
      return res.status(500).json({ error: "Missing IG_ACCESS_TOKEN or IG_USER_ID" });
    }

    const fields = [
      "id",
      "media_type",
      "media_url",
      "permalink",
      "caption",
      "timestamp",
      "thumbnail_url"
    ].join(",");

    const url =
      `https://graph.facebook.com/v21.0/${IG_USER_ID}/media` +
      `?fields=${encodeURIComponent(fields)}` +
      `&access_token=${encodeURIComponent(ACCESS_TOKEN)}`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({ error: "Instagram API error", details: data });
    }

    const items = (data.data || []).slice(0, 6).map((m) => ({
      id: m.id,
      type: m.media_type,
      url: m.media_url || m.thumbnail_url,
      link: m.permalink,
      caption: m.caption || "",
      timestamp: m.timestamp
    }));

    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
    return res.status(200).json({ items });
  } catch (e) {
    return res.status(500).json({ error: "Server error", message: String(e) });
  }
}
