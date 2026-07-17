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
import { quizCategories } from "@/data/quiz";
import { useScrollLock } from "@/hooks/useScrollLock";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type QuizAnswerRow = {
  id: string;
  answer_text: string;
  is_correct: boolean;
  sort_order: number;
};

type QuizQuestionRow = {
  id: string;
  question: string;
  category: string;
  level: string;
  explanation: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  quiz_answers: QuizAnswerRow[];
};

type QuizQuestionResponse = {
  data: QuizQuestionRow[];
  page: number;
  pageSize: number;
  total: number;
};

type FormAnswer = {
  answer_text: string;
  is_correct: boolean;
};

type FormState = {
  id?: string;
  question: string;
  category: string;
  level: string;
  explanation: string;
  is_published: boolean;
  answers: FormAnswer[];
};

const categoryOptions = ["Semua", ...quizCategories];
const levelOptions = ["Semua", "Dasar", "Menengah"];

const emptyForm: FormState = {
  question: "",
  category: "Kosakata",
  level: "Dasar",
  explanation: "",
  is_published: true,
  answers: [
    { answer_text: "", is_correct: true },
    { answer_text: "", is_correct: false },
    { answer_text: "", is_correct: false },
    { answer_text: "", is_correct: false },
  ],
};

function normalizeAnswers(answers: QuizAnswerRow[]) {
  const sorted = [...answers].sort((a, b) => a.sort_order - b.sort_order);
  const nextAnswers = sorted.map((answer) => ({
    answer_text: answer.answer_text,
    is_correct: answer.is_correct,
  }));

  while (nextAnswers.length < 4) {
    nextAnswers.push({
      answer_text: "",
      is_correct: false,
    });
  }

  return nextAnswers;
}

