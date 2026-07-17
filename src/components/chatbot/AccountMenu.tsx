"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type AccountMenuProps = {
  displayName?: string | null;
  onNavigate?: () => void;
};

function getInitial(displayName?: string | null) {
  return displayName?.trim().slice(0, 1).toUpperCase() || "P";
}

export function AccountMenu({ displayName, onNavigate }: AccountMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();

    if (supabase) {
      await supabase.auth.signOut();
    }

    setIsOpen(false);
    onNavigate?.();
    router.refresh();
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="flex h-10 items-center gap-2 rounded-full border border-[#eadfcd] bg-white py-1 pl-1 pr-3 text-sm font-semibold text-[#4a4338] transition hover:border-[#de990e] hover:text-[#de990e]"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#fff3dc] text-sm font-black text-[#de990e]">
          {getInitial(displayName)}
        </span>
        <span className="max-w-28 truncate">{displayName ?? "Profil"}</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-[120] w-64 overflow-hidden rounded-3xl border border-[#eadfcd] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
          <div className="flex items-center gap-3 border-b border-[#efe6d7] p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff3dc] text-base font-black text-[#de990e]">
              {getInitial(displayName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#141414]">
                {displayName ?? "Pengguna"}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#8d8170]">
                Akun aktif
              </p>
            </div>
          </div>

          <div className="p-2">
            <Link
              className="flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-bold text-[#4a4338] transition hover:bg-[#f7f3ea] hover:text-[#141414]"
              href="/profil"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
            >
              <UserRound className="h-4 w-4" />
              Profil
            </Link>
            <button
              className="flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-bold text-[#9a3f2f] transition hover:bg-[#fff0ed]"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

