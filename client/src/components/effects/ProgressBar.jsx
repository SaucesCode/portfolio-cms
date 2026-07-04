import { motion } from "framer-motion";

export default function ProgressBar({ progress }) {
  return (
    <div className="w-full">
      {/* Percentage */}
      <div className="mb-2 flex items-center justify-between font-mono text-xs tracking-wider">
        <span className="text-slate-500 uppercase">Loading Portfolio</span>
        <span className="text-blue-400/90">{Math.round(progress)}%</span>
      </div>

      {/* Progress Track */}
      <div className="relative h-[3px] overflow-hidden rounded-full bg-slate-800">
        {/* Animated Fill */}
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,.55)]"
        />

        {/* Moving Glow */}
        <motion.div
          animate={{ x: ["-100%", "600%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 h-full w-12 bg-white/20 blur-sm"
        />
      </div>
    </div>
  );
}
