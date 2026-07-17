export type QuizResult = {
  id: string;
  category: string;
  level: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
};

const quizResultsBaseKey = "tolaki_quiz_results";

export function getQuizResultsKey(userId: string | null | undefined) {
  return `${quizResultsBaseKey}:${userId ?? "guest"}`;
}

export function readQuizResults(userId: string | null | undefined) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawResults = window.localStorage.getItem(getQuizResultsKey(userId));
    const parsedResults = rawResults ? JSON.parse(rawResults) : [];

    return Array.isArray(parsedResults) ? (parsedResults as QuizResult[]) : [];
  } catch {
    return [];
  }
}

export function saveQuizResult(
  userId: string | null | undefined,
  result: QuizResult,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const previousResults = readQuizResults(userId);

    window.localStorage.setItem(
      getQuizResultsKey(userId),
      JSON.stringify([result, ...previousResults].slice(0, 20)),
    );
  } catch {
    // Local progress is optional; Supabase persistence can replace this later.
  }
}
