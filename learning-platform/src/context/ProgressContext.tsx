import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { allLessons } from "../data/books";

const STORAGE_KEY = "distill:progress:v1";

type StoredState = {
  completed: Record<string, string>; // lessonId -> ISO date completed
  lastActiveDate: string | null; // yyyy-mm-dd
  streak: number;
};

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const diff = new Date(a).getTime() - new Date(b).getTime();
  return Math.round(diff / 86_400_000);
}

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return { completed: {}, lastActiveDate: null, streak: 0 };
}

type ProgressContextValue = {
  completed: Record<string, string>;
  streak: number;
  isDone: (lessonId: string) => boolean;
  markDone: (lessonId: string) => void;
  totalDone: number;
  totalLessons: number;
  todaysLesson: (typeof allLessons)[number];
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function markDone(lessonId: string) {
    setState((prev) => {
      if (prev.completed[lessonId]) return prev;
      const today = todayKey();
      let streak = prev.streak;
      if (!prev.lastActiveDate) {
        streak = 1;
      } else {
        const gap = daysBetween(today, prev.lastActiveDate);
        if (gap === 0) streak = prev.streak || 1;
        else if (gap === 1) streak = prev.streak + 1;
        else streak = 1;
      }
      return {
        completed: { ...prev.completed, [lessonId]: today },
        lastActiveDate: today,
        streak,
      };
    });
  }

  const todaysLesson = useMemo(() => {
    // Deterministic by calendar day only, so it stays fixed regardless of
    // completion changes that happen today (marking it done shouldn't swap it out).
    const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
    return allLessons[daysSinceEpoch % allLessons.length];
  }, []);

  const value: ProgressContextValue = {
    completed: state.completed,
    streak: state.streak,
    isDone: (lessonId: string) => Boolean(state.completed[lessonId]),
    markDone,
    totalDone: Object.keys(state.completed).length,
    totalLessons: allLessons.length,
    todaysLesson,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
