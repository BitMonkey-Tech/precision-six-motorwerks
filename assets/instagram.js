(function(){
  // Homepage Instagram carousel. Posts come from BitMonkey's instafeed
  // service (https://instafeed.bitmonkeytech.com), which keeps the Instagram
  // access token private on the server and returns the latest posts as JSON.
  // The section's data-ig-feed attribute in index.html is this site's feed ID
  // in instafeed's feeds.json. The section stays hidden (CSS) until posts
  // load, so if the ID is unset or the feed fails, nothing shows.
  var root = document.getElementById('instagram');
  if (!root) return;
  var feed = root.getAttribute('data-ig-feed');
  if (!feed) return;

  var track = root.querySelector('.ig-track');
  var prev = root.querySelector('.ig-prev');
  var next = root.querySelector('.ig-next');
  var MAX_POSTS = 12;

  // Accept a bare feed ID, or a full URL (handy for local testing).
  var url = feed.indexOf('/') === -1 ? 'https://instafeed.bitmonkeytech.com/ig/' + encodeURIComponent(feed) : feed;

  function buildCard(post){
    // instafeed already picked the image: a reel's thumbnail, an album's
    // first slide, or the photo itself.
    var src = post.imageUrl;
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
    var cap = (post.caption || '').trim();
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
