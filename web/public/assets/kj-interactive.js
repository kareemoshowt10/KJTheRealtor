/* KJ interactive components — vanilla ports of the shadcn
   interactive-hover-button and zoom-parallax React components. */
(function () {
  "use strict";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. Interactive hover button ─────────────────────────────────── */
  var ARROW =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function decorateButtons() {
    var els = document.querySelectorAll(".btn-gold, .btn-primary, .nav-cta, .header-cta");
    Array.prototype.forEach.call(els, function (el) {
      if (el.dataset.kjx) return;
      if (el.children.length > 0) return;            /* skip buttons with icons/markup */
      var t = el.textContent.trim();
      if (!t || t.length > 38) return;
      el.dataset.kjx = "1";
      el.classList.add("kjx");
      el.innerHTML =
        '<span class="kjx-label">' + esc(t) + "</span>" +
        '<span class="kjx-hover" aria-hidden="true">' + esc(t) + " " + ARROW + "</span>" +
        '<span class="kjx-dot" aria-hidden="true"></span>';
    });
  }

  /* ── 2. Zoom parallax ─────────────────────────────────────────────── */
  var SCALES = [4, 5, 6, 5, 6, 8, 9];

  function initZoom() {
    var section = document.querySelector(".kj-zoom");
    if (!section || reduced) return;
    var items = section.querySelectorAll(".kj-zoom-item");
    var ticking = false;

    function update() {
      ticking = false;
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = rect.height - vh;
      if (total <= 0) return;
      var p = Math.min(1, Math.max(0, -rect.top / total));
      Array.prototype.forEach.call(items, function (item, i) {
        var target = SCALES[i % SCALES.length];
        item.style.transform = "scale(" + (1 + (target - 1) * p) + ")";
      });
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  function init() {
    decorateButtons();
    initZoom();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
