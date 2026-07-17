"use client";

import { Drawer } from "vaul";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleQuestionMark,
  ListChecks,
  RotateCcw,
  SlidersHorizontal,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  quizCategories,
  quizQuestions,
  type QuizCategory,
  type QuizLevel,
  type QuizQuestion,
} from "@/data/quiz";
import { createClientId } from "@/lib/client-id";
import { saveQuizResult as saveStoredQuizResult } from "@/lib/quiz-results-storage";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

const allCategoriesLabel = "Semua";
const categoryOptions = [allCategoriesLabel, ...quizCategories] as const;
const levelOptions = ["Semua", "Dasar", "Menengah"] as const;

type QuizStage = "intro" | "playing" | "review";

function getQuestionStatus(question: QuizQuestion, selectedIndex?: number) {
  if (selectedIndex === undefined) {
    return "empty";
  }

  return selectedIndex === question.answerIndex ? "correct" : "wrong";
}

async function saveQuizResult({
  activeCategory,
  activeLevel,
  correctCount,
  filteredQuestions,
  score,
}: {
  activeCategory: QuizCategory | typeof allCategoriesLabel;
  activeLevel: QuizLevel | "Semua";
  correctCount: number;
  filteredQuestions: QuizQuestion[];
  score: number;
}) {
  const supabase = createBrowserSupabaseClient();
  const { data } = supabase
    ? await supabase.auth.getSession()
    : { data: { session: null } };
  const userId = data.session?.user.id ?? null;

  saveStoredQuizResult(userId, {
    id: createClientId("quiz"),
    category: activeCategory,
    level: activeLevel,
    score,
    correctCount,
    totalQuestions: filteredQuestions.length,
    completedAt: new Date().toISOString(),
  });
}

