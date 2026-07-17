"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { vocabularyCategories } from "@/data/vocabulary";
import { useScrollLock } from "@/hooks/useScrollLock";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type VocabularyRow = {
  id: string;
  term_tolaki: string;
  meaning_indonesia: string;
  example_tolaki: string | null;
  example_indonesia: string | null;
  category: string;
  level: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type VocabularyResponse = {
  data: VocabularyRow[];
  page: number;
  pageSize: number;
  total: number;
};

type FormState = {
  id?: string;
  term_tolaki: string;
  meaning_indonesia: string;
  example_tolaki: string;
  example_indonesia: string;
  category: string;
  level: string;
  is_published: boolean;
};

const categoryOptions = ["Semua", ...vocabularyCategories];
const levelOptions = ["Dasar", "Menengah", "Lanjut"];

const emptyForm: FormState = {
  term_tolaki: "",
  meaning_indonesia: "",
  example_tolaki: "",
  example_indonesia: "",
  category: "Sapaan",
  level: "Dasar",
  is_published: true,
};

export function VocabularyAdmin() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [rows, setRows] = useState<VocabularyRow[]>([]);
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
    loadVocabularies();
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

  async function loadVocabularies() {
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

      const response = await fetch(`/api/admin/vocabularies?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await response.json()) as
        | VocabularyResponse
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in payload ? payload.message : "Gagal memuat kosakata.",
        );
      }

      const data = payload as VocabularyResponse;
      setRows(data.data);
      setTotal(data.total);
      setPageSize(data.pageSize);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memuat kosakata.";
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) {
      return;
    }

    setIsSaving(true);

    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/vocabularies", {
        method: form.id ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as
        | { data: VocabularyRow }
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in payload ? payload.message : "Gagal menyimpan kosakata.",
        );
      }

      showSuccessToast(form.id ? "Kosakata diperbarui." : "Kosakata ditambahkan.");
      setForm(null);
      await loadVocabularies();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menyimpan kosakata.";
      showErrorToast(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(row: VocabularyRow) {
    const confirmed = window.confirm(
      `Hapus kosakata "${row.term_tolaki}" dari daftar belajar?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(row.id);

    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/admin/vocabularies?id=${row.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Gagal menghapus kosakata.");
      }

      showSuccessToast("Kosakata dihapus.");
      await loadVocabularies();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus kosakata.";
      showErrorToast(message);
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-[28px] border border-[#efe6d7] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#73a920]">
            Kosakata
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#141414]">
            Kelola materi kata harian
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6659]">
            Tambahkan kata Tolaki, arti Indonesia, contoh kalimat, kategori,
            dan level belajar yang tampil di halaman kosakata.
          </p>
        </div>

        <button
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#73a920] px-5 text-sm font-bold text-white transition hover:bg-[#5f8d19]"
          onClick={() => setForm(emptyForm)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah kosakata
        </button>
      </section>

      <section className="rounded-[28px] border border-[#efe6d7] bg-white p-4 shadow-sm">
        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-center">
          <div className="flex h-11 min-w-0 items-center gap-3 rounded-full border border-[#eadfcd] px-4 transition focus-within:border-[#73a920] focus-within:ring-4 focus-within:ring-[#73a920]/10">
            <Search className="h-4 w-4 shrink-0 text-[#8d8170]" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari kata, arti, atau contoh kalimat..."
              value={search}
            />
          </div>

          <select
            className="h-11 rounded-full border border-[#eadfcd] bg-white px-4 text-sm font-bold text-[#4a4338] outline-none focus:border-[#73a920] focus:ring-4 focus:ring-[#73a920]/10"
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
            {total.toLocaleString("id-ID")} entri
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#efe6d7]">
          <div className="hidden grid-cols-[1fr_1fr_120px_130px] gap-3 border-b border-[#efe6d7] bg-[#f7f3ea] px-4 py-3 text-xs font-black uppercase tracking-[0.06em] text-[#6f6659] lg:grid">
            <span>Kata</span>
            <span>Contoh</span>
            <span>Kategori</span>
            <span>Aksi</span>
          </div>

          {isLoading ? (
            <div className="grid min-h-48 place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#73a920]" />
            </div>
          ) : rows.length ? (
            <div className="divide-y divide-[#efe6d7]">
              {rows.map((row) => (
                <article
                  className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_1fr_120px_130px] lg:items-center"
                  key={row.id}
                >
                  <div>
                    <h3 className="font-black text-[#141414]">
                      {row.term_tolaki}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#6f6659]">
                      {row.meaning_indonesia}
                    </p>
                  </div>

                  <div className="space-y-1 text-sm leading-6 text-[#4d463d]">
                    <p>{row.example_tolaki ?? "-"}</p>
                    <p className="text-[#7b7164]">
                      {row.example_indonesia ?? "-"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#edf6df] px-3 py-1 text-xs font-bold text-[#4f7c12]">
                      {row.category}
                    </span>
                    <span className="rounded-full bg-[#eef6fb] px-3 py-1 text-xs font-bold text-[#1376ba]">
                      {row.level}
                    </span>
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
                      className="grid shrink-0 h-9 w-9 place-items-center rounded-full border border-[#eadfcd] text-[#4a4338] transition hover:border-[#73a920] hover:text-[#73a920]"
                      onClick={() =>
                        setForm({
                          id: row.id,
                          term_tolaki: row.term_tolaki,
                          meaning_indonesia: row.meaning_indonesia,
                          example_tolaki: row.example_tolaki ?? "",
                          example_indonesia: row.example_indonesia ?? "",
                          category: row.category,
                          level: row.level,
                          is_published: row.is_published,
                        })
                      }
                      type="button"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      className="grid shrink-0 h-9 w-9 place-items-center rounded-full border border-[#eadfcd] text-[#9a3f2f] transition hover:border-[#9a3f2f] disabled:opacity-50"
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
              <p className="font-bold text-[#141414]">Belum ada kosakata.</p>
              <p className="mt-2 text-sm text-[#6f6659]">
                Tambahkan data baru atau ubah filter pencarian.
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
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/45 px-4 py-6">
          <div className="mx-auto max-w-2xl rounded-[28px] bg-white p-5 shadow-2xl md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#73a920]">
                  {form.id ? "Edit kosakata" : "Tambah kosakata"}
                </p>
                <h3 className="mt-1 text-xl font-black text-[#141414]">
                  Materi belajar kata
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

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#30323a]">
                    Kata Tolaki
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-[#e8e1d4] px-4 text-sm outline-none focus:border-[#73a920] focus:ring-4 focus:ring-[#73a920]/10"
                    onChange={(event) =>
                      setForm({ ...form, term_tolaki: event.target.value })
                    }
                    required
                    value={form.term_tolaki}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#30323a]">
                    Arti Indonesia
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-[#e8e1d4] px-4 text-sm outline-none focus:border-[#73a920] focus:ring-4 focus:ring-[#73a920]/10"
                    onChange={(event) =>
                      setForm({
                        ...form,
                        meaning_indonesia: event.target.value,
                      })
                    }
                    required
                    value={form.meaning_indonesia}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#30323a]">
                    Kategori
                  </span>
                  <select
                    className="h-12 w-full rounded-2xl border border-[#e8e1d4] bg-white px-4 text-sm outline-none focus:border-[#73a920] focus:ring-4 focus:ring-[#73a920]/10"
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    value={form.category}
                  >
                    {vocabularyCategories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#30323a]">
                    Level
                  </span>
                  <select
                    className="h-12 w-full rounded-2xl border border-[#e8e1d4] bg-white px-4 text-sm outline-none focus:border-[#73a920] focus:ring-4 focus:ring-[#73a920]/10"
                    onChange={(event) =>
                      setForm({ ...form, level: event.target.value })
                    }
                    value={form.level}
                  >
                    {levelOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#30323a]">
                  Kalimat Tolaki
                </span>
                <textarea
                  className="min-h-24 w-full resize-y rounded-2xl border border-[#e8e1d4] px-4 py-3 text-sm outline-none focus:border-[#73a920] focus:ring-4 focus:ring-[#73a920]/10"
                  onChange={(event) =>
                    setForm({ ...form, example_tolaki: event.target.value })
                  }
                  value={form.example_tolaki}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#30323a]">
                  Kalimat Indonesia
                </span>
                <textarea
                  className="min-h-24 w-full resize-y rounded-2xl border border-[#e8e1d4] px-4 py-3 text-sm outline-none focus:border-[#73a920] focus:ring-4 focus:ring-[#73a920]/10"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      example_indonesia: event.target.value,
                    })
                  }
                  value={form.example_indonesia}
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-[#eadfcd] p-3">
                <input
                  checked={form.is_published}
                  className="h-4 w-4 accent-[#73a920]"
                  onChange={(event) =>
                    setForm({ ...form, is_published: event.target.checked })
                  }
                  type="checkbox"
                />
                <span className="text-sm font-bold text-[#30323a]">
                  Publikasikan kosakata ini
                </span>
              </label>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  className="h-11 rounded-full border border-[#eadfcd] px-5 text-sm font-bold text-[#4a4338]"
                  onClick={() => setForm(null)}
                  type="button"
                >
                  Batal
                </button>
                <button
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#73a920] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
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
