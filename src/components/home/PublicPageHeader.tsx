import { PublicHeader } from "@/components/home/PublicHeader";
import type { ReactNode } from "react";

export function PublicPageHeader({
  activeHref,
  fixed = false,
  mobileMenu,
}: {
  activeHref?: string;
  fixed?: boolean;
  mobileMenu?: ReactNode;
}) {
  return (
    <div className={`${fixed ? "fixed left-0 top-0" : "relative"} z-50 w-full border-b border-[#e8ddca] bg-[#fffaf1]/95 text-[#3d291a] backdrop-blur-sm`}>
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <PublicHeader activeHref={activeHref ?? ""} mobileMenu={mobileMenu} />
      </div>
    </div>
  );
}
