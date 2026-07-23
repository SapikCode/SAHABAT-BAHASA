import { NextResponse } from "next/server";
import {
  cultureVideos as fallbackCultureVideos,
  type CultureVideo,
  type CultureVideoCategory,
} from "@/data/cultureVideos";
import { createPublicSupabaseClient } from "@/lib/supabase-server";
import { extractYouTubeId } from "@/lib/youtube";

function normalizeCultureVideo(row: Record<string, unknown>): CultureVideo {
  const youtubeUrl = String(row.youtube_url ?? "");

  return {
    id: String(row.slug ?? row.id),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    category: (row.category as CultureVideoCategory) ?? "Sejarah",
    duration: String(row.duration_label ?? ""),
    level: "Pemula",
    youtubeId: extractYouTubeId(youtubeUrl) ?? "",
    learningPoints: [],
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  try {
    const supabase = createPublicSupabaseClient();
    let query = supabase
      .from("culture_videos")
      .select(
        "id,slug,title,description,category,youtube_url,thumbnail_url,duration_label,is_published,created_at",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (id) {
      query = query.eq("slug", id).limit(1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const normalized = (data ?? []).map((row) =>
      normalizeCultureVideo(row as Record<string, unknown>),
    );

    return NextResponse.json({
      data: id ? (normalized[0] ?? null) : normalized,
      source: "database",
    });
  } catch {
    return NextResponse.json({
      data: id
        ? (fallbackCultureVideos.find((video) => video.id === id) ?? null)
        : fallbackCultureVideos,
      source: "fallback",
    });
  }
}
