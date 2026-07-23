"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";
import {
  normalizeUsername,
  usernameToInternalEmail,
} from "@/lib/auth-username";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type AuthMode = "login" | "register";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      showErrorToast("Konfigurasi Supabase belum lengkap.");
      return;
    }

    setIsSubmitting(true);

    try {
      const username = normalizeUsername(loginId);
      const email = usernameToInternalEmail(username);

      if (mode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
        const payload = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(payload.message ?? "Gagal membuat akun.");
        }
      }

      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) {
        throw result.error;
      }

      showSuccessToast(
        mode === "login"
          ? "Berhasil masuk."
          : "Berhasil Buat Akun.",
      );
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Autentikasi gagal.";
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 flex items-center gap-3">
        <img
          alt="Sahabat Bahasa"
          className="h-14 w-14"
          src="logo-kamori.webp"
        />
        <div>
          <p className="text-sm font-semibold text-[#de990e]">
            Kamori
          </p>
          <h1 className="text-2xl font-bold text-[#101114]">
            {mode === "login" ? "Masuk akun" : "Buat akun"}
          </h1>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ece7dc] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="mb-5 grid grid-cols-2 rounded-full bg-[#f7f3ea] p-1">
          <button
            className={`h-10 rounded-full text-sm font-semibold transition ${mode === "login"
              ? "bg-white text-[#101114] shadow-sm"
              : "text-[#7b6e5d]"
              }`}
            onClick={() => setMode("login")}
            type="button"
          >
            Masuk
          </button>
          <button
            className={`h-10 rounded-full text-sm font-semibold transition ${mode === "register"
              ? "bg-white text-[#101114] shadow-sm"
              : "text-[#7b6e5d]"
              }`}
            onClick={() => setMode("register")}
            type="button"
          >
            Daftar
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#30323a]">
              Username
            </span>
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#e8e1d4] px-4 transition focus-within:border-[#de990e] focus-within:ring-4 focus-within:ring-[#de990e]/10">
              <UserRound className="h-4 w-4 text-[#8d8170]" />
              <input
                autoCapitalize="none"
                autoCorrect="off"
                className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
                onChange={(event) => setLoginId(event.target.value)}
                placeholder="nama_pengguna"
                required
                type="text"
                value={loginId}
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#30323a]">
              Password
            </span>
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#e8e1d4] px-4 transition focus-within:border-[#de990e] focus-within:ring-4 focus-within:ring-[#de990e]/10">
              <LockKeyhole className="h-4 w-4 text-[#8d8170]" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimal 6 karakter"
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                className="grid h-8 w-8 place-items-center rounded-full text-[#8d8170] transition hover:bg-[#f7f3ea] hover:text-[#101114]"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </label>

          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#de990e] px-5 text-sm font-bold text-white transition hover:bg-[#bd7d08] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "login" ? "Masuk" : "Buat akun"}
          </button>
        </form>
      </div>
    </div>
  );
}
