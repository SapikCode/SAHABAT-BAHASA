import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Clapperboard,
  Landmark,
  MessageCircle,
  MessageSquareQuote,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { HomeAuthAction } from "@/components/home/HomeAuthAction";
import { PT_Serif } from "next/font/google";


const menuItems = [
  {
    title: "Chatbot",
    description: "Tanya arti kata, contoh kalimat, dan belajar lewat percakapan.",
    href: "/chatbot",
    icon: MessageCircle,
    accent: "bg-[#de990e]",
  },
  {
    title: "Kosakata",
    description: "Jelajahi kata Tolaki beserta arti dan contoh pemakaiannya.",
    href: "/kosakata",
    icon: BookOpen,
    accent: "bg-[#1376ba]",
  },
  {
    title: "Ungkapan",
    description: "Pelajari ungkapan tradisional, makna, dan konteks budaya.",
    href: "/ungkapan",
    icon: MessageSquareQuote,
    accent: "bg-[#2d9184]",
  },
  {
    title: "Budaya Tolaki",
    description: "Baca adat, makanan, pakaian, sejarah, dan makna budaya.",
    href: "/budaya-tolaki",
    icon: Landmark,
    accent: "bg-[#8d5b2f]",
  },
  {
    title: "Cerita Budaya",
    description: "Tonton cerita, tradisi, dan materi budaya Tolaki lewat video.",
    href: "/cerita-budaya",
    icon: Clapperboard,
    accent: "bg-[#9b3f5c]",
  },
  {
    title: "Kuis",
    description: "Uji pemahaman bahasa Tolaki dengan latihan interaktif.",
    href: "/kuis",
    icon: BrainCircuit,
    accent: "bg-[#4f7f12]",
  },
];

const instrumen = PT_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap'
})

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0a0b0d]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 md:px-6 md:py-8">
        <header className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-2" href="/">
            <img
              alt="Laika Tolaki"
              className="size-16 rounded-full mt-1 object-contain"
              src="/logo-kamori.webp"
            />
            <div>
              <p className="text-sm font-semibold text-[#de990e]">
                Kamori
              </p>
              <p className="text-xs font-medium text-[#7c828a]">
                Sahabat belajar bahasa Tolaki
              </p>
            </div>
          </Link>

          <HomeAuthAction />
        </header>


        {/* jadi flex row, kiri tulisan dan cta , kanan maskot besar, sesuaikan agar tetep responsive */}

        <div className="flex flex-1 flex-col justify-center gap-10 py-10 md:py-14">

          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[#1376ba]">
                Pilih fitur belajar
              </p>
              <h1 className={` ${instrumen.className} mt-3 text-[38px] font-light leading-tight text-[#0a0b0d] md:text-[56px]`}>
                Mau mulai belajar Bahasa Tolaki dari mana?
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#5b616e]">
                Pilih menu di bawah untuk masuk ke chatbot, daftar kosakata,
                ungkapan tradisional, budaya Tolaki, cerita budaya, atau kuis latihan.
              </p>

              {/* isi CTA dengan teks MULAI BELAJAR - menuju ke halaman chatbot dengan  WARNA #2d9184 */}
              <Link
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2d9184] px-6 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#257a70] focus:outline-none focus:ring-4 focus:ring-[#2d9184]/20"
                href="/chatbot"
              >
                Mulai Belajar
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>

            </div>

            {/* tambahkan maskot besar disini "\maskot.webp" disini */}
            <div className="flex justify-center lg:justify-end">
              <img
                alt="Maskot Kamori"
                className="w-full max-w-[500px] object-contain sm:max-w-[500px] lg:max-w-[600px]"
                src="/maskot.webp"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="group flex min-h-[180px] flex-col justify-between rounded-[8px] border border-[#e5e8ec] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#ccd3dc] hover:shadow-md"
                  href={item.href}
                  key={item.href}
                >
                  <span className={`flex size-11 items-center justify-center rounded-full text-white ${item.accent}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="flex items-center mt-2 justify-between gap-3 text-lg font-semibold text-[#111827]">
                      {item.title}
                      <ArrowRight className="size-4 shrink-0 text-[#9aa1ad] transition group-hover:translate-x-1 group-hover:text-[#111827]" aria-hidden="true" />
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-[#646b78]">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

        </div>
      </section>
      <Footer />
    </main>
  );
}
