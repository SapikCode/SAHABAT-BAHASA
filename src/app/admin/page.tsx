import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  Film,
  Library,
  MessageSquareQuote,
  Users,
} from "lucide-react";

const modules = [
  {
    href: "/admin/kamus-chatbot",
    title: "Kamus Chatbot",
    description: "Kelola data kamus RAG dan embedding untuk jawaban chatbot.",
    icon: Library,
    color: "#de990e",
  },
  {
    href: "/admin/kosakata",
    title: "Kosakata",
    description: "Materi kata sehari-hari untuk halaman belajar.",
    icon: BookOpen,
    color: "#73a920",
  },
  {
    href: "/admin/ungkapan",
    title: "Ungkapan",
    description: "Ungkapan, pepatah, dan nilai budaya lokal.",
    icon: MessageSquareQuote,
    color: "#1376ba",
  },
  {
    href: "/admin/cerita-budaya",
    title: "Cerita Budaya",
    description: "Video dan materi budaya yang diberikan klien.",
    icon: Film,
    color: "#de990e",
  },
  {
    href: "/admin/kuis",
    title: "Kuis",
    description: "Bank soal, pilihan jawaban, dan pembahasan.",
    icon: ClipboardList,
    color: "#73a920",
  },
  {
    href: "/admin/users",
    title: "Pengguna",
    description: "Profil user, role, dan progres belajar.",
    icon: Users,
    color: "#1376ba",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#efe6d7] bg-white p-5 shadow-sm md:p-6">
        <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#de990e]">
          Dashboard
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#141414] md:text-3xl">
          Pusat kelola konten Kamori
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6659]">
          Admin bisa mengelola kamus chatbot, materi belajar, video budaya,
          bank soal, dan progres pengguna dari satu tempat.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className="group rounded-[24px] border border-[#efe6d7] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#de990e]/50 hover:shadow-md"
              href={item.href}
              key={item.href}
            >
              <div
                className="mb-4 grid h-11 w-11 place-items-center rounded-2xl text-white"
                style={{ backgroundColor: item.color }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-[#141414]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#6f6659]">
                {item.description}
              </p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

