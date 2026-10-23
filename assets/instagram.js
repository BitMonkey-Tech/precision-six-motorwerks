(function(){
  // Photo carousel on the home, services and contact pages. Each page has an
  // empty #instagram section; this script fills it with the shop photos
  // listed below. Once Instagram is set up, posts come from a Behold
  // (behold.so) JSON feed: someone with the Instagram login connects the
  // account on Behold, which keeps the Instagram access token private and
  // hands us a public feed ID. Put that ID in FEED_ID below and the posts
  // replace the shop photos on every page. If the feed fails, the shop
  // photos stay.
  var FEED_ID = '';

  // Shop photos shown until the Instagram feed is live. To add one, drop a
  // JPEG (about 900px on its long side) in /images/shop/ and add a line here.
  // alt describes the photo for screen readers.
  var SHOP_PHOTOS = [
    { src: '/images/shop/shop-1.jpg', alt: 'Overhead view of the shop with a white Macan and a black 911 Cabriolet in the lift bays' },
    { src: '/images/shop/shop-2.jpg', alt: 'Silver 911 GT3 beside the tire machine, with a 911 raised on a lift behind it' },
    { src: '/images/shop/shop-3.jpg', alt: 'Grey 911 Carrera parked under a blue two post lift' },
    { src: '/images/shop/shop-4.jpg', alt: 'Red Cayenne GTS in front of the Porsche crest on the shop wall' },
    { src: '/images/shop/shop-5.jpg', alt: 'Blue Macan raised on a lift, with a white Macan in the next bay' },
    { src: '/images/shop/shop-6.jpg', alt: 'Black Panamera under a lift, beneath a painting of a Porsche race car' },
    { src: '/images/shop/shop-7.jpg', alt: "Technician using a mechanic's stethoscope to listen to the engine of a black Panamera" },
    { src: '/images/shop/shop-8.jpg', alt: 'Black Panamera raised on a lift with its hood open while a technician drains the oil' }
  ];

  var root = document.getElementById('instagram');
  if (!root) return;

  var track = root.querySelector('.ig-track');
  var prev = root.querySelector('.ig-prev');
  var next = root.querySelector('.ig-next');
  var MAX_POSTS = 12;
  // Auto rotation: slide forward one card every AUTOPLAY_MS milliseconds.
  var AUTOPLAY_MS = 3000;

  // Pick a reasonably small image: Behold's resized "medium" (max 700px) if
  // present, else the raw image. For videos, mediaUrl is the video itself,
  // so fall back to its thumbnail instead.
  function imageFor(post){
    var s = post.sizes;
    if (s && s.medium && s.medium.mediaUrl) return s.medium.mediaUrl;
    if (post.mediaType === 'VIDEO') return post.thumbnailUrl;
    return post.mediaUrl;
  }

  // A shop photo card: just the image, no link.
  function buildPhotoCard(photo){
    var card = document.createElement('div');
    card.className = 'ig-card';
    var img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt;
    img.loading = 'lazy';
    card.appendChild(img);
    return card;
  }

  // An Instagram card: the image links to the post in a new tab.
  function buildCard(post){
    var src = imageFor(post);
    if (!src || !post.permalink) return null;
    var a = document.createElement('a');
    a.className = 'ig-card';
    a.href = post.permalink;
    a.target = '_blank';
    a.rel = 'noopener';
    var img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    // Alt text: the caption (trimmed) describes the photo for screen readers.
    var cap = (post.prunedCaption || post.caption || '').trim();
    img.alt = cap ? cap.slice(0, 140) : 'Instagram post from Precision Six Motorwerks';
    a.appendChild(img);
    if (post.mediaType === 'VIDEO') {
      var play = document.createElement('span');
      play.className = 'ig-play';
      play.setAttribute('aria-hidden', 'true');
      a.appendChild(play);
    }
    return a;
  }

  // Replace whatever is in the track with these cards.
  function fill(cards){
    track.innerHTML = '';
    cards.forEach(function(card){ track.appendChild(card); });
  }

  // The row loops forever (see slide below), so there is never an end to
  // hide an arrow at. Both arrows only hide (via :disabled in CSS) when every
  // card already fits and there is nothing to scroll.
  function updateArrows(){
    var nothingToScroll = track.scrollWidth - track.clientWidth <= 2;
    prev.disabled = nothingToScroll;
    next.disabled = nothingToScroll;
  }

  // One step is a card's width plus the CSS gap after it.
  function stepSize(){
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return track.children[0].getBoundingClientRect().width + gap;
  }

  // How long one slide takes, and its easing curve: starts slow, speeds up
  // in the middle, then slows to a gentle stop (an "ease in out cubic").
  var SLIDE_MS = 700;
  function ease(t){
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // The slide in progress, if any: its target position and animation frame.
  var anim = null;

  // Scroll snapping is turned off while we move the row ourselves (it would
  // keep pulling the row back to the nearest card mid slide) and turned back
  // on afterward so swipes on touch screens still snap. Setting '' hands the
  // value back to the stylesheet.
  function endSlide(){
    anim = null;
    track.style.scrollSnapType = '';
  }

  // If a slide is still running (say, a quick double click on an arrow),
  // jump it to where it was heading so the next one starts from a clean spot.
  function finishSlide(){
    if (!anim) return;
    cancelAnimationFrame(anim.frame);
    track.scrollLeft = anim.to;
    endSlide();
  }

  // Slide the row one card forward (dir 1) or back (dir -1). To loop without
  // ever rewinding, a card is moved from one end of the row to the other just
  // before it would run out, and the scroll position is shifted by the same
  // amount, so nothing visibly jumps.
  function slide(dir){
    var max = track.scrollWidth - track.clientWidth;
    if (max <= 2) return; // every card already fits, nothing to slide
    finishSlide();
    var size = stepSize();
    track.style.scrollSnapType = 'none';
    if (dir > 0 && track.scrollLeft + size > max - 2 && track.scrollLeft >= size - 2) {
      // Near the end: move the first card (already scrolled out of view on
      // the left) to the end of the row.
      track.appendChild(track.firstElementChild);
      track.scrollLeft -= size;
    } else if (dir < 0 && track.scrollLeft < size - 2) {
      // Near the start: bring the last card around to the front.
      track.insertBefore(track.lastElementChild, track.firstElementChild);
      track.scrollLeft += size;
    }
    var from = track.scrollLeft;
    var to = Math.max(0, Math.min(track.scrollWidth - track.clientWidth, from + dir * size));
    if (reduceMotion) { track.scrollLeft = to; endSlide(); return; }
    var start = null;
    // requestAnimationFrame runs the function right before the browser
    // paints its next frame (about 60 times a second), so the row moves a
    // little each frame along the easing curve.
    function frame(now){
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / SLIDE_MS);
      track.scrollLeft = from + (to - from) * ease(t);
      if (t < 1) anim.frame = requestAnimationFrame(frame);
      else endSlide();
    }
    anim = { to: to, frame: requestAnimationFrame(frame) };
  }

  // Auto rotation timer. It is skipped for visitors who ask their device for
  // reduced motion, held while the mouse or keyboard focus is on the
  // carousel (so it never moves under someone reading or clicking it), and
  // idle while the browser tab is in the background.
  var timer = null;
  var held = false;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function startAutoplay(){
    clearInterval(timer);
    if (reduceMotion) return;
    timer = setInterval(function(){
      if (!held && !document.hidden) slide(1);
    }, AUTOPLAY_MS);
  }

  function hold(){ held = true; }
  // Restarting the timer on release gives a full 3 seconds before it moves.
  function release(){ held = false; startAutoplay(); }

  // Show the section (CSS keeps it hidden until .has-posts) and wire up the
  // arrows, as long as there is at least one card in the track.
  function activate(){
    if (!track.children.length) return;
    root.classList.add('has-posts');
    // Each arrow click slides one card, the same smooth slide as autoplay.
    prev.addEventListener('click', function(){ slide(-1); startAutoplay(); });
    next.addEventListener('click', function(){ slide(1); startAutoplay(); });
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    root.addEventListener('mouseenter', hold);
    root.addEventListener('mouseleave', release);
    root.addEventListener('focusin', hold);
    root.addEventListener('focusout', release);
    // A swipe on a touch screen restarts the countdown from the new spot.
    track.addEventListener('touchstart', startAutoplay, { passive: true });
    updateArrows();
    startAutoplay();
  }

  // Start with the shop photos so there is always something to show.
  fill(SHOP_PHOTOS.map(buildPhotoCard));

  // No feed yet: just show the shop photos.
  if (!FEED_ID) { activate(); return; }

  // Accept a bare Behold feed ID, or a full URL (handy for local testing).
  var url = FEED_ID.indexOf('/') === -1 ? 'https://feeds.behold.so/' + encodeURIComponent(FEED_ID) : FEED_ID;

  fetch(url)
    .then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(data){
      var posts = ((data && data.posts) || []).slice(0, MAX_POSTS);
      var cards = posts.map(buildCard).filter(Boolean);
      // Only swap out the shop photos if the feed actually gave us posts.
      if (cards.length) fill(cards);
    })
    .catch(function(){ /* feed failed: keep the shop photos */ })
    .then(activate);
})();
