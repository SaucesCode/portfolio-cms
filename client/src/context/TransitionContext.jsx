import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

const TransitionContext = createContext(null);

const WIPE_DURATION = 0.5;
const WIPE_EASE = [0.76, 0, 0.24, 1];

export function TransitionProvider({ children }) {
  // idle -> covering (wipe slides down over the screen) ->
  // revealing (wipe continues down, uncovering the new scroll position) -> idle
  const [phase, setPhase] = useState("idle");
  const targetRef = useRef(null);

  const navigateTo = useCallback(
    hash => {
      if (phase !== "idle") return; // ignore clicks mid-transition
      const el = document.querySelector(hash);
      if (!el) return; // bad/missing hash — don't cover the screen for nothing
      targetRef.current = hash;
      setPhase("covering");
    },
    [phase],
  );

  const handleAnimationComplete = () => {
    if (phase === "covering") {
      const el = document.querySelector(targetRef.current);
      el?.scrollIntoView({ behavior: "auto", block: "start" });
      setPhase("revealing");
    } else if (phase === "revealing") {
      setPhase("idle");
    }
  };

  return (
    <TransitionContext.Provider value={{ navigateTo }}>
      {children}
      {createPortal(
        <AnimatePresence>
          {phase !== "idle" && (
            <motion.div
              key="nav-wipe"
              initial={{ y: "-100%" }}
              animate={{ y: phase === "covering" ? "0%" : "100%" }}
              exit={{ y: "100%" }}
              transition={{ duration: WIPE_DURATION, ease: WIPE_EASE }}
              onAnimationComplete={handleAnimationComplete}
              className="fixed inset-0 z-[999997] bg-blue-600 dark:bg-blue-500"
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error("useTransition must be used inside a TransitionProvider");
  }
  return ctx;
}
