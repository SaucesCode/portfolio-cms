// client/src/components/effects/LoadingScreen.jsx

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

import BootLogs from "./BootLogs";
import ProgressBar from "./ProgressBar";
import EncryptedText from "./EncryptedText";
import BlinkingCursor from "./BlinkingCursor";

export default function LoadingScreen({ dataReady, minDuration = 4000, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [decrypt, setDecrypt] = useState(false);
  const [ready, setReady] = useState(false);

  const startRef = useRef(null);

  useEffect(() => {
    if (startRef.current === null) {
      startRef.current = performance.now();
    }

    let raf;

    const tick = now => {
      const elapsed = now - startRef.current;
      const timeDone = elapsed >= minDuration;

      if (timeDone && dataReady) {
        setProgress(100);

        if (!decrypt) {
          setDecrypt(true);

          // ~19 letters × 90ms reveal speed ≈ 1.7s, plus a beat to let it land
          setTimeout(() => {
            setReady(true);

            setTimeout(() => {
              setExiting(true);
            }, 1500);
          }, 2200);
        }

        return;
      }

      const cap = 95;
      const pct = Math.min(cap, (elapsed / minDuration) * cap);

      setProgress(pct);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [dataReady, minDuration, decrypt]);

  useEffect(() => {
    document.body.style.overflow = exiting ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [exiting]);

  return createPortal(
    <AnimatePresence onExitComplete={onComplete}>
      {!exiting && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            filter: "blur(8px)",
          }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="fixed inset-0 z-[2147483647] overflow-hidden bg-slate-950"
        >
          {/* Grain */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
              backgroundSize: "220px",
            }}
          />

          {/* Glow — subdued, off to the sides so the center stays calm */}
          <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[180px]" />
          <div className="absolute -left-52 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[150px]" />

          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(to right,#ffffff 1px,transparent 1px),linear-gradient(to bottom,#ffffff 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-8">
            {/* Eyebrow — replaces the old logo mark */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 flex items-center gap-3"
            >
              <span className="h-px w-6 bg-slate-700" />
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500">
                Portfolio
              </span>
              <span className="h-px w-6 bg-slate-700" />
            </motion.div>

            {/* Heading */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-12 font-mono text-xs uppercase tracking-[0.35em] text-slate-400"
            >
              Preparing your experience
            </motion.p>

            {/* Logs */}
            <BootLogs progress={progress} />

            <div className="mt-10 w-full max-w-xl">
              <ProgressBar progress={progress} />
            </div>

            {/* Identity */}
            <AnimatePresence>
              {decrypt && (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-14 text-center"
                >
                  <EncryptedText
                    text="James Patrick De Mesa"
                    className="block font-mono text-2xl font-bold tracking-widest md:text-3xl"
                    encryptedClassName="text-blue-500/70"
                    revealedClassName="text-white"
                    revealSpeed={90}
                  />

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-3 font-mono text-[11px] uppercase tracking-[0.35em] text-slate-500"
                  >
                    Full-Stack Developer
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* READY */}
            <AnimatePresence>
              {ready && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-10 flex items-center gap-1 font-mono text-xs uppercase tracking-[0.3em] text-blue-400/90"
                >
                  Ready
                  <BlinkingCursor className="text-blue-400/90" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
