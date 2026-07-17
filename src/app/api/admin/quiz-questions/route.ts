import { NextResponse } from "next/server";
import {
  createSupabaseClientWithToken,
  getBearerToken,
} from "@/lib/supabase-auth";

const PAGE_SIZE = 10;
const MIN_ANSWERS = 2;

type QuizAnswerPayload = {
  id?: string;
  answer_text?: string;
  is_correct?: boolean;
};

type QuizQuestionPayload = {
  id?: string;
  question?: string;
  category?: string;
  level?: string;
  explanation?: string | null;
  is_published?: boolean;
  answers?: QuizAnswerPayload[];
};

function unauthorized() {
  return NextResponse.json(
    { message: "Sesi tidak valid. Silakan login ulang." },
    { status: 401 },
  );
}

function parseText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseOptionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function validatePayload(payload: QuizQuestionPayload) {
  const question = parseText(payload.question);
  const answers = (payload.answers ?? [])
    .map((answer, index) => ({
      answer_text: parseText(answer.answer_text),
      is_correct: Boolean(answer.is_correct),
      sort_order: index + 1,
    }))
    .filter((answer) => answer.answer_text);

  if (!question) {
    throw new Error("Pertanyaan wajib diisi.");
  }

  if (answers.length < MIN_ANSWERS) {
    throw new Error("Minimal ada 2 pilihan jawaban.");
  }

  if (answers.filter((answer) => answer.is_correct).length !== 1) {
    throw new Error("Harus ada tepat 1 jawaban benar.");
  }

  return {
    question: {
      question,
      category: parseText(payload.category, "Kosakata"),
      level: parseText(payload.level, "Dasar"),
      explanation: parseOptionalText(payload.explanation),
      is_published: payload.is_published ?? true,
    },
    answers,
  };
}

export async function GET(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category")?.trim();
  const level = searchParams.get("level")?.trim();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = createSupabaseClientWithToken(token);

  let query = supabase
    .from("quiz_questions")
    .select(
      "id,question,category,level,explanation,is_published,created_at,updated_at,quiz_answers(id,answer_text,is_correct,sort_order)",
      { count: "exact" },
    )
    .order("created_at", { ascending: true })
    .order("sort_order", { referencedTable: "quiz_answers", ascending: true })
    .range(from, to);

  if (category && category !== "Semua") {
    query = query.eq("category", category);
  }

  if (level && level !== "Semua") {
    query = query.eq("level", level);
  }

  if (search) {
    const escaped = search.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `question.ilike.%${escaped}%,explanation.ilike.%${escaped}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  return NextResponse.json({
    data,
    page,
    pageSize: PAGE_SIZE,
    total: count ?? 0,
  });
}

export async function POST(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  try {
    const payload = validatePayload((await request.json()) as QuizQuestionPayload);
    const supabase = createSupabaseClientWithToken(token);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return unauthorized();
    }

    const { data: question, error: questionError } = await supabase
      .from("quiz_questions")
      .insert({
        ...payload.question,
        created_by: userData.user.id,
      })
      .select("id")
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { message: questionError?.message ?? "Gagal membuat soal." },
        { status: 403 },
      );
    }

    const { error: answersError } = await supabase.from("quiz_answers").insert(
      payload.answers.map((answer) => ({
        ...answer,
        question_id: question.id,
      })),
    );

    if (answersError) {
      await supabase.from("quiz_questions").delete().eq("id", question.id);
      return NextResponse.json({ message: answersError.message }, { status: 403 });
    }

    return NextResponse.json({ id: question.id }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menambah soal.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as QuizQuestionPayload;
    const id = parseText(body.id);

    if (!id) {
      throw new Error("ID soal tidak valid.");
    }

    const payload = validatePayload(body);
    const supabase = createSupabaseClientWithToken(token);
    const { error: questionError } = await supabase
      .from("quiz_questions")
      .update(payload.question)
      .eq("id", id);

    if (questionError) {
      return NextResponse.json({ message: questionError.message }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("quiz_answers")
      .delete()
      .eq("question_id", id);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 403 });
    }

    const { error: answersError } = await supabase.from("quiz_answers").insert(
      payload.answers.map((answer) => ({
        ...answer,
        question_id: id,
      })),
    );

    if (answersError) {
      return NextResponse.json({ message: answersError.message }, { status: 403 });
    }

    return NextResponse.json({ id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui soal.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const id = parseText(searchParams.get("id"));

  if (!id) {
    return NextResponse.json({ message: "ID soal tidak valid." }, { status: 400 });
  }

  const supabase = createSupabaseClientWithToken(token);
  const { error } = await supabase.from("quiz_questions").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}

