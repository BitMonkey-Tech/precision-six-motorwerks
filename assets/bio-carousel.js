// Bio photo carousels on the About page. Each [data-carousel] holds a stack of
// photos in .bc-slides; one shows at a time and the next cross fades in over
// it (styled in /assets/about.css). Because fading needs no row to scroll,
// the last photo simply fades back to the first, so it loops with no rewind.
(function(){
  // Auto rotation: move to the next photo every AUTOPLAY_MS milliseconds.
  var AUTOPLAY_MS = 4500;
  // A finger has to travel this many pixels sideways to count as a swipe.
  var SWIPE_PX = 40;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-carousel]').forEach(setup);

  function setup(root){
    var slides = root.querySelectorAll('.bc-slides img');
    var prev = root.querySelector('.bc-prev');
    var next = root.querySelector('.bc-next');
    var dotsWrap = root.querySelector('.bc-dots');
    var current = 0;

    // A single photo needs no controls: show it and stop.
    if (slides.length < 2) {
      if (slides[0]) slides[0].classList.add('is-active');
      prev.hidden = next.hidden = true;
      return;
    }

    // One small button per photo, so visitors can see how many there are
    // and jump straight to one. aria-current marks the one showing.
    var dots = Array.prototype.map.call(slides, function(_, i){
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show photo ' + (i + 1) + ' of ' + slides.length);
      b.addEventListener('click', function(){ go(i); startAutoplay(); });
      dotsWrap.appendChild(b);
      return b;
    });

    // Show photo i. The % wraps the index around, so going forward from the
    // last photo lands on the first and back from the first lands on the last.
    function go(i){
      slides[current].classList.remove('is-active');
      dots[current].removeAttribute('aria-current');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current].setAttribute('aria-current', 'true');
    }
    go(0);

    prev.addEventListener('click', function(){ go(current - 1); startAutoplay(); });
    next.addEventListener('click', function(){ go(current + 1); startAutoplay(); });

    // Swipe on touch screens: compare where the finger went down and came up.
    var startX = null;
    root.addEventListener('touchstart', function(e){ startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function(e){
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > SWIPE_PX) { go(current + (dx < 0 ? 1 : -1)); startAutoplay(); }
    }, { passive: true });

    // Auto rotation timer, set up the same way as the shop carousel on the
    // other pages: skipped for reduced motion, held while the mouse or
    // keyboard focus is on the carousel, and idle while the tab is hidden.
    var timer = null;
    var held = false;
    function startAutoplay(){
      clearInterval(timer);
      if (reduceMotion) return;
      timer = setInterval(function(){
        if (!held && !document.hidden) go(current + 1);
      }, AUTOPLAY_MS);
    }
    root.addEventListener('mouseenter', function(){ held = true; });
    root.addEventListener('mouseleave', function(){ held = false; startAutoplay(); });
    root.addEventListener('focusin', function(){ held = true; });
    root.addEventListener('focusout', function(){ held = false; startAutoplay(); });
    startAutoplay();
  }
})();
