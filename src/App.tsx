import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  House,
  ChatCircle,
  Exam,
  Bell,
  Alarm,
  X,
  Sun,
  Moon,
  Gear,
  Plus,
  Check,
  Clock,
  Calendar,
  NotePencil,
  Lightbulb,
  ArrowLeft,
  GraduationCap,
  WifiX,
  SpinnerGap,
  Trash,
  BookOpen,
} from "@phosphor-icons/react";
import Dashboard from "./components/Dashboard";
import AITutor from "./components/AITutor";
import CBTEngine from "./components/CBTEngine";

type Tab = "dashboard" | "tutor" | "cbt";
type SubView = "dashboard" | "tutor" | "cbt" | "alarms" | "settings";

const ALARM_KEY = "prepnaija_alarm";
const THEME_KEY = "prepnaija_theme";

interface StudyAlarm {
  id: string;
  time: string;
  label: string;
  days: string[];
  enabled: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [subView, setSubView] = useState<SubView>("dashboard");
  const [isDark, setIsDark] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showAlarms, setShowAlarms] = useState(false);
  const [alarms, setAlarms] = useState<StudyAlarm[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState("07:00");
  const [newAlarmLabel, setNewAlarmLabel] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [clearedData, setClearedData] = useState(false);

  // Init theme & alarms
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) setIsDark(savedTheme === "dark");
    else setIsDark(true);

    const savedAlarms = localStorage.getItem(ALARM_KEY);
    if (savedAlarms) {
      try {
        setAlarms(JSON.parse(savedAlarms));
      } catch {
        setAlarms([]);
      }
    }

    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  // Save alarms
  useEffect(() => {
    localStorage.setItem(ALARM_KEY, JSON.stringify(alarms));
  }, [alarms]);

  const addAlarm = () => {
    if (!newAlarmTime) return;
    const alarm: StudyAlarm = {
      id: Date.now().toString(),
      time: newAlarmTime,
      label: newAlarmLabel.trim() || "Study Session",
      days: ["Mon", "Wed", "Fri"],
      enabled: true,
    };
    setAlarms((prev) => [...prev, alarm]);
    setNewAlarmLabel("");
  };

  const toggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const clearAllData = () => {
    const keys = [
      "prepnaija_weaknesses",
      "prepnaija_streak",
      "prepnaija_stats",
      "prepnaija_alarm",
    ];
    keys.forEach((k) => localStorage.removeItem(k));
    setClearedData(true);
    setTimeout(() => setClearedData(false), 2000);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSubView(tab);
  };

  const renderContent = () => {
    switch (subView) {
      case "dashboard":
        return <Dashboard onNavigate={(tab) => handleTabChange(tab as Tab)} />;
      case "tutor":
        return <AITutor onBack={() => handleTabChange("dashboard")} />;
      case "cbt":
        return <CBTEngine onBack={() => handleTabChange("dashboard")} />;
      default:
        return <Dashboard onNavigate={(tab) => handleTabChange(tab as Tab)} />;
    }
  };

  return (
    <div className={`relative mx-auto flex min-h-dvh max-w-md flex-col bg-background ${isDark ? "dark" : ""}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b bg-background/80 px-4 py-2 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <GraduationCap size={18} weight="bold" />
          </div>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            PrepNaija
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!isOnline && (
            <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <WifiX size={12} />
              Offline
            </div>
          )}
          <button
            onClick={() => setShowAlarms(!showAlarms)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted"
          >
            <Bell size={18} />
            {alarms.filter((a) => a.enabled).length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">
                {alarms.filter((a) => a.enabled).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted"
          >
            <Gear size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={subView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t bg-background/95 px-2 pb-2 pt-1 backdrop-blur-lg">
        <div className="flex items-center justify-around">
          {[
            { tab: "dashboard" as Tab, icon: House, label: "Home" },
            { tab: "tutor" as Tab, icon: ChatCircle, label: "AI Tutor" },
            { tab: "cbt" as Tab, icon: Exam, label: "CBT" },
          ].map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-5 py-2 transition-all ${
                activeTab === tab
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              <Icon
                size={20}
                weight={activeTab === tab ? "fill" : "regular"}
              />
              <span className="text-[10px] font-medium">{label}</span>
              {activeTab === tab && (
                <motion.div
                  layoutId="nav-indicator"
                  className="h-0.5 w-6 rounded-full bg-emerald-500"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Alarms Panel */}
      <AnimatePresence>
        {showAlarms && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 pb-16"
            onClick={() => setShowAlarms(false)}
          >
            <div
              className="w-full max-w-md rounded-t-3xl bg-background p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                  <Alarm size={18} className="text-emerald-500" />
                  Study Alarm
                </h2>
                <button
                  onClick={() => setShowAlarms(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <input
                  type="time"
                  value={newAlarmTime}
                  onChange={(e) => setNewAlarmTime(e.target.value)}
                  className="w-28 rounded-xl bg-muted px-3 py-2 text-sm outline-none"
                />
                <input
                  type="text"
                  value={newAlarmLabel}
                  onChange={(e) => setNewAlarmLabel(e.target.value)}
                  placeholder="Study label..."
                  className="flex-1 rounded-xl bg-muted px-3 py-2 text-sm outline-none"
                />
                <button
                  onClick={addAlarm}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white"
                >
                  <Plus size={18} weight="bold" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {alarms.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No alarms yet. Set a study reminder!
                  </p>
                ) : (
                  alarms.map((alarm) => (
                    <div
                      key={alarm.id}
                      className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3"
                    >
                      <button
                        onClick={() => toggleAlarm(alarm.id)}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                          alarm.enabled
                            ? "bg-emerald-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {alarm.enabled && <Check size={14} weight="bold" />}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alarm.label}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock size={12} />
                          {alarm.time}
                          <span>·</span>
                          {alarm.days.join(", ")}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAlarm(alarm.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 pb-16"
            onClick={() => setShowSettings(false)}
          >
            <div
              className="w-full max-w-md rounded-t-3xl bg-background p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                  <Gear size={18} className="text-emerald-500" />
                  Settings
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                      <Sun size={18} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">
                        Toggle dark/light theme
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={`relative h-6 w-11 rounded-full transition-all ${
                      isDark ? "bg-emerald-500" : "bg-muted"
                    }`}
                  >
                    <motion.div
                      animate={{ x: isDark ? 20 : 2 }}
                      className="h-5 w-5 rounded-full bg-white shadow"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                      <Trash size={18} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Clear Data</p>
                      <p className="text-xs text-muted-foreground">
                        Reset all progress & stats
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearAllData}
                    className="rounded-xl bg-red-500 px-4 py-2 text-xs font-medium text-white"
                  >
                    {clearedData ? "Cleared!" : "Clear"}
                  </button>
                </div>

                {clearedData && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <Check size={14} />
                    All local data has been reset successfully.
                  </div>
                )}

                <div className="mt-2 text-center text-xs text-muted-foreground">
                  <p>PrepNaija v1.0.0</p>
                  <p className="mt-1">
                    Data stored locally. No account required.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg"
          >
            <div className="flex items-center gap-2">
              <WifiX size={16} />
              You are offline. Data is saved locally.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}