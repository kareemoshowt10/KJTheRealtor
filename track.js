/* ============================================================================
   track.js — lead attribution + analytics for kareemjamaltherealtor.com
   Loaded site-wide (deferred). Two jobs:
   1) ATTRIBUTION: capture utm/referrer/source on landing, persist first-touch
      (localStorage) + last-touch (session), and auto-inject hidden fields into
      every Formspree lead form so Kareem sees WHERE each lead came from.
   2) EVENTS: push GA4/GTM-ready events (generate_lead, presentation_start,
      cta_click, contact_click) to window.dataLayer (+ gtag if present). Works
      immediately once a GA4/GTM container id is added; harmless until then.
   Debug: append ?kjdebug to any URL to log events to the console.
   ========================================================================== */
(function () {
  "use strict";
  var LS_FIRST = "kj_first_touch";
  var SS_LAST = "kj_last_touch";

  function params() { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(""); } }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } }
  function readJSON(s, k) { try { return JSON.parse(s.getItem(k) || "null"); } catch (e) { return null; } }
  function writeJSON(s, k, v) { try { s.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function deriveSource() {
    var p = params(), g = function (k) { return (p.get(k) || "").slice(0, 120); };
    var utm_source = g("utm_source"), utm_medium = g("utm_medium");
    var gclid = g("gclid"), fbclid = g("fbclid");
    var ref = document.referrer || "", rh = host(ref), self = location.hostname.replace(/^www\./, "");
    var lead_source;
    if (utm_source) lead_source = utm_source + (utm_medium ? " / " + utm_medium : "");
    else if (gclid) lead_source = "google / cpc";
    else if (fbclid) lead_source = "facebook / paid";
    else if (rh && rh !== self) {
      if (/google\./.test(rh)) lead_source = "google / organic";
      else if (/bing\.|duckduckgo|yahoo/.test(rh)) lead_source = rh + " / organic";
      else if (/instagram|facebook|fb\.|linkedin|t\.co|twitter|x\.com|youtube|tiktok|reddit/.test(rh)) lead_source = rh + " / social";
      else if (/chatgpt|openai|perplexity|gemini|bard|claude|copilot/.test(rh)) lead_source = rh + " / ai";
      else lead_source = rh + " / referral";
    } else lead_source = "direct";
    return {
      lead_source: lead_source, utm_source: utm_source, utm_medium: utm_medium,
      utm_campaign: g("utm_campaign"), utm_term: g("utm_term"), utm_content: g("utm_content"),
      gclid: gclid, fbclid: fbclid, referrer: rh || (ref ? ref.slice(0, 120) : ""),
      landing_page: location.pathname
    };
  }

  var current = deriveSource();
  var first = readJSON(localStorage, LS_FIRST);
  if (!first || !first.lead_source) { first = current; writeJSON(localStorage, LS_FIRST, first); }
  var last = current.lead_source === "direct" ? (readJSON(sessionStorage, SS_LAST) || current) : current;
  writeJSON(sessionStorage, SS_LAST, last);
  window.kjAttribution = { first: first, last: last, current: current };

  window.dataLayer = window.dataLayer || [];
  window.kjTrack = function (event, data) {
    var payload = Object.assign({ event: event, page_path: location.pathname }, data || {});
    window.dataLayer.push(payload);
    if (typeof window.gtag === "function") { try { window.gtag("event", event, payload); } catch (e) {} }
    if (/[?&]kjdebug/.test(location.search)) console.log("[kjTrack]", event, payload);
  };

  function isLeadForm(f) {
    var a = f.getAttribute("action") || "";
    return /formspree\.io/.test(a) || f.id === "mls-concierge-form";
  }
  function injectHidden(f) {
    if (f.dataset.kjTracked) return;
    var fields = {
      lead_source: last.lead_source, first_touch_source: first.lead_source,
      utm_source: last.utm_source, utm_medium: last.utm_medium, utm_campaign: last.utm_campaign,
      utm_term: last.utm_term, utm_content: last.utm_content, gclid: last.gclid, fbclid: last.fbclid,
      referrer: last.referrer, landing_page: first.landing_page, submitted_from: location.pathname
    };
    Object.keys(fields).forEach(function (k) {
      if (!fields[k] || f.querySelector('[name="' + k + '"]')) return;
      var i = document.createElement("input");
      i.type = "hidden"; i.name = k; i.value = fields[k];
      f.appendChild(i);
    });
    f.dataset.kjTracked = "1";
  }

  function wire() {
    document.querySelectorAll("form").forEach(function (f) { if (isLeadForm(f)) injectHidden(f); });

    document.addEventListener("submit", function (e) {
      var f = e.target;
      if (f && f.tagName === "FORM" && isLeadForm(f)) {
        injectHidden(f);
        var goalEl = f.querySelector('[name="goal"],[name="intent"],[name="investorProfile"],[name="_subject"]');
        window.kjTrack("generate_lead", { form_id: f.id || "form", lead_source: last.lead_source, goal: goalEl ? goalEl.value : "" });
      }
    }, true);

    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a, button") : null;
      if (!a) return;
      var href = (a.getAttribute && a.getAttribute("href")) || "";
      if (/\/(seller|buyer)-presentation/.test(href)) window.kjTrack("presentation_start", { type: /seller/.test(href) ? "seller" : "buyer", from: location.pathname });
      else if (/^tel:/.test(href)) window.kjTrack("contact_click", { method: "call" });
      else if (/^mailto:/.test(href)) window.kjTrack("contact_click", { method: "email" });
      else if (/^sms:/.test(href)) window.kjTrack("contact_click", { method: "text" });
      else if (a.classList && a.classList.contains("btn-primary")) window.kjTrack("cta_click", { text: (a.textContent || "").trim().slice(0, 40) });
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
