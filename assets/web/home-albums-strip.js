// assets/web/home-albums-strip.js
(function () {
  if (!window.ALBUMS) return;

  const strip = document.getElementById('albumsStrip');
  if (!strip) return;

  const latest = window.ALBUMS
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  const cardHTML = latest
    .map((a, index) => {
      const loading = index === 0 ? 'eager' : 'lazy';
      const priority = index === 0 ? 'fetchpriority="high"' : 'fetchpriority="low"';

      return `
        <a class="albums-strip__item" href="${a.href}">
          <img 
            src="${a.cover}" 
            alt="${a.title}" 
            loading="${loading}" 
            decoding="async"
            ${priority}
          >
          <div class="albums-strip__label">
            <span class="label-name">${a.title}</span>
            <span class="label-meta">
              ${formatDate(a.date)} · ${a.count} photos
            </span>
          </div>
        </a>
      `;
    })
    .join('');

  // First load only 5 cards
  strip.innerHTML = cardHTML;

  // Duplicate after the browser has started loading the first set
  window.setTimeout(() => {
    strip.insertAdjacentHTML('beforeend', cardHTML);
  }, 1200);

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

    if (!paused && strip.scrollWidth > strip.clientWidth) {
      const speed = 0.045; // slightly slower = smoother and lighter
      const totalWidth = strip.scrollWidth / 2;

      scrollPos += speed * dt;

      if (scrollPos >= totalWidth) {
        scrollPos -= totalWidth;
      }

      strip.scrollLeft = scrollPos;
    }

    requestAnimationFrame(loop);
  }

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