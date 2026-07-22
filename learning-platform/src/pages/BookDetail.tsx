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
      <Link to="/library" className="text-sm text-ink-soft hover:text-ink">
        ← Library
      </Link>

      <div
        className="mt-4 rounded-3xl border border-cream-line p-6 shadow-sm"
        style={{ background: `linear-gradient(160deg, ${book.accent}1a, #ffffff)` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: book.accent }}>
              {book.theme}
            </p>
            <h1 className="font-display mt-1 text-2xl font-medium text-ink">{book.title}</h1>
            <p className="mt-0.5 text-sm text-ink-soft">{book.author}</p>
          </div>
          <ProgressRing progress={progress} color={book.accent} label={`${done}/${book.lessons.length}`} />
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{book.blurb}</p>
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
                className="flex items-center gap-3 rounded-xl border border-cream-line bg-white/60 px-4 py-3 transition-colors hover:border-teal/30 hover:bg-white"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: isDone ? book.accent : "rgba(43,36,25,0.08)",
                    color: isDone ? "#fffdf6" : "var(--color-ink-soft)",
                  }}
                >
                  {isDone ? "✓" : lesson.order}
                </span>
                <span className="flex-1 text-[15px] text-ink">{lesson.title}</span>
                <span className="text-xs text-ink-soft/70">{lesson.minutes} min</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </PageTransition>
  );
}
