export type TolakiCultureSection = {
  title: string;
  body: string;
};

export type TolakiCultureTopic = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  hero_image_url: string | null;
  sections: TolakiCultureSection[];
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export const tolakiCultureCategories = [
  "Adat Istiadat",
  "Makanan Tradisional",
  "Pakaian Adat",
  "Nilai Budaya",
] as const;

export const fallbackTolakiCultureTopics: TolakiCultureTopic[] = [
  {
    id: "pernikahan-adat-tolaki",
    slug: "pernikahan-adat-tolaki",
    title: "Pernikahan Adat Tolaki",
    category: "Adat Istiadat",
    summary:
      "Gambaran awal tentang prosesi pernikahan adat Tolaki, nilai keluarga, busana, dan makna musyawarah dalam penyatuan dua keluarga.",
    hero_image_url: null,
    is_published: true,
    sections: [
      {
        title: "Cerita sejarah",
        body:
          "Pernikahan dalam budaya Tolaki tidak hanya dipahami sebagai ikatan dua orang, tetapi juga pertemuan dua keluarga besar. Prosesi adat menekankan penghormatan, komunikasi keluarga, dan kesepakatan bersama.",
      },
      {
        title: "Baju adat",
        body:
          "Busana adat digunakan sebagai simbol kehormatan dan identitas. Warna, aksesori, serta kerapian pakaian menunjukkan penghargaan terhadap keluarga dan tamu adat.",
      },
      {
        title: "Makna budaya",
        body:
          "Nilai utama yang ditonjolkan adalah sopan santun, tanggung jawab, dan persatuan. Dalam banyak prosesi, keluarga menjadi pusat pengambilan keputusan.",
      },
    ],
  },
  {
    id: "makanan-tradisional-sinonggi",
    slug: "makanan-tradisional-sinonggi",
    title: "Makanan Tradisional Sinonggi",
    category: "Makanan Tradisional",
    summary:
      "Pengenalan sinonggi sebagai makanan tradisional yang dekat dengan kehidupan masyarakat Tolaki dan sering hadir dalam suasana kebersamaan.",
    hero_image_url: null,
    is_published: true,
    sections: [
      {
        title: "Cerita sejarah",
        body:
          "Sinonggi dikenal sebagai makanan berbahan dasar sagu yang tumbuh dalam kebiasaan makan masyarakat setempat. Hidangan ini lekat dengan alam dan ketersediaan bahan pangan lokal.",
      },
      {
        title: "Cara penyajian",
        body:
          "Sinonggi biasanya disajikan bersama kuah ikan, sayur, atau lauk lain. Cara menyantapnya sering menjadi pengalaman budaya tersendiri bagi orang yang baru mengenalnya.",
      },
      {
        title: "Makna kebersamaan",
        body:
          "Makanan tradisional seperti sinonggi kerap hadir dalam momen keluarga dan pertemuan sosial. Ia menjadi penanda kedekatan, keramahan, dan identitas lokal.",
      },
    ],
  },
  {
    id: "kalosara",
    slug: "kalosara",
    title: "Kalosara",
    category: "Nilai Budaya",
    summary:
      "Kalosara dikenal sebagai simbol adat yang memuat nilai perdamaian, persatuan, penghormatan, dan penyelesaian masalah secara bermartabat.",
    hero_image_url: null,
    is_published: true,
    sections: [
      {
        title: "Cerita singkat",
        body:
          "Kalosara memiliki posisi penting dalam adat Tolaki. Simbol ini sering dihubungkan dengan tata nilai yang mengatur hubungan sosial masyarakat.",
      },
      {
        title: "Fungsi sosial",
        body:
          "Dalam konteks adat, Kalosara dapat menjadi penanda musyawarah, perdamaian, dan penghormatan terhadap keputusan bersama.",
      },
      {
        title: "Makna",
        body:
          "Nilai yang melekat pada Kalosara menekankan persatuan, kehormatan, dan keseimbangan dalam kehidupan bermasyarakat.",
      },
    ],
  },
];

export function slugifyCultureTitle(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseCultureSections(value: unknown): TolakiCultureSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const section = item as Record<string, unknown>;
      const title = typeof section.title === "string" ? section.title.trim() : "";
      const body = typeof section.body === "string" ? section.body.trim() : "";

      return title && body ? { title, body } : null;
    })
    .filter((item): item is TolakiCultureSection => Boolean(item));
}
