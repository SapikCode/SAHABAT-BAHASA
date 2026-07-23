"use client";

import {
  ArrowLeft,
  ArrowRight,
  Landmark,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import type { TolakiCultureTopic } from "@/data/tolakiCulture";

type CulturesResponse = {
  data: TolakiCultureTopic[];
  source?: "database" | "fallback";
};

export function TolakiCultureExplorer() {
  const [topics, setTopics] = useState<TolakiCultureTopic[]>([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTopics() {
      try {
        const response = await fetch("/api/cultures");
        const payload = (await response.json()) as CulturesResponse;
        setTopics(payload.data ?? []);
      } finally {
        setIsLoading(false);
      }
    }

    loadTopics();
  }, []);

  const categories = useMemo(
    () => ["Semua", ...Array.from(new Set(topics.map((topic) => topic.category)))],
    [topics],
  );

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return topics.filter((topic) => {
      const matchesCategory =
        activeCategory === "Semua" || topic.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        topic.title.toLowerCase().includes(normalizedQuery) ||
        topic.summary.toLowerCase().includes(normalizedQuery) ||
        topic.category.toLowerCase().includes(normalizedQuery) ||
        topic.sections.some(
          (section) =>
            section.title.toLowerCase().includes(normalizedQuery) ||
            section.body.toLowerCase().includes(normalizedQuery),
        );

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, topics]);

  return (
    <main className="min-h-screen bg-white pt-16 text-[#0a0b0d]">
      <header className="fixed left-0 top-0 z-50 w-full border-b border-[#eef0f3] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#5b616e] transition hover:bg-[#f7f7f7] hover:text-[#0a0b0d]"
            href="/"
          >
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.4} />
            Beranda
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#de990e] text-white">
              <Landmark aria-hidden="true" size={18} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-semibold text-[#de990e]">
              Budaya Tolaki
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[#1376ba]">
              Ensiklopedia budaya
            </p>
            <h1 className="mt-3 max-w-3xl text-[38px] font-normal leading-tight text-[#0a0b0d] md:text-[56px]">
              Kenali adat, makanan, pakaian, dan nilai budaya Tolaki.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5b616e]">
              Pilih topik budaya untuk membaca cerita sejarah, makna, atribut,
              dan catatan penting di dalamnya.
            </p>
          </div>

          <div className="rounded-[8px] border border-[#dee1e6] bg-[#f7f7f7] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#4f7f12]">
              <Sparkles aria-hidden="true" size={17} strokeWidth={2.4} />
              Materi awal
            </div>
            <p className="mt-4 text-4xl font-normal text-[#0a0b0d]">
              {topics.length || 3}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5b616e]">
              Adat Istiadat, Makanan Tradisional dan Lainnya
            </p>
          </div>
        </div>

        <div className="sticky top-16 z-20 mt-8 border-y border-[#eef0f3] bg-white/95 py-4 backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            <div className="flex min-h-12 items-center gap-3 rounded-full border border-[#dee1e6] bg-white px-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              <Search
                aria-hidden="true"
                className="shrink-0 text-[#7c828a]"
                size={19}
                strokeWidth={2.2}
              />
              <input
                className="h-12 min-w-0 flex-1 border-0 bg-transparent text-base outline-none placeholder:text-[#7c828a]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari budaya, makanan, pakaian, atau makna"
                type="search"
                value={query}
              />
              {query ? (
                <button
                  aria-label="Bersihkan pencarian"
                  className="grid size-9 place-items-center rounded-full bg-[#eef0f3] text-[#0a0b0d]"
                  onClick={() => setQuery("")}
                  type="button"
                >
                  <X aria-hidden="true" size={16} strokeWidth={2.4} />
                </button>
              ) : null}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => {
                const isActive = activeCategory === category;

                return (
                  <button
                    className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${isActive
                      ? "bg-[#de990e] text-white"
                      : "bg-[#f7f7f7] text-[#5b616e] hover:bg-[#f5ead7] hover:text-[#0a0b0d]"
                      }`}
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    type="button"
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid min-h-64 place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#de990e]" />
          </div>
        ) : (
          <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredTopics.map((topic) => (
              <Link
                className="group flex min-h-[260px] flex-col justify-between rounded-[8px] border border-[#dee1e6] bg-white p-5 transition hover:-translate-y-1 hover:border-[#de990e] hover:shadow-[0_14px_30px_rgba(10,11,13,0.08)]"
                href={`/budaya-tolaki/${topic.slug}`}
                key={topic.id}
              >
                <span>
                  <span className="inline-flex rounded-full bg-[#edf6df] px-3 py-1 text-xs font-semibold text-[#4f7f12]">
                    {topic.category}
                  </span>
                  <span className="mt-4 block text-2xl font-semibold leading-8 text-[#0a0b0d]">
                    {topic.title}
                  </span>
                  <span className="mt-3 line-clamp-3 block text-sm leading-6 text-[#5b616e]">
                    {topic.summary}
                  </span>
                  <span className="mt-4 flex flex-wrap gap-2">
                    {topic.sections.slice(0, 3).map((section) => (
                      <span
                        className="rounded-full bg-[#f7f7f7] px-3 py-1 text-xs font-semibold text-[#7c828a]"
                        key={section.title}
                      >
                        {section.title}
                      </span>
                    ))}
                  </span>
                </span>

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#de990e]">
                  Baca detail
                  <ArrowRight
                    aria-hidden="true"
                    className="transition group-hover:translate-x-1"
                    size={17}
                    strokeWidth={2.5}
                  />
                </span>
              </Link>
            ))}
          </section>
        )}

        {!isLoading && filteredTopics.length === 0 ? (
          <div className="mt-8 rounded-[8px] border border-[#dee1e6] bg-[#f7f7f7] px-5 py-10 text-center">
            <p className="text-lg font-semibold text-[#0a0b0d]">
              Belum ada budaya yang cocok.
            </p>
            <p className="mt-2 text-sm text-[#5b616e]">
              Coba kata lain atau pilih kategori Semua.
            </p>
          </div>
        ) : null}
      </section>
      <Footer />
    </main>
  );
}
