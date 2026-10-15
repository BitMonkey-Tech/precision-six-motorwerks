(function(){
  // Homepage Instagram carousel. Posts come from a Behold (behold.so) JSON
  // feed: someone with the Instagram login connects the account on Behold,
  // which keeps the Instagram access token private and hands us a public
  // feed ID. Put that ID in the section's data-ig-feed attribute in
  // index.html. The section stays hidden (CSS) until posts load, so if the
  // ID is unset or the feed fails, nothing shows.
  var root = document.getElementById('instagram');
  if (!root) return;
  var feed = root.getAttribute('data-ig-feed');
  if (!feed) return;

  var track = root.querySelector('.ig-track');
  var prev = root.querySelector('.ig-prev');
  var next = root.querySelector('.ig-next');
  var MAX_POSTS = 12;

  // Accept a bare Behold feed ID, or a full URL (handy for local testing).
  var url = feed.indexOf('/') === -1 ? 'https://feeds.behold.so/' + encodeURIComponent(feed) : feed;

  // Pick a reasonably small image: Behold's resized "medium" (max 700px) if
  // present, else the raw image. For videos, mediaUrl is the video itself,
  // so fall back to its thumbnail instead.
  function imageFor(post){
    var s = post.sizes;
    if (s && s.medium && s.medium.mediaUrl) return s.medium.mediaUrl;
    if (post.mediaType === 'VIDEO') return post.thumbnailUrl;
    return post.mediaUrl;
  }

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

  fetch(url)
    .then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(data){
      var posts = (data && data.posts) || [];
      posts.slice(0, MAX_POSTS).forEach(function(p){
        var card = buildCard(p);
        if (card) track.appendChild(card);
      });
      if (!track.children.length) return;
      root.classList.add('has-posts');
      prev.addEventListener('click', function(){ scrollByPage(-1); });
      next.addEventListener('click', function(){ scrollByPage(1); });
      track.addEventListener('scroll', updateArrows, { passive: true });
      window.addEventListener('resize', updateArrows);
      updateArrows();
    })
    .catch(function(){ /* section stays hidden */ });
})();
