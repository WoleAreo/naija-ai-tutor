import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Exam,
  Timer,
  CheckCircle,
  X,
  ListChecks,
  ArrowClockwise,
  ArrowLeft,
  Target,
  Brain,
  Trophy,
  Star,
  Lightning,
  SpinnerGap,
  ThumbsUp,
  ChartBar,
  BookOpen,
  Fire,
  GraduationCap,
} from "@phosphor-icons/react";
import {
  questions,
  getQuestions,
  subjects,
  examTypes,
  years,
  updateStats,
  addWeakness,
  incrementStreak,
  Question,
} from "../utils/mockQuestions";

interface CBTEngineProps {
  onBack: () => void;
}

type Phase = "setup" | "quiz" | "results";

export default function CBTEngine({ onBack }: CBTEngineProps) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedExam, setSelectedExam] = useState("JAMB");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedYear, setSelectedYear] = useState(2023);
  const [questionCount, setQuestionCount] = useState(10);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [results, setResults] = useState<
    { question: Question; userAnswer: number; correct: boolean }[]
  >([]);
  const [showHint, setShowHint] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  const handleTimeUp = () => {
    // Auto-submit when time runs out
    if (currentIndex < quizQuestions.length - 1) {
      moveToNext();
    } else {
      finishQuiz();
    }
  };

  const startQuiz = () => {
    setIsLoading(true);
    setTimeout(() => {
      const filtered = getQuestions(selectedExam, selectedSubject, selectedYear);
      // Shuffle and pick
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
      setQuizQuestions(selected.length > 0 ? selected : shuffled.slice(0, 5));
      setCurrentIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setResults([]);
      setShowHint(false);
      setIsReviewing(false);
      setTimeLeft(questionCount * 60); // 60 seconds per question
      setIsTimerRunning(true);
      setPhase("quiz");
      setIsLoading(false);
    }, 800);
  };

  const handleAnswer = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
    setHasAnswered(true);
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const correct = index === quizQuestions[currentIndex].correctAnswer;
    if (correct) {
      setScore((prev) => prev + 1);
    }
    setResults((prev) => [
      ...prev,
      {
        question: quizQuestions[currentIndex],
        userAnswer: index,
        correct,
      },
    ]);
  };

  const moveToNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setShowHint(false);
      setTimeLeft(questionCount * 60);
      setIsTimerRunning(true);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);
    updateStats(score, quizQuestions.length);

    // Track weaknesses for wrong answers
    results.forEach((r) => {
      if (!r.correct) {
        addWeakness(r.question.topic);
      }
    });

    // Track streak
    if (score > 0) {
      incrementStreak();
    }

    setPhase("results");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = ((currentIndex + 1) / quizQuestions.length) * 100;

  if (phase === "setup") {
    return (
      <div className="flex flex-col gap-5 p-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-bold">CBT Simulator</h1>
            <p className="text-xs text-muted-foreground">
              Configure your practice test
            </p>
          </div>
        </motion.div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white">
          <div className="mb-2 flex items-center gap-2">
            <Exam size={24} weight="fill" />
            <h2 className="text-lg font-bold">Exam Mode</h2>
          </div>
          <p className="text-sm opacity-80">
            Realistic CBT simulation with timed conditions. Select your exam
            type, subject, and year to begin.
          </p>
        </div>

        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold">Exam Configuration</h3>
          <div className="flex flex-col gap-4">
            {/* Exam Type */}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                Exam Type
              </label>
              <div className="flex gap-2">
                {examTypes.map((exam) => (
                  <button
                    key={exam}
                    onClick={() => setSelectedExam(exam)}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      selectedExam === exam
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {exam}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                Subject
              </label>
              <div className="grid grid-cols-2 gap-2">
                {subjects.map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      selectedSubject === subj
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                Year
              </label>
              <div className="flex gap-2">
                {years.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      selectedYear === yr
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                Questions: {questionCount}
              </label>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5</span>
                <span>15</span>
                <span>30</span>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startQuiz}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 text-white shadow-lg"
        >
          {isLoading ? (
            <>
              <SpinnerGap size={20} className="animate-spin" />
              Loading questions...
            </>
          ) : (
            <>
              <Lightning size={20} weight="fill" />
              Start Practice Test
            </>
          )}
        </motion.button>
      </div>
    );
  }

  if (phase === "quiz") {
    const q = quizQuestions[currentIndex];
    if (!q) return null;

    return (
      <div className="flex h-full flex-col">
        {/* Quiz Header */}
        <div className="border-b px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1}/{quizQuestions.length}
              </span>
              <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                <Timer size={14} className="text-amber-500" />
                <span
                  className={`text-xs font-medium ${
                    timeLeft < 60 ? "text-red-500" : "text-foreground"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
        </div>

        {/* Question Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {q.examType} {q.year}
              </span>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {q.topic}
              </span>
            </div>
            <h2 className="mb-5 text-base font-semibold leading-relaxed">
              {q.question}
            </h2>

            <div className="flex flex-col gap-2">
              {q.options.map((option, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = q.correctAnswer === i;
                let bgClass = "bg-muted hover:bg-muted/80";
                if (hasAnswered) {
                  if (isCorrect) bgClass = "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
                  else if (isSelected && !isCorrect)
                    bgClass = "border-2 border-red-500 bg-red-50 dark:bg-red-950/30";
                  else bgClass = "bg-muted/50 opacity-60";
                } else if (isSelected) {
                  bgClass = "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
                }

                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleAnswer(i)}
                    disabled={hasAnswered}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm text-left transition-all ${bgClass}`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background text-xs font-medium">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {hasAnswered && isCorrect && (
                      <CheckCircle size={18} className="text-emerald-500" weight="fill" />
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <X size={18} className="text-red-500" weight="bold" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Hint button */}
            {hasAnswered && !showHint && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowHint(true)}
                className="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Brain size={14} />
                Show hint
              </motion.button>
            )}
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
              >
                💡 {q.hint}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Next Button */}
        <div className="border-t px-4 py-3">
          {hasAnswered && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={moveToNext}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-medium text-white shadow-lg"
            >
              {currentIndex < quizQuestions.length - 1 ? (
                <>Next Question →</>
              ) : (
                <>View Results</>
              )}
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  // Results Phase
  const percentage = Math.round((score / quizQuestions.length) * 100);
  const getGrade = () => {
    if (percentage >= 90) return { grade: "A+", icon: Trophy, color: "text-amber-500" };
    if (percentage >= 75) return { grade: "A", icon: Star, color: "text-emerald-500" };
    if (percentage >= 60) return { grade: "B", icon: ThumbsUp, color: "text-blue-500" };
    if (percentage >= 50) return { grade: "C", icon: ChartBar, color: "text-amber-500" };
    return { grade: "D", icon: Target, color: "text-red-500" };
  };
  const gradeInfo = getGrade();

  return (
    <div className="flex flex-col gap-5 p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
      </motion.div>

      {/* Score Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-center text-white"
      >
        <div className="mb-2 flex justify-center">
          <gradeInfo.icon size={48} weight="fill" className={gradeInfo.color} />
        </div>
        <p className="text-sm opacity-80">Your Score</p>
        <p className="mt-1 text-4xl font-bold">
          {score}/{quizQuestions.length}
        </p>
        <p className="mt-2 text-2xl font-bold">{percentage}%</p>
        <div className="mt-3 inline-block rounded-full bg-white/20 px-4 py-1 text-lg font-bold">
          Grade: {gradeInfo.grade}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm">
          <Fire size={20} className="mx-auto mb-1 text-amber-500" />
          <p className="text-lg font-bold">{score}</p>
          <p className="text-xs text-muted-foreground">Correct</p>
        </div>
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm">
          <X size={20} className="mx-auto mb-1 text-red-500" />
          <p className="text-lg font-bold">{quizQuestions.length - score}</p>
          <p className="text-xs text-muted-foreground">Wrong</p>
        </div>
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm">
          <GraduationCap size={20} className="mx-auto mb-1 text-emerald-500" />
          <p className="text-lg font-bold">{gradeInfo.grade}</p>
          <p className="text-xs text-muted-foreground">Grade</p>
        </div>
      </div>

      {/* Review toggle */}
      <button
        onClick={() => setIsReviewing(!isReviewing)}
        className="flex items-center justify-center gap-2 rounded-2xl bg-card p-4 shadow-sm"
      >
        <ListChecks size={20} className="text-emerald-500" />
        <span className="text-sm font-medium">
          {isReviewing ? "Hide Review" : "Review Answers"}
        </span>
      </button>

      <AnimatePresence>
        {isReviewing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3"
          >
            {results.map((r, i) => (
              <div
                key={i}
                className={`rounded-2xl p-4 ${
                  r.correct
                    ? "bg-emerald-50 dark:bg-emerald-950/20"
                    : "bg-red-50 dark:bg-red-950/20"
                }`}
              >
                <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  Question {i + 1}
                  {r.correct ? (
                    <CheckCircle size={14} className="text-emerald-500" />
                  ) : (
                    <X size={14} className="text-red-500" />
                  )}
                </div>
                <p className="mb-2 text-sm">{r.question.question}</p>
                <p className="text-xs text-muted-foreground">
                  Your answer:{" "}
                  <span className={r.correct ? "text-emerald-500" : "text-red-500"}>
                    {r.question.options[r.userAnswer]}
                  </span>
                </p>
                {!r.correct && (
                  <p className="text-xs text-muted-foreground">
                    Correct:{" "}
                    <span className="text-emerald-500">
                      {r.question.options[r.question.correctAnswer]}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startQuiz}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-white shadow-lg"
        >
          <ArrowClockwise size={20} weight="bold" />
          Retake Test
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-card py-4 shadow-sm"
        >
          <BookOpen size={20} />
          Dashboard
        </motion.button>
      </div>
    </div>
  );
}