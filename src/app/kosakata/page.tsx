import type { Metadata } from "next";
import { VocabularyExplorer } from "@/components/vocabulary/VocabularyExplorer";

export const metadata: Metadata = {
  title: "Kosakata Bahasa Tolaki",
  description:
    "Jelajahi kosakata bahasa Tolaki lengkap dengan arti Bahasa Indonesia, contoh kalimat, dan kategori kata sehari-hari.",
  alternates: {
    canonical: "/kosakata",
  },
  openGraph: {
    title: "Kosakata Bahasa Tolaki | Chatbot Tolaki",
    description:
      "Jelajahi kosakata bahasa Tolaki lengkap dengan arti Bahasa Indonesia, contoh kalimat, dan kategori kata sehari-hari.",
    url: "/kosakata",
  },
};

export default function KosakataPage() {
  return <VocabularyExplorer />;
}
