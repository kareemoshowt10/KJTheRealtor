/* ════════════════════════════════════════════════════════════════
   NAV-UNIFIED.JS — Tesla × Apple Navigation Behavior
   - Transparent at top of page (Tesla)
   - Frosted glass on scroll (Apple)
   - Mobile drawer toggle
   ════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const header = document.getElementById('siteHeader');
  const toggle = header?.querySelector('.menu-toggle');
  const navLinks = header?.querySelector('.nav-links');
  if (!header) return;

  // ── Scroll threshold (px before nav becomes frosted) ──────────
  const SCROLL_THRESHOLD = 60;

  function updateNavState() {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    header.classList.toggle('scrolled', scrolled);
  }

  // Initial check
  updateNavState();

  // Passive scroll listener for performance
  window.addEventListener('scroll', updateNavState, { passive: true });

  // ── Mobile menu toggle ────────────────────────────────────────
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('open', !expanded);
    });

    // Close drawer on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        toggle.focus();
      }
    });
  }

  // ── Active link highlight ────────────────────────────────────
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  header.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(link => {
    const href = link.getAttribute('href')?.split('#')[0]?.split('/').pop() || 'index.html';
    if (href === currentPath) {
      link.style.fontWeight = '500';
      link.setAttribute('aria-current', 'page');
    }
  });

})();
