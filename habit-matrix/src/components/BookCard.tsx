import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Book } from "../data/books";
import { useProgress } from "../context/ProgressContext";
import ProgressRing from "./ProgressRing";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const TITLE_STOPWORDS = new Set(["the", "of", "and", "a", "an", "to"]);

function initialsFor(title: string) {
  const words = title.split(" ").filter((w) => !TITLE_STOPWORDS.has(w.toLowerCase()));
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function BookCard({ book, index }: { book: Book; index: number }) {
  const { completed } = useProgress();
  const done = book.lessons.filter((l) => completed[l.id]).length;
  const progress = done / book.lessons.length;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3 }}
    >
      <Link
        to={`/book/${book.id}`}
        className="group flex items-center gap-4 rounded-2xl border border-cream-line bg-white/60 p-4 shadow-sm transition-colors hover:border-teal/30 hover:bg-white"
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-lg font-semibold"
          style={{ backgroundColor: `${book.accent}1f`, color: book.accent }}
        >
          {initialsFor(book.title)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-medium text-ink">{book.title}</p>
          <p className="truncate text-sm text-ink-soft">{book.author}</p>
        </div>
        <ProgressRing progress={progress} size={40} stroke={4} color={book.accent} />
      </Link>
    </motion.div>
  );
}
