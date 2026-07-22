import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ProgressProvider } from "./context/ProgressContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Library from "./pages/Library";
import BookDetail from "./pages/BookDetail";
import LessonView from "./pages/LessonView";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/book/:bookId" element={<BookDetail />} />
        <Route path="/book/:bookId/lesson/:lessonId" element={<LessonView />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <HashRouter>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </HashRouter>
    </ProgressProvider>
  );
}
