import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TolakiCultureDetail } from "@/components/culture/TolakiCultureDetail";
import {
  fallbackTolakiCultureTopics,
  parseCultureSections,
  type TolakiCultureTopic,
} from "@/data/tolakiCulture";
import { createPublicSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type BudayaTolakiDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
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

async function loadTopic(slug: string): Promise<TolakiCultureTopic | null> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("tolaki_culture_topics")
      .select(
        "id,slug,title,category,summary,hero_image_url,sections,is_published,created_at,updated_at",
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return (
        fallbackTolakiCultureTopics.find((topic) => topic.slug === slug) ??
        null
      );
    }

    return normalizeTopic(data as Record<string, unknown>);
  } catch {
    return (
      fallbackTolakiCultureTopics.find((topic) => topic.slug === slug) ?? null
    );
  }
}

export async function generateMetadata({
  params,
}: BudayaTolakiDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = await loadTopic(slug);

  if (!topic) {
    return { title: "Budaya Tolaki" };
  }

  const description =
    topic.summary ||
    `Pelajari ${topic.title}, bagian dari budaya Tolaki kategori ${topic.category}.`;

  return {
    title: topic.title,
    description,
    alternates: {
      canonical: `/budaya-tolaki/${slug}`,
    },
    openGraph: {
      title: `${topic.title} | Budaya Tolaki`,
      description,
      url: `/budaya-tolaki/${slug}`,
      images: topic.hero_image_url
        ? [{ url: topic.hero_image_url, width: 1200, height: 630, alt: topic.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${topic.title} | Budaya Tolaki`,
      description,
      images: topic.hero_image_url ? [topic.hero_image_url] : undefined,
    },
  };
}

export default async function BudayaTolakiDetailPage({
  params,
}: BudayaTolakiDetailPageProps) {
  const { slug } = await params;
  const topic = await loadTopic(slug);

  if (!topic) {
    notFound();
  }

  return <TolakiCultureDetail topic={topic} />;
}
