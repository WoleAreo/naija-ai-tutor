import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Robot,
  Student,
  SmileyWink,
  GraduationCap,
  Microphone,
  PaperPlaneRight,
  SpeakerHigh,
  SpeakerSlash,
  Brain,
  Clock,
  Stop,
  Play,
  DotsThree,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Translate,
  ArrowLeft,
  SpinnerGap,
} from "@phosphor-icons/react";
import { questions } from "../utils/mockQuestions";

type Persona = "uncle-segun" | "aunty-chioma" | "mallam-ibrahim";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  persona?: Persona;
  timestamp: number;
}

const PERSONA_CONFIG: Record<
  Persona,
  { name: string; title: string; accent: string; bgGrad: string; icon: React.ElementType; greeting: string }
> = {
  "uncle-segun": {
    name: "Uncle Segun",
    title: "The Cool Uncle",
    accent: "from-blue-500 to-blue-600",
    bgGrad: "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
    icon: SmileyWink,
    greeting: "Ah, my boy! You want to chop this exam? Let's go!",
  },
  "aunty-chioma": {
    name: "Aunty Chioma",
    title: "The Caring Teacher",
    accent: "from-emerald-500 to-emerald-600",
    bgGrad: "from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20",
    icon: GraduationCap,
    greeting: "Darling, don't worry. I'll explain until you understand!",
  },
  "mallam-ibrahim": {
    name: "Mallam Ibrahim",
    title: "The Strict Professor",
    accent: "from-amber-600 to-orange-600",
    bgGrad: "from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/20",
    icon: Robot,
    greeting: "No shortcuts. Explain your reasoning step by step.",
  },
};

interface AITutorProps {
  onBack: () => void;
}