export function QuizAdmin() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [rows, setRows] = useState<QuizQuestionRow[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [level, setLevel] = useState("Semua");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
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
    loadQuizQuestions();
  }, [debouncedSearch, category, level, page]);

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

  async function loadQuizQuestions() {
    setIsLoading(true);

    try {
      const token = await getAccessToken();
      const params = new URLSearchParams({
        page: String(page),
        category,
        level,
      });

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const response = await fetch(`/api/admin/quiz-questions?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await response.json()) as
        | QuizQuestionResponse
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in payload ? payload.message : "Gagal memuat soal.",
        );
      }

      const data = payload as QuizQuestionResponse;
      setRows(data.data);
      setTotal(data.total);
      setPageSize(data.pageSize);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memuat soal.";
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateAnswer(index: number, value: string) {
    if (!form) {
      return;
    }

    setForm({
      ...form,
      answers: form.answers.map((answer, answerIndex) =>
        answerIndex === index ? { ...answer, answer_text: value } : answer,
      ),
    });
  }

  function setCorrectAnswer(index: number) {
    if (!form) {
      return;
    }

    setForm({
      ...form,
      answers: form.answers.map((answer, answerIndex) => ({
        ...answer,
        is_correct: answerIndex === index,
      })),
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
      const response = await fetch("/api/admin/quiz-questions", {
        method: form.id ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Gagal menyimpan soal.");
      }

      showSuccessToast(form.id ? "Soal diperbarui." : "Soal ditambahkan.");
      setForm(null);
      await loadQuizQuestions();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menyimpan soal.";
      showErrorToast(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(row: QuizQuestionRow) {
    const confirmed = window.confirm(`Hapus soal "${row.question}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(row.id);

    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/admin/quiz-questions?id=${row.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Gagal menghapus soal.");
      }

      showSuccessToast("Soal dihapus.");
      await loadQuizQuestions();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus soal.";
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
            Kuis
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#141414]">
            Kelola bank soal
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6659]">
            Buat soal pilihan ganda, tentukan kunci jawaban, kategori, level,
            dan pembahasan yang muncul saat review.
          </p>
        </div>

        <button
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#73a920] px-5 text-sm font-bold text-white transition hover:bg-[#5f8d19]"
          onClick={() => setForm(emptyForm)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah soal
        </button>
      </section>

      <section className="rounded-[28px] border border-[#efe6d7] bg-white p-4 shadow-sm">
        <div className="mb-4 grid gap-3 xl:grid-cols-[1fr_190px_160px_auto] xl:items-center">
          <div className="flex h-11 min-w-0 items-center gap-3 rounded-full border border-[#eadfcd] px-4 transition focus-within:border-[#73a920] focus-within:ring-4 focus-within:ring-[#73a920]/10">
            <Search className="h-4 w-4 shrink-0 text-[#8d8170]" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari pertanyaan atau pembahasan..."
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

          <select
            className="h-11 rounded-full border border-[#eadfcd] bg-white px-4 text-sm font-bold text-[#4a4338] outline-none focus:border-[#73a920] focus:ring-4 focus:ring-[#73a920]/10"
            onChange={(event) => {
              setLevel(event.target.value);
              setPage(1);
            }}
            value={level}
          >
            {levelOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <p className="text-sm font-semibold text-[#6f6659]">
            {total.toLocaleString("id-ID")} soal
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#efe6d7]">
          <div className="hidden grid-cols-[1.2fr_1fr_160px_130px] gap-3 border-b border-[#efe6d7] bg-[#f7f3ea] px-4 py-3 text-xs font-black uppercase tracking-[0.06em] text-[#6f6659] lg:grid">
            <span>Pertanyaan</span>
            <span>Jawaban</span>
            <span>Kategori</span>
            <span>Aksi</span>
          </div>

          {isLoading ? (
            <div className="grid min-h-48 place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#73a920]" />
            </div>
          ) : rows.length ? (
            <div className="divide-y divide-[#efe6d7]">
              {rows.map((row) => {
                const correctAnswer = row.quiz_answers.find(
                  (answer) => answer.is_correct,
                );

                return (
                  <article
                    className="grid gap-3 px-4 py-4 lg:grid-cols-[1.2fr_1fr_160px_130px] lg:items-center"
                    key={row.id}
                  >
                    <div>
                      <h3 className="font-black leading-6 text-[#141414]">
                        {row.question}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6f6659]">
                        {row.explanation ?? "-"}
                      </p>
                    </div>

                    <div className="space-y-1 text-sm leading-6 text-[#4d463d]">
                      <p className="font-bold text-[#4f7c12]">
                        {correctAnswer?.answer_text ?? "Belum ada kunci"}
                      </p>
                      <p className="text-[#7b7164]">
                        {row.quiz_answers.length} pilihan jawaban
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
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#eadfcd] text-[#4a4338] transition hover:border-[#73a920] hover:text-[#73a920]"
                        onClick={() =>
                          setForm({
                            id: row.id,
                            question: row.question,
                            category: row.category,
                            level: row.level,
                            explanation: row.explanation ?? "",
                            is_published: row.is_published,
                            answers: normalizeAnswers(row.quiz_answers),
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
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="font-bold text-[#141414]">Belum ada soal.</p>
              <p className="mt-2 text-sm text-[#6f6659]">
                Tambahkan soal pilihan ganda pertama.
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
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#73a920]">
                  {form.id ? "Edit soal" : "Tambah soal"}
                </p>
                <h3 className="mt-1 text-xl font-black text-[#141414]">
                  Bank soal kuis
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
                    Pertanyaan
                  </span>
                  <textarea
                    className="min-h-24 w-full resize-y rounded-2xl border border-[#e8e1d4] px-4 py-3 text-sm outline-none focus:border-[#73a920] focus:ring-4 focus:ring-[#73a920]/10"
                    onChange={(event) =>
                      setForm({ ...form, question: event.target.value })
                    }
                    required
                    value={form.question}
                  />
                </label>

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
                      {quizCategories.map((item) => (
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
                      {levelOptions.slice(1).map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="space-y-3 rounded-3xl border border-[#eadfcd] p-4">
                  <div>
                    <p className="text-sm font-bold text-[#30323a]">
                      Pilihan jawaban
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#7b7164]">
                      Pilih satu radio sebagai jawaban benar.
                    </p>
                  </div>

                  {form.answers.map((answer, index) => (
                    <div
                      className="grid gap-2 rounded-2xl bg-[#fffdf9] p-3 sm:grid-cols-[auto_1fr]"
                      key={index}
                    >
                      <label className="flex items-center gap-2 text-sm font-bold text-[#4f7c12]">
                        <input
                          checked={answer.is_correct}
                          className="h-4 w-4 accent-[#73a920]"
                          onChange={() => setCorrectAnswer(index)}
                          type="radio"
                        />
                        Benar
                      </label>
                      <input
                        className="h-11 rounded-2xl border border-[#e8e1d4] px-4 text-sm outline-none focus:border-[#73a920] focus:ring-4 focus:ring-[#73a920]/10"
                        onChange={(event) => updateAnswer(index, event.target.value)}
                        placeholder={`Pilihan ${index + 1}`}
                        value={answer.answer_text}
                      />
                    </div>
                  ))}
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#30323a]">
                    Pembahasan
                  </span>
                  <textarea
                    className="min-h-24 w-full resize-y rounded-2xl border border-[#e8e1d4] px-4 py-3 text-sm outline-none focus:border-[#73a920] focus:ring-4 focus:ring-[#73a920]/10"
                    onChange={(event) =>
                      setForm({ ...form, explanation: event.target.value })
                    }
                    value={form.explanation}
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
                    Publikasikan soal ini
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
