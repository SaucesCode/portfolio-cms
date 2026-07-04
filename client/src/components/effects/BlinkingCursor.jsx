import { motion } from "framer-motion";

export default function BlinkingCursor({ character = "_", className = "" }) {
  return (
    <motion.span
      animate={{
        opacity: [1, 0, 1],
      }}
      transition={{
        duration: 0.9,
        repeat: Infinity,
        ease: "linear",
      }}
      className={className}
    >
      {character}
    </motion.span>
  );
}
