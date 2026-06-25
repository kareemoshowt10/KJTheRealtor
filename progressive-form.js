/* ============================================================================
   progressive-form.js — 2-step progressive lead forms, site-wide
   Converts the standard .lead-form into a frictionless 2-step flow:
     Step 1: Intent selection (interest/goal chips) — low commitment
     Step 2: Contact fields appear after intent is chosen — they're invested
   Also: makes message optional, adds phone field, adds a progress indicator.
   Loaded deferred; enhances existing forms without breaking non-JS fallback.
   ========================================================================== */
(function () {
  "use strict";
  if (window.__kjProgressiveForm) return;
  window.__kjProgressiveForm = true;

  var CSS = [
    ".pf-steps{display:flex;gap:.5rem;align-items:center;margin-bottom:1.4rem}",
    ".pf-dot{width:10px;height:10px;border-radius:50%;background:#e3d8c6;transition:background .2s ease,transform .2s ease}",
    ".pf-dot.is-active{background:#b88b52;transform:scale(1.15)}",
    ".pf-dot.is-done{background:#3fbf6a}",
    ".pf-bar{flex:1;height:2px;background:#e3d8c6;border-radius:2px;position:relative;overflow:hidden}",
    ".pf-bar-fill{position:absolute;top:0;left:0;height:100%;background:linear-gradient(90deg,#b88b52,#c79b63);width:0%;transition:width .35s cubic-bezier(.22,1,.36,1);border-radius:2px}",
    ".pf-step{transition:opacity .22s ease,max-height .3s ease;overflow:hidden}",
    ".pf-step.is-hidden{opacity:0;max-height:0;pointer-events:none;margin:0;padding:0}",
    ".pf-step.is-visible{opacity:1;max-height:600px}",
    ".pf-next{margin-top:.6rem;width:100%;border:none;cursor:pointer;background:linear-gradient(135deg,#c79b63,#b88b52);color:#fff;font:700 .88rem/1 'Manrope',system-ui,sans-serif;letter-spacing:.02em;padding:.85rem 1rem;border-radius:999px;box-shadow:0 6px 18px rgba(184,139,82,.28);transition:transform .15s ease,box-shadow .2s ease}",
    ".pf-next:hover{box-shadow:0 10px 26px rgba(184,139,82,.4)}",
    ".pf-next:active{transform:translateY(1px)}",
    "@media(prefers-reduced-motion:reduce){.pf-step,.pf-dot,.pf-bar-fill,.pf-next{transition:none}}"
  ].join("\n");
  var style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  function enhance(form) {
    var chipRow = form.querySelector(".interest-row, .chip-row");
    if (!chipRow) return;
    var formGrid = form.querySelector(".form-grid, .field-grid");
    if (!formGrid) return;

    var chipGroup = chipRow.closest(".form-group, .field");
    var nameGroup = form.querySelector('[name="name"]').closest(".form-group, .field");
    var emailGroup = form.querySelector('[name="email"]').closest(".form-group, .field");
    var msgGroup = (form.querySelector('[name="message"]') || {}).closest
      ? form.querySelector('[name="message"]').closest(".form-group, .field")
      : null;
    var submitWrap = form.querySelector(".btn-primary").parentElement;
    if (!chipGroup || !nameGroup || !emailGroup) return;

    // Make message optional
    var msgField = form.querySelector('[name="message"]');
    if (msgField) {
      msgField.removeAttribute("required");
      msgField.setAttribute("placeholder", "Any details? (optional)");
      msgField.setAttribute("rows", "2");
    }

    // Add phone field after email if not present
    var phoneName = form.querySelector('[name="phone"]');
    if (!phoneName) {
      var phoneGroup = document.createElement("div");
      phoneGroup.className = emailGroup.className;
      phoneGroup.innerHTML =
        '<label for="pf-phone-' + form.id + '">Phone <span style="font-weight:400;color:#9a8c79;">(fastest way to reach you)</span></label>' +
        '<input id="pf-phone-' + form.id + '" name="phone" type="tel" autocomplete="tel" placeholder="(818) 000-0000" inputmode="numeric" />';
      emailGroup.after(phoneGroup);
    }

    // Build progress indicator
    var progress = document.createElement("div");
    progress.className = "pf-steps";
    progress.innerHTML =
      '<span class="pf-dot is-active" data-step="1"></span>' +
      '<span class="pf-bar"><span class="pf-bar-fill"></span></span>' +
      '<span class="pf-dot" data-step="2"></span>';
    formGrid.insertBefore(progress, formGrid.firstChild);
    var barFill = progress.querySelector(".pf-bar-fill");
    var dot1 = progress.querySelector('[data-step="1"]');
    var dot2 = progress.querySelector('[data-step="2"]');

    // Wrap step 1 (chips) + "Continue" button
    var step1 = document.createElement("div");
    step1.className = "pf-step is-visible";
    chipGroup.parentElement.insertBefore(step1, chipGroup);
    step1.appendChild(chipGroup);
    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "pf-next";
    nextBtn.textContent = "Continue →";
    step1.appendChild(nextBtn);

    // Wrap step 2 (contact fields + submit) — initially hidden
    var step2 = document.createElement("div");
    step2.className = "pf-step is-hidden";
    var contactFields = [nameGroup, emailGroup];
    var phoneEl = form.querySelector('[name="phone"]');
    if (phoneEl) {
      var pg = phoneEl.closest(".form-group, .field");
      if (pg) contactFields.push(pg);
    }
    if (msgGroup) contactFields.push(msgGroup);
    var refNode = contactFields[0];
    refNode.parentElement.insertBefore(step2, refNode);
    contactFields.forEach(function (f) { step2.appendChild(f); });
    step2.appendChild(submitWrap);

    // Advance to step 2
    function goStep2() {
      step1.classList.remove("is-visible");
      step1.classList.add("is-hidden");
      step2.classList.remove("is-hidden");
      step2.classList.add("is-visible");
      barFill.style.width = "100%";
      dot1.classList.remove("is-active");
      dot1.classList.add("is-done");
      dot2.classList.add("is-active");
      setTimeout(function () {
        var nameInput = form.querySelector('[name="name"]');
        if (nameInput) nameInput.focus();
      }, 80);
    }

    nextBtn.addEventListener("click", goStep2);
    // Also advance when a chip is clicked (they've committed intent)
    chipRow.addEventListener("click", function (e) {
      if (e.target.closest("button[data-value]")) {
        setTimeout(goStep2, 180);
      }
    });
  }

  function init() {
    document.querySelectorAll(".lead-form").forEach(enhance);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
