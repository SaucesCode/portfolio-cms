const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

export function smoothScrollTo(hash, { duration = 850, offset = 32 } = {}) {
  const id = hash.replace("#", "");
  const el = document.getElementById(id);
  if (!el) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startY = window.scrollY;
  const targetY = el.getBoundingClientRect().top + startY - offset;

  if (reducedMotion) {
    window.scrollTo(0, targetY);
    return;
  }

  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
