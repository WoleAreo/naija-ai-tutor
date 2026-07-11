import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fire,
  Calendar,
  ChartBar,
  Warning,
  Trophy,
  BookOpen,
  NotePencil,
  Brain,
  CheckCircle,
  Clock,
  ArrowRight,
  Target,
  Lightning,
  Star,
  GraduationCap,
  Crown,
  Pulse,
} from "@phosphor-icons/react";
import { getWeaknesses, getStreak, getStats, incrementStreak, Weakness } from "../utils/mockQuestions";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({ totalQuestions: 0, correctAnswers: 0, cbtScores: [] as { score: number; total: number; date: string }[] });
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setWeaknesses(getWeaknesses());
    setStreak(getStreak());
    setStats(getStats());

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning, Scholar!");
    else if (hour < 17) setGreeting("Good afternoon, Scholar!");
    else setGreeting("Good evening, Scholar!");
  }, []);

  const avgScore = stats.cbtScores.length > 0
    ? Math.round(
        stats.cbtScores.reduce((s, c) => s + (c.score / c.total) * 100, 0) /
          stats.cbtScores.length
      )
    : 0;

  const criticalCount = weaknesses.filter((w) => w.status === "Critical Review").length;

  return (
    <div className="flex flex-col gap-5 p-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <GraduationCap size={24} weight="bold" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            PrepNaija
          </h1>
          <p className="text-xs text-muted-foreground">{greeting}</p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center gap-1 rounded-xl bg-amber-100 px-3 py-1.5 dark:bg-amber-900/30"
        >
          <Fire size={18} className="text-amber-500" weight="fill" />
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
            {streak} day streak
          </span>
        </motion.div>
      </motion.div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="col-span-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Overall Progress</p>
              <p className="mt-1 text-3xl font-bold">
                {stats.totalQuestions > 0
                  ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
                  : 0}
                %
              </p>
            </div>
            <Trophy size={36} weight="fill" className="opacity-80" />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${
                  stats.totalQuestions > 0
                    ? (stats.correctAnswers / stats.totalQuestions) * 100
                    : 0
                }%`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-amber-400"
            />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="rounded-2xl bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <ChartBar size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg CBT Score</p>
              <p className="text-lg font-bold">{avgScore}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="rounded-2xl bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-amber-100 p-2 dark:bg-amber-900/30">
              <Warning size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Weaknesses</p>
              <p className="text-lg font-bold">{criticalCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="rounded-2xl bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-100 p-2 dark:bg-blue-900/30">
              <BookOpen size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Questions Done</p>
              <p className="text-lg font-bold">{stats.totalQuestions}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="rounded-2xl bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-purple-100 p-2 dark:bg-purple-900/30">
              <Brain size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Syllabus</p>
              <p className="text-lg font-bold">
                {Math.min(100, Math.round((stats.totalQuestions / 40) * 100))}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Weakness Detection Radar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-card p-5 shadow-sm"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Pulse size={18} className="text-emerald-600" weight="fill" />
            Weakness Detection Radar
          </h2>
          <button
            onClick={() => onNavigate("cbt")}
            className="flex items-center gap-1 text-xs text-emerald-600"
          >
            Practice <ArrowRight size={14} />
          </button>
        </div>
        {weaknesses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle size={32} className="text-emerald-500" />
            <p className="text-sm text-muted-foreground">
              No weaknesses detected yet. Take a CBT test to get started!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {weaknesses.slice(0, 5).map((w, i) => (
              <motion.div
                key={w.topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      w.status === "Critical Review"
                        ? "bg-red-500"
                        : w.status === "Getting There"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  <span className="text-sm">{w.topic}</span>
                </div>
                <span
                  className={`text-xs font-medium ${
                    w.status === "Critical Review"
                      ? "text-red-500"
                      : w.status === "Getting There"
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}
                >
                  {w.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate("tutor")}
          className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 p-4 text-white"
        >
          <Brain size={24} weight="bold" />
          <span className="text-xs font-medium">AI Tutor</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate("cbt")}
          className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-600 p-4 text-white"
        >
          <NotePencil size={24} weight="bold" />
          <span className="text-xs font-medium">Practice</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStreak(incrementStreak())}
          className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-b from-purple-500 to-purple-600 p-4 text-white"
        >
          <Lightning size={24} weight="bold" />
          <span className="text-xs font-medium">Study Now</span>
        </motion.button>
      </div>
    </div>
  );
}