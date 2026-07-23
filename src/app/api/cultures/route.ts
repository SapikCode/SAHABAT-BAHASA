import { NextResponse } from "next/server";
import {
  fallbackTolakiCultureTopics,
  parseCultureSections,
  type TolakiCultureTopic,
} from "@/data/tolakiCulture";
import { createPublicSupabaseClient } from "@/lib/supabase-server";

function normalizeTopic(row: Record<string, unknown>): TolakiCultureTopic {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    category: String(row.category),
    summary: String(row.summary ?? ""),
    hero_image_url:
      typeof row.hero_image_url === "string" ? row.hero_image_url : null,
    sections: parseCultureSections(row.sections),
    is_published: Boolean(row.is_published),
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();

  try {
    const supabase = createPublicSupabaseClient();
    let query = supabase
      .from("tolaki_culture_topics")
      .select(
        "id,slug,title,category,summary,hero_image_url,sections,is_published,created_at,updated_at",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (slug) {
      query = query.eq("slug", slug).limit(1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const normalized = (data ?? []).map((row) =>
      normalizeTopic(row as Record<string, unknown>),
    );

    return NextResponse.json({
      data: slug ? (normalized[0] ?? null) : normalized,
      source: "database",
    });
  } catch {
    const published = fallbackTolakiCultureTopics.filter(
      (topic) => topic.is_published,
    );

    return NextResponse.json({
      data: slug
        ? (published.find((topic) => topic.slug === slug) ?? null)
        : published,
      source: "fallback",
    });
  }
}
