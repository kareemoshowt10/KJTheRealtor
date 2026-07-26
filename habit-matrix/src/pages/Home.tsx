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
        <p className="text-sm text-ink-soft">
          {streak > 0
            ? `${streak} day streak — keep the flame going.`
            : "Start today. One idea is all it takes."}
        </p>
        <h1 className="font-display mt-1 text-3xl font-medium tracking-tight text-ink">
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
            className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-cream-line p-6 shadow-sm [backface-visibility:hidden]"
            style={{
              background: `linear-gradient(160deg, ${book.accent}1a, #ffffff)`,
            }}
          >
            <div>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ backgroundColor: `${book.accent}1f`, color: book.accent }}
              >
                {book.title}
              </span>
              <h2 className="font-display mt-4 text-2xl font-medium leading-snug text-ink">
                {todaysLesson.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                {todaysLesson.coreIdea}
              </p>
            </div>
            <p className="text-xs text-ink-soft/80">Tap the card to see today's action →</p>
          </div>

          {/* back */}
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-cream-line p-6 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{
              background: `linear-gradient(160deg, ${book.accent}2e, #fffdf6)`,
            }}
          >
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Why it matters
              </span>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                {todaysLesson.whyItMatters}
              </p>
              <span className="mt-5 block text-xs font-medium uppercase tracking-wide text-ink-soft">
                Try today
              </span>
              <p className="mt-2 text-[15px] leading-relaxed text-ink">
                {todaysLesson.tryToday}
              </p>
            </div>
            <p className="text-xs text-ink-soft/80">Tap to flip back</p>
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
            backgroundColor: done ? "var(--color-cream-deep)" : book.accent,
            color: done ? "var(--color-ink-soft)" : "#fffdf6",
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
          className="rounded-full border border-cream-line px-5 py-3 text-sm font-medium text-ink-soft hover:bg-cream-deep"
        >
          Full lesson
        </Link>
      </div>

      <div className="mt-10 flex items-center justify-between rounded-2xl border border-cream-line bg-white/60 px-4 py-3">
        <span className="text-sm text-ink-soft">Overall progress</span>
        <span className="font-display text-sm font-medium text-ink">
          {totalDone} / {totalLessons} lessons
        </span>
      </div>
    </PageTransition>
  );
}
