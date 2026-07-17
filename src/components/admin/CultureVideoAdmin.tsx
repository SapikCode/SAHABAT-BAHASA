"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Loader2,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cultureVideoCategories } from "@/data/cultureVideos";
import { useScrollLock } from "@/hooks/useScrollLock";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { getYouTubeThumbnailUrl, slugifyTitle } from "@/lib/youtube";

type CultureVideoRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  youtube_url: string | null;
  thumbnail_url: string | null;
  duration_label: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type CultureVideoResponse = {
  data: CultureVideoRow[];
  page: number;
  pageSize: number;
  total: number;
};

type FormState = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  youtube_url: string;
  thumbnail_url: string;
  duration_label: string;
  is_published: boolean;
};

const categoryOptions = ["Semua", ...cultureVideoCategories];

const emptyForm: FormState = {
  slug: "",
  title: "",
  description: "",
  category: "Cerita Rakyat",
  youtube_url: "",
  thumbnail_url: "",
  duration_label: "",
  is_published: true,
};

export function CultureVideoAdmin() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [rows, setRows] = useState<CultureVideoRow[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  useScrollLock(Boolean(form));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadCultureVideos();
  }, [debouncedSearch, category, page]);

  async function getAccessToken() {
    if (!supabase) {
      throw new Error("Konfigurasi Supabase belum lengkap.");
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      throw new Error("Sesi admin habis. Silakan login ulang.");
    }

    return token;
  }

  async function loadCultureVideos() {
    setIsLoading(true);

    try {
      const token = await getAccessToken();
      const params = new URLSearchParams({
        page: String(page),
        category,
      });

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const response = await fetch(`/api/admin/culture-videos?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await response.json()) as
        | CultureVideoResponse
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in payload ? payload.message : "Gagal memuat video budaya.",
        );
      }

      const data = payload as CultureVideoResponse;
      setRows(data.data);
      setTotal(data.total);
      setPageSize(data.pageSize);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memuat video budaya.";
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateFormTitle(title: string) {
    if (!form) {
      return;
    }

    setForm({
      ...form,
      title,
      slug: form.id || form.slug ? form.slug : slugifyTitle(title),
    });
  }

  function updateFormYoutubeUrl(youtubeUrl: string) {
    if (!form) {
      return;
    }

    setForm({
      ...form,
      youtube_url: youtubeUrl,
      thumbnail_url: form.thumbnail_url || getYouTubeThumbnailUrl(youtubeUrl) || "",
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) {
      return;
    }

    setIsSaving(true);

    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/culture-videos", {
        method: form.id ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as
        | { data: CultureVideoRow }
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in payload ? payload.message : "Gagal menyimpan video.",
        );
      }

      showSuccessToast(form.id ? "Video diperbarui." : "Video ditambahkan.");
      setForm(null);
      await loadCultureVideos();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menyimpan video.";
      showErrorToast(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(row: CultureVideoRow) {
    const confirmed = window.confirm(`Hapus video "${row.title}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(row.id);

    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/admin/culture-videos?id=${row.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Gagal menghapus video.");
      }

      showSuccessToast("Video dihapus.");
      await loadCultureVideos();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus video.";
      showErrorToast(message);
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const previewThumbnail =
    form?.thumbnail_url || getYouTubeThumbnailUrl(form?.youtube_url ?? "") || "";

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-[28px] border border-[#efe6d7] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#de990e]">
            Cerita Budaya
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#141414]">
            Kelola video pembelajaran
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6659]">
            Input materi video dari klien lewat URL YouTube, kategori,
            deskripsi, dan status publikasi.
          </p>
        </div>

        <button
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#de990e] px-5 text-sm font-bold text-white transition hover:bg-[#bd7d08]"
          onClick={() => setForm(emptyForm)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah video
        </button>
      </section>

      <section className="rounded-[28px] border border-[#efe6d7] bg-white p-4 shadow-sm">
        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-center">
          <div className="flex h-11 min-w-0 items-center gap-3 rounded-full border border-[#eadfcd] px-4 transition focus-within:border-[#de990e] focus-within:ring-4 focus-within:ring-[#de990e]/10">
            <Search className="h-4 w-4 shrink-0 text-[#8d8170]" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari judul, deskripsi, kategori, atau URL..."
              value={search}
            />
          </div>

          <select
            className="h-11 rounded-full border border-[#eadfcd] bg-white px-4 text-sm font-bold text-[#4a4338] outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            value={category}
          >
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <p className="text-sm font-semibold text-[#6f6659]">
            {total.toLocaleString("id-ID")} video
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#efe6d7]">
          <div className="hidden grid-cols-[220px_1fr_160px_130px] gap-3 border-b border-[#efe6d7] bg-[#f7f3ea] px-4 py-3 text-xs font-black uppercase tracking-[0.06em] text-[#6f6659] lg:grid">
            <span>Video</span>
            <span>Detail</span>
            <span>Kategori</span>
            <span>Aksi</span>
          </div>

          {isLoading ? (
            <div className="grid min-h-48 place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#de990e]" />
            </div>
          ) : rows.length ? (
            <div className="divide-y divide-[#efe6d7]">
              {rows.map((row) => (
                <article
                  className="grid gap-4 px-4 py-4 lg:grid-cols-[220px_1fr_160px_130px] lg:items-center"
                  key={row.id}
                >
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#f1f1f1]">
                    {row.thumbnail_url ? (
                      <img
                        alt=""
                        className="h-full w-full object-cover"
                        src={row.thumbnail_url}
                      />
                    ) : null}
                    <span className="absolute inset-0 grid place-items-center bg-black/15">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#de990e]">
                        <Play className="h-4 w-4" fill="currentColor" />
                      </span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black leading-6 text-[#141414]">
                      {row.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6f6659]">
                      {row.description ?? "-"}
                    </p>
                    <p className="mt-2 truncate text-xs font-semibold text-[#8d8170]">
                      {row.youtube_url}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#fff3dc] px-3 py-1 text-xs font-bold text-[#a66d07]">
                      {row.category}
                    </span>
                    {row.duration_label ? (
                      <span className="rounded-full bg-[#eef6fb] px-3 py-1 text-xs font-bold text-[#1376ba]">
                        {row.duration_label}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 lg:justify-end">
                    {row.is_published ? (
                      <span className="inline-flex h-9 items-center gap-1 rounded-full bg-[#73a920]/10 px-3 text-xs font-bold text-[#4f7c12]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex h-9 items-center rounded-full bg-[#f1f1f1] px-3 text-xs font-bold text-[#777]">
                        Draft
                      </span>
                    )}
                    <button
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#eadfcd] text-[#4a4338] transition hover:border-[#de990e] hover:text-[#de990e]"
                      onClick={() =>
                        setForm({
                          id: row.id,
                          slug: row.slug,
                          title: row.title,
                          description: row.description ?? "",
                          category: row.category,
                          youtube_url: row.youtube_url ?? "",
                          thumbnail_url: row.thumbnail_url ?? "",
                          duration_label: row.duration_label ?? "",
                          is_published: row.is_published,
                        })
                      }
                      type="button"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#eadfcd] text-[#9a3f2f] transition hover:border-[#9a3f2f] disabled:opacity-50"
                      disabled={deletingId === row.id}
                      onClick={() => handleDelete(row)}
                      type="button"
                    >
                      {deletingId === row.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="font-bold text-[#141414]">Belum ada video.</p>
              <p className="mt-2 text-sm text-[#6f6659]">
                Tambahkan URL YouTube dari materi klien.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[#6f6659]">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              className="h-10 rounded-full border border-[#eadfcd] px-4 text-sm font-bold text-[#4a4338] disabled:opacity-50"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
              type="button"
            >
              Sebelumnya
            </button>
            <button
              className="h-10 rounded-full border border-[#eadfcd] px-4 text-sm font-bold text-[#4a4338] disabled:opacity-50"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((value) => value + 1)}
              type="button"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </section>

      {form ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/45 px-4 py-6">
          <div className="flex max-h-[calc(100dvh-3rem)] w-full max-w-2xl flex-col rounded-[28px] bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#efe6d7] px-5 py-5 md:px-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#de990e]">
                  {form.id ? "Edit video" : "Tambah video"}
                </p>
                <h3 className="mt-1 text-xl font-black text-[#141414]">
                  Materi cerita budaya
                </h3>
              </div>
              <button
                aria-label="Tutup form"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#eadfcd] text-[#4a4338]"
                onClick={() => setForm(null)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 md:px-6">
                {previewThumbnail ? (
                  <div className="relative aspect-video overflow-hidden rounded-3xl bg-[#f1f1f1]">
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={previewThumbnail}
                    />
                    <span className="absolute inset-0 grid place-items-center bg-black/15">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-[#de990e]">
                        <Play className="h-5 w-5" fill="currentColor" />
                      </span>
                    </span>
                  </div>
                ) : null}

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#30323a]">
                    Judul video
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-[#e8e1d4] px-4 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                    onChange={(event) => updateFormTitle(event.target.value)}
                    required
                    value={form.title}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#30323a]">
                    URL YouTube
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-[#e8e1d4] px-4 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                    onChange={(event) => updateFormYoutubeUrl(event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    value={form.youtube_url}
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-[#30323a]">
                      Kategori
                    </span>
                    <select
                      className="h-12 w-full rounded-2xl border border-[#e8e1d4] bg-white px-4 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                      onChange={(event) =>
                        setForm({ ...form, category: event.target.value })
                      }
                      value={form.category}
                    >
                      {cultureVideoCategories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-[#30323a]">
                      Durasi
                    </span>
                    <input
                      className="h-12 w-full rounded-2xl border border-[#e8e1d4] px-4 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                      onChange={(event) =>
                        setForm({ ...form, duration_label: event.target.value })
                      }
                      placeholder="08:24"
                      value={form.duration_label}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#30323a]">
                    Deskripsi
                  </span>
                  <textarea
                    className="min-h-28 w-full resize-y rounded-2xl border border-[#e8e1d4] px-4 py-3 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    value={form.description}
                  />
                </label>

                <details className="rounded-2xl border border-[#eadfcd] p-3">
                  <summary className="cursor-pointer text-sm font-bold text-[#30323a]">
                    Pengaturan lanjutan
                  </summary>
                  <div className="mt-4 space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-[#30323a]">
                        Thumbnail URL
                      </span>
                      <input
                        className="h-12 w-full rounded-2xl border border-[#e8e1d4] px-4 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                        onChange={(event) =>
                          setForm({ ...form, thumbnail_url: event.target.value })
                        }
                        placeholder="Otomatis dari YouTube bila dikosongkan"
                        value={form.thumbnail_url}
                      />
                    </label>
                  </div>
                </details>

                <label className="flex items-center gap-3 rounded-2xl border border-[#eadfcd] p-3">
                  <input
                    checked={form.is_published}
                    className="h-4 w-4 accent-[#de990e]"
                    onChange={(event) =>
                      setForm({ ...form, is_published: event.target.checked })
                    }
                    type="checkbox"
                  />
                  <span className="text-sm font-bold text-[#30323a]">
                    Publikasikan video ini
                  </span>
                </label>
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#efe6d7] px-5 py-4 sm:flex-row sm:justify-end md:px-6">
                <button
                  className="h-11 rounded-full border border-[#eadfcd] px-5 text-sm font-bold text-[#4a4338]"
                  onClick={() => setForm(null)}
                  type="button"
                >
                  Batal
                </button>
                <button
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#de990e] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
