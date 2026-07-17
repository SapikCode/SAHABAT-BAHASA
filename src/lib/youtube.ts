export function extractYouTubeId(url: string) {
  const value = url.trim();

  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }

    if (hostname.endsWith("youtube.com")) {
      if (parsed.pathname.startsWith("/watch")) {
        return parsed.searchParams.get("v");
      }

      const embedMatch = parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/);

      if (embedMatch?.[1]) {
        return embedMatch[1];
      }
    }
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
      return value;
    }
  }

  return null;
}

export function getYouTubeThumbnailUrl(url: string) {
  const youtubeId = extractYouTubeId(url);

  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;
}

export function slugifyTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

