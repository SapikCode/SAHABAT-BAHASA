"use client";

import {
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  Check,
  LockKeyhole,
  Medal,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  readQuizResults,
  type QuizResult,
} from "@/lib/quiz-results-storage";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type ProfileIdentity = {
  avatarUrl: string | null;
  displayName: string;
  email: string;
};

function getProfileIdentity(user: User): ProfileIdentity {
  const metadata = user.user_metadata ?? {};
  const email = user.email ?? "Pengguna";
  const displayName =
    metadata.full_name ??
    metadata.name ??
    metadata.display_name ??
    email.split("@")[0] ??
    "Pengguna";
  const avatarUrl = metadata.avatar_url ?? metadata.picture ?? null;

  return {
    avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
    displayName: String(displayName),
    email,
  };
}

export function ProfileOverview() {
  const [user, setUser] = useState<User | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setQuizResults([]);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        const sessionUser = data.session?.user ?? null;

        setUser(sessionUser);
        setQuizResults(sessionUser ? readQuizResults(sessionUser.id) : []);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;

      setUser(sessionUser);
      setQuizResults(sessionUser ? readQuizResults(sessionUser.id) : []);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const totalQuizzes = quizResults.length;
    const totalQuestions = quizResults.reduce(
      (total, result) => total + result.totalQuestions,
      0,
    );
    const totalCorrect = quizResults.reduce(
      (total, result) => total + result.correctCount,
      0,
    );
    const averageScore =
      totalQuizzes > 0
        ? Math.round(
            quizResults.reduce((total, result) => total + result.score, 0) /
              totalQuizzes,
          )
        : 0;
    const bestScore =
      totalQuizzes > 0
        ? Math.max(...quizResults.map((result) => result.score))
        : 0;

    return {
      averageScore,
      bestScore,
      totalCorrect,
      totalQuestions,
      totalQuizzes,
    };
  }, [quizResults]);

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
              <BarChart3 aria-hidden="true" size={18} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-semibold text-[#de990e]">
              Profil
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div>
          <p className="text-sm font-semibold text-[#1376ba]">
            Profil dan kemajuan
          </p>
        </div>

        {!user ? <LoggedOutState /> : null}

        {user ? (
          <LoggedInState
            profile={getProfileIdentity(user)}
            quizResults={quizResults}
            stats={stats}
          />
        ) : null}
      </section>
    </main>
  );
}

