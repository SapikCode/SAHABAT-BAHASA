import { ArrowLeft, Clock, Film, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  cultureVideos as fallbackCultureVideos,
  getCultureVideoHref,
  getCultureVideoThumbnail,
  type CultureVideo,
  type CultureVideoCategory,
} from "@/data/cultureVideos";
import { createPublicSupabaseClient } from "@/lib/supabase-server";
import { extractYouTubeId } from "@/lib/youtube";

export const dynamic = "force-dynamic";

type CultureVideoDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

async function loadCultureVideos(): Promise<CultureVideo[]> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("culture_videos")
      .select(
        "id,slug,title,description,category,youtube_url,thumbnail_url,duration_label,is_published,created_at",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) =>
      normalizeCultureVideo(row as Record<string, unknown>),
    );
  } catch {
    return fallbackCultureVideos;
  }
}

export default async function CultureVideoDetailPage({
  params,
}: CultureVideoDetailPageProps) {
  const { id } = await params;
  const videos = await loadCultureVideos();
  const video = videos.find((item) => item.id === id);

  if (!video) {
    notFound();
  }

  const recommendations = videos
    .filter((item) => item.id !== video.id)
    .sort((a, b) => {
      if (a.category === video.category && b.category !== video.category) {
        return -1;
      }
      if (a.category !== video.category && b.category === video.category) {
        return 1;
      }
      return 0;
    })
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-white text-[#0a0b0d]">
      <header className="border-b border-[#eef0f3] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#5b616e] transition hover:bg-[#f7f7f7] hover:text-[#0a0b0d]"
            href="/cerita-budaya"
          >
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.4} />
            Cerita Budaya
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#de990e] text-white">
              <Film aria-hidden="true" size={18} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-semibold text-[#de990e]">
              Tonton Materi
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div>
          <div className="overflow-hidden rounded-[28px] border border-[#dee1e6] bg-[#0a0b0d]">
            <div className="aspect-video w-full bg-black">
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                title={video.title}
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#edf6df] px-3 py-1 text-xs font-semibold text-[#4f7f12]">
                {video.category}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e5f0f9] px-3 py-1 text-xs font-semibold text-[#1376ba]">
                <Clock aria-hidden="true" size={13} strokeWidth={2.4} />
                {video.duration}
              </span>
              <span className="rounded-full bg-[#f5ead7] px-3 py-1 text-xs font-semibold text-[#9b6709]">
                {video.level}
              </span>
            </div>

            <h1 className="mt-4 max-w-3xl text-[34px] font-normal leading-tight text-[#0a0b0d] md:text-[48px]">
              {video.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b616e]">
              {video.description}
            </p>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#1376ba]">
                Rekomendasi berikutnya
              </p>
              <h2 className="mt-2 text-3xl font-normal text-[#0a0b0d]">
                Lanjutkan playlist budaya
              </h2>
            </div>
            <Link
              className="hidden h-10 items-center rounded-full bg-[#eef0f3] px-4 text-sm font-semibold text-[#0a0b0d] transition hover:bg-[#f5ead7] md:inline-flex"
              href="/cerita-budaya"
            >
              Semua video
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((item) => (
              <Link
                className="group overflow-hidden rounded-[22px] border border-[#dee1e6] bg-white transition hover:border-[#73a920] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                href={getCultureVideoHref(item)}
                key={item.id}
              >
                <span className="relative block aspect-video bg-[#dee1e6]">
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    src={getCultureVideoThumbnail(item)}
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                    <span className="grid size-12 place-items-center rounded-full bg-white/90 text-[#de990e] transition group-hover:scale-105">
                      <Play
                        aria-hidden="true"
                        fill="currentColor"
                        size={20}
                        strokeWidth={2.2}
                      />
                    </span>
                  </span>
                </span>

                <span className="block p-5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#edf6df] px-3 py-1 text-xs font-semibold text-[#4f7f12]">
                      {item.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#e5f0f9] px-3 py-1 text-xs font-semibold text-[#1376ba]">
                      <Clock aria-hidden="true" size={13} strokeWidth={2.4} />
                      {item.duration}
                    </span>
                  </span>
                  <span className="mt-4 block text-xl font-semibold leading-7 text-[#0a0b0d]">
                    {item.title}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-[#5b616e]">
                    {item.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
