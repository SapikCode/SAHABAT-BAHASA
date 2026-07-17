import { NextResponse } from "next/server";
import { createEmbedding, createChatCompletion, vectorLiteral } from "@/lib/openrouter";
import { createPublicSupabaseClient } from "@/lib/supabase-server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type DictionaryMatch = {
  kata_tolaki: string;
  arti_indonesia: string;
  kalimat_tolaki: string | null;
  kalimat_indonesia: string | null;
  content: string;
  similarity: number;
};

type ChatIntent =
  | "translation"
  | "learning"
  | "expression"
  | "culture"
  | "quiz"
  | "general_chat";

type VocabularyMatch = {
  term_tolaki: string;
  meaning_indonesia: string;
  example_tolaki: string | null;
  example_indonesia: string | null;
  category: string;
  level: string;
};

type ExpressionMatch = {
  expression_tolaki: string;
  meaning_indonesia: string;
  description: string | null;
  context_note: string | null;
  category: string;
  expression_type: string;
};

type CultureVideoMatch = {
  title: string;
  description: string | null;
  category: string;
  youtube_url: string | null;
  duration_label: string | null;
};

type QuizQuestionMatch = {
  question: string;
  category: string;
  level: string;
  explanation: string | null;
  quiz_answers?: Array<{
    answer_text: string;
    is_correct: boolean;
    sort_order: number;
  }>;
};

const RAG_MATCH_COUNT = 8;
const HISTORY_MESSAGE_COUNT = 8;
const STOP_WORDS = new Set([
  "apa",
  "arti",
  "kata",
  "yang",
  "ini",
  "itu",
  "dan",
  "atau",
  "bahasa",
  "tolaki",
  "tolakinya",
  "dalam",
  "untuk",
  "jadi",
  "coba",
  "tolong",
  "indonesia",
  "terjemahkan",
  "translate",
  "artinya",
]);

const INTENT_PATTERNS: Record<ChatIntent, RegExp[]> = {
  translation: [
    /bahasa\s+tolaki/i,
    /tolakinya/i,
    /dalam\s+tolaki/i,
    /ke\s+tolaki/i,
    /terjemah/i,
    /translate/i,
    /\barti(?:nya)?\b/i,
    /\bmaksud\b/i,
    /\bpadanan\b/i,
  ],
  learning: [
    /\bajari\b/i,
    /\bbelajar\b/i,
    /\bpemula\b/i,
    /\bmateri\b/i,
    /mulai\s+dari\s+mana/i,
    /kata(?:-kata)?\s+sehari/i,
    /\bkosakata\b/i,
    /\bpercakapan\b/i,
    /\bngomong\b/i,
  ],
  expression: [
    /\bungkapan\b/i,
    /\bpepatah\b/i,
    /\bperibahasa\b/i,
    /\bnasihat\b/i,
    /\bpe'?olili\b/i,
    /\bbhitarandoka\b/i,
  ],
  culture: [
    /\bbudaya\b/i,
    /\badat\b/i,
    /\bcerita\b/i,
    /\bkalosara\b/i,
    /\bvideo\b/i,
    /\btradisi\b/i,
    /\bsejarah\b/i,
  ],
  quiz: [
    /\bkuis\b/i,
    /\bquiz\b/i,
    /\blatihan\b/i,
    /\btes\b/i,
    /\buji\b/i,
    /soal/i,
  ],
  general_chat: [],
};

function detectIntent(text: string): ChatIntent {
  const priority: ChatIntent[] = [
    "quiz",
    "expression",
    "culture",
    "learning",
    "translation",
  ];

  return (
    priority.find((intent) =>
      INTENT_PATTERNS[intent].some((pattern) => pattern.test(text)),
    ) ?? "general_chat"
  );
}

function getQueryTokens(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9']+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function wantsTolakiAnswer(text: string) {
  const query = text.toLowerCase();

  return (
    query.includes("bahasa tolaki") ||
    query.includes("tolakinya") ||
    query.includes("dalam tolaki") ||
    query.includes("ke tolaki") ||
    query.includes("terjemahkan")
  );
}

function wantsMeaningAnswer(text: string) {
  const query = text.toLowerCase();

  return query.includes("arti") || query.includes("artinya") || query.includes("maksud");
}

