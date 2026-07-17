import type { Metadata } from "next";
import { AppToaster } from "@/components/AppToaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chatbot Tolaki",
  description: "Chatbot pintar untuk belajar bahasa dan budaya Tolaki.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
