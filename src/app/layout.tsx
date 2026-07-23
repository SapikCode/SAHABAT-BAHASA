import type { Metadata, Viewport } from "next";
import { AppToaster } from "@/components/AppToaster";
import "./globals.css";

const appName = "Kamori - Sahabat belajar bahasa Tolaki";
const appDescription =
  "Chatbot pintar untuk belajar bahasa, kosakata, ungkapan, cerita, dan budaya Tolaki.";
const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const appIcon = "/logo-kamori.webp";
const appOgImage = "/og-image.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: appName,
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  keywords: [
    "Chatbot Tolaki",
    "Bahasa Tolaki",
    "Budaya Tolaki",
    "Kamus Tolaki",
    "Belajar Bahasa Tolaki",
    "Kosakata Tolaki",
  ],
  authors: [{ name: "Chatbot Tolaki" }],
  creator: "Chatbot Tolaki",
  publisher: "Chatbot Tolaki",
  icons: {
    icon: [
      { url: appIcon, type: "image/webp" },
      { url: appIcon, sizes: "32x32", type: "image/webp" },
      { url: appIcon, sizes: "192x192", type: "image/webp" },
    ],
    shortcut: appIcon,
    apple: [{ url: appIcon, type: "image/webp" }],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: appName,
    title: appName,
    description: appDescription,
    images: [
      {
        url: appOgImage,
        width: 1200,
        height: 630,
        alt: "Kamori - Sahabat belajar bahasa Tolaki",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: appDescription,
    images: [appOgImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#166534",
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