function buildExample(match: DictionaryMatch) {
  if (!match.kalimat_tolaki && !match.kalimat_indonesia) {
    return "";
  }

  if (match.kalimat_tolaki && match.kalimat_indonesia) {
    return `\n\nContoh: **${match.kalimat_tolaki}** artinya "${match.kalimat_indonesia}".`;
  }

  if (match.kalimat_tolaki) {
    return `\n\nContoh: **${match.kalimat_tolaki}**.`;
  }

  return `\n\nContoh Indonesia: "${match.kalimat_indonesia}".`;
}

function buildDirectAnswer(query: string, matches: DictionaryMatch[]) {
  const tokens = getQueryTokens(query);
  const topMatch = matches[0];

  if (!topMatch || tokens.length === 0) {
    return null;
  }

  if (tokens.length > 1) {
    return null;
  }

  if (wantsTolakiAnswer(query)) {
    const exactMatch = matches.find((match) =>
      tokens.some((token) => token === match.arti_indonesia.toLowerCase()),
    );

    if (exactMatch) {
      return `Bahasa Tolaki untuk **${exactMatch.arti_indonesia}** adalah **${exactMatch.kata_tolaki}**.${buildExample(exactMatch)}`;
    }
  }

  if (wantsMeaningAnswer(query)) {
    const exactMatch = matches.find((match) =>
      tokens.some((token) => token === match.kata_tolaki.toLowerCase()),
    );

    if (exactMatch) {
      return `**${exactMatch.kata_tolaki}** artinya **${exactMatch.arti_indonesia}**.${buildExample(exactMatch)}`;
    }
  }

  return null;
}

