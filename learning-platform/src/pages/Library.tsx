import PageTransition from "../components/PageTransition";
import BookCard from "../components/BookCard";
import { books } from "../data/books";

export default function Library() {
  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-medium tracking-tight text-white">Library</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Four books, distilled into small daily lessons.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {books.map((book, i) => (
          <BookCard key={book.id} book={book} index={i} />
        ))}
      </div>
    </PageTransition>
  );
}
