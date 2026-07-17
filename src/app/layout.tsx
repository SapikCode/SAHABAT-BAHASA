import type { Metadata, Viewport } from "next";
import { AppToaster } from "@/components/AppToaster";
import "./globals.css";

const appName = "Chatbot Tolaki";
const appDescription =
  "Chatbot pintar untuk belajar bahasa, kosakata, ungkapan, cerita, dan budaya Tolaki.";
const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const appIcon = "/logo-transparan.png";

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
      { url: appIcon, type: "image/png" },
      { url: appIcon, sizes: "32x32", type: "image/png" },
      { url: appIcon, sizes: "192x192", type: "image/png" },
    ],
    shortcut: appIcon,
    apple: [{ url: appIcon, type: "image/png" }],
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
        url: appIcon,
        width: 1200,
        height: 630,
        alt: "Logo Chatbot Tolaki",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: appDescription,
    images: [appIcon],
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
