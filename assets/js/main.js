/* =========================================================================
   Code Cities — landing page interactions
   Intentionally tiny. No frameworks, no trackers, no external requests.
   Two responsibilities:
     1. Reveal sections on scroll (purely cosmetic, falls back gracefully).
     2. Show a sticky mobile CTA once the user has scrolled past the hero.
   ========================================================================= */

(function () {
  "use strict";

  // ---- 1. Reveal-on-scroll ------------------------------------------------
  // Uses IntersectionObserver where available; on older browsers we simply
  // show everything (no broken layout, no JS error).
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // ---- 2. Sticky mobile CTA after the hero --------------------------------
  var stickyCta = document.querySelector(".sticky-cta");
  var hero = document.querySelector(".hero");
  if (stickyCta && hero) {
    var heroObserver = new IntersectionObserver(
      function (entries) {
        // When the hero is OUT of view, show the sticky CTA.
        stickyCta.classList.toggle("sticky-cta--visible", !entries[0].isIntersecting);
      },
      { threshold: 0 }
    );
    heroObserver.observe(hero);
  }
})();
