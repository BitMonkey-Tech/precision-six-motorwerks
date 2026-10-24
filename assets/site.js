(function(){
  // Highlights the in-page nav link (e.g. "#about") that matches href.
  function setActiveHash(href){
    document.querySelectorAll('[data-hash-nav]').forEach(function(l){
      l.classList.toggle('is-active', l.getAttribute('href') === href);
    });
  }

  // Arriving from another page via "/#about" never fires a click here, so
  // sync the highlight with the URL on load, and on back/forward navigation.
  function syncFromUrl(){
    if (location.hash && document.querySelector('[data-hash-nav][href="' + location.hash + '"]')) {
      setActiveHash(location.hash);
    }
  }
  syncFromUrl();
  window.addEventListener('hashchange', syncFromUrl);

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
    if (navLink) setActiveHash(navLink.getAttribute('href'));

    var panelForClose = document.querySelector('[data-mobile-nav]');
    if (panelForClose && panelForClose.classList.contains('is-open') && e.target.closest('a')) {
      closeMenu();
    }
  });
})();

// Reveal-on-scroll: fades/slides in any [data-reveal] (or [data-reveal-card]) element as it enters the
// viewport. Skips the animation entirely for prefers-reduced-motion, and for
// browsers without IntersectionObserver, by just showing everything at once.
(function(){
  // [data-reveal-card] is the service cards, styled in /assets/service-cards.css.
  // [data-reveal-bio] is the About page bios, styled in /assets/about.css.
  var els = document.querySelectorAll('[data-reveal], [data-reveal-card], [data-reveal-bio]');
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

// Logo style P: wraps each visible uppercase P in Oswald text in
// <span class="logo-p"> so /assets/slant.css can draw the logo's P shape over
// it. "Visible" includes a lowercase p inside text that CSS turns uppercase
// (text-transform:uppercase), since that still shows on screen as a P.
// Runs from here rather than being written into the HTML so new copy picks
// it up automatically.
(function(){
  var skip = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, OPTION: 1, TITLE: 1, NOSCRIPT: 1 };
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  var targets = [];
  while (walker.nextNode()) {
    var node = walker.currentNode, parent = node.parentElement;
    if (!parent || skip[parent.tagName] || parent.closest('svg, .logo-p')) continue;
    if (!/p/i.test(node.data)) continue;
    var style = getComputedStyle(parent);
    if (style.fontFamily.indexOf('Oswald') !== 0) continue;
    var pattern = style.textTransform === 'uppercase' ? /([pP])/ : /(P)/;
    if (pattern.test(node.data)) targets.push([node, pattern]);
  }
  // Swapped in a second pass because changing the page while the walker is
  // still moving through it would make it skip or revisit text.
  targets.forEach(function(t){
    var frag = document.createDocumentFragment();
    t[0].data.split(t[1]).forEach(function(part, i){
      if (!part) return;
      if (i % 2) {
        var span = document.createElement('span');
        span.className = 'logo-p';
        span.textContent = part;
        frag.appendChild(span);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    });
    t[0].parentNode.replaceChild(frag, t[0]);
  });
})();
