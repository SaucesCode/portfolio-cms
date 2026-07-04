import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}<>?";

function randomChar() {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

export default function EncryptedText({
  text,
  className = "",
  encryptedClassName = "text-slate-500",
  revealedClassName = "text-white",
  revealSpeed = 45,
  flipSpeed = 35,
  onComplete,
}) {
  const [revealed, setRevealed] = useState(0);
  const [display, setDisplay] = useState(text);

  const revealRef = useRef(0);

  useEffect(() => {
    revealRef.current = 0;

    const start = performance.now();

    let raf;

    const animate = now => {
      const elapsed = now - start;

      const revealCount = Math.min(text.length, Math.floor(elapsed / revealSpeed));

      revealRef.current = revealCount;

      let result = "";

      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          result += " ";
        } else if (i < revealCount) {
          result += text[i];
        } else {
          result += randomChar();
        }
      }

      setDisplay(result);
      setRevealed(revealCount);

      if (revealCount < text.length) {
        raf = requestAnimationFrame(animate);
      } else {
        setDisplay(text);
        onComplete?.();
      }
    };

    raf = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(raf);
  }, [text, revealSpeed, flipSpeed, onComplete]);

  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={className}>
      {display.split("").map((char, index) => (
        <span
          key={index}
          className={index < revealed ? revealedClassName : encryptedClassName}
        >
          {char}
        </span>
      ))}
    </motion.span>
  );
}
