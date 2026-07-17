import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chatbot Tolaki",
    short_name: "Tolaki",
    description:
      "Chatbot pintar untuk belajar bahasa, kosakata, ungkapan, cerita, dan budaya Tolaki.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8faf7",
    theme_color: "#166534",
    icons: [
      {
        src: "/logo-transparan.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo-transparan.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
