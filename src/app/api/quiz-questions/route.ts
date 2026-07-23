import { NextResponse } from "next/server";
import {
  quizQuestions as fallbackQuizQuestions,
  type QuizCategory,
  type QuizLevel,
  type QuizQuestion,
} from "@/data/quiz";
import { createPublicSupabaseClient } from "@/lib/supabase-server";

type QuizAnswerRow = {
  id: string;
  answer_text: string;
  is_correct: boolean;
  sort_order: number;
};

function normalizeQuizQuestion(row: Record<string, unknown>): QuizQuestion {
  const answers = ((row.quiz_answers as QuizAnswerRow[]) ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  const answerIndex = Math.max(
    answers.findIndex((answer) => answer.is_correct),
    0,
  );

  return {
    id: String(row.id),
    category: (row.category as QuizCategory) ?? "Kosakata",
    level: (row.level as QuizLevel) ?? "Dasar",
    prompt: String(row.question ?? ""),
    choices: answers.map((answer) => answer.answer_text),
    answerIndex,
    explanation: String(row.explanation ?? ""),
    learningPoint: "",
  };
}

export async function GET() {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("quiz_questions")
      .select(
        "id,question,category,level,explanation,is_published,created_at,quiz_answers(id,answer_text,is_correct,sort_order)",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: true })
      .order("sort_order", { referencedTable: "quiz_answers", ascending: true });

    if (error) {
      throw error;
    }

    const normalized = (data ?? [])
      .map((row) => normalizeQuizQuestion(row as Record<string, unknown>))
      .filter((question) => question.choices.length >= 2);

    return NextResponse.json({ data: normalized, source: "database" });
  } catch {
    return NextResponse.json({
      data: fallbackQuizQuestions,
      source: "fallback",
    });
  }
}
