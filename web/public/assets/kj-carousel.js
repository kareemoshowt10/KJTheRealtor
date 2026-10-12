/* kj-carousel.js — shared, dependency-free carousel for the static pages.
 * Mark any card container with data-kj-carousel (optional value = accessible
 * label) and data-kjc-per="1|2|3|4" (cards per view on desktop).
 * Native scroll-snap = touch swipe; arrows + dots appear only when the cards
 * overflow; arrow keys / Home / End on the focused track; reduced-motion =
 * instant jumps; no autoplay; every card stays in the DOM.
 */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var n = 0;
  function label(el) {
    var l = el.getAttribute('data-kj-carousel');
    if (l) return l;
    var sec = el.closest('section');
    var h = sec && sec.querySelector('h2, h3');
    return h ? h.textContent.replace(/\s+/g, ' ').trim() : 'Cards';
  }
  function svg(d) {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  }
  function init(track) {
    if (track.__kjc) return; track.__kjc = true;
    var name = label(track);
    var id = track.id || ('kjc-' + (++n));
    track.id = id;
    var wrap = document.createElement('div');
    wrap.className = 'kjc';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-roledescription', 'carousel');
    wrap.setAttribute('aria-label', name);
    track.parentNode.insertBefore(wrap, track);
    wrap.appendChild(track);
    track.classList.add('kjc-track');
    track.setAttribute('role', 'group');
    track.setAttribute('tabindex', '0');
    track.setAttribute('aria-label', name + ' — use left and right arrow keys to move between cards');
    var slides = Array.prototype.slice.call(track.children);
    slides.forEach(function (s, i) {
      if (!s.getAttribute('role')) s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      var h = s.querySelector('h3, h4, strong');
      s.setAttribute('aria-label', (i + 1) + ' of ' + slides.length + (h ? ': ' + h.textContent.replace(/\s+/g, ' ').trim() : ''));
    });
    var controls = document.createElement('div');
    controls.className = 'kjc-controls';
    controls.hidden = true;
    var dots = document.createElement('div');
    dots.className = 'kjc-dots';
    var dotEls = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'kjc-dot';
      b.setAttribute('aria-label', 'Go to card ' + (i + 1));
      b.setAttribute('aria-controls', id);
      b.innerHTML = '<span></span>';
      b.addEventListener('click', function () { go(i); });
      dots.appendChild(b); return b;
    });
    var arrows = document.createElement('div');
    arrows.className = 'kjc-arrows';
    var prev = document.createElement('button');
    prev.type = 'button'; prev.className = 'kjc-arrow'; prev.setAttribute('aria-label', 'Previous card'); prev.setAttribute('aria-controls', id);
    prev.innerHTML = svg('M15 18l-6-6 6-6');
    var next = document.createElement('button');
    next.type = 'button'; next.className = 'kjc-arrow'; next.setAttribute('aria-label', 'Next card'); next.setAttribute('aria-controls', id);
    next.innerHTML = svg('M9 18l6-6-6-6');
    arrows.appendChild(prev); arrows.appendChild(next);
    controls.appendChild(dots); controls.appendChild(arrows);
    wrap.appendChild(controls);
    var index = 0;
    function pad() { return parseFloat(getComputedStyle(track).paddingLeft) || 0; }
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      controls.hidden = !(max > 4);
      var left = track.scrollLeft, best = 0, bd = Infinity, base = track.offsetLeft + pad();
      slides.forEach(function (s, i) { var d = Math.abs(s.offsetLeft - base - left); if (d < bd) { bd = d; best = i; } });
      if (max > 4 && left >= max - 4) best = slides.length - 1;
      index = best;
      prev.disabled = left <= 4;
      next.disabled = left >= max - 4;
      dotEls.forEach(function (d, i) { d.setAttribute('aria-current', i === best ? 'true' : 'false'); });
    }
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft - pad(), behavior: reduce && reduce.matches ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function () { go(index - 1); });
    next.addEventListener('click', function () { go(index + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.target !== track) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      else if (e.key === 'Home') { e.preventDefault(); go(0); }
      else if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); }
    });
    track.addEventListener('scroll', update, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(update).observe(track); else window.addEventListener('resize', update);
    update();
  }
  function run() { document.querySelectorAll('[data-kj-carousel]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
