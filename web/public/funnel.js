/* ============================================================================
   funnel.js — client half of the Ch.21 event pipeline.

   Loads on every page (Next routes and all 36 static guide pages). Its job is
   to answer one question you currently cannot answer: which pages actually
   produce appointments, versus which ones merely get traffic.

   Design, straight out of the chapter:
     - BATCH. One network write per batch, not per event. A guide page fires
       15+ events in a session; sending 15 requests would cost more than the
       data is worth.
     - BUFFER LOCALLY, FLUSH ON EXIT. The events that matter most (scroll
       depth, time on page, form abandonment) are only known when the visitor
       leaves, which is exactly when a normal fetch gets killed. sendBeacon is
       the only thing browsers guarantee will survive pagehide.
     - CLIENT TIMESTAMPS. Events are stamped when they happen, not when they
       are sent, or an entire session collapses onto the moment the tab closed.
     - NEVER BREAK THE PAGE. Every path is wrapped; analytics failing is
       always preferable to the site failing.

   Depends on track.js for attribution (window.kjAttribution) but degrades
   gracefully if it hasn't loaded.
   ========================================================================== */
(function () {
  "use strict";
  if (window.__kjFunnel) return;
  window.__kjFunnel = true;

  var ENDPOINT = "/api/events";
  var MAX_BATCH = 20;
  var FLUSH_MS = 10000;
  var LS_VISITOR = "kj_visitor_id";
  var SS_SESSION = "kj_session_id";

  var DEBUG = /[?&]kjdebug/.test(location.search);

  // --- identity -------------------------------------------------------------
  // Visitor id persists across sessions (localStorage) so you can see that the
  // person who booked had read three guides last week. Session id resets per
  // tab session. Both are random and carry nothing personal.
  function mintId(prefix) {
    var t = Date.now().toString(36);
    var r = "";
    var chars = "0123456789abcdefghijklmnopqrstuvwxyz";
    try {
      var buf = new Uint8Array(8);
      crypto.getRandomValues(buf);
      for (var i = 0; i < 8; i++) r += chars[buf[i] % 36];
    } catch (e) {
      r = Math.random().toString(36).slice(2, 10);
    }
    return prefix + "_" + t + "_" + r;
  }

  function stored(store, key, prefix) {
    try {
      var v = store.getItem(key);
      if (!v) {
        v = mintId(prefix);
        store.setItem(key, v);
      }
      return v;
    } catch (e) {
      return mintId(prefix);
    }
  }

  var visitorId = stored(localStorage, LS_VISITOR, "v");
  var sessionId = stored(sessionStorage, SS_SESSION, "s");

  function leadSource() {
    try {
      return (window.kjAttribution && window.kjAttribution.last.lead_source) || "";
    } catch (e) {
      return "";
    }
  }

  // --- buffer ---------------------------------------------------------------
  var queue = [];
  var timer = null;

  function payload() {
    return JSON.stringify({
      visitor_id: visitorId,
      session_id: sessionId,
      lead_source: leadSource(),
      events: queue.splice(0, queue.length),
    });
  }

  function flush(useBeacon) {
    if (queue.length === 0) return;
    var body = payload();

    if (DEBUG) console.log("[kjFunnel] flush", body);

    // sendBeacon is the only transport the browser promises to complete after
    // the page is gone. Fall back to keepalive fetch, then to a plain fetch.
    try {
      if (useBeacon && navigator.sendBeacon) {
        var blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }
    } catch (e) {}

    try {
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  function schedule() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      flush(false);
    }, FLUSH_MS);
  }

  function track(event, props) {
    if (!event) return;
    queue.push({
      event: String(event),
      ts: Date.now(),
      page_path: location.pathname,
      props: props || {},
    });
    if (DEBUG) console.log("[kjFunnel]", event, props || {});
    if (queue.length >= MAX_BATCH) flush(false);
    else schedule();
  }

  window.kjFunnel = { track: track, visitorId: visitorId, sessionId: sessionId };

  // Adopt anything track.js already fires, so the two systems don't drift.
  var priorTrack = window.kjTrack;
  window.kjTrack = function (event, data) {
    try {
      if (typeof priorTrack === "function") priorTrack(event, data);
    } catch (e) {}
    track(event, data);
  };

  // --- automatic instrumentation -------------------------------------------
  var start = Date.now();
  var maxScroll = 0;
  var scrollMarks = { 25: false, 50: false, 75: false, 100: false };

  track("page_view", {
    title: document.title.slice(0, 120),
    referrer: document.referrer ? document.referrer.slice(0, 200) : "",
  });

  // Scroll depth is the honest proxy for "did this guide actually get read".
  // Throttled with rAF so it costs nothing on a long page.
  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        if (h <= 0) return;
        var pct = Math.round((window.scrollY / h) * 100);
        if (pct > maxScroll) maxScroll = pct;
        [25, 50, 75, 100].forEach(function (m) {
          if (!scrollMarks[m] && pct >= m) {
            scrollMarks[m] = true;
            track("scroll_depth", { depth: m });
          }
        });
      });
    },
    { passive: true }
  );

  // form_start fires on first interaction with any lead form. The gap between
  // form_start and generate_lead is your abandonment rate — the single most
  // actionable number in the whole funnel.
  var startedForms = {};
  document.addEventListener(
    "focusin",
    function (e) {
      var form = e.target && e.target.closest ? e.target.closest("form") : null;
      if (!form) return;
      var id = form.id || form.getAttribute("action") || "form";
      if (startedForms[id]) return;
      startedForms[id] = true;
      track("form_start", { form_id: id });
    },
    true
  );

  document.addEventListener(
    "click",
    function (e) {
      var el = e.target && e.target.closest ? e.target.closest("a,button") : null;
      if (!el) return;
      var href = (el.getAttribute && el.getAttribute("href")) || "";
      if (/^tel:/.test(href)) track("contact_click", { method: "call" });
      else if (/^sms:/.test(href)) track("contact_click", { method: "text" });
      else if (/^mailto:/.test(href)) track("contact_click", { method: "email" });
      else if (el.hasAttribute && el.hasAttribute("data-kj-cta"))
        track("cta_click", {
          label: el.getAttribute("data-kj-cta"),
          text: (el.textContent || "").trim().slice(0, 60),
        });
    },
    true
  );

  function leaving() {
    track("page_exit", {
      seconds: Math.round((Date.now() - start) / 1000),
      max_scroll: maxScroll,
    });
    flush(true);
  }

  // pagehide, not unload: unload is unreliable and disables bfcache.
  window.addEventListener("pagehide", leaving);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush(true);
  });
})();