export function QuizExperience() {
  const [activeCategory, setActiveCategory] = useState<
    QuizCategory | typeof allCategoriesLabel
  >(allCategoriesLabel);
  const [activeLevel, setActiveLevel] = useState<QuizLevel | "Semua">("Semua");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [stage, setStage] = useState<QuizStage>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const filteredQuestions = useMemo(() => {
    return quizQuestions.filter((question) => {
      const matchesCategory =
        activeCategory === allCategoriesLabel || question.category === activeCategory;
      const matchesLevel = activeLevel === "Semua" || question.level === activeLevel;

      return matchesCategory && matchesLevel;
    });
  }, [activeCategory, activeLevel]);

  const currentQuestion = filteredQuestions[currentIndex] ?? filteredQuestions[0];
  const answeredCount = filteredQuestions.filter(
    (question) => answers[question.id] !== undefined,
  ).length;
  const correctCount = filteredQuestions.filter(
    (question) => answers[question.id] === question.answerIndex,
  ).length;
  const progress =
    filteredQuestions.length > 0
      ? Math.round((answeredCount / filteredQuestions.length) * 100)
      : 0;
  const score =
    filteredQuestions.length > 0
      ? Math.round((correctCount / filteredQuestions.length) * 100)
      : 0;

  function startQuiz() {
    setStage("playing");
    setCurrentIndex(0);
    setAnswers({});
  }

  function resetQuiz() {
    setStage("intro");
    setCurrentIndex(0);
    setAnswers({});
  }

  function selectAnswer(choiceIndex: number) {
    if (!currentQuestion) {
      return;
    }

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: choiceIndex,
    }));
  }

  function goNext() {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    void saveQuizResult({
      activeCategory,
      activeLevel,
      correctCount,
      filteredQuestions,
      score,
    });
    setStage("review");
  }

  function updateFilters(
    category: QuizCategory | typeof allCategoriesLabel,
    level: QuizLevel | "Semua",
  ) {
    setActiveCategory(category);
    setActiveLevel(level);
    resetQuiz();
  }

  return (
    <main className="min-h-screen bg-white pt-16 text-[#0a0b0d]">
      <header className="fixed left-0 top-0 z-50 w-full border-b border-[#eef0f3] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#5b616e] transition hover:bg-[#f7f7f7] hover:text-[#0a0b0d]"
            href="/"
          >
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.4} />
            Chatbot
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#de990e] text-white">
              <CircleQuestionMark aria-hidden="true" size={18} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-semibold text-[#de990e]">
              Latihan Kuis
            </span>
          </div>
        </div>
      </header>

      <section
        className={`mx-auto w-full px-4 py-8 md:px-6 md:py-12 ${stage === "intro" ? "max-w-6xl" : "max-w-4xl"
          }`}
      >
        {stage === "intro" ? (
          <IntroView
            activeCategory={activeCategory}
            activeLevel={activeLevel}
            filteredQuestions={filteredQuestions}
            isFilterDrawerOpen={isFilterDrawerOpen}
            setIsFilterDrawerOpen={setIsFilterDrawerOpen}
            startQuiz={startQuiz}
            updateFilters={updateFilters}
          />
        ) : null}

        {stage === "playing" && currentQuestion ? (
          <section>
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1376ba]">
                  Soal {currentIndex + 1} dari {filteredQuestions.length}
                </p>
                <p className="mt-1 text-sm text-[#5b616e]">
                  {answeredCount} soal sudah dijawab
                </p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#eef0f3] md:w-72">
                <div
                  className="h-full rounded-full bg-[#73a920] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <article className="rounded-[28px] border border-[#dee1e6] bg-white p-5 md:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#fff8ed] px-3 py-1 text-xs font-semibold text-[#9b6709]">
                  {currentQuestion.category}
                </span>
                <span className="rounded-full bg-[#edf6df] px-3 py-1 text-xs font-semibold text-[#4f7f12]">
                  {currentQuestion.level}
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-normal leading-9 text-[#0a0b0d] md:text-4xl md:leading-tight">
                {currentQuestion.prompt}
              </h2>

              <div className="mt-7 grid gap-3">
                {currentQuestion.choices.map((choice, choiceIndex) => {
                  const isSelected = answers[currentQuestion.id] === choiceIndex;

                  return (
                    <button
                      className={`flex min-h-14 items-center justify-between rounded-[20px] border px-4 py-3 text-left text-sm font-semibold leading-6 transition md:text-base ${isSelected
                        ? "border-[#de990e] bg-[#fff8ed] text-[#0a0b0d] shadow-[0_8px_24px_rgba(222,153,14,0.12)]"
                        : "border-[#dee1e6] bg-white text-[#0a0b0d] hover:border-[#de990e]"
                        }`}
                      key={choice}
                      onClick={() => selectAnswer(choiceIndex)}
                      type="button"
                    >
                      <span>{choice}</span>
                      {isSelected ? (
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#de990e] text-white">
                          <Check aria-hidden="true" size={14} strokeWidth={2.6} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#dee1e6] px-5 text-sm font-semibold text-[#5b616e] transition hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.4} />
                  Sebelumnya
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#de990e] px-5 text-sm font-semibold text-white transition hover:bg-[#bd7d08] disabled:cursor-not-allowed disabled:bg-[#d8c1a0]"
                  disabled={answers[currentQuestion.id] === undefined}
                  onClick={goNext}
                  type="button"
                >
                  {currentIndex === filteredQuestions.length - 1
                    ? "Lihat hasil"
                    : "Lanjut"}
                  <ArrowRight aria-hidden="true" size={17} strokeWidth={2.4} />
                </button>
              </div>
            </article>
          </section>
        ) : null}

        {stage === "review" ? (
          <ReviewView
            answers={answers}
            correctCount={correctCount}
            filteredQuestions={filteredQuestions}
            resetQuiz={resetQuiz}
            score={score}
            startQuiz={startQuiz}
          />
        ) : null}
      </section>
    </main>
  );
}

type IntroViewProps = {
  activeCategory: QuizCategory | typeof allCategoriesLabel;
  activeLevel: QuizLevel | "Semua";
  filteredQuestions: QuizQuestion[];
  isFilterDrawerOpen: boolean;
  setIsFilterDrawerOpen: (isOpen: boolean) => void;
  startQuiz: () => void;
  updateFilters: (
    category: QuizCategory | typeof allCategoriesLabel,
    level: QuizLevel | "Semua",
  ) => void;
};

function IntroView({
  activeCategory,
  activeLevel,
  filteredQuestions,
  isFilterDrawerOpen,
  setIsFilterDrawerOpen,
  startQuiz,
  updateFilters,
}: IntroViewProps) {
  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1fr_200px] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-[#1376ba]">
            Belajar sambil menguji ingatan
          </p>
          <h1 className="mt-3 max-w-3xl text-[38px] font-normal leading-tight text-[#0a0b0d] md:text-[56px]">
            Kuis Tolaki yang ringkas, interaktif, dan mudah direview.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#5b616e]">
            Latih kosakata, kalimat, sapaan, ungkapan, dan pemahaman budaya
            melalui soal pilihan ganda dengan ulasan jawaban.
          </p>
        </div>

        {/* <div className="rounded-[24px] border border-[#dee1e6] bg-[#f7f7f7] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#7c828a]">
                Bank soal awal
              </p>
              <p className="mt-2 text-4xl font-normal text-[#0a0b0d]">
                {filteredQuestions.length}
              </p>
            </div>
            <span className="grid size-12 place-items-center rounded-full bg-[#edf6df] text-[#73a920]">
              <ListChecks aria-hidden="true" size={23} strokeWidth={2.4} />
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#5b616e]">
            Soal masih dummy terstruktur, siap diganti atau ditambah dari
            database ketika materi final sudah disetujui klien.
          </p>
        </div> */}
      </div>

      <div className="mt-8 border-y border-[#eef0f3] bg-white py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="hidden flex-wrap gap-2 md:flex">
            {categoryOptions.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  className={`h-10 rounded-full px-4 text-sm font-semibold transition ${isActive
                    ? "bg-[#de990e] text-white"
                    : "bg-[#f7f7f7] text-[#5b616e] hover:bg-[#f5ead7] hover:text-[#0a0b0d]"
                    }`}
                  key={category}
                  onClick={() =>
                    updateFilters(
                      category as QuizCategory | typeof allCategoriesLabel,
                      activeLevel,
                    )
                  }
                  type="button"
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="hidden rounded-full bg-[#f7f7f7] p-1 md:flex">
            {levelOptions.map((level) => {
              const isActive = activeLevel === level;

              return (
                <button
                  className={`h-9 rounded-full px-4 text-sm font-semibold transition ${isActive
                    ? "bg-white text-[#0a0b0d] shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                    : "text-[#5b616e] hover:text-[#0a0b0d]"
                    }`}
                  key={level}
                  onClick={() =>
                    updateFilters(activeCategory, level as QuizLevel | "Semua")
                  }
                  type="button"
                >
                  {level}
                </button>
              );
            })}
          </div>

          <Drawer.Root
            open={isFilterDrawerOpen}
            onOpenChange={setIsFilterDrawerOpen}
          >
            <Drawer.Trigger asChild>
              <button
                className="flex h-11 items-center justify-between rounded-full border border-[#dee1e6] bg-[#f7f7f7] px-4 text-sm font-semibold text-[#0a0b0d] md:hidden"
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal
                    aria-hidden="true"
                    size={17}
                    strokeWidth={2.4}
                  />
                  Pilihan kuis
                </span>
                <span className="text-[#de990e]">
                  {activeCategory} - {activeLevel}
                </span>
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 z-40 bg-black/45" />
              <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] rounded-t-[28px] bg-white px-4 pb-5 pt-3 outline-none">
                <div className="mx-auto h-1.5 w-12 rounded-full bg-[#dee1e6]" />
                <div className="mx-auto mt-5 max-w-md">
                  <Drawer.Title className="text-lg font-semibold text-[#0a0b0d]">
                    Filter kuis
                  </Drawer.Title>
                  <Drawer.Description className="mt-1 text-sm leading-6 text-[#5b616e]">
                    Pilih tema dan tingkat soal yang ingin dikerjakan.
                  </Drawer.Description>

                  <div className="mt-5 max-h-[calc(70vh-132px)] overflow-y-auto pr-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#7c828a]">
                      Kategori
                    </p>
                    <div className="mt-2 grid gap-2">
                      {categoryOptions.map((category) => {
                        const isActive = activeCategory === category;

                        return (
                          <button
                            className={`flex h-12 items-center justify-between rounded-2xl px-4 text-left text-sm font-semibold transition ${isActive
                              ? "bg-[#f5ead7] text-[#0a0b0d]"
                              : "bg-white text-[#5b616e] hover:bg-[#f7f7f7]"
                              }`}
                            key={category}
                            onClick={() =>
                              updateFilters(
                                category as
                                | QuizCategory
                                | typeof allCategoriesLabel,
                                activeLevel,
                              )
                            }
                            type="button"
                          >
                            {category}
                            {isActive ? (
                              <Check
                                aria-hidden="true"
                                className="text-[#73a920]"
                                size={18}
                                strokeWidth={2.5}
                              />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.04em] text-[#7c828a]">
                      Level
                    </p>
                    <div className="mt-2 grid gap-2">
                      {levelOptions.map((level) => {
                        const isActive = activeLevel === level;

                        return (
                          <button
                            className={`flex h-12 items-center justify-between rounded-2xl px-4 text-left text-sm font-semibold transition ${isActive
                              ? "bg-[#edf6df] text-[#0a0b0d]"
                              : "bg-white text-[#5b616e] hover:bg-[#f7f7f7]"
                              }`}
                            key={level}
                            onClick={() =>
                              updateFilters(
                                activeCategory,
                                level as QuizLevel | "Semua",
                              )
                            }
                            type="button"
                          >
                            {level}
                            {isActive ? (
                              <Check
                                aria-hidden="true"
                                className="text-[#73a920]"
                                size={18}
                                strokeWidth={2.5}
                              />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      className="mt-5 h-11 w-full rounded-full bg-[#de990e] text-sm font-semibold text-white"
                      onClick={() => setIsFilterDrawerOpen(false)}
                      type="button"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[28px] border border-[#dee1e6] bg-white p-5 md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-[#e5f0f9] text-[#1376ba]">
              <BookOpen aria-hidden="true" size={21} strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#7c828a]">
                Paket latihan
              </p>
              <p className="text-xl font-semibold text-[#0a0b0d]">
                {activeCategory} - {activeLevel}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[20px] bg-[#f7f7f7] p-4">
              <p className="text-3xl font-normal text-[#0a0b0d]">
                {filteredQuestions.length}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#5b616e]">Soal</p>
            </div>
            <div className="rounded-[20px] bg-[#fff8ed] p-4">
              <p className="text-3xl font-normal text-[#de990e]">
                {activeLevel}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#5b616e]">Level</p>
            </div>
            <div className="rounded-[20px] bg-[#edf6df] p-4">
              <p className="text-3xl font-normal text-[#73a920]">Review</p>
              <p className="mt-1 text-sm font-semibold text-[#5b616e]">
                Setelah selesai
              </p>
            </div>
          </div>

          <button
            className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#de990e] px-6 text-sm font-semibold text-white transition hover:bg-[#bd7d08] sm:w-auto"
            disabled={filteredQuestions.length === 0}
            onClick={startQuiz}
            type="button"
          >
            Mulai kuis
            <ArrowRight aria-hidden="true" size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="rounded-[28px] border border-[#dee1e6] bg-[#f7f7f7] p-5">
          <p className="text-sm font-semibold text-[#0a0b0d]">Alur kuis</p>
          <div className="mt-4 grid gap-3">
            {["Pilih tema dan level", "Jawab satu per satu", "Lihat skor dan review"].map(
              (item, index) => (
                <div className="flex items-center gap-3" key={item}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold text-[#de990e]">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-[#5b616e]">{item}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </>
  );
}

type ReviewViewProps = {
  answers: Record<string, number>;
  correctCount: number;
  filteredQuestions: QuizQuestion[];
  resetQuiz: () => void;
  score: number;
  startQuiz: () => void;
};

function ReviewView({
  answers,
  correctCount,
  filteredQuestions,
  resetQuiz,
  score,
  startQuiz,
}: ReviewViewProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-[28px] border border-[#dee1e6] bg-[#f7f7f7] p-5 lg:sticky lg:top-6 lg:self-start">
        <span className="grid size-12 place-items-center rounded-full bg-[#fff8ed] text-[#de990e]">
          <Trophy aria-hidden="true" size={24} strokeWidth={2.5} />
        </span>
        <p className="mt-5 text-sm font-semibold text-[#7c828a]">Skor akhir</p>
        <p className="mt-2 text-6xl font-normal text-[#0a0b0d]">{score}</p>
        <p className="mt-2 text-sm leading-6 text-[#5b616e]">
          {correctCount} dari {filteredQuestions.length} jawaban benar.
        </p>
        <button
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#de990e] px-5 text-sm font-semibold text-white transition hover:bg-[#bd7d08]"
          onClick={startQuiz}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={17} strokeWidth={2.4} />
          Ulangi kuis
        </button>
        <button
          className="mt-3 h-11 w-full rounded-full border border-[#dee1e6] bg-white text-sm font-semibold text-[#5b616e] transition hover:text-[#0a0b0d]"
          onClick={resetQuiz}
          type="button"
        >
          Ganti Soal
        </button>
      </aside>

      <div className="grid gap-3">
        {filteredQuestions.map((question, index) => {
          const selectedIndex = answers[question.id];
          const status = getQuestionStatus(question, selectedIndex);

          return (
            <article
              className="rounded-[24px] border border-[#dee1e6] bg-white p-5"
              key={question.id}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full ${status === "correct"
                    ? "bg-[#edf6df] text-[#73a920]"
                    : "bg-[#fff8ed] text-[#de990e]"
                    }`}
                >
                  {status === "correct" ? (
                    <Check aria-hidden="true" size={18} strokeWidth={2.6} />
                  ) : (
                    <X aria-hidden="true" size={18} strokeWidth={2.6} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#7c828a]">
                    Soal {index + 1} - {question.category}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-7 text-[#0a0b0d]">
                    {question.prompt}
                  </h3>
                  <div className="mt-4 grid gap-2 text-sm leading-6">
                    <p className="text-[#5b616e]">
                      Jawabanmu:{" "}
                      <span className="font-semibold text-[#0a0b0d]">
                        {selectedIndex !== undefined
                          ? question.choices[selectedIndex]
                          : "Belum dijawab"}
                      </span>
                    </p>
                    <p className="text-[#5b616e]">
                      Jawaban benar:{" "}
                      <span className="font-semibold text-[#73a920]">
                        {question.choices[question.answerIndex]}
                      </span>
                    </p>
                    <p className="text-[#0a0b0d]">{question.explanation}</p>
                    <p className="rounded-2xl bg-[#f7f7f7] px-4 py-3 text-[#5b616e]">
                      {question.learningPoint}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
