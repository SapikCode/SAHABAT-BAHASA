"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavigationItem = { label: string; href: string };

export function PublicMobileNav({
  activeHref,
  navigation,
}: {
  activeHref: string;
  navigation: NavigationItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative lg:hidden" ref={containerRef}>
      <button
        aria-controls="public-mobile-navigation"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
        className="flex size-8 items-center justify-center rounded-full border border-[#5a3a20]/25 bg-[#fff9ed]/80 text-[#4b2f1b] sm:size-10"
        onClick={() => setIsOpen((open) => !open)}
        ref={buttonRef}
        type="button"
      >
        <Menu aria-hidden="true" className="size-4 sm:size-5" />
      </button>
      {isOpen ? (
        <nav
          aria-label="Navigasi mobile"
          className="absolute right-0 top-10 z-30 flex w-48 flex-col rounded-2xl border border-[#dec9a9] bg-[#fffaf1] p-1.5 shadow-xl sm:top-12 sm:w-56 sm:p-2"
          id="public-mobile-navigation"
        >
          {navigation.map((item) => (
            <Link
              aria-current={item.href === activeHref ? "page" : undefined}
              className="rounded-xl px-3 py-2.5 text-xs font-semibold hover:bg-[#f2e8d8] sm:px-4 sm:py-3 sm:text-sm"
              href={item.href}
              key={item.label}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
