import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CountUp } from "countup.js";
import { useStats } from "../../hooks/useStats";

// Individual stat card — handles its own CountUp instance
function StatCard({ stat }) {
  const countRef = useRef(null); // ref to the number element
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Intersection Observer watches when this element enters the viewport
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !hasAnimated) {
          // Start counting up when element is visible
          const countUp = new CountUp(countRef.current, stat.value, {
            duration: 2.5,
            useEasing: true,
          });
          countUp.start();
          setHasAnimated(true); // only animate once
          observer.disconnect(); // stop watching after first trigger
        }
      },
      { threshold: 0.5 }, // trigger when 50% of element is visible
    );

    if (countRef.current) observer.observe(countRef.current);

    return () => observer.disconnect();
  }, [stat.value, hasAnimated]);

  return (
    <motion.div
      className="flex flex-col items-center gap-2 p-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* The number CountUp animates */}
      <span ref={countRef} className="text-4xl md:text-5xl font-bold text-white">
        0
      </span>

      {/* Label */}
      <span className="text-sm text-gray-400 text-center">{stat.label}</span>
    </motion.div>
  );
}

export default function Stats() {
  const { data: stats = [], isLoading } = useStats();

  if (isLoading || stats.length === 0) return null;

  return (
    <section className="py-16 bg-[#0a0a0f] border-y border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/5">
          {stats.map(stat => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
