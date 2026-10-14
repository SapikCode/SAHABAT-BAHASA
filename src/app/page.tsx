import Link from "next/link";
import { PT_Serif } from "next/font/google";
import { ArrowRight, BookOpen, Clapperboard, Landmark, MessageCircle, MessageSquareQuote, Send, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";
import { PublicHeader } from "@/components/home/PublicHeader";

const displayFont = PT_Serif({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

const features = [
  { title: "Kosakata Tolaki", description: "Temukan kata Tolaki, arti, dan contoh pemakaiannya.", href: "/kosakata", icon: BookOpen, color: "#bc8a3c" },
  { title: "Ungkapan", description: "Kenali ungkapan tradisional dan makna di baliknya.", href: "/ungkapan", icon: MessageSquareQuote, color: "#588265" },
  { title: "Budaya Tolaki", description: "Jelajahi adat, sejarah, dan warisan budaya Tolaki.", href: "/budaya-tolaki", icon: Landmark, color: "#a85957" },
  { title: "Cerita Budaya", description: "Tonton kisah, tradisi, dan materi budaya lewat video.", href: "/cerita-budaya", icon: Clapperboard, color: "#568eab" },
  { title: "Kuis", description: "Uji pengetahuan bahasa dan budaya dengan latihan.", href: "/kuis", icon: Sparkles, color: "#8a699d" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f2e9] text-[#3d291a]">
      <section className="relative isolate min-h-[700px] overflow-hidden bg-[url('/background-image.jpg')] bg-cover bg-[position:65%_center] md:min-h-[690px] md:bg-center">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,246,227,0.94)_0%,rgba(255,246,227,0.84)_30%,rgba(255,246,227,0.33)_57%,rgba(255,246,227,0.02)_78%)] max-md:bg-[linear-gradient(180deg,rgba(255,246,227,0.95)_0%,rgba(255,246,227,0.86)_52%,rgba(255,246,227,0.12)_100%)]" />
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <PublicHeader activeHref="/" />
          <div className="relative z-10 max-w-[610px] pb-44 pt-14 sm:pt-20 md:pb-24 lg:pt-16">
            <p className={`${displayFont.className} text-lg italic text-[#70491f] sm:text-xl`}>Mokaramo, ma&apos;awali, mombesahi...</p>
            <h1 className={`${displayFont.className} mt-3 text-[clamp(2.65rem,4vw,4.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-[#3e2817]`}>
              Jaga Bahasa Tolaki,<br />Jaga Jati Diri Kita
            </h1>
            <p className="mt-5 max-w-[490px] text-[15px] leading-7 text-[#4e3b2d] sm:text-base">
              Selamat datang di Kamori, ruang digital untuk belajar, mengenal, dan melestarikan bahasa, budaya, serta kearifan lokal Tolaki dalam satu genggaman.
            </p>
            <form action="/chatbot" className="mt-7 flex max-w-[520px] items-center gap-2 rounded-full border border-[#e1cfb1] bg-[#fffaf2] p-1.5 shadow-[0_10px_30px_rgba(67,43,20,0.14)]" method="get">
              <MessageCircle aria-hidden="true" className="ml-3 size-5 shrink-0 text-[#805e38]" />
              <label className="sr-only" htmlFor="home-chat-prompt">Tanya Kamori</label>
              <input className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-[#3d291a] outline-none placeholder:text-[#947f6a] sm:text-base" id="home-chat-prompt" maxLength={500} name="prompt" placeholder="Tanya Kamori tentang bahasa Tolaki..." required type="text" />
              <button aria-label="Kirim pertanyaan ke chatbot" className="grid size-11 shrink-0 place-items-center rounded-full bg-[#aa7a36] text-white transition hover:bg-[#875c25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#875c25]" type="submit">
                <Send aria-hidden="true" className="size-[18px]" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section aria-labelledby="fitur-title" className="relative z-10 mx-auto -mt-24 max-w-[1440px] rounded-t-[44px] bg-[#f8f2e9] px-5 pb-10 pt-7 shadow-[0_-12px_40px_rgba(42,28,14,0.08)] sm:px-8 md:-mt-28 md:rounded-t-[76px] lg:px-12">
        <h2 className="sr-only" id="fitur-title">Jelajahi fitur Kamori</h2>
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link className="group flex min-h-52 flex-col items-center rounded-2xl px-5 py-4 text-center transition hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-[#aa7a36] lg:rounded-none lg:border-r lg:border-[#e7dbcb] lg:last:border-r-0" href={feature.href} key={feature.href}>
                <span className="grid size-14 place-items-center rounded-full text-white shadow-sm" style={{ backgroundColor: feature.color }}><Icon aria-hidden="true" className="size-7" strokeWidth={1.7} /></span>
                <span className={`${displayFont.className} mt-4 text-lg font-bold text-[#3e2817]`}>{feature.title}</span>
                <span className="mt-2 max-w-52 text-xs leading-5 text-[#6b5a4d]">{feature.description}</span>
                <ArrowRight aria-hidden="true" className="mt-auto size-4 translate-y-2 transition group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
        <div aria-hidden="true" className="mx-auto mt-5 flex max-w-[420px] items-center gap-3 text-[#b98a43]">
          <span className="h-px flex-1 bg-current" /><span className="text-xl">✦</span><span className="h-px flex-1 bg-current" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
