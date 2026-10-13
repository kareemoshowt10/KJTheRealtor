/* kj-nav-fix.js — one reliable mobile-menu toggle for the static pages.
 * Several pages bound two click handlers to #nav-toggle (so a tap opened
 * and immediately closed the menu) or relied on a script path that didn't
 * load. This captures the tap first, stops the duplicate handlers, and sets
 * every open-state hook the page CSS uses (.open, .is-active, body.nav-open).
 */
(function () {
  'use strict';
  function parts() {
    var toggle = document.getElementById('nav-toggle') || document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav') || document.querySelector('.site-header .nav-links, .nav-links');
    return { toggle: toggle, nav: nav };
  }
  function setOpen(open) {
    var p = parts();
    if (!p.toggle || !p.nav) return;
    p.nav.classList.toggle('open', open);
    p.nav.classList.toggle('is-active', open);
    document.body.classList.toggle('nav-open', open);
    p.toggle.setAttribute('aria-expanded', String(open));
  }
  function isOpen() {
    var p = parts();
    return !!p.toggle && p.toggle.getAttribute('aria-expanded') === 'true';
  }
  window.addEventListener('click', function (e) {
    var p = parts();
    if (!p.toggle || !p.nav) return;
    var t = e.target;
    if (p.toggle.contains(t)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      setOpen(!isOpen());
      return;
    }
    if (!isOpen()) return;
    if (p.nav.contains(t) && t.closest('a')) { setOpen(false); return; }
    if (!p.nav.contains(t)) setOpen(false);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); var p = parts(); if (p.toggle) p.toggle.focus(); }
  });
  // Pages with a full-screen preloader: never let it block taps for long.
  document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.site-preloader')) {
      setTimeout(function () { document.body.classList.add('is-loaded'); }, 1500);
    }
  });
})();
