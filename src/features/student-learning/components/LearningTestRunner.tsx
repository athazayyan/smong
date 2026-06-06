"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Compass,
  FileQuestion,
  Layers3,
  ListChecks,
  RotateCcw,
  Route,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  LearningTest,
  ModuleChapter,
  QuestionType,
  TestAnswerOption,
  TestKind,
  TestQuestion,
} from "@/features/student-learning/types";

type SelectedTestAnswer = {
  questionId: string;
  optionId: string;
  isCorrect: boolean;
  earnedPoints: number;
};

type TestRunnerPhase = "answering" | "finished";

interface LearningTestRunnerProps {
  chapter: ModuleChapter;
  test: LearningTest;
  questions: TestQuestion[];
}

export function LearningTestRunner({ chapter, test, questions }: LearningTestRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SelectedTestAnswer[]>([]);
  const [phase, setPhase] = useState<TestRunnerPhase>("answering");
  const shouldReduceMotion = useReducedMotion();

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? getSelectedAnswer(answers, currentQuestion.id) : undefined;
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercent = Math.round(((currentIndex + (currentAnswer ? 1 : 0)) / questions.length) * 100);
  const totalPossiblePoints = questions.reduce((total, question) => total + question.points, 0);
  const earnedPoints = answers.reduce((total, answer) => total + answer.earnedPoints, 0);
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const score = totalPossiblePoints > 0
    ? Math.round((earnedPoints / totalPossiblePoints) * 100)
    : Math.round((correctCount / questions.length) * 100);
  const requiredScore = getRequiredScore(test.kind, test.requiredScore);
  const passed = test.kind === "pre-test" || score >= requiredScore;

  const questionPanels = useMemo(
    () => questions.map((question, index) => ({
      question,
      index,
      isAnswered: getSelectedAnswer(answers, question.id) !== undefined,
    })),
    [answers, questions]
  );

  function handleSelect(option: TestAnswerOption) {
    if (!currentQuestion || currentAnswer) return;

    setAnswers((previous) => {
      const nextAnswer: SelectedTestAnswer = {
        questionId: currentQuestion.id,
        optionId: option.id,
        isCorrect: option.isCorrect,
        earnedPoints: option.isCorrect ? currentQuestion.points : 0,
      };

      return [
        ...previous.filter((answer) => answer.questionId !== currentQuestion.id),
        nextAnswer,
      ];
    });
  }

  function handleNext() {
    if (!currentAnswer) return;
    if (isLastQuestion) {
      setPhase("finished");
      return;
    }

    setCurrentIndex((previous) => previous + 1);
  }

  function handleRetry() {
    setAnswers([]);
    setCurrentIndex(0);
    setPhase("answering");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cream-50 pb-28 text-ink-900 md:pb-16">
      <div className="pointer-events-none absolute inset-0 -z-20 smong-quiet-field" />

      <section className="relative px-4 pb-5 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/siswa/modul/${chapter.id}`}
            className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-purple-700/10 bg-white/72 px-4 py-2 font-heading text-sm font-black text-purple-700 shadow-sm transition hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali ke Bab
          </Link>

          <div className="relative overflow-hidden rounded-[2rem] border border-purple-700/8 bg-white/68 p-5 shadow-[0_14px_42px_rgba(47,23,110,0.06)] backdrop-blur sm:p-6">
            <div className="pointer-events-none absolute -right-16 top-0 h-40 w-[44%] smong-river bg-lavender-100/28" />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-lavender-100/70 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700">
                  <ClipboardCheck className="h-4 w-4" />
                  {getTestKindLabel(test.kind)}
                </p>
                <h1 className="font-heading text-3xl font-black leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
                  {test.title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-ink-700">
                  {getTestDescription(test.kind, chapter.shortLabel, requiredScore)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 lg:min-w-[260px]">
                <HeaderMetric icon="questions" label="Soal" value={`${questions.length}`} />
                <HeaderMetric icon="target" label={test.kind === "pre-test" ? "Mode" : "Target"} value={test.kind === "pre-test" ? "Awal" : `${requiredScore}%`} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 lg:grid-cols-[244px_1fr] lg:px-8">
        <div className="lg:hidden">
          <CompactTestProgress
            currentIndex={currentIndex}
            progressPercent={progressPercent}
            questionsLength={questions.length}
          />
        </div>

        <aside className="hidden h-fit overflow-hidden rounded-[1.6rem] border border-purple-700/8 bg-white/62 p-4 shadow-sm backdrop-blur lg:sticky lg:top-28 lg:block">
          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-purple-900 text-white">
                <Route className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-lg font-black">Jalur Uji</p>
                <p className="text-xs font-bold text-ink-400">{progressPercent}% berjalan</p>
              </div>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-lavender-100">
              <div className="h-full rounded-full bg-purple-900 transition-[width] duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="grid gap-2">
              {questionPanels.map((panel) => (
                <QuestionRailItem
                  key={panel.question.id}
                  index={panel.index}
                  active={phase === "answering" && panel.index === currentIndex}
                  answered={panel.isAnswered}
                  questionType={panel.question.type}
                />
              ))}
            </div>
          </div>
        </aside>

        <AnimatePresence mode="wait">
          {phase === "answering" && currentQuestion ? (
            <motion.div
              key={currentQuestion.id}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.26, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[2rem] border border-purple-700/8 bg-white/74 p-5 shadow-[0_16px_48px_rgba(47,23,110,0.06)] backdrop-blur sm:p-7"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-[44%] smong-river bg-mint-100/26" />
              <div className="relative">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 rounded-full bg-lavender-100/72 px-4 py-2 text-xs font-black uppercase tracking-[0.13em] text-purple-700">
                    {renderQuestionTypeIcon(currentQuestion.type, "h-4 w-4")}
                    {getQuestionTypeLabel(currentQuestion.type)}
                  </p>
                  <p className="rounded-full bg-white/74 px-4 py-2 text-xs font-black text-ink-400">
                    {currentIndex + 1} dari {questions.length}
                  </p>
                </div>

                <h2 className="font-heading text-2xl font-black leading-tight text-ink-900 sm:text-4xl">
                  {currentQuestion.prompt}
                </h2>

                <div className="mt-6 grid gap-3">
                  {currentQuestion.answerOptions.map((option) => (
                    <AnswerOptionButton
                      key={option.id}
                      option={option}
                      selectedAnswer={currentAnswer}
                      onSelect={() => handleSelect(option)}
                    />
                  ))}
                </div>

                {currentAnswer ? (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-6 rounded-[1.35rem] border p-4 sm:p-5",
                      currentAnswer.isCorrect
                        ? "border-teal-200 bg-mint-100/78"
                        : "border-coral-500/20 bg-coral-50"
                    )}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      {currentAnswer.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-teal-700" />
                      ) : (
                        <XCircle className="h-5 w-5 text-coral-500" />
                      )}
                      <p className={cn("font-heading text-lg font-black", currentAnswer.isCorrect ? "text-teal-800" : "text-coral-700")}>
                        {currentAnswer.isCorrect ? "Jawaban Aman" : "Belum Tepat"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold leading-7 text-ink-700">{currentQuestion.explanation}</p>
                  </motion.div>
                ) : null}

                {currentAnswer ? (
                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-purple-900 px-6 py-3 font-heading text-sm font-black text-white shadow-[0_6px_0_#20104f] transition active:translate-y-0.5 active:shadow-[0_3px_0_#20104f] sm:w-auto"
                    >
                      {isLastQuestion ? "Lihat Hasil" : "Pertanyaan Berikutnya"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : (
            <TestResultPanel
              key="result"
              chapter={chapter}
              testKind={test.kind}
              score={score}
              correctCount={correctCount}
              totalQuestions={questions.length}
              requiredScore={requiredScore}
              passed={passed}
              onRetry={handleRetry}
            />
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

function AnswerOptionButton({
  option,
  selectedAnswer,
  onSelect,
}: {
  option: TestAnswerOption;
  selectedAnswer?: SelectedTestAnswer;
  onSelect: () => void;
}) {
  const isSelected = selectedAnswer?.optionId === option.id;
  const isAnswered = selectedAnswer !== undefined;
  const showCorrect = isAnswered && option.isCorrect;
  const showWrong = isSelected && selectedAnswer?.isCorrect === false;

  return (
    <button
      type="button"
      disabled={isAnswered}
      onClick={onSelect}
      className={cn(
        "group flex min-h-16 w-full items-center gap-4 rounded-[1.35rem] border px-4 py-4 text-left transition",
        "shadow-sm backdrop-blur",
        !isAnswered && "border-purple-700/10 bg-white/76 hover:-translate-y-0.5 hover:border-purple-700/24 hover:bg-white",
        showCorrect && "border-teal-300 bg-mint-100/86 text-teal-800",
        showWrong && "border-coral-500/30 bg-coral-50 text-coral-700",
        isAnswered && !showCorrect && !showWrong && "border-purple-700/8 bg-white/52 opacity-60"
      )}
    >
      <span className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem]",
        showCorrect ? "bg-teal-600 text-white" : showWrong ? "bg-coral-500 text-white" : "bg-lavender-100 text-purple-700"
      )}>
        {showCorrect ? <CheckCircle2 className="h-5 w-5" /> : showWrong ? <XCircle className="h-5 w-5" /> : <FileQuestion className="h-5 w-5" />}
      </span>
      <span className="font-heading text-base font-black leading-snug sm:text-lg">{option.label}</span>
    </button>
  );
}

function HeaderMetric({ icon, label, value }: { icon: "questions" | "target"; label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] bg-white/72 px-4 py-3 shadow-sm">
      <div className="mb-2 text-purple-700">
        {icon === "questions" ? <Compass className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
      </div>
      <p className="font-heading text-xl font-black leading-none text-ink-900">{value}</p>
      <p className="mt-1 text-[0.66rem] font-black uppercase tracking-[0.12em] text-ink-400">{label}</p>
    </div>
  );
}

function CompactTestProgress({
  currentIndex,
  progressPercent,
  questionsLength,
}: {
  currentIndex: number;
  progressPercent: number;
  questionsLength: number;
}) {
  return (
    <div className="rounded-[1.4rem] border border-purple-700/8 bg-white/72 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-heading text-base font-black text-ink-900">Jalur Uji</p>
        <p className="text-xs font-black text-ink-400">
          {Math.min(currentIndex + 1, questionsLength)} / {questionsLength}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-lavender-100">
        <div className="h-full rounded-full bg-purple-900 transition-[width] duration-500" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
}

function QuestionRailItem({
  index,
  active,
  answered,
  questionType,
}: {
  index: number;
  active: boolean;
  answered: boolean;
  questionType: QuestionType;
}) {
  return (
    <div className={cn(
      "flex min-h-11 items-center gap-3 rounded-[0.95rem] px-3 py-2",
      active ? "bg-purple-900 text-white" : answered ? "bg-mint-100/80 text-teal-800" : "bg-white/62 text-ink-500"
    )}>
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-[0.75rem]", active ? "bg-white/14" : "bg-white/72")}>
        {answered ? <CheckCircle2 className="h-4 w-4" /> : renderQuestionTypeIcon(questionType, "h-4 w-4")}
      </span>
      <span className="font-heading text-sm font-black">Soal {index + 1}</span>
    </div>
  );
}

function TestResultPanel({
  chapter,
  testKind,
  score,
  correctCount,
  totalQuestions,
  requiredScore,
  passed,
  onRetry,
}: {
  chapter: ModuleChapter;
  testKind: TestKind;
  score: number;
  correctCount: number;
  totalQuestions: number;
  requiredScore: number;
  passed: boolean;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="relative overflow-hidden rounded-[2rem] border border-purple-700/8 bg-white/74 p-6 text-center shadow-[0_16px_48px_rgba(47,23,110,0.06)] backdrop-blur sm:p-8"
    >
      <div className="relative mx-auto flex max-w-2xl flex-col items-center">
        <div className={cn(
          "mb-5 flex h-16 w-16 items-center justify-center rounded-[1.25rem] shadow-sm",
          passed ? "bg-mint-100 text-teal-700" : "bg-yellow-200 text-yellow-900"
        )}>
          {passed ? <ShieldCheck className="h-8 w-8" /> : <RotateCcw className="h-8 w-8" />}
        </div>
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-lavender-100/70 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700">
          <ClipboardCheck className="h-4 w-4" />
          {getResultEyebrow(testKind, passed)}
        </p>
        <h2 className="font-heading text-3xl font-black leading-tight text-ink-900 sm:text-5xl">
          {getResultTitle(testKind, passed)}
        </h2>
        <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-ink-700 sm:text-base">
          {getResultBody(testKind, passed, chapter.shortLabel)}
        </p>

        <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
          <ResultStat label="Skor" value={`${score}%`} />
          <ResultStat label="Tepat" value={`${correctCount}/${totalQuestions}`} />
          <ResultStat label="Target" value={testKind === "pre-test" ? "Baseline" : `${requiredScore}%`} />
        </div>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          {!passed ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-yellow-200 px-6 py-3 font-heading text-sm font-black text-yellow-950 shadow-[0_6px_0_#d6a900] transition active:translate-y-0.5 active:shadow-[0_3px_0_#d6a900]"
            >
              <RotateCcw className="h-4 w-4" />
              Coba Lagi
            </button>
          ) : null}
          <Link
            href={`/siswa/modul/${chapter.id}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-purple-900 px-6 py-3 font-heading text-sm font-black text-white shadow-[0_6px_0_#20104f] transition active:translate-y-0.5 active:shadow-[0_3px_0_#20104f]"
          >
            Kembali ke Bab
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white/78 px-4 py-4 shadow-sm">
      <p className="font-heading text-3xl font-black text-ink-900">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-ink-400">{label}</p>
    </div>
  );
}

function getSelectedAnswer(answers: SelectedTestAnswer[], questionId: string) {
  return answers.find((answer) => answer.questionId === questionId);
}

function getRequiredScore(testKind: TestKind, requiredScore?: number) {
  if (testKind === "pre-test") return 0;
  if (requiredScore !== undefined) return requiredScore;
  if (testKind === "final-quiz") return 80;
  return 70;
}

function getTestKindLabel(testKind: TestKind) {
  if (testKind === "pre-test") return "Pemetaan Awal";
  if (testKind === "post-test") return "Uji Pemahaman";
  return "Kuis Final";
}

function getTestDescription(testKind: TestKind, chapterLabel: string, requiredScore: number) {
  if (testKind === "pre-test") {
    return `Ini bukan ujian menakutkan. Smong hanya ingin melihat bekal awalmu sebelum masuk bab ${chapterLabel}.`;
  }

  return `Selesaikan uji pemahaman ${chapterLabel}. Target aman untuk lanjut adalah ${requiredScore}%.`;
}

function getQuestionTypeLabel(questionType: QuestionType) {
  if (questionType === "true-false") return "Benar atau Salah";
  if (questionType === "scenario-choice") return "Simulasi Pilihan";
  if (questionType === "drag-and-drop") return "Pilih Barang";
  if (questionType === "sequencing") return "Urutan Aksi";
  return "Pilihan Cepat";
}

function getResultEyebrow(testKind: TestKind, passed: boolean) {
  if (testKind === "pre-test") return "Baseline Tersimpan";
  if (passed) return "Misi Aman";
  return "Perlu Latihan Lagi";
}

function getResultTitle(testKind: TestKind, passed: boolean) {
  if (testKind === "pre-test") return "Bekal Awal Terbaca";
  if (passed) return "Pemahamanmu Siap";
  return "Ayo Perkuat Lagi";
}

function getResultBody(testKind: TestKind, passed: boolean, chapterLabel: string) {
  if (testKind === "pre-test") {
    return `Sekarang kamu bisa lanjut belajar ${chapterLabel}. Skor ini hanya menjadi peta awal, bukan penghalang.`;
  }

  if (passed) {
    return `Kamu sudah memahami bagian penting dari ${chapterLabel}. Lanjutkan jalur belajar dengan tenang.`;
  }

  return `Tidak apa-apa. Ulangi beberapa misi ${chapterLabel}, lalu coba post-test lagi.`;
}

function renderQuestionTypeIcon(questionType: QuestionType, className: string) {
  if (questionType === "true-false") return <CheckCircle2 className={className} />;
  if (questionType === "scenario-choice") return <Compass className={className} />;
  if (questionType === "drag-and-drop") return <Layers3 className={className} />;
  if (questionType === "sequencing") return <ListChecks className={className} />;
  return <FileQuestion className={className} />;
}
