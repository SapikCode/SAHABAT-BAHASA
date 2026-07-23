"use client";

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccountMenu } from "@/components/chatbot/AccountMenu";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

function getDisplayName(session: Session | null) {
  const user = session?.user;

  if (!user) {
    return null;
  }

  const metadata = user.user_metadata ?? {};
  const name =
    metadata.display_name ??
    metadata.full_name ??
    metadata.name ??
    user.email?.replace("@sahabat-bahasa.local", "");

  return name ? String(name) : null;
}

export function HomeAuthAction() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const syncSession = useCallback((session: Session | null) => {
    setDisplayName(getDisplayName(session));
    setIsLoggedIn(Boolean(session?.user));
    setIsChecking(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsChecking(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        syncSession(data.session);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        syncSession(session);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase, syncSession]);

  if (isChecking) {
    return (
      <div className="hidden h-10 w-24 animate-pulse rounded-full bg-[#f1eee8] sm:block" />
    );
  }

  if (isLoggedIn) {
    return (
      <div className="hidden sm:block">
        <AccountMenu displayName={displayName} />
      </div>
    );
  }

  return (
    <Link
      className="hidden h-10 items-center rounded-full bg-[#de990e] px-5 text-sm font-semibold text-white transition hover:bg-[#bd7d08] sm:flex"
      href="/login"
    >
      Masuk
    </Link>
  );
}
