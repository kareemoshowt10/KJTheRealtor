import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import ProgressRing from "../components/ProgressRing";
import { useProgress } from "../context/ProgressContext";
import { books } from "../data/books";

export default function BookDetail() {
  const { bookId } = useParams();
  const book = books.find((b) => b.id === bookId);
  const { completed } = useProgress();

  if (!book) return <Navigate to="/library" replace />;

  const done = book.lessons.filter((l) => completed[l.id]).length;
  const progress = done / book.lessons.length;

  return (
    <PageTransition>
      <Link to="/library" className="text-sm text-zinc-500 hover:text-zinc-300">
        ← Library
      </Link>

      <div
        className="mt-4 rounded-3xl border border-white/8 p-6"
        style={{ background: `linear-gradient(160deg, ${book.accent}22, rgba(255,255,255,0.02))` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: book.accentSoft }}>
              {book.theme}
            </p>
            <h1 className="font-display mt-1 text-2xl font-medium text-white">{book.title}</h1>
            <p className="mt-0.5 text-sm text-zinc-400">{book.author}</p>
          </div>
          <ProgressRing progress={progress} color={book.accent} label={`${done}/${book.lessons.length}`} />
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-zinc-300">{book.blurb}</p>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {book.lessons.map((lesson, i) => {
          const isDone = Boolean(completed[lesson.id]);
          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                to={`/book/${book.id}/lesson/${lesson.id}`}
                className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: isDone ? book.accent : "rgba(255,255,255,0.08)",
                    color: isDone ? "#0b0b0f" : "#9ca3af",
                  }}
                >
                  {isDone ? "✓" : lesson.order}
                </span>
                <span className="flex-1 text-[15px] text-zinc-200">{lesson.title}</span>
                <span className="text-xs text-zinc-600">{lesson.minutes} min</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </PageTransition>
  );
}
