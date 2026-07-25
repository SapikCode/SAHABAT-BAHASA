import type { Metadata } from "next";
import { CultureVideoExplorer } from "@/components/culture/CultureVideoExplorer";

export const metadata: Metadata = {
  title: "Cerita Budaya Tolaki (Video)",
  description:
    "Tonton video cerita, tradisi, dan materi budaya Tolaki untuk mengenal lebih dalam adat dan sejarah masyarakat Tolaki.",
  alternates: {
    canonical: "/cerita-budaya",
  },
  openGraph: {
    title: "Cerita Budaya Tolaki (Video) | Chatbot Tolaki",
    description:
      "Tonton video cerita, tradisi, dan materi budaya Tolaki untuk mengenal lebih dalam adat dan sejarah masyarakat Tolaki.",
    url: "/cerita-budaya",
  },
};

export default function CeritaBudayaPage() {
  return <CultureVideoExplorer />;
}
