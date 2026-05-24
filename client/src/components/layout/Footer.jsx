import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

import { motion } from "framer-motion";

import { useHero } from "../../hooks/useHero";

export default function Footer() {
  const { data: hero } = useHero();

  const currentYear = new Date().getFullYear();

  const SOCIALS = [
    {
      icon: FaGithub,
      href: `https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}`,
      label: "GitHub",
    },
    {
      icon: FaLinkedin,
      href: "https://linkedin.com",
      label: "LinkedIn",
    },
    {
      icon: FaInstagram,
      href: "https://instagram.com",
      label: "Instagram",
    },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Top Border Glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100/50 dark:to-white/[0.03]" />

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center text-center">
          {/* Name */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="
              text-2xl md:text-3xl
              font-bold
              tracking-tight

              text-gray-900 dark:text-white
            "
          >
            {hero?.name || "Portfolio"}
          </motion.h2>

          {/* Role / Branding */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="
              mt-4
              max-w-md

              text-sm md:text-base
              leading-relaxed

              text-gray-600 dark:text-gray-400
            "
          >
            Full-stack developer crafting modern, scalable, and visually engaging digital
            experiences.
          </motion.p>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-10 flex items-center gap-4"
          >
            {SOCIALS.map(social => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="
                    group

                    flex h-12 w-12
                    items-center justify-center

                    rounded-full

                    border border-black/5 dark:border-white/10

                    bg-white/70 dark:bg-white/5

                    backdrop-blur-xl

                    text-gray-700 dark:text-gray-300

                    transition-all duration-300

                    hover:-translate-y-1
                    hover:bg-white
                    dark:hover:bg-white/10

                    hover:text-black
                    dark:hover:text-white
                  "
                >
                  <Icon
                    size={18}
                    className="
                      transition-transform duration-300
                      group-hover:scale-110
                    "
                  />
                </a>
              );
            })}
          </motion.div>

          {/* Bottom Text */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="
              mt-12

              text-xs
              tracking-wide

              text-gray-500 dark:text-gray-500
            "
          >
            © {currentYear} {hero?.name || "Portfolio"}. Built with React, Node.js, and
            passion.
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
