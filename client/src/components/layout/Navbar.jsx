import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Moon,
  Sun,
  Menu,
  X,
  User,
  FolderKanban,
  Brain,
  Briefcase,
  PenSquare,
  Mail,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useHero } from "../../hooks/useHero";

const NAV_LINKS = [
  { label: "About", href: "#hero", icon: User },
  { label: "Projects", href: "#projects", icon: FolderKanban },
  { label: "Skills", href: "#skills", icon: Brain },
  { label: "Experience", href: "#experience", icon: Briefcase },
  { label: "Blog", href: "#blog", icon: PenSquare },
  { label: "Contact", href: "#contact", icon: Mail },
];

const SECTION_IDS = ["hero", "projects", "skills", "experience", "blog", "contact"];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { data: hero } = useHero();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // Scroll detection
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Scroll spy
  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;

      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const section = document.getElementById(SECTION_IDS[i]);

        if (section && scrollPos >= section.offsetTop) {
          setActiveIdx(i);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const firstName = hero?.name ? hero.name.trim().split(" ")[0] : "James";

  return (
    <>
      {/* ── Floating Navbar ──────────────────────────────────────── */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-max px-4 transition-all duration-200 md:opacity-100 md:pointer-events-auto ${menuOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}
      >
        {" "}
        <nav
          className={`
            relative flex items-center gap-0 rounded-2xl border px-1.5 py-1.5
            transition-all duration-300
            ${
              scrolled
                ? "bg-background/85 border-border/70 shadow-xl shadow-black/8 backdrop-blur-2xl"
                : "bg-background/50 border-border/30 backdrop-blur-xl"
            }
          `}
        >
          {/* Blue left-edge accent on scroll */}
          <motion.div
            className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full bg-blue-600"
            animate={{ opacity: scrolled ? 1 : 0, scaleY: scrolled ? 1 : 0.4 }}
            transition={{ duration: 0.25 }}
          />

          {/* First name badge */}
          <Link
            to="/"
            className="mr-2 ml-1.5 flex h-7 shrink-0 items-center justify-center rounded-[7px] bg-blue-600 px-2.5 text-[10px] font-black text-white tracking-wider hover:bg-blue-500 transition-colors whitespace-nowrap"
          >
            {firstName}
          </Link>

          {/* Desktop nav */}
          <div className="relative hidden md:flex items-center gap-0">
            {NAV_LINKS.map((link, i) => {
              const Icon = link.icon;
              const isActive = activeIdx === i;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setActiveIdx(i)}
                  className={`
                    relative flex items-center gap-1.5 px-3 py-2
                    text-[11.5px] font-semibold uppercase tracking-[0.09em]
                    transition-all duration-200
                    ${
                      isActive
                        ? "text-blue-500 dark:text-blue-400"
                        : "text-muted-foreground/70 hover:text-foreground"
                    }
                  `}
                  style={
                    isActive
                      ? {
                          textShadow:
                            "0 0 12px rgb(59 130 246 / 0.7), 0 0 24px rgb(59 130 246 / 0.35)",
                        }
                      : undefined
                  }
                >
                  <Icon
                    size={13}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    style={
                      isActive
                        ? {
                            filter: "drop-shadow(0 0 4px rgb(59 130 246 / 0.8))",
                          }
                        : undefined
                    }
                  />
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Divider */}
          <div className="hidden md:block h-4 w-px bg-border mx-2" />

          {/* Right side */}
          <div className="hidden md:flex items-center gap-1">
            {/* Available badge */}
            {hero?.availableForWork && (
              <div className="flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/8 px-2.5 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-green-600 dark:text-green-400">
                  Available
                </span>
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 30, opacity: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Toggle menu"
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 ml-1"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </nav>
      </header>

      {/* ── Mobile drawer ────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />

            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 38 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden flex flex-col bg-background border-l border-border"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 shrink-0 items-center justify-center rounded-[7px] bg-blue-600 px-2.5 text-[10px] font-black text-white tracking-wider">
                    {firstName}
                  </div>
                  <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-foreground truncate max-w-[150px]">
                    {hero?.name || "Portfolio"}
                  </span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
                {NAV_LINKS.map((link, i) => {
                  const Icon = link.icon;
                  const isActive = activeIdx === i;
                  return (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={() => {
                        setActiveIdx(i);
                        setMenuOpen(false);
                      }}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      className={`
                        flex items-center gap-3 rounded-xl px-3 py-2.5
                        text-[11.5px] font-bold uppercase tracking-[0.1em]
                        transition-all duration-150
                        ${
                          isActive
                            ? "bg-blue-600/10 text-blue-500 dark:text-blue-400"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }
                      `}
                      style={
                        isActive
                          ? {
                              textShadow: "0 0 10px rgb(59 130 246 / 0.5)",
                            }
                          : undefined
                      }
                    >
                      {/* Active left bar */}
                      <span
                        className={`h-4 w-[2.5px] rounded-full transition-all ${
                          isActive ? "bg-blue-500" : "bg-transparent"
                        }`}
                      />
                      <Icon
                        size={14}
                        strokeWidth={isActive ? 2.4 : 1.8}
                        style={
                          isActive
                            ? {
                                filter: "drop-shadow(0 0 3px rgb(59 130 246 / 0.7))",
                              }
                            : undefined
                        }
                      />
                      {link.label}
                    </motion.a>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-border flex items-center justify-between">
                {hero?.availableForWork && (
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-green-600 dark:text-green-400">
                      Available
                    </span>
                  </div>
                )}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-all"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun size={12} /> Light
                    </>
                  ) : (
                    <>
                      <Moon size={12} /> Dark
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
