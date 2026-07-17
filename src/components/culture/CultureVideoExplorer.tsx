"use client";

import { Drawer } from "vaul";
import {
  ArrowLeft,
  Check,
  Clock,
  Film,
  Play,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  cultureVideoCategories,
  cultureVideos,
  getCultureVideoHref,
  getCultureVideoThumbnail,
  type CultureVideoCategory,
} from "@/data/cultureVideos";

const allCategoriesLabel = "Semua";
const categoryOptions = [allCategoriesLabel, ...cultureVideoCategories] as const;

export function CultureVideoExplorer() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    CultureVideoCategory | typeof allCategoriesLabel
  >(allCategoriesLabel);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);

  const filteredVideos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return cultureVideos.filter((video) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        video.title.toLowerCase().includes(normalizedQuery) ||
        video.description.toLowerCase().includes(normalizedQuery) ||
        video.category.toLowerCase().includes(normalizedQuery) ||
        video.learningPoints.some((point) =>
          point.toLowerCase().includes(normalizedQuery),
        );
      const matchesCategory =
        activeCategory === allCategoriesLabel ||
        video.category === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, query]);

  return (
    <main className="min-h-screen bg-white pt-16 text-[#0a0b0d]">
      <header className="fixed left-0 top-0 z-50 w-full border-b border-[#eef0f3] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#5b616e] transition hover:bg-[#f7f7f7] hover:text-[#0a0b0d]"
            href="/"
          >
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.4} />
            Chatbot
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#de990e] text-white">
              <Film aria-hidden="true" size={18} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-semibold text-[#de990e]">
              Cerita Budaya
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div>
          <div>
            <p className="text-sm font-semibold text-[#1376ba]">
              Ruang belajar audio visual
            </p>
            <h1 className="mt-3 max-w-3xl text-[38px] font-normal leading-tight text-[#0a0b0d] md:text-[56px]">
              Cerita dan budaya Tolaki dalam format video.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5b616e]">
              Pilih materi budaya, cerita rakyat, dan pengantar bahasa untuk
              masuk ke halaman tontonan yang lebih fokus.
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
                placeholder="Cari video, kategori, atau poin belajar"
                type="search"
                value={query}
              />
              {query.length > 0 ? (
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

            <div className="hidden gap-2 overflow-x-auto pb-1 md:flex">
              {categoryOptions.map((category) => {
                const isActive = activeCategory === category;

                return (
                  <button
                    className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${
                      isActive
                        ? "bg-[#de990e] text-white"
                        : "bg-[#f7f7f7] text-[#5b616e] hover:bg-[#f5ead7] hover:text-[#0a0b0d]"
                    }`}
                    key={category}
                    onClick={() =>
                      setActiveCategory(
                        category as
                          | CultureVideoCategory
                          | typeof allCategoriesLabel,
                      )
                    }
                    type="button"
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <Drawer.Root
              open={isCategoryDrawerOpen}
              onOpenChange={setIsCategoryDrawerOpen}
            >
              <Drawer.Trigger asChild>
                <button
                  className="flex h-11 items-center justify-between rounded-full border border-[#dee1e6] bg-[#f7f7f7] px-4 text-sm font-semibold text-[#0a0b0d] md:hidden"
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <SlidersHorizontal
                      aria-hidden="true"
                      size={17}
                      strokeWidth={2.4}
                    />
                    Kategori
                  </span>
                  <span className="text-[#de990e]">{activeCategory}</span>
                </button>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-40 bg-black/45" />
                <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] rounded-t-[28px] bg-white px-4 pb-5 pt-3 outline-none">
                  <div className="mx-auto h-1.5 w-12 rounded-full bg-[#dee1e6]" />
                  <div className="mx-auto mt-5 max-w-md">
                    <Drawer.Title className="text-lg font-semibold text-[#0a0b0d]">
                      Pilih kategori
                    </Drawer.Title>
                    <Drawer.Description className="mt-1 text-sm leading-6 text-[#5b616e]">
                      Saring video berdasarkan tema materi budaya.
                    </Drawer.Description>

                    <div className="mt-5 grid max-h-[calc(70vh-132px)] gap-2 overflow-y-auto pr-1">
                      {categoryOptions.map((category) => {
                        const isActive = activeCategory === category;

                        return (
                          <button
                            className={`flex h-12 items-center justify-between rounded-2xl px-4 text-left text-sm font-semibold transition ${
                              isActive
                                ? "bg-[#f5ead7] text-[#0a0b0d]"
                                : "bg-white text-[#5b616e] hover:bg-[#f7f7f7]"
                            }`}
                            key={category}
                            onClick={() => {
                              setActiveCategory(
                                category as
                                  | CultureVideoCategory
                                  | typeof allCategoriesLabel,
                              );
                              setIsCategoryDrawerOpen(false);
                            }}
                            type="button"
                          >
                            {category}
                            {isActive ? (
                              <Check
                                aria-hidden="true"
                                className="text-[#73a920]"
                                size={18}
                                strokeWidth={2.5}
                              />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#5b616e]">
            {filteredVideos.length} materi ditemukan
          </p>
          <p className="hidden text-sm text-[#7c828a] sm:block">
            Klik materi untuk membuka player
          </p>
        </div>

        <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredVideos.map((video) => (
            <Link
              className="group overflow-hidden rounded-[22px] border border-[#dee1e6] bg-white transition hover:border-[#73a920] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
              href={getCultureVideoHref(video)}
              key={video.id}
            >
              <span className="relative block aspect-video bg-[#dee1e6]">
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={getCultureVideoThumbnail(video)}
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
                    {video.category}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e5f0f9] px-3 py-1 text-xs font-semibold text-[#1376ba]">
                    <Clock aria-hidden="true" size={13} strokeWidth={2.4} />
                    {video.duration}
                  </span>
                </span>
                <span className="mt-4 block text-xl font-semibold leading-7 text-[#0a0b0d]">
                  {video.title}
                </span>
                <span className="mt-2 block text-sm leading-6 text-[#5b616e]">
                  {video.description}
                </span>
                <span className="mt-4 flex flex-wrap gap-2">
                  {video.learningPoints.map((point) => (
                    <span
                      className="rounded-full bg-[#f7f7f7] px-3 py-1 text-xs font-semibold text-[#7c828a]"
                      key={point}
                    >
                      {point}
                    </span>
                  ))}
                </span>
              </span>
            </Link>
          ))}
        </section>

        {filteredVideos.length === 0 ? (
          <div className="mt-8 rounded-[24px] border border-[#dee1e6] bg-[#f7f7f7] px-5 py-10 text-center">
            <p className="text-lg font-semibold text-[#0a0b0d]">
              Belum ada video yang cocok.
            </p>
            <p className="mt-2 text-sm text-[#5b616e]">
              Coba kata lain atau pilih filter Semua.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
