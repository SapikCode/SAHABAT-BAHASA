export type QuizCategory =
  | "Kosakata"
  | "Kalimat"
  | "Ungkapan"
  | "Budaya";

export type QuizLevel = "Dasar" | "Menengah";

export type QuizQuestion = {
  id: string;
  category: QuizCategory;
  level: QuizLevel;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  learningPoint: string;
};

export const quizCategories: QuizCategory[] = [
  "Kosakata",
  "Kalimat",
  "Ungkapan",
  "Budaya",
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q-001",
    category: "Kosakata",
    level: "Dasar",
    prompt: "Apa arti kata Tolaki 'aahua'?",
    choices: ["Rumah", "Sumur", "Perut", "Kamu"],
    answerIndex: 1,
    explanation: "'aahua' berarti sumur.",
    learningPoint: "Kata benda dasar sering muncul dalam percakapan harian.",
  },
  {
    id: "q-002",
    category: "Kosakata",
    level: "Dasar",
    prompt: "Bahasa Tolaki untuk 'rumah' adalah...",
    choices: ["Raha", "Indo", "Meda", "Aki"],
    answerIndex: 0,
    explanation: "'raha' berarti rumah.",
    learningPoint: "Raha bisa dipakai saat membahas tempat tinggal.",
  },
  {
    id: "q-003",
    category: "Kosakata",
    level: "Dasar",
    prompt: "Kata Tolaki 'ndia' berarti...",
    choices: ["Punggung", "Perut", "Kaki", "Tangan"],
    answerIndex: 1,
    explanation: "'ndia' berarti perut.",
    learningPoint: "Kosakata bagian tubuh penting untuk kalimat sehari-hari.",
  },
  {
    id: "q-004",
    category: "Kosakata",
    level: "Dasar",
    prompt: "Kata Tolaki untuk 'kamu' adalah...",
    choices: ["Inaku", "Aki", "Iko", "Meda"],
    answerIndex: 2,
    explanation: "'iko' berarti kamu.",
    learningPoint: "Kata ganti membantu membuat percakapan terasa natural.",
  },
  {
    id: "q-005",
    category: "Kalimat",
    level: "Dasar",
    prompt: "Kalimat 'bukumu ine meda' paling dekat artinya...",
    choices: [
      "Bukumu di meja",
      "Bukumu di rumah",
      "Bukumu di sumur",
      "Bukumu sudah hilang",
    ],
    answerIndex: 0,
    explanation: "'bukumu ine meda' berarti bukumu di meja.",
    learningPoint: "Contoh kalimat bisa membantu menebak arti kata di dalamnya.",
  },
  {
    id: "q-006",
    category: "Kalimat",
    level: "Menengah",
    prompt: "Bentuk yang paling dekat untuk 'perutku sakit' adalah...",
    choices: [
      "Ndiaku morunggu",
      "Raha no meda",
      "Aahua iaku",
      "Iko indo dahui",
    ],
    answerIndex: 0,
    explanation: "'ndia' berarti perut dan '-ku' menunjukkan milik saya.",
    learningPoint: "Gabungan kata dapat membentuk makna yang lebih spesifik.",
  },
  {
    id: "q-007",
    category: "Kalimat",
    level: "Dasar",
    prompt: "Jika ingin menyapa kabar seseorang, frasa yang cocok adalah...",
    choices: [
      "Ompi karebamo?",
      "Ndiaku morunggu",
      "Bukumu ine meda",
      "Aahua no raha",
    ],
    answerIndex: 0,
    explanation: "'Ompi karebamo?' dipakai untuk menanyakan kabar.",
    learningPoint: "Sapaan adalah pintu masuk percakapan yang ramah.",
  },
  {
    id: "q-008",
    category: "Kalimat",
    level: "Dasar",
    prompt: "Balasan yang cocok untuk kabar baik adalah...",
    choices: ["Kareba mbeco", "Meda", "Morunggu", "Aahua"],
    answerIndex: 0,
    explanation: "'Kareba mbeco' dapat dipakai untuk menyatakan kabar baik.",
    learningPoint: "Latihan sapaan membuat percakapan terasa lebih hidup.",
  },
  {
    id: "q-009",
    category: "Ungkapan",
    level: "Menengah",
    prompt: "Dalam pembelajaran budaya, ungkapan dan pepatah paling berguna untuk...",
    choices: [
      "Menghafal angka saja",
      "Memahami nasihat dan nilai lokal",
      "Mengganti semua kosakata",
      "Menulis kode program",
    ],
    answerIndex: 1,
    explanation: "Ungkapan dan pepatah memuat nasihat, nilai, dan cara pandang masyarakat.",
    learningPoint: "Bahasa tidak hanya soal arti kata, tetapi juga nilai budaya.",
  },
  {
    id: "q-010",
    category: "Budaya",
    level: "Dasar",
    prompt: "Materi cerita dan budaya sebaiknya digunakan untuk...",
    choices: [
      "Menonton tanpa belajar",
      "Mengenal konteks adat, cerita, dan kehidupan lokal",
      "Menghapus fitur kamus",
      "Mengganti latihan kuis",
    ],
    answerIndex: 1,
    explanation: "Video budaya membantu pengguna melihat konteks bahasa dalam kehidupan nyata.",
    learningPoint: "Konteks budaya membuat pembelajaran bahasa lebih bermakna.",
  },
  {
    id: "q-011",
    category: "Kosakata",
    level: "Menengah",
    prompt: "Kata Tolaki 'morunggu' paling dekat artinya...",
    choices: ["Sakit", "Sehat", "Meja", "Buku"],
    answerIndex: 0,
    explanation: "'morunggu' dapat berarti sakit.",
    learningPoint: "Beberapa kata memiliki padanan yang perlu dilihat dari contoh kalimat.",
  },
  {
    id: "q-012",
    category: "Kosakata",
    level: "Dasar",
    prompt: "Kata Tolaki 'buku' berarti...",
    choices: ["Buku", "Sumur", "Rumah", "Adat"],
    answerIndex: 0,
    explanation: "'buku' dalam data awal berarti buku.",
    learningPoint: "Ada kata serapan atau bentuk yang mirip dengan bahasa Indonesia.",
  },
];

