// assets/web/album-page.js
// Make sure this file is included on your album page <script src="..."></script>

document.addEventListener('DOMContentLoaded', () => {
  // 1) Get the album slug from the URL: album.html?slug=Suenos_tour_15_11_25
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug || !window.NOCHARTE_ALBUMS) {
    console.error('Missing slug or NOCHARTE_ALBUMS');
    return;
  }

  // 2) Find the album object from your albums.js
  const album = window.NOCHARTE_ALBUMS.find(a => a.slug === slug);
  if (!album) {
    console.error('Album not found for slug:', slug);
    return;
  }

  const photos = Array.isArray(album.photos) ? album.photos : [];

  // 3) Fill header (title + date + count)
  const titleEl = document.querySelector('[data-album-title]');
  const metaEl  = document.querySelector('[data-album-meta]');
  if (titleEl) titleEl.textContent = album.title || slug;
  if (metaEl)  metaEl.textContent  = `${photos.length} photos`;

  // 4) Build grid – ALWAYS render *all* photos
  const grid = document.querySelector('[data-album-grid]');
  if (!grid) {
    console.error('Missing [data-album-grid] container');
    return;
  }

  grid.innerHTML = ''; // clear any previous children

  photos.forEach((file, index) => {
    const figure = document.createElement('figure');
    figure.className = 'album-item';

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = `assets/albums/${album.slug}/${file}`;
    img.alt = `${album.title || slug} #${index + 1}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'album-item__download';
    btn.innerHTML = '⬇️';
    btn.addEventListener('click', () => {
      // simple direct download – adjust path if needed
      window.open(img.src, '_blank');
    });

    figure.appendChild(img);
    figure.appendChild(btn);
    grid.appendChild(figure);
  });

  // 5) (Optional) sanity check in console
  console.log(
    `[NOCHARTE] Album "${album.slug}" – ${photos.length} photos, ` +
    `${grid.children.length} rendered`
  );
});