function buildContext(matches: DictionaryMatch[]) {
  return matches
    .map((match, index) => {
      const entryLabel = `Entri ${String.fromCharCode(65 + index)}`;
      const lines = [
        `${entryLabel}`,
        `Kata Tolaki: ${match.kata_tolaki}`,
        `Arti Indonesia: ${match.arti_indonesia}`,
      ];

      if (match.kalimat_tolaki) {
        lines.push(`Contoh Tolaki: ${match.kalimat_tolaki}`);
      }

      if (match.kalimat_indonesia) {
        lines.push(`Contoh Indonesia: ${match.kalimat_indonesia}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

function buildVocabularyContext(matches: VocabularyMatch[]) {
  if (matches.length === 0) {
    return "";
  }

  return matches
    .map((match, index) => {
      const lines = [
        `Kosakata ${index + 1}`,
        `Kata Tolaki: ${match.term_tolaki}`,
        `Arti Indonesia: ${match.meaning_indonesia}`,
        `Kategori: ${match.category}`,
        `Level: ${match.level}`,
      ];

      if (match.example_tolaki) {
        lines.push(`Contoh Tolaki: ${match.example_tolaki}`);
      }

      if (match.example_indonesia) {
        lines.push(`Contoh Indonesia: ${match.example_indonesia}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

function buildExpressionContext(matches: ExpressionMatch[]) {
  if (matches.length === 0) {
    return "";
  }

  return matches
    .map((match, index) => {
      const lines = [
        `Ungkapan ${index + 1}`,
        `Jenis: ${match.expression_type}`,
        `Kategori: ${match.category}`,
        `Ungkapan Tolaki: ${match.expression_tolaki}`,
        `Arti Indonesia: ${match.meaning_indonesia}`,
      ];

      if (match.description) {
        lines.push(`Makna: ${match.description}`);
      }

      if (match.context_note) {
        lines.push(`Konteks: ${match.context_note}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

function buildCultureContext(matches: CultureVideoMatch[]) {
  if (matches.length === 0) {
    return "";
  }

  return matches
    .map((match, index) => {
      const lines = [
        `Materi Budaya ${index + 1}`,
        `Judul: ${match.title}`,
        `Kategori: ${match.category}`,
      ];

      if (match.description) {
        lines.push(`Deskripsi: ${match.description}`);
      }

      if (match.duration_label) {
        lines.push(`Durasi: ${match.duration_label}`);
      }

      if (match.youtube_url) {
        lines.push(`URL YouTube: ${match.youtube_url}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

function buildQuizContext(matches: QuizQuestionMatch[]) {
  if (matches.length === 0) {
    return "";
  }

  return matches
    .map((match, index) => {
      const lines = [
        `Soal ${index + 1}`,
        `Kategori: ${match.category}`,
        `Level: ${match.level}`,
        `Pertanyaan: ${match.question}`,
      ];

      const answers = [...(match.quiz_answers ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );

      if (answers.length > 0) {
        lines.push(
          `Pilihan: ${answers
            .map((answer) =>
              answer.is_correct
                ? `${answer.answer_text} (jawaban benar)`
                : answer.answer_text,
            )
            .join("; ")}`,
        );
      }

      if (match.explanation) {
        lines.push(`Pembahasan: ${match.explanation}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

function buildCombinedContext({
  cultureMatches,
  dictionaryMatches,
  expressionMatches,
  quizMatches,
  vocabularyMatches,
}: {
  cultureMatches: CultureVideoMatch[];
  dictionaryMatches: DictionaryMatch[];
  expressionMatches: ExpressionMatch[];
  quizMatches: QuizQuestionMatch[];
  vocabularyMatches: VocabularyMatch[];
}) {
  const sections = [
    ["Kamus", buildContext(dictionaryMatches)],
    ["Kosakata Belajar", buildVocabularyContext(vocabularyMatches)],
    ["Ungkapan dan Pepatah", buildExpressionContext(expressionMatches)],
    ["Cerita Budaya", buildCultureContext(cultureMatches)],
    ["Kuis", buildQuizContext(quizMatches)],
  ].filter(([, content]) => content);

  if (sections.length === 0) {
    return "(Tidak ada catatan yang ditemukan.)";
  }

  return sections
    .map(([title, content]) => `### ${title}\n${content}`)
    .join("\n\n");
}

function buildModeInstruction(intent: ChatIntent) {
  const instructions: Record<ChatIntent, string> = {
    translation:
      "Mode jawaban: penerjemah dan kamus. Fokus pada arti kata, padanan Tolaki, dan contoh kalimat yang relevan. Jawab ringkas dulu, lalu jelaskan seperlunya.",
    learning:
      "Mode jawaban: tutor belajar. Susun materi bertahap, mulai dari kata/frasa yang mudah, beri arti, contoh pendek, dan ajak pengguna latihan ringan. Jangan hanya menerjemahkan satu kata.",
    expression:
      "Mode jawaban: tutor ungkapan budaya. Jelaskan ungkapan, arti, makna, konteks penggunaan, dan nilai budaya dengan bahasa sederhana.",
    culture:
      "Mode jawaban: pendamping budaya. Jelaskan konteks budaya, adat, cerita, atau materi video. Jika ada materi YouTube yang relevan, boleh rekomendasikan judulnya secara natural.",
    quiz:
      "Mode jawaban: pelatih kuis. Jika pengguna minta latihan, berikan soal singkat satu per satu atau arahkan ke halaman kuis bila cocok. Jangan langsung membocorkan semua jawaban kecuali user meminta review.",
    general_chat:
      "Mode jawaban: percakapan umum yang ramah. Jawab pertanyaan user secara natural. Jika pertanyaan jauh dari topik, jawab singkat lalu tawarkan jalur belajar bahasa atau budaya Tolaki secara halus.",
  };

  return instructions[intent];
}

function shouldUseDictionary(intent: ChatIntent, text: string) {
  if (intent === "translation" || intent === "general_chat") {
    return true;
  }

  return /\bkata\b|\barti\b|tolaki|terjemah|translate/i.test(text);
}

function getSafeSearchToken(value: string) {
  return (
    getQueryTokens(value)
      .map((token) => token.replace(/[^a-z0-9]/gi, ""))
      .find((token) => token.length >= 3) ?? ""
  );
}

async function fetchDictionaryMatches({
  latestUserMessage,
  supabase,
}: {
  latestUserMessage: string;
  supabase: ReturnType<typeof createPublicSupabaseClient>;
}) {
  const embedding = await createEmbedding(latestUserMessage);
  const { data: matches, error } = await supabase.rpc(
    "match_dictionary_documents",
    {
      p_query_embedding: vectorLiteral(embedding),
      p_match_count: RAG_MATCH_COUNT,
      p_query_text: latestUserMessage,
    },
  );

  if (error) {
    throw new Error(`Supabase match gagal: ${error.message}`);
  }

  return (matches ?? []) as DictionaryMatch[];
}

async function fetchVocabularyMatches({
  intent,
  latestUserMessage,
  supabase,
}: {
  intent: ChatIntent;
  latestUserMessage: string;
  supabase: ReturnType<typeof createPublicSupabaseClient>;
}) {
  const search = getSafeSearchToken(latestUserMessage);
  let query = supabase
    .from("vocabularies")
    .select(
      "term_tolaki,meaning_indonesia,example_tolaki,example_indonesia,category,level",
    )
    .eq("is_published", true)
    .order("created_at", { ascending: true })
    .limit(intent === "learning" ? 10 : 5);

  if (intent !== "learning" && search) {
    query = query.or(
      `term_tolaki.ilike.%${search}%,meaning_indonesia.ilike.%${search}%,example_tolaki.ilike.%${search}%,example_indonesia.ilike.%${search}%,category.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Supabase kosakata gagal: ${error.message}`);
  }

  return (data ?? []) as VocabularyMatch[];
}

async function fetchExpressionMatches({
  intent,
  latestUserMessage,
  supabase,
}: {
  intent: ChatIntent;
  latestUserMessage: string;
  supabase: ReturnType<typeof createPublicSupabaseClient>;
}) {
  const search = getSafeSearchToken(latestUserMessage);
  let query = supabase
    .from("expressions")
    .select(
      "expression_tolaki,meaning_indonesia,description,context_note,category,expression_type",
    )
    .eq("is_published", true)
    .order("created_at", { ascending: true })
    .limit(intent === "expression" ? 8 : 4);

  if (intent !== "expression" && search) {
    query = query.or(
      `title.ilike.%${search}%,expression_tolaki.ilike.%${search}%,meaning_indonesia.ilike.%${search}%,description.ilike.%${search}%,context_note.ilike.%${search}%,category.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Supabase ungkapan gagal: ${error.message}`);
  }

  return (data ?? []) as ExpressionMatch[];
}

async function fetchCultureMatches({
  intent,
  latestUserMessage,
  supabase,
}: {
  intent: ChatIntent;
  latestUserMessage: string;
  supabase: ReturnType<typeof createPublicSupabaseClient>;
}) {
  const search = getSafeSearchToken(latestUserMessage);
  let query = supabase
    .from("culture_videos")
    .select("title,description,category,youtube_url,duration_label")
    .eq("is_published", true)
    .order("created_at", { ascending: true })
    .limit(intent === "culture" ? 6 : 3);

  if (intent !== "culture" && search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Supabase budaya gagal: ${error.message}`);
  }

  return (data ?? []) as CultureVideoMatch[];
}

async function fetchQuizMatches({
  intent,
  latestUserMessage,
  supabase,
}: {
  intent: ChatIntent;
  latestUserMessage: string;
  supabase: ReturnType<typeof createPublicSupabaseClient>;
}) {
  const search = getSafeSearchToken(latestUserMessage);
  let query = supabase
    .from("quiz_questions")
    .select(
      "question,category,level,explanation,quiz_answers(answer_text,is_correct,sort_order)",
    )
    .eq("is_published", true)
    .order("created_at", { ascending: true })
    .order("sort_order", { referencedTable: "quiz_answers", ascending: true })
    .limit(intent === "quiz" ? 5 : 3);

  if (intent !== "quiz" && search) {
    query = query.or(
      `question.ilike.%${search}%,explanation.ilike.%${search}%,category.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Supabase kuis gagal: ${error.message}`);
  }

  return (data ?? []) as QuizQuestionMatch[];
}

function sanitizeAnswer(answer: string) {
  let normalizedAnswer = answer
    .replace(
      /(?:^|\n)\s*berdasarkan\s+(?:referensi|data|kamus|konteks|sumber)[^\n,.]*(?:[,.]\s*)?/gi,
      "",
    )
    .replace(
      /^\s*berdasarkan\s+(?:referensi|data|kamus|konteks|sumber|catatan)(?:\s+(?:yang\s+)?(?:saya\s+)?(?:miliki|dapatkan|baca|lihat))?\s*,?\s*/i,
      "",
    )
    .replace(/\s*\((?:dari|lihat|berdasarkan)\s+(?:referensi|data|sumber|konteks|catatan)\s*[^)]*\)/gi, "")
    .replace(/\s*(?:dari|lihat|berdasarkan)\s+(?:referensi|data|sumber|konteks|catatan)(?:\s+yang\s+saya\s+(?:lihat|miliki|baca))?\s*(?:\[[^\]]+\](?:\s*,\s*\[[^\]]+\])*)?/gi, "")
    .replace(/\s*(?:referensi|data|sumber|konteks|catatan)\s*\[[^\]]+\](?:\s*,\s*\[[^\]]+\])*/gi, "")
    .replace(/\s*(?:dari|lihat|berdasarkan)\s+(?:referensi|data|sumber|konteks|catatan)\s+[A-Z](?:\s*,\s*[A-Z])*/gi, "")
    .replace(/\s*\[(?:referensi|data|sumber|konteks|catatan)?\s*\d+\]/gi, "")
    .replace(/\*\*\*([^*\n]+?)\*\*\*/g, "**$1**")
    .replace(/\*([^*\n]+?)\*\*/g, "**$1**")
    .replace(/\*\*([^*\n]+?)\*/g, "**$1**")
    .replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, "$1")
    .replace(/[—–]/g, "-")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .trim();

  const boldMarkerCount = (normalizedAnswer.match(/\*\*/g) ?? []).length;

  if (boldMarkerCount % 2 !== 0) {
    normalizedAnswer = normalizedAnswer.replace(/\*\*/g, "");
  }

  return normalizedAnswer
    .replace(/\*\*\*([^*\n]+?)\*\*\*/g, "**$1**")
    .replace(/(?<!\*)\*(?!\*)/g, "");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      messages?: ChatMessage[];
      message?: string;
    };
    const messages = body.messages ?? [];
    const latestUserMessage =
      body.message ??
      [...messages].reverse().find((message) => message.role === "user")?.content;

    if (!latestUserMessage?.trim()) {
      return NextResponse.json(
        { error: "Pesan kosong. Tulis pertanyaan terlebih dahulu." },
        { status: 400 },
      );
    }

    const intent = detectIntent(latestUserMessage);
    const supabase = createPublicSupabaseClient();
    const useDictionary = shouldUseDictionary(intent, latestUserMessage);

    const [
      dictionaryMatches,
      vocabularyMatches,
      expressionMatches,
      cultureMatches,
      quizMatches,
    ] = await Promise.all([
      useDictionary
        ? fetchDictionaryMatches({ latestUserMessage, supabase })
        : Promise.resolve([] as DictionaryMatch[]),
      intent === "learning" || intent === "translation" || intent === "general_chat"
        ? fetchVocabularyMatches({ intent, latestUserMessage, supabase })
        : Promise.resolve([] as VocabularyMatch[]),
      intent === "expression" || intent === "culture" || intent === "general_chat"
        ? fetchExpressionMatches({ intent, latestUserMessage, supabase })
        : Promise.resolve([] as ExpressionMatch[]),
      intent === "culture" || intent === "general_chat"
        ? fetchCultureMatches({ intent, latestUserMessage, supabase })
        : Promise.resolve([] as CultureVideoMatch[]),
      intent === "quiz"
        ? fetchQuizMatches({ intent, latestUserMessage, supabase })
        : Promise.resolve([] as QuizQuestionMatch[]),
    ]);

    const directAnswer =
      intent === "translation"
        ? buildDirectAnswer(latestUserMessage, dictionaryMatches)
        : null;

    if (directAnswer) {
      return NextResponse.json({
        answer: directAnswer,
        intent,
        sources: dictionaryMatches.slice(0, 5).map((match) => ({
          kata_tolaki: match.kata_tolaki,
          arti_indonesia: match.arti_indonesia,
          similarity: match.similarity,
        })),
      });
    }

    const context = buildCombinedContext({
      cultureMatches,
      dictionaryMatches,
      expressionMatches,
      quizMatches,
      vocabularyMatches,
    });
    const previousMessages =
      messages.length > 0 ? messages.slice(0, -1).slice(-HISTORY_MESSAGE_COUNT) : [];
    const recentMessages = previousMessages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const rawAnswer = await createChatCompletion([
      {
        role: "system",
        content: [
          "Anda adalah Sahabat Bahasa, chatbot edukasi bahasa Tolaki yang ramah, natural, dan membantu.",
          "Jawab seperti asisten percakapan biasa, bukan seperti mesin penerjemah.",
          "Anda bisa mengartikan kata Tolaki, memberi padanan Tolaki dari bahasa Indonesia, membuat contoh kalimat sederhana, dan membantu pengguna belajar pelan-pelan.",
          buildModeInstruction(intent),
          "Gunakan catatan internal yang diberikan hanya untuk memilih kata, arti, dan contoh. Catatan itu adalah alat bantu diam-diam.",
          "Dilarang menyebut proses, catatan, sumber, referensi, nomor entri, data, kamus, konteks, database, vector, atau bahan internal kepada pengguna.",
          "Dilarang menulis frasa seperti berdasarkan referensi, dari referensi, dari catatan, catatan yang saya lihat, referensi [1], data yang saya miliki, kamus yang saya baca, atau sumber internal.",
          "Saat menjelaskan pecahan kata, tulis langsung arti kata tanpa menyebut asal catatan atau nomor sumber.",
          "Jika pengguna bertanya arti kata Tolaki, langsung jawab artinya dan beri contoh singkat jika ada.",
          "Jika pengguna meminta bahasa Tolaki dari kata Indonesia, cari dulu padanan langsung pada arti Indonesia. Jika tidak ada, boleh menyimpulkan kandidat dari pasangan Contoh Tolaki dan Contoh Indonesia ketika kata/frasa Indonesia tampak sejajar jelas dengan kata/frasa Tolaki di contoh.",
          "Untuk kandidat yang disimpulkan dari contoh kalimat, sampaikan dengan natural sebagai kemungkinan kuat atau bentuk yang terlihat dari contoh, bukan sebagai kepastian mutlak.",
          "Jika pengguna mengajak ngobrol biasa atau baru mulai belajar, jawab normal dulu dan tawarkan alur belajar. Jangan memaksakan kata atau contoh Tolaki jika pengguna belum meminta.",
          "Jika pengguna meminta diajari, jangan hanya menjawab definisi. Buat alur belajar singkat berisi 3-7 kata/frasa, arti, contoh sederhana, dan satu ajakan latihan.",
          "Jika pengguna meminta kuis, berikan latihan singkat secara interaktif. Untuk satu pertanyaan awal, jangan tampilkan semua pembahasan sebelum pengguna menjawab.",
          "Jika pengguna bertanya budaya atau video, jelaskan singkat dan rekomendasikan materi yang relevan jika tersedia. Jangan klaim sudah menonton video.",
          "Berikan contoh kalimat hanya jika contoh itu relevan langsung dengan pertanyaan pengguna dan tersedia di catatan internal.",
          "Jika catatan internal tidak cukup, katakan dengan natural bahwa Anda belum yakin untuk kata itu, lalu tawarkan alternatif pertanyaan atau minta kata yang lebih spesifik.",
          "Jangan mengarang istilah Tolaki yang tidak didukung catatan internal.",
          "Gunakan teks biasa tanpa emoji. Boleh gunakan Markdown bold **seperti ini** hanya untuk kata Tolaki, arti utama, atau poin penting. Pastikan setiap ** selalu punya pasangan penutup. Jangan gunakan italic, tabel, atau format rumit.",
        ].join("\n"),
      },
      {
        role: "user",
        content: `Intent terdeteksi: ${intent}\n\nCatatan internal untuk membantu jawaban. Pakai diam-diam sebagai bahan berpikir. Jangan sebut catatan, sumber, referensi, nomor entri, atau proses pengambilan data kepada pengguna:\n${context}`,
      },
      ...recentMessages,
      {
        role: "user",
        content: latestUserMessage,
      },
    ]);

    const answer = sanitizeAnswer(rawAnswer);

    return NextResponse.json({
      answer,
      intent,
      sources: dictionaryMatches.slice(0, 5).map((match) => ({
        kata_tolaki: match.kata_tolaki,
        arti_indonesia: match.arti_indonesia,
        similarity: match.similarity,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
