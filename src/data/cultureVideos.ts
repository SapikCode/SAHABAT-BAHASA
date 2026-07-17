export type CultureVideoCategory =
  | "Cerita Rakyat"
  | "Adat"
  | "Bahasa"
  | "Seni"
  | "Kuliner"
  | "Sejarah";

export type CultureVideo = {
  id: string;
  title: string;
  description: string;
  category: CultureVideoCategory;
  duration: string;
  level: "Pemula" | "Menengah";
  youtubeId: string;
  learningPoints: string[];
};

export const cultureVideos: CultureVideo[] = [
  {
    id: "asal-usul-tolaki",
    title: "Asal-Usul Masyarakat Tolaki",
    description:
      "Pengantar singkat tentang latar masyarakat Tolaki, wilayah budaya, dan nilai yang hidup dalam keseharian.",
    category: "Sejarah",
    duration: "08:24",
    level: "Pemula",
    youtubeId: "ysz5S6PUM-U",
    learningPoints: ["Wilayah budaya", "Identitas lokal", "Nilai kebersamaan"],
  },
  {
    id: "kalosara",
    title: "Mengenal Kalosara",
    description:
      "Materi pengenalan simbol adat Kalosara sebagai tanda persatuan, penghormatan, dan penyelesaian masalah.",
    category: "Adat",
    duration: "11:10",
    level: "Pemula",
    youtubeId: "ScMzIvxBSi4",
    learningPoints: ["Simbol adat", "Musyawarah", "Rasa hormat"],
  },
  {
    id: "sapaan-tolaki",
    title: "Sapaan Sehari-Hari Bahasa Tolaki",
    description:
      "Latihan mendengar dan mengulang sapaan dasar untuk percakapan singkat dengan keluarga atau teman.",
    category: "Bahasa",
    duration: "06:45",
    level: "Pemula",
    youtubeId: "aqz-KE-bpKQ",
    learningPoints: ["Sapaan", "Pelafalan", "Percakapan awal"],
  },
  {
    id: "cerita-oheo",
    title: "Cerita Rakyat Oheo",
    description:
      "Animasi naratif tentang cerita rakyat yang bisa dipakai sebagai bahan menyimak dan mengenal nilai moral.",
    category: "Cerita Rakyat",
    duration: "13:30",
    level: "Menengah",
    youtubeId: "jNQXAC9IVRw",
    learningPoints: ["Alur cerita", "Tokoh", "Pesan moral"],
  },
  {
    id: "pepatah-dalam-keluarga",
    title: "Pepatah Tolaki dalam Keluarga",
    description:
      "Contoh ungkapan yang sering dikaitkan dengan nasihat keluarga, hormat kepada orang tua, dan sikap rendah hati.",
    category: "Bahasa",
    duration: "09:12",
    level: "Menengah",
    youtubeId: "M7lc1UVf-VE",
    learningPoints: ["Ungkapan", "Konteks", "Nilai keluarga"],
  },
  {
    id: "tari-tradisi",
    title: "Tari dan Ekspresi Budaya",
    description:
      "Pengantar visual tentang gerak, busana, dan makna ekspresi seni dalam kegiatan budaya lokal.",
    category: "Seni",
    duration: "10:05",
    level: "Pemula",
    youtubeId: "YE7VzlLtp-4",
    learningPoints: ["Gerak", "Busana", "Makna seni"],
  },
  {
    id: "makanan-tradisional",
    title: "Makanan Tradisional dan Kosakata Dapur",
    description:
      "Materi ringan untuk mengenal nama bahan, aktivitas memasak, dan budaya makan bersama.",
    category: "Kuliner",
    duration: "07:55",
    level: "Pemula",
    youtubeId: "eIho2S0ZahI",
    learningPoints: ["Kosakata dapur", "Bahan makanan", "Kebersamaan"],
  },
  {
    id: "adat-pernikahan",
    title: "Sekilas Adat Pernikahan Tolaki",
    description:
      "Gambaran umum tentang tahapan, etika, dan nilai penghormatan dalam prosesi adat pernikahan.",
    category: "Adat",
    duration: "12:18",
    level: "Menengah",
    youtubeId: "kJQP7kiw5Fk",
    learningPoints: ["Tahapan adat", "Etika keluarga", "Penghormatan"],
  },
  {
    id: "rumah-dan-kampung",
    title: "Kehidupan Kampung dan Rumah",
    description:
      "Belajar kosakata benda sekitar rumah sambil memahami suasana kehidupan kampung.",
    category: "Bahasa",
    duration: "05:40",
    level: "Pemula",
    youtubeId: "dQw4w9WgXcQ",
    learningPoints: ["Kosakata rumah", "Kegiatan harian", "Lingkungan"],
  },
  {
    id: "gotong-royong",
    title: "Gotong Royong dalam Budaya Lokal",
    description:
      "Materi tentang kerja bersama, saling membantu, dan nilai sosial yang menjaga hubungan masyarakat.",
    category: "Adat",
    duration: "08:50",
    level: "Pemula",
    youtubeId: "9bZkp7q19f0",
    learningPoints: ["Kerja bersama", "Solidaritas", "Tanggung jawab"],
  },
];

export const cultureVideoCategories: CultureVideoCategory[] = [
  "Cerita Rakyat",
  "Adat",
  "Bahasa",
  "Seni",
  "Kuliner",
  "Sejarah",
];

export function getCultureVideoById(id: string) {
  return cultureVideos.find((video) => video.id === id);
}

export function getCultureVideoThumbnail(video: CultureVideo) {
  return `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
}

export function getCultureVideoHref(video: CultureVideo) {
  return `/cerita-budaya/${video.id}`;
}
