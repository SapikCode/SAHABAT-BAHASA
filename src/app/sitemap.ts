import type { MetadataRoute } from "next";
import { createPublicSupabaseClient } from "@/lib/supabase-server";

const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getCultureSlugs(): Promise<string[]> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("tolaki_culture_topics")
      .select("slug")
      .eq("is_published", true);

    if (error || !data) {
      return [];
    }

    return data.map((row) => row.slug as string);
  } catch {
    return [];
  }
}

async function getCultureVideoSlugs(): Promise<string[]> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("culture_videos")
      .select("slug")
      .eq("is_published", true);

    if (error || !data) {
      return [];
    }

    return data.map((row) => row.slug as string);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cultureSlugs, videoSlugs] = await Promise.all([
    getCultureSlugs(),
    getCultureVideoSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${appUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${appUrl}/chatbot`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/kosakata`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${appUrl}/ungkapan`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/budaya-tolaki`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${appUrl}/cerita-budaya`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/kuis`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const cultureRoutes: MetadataRoute.Sitemap = cultureSlugs.map((slug) => ({
    url: `${appUrl}/budaya-tolaki/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const videoRoutes: MetadataRoute.Sitemap = videoSlugs.map((slug) => ({
    url: `${appUrl}/cerita-budaya/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...cultureRoutes, ...videoRoutes];
}
