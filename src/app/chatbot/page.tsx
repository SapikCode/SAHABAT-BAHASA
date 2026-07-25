import type { Metadata } from "next";
import { ChatbotShell } from "@/components/chatbot/ChatbotShell";

export const metadata: Metadata = {
  title: "Chatbot Belajar Bahasa Tolaki",
  description:
    "Tanya arti kata, contoh kalimat, dan belajar bahasa Tolaki lewat percakapan interaktif dengan chatbot pintar Kamori.",
  alternates: {
    canonical: "/chatbot",
  },
  openGraph: {
    title: "Chatbot Belajar Bahasa Tolaki | Chatbot Tolaki",
    description:
      "Tanya arti kata, contoh kalimat, dan belajar bahasa Tolaki lewat percakapan interaktif dengan chatbot pintar Kamori.",
    url: "/chatbot",
  },
};

export default function ChatbotPage() {
  return <ChatbotShell />;
}
