// assets/web/home-albums-strip.js
(function () {
  if (!window.ALBUMS) return;

  const strip = document.getElementById('albumsStrip');
  if (!strip) return;

  // ---- Build the cards: newest 5 albums ----
  const latest = window.ALBUMS
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const cardHTML = latest
    .map(
      (a) => `
      <a class="albums-strip__item" href="${a.href}">
        <img src="${a.cover}" alt="${a.title}" loading="lazy">
        <div class="albums-strip__label">
          <span class="label-name">${a.title}</span>
          <span class="label-meta">
            ${new Date(a.date).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })} · ${a.count} photos
          </span>
        </div>
      </a>`
    )
    .join('');

  // Put cards in the strip & duplicate once for an infinite loop
  strip.innerHTML = cardHTML + cardHTML;

  // ---- Auto-scroll logic (desktop + mobile) ----
  let scrollPos = 0;
  let lastTime = null;
  let paused = false;
  let pauseTimer = null;

  function syncFromDOM() {
    scrollPos = strip.scrollLeft;
  }

  function pauseFor(ms) {
    paused = true;
    if (pauseTimer) clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => {
      paused = false;
    }, ms);
  }

  function loop(ts) {
    if (lastTime == null) lastTime = ts;
    const dt = ts - lastTime;
    lastTime = ts;

    if (!paused) {
      const speed = 0.06; // px per ms  (≈ 60px/s)
      const totalWidth = strip.scrollWidth / 2; // width of unique content

      scrollPos += speed * dt;
      if (scrollPos >= totalWidth) {
        scrollPos -= totalWidth;
      }

      strip.scrollLeft = scrollPos;
    }

    requestAnimationFrame(loop);
  }

  // Pause when the user interacts (touch / drag / wheel) then resume
  ['pointerdown', 'touchstart', 'wheel', 'mousedown'].forEach((evt) => {
    strip.addEventListener(
      evt,
      () => {
        syncFromDOM();
        pauseFor(4000);
      },
      { passive: true }
    );
  });

  strip.addEventListener(
    'pointerup',
    () => {
      syncFromDOM();
      pauseFor(2500);
    },
    { passive: true }
  );

  strip.addEventListener(
    'scroll',
    () => {
      syncFromDOM();
    },
    { passive: true }
  );

  requestAnimationFrame(loop);
})();
