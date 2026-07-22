import { motion, AnimatePresence } from "framer-motion";

export default function StreakBadge({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-amber-300">
      <motion.span
        key={streak > 0 ? "lit" : "unlit"}
        animate={streak > 0 ? { scale: [1, 1.25, 1] } : {}}
        transition={{ duration: 0.4 }}
        className="text-base"
      >
        {streak > 0 ? "🔥" : "🕯️"}
      </motion.span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={streak}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {streak}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
