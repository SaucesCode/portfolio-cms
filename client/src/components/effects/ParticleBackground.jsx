import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "../../context/ThemeContext";

export default function ParticleBackground() {
  const { theme } = useTheme();

  // loadSlim loads a smaller bundle — only the features we need
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  const particleColor = theme === "dark" ? "#3b82f6" : "#93c5fd";
  const lineColor = theme === "dark" ? "#1d4ed8" : "#bfdbfe";

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      className="absolute inset-0 -z-10" // sits behind all content
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab", // particles connect to cursor on hover
            },
            onClick: {
              enable: true,
              mode: "repulse", // particles push away on click
            },
          },
          modes: {
            grab: { distance: 140, links: { opacity: 1 } },
            repulse: { distance: 200, duration: 0.4 },
          },
        },
        particles: {
          color: { value: particleColor },
          links: {
            color: lineColor,
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1.5,
            outModes: { default: "bounce" },
          },
          number: {
            value: 60,
            density: { enable: true, area: 800 },
          },
          opacity: { value: 0.4 },
          size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
      }}
    />
  );
}
