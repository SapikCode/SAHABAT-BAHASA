import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PT_Serif } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { PublicHeader } from "@/components/home/PublicHeader";

const displayFont = PT_Serif({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Tentang Rizky Neguita Hanna dan pengembangan Kamori untuk belajar serta melestarikan Bahasa Tolaki.",
  alternates: { canonical: "/tentang-kami" },
};

export default function TentangKamiPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f8f2e9] text-[#3d291a]">
      <section className="relative isolate overflow-hidden bg-[url('/background-image.jpg')] bg-cover bg-[position:65%_center]">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,246,227,0.96)_0%,rgba(255,246,227,0.79)_45%,rgba(255,246,227,0.25)_100%)]" />
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <PublicHeader activeHref="/tentang-kami" />
          <div className="max-w-2xl pb-20 pt-12 sm:pb-24 sm:pt-14">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#865c2a]">Kamori</p>
            <h1 className={`${displayFont.className} mt-3 text-5xl font-bold leading-tight text-[#3e2817] sm:text-6xl`}>
              Tentang Kami
            </h1>
          </div>
        </div>
      </section>

      <section className="relative mx-auto -mt-14 w-full max-w-6xl flex-1 rounded-t-[44px] bg-[#f8f2e9] px-5 pb-20 pt-12 shadow-[0_-12px_40px_rgba(42,28,14,0.08)] sm:px-8 sm:pt-16 md:rounded-t-[64px] lg:px-14">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-5 sm:gap-7">
            <Image
              alt="Foto Rizky Neguita Hanna"
              className="size-24 shrink-0 rounded-full border-4 border-white object-cover object-[center_35%] shadow-[0_8px_24px_rgba(42,28,14,0.14)] sm:size-28"
              height={112}
              src="/rizky-neguita-hanna.png"
              width={112}
            />
            <h2 className={`${displayFont.className} text-2xl font-bold leading-tight text-[#3e2817] sm:text-3xl`}>
              Rizky Neguita Hanna, S.S., M.Pd.
            </h2>
          </div>
          <div className="mt-8 space-y-5 text-[15px] leading-8 text-[#5e4c3d] sm:text-base">
              <p>
                Saya Rizky Neguita Hanna, S.S., M.Pd., seorang pendidik dan mahasiswa doktoral Ilmu Manajemen Pendidikan yang memiliki ketertarikan pada pendidikan, bahasa, dan pelestarian budaya daerah.
              </p>
              <p>
                Saya percaya bahwa bahasa merupakan bagian penting dari identitas dan warisan budaya yang perlu dijaga agar tetap hidup di tengah perkembangan zaman. Ketertarikan tersebut mendorong saya untuk mengembangkan sebuah website yang berfokus pada pemertahanan Bahasa Tolaki melalui pemanfaatan teknologi digital.
              </p>
              <p>
                Melalui pengembangan website ini, saya berharap dapat menghadirkan ruang belajar yang interaktif, menarik, dan mudah diakses oleh masyarakat, khususnya generasi muda, untuk mengenal, mempelajari, dan menggunakan Bahasa Tolaki dalam kehidupan sehari-hari.
              </p>
              <p>
                Bagi saya, teknologi bukan hanya sarana untuk mengikuti perkembangan zaman, tetapi juga peluang untuk menjaga warisan budaya dan mewariskannya kepada generasi mendatang.
              </p>
          </div>
          <Link className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#4b2e19] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#70491f]" href="/">
            <ArrowLeft aria-hidden="true" className="size-4" /> Kembali ke Beranda
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
