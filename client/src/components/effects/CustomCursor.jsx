import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    // Track mouse position and move both elements
    const handleMouseMove = e => {
      const { clientX: x, clientY: y } = e;

      // Dot follows cursor exactly
      dot.style.transform = `translate(${x}px, ${y}px)`;

      // Ring follows with a slight delay using CSS transition
      ring.style.transform = `translate(${x}px, ${y}px)`;
    };

    // Scale up ring when hovering over clickable elements
    const handleMouseOver = e => {
      if (e.target.matches('a, button, [role="button"]')) {
        ring.style.scale = "2";
        ring.style.opacity = "0.5";
      }
    };

    const handleMouseOut = () => {
      ring.style.scale = "1";
      ring.style.opacity = "1";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    // Cleanup — remove listeners when component unmounts
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return (
    <>
      {/* Small glowing dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-blue-500 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ boxShadow: "0 0 6px 2px rgba(59,130,246,0.6)" }}
      />
      {/* Larger trailing ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-blue-400 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ transition: "transform 0.12s ease-out, scale 0.2s ease, opacity 0.2s ease" }}
      />
    </>
  );
}
