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

  // Hide an arrow (via :disabled in CSS) when the row is already at that end.
  function updateArrows(){
    var max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  }

  // Each arrow click scrolls by about one screen's worth of cards.
  function scrollByPage(dir){
    track.scrollBy({ left: dir * track.clientWidth * 0.9, behavior: 'smooth' });
  }

  // Show the section (CSS keeps it hidden until .has-posts) and wire up the
  // arrows, as long as there is at least one card in the track.
  function activate(){
    if (!track.children.length) return;
    root.classList.add('has-posts');
    prev.addEventListener('click', function(){ scrollByPage(-1); });
    next.addEventListener('click', function(){ scrollByPage(1); });
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
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
