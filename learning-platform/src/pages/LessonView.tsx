import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import { useProgress } from "../context/ProgressContext";
import { books } from "../data/books";

const block = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.12, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function LessonView() {
  const { bookId, lessonId } = useParams();
  const navigate = useNavigate();
  const book = books.find((b) => b.id === bookId);
  const { isDone, markDone } = useProgress();

  if (!book) return <Navigate to="/library" replace />;
  const idx = book.lessons.findIndex((l) => l.id === lessonId);
  const lesson = book.lessons[idx];
  if (!lesson) return <Navigate to={`/book/${book.id}`} replace />;

  const done = isDone(lesson.id);
  const prev = book.lessons[idx - 1];
  const next = book.lessons[idx + 1];

  return (
    <PageTransition>
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <Link to={`/book/${book.id}`} className="hover:text-zinc-300">
          ← {book.title}
        </Link>
        <span>
          {lesson.order} / {book.lessons.length}
        </span>
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: book.accent }}
          initial={{ width: 0 }}
          animate={{ width: `${(lesson.order / book.lessons.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <motion.h1
        key={`title-${lesson.id}`}
        custom={0}
        variants={block}
        initial="hidden"
        animate="show"
        className="font-display mt-6 text-3xl font-medium leading-tight text-white"
      >
        {lesson.title}
      </motion.h1>

      <motion.div
        key={`idea-${lesson.id}`}
        custom={1}
        variants={block}
        initial="hidden"
        animate="show"
        className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-5"
      >
        <p className="text-[15px] leading-relaxed text-zinc-200">{lesson.coreIdea}</p>
      </motion.div>

      <motion.div key={`why-${lesson.id}`} custom={2} variants={block} initial="hidden" animate="show" className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Why it matters</p>
        <p className="mt-2 text-[15px] leading-relaxed text-zinc-300">{lesson.whyItMatters}</p>
      </motion.div>

      <motion.div
        key={`try-${lesson.id}`}
        custom={3}
        variants={block}
        initial="hidden"
        animate="show"
        className="mt-5 rounded-2xl p-5"
        style={{ background: `linear-gradient(135deg, ${book.accent}2e, rgba(255,255,255,0.02))` }}
      >
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: book.accentSoft }}>
          Try today
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-white">{lesson.tryToday}</p>
      </motion.div>

      <motion.div
        custom={4}
        variants={block}
        initial="hidden"
        animate="show"
        className="mt-6 flex items-center gap-3"
      >
        <button
          onClick={() => markDone(lesson.id)}
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
              {done ? "✓ Completed" : "Mark as done"}
            </motion.span>
          </AnimatePresence>
        </button>
      </motion.div>

      <div className="mt-8 flex items-center justify-between border-t border-white/6 pt-4 text-sm">
        {prev ? (
          <button
            onClick={() => navigate(`/book/${book.id}/lesson/${prev.id}`)}
            className="text-zinc-400 hover:text-zinc-200"
          >
            ← {prev.title}
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button
            onClick={() => navigate(`/book/${book.id}/lesson/${next.id}`)}
            className="text-zinc-400 hover:text-zinc-200"
          >
            {next.title} →
          </button>
        ) : (
          <span className="text-zinc-600">Last lesson in this book 🎉</span>
        )}
      </div>
    </PageTransition>
  );
}
