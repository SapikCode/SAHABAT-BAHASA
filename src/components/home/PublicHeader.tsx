import Link from "next/link";
import { PT_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { HomeAuthAction } from "@/components/home/HomeAuthAction";
import { PublicMobileNav } from "@/components/home/PublicMobileNav";
import { publicNavigation } from "@/components/home/public-navigation";

const displayFont = PT_Serif({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export function PublicHeader({ activeHref, mobileMenu }: { activeHref: string; mobileMenu?: ReactNode }) {
  return (
    <header className="relative z-20 flex min-h-16 items-center justify-between gap-2 py-2 lg:min-h-24 lg:gap-4 lg:py-3">
      <Link className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3" href="/" aria-label="Kamori, beranda">
        <img alt="" className="size-9 object-contain sm:size-11 lg:size-16" src="/logo-kamori.webp" />
        <span className="flex flex-col leading-none">
          <span className={`${displayFont.className} text-lg font-bold tracking-[0.04em] sm:text-2xl lg:text-[30px]`}>KAMORI</span>
          <span className="mt-1 hidden text-xs font-medium tracking-[0.16em] text-[#715a43] sm:block">SAHABAT BAHASA TOLAKI</span>
        </span>
      </Link>
      <nav aria-label="Navigasi utama" className="hidden items-center gap-3 lg:flex xl:gap-6">
        {publicNavigation.map((item) => (
          <Link
            aria-current={item.href === activeHref ? "page" : undefined}
            className={`whitespace-nowrap border-b-2 py-2 text-xs font-semibold transition hover:text-[#a97732] xl:text-sm ${item.href === activeHref ? "border-[#a97732]" : "border-transparent"}`}
            href={item.href}
            key={item.label}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <HomeAuthAction />
        {mobileMenu ?? <PublicMobileNav activeHref={activeHref} navigation={publicNavigation} />}
      </div>
    </header>
  );
}
