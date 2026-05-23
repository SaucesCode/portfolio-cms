import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useTestimonials } from "../../hooks/useTestimonials";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Testimonials() {
  const { data: testimonials = [], isLoading } = useTestimonials();
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef(0);

  // Auto-scroll logic using requestAnimationFrame
  // This is smoother than CSS animation for pauseable carousels
  useEffect(() => {
    if (testimonials.length === 0) return;

    const scroll = () => {
      if (!isPaused && scrollRef.current) {
        positionRef.current += 0.5; // scroll speed — increase for faster

        const { scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth / 2; // we duplicate cards so reset at halfway

        // When we've scrolled halfway, reset to start — creates infinite loop
        if (positionRef.current >= maxScroll) {
          positionRef.current = 0;
        }

        scrollRef.current.scrollLeft = positionRef.current;
      }

      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    // Cleanup on unmount
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPaused, testimonials]);

  if (isLoading || testimonials.length === 0) return null;

  // Duplicate cards to create seamless infinite scroll effect
  // When the first set ends, the duplicate set is already there
  const doubled = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="py-24 bg-[#0a0a0f] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        {/* Section heading */}
        <motion.div
          className="text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <p className="text-blue-400 text-sm font-mono tracking-widest uppercase mb-3">
            Kind Words
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Testimonials</h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            What people I've worked with have to say.
          </p>
        </motion.div>
      </div>

      {/* Scrolling carousel — full width, no max-width constraint */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden cursor-grab select-none px-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {doubled.map((testimonial, index) => (
          <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} />
        ))}
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="flex-shrink-0 w-80 p-6 rounded-2xl bg-gray-900 border border-white/5 hover:border-blue-500/20 transition-colors duration-300">
      {/* Quote icon */}
      <Quote size={20} className="text-blue-500/40 mb-4" />

      {/* Quote text */}
      <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
        "{testimonial.quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        {/* Avatar — initials fallback if no image */}
        {testimonial.avatarUrl ? (
          <img
            src={testimonial.avatarUrl}
            alt={testimonial.name}
            className="w-9 h-9 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-semibold">
            {/* First letter of first and last name */}
            {testimonial.name
              .split(" ")
              .map(n => n[0])
              .join("")
              .slice(0, 2)}
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-white">{testimonial.name}</p>
          <p className="text-xs text-gray-500">
            {testimonial.role} · {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );
}
