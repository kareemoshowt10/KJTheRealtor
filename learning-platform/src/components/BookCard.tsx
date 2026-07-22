import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Book } from "../data/books";
import { useProgress } from "../context/ProgressContext";
import ProgressRing from "./ProgressRing";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

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
        className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:border-white/15 hover:bg-white/[0.06]"
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-lg font-semibold"
          style={{ backgroundColor: `${book.accent}22`, color: book.accent }}
        >
          {book.title
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-medium text-zinc-100">{book.title}</p>
          <p className="truncate text-sm text-zinc-500">{book.author}</p>
        </div>
        <ProgressRing progress={progress} size={40} stroke={4} color={book.accent} />
      </Link>
    </motion.div>
  );
}