export default function AITutor({ onBack }: AITutorProps) {
  const [persona, setPersona] = useState<Persona>("uncle-segun");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const config = PERSONA_CONFIG[persona];

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response with persona-specific flavor
    setTimeout(() => {
      const aiResponse = generateResponse(input.trim(), persona);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: aiResponse,
        persona,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleVoiceToggle = () => {
    // Simulate voice toggle (no actual Web Speech API in sandbox)
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setInput("Explain photosynthesis in simple terms");
      }, 2000);
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    // Simulate TTS
    setTimeout(() => setIsSpeaking(false), text.length * 60);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold">AI Tutor</h1>
          <p className="text-xs text-muted-foreground">
            Chat with {config.name}
          </p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted"
        >
          <DotsThree size={20} />
        </button>
      </div>

      {/* Persona Selector */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {(Object.keys(PERSONA_CONFIG) as Persona[]).map((p) => {
          const pc = PERSONA_CONFIG[p];
          const isActive = persona === p;
          return (
            <motion.button
              key={p}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setPersona(p);
                setMessages([]);
              }}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                isActive
                  ? `bg-gradient-to-r ${pc.accent} text-white shadow-lg`
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <pc.icon size={16} />
              {pc.name}
            </motion.button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 rounded-2xl bg-gradient-to-br ${config.bgGrad} p-5`}
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg">
                <config.icon size={22} />
              </div>
              <div>
                <p className="text-sm font-bold">{config.name}</p>
                <p className="text-xs text-muted-foreground">{config.title}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">{config.greeting}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Explain quadratic equations",
                "What is photosynthesis?",
                "Help me with differentiation",
                "Current affairs in Nigeria",
                "Simplify this: logarithms",
                "How to calculate probability",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full bg-background/80 px-3 py-1.5 text-xs text-muted-foreground hover:bg-background"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-emerald-500 text-white"
                    : "bg-muted"
                }`}
              >
                {msg.role === "ai" && (
                  <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <config.icon size={12} />
                    <span>{config.name}</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.role === "ai" && (
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-background/50"
                    >
                      {isSpeaking ? (
                        <SpeakerSlash size={14} />
                      ) : (
                        <SpeakerHigh size={14} />
                      )}
                      Listen
                    </button>
                    <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-background/50">
                      <ThumbsUp size={14} />
                    </button>
                    <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-background/50">
                      <ThumbsDown size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 flex justify-start"
          >
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
              <SpinnerGap size={16} className="animate-spin text-emerald-500" />
              <span className="text-xs text-muted-foreground">
                {config.name} is thinking...
              </span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceToggle}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
              isListening
                ? "bg-red-500 text-white shadow-lg"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {isListening ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Microphone size={20} weight="fill" />
              </motion.div>
            ) : (
              <Microphone size={20} />
            )}
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Ask ${config.name} anything...`}
            className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
          >
            <PaperPlaneRight size={20} weight="fill" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          AI Tutor responses are simulated. Real OpenAI integration coming soon.
        </p>
      </div>
    </div>
  );
}

function generateResponse(userMessage: string, persona: Persona): string {
  const lower = userMessage.toLowerCase();
  const q = questions.find(
    (q) => q.question.toLowerCase().includes(lower) || lower.includes(q.topic.toLowerCase())
  );

  const responses: Record<Persona, { base: string; hint: string; challenge: string }> = {
    "uncle-segun": {
      base: "Ah, my boy! Let me break it down for you small-small. ",
      hint: "Oya, I go give you hint: ",
      challenge: "Abeg, explain to me like I'm 10 years old. I dey wait! ",
    },
    "aunty-chioma": {
      base: "Darling, that's a wonderful question! Let me explain. ",
      hint: "Sweetheart, here's a little hint: ",
      challenge: "Now, try to explain it back to me in your own words! ",
    },
    "mallam-ibrahim": {
      base: "A precise question. Let's examine this systematically. ",
      hint: "Consider this: ",
      challenge: "Now, show me your working. I want to see the full reasoning. ",
    },
  };

  const r = responses[persona];

  if (q) {
    return `${r.base}Regarding "${q.topic}": ${q.hint} ${
      persona === "mallam-ibrahim"
        ? `

The correct answer is: ${q.options[q.correctAnswer]}. Study the logic carefully.`
        : `

Try to solve it! The answer is ${q.options[q.correctAnswer]}. ${r.hint}${q.hint}`
    }`;
  }

  if (lower.includes("hello") || lower.includes("hi")) {
    return `${r.base}How can I help you with your SSCE preparation today? Feel free to ask about any subject!`;
  }
  if (lower.includes("math") || lower.includes("calculus") || lower.includes("derivative")) {
    return `${r.base}Differentiation is all about finding the rate of change. For y = 3x^2 - 2x + 5, dy/dx = 6x - 2. Just apply the power rule: bring down the power as coefficient, then reduce the power by 1.`;
  }
  if (lower.includes("physics") || lower.includes("force") || lower.includes("motion")) {
    return `${r.base}Newton's Second Law: F = ma. A force of 20N on a 5kg mass gives acceleration a = F/m = 20/5 = 4 m/s^2. Simple!`;
  }
  if (lower.includes("english") || lower.includes("grammar") || lower.includes("speech")) {
    return `${r.base}'The wind whispered through the trees' - that's personification! The wind is given the human ability to whisper. Personification gives human qualities to non-human things.`;
  }
  if (lower.includes("bio") || lower.includes("cell") || lower.includes("organelle")) {
    return `${r.base}The mitochondrion is the powerhouse of the cell! It produces ATP through cellular respiration. Every living cell needs energy, and mitochondria provide it.`;
  }
  if (lower.includes("eco") || lower.includes("scarcity") || lower.includes("demand")) {
    return `${r.base}Scarcity is the fundamental economic problem: limited resources vs unlimited wants. That's why we must make choices - and every choice has an opportunity cost!`;
  }

  return `${r.base}That's a great question about ${userMessage}. In Nigerian SSCE exams, it's important to understand the core concepts and practice past questions. ${r.hint}Try to break the problem into smaller parts. If you have a specific topic you want to study, let me know!`;
}