// client/src/components/effects/LoadingScreen.jsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ dataReady, minDuration = 2200, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const startRef = useRef(null);

  // Progress ticks up toward 90% on its own; only completes to 100%
  // once both the timer AND the real data are ready.
  useEffect(() => {
    if (startRef.current === null) startRef.current = performance.now();
    let raf;

    const tick = now => {
      const elapsed = now - startRef.current;
      const timeDone = elapsed >= minDuration;

      // Ease toward 90% while waiting, snap to 100% once both conditions clear
      if (timeDone && dataReady) {
        setProgress(100);
        setExiting(true);
        return;
      }

      const cap = 90;
      const pct = Math.min(cap, (elapsed / minDuration) * cap);
      setProgress(pct);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dataReady, minDuration]);

  // Lock scroll while the splash is up
  useEffect(() => {
    document.body.style.overflow = exiting ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [exiting]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!exiting && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-background"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
              backgroundSize: "256px",
            }}
          />
          <div className="pointer-events-none absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-blue-600/10 dark:bg-blue-500/12 blur-[120px]" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-[16px] font-black text-white tracking-wider shadow-lg shadow-blue-600/30"
          >
            JP
          </motion.div>

          <div className="relative z-10 h-[2px] w-40 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-violet-600"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40"
          >
            Loading
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
