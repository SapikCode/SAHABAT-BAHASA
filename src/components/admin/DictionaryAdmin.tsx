"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useScrollLock } from "@/hooks/useScrollLock";

type DictionaryRow = {
  id: string;
  kata_tolaki: string;
  arti_indonesia: string;
  kalimat_tolaki: string | null;
  kalimat_indonesia: string | null;
  is_published: boolean;
  source_row: number | null;
  updated_at: string;
};

type DictionaryResponse = {
  data: DictionaryRow[];
  page: number;
  pageSize: number;
  total: number;
};

type FormState = {
  id?: string;
  kata_tolaki: string;
  arti_indonesia: string;
  kalimat_tolaki: string;
  kalimat_indonesia: string;
  is_published: boolean;
};

const emptyForm: FormState = {
  kata_tolaki: "",
  arti_indonesia: "",
  kalimat_tolaki: "",
  kalimat_indonesia: "",
  is_published: true,
};

export function DictionaryAdmin() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [rows, setRows] = useState<DictionaryRow[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DictionaryRow | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  useScrollLock(Boolean(form) || Boolean(deleteTarget));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadDictionary();
  }, [debouncedSearch, page]);

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

  async function loadDictionary() {
    setIsLoading(true);

    try {
      const token = await getAccessToken();
      const params = new URLSearchParams({
        page: String(page),
      });

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const response = await fetch(`/api/admin/dictionary?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await response.json()) as
        | DictionaryResponse
        | { message?: string };

      if (!response.ok) {
        throw new Error("message" in payload ? payload.message : "Gagal memuat kamus.");
      }

      const data = payload as DictionaryResponse;
      setRows(data.data);
      setTotal(data.total);
      setPageSize(data.pageSize);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memuat kamus.";
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
      const response = await fetch("/api/admin/dictionary", {
        method: form.id ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as
        | { data: DictionaryRow }
        | { message?: string };

      if (!response.ok) {
        throw new Error("message" in payload ? payload.message : "Gagal menyimpan data.");
      }

      showSuccessToast(
        form.id
          ? "Data kamus diperbarui dan embedding dibuat ulang."
          : "Data kamus ditambahkan dengan embedding baru.",
      );
      setForm(null);
      await loadDictionary();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menyimpan data.";
      showErrorToast(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);

    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/dictionary", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Gagal menghapus data kamus.");
      }

      showSuccessToast("Data kamus dihapus.");
      setDeleteTarget(null);
      await loadDictionary();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus data kamus.";
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
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#de990e]">
            Kamus Chatbot
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#141414]">
            Kelola data RAG
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6659]">
            Edit teks kamus atau tambah entri baru. Vector embedding dibuat
            otomatis dari server saat data disimpan.
          </p>
        </div>

        <button
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#de990e] px-5 text-sm font-bold text-white transition hover:bg-[#bd7d08]"
          onClick={() => setForm(emptyForm)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah data
        </button>
      </section>

      <section className="rounded-[28px] border border-[#efe6d7] bg-white p-4 shadow-sm">
        <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="flex h-11 min-w-0 items-center gap-3 rounded-full border border-[#eadfcd] px-4 transition focus-within:border-[#de990e] focus-within:ring-4 focus-within:ring-[#de990e]/10">
            <Search className="h-4 w-4 shrink-0 text-[#8d8170]" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari kata, arti, atau kalimat..."
              value={search}
            />
          </div>
          <p className="text-sm font-semibold text-[#6f6659]">
            {total.toLocaleString("id-ID")} entri
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#efe6d7]">
          <div className="hidden grid-cols-[110px_1fr_1fr_130px] gap-3 border-b border-[#efe6d7] bg-[#f7f3ea] px-4 py-3 text-xs font-black uppercase tracking-[0.06em] text-[#6f6659] lg:grid">
            <span>Sumber</span>
            <span>Kata</span>
            <span>Contoh</span>
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
                  className="grid gap-3 px-4 py-4 lg:grid-cols-[110px_1fr_1fr_130px] lg:items-center"
                  key={row.id}
                >
                  <div className="flex items-center justify-between gap-3 lg:block">
                    <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#9a8f7f] lg:hidden">
                      Sumber
                    </span>
                    <span className="text-sm font-bold text-[#6f6659]">
                      {row.source_row ? `${row.source_row}` : "Admin"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-[#141414]">
                      {row.kata_tolaki}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#6f6659]">
                      {row.arti_indonesia}
                    </p>
                  </div>

                  <div className="space-y-1 text-sm leading-6 text-[#4d463d]">
                    <p>{row.kalimat_tolaki ?? "-"}</p>
                    <p className="text-[#7b7164]">
                      {row.kalimat_indonesia ?? "-"}
                    </p>
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
                          kata_tolaki: row.kata_tolaki,
                          arti_indonesia: row.arti_indonesia,
                          kalimat_tolaki: row.kalimat_tolaki ?? "",
                          kalimat_indonesia: row.kalimat_indonesia ?? "",
                          is_published: row.is_published,
                        })
                      }
                      type="button"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Hapus ${row.kata_tolaki}`}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#eadfcd] text-[#8a3b2d] transition hover:border-[#c53b2c] hover:bg-[#fff1ee] hover:text-[#c53b2c] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deletingId === row.id}
                      onClick={() => setDeleteTarget(row)}
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
              <p className="font-bold text-[#141414]">Data tidak ditemukan.</p>
              <p className="mt-2 text-sm text-[#6f6659]">
                Coba kata pencarian lain atau tambah entri baru.
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
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#de990e]">
                  {form.id ? "Edit entri" : "Tambah entri"}
                </p>
                <h3 className="mt-1 text-xl font-black text-[#141414]">
                  Data kamus chatbot
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
                    className="h-12 w-full rounded-2xl border border-[#e8e1d4] px-4 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                    onChange={(event) =>
                      setForm({ ...form, kata_tolaki: event.target.value })
                    }
                    required
                    value={form.kata_tolaki}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#30323a]">
                    Arti Indonesia
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-[#e8e1d4] px-4 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                    onChange={(event) =>
                      setForm({ ...form, arti_indonesia: event.target.value })
                    }
                    required
                    value={form.arti_indonesia}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#30323a]">
                  Kalimat Tolaki
                </span>
                <textarea
                  className="min-h-24 w-full resize-y rounded-2xl border border-[#e8e1d4] px-4 py-3 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                  onChange={(event) =>
                    setForm({ ...form, kalimat_tolaki: event.target.value })
                  }
                  value={form.kalimat_tolaki}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#30323a]">
                  Kalimat Indonesia
                </span>
                <textarea
                  className="min-h-24 w-full resize-y rounded-2xl border border-[#e8e1d4] px-4 py-3 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      kalimat_indonesia: event.target.value,
                    })
                  }
                  value={form.kalimat_indonesia}
                />
              </label>

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
                  Publikasikan entri ini
                </span>
              </label>

              <div className="rounded-2xl bg-[#fff7e8] p-4 text-sm leading-6 text-[#6f6659]">
                <div className="mb-1 flex items-center gap-2 font-bold text-[#4a4338]">
                  <Sparkles className="h-4 w-4 text-[#de990e]" />
                  Embedding otomatis
                </div>
                Saat disimpan, sistem membuat ulang vector dari kata, arti, dan
                contoh kalimat. Admin tidak perlu mengedit vector manual.
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-md rounded-[26px] border border-[#efe6d7] bg-white p-5 shadow-[0_24px_80px_rgba(10,11,13,0.2)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#c53b2c]">
                  Hapus data
                </p>
                <h3 className="mt-1 text-xl font-black text-[#141414]">
                  Hapus entri kamus?
                </h3>
              </div>
              <button
                aria-label="Tutup konfirmasi"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#eadfcd] text-[#4a4338] transition hover:bg-[#f7f3ea]"
                disabled={deletingId === deleteTarget.id}
                onClick={() => setDeleteTarget(null)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-[#fff7e8] p-4">
              <p className="text-sm font-bold text-[#141414]">
                {deleteTarget.kata_tolaki}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#6f6659]">
                {deleteTarget.arti_indonesia}
              </p>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#6f6659]">
              Data ini akan dihapus dari kamus chatbot dan tidak akan dipakai
              lagi sebagai konteks RAG.
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="h-11 rounded-full border border-[#eadfcd] px-5 text-sm font-bold text-[#4a4338] transition hover:bg-[#f7f3ea]"
                disabled={deletingId === deleteTarget.id}
                onClick={() => setDeleteTarget(null)}
                type="button"
              >
                Batal
              </button>
              <button
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#c53b2c] px-5 text-sm font-bold text-white transition hover:bg-[#a83226] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={deletingId === deleteTarget.id}
                onClick={handleDelete}
                type="button"
              >
                {deletingId === deleteTarget.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Hapus
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
