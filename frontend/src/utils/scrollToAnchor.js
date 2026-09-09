const HEADER_GAP_PX = 12;

export function getFixedHeaderOffset() {
  const nav = document.querySelector('nav');
  if (!nav) return 120;
  return Math.round(nav.getBoundingClientRect().bottom) + HEADER_GAP_PX;
}

export function scrollToAnchor(id, { retries = 30 } = {}) {
  const element = document.getElementById(id);
  if (!element) {
    if (retries > 0) {
      window.setTimeout(() => scrollToAnchor(id, { retries: retries - 1 }), 50);
    }
    return;
  }

  const offset = getFixedHeaderOffset();
  const lenis = window.lenis;

  if (lenis) {
    lenis.scrollTo(element, { offset: -offset, force: true });
    return;
  }

  const top = window.scrollY + element.getBoundingClientRect().top - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}
