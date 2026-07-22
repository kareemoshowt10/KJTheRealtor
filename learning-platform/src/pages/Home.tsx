import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { useProgress } from "../context/ProgressContext";
import { books } from "../data/books";

export default function Home() {
  const { todaysLesson, isDone, markDone, totalDone, totalLessons, streak } = useProgress();
  const [flipped, setFlipped] = useState(false);
  const book = books.find((b) => b.id === todaysLesson.bookId)!;
  const done = isDone(todaysLesson.id);

  return (
    <PageTransition>
      <div className="mb-8">
        <p className="text-sm text-zinc-500">
          {streak > 0
            ? `${streak} day streak — keep the flame going.`
            : "Start today. One idea is all it takes."}
        </p>
        <h1 className="font-display mt-1 text-3xl font-medium tracking-tight text-white">
          Today's idea
        </h1>
      </div>

      <div className="[perspective:1200px]">
        <motion.div
          onClick={() => setFlipped((f) => !f)}
          className="relative min-h-[340px] cursor-pointer [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* front */}
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-white/8 p-6 [backface-visibility:hidden]"
            style={{
              background: `linear-gradient(160deg, ${book.accent}26, rgba(255,255,255,0.02))`,
            }}
          >
            <div>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ backgroundColor: `${book.accent}33`, color: book.accentSoft }}
              >
                {book.title}
              </span>
              <h2 className="font-display mt-4 text-2xl font-medium leading-snug text-white">
                {todaysLesson.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-zinc-300">
                {todaysLesson.coreIdea}
              </p>
            </div>
            <p className="text-xs text-zinc-500">Tap the card to see today's action →</p>
          </div>

          {/* back */}
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-white/8 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{
              background: `linear-gradient(160deg, ${book.accent}33, rgba(255,255,255,0.03))`,
            }}
          >
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Why it matters
              </span>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-300">
                {todaysLesson.whyItMatters}
              </p>
              <span className="mt-5 block text-xs font-medium uppercase tracking-wide text-zinc-400">
                Try today
              </span>
              <p className="mt-2 text-[15px] leading-relaxed text-white">
                {todaysLesson.tryToday}
              </p>
            </div>
            <p className="text-xs text-zinc-500">Tap to flip back</p>
          </div>
        </motion.div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            markDone(todaysLesson.id);
          }}
          disabled={done}
          className="flex-1 rounded-full px-5 py-3 text-sm font-semibold transition-all disabled:opacity-60"
          style={{
            backgroundColor: done ? "rgba(255,255,255,0.06)" : book.accent,
            color: done ? "#a1a1aa" : "#0b0b0f",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={done ? "done" : "mark"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="inline-block"
            >
              {done ? "✓ Done for today" : "Mark today's idea done"}
            </motion.span>
          </AnimatePresence>
        </button>
        <Link
          to={`/book/${book.id}/lesson/${todaysLesson.id}`}
          className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5"
        >
          Full lesson
        </Link>
      </div>

      <div className="mt-10 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
        <span className="text-sm text-zinc-400">Overall progress</span>
        <span className="font-display text-sm font-medium text-white">
          {totalDone} / {totalLessons} lessons
        </span>
      </div>
    </PageTransition>
  );
}