function LoggedOutState() {
  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-stretch">
      <div className="rounded-[28px] border border-[#dee1e6] bg-white p-5 md:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid size-20 shrink-0 place-items-center rounded-full bg-[#fff8ed] text-[#de990e]">
            <LockKeyhole aria-hidden="true" size={30} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold leading-8 text-[#0a0b0d]">
              Silakan login atau buat akun untuk melihat progress belajar Anda.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b616e]">
              Statistik kuis dan riwayat belajar akan tampil setelah akun aktif.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:pl-[100px]">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#de990e] px-6 text-sm font-semibold text-white transition hover:bg-[#bd7d08]"
            href="/login"
          >
            Masuk
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#dee1e6] px-6 text-sm font-semibold text-[#0a0b0d] transition hover:bg-[#f7f7f7]"
            href="/login"
          >
            Buat akun
          </Link>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#dee1e6] bg-[#f7f7f7] p-5 md:p-6">
        <p className="text-sm font-semibold text-[#0a0b0d]">
          Yang akan tersimpan
        </p>
        <div className="mt-5 grid gap-4">
          {[
            "Skor kuis terakhir dan terbaik",
            "Jumlah latihan yang diselesaikan",
            "Review jawaban untuk belajar ulang",
          ].map((item) => (
            <div className="flex items-start gap-3" key={item}>
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-white text-[#73a920]">
                <Sparkles aria-hidden="true" size={15} strokeWidth={2.5} />
              </span>
              <p className="text-sm leading-6 text-[#5b616e]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LoggedInState({
  profile,
  quizResults,
  stats,
}: {
  profile: ProfileIdentity;
  quizResults: QuizResult[];
  stats: {
    averageScore: number;
    bestScore: number;
    totalCorrect: number;
    totalQuestions: number;
    totalQuizzes: number;
  };
}) {
  const recentResults = quizResults.slice(0, 5);

  return (
    <section className="mt-6">
      <div className="rounded-[28px] border border-[#dee1e6] bg-white p-5 md:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f7f7f7] text-[#de990e] ring-1 ring-[#dee1e6]">
            {profile.avatarUrl ? (
              <img
                alt=""
                className="h-full w-full object-cover"
                src={profile.avatarUrl}
              />
            ) : (
              <UserRound aria-hidden="true" size={34} strokeWidth={2.3} />
            )}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold leading-8 text-[#0a0b0d]">
              {profile.displayName}
            </h1>
            <p className="mt-1 truncate text-sm leading-6 text-[#5b616e]">
              {profile.email}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BookOpenCheck}
          label="Kuis selesai"
          tone="blue"
          value={stats.totalQuizzes}
        />
        <StatCard
          icon={Trophy}
          label="Skor rata-rata"
          tone="amber"
          value={`${stats.averageScore}%`}
        />
        <StatCard
          icon={Medal}
          label="Skor terbaik"
          tone="green"
          value={`${stats.bestScore}%`}
        />
        <StatCard
          icon={Check}
          label="Jawaban benar"
          tone="neutral"
          value={`${stats.totalCorrect}/${stats.totalQuestions}`}
        />
      </div>

      <div className="mt-6 rounded-[28px] border border-[#dee1e6] bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#0a0b0d]">
              Riwayat kuis
            </p>
            <p className="mt-1 text-sm leading-6 text-[#5b616e]">
              Ringkasan latihan terakhir dari akun ini.
            </p>
          </div>
          <Link
            className="hidden h-10 items-center rounded-full bg-[#de990e] px-4 text-sm font-semibold text-white sm:inline-flex"
            href="/kuis"
          >
            Latihan lagi
          </Link>
        </div>

        {recentResults.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {recentResults.map((result) => (
              <article
                className="flex flex-col gap-3 rounded-[20px] border border-[#eef0f3] p-4 sm:flex-row sm:items-center sm:justify-between"
                key={result.id}
              >
                <div>
                  <p className="text-sm font-semibold text-[#0a0b0d]">
                    {result.category} - {result.level}
                  </p>
                  <p className="mt-1 text-sm text-[#5b616e]">
                    {new Date(result.completedAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#edf6df] px-3 py-1 text-sm font-semibold text-[#4f7f12]">
                    {result.correctCount}/{result.totalQuestions} benar
                  </span>
                  <span className="rounded-full bg-[#fff8ed] px-3 py-1 text-sm font-semibold text-[#9b6709]">
                    {result.score}%
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[22px] bg-[#f7f7f7] px-5 py-8 text-center">
            <p className="text-lg font-semibold text-[#0a0b0d]">
              Belum ada hasil kuis.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5b616e]">
              Selesaikan satu latihan kuis untuk mulai mengisi statistik.
            </p>
            <Link
              className="mt-5 inline-flex h-11 items-center rounded-full bg-[#de990e] px-5 text-sm font-semibold text-white"
              href="/kuis"
            >
              Mulai kuis
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

type StatCardProps = {
  icon: typeof BarChart3;
  label: string;
  tone: "amber" | "blue" | "green" | "neutral";
  value: number | string;
};

function StatCard({ icon: Icon, label, tone, value }: StatCardProps) {
  const toneClass = {
    amber: "bg-[#fff8ed] text-[#de990e]",
    blue: "bg-[#e5f0f9] text-[#1376ba]",
    green: "bg-[#edf6df] text-[#73a920]",
    neutral: "bg-[#f7f7f7] text-[#0a0b0d]",
  }[tone];

  return (
    <article className="rounded-[24px] border border-[#dee1e6] bg-white p-5">
      <span className={`grid size-10 place-items-center rounded-full ${toneClass}`}>
        <Icon aria-hidden="true" size={20} strokeWidth={2.4} />
      </span>
      <p className="mt-5 text-3xl font-normal text-[#0a0b0d]">{value}</p>
      <p className="mt-1 text-sm font-semibold text-[#5b616e]">{label}</p>
    </article>
  );
}
