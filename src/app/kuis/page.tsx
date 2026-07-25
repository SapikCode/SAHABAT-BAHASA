import type { Metadata } from "next";
import { QuizExperience } from "@/components/quiz/QuizExperience";

export const metadata: Metadata = {
  title: "Kuis Bahasa Tolaki",
  description:
    "Uji pemahamanmu tentang kosakata, ungkapan, dan budaya Tolaki lewat kuis interaktif dengan berbagai tingkat kesulitan.",
  alternates: {
    canonical: "/kuis",
  },
  openGraph: {
    title: "Kuis Bahasa Tolaki | Chatbot Tolaki",
    description:
      "Uji pemahamanmu tentang kosakata, ungkapan, dan budaya Tolaki lewat kuis interaktif dengan berbagai tingkat kesulitan.",
    url: "/kuis",
  },
};

export default function KuisPage() {
  return <QuizExperience />;
}
