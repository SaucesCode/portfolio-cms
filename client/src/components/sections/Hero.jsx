import { useEffect, useRef } from "react";
import Typewriter from "typewriter-effect";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Download, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { useHero } from "../../hooks/useHero";
import ParticleBackground from "../effects/ParticleBackground";

export default function Hero() {
  const { data: hero, isLoading } = useHero();

  if (isLoading)
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </section>
    );

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Particle background sits behind everything */}
      <ParticleBackground />

      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col-reverse md:flex-row items-center gap-12 md:gap-20">
        {/* Left — Text content */}
        <motion.div
          className="flex-1 text-center md:text-left"
          // Fades in and slides up on load
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Available for work badge */}
          {hero?.availableForWork && (
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                Available for work
              </span>
            </motion.div>
          )}

          {/* Name */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Hi, I'm <span className="text-blue-600 dark:text-blue-400">{hero?.name}</span>
          </h1>

          {/* Typewriter — cycles through taglines from DB */}
          <div className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 h-10">
            <Typewriter
              options={{
                strings: hero?.tagline || ["Developer"],
                autoStart: true,
                loop: true,
                delay: 50,
                deleteSpeed: 30,
              }}
            />
          </div>

          {/* Bio */}
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mb-8 leading-relaxed">
            {hero?.bio}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-8">
            <a
              href="#projects"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              View My Work
            </a>
            {hero?.resumeUrl && (
              <a
                href={hero.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Download Resume
              </a>
            )}
          </div>

          {/* Social Links */}
          <div className="flex gap-4 justify-center md:justify-start">
            <a
              href={`https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <FaGithub size={22} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <FaLinkedin size={22} />
            </a>
          </div>
        </motion.div>

        {/* Right — Profile photo with float animation */}
        <motion.div
          className="flex-shrink-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div
            className="w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-blue-500/30 shadow-2xl shadow-blue-500/20"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            <img
              src={hero?.profileImageUrl || "https://via.placeholder.com/300"}
              alt={hero?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </div>

      {/* Scroll down arrow */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 dark:text-gray-600"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <ArrowDown size={24} />
      </motion.div>
    </section>
  );
}
