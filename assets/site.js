(function(){
  function closeMenu(){
    var panel = document.querySelector('[data-mobile-nav]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var openIcon = document.querySelector('[data-icon-open]');
    var closeIcon = document.querySelector('[data-icon-close]');
    if (!panel) return;
    panel.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (openIcon) openIcon.style.display = 'block';
    if (closeIcon) closeIcon.style.display = 'none';
  }

  document.addEventListener('click', function(e){
    var toggleBtn = e.target.closest && e.target.closest('[data-menu-toggle]');
    if (toggleBtn) {
      var panel = document.querySelector('[data-mobile-nav]');
      var openIcon = document.querySelector('[data-icon-open]');
      var closeIcon = document.querySelector('[data-icon-close]');
      if (panel) {
        var willOpen = !panel.classList.contains('is-open');
        panel.classList.toggle('is-open', willOpen);
        toggleBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        if (openIcon) openIcon.style.display = willOpen ? 'none' : 'block';
        if (closeIcon) closeIcon.style.display = willOpen ? 'block' : 'none';
      }
      return;
    }

    var navLink = e.target.closest && e.target.closest('[data-hash-nav]');
    if (navLink) {
      var href = navLink.getAttribute('href');
      document.querySelectorAll('[data-hash-nav]').forEach(function(l){
        l.classList.toggle('is-active', l.getAttribute('href') === href);
      });
    }

    var panelForClose = document.querySelector('[data-mobile-nav]');
    if (panelForClose && panelForClose.classList.contains('is-open') && e.target.closest('a')) {
      closeMenu();
    }
  });
})();

// Reveal-on-scroll: fades/slides in any [data-reveal] element as it enters the
// viewport. Skips the animation entirely for prefers-reduced-motion, and for
// browsers without IntersectionObserver, by just showing everything at once.
(function(){
  var els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach(function(el){ el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(function(el){ observer.observe(el); });
})();
