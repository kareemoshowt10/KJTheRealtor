import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useProgress } from "../context/ProgressContext";
import StreakBadge from "./StreakBadge";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { streak } = useProgress();
  const isHome = location.pathname === "/";
  const isLibrary = location.pathname.startsWith("/library");

  return (
    <div className="grain min-h-full bg-cream text-ink">
      <header className="sticky top-0 z-20 border-b border-cream-line bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="font-display text-lg tracking-tight text-ink">Distill</span>
          </Link>
          <nav className="flex items-center gap-1 rounded-full bg-cream-deep p-1 text-sm">
            <NavPill to="/" active={isHome} label="Today" />
            <NavPill to="/library" active={isLibrary} label="Library" />
          </nav>
          <StreakBadge streak={streak} />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-6">{children}</main>
    </div>
  );
}

function NavPill({ to, active, label }: { to: string; active: boolean; label: string }) {
  return (
    <Link to={to} className="relative rounded-full px-3 py-1.5 text-sm text-ink-soft">
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-full bg-teal shadow-sm"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className={`relative z-10 ${active ? "font-medium text-cream" : ""}`}>{label}</span>
    </Link>
  );
}
