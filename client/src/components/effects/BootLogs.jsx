import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    threshold: 8,
    text: "Initializing Portfolio",
  },
  {
    threshold: 18,
    text: "Connecting Portfolio API",
  },
  {
    threshold: 35,
    text: "Fetching Hero Content",
  },
  {
    threshold: 52,
    text: "Rendering Featured Projects",
  },
  {
    threshold: 68,
    text: "Loading Tech Stack",
  },
  {
    threshold: 84,
    text: "Syncing Experience Timeline",
  },
  {
    threshold: 95,
    text: "Decrypting Identity",
  },
];

export default function BootLogs({ progress }) {
  return (
    <div className="w-full max-w-xl space-y-2.5 font-mono text-[13px]">
      <AnimatePresence>
        {steps
          .filter(step => progress >= step.threshold)
          .map(step => (
            <motion.div
              key={step.text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center"
            >
              <span className="mr-3 text-blue-500/60">&gt;</span>
              <span className="flex-1 text-slate-400">{step.text}</span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-blue-400/80"
              >
                ✓
              </motion.span>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
