import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useHero } from "../../hooks/useHero";

export default function Footer() {
  const { data: hero } = useHero();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {currentYear} {hero?.name || "Portfolio"}. All rights reserved.
        </p>

        {/* Social links */}
        <div className="flex items-center gap-4">
          <a
            href={`https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <FaGithub size={20} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
