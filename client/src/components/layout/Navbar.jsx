import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useHero } from "../../hooks/useHero";
import { smoothScrollTo } from "@/lib/SmoothScroll";

const NAV_LINKS = [
  { label: "About", href: "#hero" },
  { label: "Work", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Writing", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

const SECTION_IDS = ["hero", "projects", "skills", "experience", "blog", "contact"];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { data: hero } = useHero();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

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
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  const firstName = hero?.name ? hero.name.trim().split(" ")[0] : "James";

  return (
    <>
      <header
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-max px-4 transition-opacity duration-200 ${
          menuOpen
            ? "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto"
            : "opacity-100"
        }`}
      >
        <nav
          className="relative flex items-center gap-0.5 rounded-full border px-1.5 py-1.5 transition-all duration-300"
          style={{
            background: scrolled
              ? "color-mix(in oklch, var(--background) 82%, transparent)"
              : "color-mix(in oklch, var(--background) 55%, transparent)",
            borderColor: scrolled
              ? "var(--rule)"
              : "color-mix(in oklch, var(--rule) 50%, transparent)",
            backdropFilter: "blur(14px)",
            boxShadow: scrolled ? "0 8px 24px -12px rgba(0,0,0,0.18)" : "none",
          }}
        >
          {/* Name badge */}
          <Link
            to="/"
            className="mr-1 ml-1 flex h-8 shrink-0 items-center justify-center rounded-full px-3.5 text-[11px] font-bold tracking-wide transition-transform duration-200 hover:-translate-y-px"
            style={{ background: "var(--signal)", color: "var(--background)" }}
          >
            {firstName}
          </Link>

          {/* Desktop links */}
          <div className="relative hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link, i) => {
              const isActive = activeIdx === i;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={e => {
                    e.preventDefault();
                    setActiveIdx(i);
                    smoothScrollTo(link.href);
                  }}
                  className="relative px-3.5 py-2 text-[12.5px] font-medium tracking-tight transition-colors duration-200"
                  style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute left-3.5 right-3.5 -bottom-[1px] h-[2px] rounded-full"
                      style={{ background: "var(--signal)" }}
                      transition={{ type: "spring", stiffness: 420, damping: 38 }}
                    />
                  )}
                </a>
              );
            })}
          </div>

          <div
            className="hidden md:block h-4 w-px mx-2"
            style={{ background: "var(--rule)" }}
          />

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-1.5 pr-0.5">
            {hero?.availableForWork && (
              <div
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1.5"
                style={{ borderColor: "var(--rule)" }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                    style={{ background: "var(--signal-warm)" }}
                  />
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--signal-warm)" }}
                  />
                </span>
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: "var(--signal-warm)" }}
                >
                  Available
                </span>
              </div>
            )}

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200"
              style={{ color: "var(--muted-foreground)" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 30, opacity: 0 }}
                  transition={{ duration: 0.18 }}
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
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-full ml-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "color-mix(in oklch, var(--ink, #000) 40%, transparent)" }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 38 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden flex flex-col border-l"
              style={{ background: "var(--background)", borderColor: "var(--rule)" }}
            >
              <div
                className="flex items-center justify-between px-5 py-5 border-b"
                style={{ borderColor: "var(--rule)" }}
              >
                <span
                  className="flex h-8 items-center justify-center rounded-full px-3.5 text-[11px] font-bold"
                  style={{ background: "var(--signal)", color: "var(--background)" }}
                >
                  {firstName}
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-0.5">
                {NAV_LINKS.map((link, i) => {
                  const isActive = activeIdx === i;
                  return (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={e => {
                        e.preventDefault();
                        setActiveIdx(i);
                        setMenuOpen(false);
                        setTimeout(() => smoothScrollTo(link.href), 320);
                      }}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-baseline justify-between py-3 border-b"
                      style={{ borderColor: "var(--rule)" }}
                    >
                      <span
                        style={{
                          fontFamily: isActive ? "var(--font-display)" : "var(--font-sans)",
                          fontStyle: isActive ? "italic" : "normal",
                          color: isActive ? "var(--signal)" : "var(--foreground)",
                          fontSize: "clamp(22px, 6vw, 26px)",
                        }}
                      >
                        {link.label}
                      </span>
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </motion.a>
                  );
                })}
              </nav>

              <div
                className="px-5 py-5 border-t flex items-center justify-between"
                style={{ borderColor: "var(--rule)" }}
              >
                {hero?.availableForWork && (
                  <span
                    className="flex items-center gap-1.5 text-[10px] font-semibold"
                    style={{ color: "var(--signal-warm)" }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--signal-warm)" }}
                    />
                    Available for work
                  </span>
                )}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10.5px] font-semibold"
                  style={{ borderColor: "var(--rule)", color: "var(--muted-foreground)" }}
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
