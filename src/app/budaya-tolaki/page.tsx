import type { Metadata } from "next";
import { TolakiCultureExplorer } from "@/components/culture/TolakiCultureExplorer";
import {
  fallbackTolakiCultureTopics,
  parseCultureSections,
  type TolakiCultureTopic,
} from "@/data/tolakiCulture";
import { createPublicSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Budaya Tolaki: Adat, Makanan, Pakaian, dan Nilai Budaya",
  description:
    "Ensiklopedia budaya Tolaki: adat istiadat, makanan tradisional, pakaian adat, sejarah, dan nilai budaya masyarakat Tolaki.",
  alternates: {
    canonical: "/budaya-tolaki",
  },
  openGraph: {
    title: "Budaya Tolaki | Chatbot Tolaki",
    description:
      "Ensiklopedia budaya Tolaki: adat istiadat, makanan tradisional, pakaian adat, sejarah, dan nilai budaya masyarakat Tolaki.",
    url: "/budaya-tolaki",
  },
};

function normalizeTopic(row: Record<string, unknown>): TolakiCultureTopic {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title ?? ""),
    category: String(row.category ?? ""),
    summary: String(row.summary ?? ""),
    hero_image_url: (row.hero_image_url as string | null) ?? null,
    sections: parseCultureSections(row.sections),
    is_published: Boolean(row.is_published),
  };
}

async function loadTopics(): Promise<TolakiCultureTopic[]> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("tolaki_culture_topics")
      .select(
        "id,slug,title,category,summary,hero_image_url,sections,is_published,created_at",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) =>
      normalizeTopic(row as Record<string, unknown>),
    );
  } catch {
    return fallbackTolakiCultureTopics;
  }
}

export default async function BudayaTolakiPage() {
  const topics = await loadTopics();

  return <TolakiCultureExplorer initialTopics={topics} />;
}
