"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Crown,
  Loader2,
  Search,
  Shield,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type QuizAttempt = {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
  quiz_attempts: QuizAttempt[];
};

type UsersResponse = {
  data: ProfileRow[];
  page: number;
  pageSize: number;
  total: number;
};

function getDisplayEmail(email: string | null) {
  if (!email) {
    return "-";
  }

  return email.endsWith("@sahabat-bahasa.local")
    ? email.replace("@sahabat-bahasa.local", "")
    : email;
}

function getStats(attempts: QuizAttempt[]) {
  const completed = attempts.filter((attempt) => attempt.completed_at);
  const bestScore = completed.length
    ? Math.max(...completed.map((attempt) => attempt.score))
    : 0;
  const averageScore = completed.length
    ? Math.round(
        completed.reduce((total, attempt) => total + attempt.score, 0) /
          completed.length,
      )
    : 0;

  return {
    averageScore,
    bestScore,
    completedCount: completed.length,
  };
}

export function UserAdmin() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadUsers();
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

  async function loadUsers() {
    setIsLoading(true);

    try {
      const token = await getAccessToken();
      const params = new URLSearchParams({
        page: String(page),
      });

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await response.json()) as
        | UsersResponse
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in payload ? payload.message : "Gagal memuat pengguna.",
        );
      }

      const data = payload as UsersResponse;
      setRows(data.data);
      setTotal(data.total);
      setPageSize(data.pageSize);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memuat pengguna.";
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateRole(user: ProfileRow, role: "user" | "admin") {
    if (user.role === role) {
      return;
    }

    setUpdatingId(user.id);

    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user.id, role }),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Gagal mengubah role pengguna.");
      }

      showSuccessToast("Role pengguna diperbarui.");
      await loadUsers();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengubah role pengguna.";
      showErrorToast(message);
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const adminCount = rows.filter((row) => row.role === "admin").length;
  const quizUserCount = rows.filter(
    (row) => getStats(row.quiz_attempts ?? []).completedCount > 0,
  ).length;

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="rounded-[28px] border border-[#efe6d7] bg-white p-5 shadow-sm md:p-6">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#1376ba]">
            Pengguna
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#141414]">
            Kelola profil dan akses
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6659]">
            Lihat daftar akun, role admin/user, serta ringkasan progres kuis
            yang tersimpan di database.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 md:w-[360px]">
          <MiniStat icon={Users} label="User" value={total} />
          <MiniStat icon={Crown} label="Admin" value={adminCount} />
          <MiniStat icon={Trophy} label="Aktif" value={quizUserCount} />
        </div>
      </section>

      <section className="rounded-[28px] border border-[#efe6d7] bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex h-11 min-w-0 items-center gap-3 rounded-full border border-[#eadfcd] px-4 transition focus-within:border-[#1376ba] focus-within:ring-4 focus-within:ring-[#1376ba]/10 md:max-w-md md:flex-1">
            <Search className="h-4 w-4 shrink-0 text-[#8d8170]" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, username, email, atau role..."
              value={search}
            />
          </div>
          <p className="text-sm font-semibold text-[#6f6659]">
            {total.toLocaleString("id-ID")} pengguna
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#efe6d7]">
          <div className="hidden grid-cols-[1.2fr_160px_220px_180px] gap-3 border-b border-[#efe6d7] bg-[#f7f3ea] px-4 py-3 text-xs font-black uppercase tracking-[0.06em] text-[#6f6659] lg:grid">
            <span>Profil</span>
            <span>Role</span>
            <span>Progress kuis</span>
            <span>Akses</span>
          </div>

          {isLoading ? (
            <div className="grid min-h-48 place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#1376ba]" />
            </div>
          ) : rows.length ? (
            <div className="divide-y divide-[#efe6d7]">
              {rows.map((row) => {
                const stats = getStats(row.quiz_attempts ?? []);
                const displayName =
                  row.display_name ?? getDisplayEmail(row.email) ?? "Pengguna";

                return (
                  <article
                    className="grid gap-4 px-4 py-4 lg:grid-cols-[1.2fr_160px_220px_180px] lg:items-center"
                    key={row.id}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f7f3ea] text-[#de990e] ring-1 ring-[#eadfcd]">
                        {row.avatar_url ? (
                          <img
                            alt=""
                            className="h-full w-full object-cover"
                            src={row.avatar_url}
                          />
                        ) : (
                          <UserRound className="h-5 w-5" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-black text-[#141414]">
                          {displayName}
                        </h3>
                        <p className="mt-1 truncate text-sm text-[#6f6659]">
                          {getDisplayEmail(row.email)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-bold ${
                          row.role === "admin"
                            ? "bg-[#fff3dc] text-[#a66d07]"
                            : "bg-[#eef6fb] text-[#1376ba]"
                        }`}
                      >
                        {row.role === "admin" ? (
                          <Crown className="h-3.5 w-3.5" />
                        ) : (
                          <Shield className="h-3.5 w-3.5" />
                        )}
                        {row.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <ProgressPill label="Kuis" value={stats.completedCount} />
                      <ProgressPill label="Rata" value={`${stats.averageScore}%`} />
                      <ProgressPill label="Best" value={`${stats.bestScore}%`} />
                    </div>

                    <div className="flex gap-2 lg:justify-end">
                      <button
                        className={`h-10 rounded-full px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          row.role === "user"
                            ? "bg-[#1376ba] text-white"
                            : "border border-[#eadfcd] text-[#4a4338] hover:border-[#1376ba] hover:text-[#1376ba]"
                        }`}
                        disabled={updatingId === row.id}
                        onClick={() => updateRole(row, "user")}
                        type="button"
                      >
                        User
                      </button>
                      <button
                        className={`h-10 rounded-full px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          row.role === "admin"
                            ? "bg-[#de990e] text-white"
                            : "border border-[#eadfcd] text-[#4a4338] hover:border-[#de990e] hover:text-[#de990e]"
                        }`}
                        disabled={updatingId === row.id}
                        onClick={() => updateRole(row, "admin")}
                        type="button"
                      >
                        {updatingId === row.id ? "..." : "Admin"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="font-bold text-[#141414]">Pengguna tidak ditemukan.</p>
              <p className="mt-2 text-sm text-[#6f6659]">
                Coba kata pencarian lain.
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
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-[#efe6d7] bg-white p-4 shadow-sm">
      <Icon className="h-4 w-4 text-[#de990e]" />
      <p className="mt-3 text-2xl font-black text-[#141414]">{value}</p>
      <p className="text-xs font-bold uppercase tracking-[0.06em] text-[#8d8170]">
        {label}
      </p>
    </div>
  );
}

function ProgressPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-[#f7f3ea] px-2 py-2">
      <p className="text-sm font-black text-[#141414]">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#8d8170]">
        {label}
      </p>
    </div>
  );
}
