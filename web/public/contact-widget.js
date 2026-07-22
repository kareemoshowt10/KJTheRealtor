/* ============================================================================
   contact-widget.js — floating "Chat with Kareem" launcher + quick-message
   popup, loaded site-wide (deferred). Click the avatar -> a small chat card
   asks for Name + Phone (required) and submits straight to Kareem's Formspree
   lead flow, tagged with attribution from track.js. Supersedes the old
   .float-call button (hidden) to avoid corner clutter. Efficient: one small
   vanilla file, panel built lazily on first open, lazy image, reduced-motion
   aware, non-blocking (does not trap focus or lock scroll).
   ========================================================================== */
(function () {
  "use strict";
  if (window.__kjContactWidget) return;
  window.__kjContactWidget = true;

  var PHOTO = "/assets/kareem-jamal-headshot-2026-thumb.jpg";
  var FORMSPREE = "https://formspree.io/f/xnjlgvlk";
  var TEL = "+18184027326";

  var css =
  ".float-call{display:none!important}" + /* consolidate: avatar replaces old call button */
  ".kjcw-launcher{position:fixed;bottom:1.5rem;right:1.5rem;z-index:99998;width:62px;height:62px;border-radius:50%;border:none;padding:0;cursor:pointer;background:#2a2520;box-shadow:0 10px 30px rgba(40,37,32,.32),0 0 0 3px rgba(184,139,82,.55);overflow:visible;transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s ease;-webkit-tap-highlight-color:transparent}" +
  ".kjcw-launcher:hover{transform:scale(1.06)}" +
  ".kjcw-launcher:focus-visible{outline:3px solid #b88b52;outline-offset:3px}" +
  ".kjcw-launcher img,.kjcw-ava{width:100%;height:100%;border-radius:50%;object-fit:cover;object-position:50% 18%;display:block}" +
  ".kjcw-ava{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#c79b63,#b88b52);color:#fff;font:700 1.1rem/1 'Manrope',system-ui,sans-serif;letter-spacing:.02em}" +
  ".kjcw-badge{position:absolute;top:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:#3fbf6a;border:2.5px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.05)}" +
  ".kjcw-tip{position:absolute;right:74px;top:50%;transform:translateY(-50%) translateX(6px);white-space:nowrap;background:#2a2520;color:#fff;font:600 .8rem/1 'Manrope',system-ui,sans-serif;padding:.55rem .8rem;border-radius:10px;opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;box-shadow:0 8px 22px rgba(40,37,32,.25)}" +
  ".kjcw-tip:after{content:'';position:absolute;right:-5px;top:50%;transform:translateY(-50%);border:5px solid transparent;border-left-color:#2a2520}" +
  ".kjcw-launcher:hover .kjcw-tip{opacity:1;transform:translateY(-50%) translateX(0)}" +
  "@media(hover:none){.kjcw-tip{display:none}}" +
  ".kjcw-panel{position:fixed;bottom:6.2rem;right:1.5rem;z-index:99999;width:340px;max-width:calc(100vw - 2rem);background:#fffdfa;border:1px solid #ead7bb;border-radius:20px;box-shadow:0 28px 70px rgba(40,37,32,.30);overflow:hidden;opacity:0;transform:translateY(12px) scale(.98);transform-origin:bottom right;transition:opacity .22s ease,transform .26s cubic-bezier(.22,1,.36,1);pointer-events:none;font-family:'Manrope',system-ui,sans-serif}" +
  ".kjcw-panel.kjcw-show{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}" +
  ".kjcw-head{display:flex;align-items:center;gap:.7rem;padding:1rem 1.1rem;background:linear-gradient(135deg,#2f3c48,#2a2520);color:#fff}" +
  ".kjcw-head .kjcw-ava,.kjcw-head img{width:42px;height:42px;flex:0 0 42px;border:2px solid rgba(184,139,82,.7)}" +
  ".kjcw-head .kjcw-ava{font-size:.9rem}" +
  ".kjcw-head strong{display:block;font-size:.96rem;line-height:1.2}" +
  ".kjcw-head span{display:block;font-size:.74rem;opacity:.8;margin-top:1px}" +
  ".kjcw-close{margin-left:auto;background:transparent;border:none;color:#fff;font-size:1.5rem;line-height:1;cursor:pointer;opacity:.8;padding:.1rem .3rem;border-radius:8px}" +
  ".kjcw-close:hover{opacity:1}" +
  ".kjcw-body{padding:1.1rem}" +
  ".kjcw-greet{font-size:.92rem;color:#4a443c;line-height:1.5;margin:0 0 .9rem}" +
  ".kjcw-form{display:flex;flex-direction:column;gap:.55rem}" +
  ".kjcw-form input,.kjcw-form textarea{width:100%;font:inherit;font-size:.92rem;color:#2a2520;background:#fff;border:1px solid #e3d8c6;border-radius:12px;padding:.7rem .85rem;outline:none;transition:border-color .18s ease,box-shadow .18s ease}" +
  ".kjcw-form input:focus,.kjcw-form textarea:focus{border-color:#b88b52;box-shadow:0 0 0 3px rgba(184,139,82,.16)}" +
  ".kjcw-form textarea{resize:vertical;min-height:42px}" +
  ".kjcw-send{margin-top:.25rem;width:100%;border:none;cursor:pointer;background:linear-gradient(135deg,#c79b63,#b88b52);color:#fff;font:700 .9rem/1 'Manrope',system-ui,sans-serif;letter-spacing:.02em;padding:.85rem 1rem;border-radius:999px;box-shadow:0 6px 18px rgba(184,139,82,.32);transition:transform .15s ease,box-shadow .25s ease}" +
  ".kjcw-send:hover{box-shadow:0 10px 26px rgba(184,139,82,.42)}" +
  ".kjcw-send:active{transform:translateY(1px)}" +
  ".kjcw-send[disabled]{opacity:.65;cursor:default}" +
  ".kjcw-alt{margin-top:.7rem;text-align:center;font-size:.8rem;color:#8a8073}" +
  ".kjcw-alt a{color:#9a7240;font-weight:700;text-decoration:none}" +
  ".kjcw-alt a:hover{text-decoration:underline}" +
  ".kjcw-status{margin:.6rem 0 0;font-size:.85rem;text-align:center;min-height:1px}" +
  ".kjcw-status[data-s=ok]{color:#2f8f54}.kjcw-status[data-s=err]{color:#c0492b}" +
  "@media(max-width:520px){.kjcw-launcher{bottom:5rem;right:1.1rem}.kjcw-panel{bottom:auto;top:auto;left:.6rem;right:.6rem;bottom:5rem;width:auto;max-width:none}}" +
  "@media(prefers-reduced-motion:reduce){.kjcw-launcher,.kjcw-panel,.kjcw-tip,.kjcw-send{transition:none}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  function avatarMarkup() {
    // image with graceful initials fallback if the photo isn't present yet
    return '<img src="' + PHOTO + '" alt="Kareem Jamal, Realtor" loading="lazy" ' +
      'onerror="this.onerror=null;var s=document.createElement(\'span\');s.className=\'kjcw-ava\';s.textContent=\'KJ\';this.replaceWith(s);">';
  }

  var launcher = document.createElement("button");
  launcher.className = "kjcw-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Chat with Kareem Jamal");
  launcher.setAttribute("aria-expanded", "false");
  launcher.innerHTML = avatarMarkup() +
    '<span class="kjcw-badge" aria-hidden="true"></span>' +
    '<span class="kjcw-tip">Chat with Kareem</span>';
  // Append to <html>, not <body>: pages animate body with a transform, which
  // would make body the containing block and break position:fixed. <html> has
  // no transform, so the widget stays viewport-fixed on every page.
  document.documentElement.appendChild(launcher);

  var panel = null, statusEl = null;

  function buildPanel() {
    if (panel) return;
    panel = document.createElement("div");
    panel.className = "kjcw-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Send Kareem a quick message");
    panel.innerHTML =
      '<div class="kjcw-head">' + avatarMarkup() +
        '<div><strong>Kareem Jamal</strong><span>Replies personally &middot; usually same day</span></div>' +
        '<button class="kjcw-close" type="button" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="kjcw-body">' +
        '<p class="kjcw-greet">Hi &#128075; Tell me what you’re after and the best number to reach you &mdash; I’ll text you back personally.</p>' +
        '<form class="kjcw-form" novalidate>' +
          '<input name="name" type="text" autocomplete="name" placeholder="Your name*" required>' +
          '<input name="phone" type="tel" autocomplete="tel" placeholder="Phone number*" required>' +
          '<textarea name="message" placeholder="Buying, selling, or just exploring? (optional)" rows="2"></textarea>' +
          '<input type="hidden" name="_subject" value="New chat-widget lead">' +
          '<input type="hidden" name="goal" value="Floating Chat Widget">' +
          '<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:0;height:0;opacity:0">' +
          '<button class="kjcw-send" type="submit">Send to Kareem</button>' +
        '</form>' +
        '<div class="kjcw-alt">or <a href="tel:' + TEL + '">call</a> &middot; <a href="sms:' + TEL + '">text</a> (818) 402-7326</div>' +
        '<p class="kjcw-status" aria-live="polite"></p>' +
      '</div>';
    document.documentElement.appendChild(panel);
    statusEl = panel.querySelector(".kjcw-status");

    panel.querySelector(".kjcw-close").addEventListener("click", close);
    panel.querySelector(".kjcw-form").addEventListener("submit", onSubmit);
  }

  function isOpen() { return panel && panel.classList.contains("kjcw-show"); }
  function open() {
    buildPanel();
    panel.classList.add("kjcw-show");
    launcher.setAttribute("aria-expanded", "true");
    setTimeout(function () { var n = panel.querySelector('input[name=name]'); if (n) n.focus(); }, 60);
    if (window.kjTrack) window.kjTrack("widget_open", { page: location.pathname });
  }
  function close() {
    if (panel) panel.classList.remove("kjcw-show");
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  launcher.addEventListener("click", function () { isOpen() ? close() : open(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) close();
  });

  function onSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var name = (form.name.value || "").trim();
    var phone = (form.phone.value || "").trim();
    var digits = phone.replace(/\D/g, "");
    if (!name) { return fail("Please add your name."); }
    if (digits.length < 10) { return fail("Please add a valid phone number."); }

    var btn = form.querySelector(".kjcw-send");
    btn.disabled = true; btn.textContent = "Sending…";
    setStatus("", "");

    var data = new FormData(form);
    data.append("page", location.pathname);
    // attribution from track.js so Kareem sees where this lead came from
    try {
      var a = (window.kjAttribution && window.kjAttribution.last) || {};
      if (a.lead_source) data.append("lead_source", a.lead_source);
      if (window.kjAttribution && window.kjAttribution.first) data.append("first_touch_source", window.kjAttribution.first.lead_source);
      ["utm_source", "utm_medium", "utm_campaign", "gclid", "referrer"].forEach(function (k) { if (a[k]) data.append(k, a[k]); });
    } catch (err) {}

    fetch(FORMSPREE, { method: "POST", headers: { "Accept": "application/json" }, body: data })
      .then(function (r) {
        if (!r.ok) throw new Error("bad");
        form.reset();
        form.style.display = "none";
        panel.querySelector(".kjcw-greet").style.display = "none";
        setStatus("Got it, " + name.split(" ")[0] + "! Kareem will reach out shortly. ✓", "ok");
        if (window.kjTrack) window.kjTrack("generate_lead", { form_id: "chat-widget", lead_source: (window.kjAttribution && window.kjAttribution.last && window.kjAttribution.last.lead_source) || "", goal: "Floating Chat Widget" });
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = "Send to Kareem";
        setStatus("Couldn’t send — please call or text (818) 402-7326.", "err");
      });
  }

  function setStatus(msg, s) { if (statusEl) { statusEl.textContent = msg; if (s) statusEl.setAttribute("data-s", s); else statusEl.removeAttribute("data-s"); } }
  function fail(msg) { setStatus(msg, "err"); }
})();
