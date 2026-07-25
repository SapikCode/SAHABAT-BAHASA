import { ArrowLeft, Landmark } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import type { TolakiCultureTopic } from "@/data/tolakiCulture";

export function TolakiCultureDetail({ topic }: { topic: TolakiCultureTopic }) {
  return (
    <main className="min-h-screen bg-white text-[#0a0b0d]">
      <header className="border-b border-[#eef0f3] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#5b616e] transition hover:bg-[#f7f7f7] hover:text-[#0a0b0d]"
            href="/budaya-tolaki"
          >
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.4} />
            Budaya Tolaki
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#de990e] text-white">
              <Landmark aria-hidden="true" size={18} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-semibold text-[#de990e]">
              Detail Budaya
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <article className="mx-auto max-w-5xl">
          {topic.hero_image_url ? (
            <div className="mb-8 overflow-hidden rounded-[24px] bg-[#f7f7f7]">
              <img
                alt={topic.title}
                className="aspect-[16/9] w-full object-cover"
                src={topic.hero_image_url}
              />
            </div>
          ) : null}

          <div className="border-b border-[#eef0f3] pb-8">
            <span className="rounded-full bg-[#edf6df] px-3 py-1 text-xs font-semibold text-[#4f7f12]">
              {topic.category}
            </span>
            <h1 className="mt-4 text-[30px] font-normal leading-tight text-[#0a0b0d] md:text-[56px]">
              {topic.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#5b616e]">
              {topic.summary}
            </p>
          </div>

          <nav className="mt-6 flex flex-wrap gap-2 border-b border-[#eef0f3] pb-6">
            {topic.sections.map((section, index) => (
              <a
                className="rounded-full bg-[#f7f7f7] px-4 py-2 text-sm font-semibold text-[#5b616e] transition hover:bg-[#f5ead7] hover:text-[#0a0b0d]"
                href={`#section-${index}`}
                key={section.title}
              >
                {section.title}
              </a>
            ))}
          </nav>

          <div className="mt-10 space-y-12">
            {topic.sections.map((section, index) => (
              <section id={`section-${index}`} key={section.title}>
                <h2 className="mt-2 text-2xl font-semibold leading-tight text-[#0a0b0d]">
                  {section.title}
                </h2>
                <p className="mt-2 whitespace-pre-line text-lg leading-9 text-[#374151]">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </article>
      </section>
      <Footer />
    </main>
  );
}
