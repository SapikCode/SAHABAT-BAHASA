"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  Film,
  Gauge,
  Library,
  LoaderIcon,
  LogOut,
  Menu,
  MessageSquareQuote,
  Search,
  Users,
  X,
} from "lucide-react";
import { showErrorToast } from "@/lib/app-toast";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import type { UserProfile } from "@/lib/supabase-auth";

type AdminShellProps = {
  children: React.ReactNode;
};

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/kamus-chatbot", label: "Kamus Chatbot", icon: Library },
  { href: "/admin/kosakata", label: "Kosakata", icon: BookOpen },
  { href: "/admin/ungkapan", label: "Ungkapan", icon: MessageSquareQuote },
  { href: "/admin/cerita-budaya", label: "Cerita Budaya", icon: Film },
  { href: "/admin/kuis", label: "Kuis", icon: ClipboardList },
  { href: "/admin/users", label: "Pengguna", icon: Users },
];

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      if (!supabase) {
        showErrorToast("Konfigurasi Supabase belum lengkap.");
        router.replace("/login?next=/admin");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,display_name,avatar_url,role")
        .eq("id", user.id)
        .single<UserProfile>();

      if (ignore) {
        return;
      }

      if (error || data?.role !== "admin") {
        showErrorToast("Akun ini belum punya akses admin.");
        router.replace("/");
        return;
      }

      setProfile(data);
      setIsLoading(false);
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [pathname, router, supabase]);

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login?next=/admin");
  }

  if (isLoading) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#fffdf9] px-6">
        <div className="rounded-full text-sm ">
          <LoaderIcon className="animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#fffdf9] text-[#141414]">
      <aside className="fixed left-0 top-0 z-40 hidden h-dvh w-72 border-r border-[#efe6d7] bg-white lg:flex lg:flex-col">
        <AdminSidebar
          onLogout={handleLogout}
          pathname={pathname}
          profile={profile}
        />
      </aside>

      {isMenuOpen ? (
        <button
          aria-label="Tutup menu admin"
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-[60] w-[84vw] max-w-80 border-r border-[#efe6d7] bg-white transition-transform duration-300 lg:hidden ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <AdminSidebar
          onClose={() => setIsMenuOpen(false)}
          onLogout={handleLogout}
          pathname={pathname}
          profile={profile}
        />
      </aside>

      <section className="min-h-dvh lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#efe6d7] bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label="Buka menu admin"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#eadfcd] text-[#4a4338] lg:hidden"
              onClick={() => setIsMenuOpen(true)}
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#de990e]">
                Admin
              </p>
              <h1 className="text-base font-bold text-[#141414] md:text-lg">
                Sahabat Bahasa Tolaki
              </h1>
            </div>
          </div>

          <Link
            className="hidden h-10 items-center gap-2 rounded-full border border-[#eadfcd] bg-white px-4 text-sm font-semibold text-[#4a4338] transition hover:border-[#de990e] hover:text-[#de990e] sm:flex"
            href="/"
          >
            <Search className="h-4 w-4" />
            Buka aplikasi
          </Link>
        </header>

        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
          {children}
        </div>
      </section>
    </main>
  );
}

function AdminSidebar({
  onClose,
  onLogout,
  pathname,
  profile,
}: {
  onClose?: () => void;
  onLogout: () => void;
  pathname: string;
  profile: UserProfile | null;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-[#efe6d7] px-5">
        <Link className="flex items-center gap-3" href="/admin" onClick={onClose}>
          <img
            alt="Sahabat Bahasa"
            className="h-11 w-11"
            src="/logo-sahabat-bahasa.png"
          />
          <div>
            <p className="text-sm font-bold text-[#141414]">Admin Panel</p>
            <p className="text-xs font-semibold text-[#de990e]">Tolaki CMS</p>
          </div>
        </Link>
        {onClose ? (
          <button
            aria-label="Tutup menu"
            className="grid h-9 w-9 place-items-center rounded-full text-[#6f6659] transition hover:bg-[#f7f3ea]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {adminLinks.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              className={`flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition ${isActive
                ? "bg-[#de990e] text-white"
                : "text-[#5e574d] hover:bg-[#f7f3ea] hover:text-[#141414]"
                }`}
              href={item.href}
              key={item.href}
              onClick={onClose}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#efe6d7] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[#f7f3ea] p-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-[#de990e]">
            {profile?.display_name?.slice(0, 1).toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#141414]">
              {profile?.display_name ?? "Admin"}
            </p>
            <p className="truncate text-xs text-[#766c5d]">{profile?.email}</p>
          </div>
        </div>
        <button
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#eadfcd] text-sm font-bold text-[#4a4338] transition hover:border-[#de990e] hover:text-[#de990e]"
          onClick={onLogout}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}
