import os
import re

CSS_ADDITIONS = """
    /* ── Text Selection ── */
    ::selection {
      background: rgba(184, 139, 82, 0.25);
      color: var(--ink);
    }

    /* ── Custom Cursor ── */
    * { cursor: none; }

    #cursor-dot {
      position: fixed;
      top: 0; left: 0;
      width: 8px; height: 8px;
      background: var(--gold);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: transform 60ms linear, width 200ms ease, height 200ms ease, opacity 200ms ease;
      mix-blend-mode: multiply;
    }

    #cursor-ring {
      position: fixed;
      top: 0; left: 0;
      width: 36px; height: 36px;
      border: 1.5px solid rgba(184, 139, 82, 0.5);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
      transition: transform 180ms cubic-bezier(0.2, 0, 0.2, 1), width 200ms ease, height 200ms ease, opacity 200ms ease;
    }

    body:hover #cursor-dot { opacity: 1; }

    /* Grow ring on interactive elements */
    a:hover ~ #cursor-ring,
    button:hover ~ #cursor-ring {
      width: 52px; height: 52px;
      border-color: var(--gold);
    }

    /* ── Site Preloader ── */
    .site-preloader {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: #f8f4ee;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: opacity 800ms ease, visibility 800ms ease;
    }
    .preloader-logo {
      font-family: "Cormorant Garamond", serif;
      font-size: 2.8rem;
      font-weight: 500;
      color: var(--navy);
      letter-spacing: 0.1em;
      opacity: 0;
      animation: preloader-fade 1.2s ease forwards;
    }
    .preloader-progress {
      width: 0;
      height: 2px;
      background: var(--gold);
      margin-top: 1.5rem;
      animation: preloader-line 1.2s cubic-bezier(0.8, 0, 0.2, 1) forwards;
    }
    body.is-loaded .site-preloader {
      opacity: 0;
      visibility: hidden;
    }
    @keyframes preloader-fade {
      0%   { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes preloader-line {
      0%   { width: 0; }
      100% { width: 140px; }
    }

    /* ── Page-Enter Fade ── */
    @keyframes page-enter {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    body.is-loaded main {
      animation: page-enter 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    }
"""

HTML_ADDITIONS = """
  <!-- Preloader -->
  <div class="site-preloader" aria-hidden="true">
    <div class="preloader-logo">KJ</div>
    <div class="preloader-progress"></div>
  </div>

  <!-- Custom Cursor (desktop only) -->
  <div id="cursor-dot" aria-hidden="true"></div>
  <div id="cursor-ring" aria-hidden="true"></div>
"""

JS_ADDITIONS = """
    // ── Preloader ─────────────────────────────────────────────────
    window.addEventListener("load", () => {
      setTimeout(() => {
        document.body.classList.add("is-loaded");
      }, 1000); // Gives time for the KJ line animation to play
    });

    // ── Custom Cursor (desktop only) ──────────────────────────────
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");

    if (dot && ring && !("ontouchstart" in window)) {
      let ringX = 0, ringY = 0;
      let dotX = 0, dotY = 0;
      let raf;

      window.addEventListener("mousemove", (e) => {
        dotX = e.clientX;
        dotY = e.clientY;
        dot.style.left = dotX + "px";
        dot.style.top  = dotY + "px";
      }, { passive: true });

      function animateRing() {
        ringX += (dotX - ringX) * 0.12;
        ringY += (dotY - ringY) * 0.12;
        ring.style.left = ringX + "px";
        ring.style.top  = ringY + "px";
        raf = requestAnimationFrame(animateRing);
      }
      animateRing();

      // Scale ring on interactive hover
      document.querySelectorAll("a, button, [role='button']").forEach(el => {
        el.addEventListener("mouseenter", () => {
          ring.style.width  = "56px";
          ring.style.height = "56px";
          ring.style.borderColor = "var(--gold)";
          ring.style.background = "rgba(184,139,82,0.06)";
        });
        el.addEventListener("mouseleave", () => {
          ring.style.width  = "36px";
          ring.style.height = "36px";
          ring.style.borderColor = "rgba(184,139,82,0.5)";
          ring.style.background = "transparent";
        });
      });

      document.addEventListener("mouseleave", () => {
        dot.style.opacity = "0";
        ring.style.opacity = "0";
      });
      document.addEventListener("mouseenter", () => {
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      });
    } else {
      // Clean up cursor elements on touch devices
      if (dot) dot.remove();
      if (ring) ring.remove();
      document.documentElement.style.setProperty("cursor", "auto");
    }
"""

files = ['buyers-and-sellers.html', 'family-wealth-preservation.html', 'mls-search.html']

for f in files:
    with open(f, 'r') as file:
        content = file.read()

    # 1. Add CSS
    if '::selection' not in content:
        content = content.replace('    body {\n', CSS_ADDITIONS + '\n    body {\n')

    # 2. Update body class
    if '<body class="has-motion">' not in content:
        content = content.replace('<body>', '<body class="has-motion">')

    # 3. Add HTML
    if 'id="cursor-dot"' not in content:
        content = content.replace('<body class="has-motion">\n', '<body class="has-motion">\n' + HTML_ADDITIONS + '\n')

    # 4. Add JS
    if 'document.getElementById("cursor-dot")' not in content:
        content = content.replace('</body>', JS_ADDITIONS + '\n</body>')

    with open(f, 'w') as file:
        file.write(content)
        print(f"Updated {f}")
