"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  ImageOff,
  Landmark,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  slugifyCultureTitle,
  tolakiCultureCategories,
  type TolakiCultureSection,
} from "@/data/tolakiCulture";
import { useScrollLock } from "@/hooks/useScrollLock";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { compressImageToWebp } from "@/lib/image-compress";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type CultureRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  hero_image_url: string | null;
  sections: TolakiCultureSection[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type CultureResponse = {
  data: CultureRow[];
  page: number;
  pageSize: number;
  total: number;
  setupRequired?: boolean;
  message?: string;
};

type FormState = {
  id?: string;
  title: string;
  category: string;
  summary: string;
  hero_image_url: string;
  sections: TolakiCultureSection[];
  is_published: boolean;
};

const categoryOptions = ["Semua", ...tolakiCultureCategories];

const sampleSections: TolakiCultureSection[] = [
  {
    title: "Cerita sejarah",
    body: "Tuliskan latar belakang sejarah dan konteks budaya dari topik ini.",
  },
  {
    title: "Makna",
    body: "Tuliskan nilai, simbol, atau pesan budaya yang terkandung.",
  },
];

const emptyForm: FormState = {
  title: "",
  category: "Adat Istiadat",
  summary: "",
  hero_image_url: "",
  sections: sampleSections,
  is_published: true,
};

function validateSections(sections: TolakiCultureSection[]) {
  const normalizedSections = sections
    .map((section) => ({
      title: section.title.trim(),
      body: section.body.trim(),
    }))
    .filter((section) => section.title || section.body);

  if (normalizedSections.length === 0) {
    throw new Error("Minimal isi satu bagian konten.");
  }

  if (normalizedSections.some((section) => !section.title || !section.body)) {
    throw new Error("Setiap bagian wajib punya judul dan isi.");
  }

  return normalizedSections;
}

export function TolakiCultureAdmin() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [rows, setRows] = useState<CultureRow[]>([]);
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [setupMessage, setSetupMessage] = useState("");

  useScrollLock(Boolean(form));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadCultures();
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

  async function loadCultures() {
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

      const response = await fetch(`/api/admin/cultures?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await response.json()) as
        | CultureResponse
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in payload ? payload.message : "Gagal memuat budaya.",
        );
      }

      const data = payload as CultureResponse;
      setRows(data.data);
      setTotal(data.total);
      setPageSize(data.pageSize);
      setSetupRequired(Boolean(data.setupRequired));
      setSetupMessage(data.message ?? "");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memuat budaya.";
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
    });
  }

  function updateFormSection(
    index: number,
    field: keyof TolakiCultureSection,
    value: string,
  ) {
    if (!form) {
      return;
    }

    setForm({
      ...form,
      sections: form.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section,
      ),
    });
  }

  function addFormSection() {
    if (!form) {
      return;
    }

    setForm({
      ...form,
      sections: [...form.sections, { title: "", body: "" }],
    });
  }

  function removeFormSection(index: number) {
    if (!form || form.sections.length <= 1) {
      return;
    }

    setForm({
      ...form,
      sections: form.sections.filter((_, sectionIndex) => sectionIndex !== index),
    });
  }

  async function handleImageUpload(file: File) {
    if (!supabase) {
      showErrorToast("Konfigurasi Supabase belum lengkap.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      showErrorToast("File harus berupa gambar.");
      return;
    }

    setIsUploadingImage(true);

    try {
      const compressed = await compressImageToWebp(file, { targetKB: 100 });
      const path = `tolaki-culture/${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("culture-images")
        .upload(path, compressed, {
          upsert: true,
          contentType: "image/webp",
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("culture-images").getPublicUrl(path);

      setForm((current) =>
        current ? { ...current, hero_image_url: data.publicUrl } : current,
      );
      const sizeKB = Math.round(compressed.size / 1024);
      showSuccessToast(`Gambar berhasil diunggah (${sizeKB} KB).`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengunggah gambar.";
      showErrorToast(message);
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) {
      return;
    }

    setIsSaving(true);

    try {
      const sections = validateSections(form.sections);
      const token = await getAccessToken();
      const response = await fetch("/api/admin/cultures", {
        method: form.id ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: form.id,
          slug: slugifyCultureTitle(form.title),
          title: form.title,
          category: form.category,
          summary: form.summary,
          hero_image_url: form.hero_image_url,
          sections,
          is_published: form.is_published,
        }),
      });
      const payload = (await response.json()) as
        | { data: CultureRow }
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in payload ? payload.message : "Gagal menyimpan budaya.",
        );
      }

      showSuccessToast(form.id ? "Budaya diperbarui." : "Budaya ditambahkan.");
      setForm(null);
      await loadCultures();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menyimpan budaya.";
      showErrorToast(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(row: CultureRow) {
    const confirmed = window.confirm(`Hapus budaya "${row.title}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(row.id);

    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/admin/cultures?id=${row.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Gagal menghapus budaya.");
      }

      showSuccessToast("Budaya dihapus.");
      await loadCultures();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus budaya.";
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
            Budaya Tolaki
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#141414]">
            Kelola topik budaya
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6659]">
            Tambah materi seperti pernikahan adat, makanan tradisional, pakaian
            adat, sejarah, makna, dan bagian konten lainnya.
          </p>
        </div>

        <button
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#de990e] px-5 text-sm font-bold text-white transition hover:bg-[#bd7d08]"
          onClick={() =>
            setForm({
              ...emptyForm,
              sections: sampleSections.map((section) => ({ ...section })),
            })
          }
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah budaya
        </button>
      </section>

      {setupRequired ? (
        <section className="rounded-[24px] border border-[#f2d19b] bg-[#fff8ed] p-5 text-sm leading-6 text-[#6f4b13]">
          <p className="font-black text-[#141414]">Tabel budaya belum dibuat.</p>
          <p className="mt-2">
            {setupMessage ||
              "Jalankan SQL di docs/tolaki_culture_topics.sql pada Supabase project yang dipakai aplikasi, lalu refresh halaman admin ini."}
          </p>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-[#efe6d7] bg-white p-4 shadow-sm">
        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-center">
          <div className="flex h-11 min-w-0 items-center gap-3 rounded-full border border-[#eadfcd] px-4 transition focus-within:border-[#de990e] focus-within:ring-4 focus-within:ring-[#de990e]/10">
            <Search className="h-4 w-4 shrink-0 text-[#8d8170]" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari judul, ringkasan, atau kategori..."
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
            {total.toLocaleString("id-ID")} budaya
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#efe6d7]">
          <div className="hidden grid-cols-[1fr_170px_120px] gap-3 border-b border-[#efe6d7] bg-[#f7f3ea] px-4 py-3 text-xs font-black uppercase tracking-[0.06em] text-[#6f6659] lg:grid">
            <span>Topik</span>
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
                  className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_170px_120px] lg:items-center"
                  key={row.id}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4 w-4 shrink-0 text-[#de990e]" />
                      <h3 className="truncate font-black leading-6 text-[#141414]">
                        {row.title}
                      </h3>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6f6659]">
                      {row.summary ?? "-"}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-[#8d8170]">
                      /budaya-tolaki/{row.slug}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#fff3dc] px-3 py-1 text-xs font-bold text-[#a66d07]">
                      {row.category}
                    </span>
                    {row.is_published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#73a920]/10 px-3 py-1 text-xs font-bold text-[#4f7c12]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Aktif
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#f1f1f1] px-3 py-1 text-xs font-bold text-[#777]">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 lg:justify-end">
                    <button
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#eadfcd] text-[#4a4338] transition hover:border-[#de990e] hover:text-[#de990e]"
                      onClick={() =>
                        setForm({
                          id: row.id,
                          title: row.title,
                          category: row.category,
                          summary: row.summary ?? "",
                          hero_image_url: row.hero_image_url ?? "",
                          sections: row.sections?.length
                            ? row.sections.map((section) => ({ ...section }))
                            : sampleSections.map((section) => ({ ...section })),
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
              <p className="font-bold text-[#141414]">Belum ada budaya.</p>
              <p className="mt-2 text-sm text-[#6f6659]">
                Jalankan SQL seed lalu tambah materi lain dari tombol di atas.
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
          <div className="flex max-h-[calc(100dvh-3rem)] w-full max-w-3xl flex-col rounded-[28px] bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#efe6d7] px-5 py-5 md:px-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#de990e]">
                  {form.id ? "Edit budaya" : "Tambah budaya"}
                </p>
                <h3 className="mt-1 text-xl font-black text-[#141414]">
                  Materi Budaya Tolaki
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
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#30323a]">
                    Judul
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-[#e8e1d4] px-4 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                    onChange={(event) => updateFormTitle(event.target.value)}
                    required
                    value={form.title}
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#eadfcd] bg-[#fffaf2] px-4 py-3">
                    <span className="block text-sm font-bold text-[#30323a]">
                      Slug otomatis
                    </span>
                    <span className="mt-2 block break-all text-sm font-semibold text-[#8d8170]">
                      {slugifyCultureTitle(form.title) || "isi-judul-dulu"}
                    </span>
                  </div>

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
                      {tolakiCultureCategories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#30323a]">
                    Ringkasan
                  </span>
                  <textarea
                    className="min-h-24 w-full resize-y rounded-2xl border border-[#e8e1d4] px-4 py-3 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                    onChange={(event) =>
                      setForm({ ...form, summary: event.target.value })
                    }
                    required
                    value={form.summary}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#30323a]">
                    Gambar cover
                  </span>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#e8e1d4] bg-[#fffaf2] sm:w-48">
                      {form.hero_image_url ? (
                        <img
                          alt=""
                          className="h-full w-full object-cover"
                          src={form.hero_image_url}
                        />
                      ) : (
                        <ImageOff className="h-6 w-6 text-[#c9bda3]" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            void handleImageUpload(file);
                          }
                          event.target.value = "";
                        }}
                        ref={fileInputRef}
                        type="file"
                      />
                      <button
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f7f3ea] px-5 text-sm font-bold text-[#4a4338] transition hover:bg-[#f5ead7] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                      >
                        {isUploadingImage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {isUploadingImage ? "Mengunggah..." : "Upload gambar"}
                      </button>
                      <input
                        className="h-11 w-full rounded-2xl border border-[#e8e1d4] px-4 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                        onChange={(event) =>
                          setForm({ ...form, hero_image_url: event.target.value })
                        }
                        placeholder="Atau tempel URL gambar di sini"
                        value={form.hero_image_url}
                      />
                    </div>
                  </div>
                </label>

                <section className="rounded-2xl border border-[#eadfcd] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#30323a]">
                        Bagian konten
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#8d8170]">
                        Contoh: Cerita sejarah, Baju adat, Makna, Cara penyajian.
                      </p>
                    </div>
                    <button
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#f7f3ea] px-4 text-sm font-bold text-[#4a4338] transition hover:bg-[#f5ead7]"
                      onClick={addFormSection}
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah bagian
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {form.sections.map((section, index) => (
                      <div
                        className="rounded-2xl border border-[#efe6d7] bg-[#fffdf9] p-3"
                        key={index}
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-[#141414]">
                            Bagian {index + 1}
                          </p>
                          <button
                            className="grid h-8 w-8 place-items-center rounded-full text-[#9a3f2f] transition hover:bg-[#fff0ed] disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={form.sections.length <= 1}
                            onClick={() => removeFormSection(index)}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <label className="block">
                          <span className="mb-2 block text-xs font-bold text-[#6f6659]">
                            Judul bagian
                          </span>
                          <input
                            className="h-11 w-full rounded-2xl border border-[#e8e1d4] px-4 text-sm outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                            onChange={(event) =>
                              updateFormSection(index, "title", event.target.value)
                            }
                            placeholder="Contoh: Cerita sejarah"
                            value={section.title}
                          />
                        </label>

                        <label className="mt-3 block">
                          <span className="mb-2 block text-xs font-bold text-[#6f6659]">
                            Isi bagian
                          </span>
                          <textarea
                            className="min-h-28 w-full resize-y rounded-2xl border border-[#e8e1d4] px-4 py-3 text-sm leading-6 outline-none focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
                            onChange={(event) =>
                              updateFormSection(index, "body", event.target.value)
                            }
                            placeholder="Tulis isi bagian di sini..."
                            value={section.body}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </section>

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
                    Publikasikan budaya ini
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
