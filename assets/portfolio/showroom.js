(() => {
  const params = new URLSearchParams(window.location.search);
  const type = (params.get("type") || "dj").toLowerCase();

  const CONFIG = {
    dj: {
      title: 'DJ <span>Showroom</span>',
      subtitle:
        "Live set energy, booth presence, artist portraits, and moments that make a DJ brand feel premium and alive.",
      description:
        "A curated selection of DJ-focused visuals: performance shots, crowd connection, booth atmosphere, lighting, and branding moments captured in a strong nightlife aesthetic.",
      folder: "/assets/portfolio/dj"
    },
    sponsor: {
      title: 'Sponsor <span>Showroom</span>',
      subtitle:
        "Brand visibility, activations, audience interaction, and content that proves real event presence.",
      description:
        "This selection focuses on sponsor exposure inside real nightlife environments: branded moments, product placement, activations, signage, and audience engagement.",
      folder: "/assets/portfolio/sponsor"
    },
    event: {
      title: 'Event <span>Showroom</span>',
      subtitle:
        "Atmosphere, crowd energy, decor, reactions, and the full vibe of the night.",
      description:
        "A broader event-driven gallery showing the full experience: crowd scenes, ambiance, DJs, decor, interactions, and visual storytelling from the night as a whole.",
      folder: "/assets/portfolio/event"
    }
  };

  const current = CONFIG[type] || CONFIG.dj;

  const titleEl = document.getElementById("showroomTitle");
  const subtitleEl = document.getElementById("showroomSubtitle");
  const descriptionEl = document.getElementById("showroomDescription");
  const gridEl = document.getElementById("showroomGrid");

  const lightbox = document.getElementById("showroomLightbox");
  const lightboxImg = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let photos = [];
  let currentIndex = 0;

  if (titleEl) titleEl.innerHTML = current.title;
  if (subtitleEl) subtitleEl.textContent = current.subtitle;
  if (descriptionEl) descriptionEl.textContent = current.description;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.body.appendChild(script);
    });
  }

  function getOrientationClass(img) {
    const { naturalWidth, naturalHeight } = img;

    if (!naturalWidth || !naturalHeight) return "showroom-card--square";

    const ratio = naturalWidth / naturalHeight;

    if (ratio < 0.85) return "showroom-card--portrait";
    if (ratio > 1.35) return "showroom-card--landscape";
    return "showroom-card--square";
  }

  function applyCardClasses(card, img) {
    const orientationClass = getOrientationClass(img);

    card.classList.remove(
      "showroom-card--portrait",
      "showroom-card--landscape",
      "showroom-card--square",
      "showroom-card--featured"
    );

    card.classList.add(orientationClass);
  }

  function applyFeaturedLandscapeCards() {
    if (!gridEl) return;

    const landscapeCards = [...gridEl.querySelectorAll(".showroom-card--landscape")];

    landscapeCards.forEach((card) => {
      card.classList.remove("showroom-card--featured");
    });

    landscapeCards.forEach((card, index) => {
      if (window.innerWidth > 1100 && index % 5 === 0) {
        card.classList.add("showroom-card--featured");
      }
    });
  }

  function resizeMasonryItem(card) {
    if (!gridEl || !card) return;

    const gridStyle = window.getComputedStyle(gridEl);
    const rowHeight = parseFloat(gridStyle.getPropertyValue("grid-auto-rows"));
    const rowGap = parseFloat(gridStyle.getPropertyValue("gap"));

    if (!rowHeight) return;

    const img = card.querySelector("img");
    if (!img) return;

    const cardHeight = card.getBoundingClientRect().height;
    const rowSpan = Math.ceil((cardHeight + rowGap) / (rowHeight + rowGap));

    card.style.gridRowEnd = `span ${rowSpan}`;
  }

  function resizeAllMasonryItems() {
    if (!gridEl) return;
    gridEl.querySelectorAll(".showroom-card").forEach((card) => {
      resizeMasonryItem(card);
    });
  }

  function finalizeLayout() {
    applyFeaturedLandscapeCards();

    requestAnimationFrame(() => {
      resizeAllMasonryItems();
    });
  }

  function renderGrid() {
    if (!gridEl) return;

    if (!photos.length) {
      gridEl.innerHTML = `
        <div class="showroom-empty">
          No images found for this showroom yet.
        </div>
      `;
      return;
    }

    gridEl.innerHTML = photos
      .map((fileName, index) => {
        const imageSrc = `${current.folder}/web/${encodeURIComponent(fileName)}`;

        return `
          <article class="showroom-card" data-index="${index}">
            <img
              src="${imageSrc}"
              alt="Showroom image ${index + 1}"
              loading="lazy"
              decoding="async"
            />
          </article>
        `;
      })
      .join("");

    const cards = [...gridEl.querySelectorAll(".showroom-card")];
    let loadedCount = 0;

    const onCardReady = (card, img) => {
      applyCardClasses(card, img);
      loadedCount += 1;

      if (loadedCount === cards.length) {
        finalizeLayout();
      } else {
        resizeMasonryItem(card);
      }
    };

    cards.forEach((card) => {
      const img = card.querySelector("img");
      if (!img) {
        loadedCount += 1;
        return;
      }

      if (img.complete && img.naturalWidth > 0) {
        onCardReady(card, img);
      } else {
        img.addEventListener("load", () => onCardReady(card, img), { once: true });
        img.addEventListener("error", () => {
          card.classList.add("showroom-card--square");
          loadedCount += 1;
          if (loadedCount === cards.length) finalizeLayout();
        }, { once: true });
      }

      card.addEventListener("click", () => {
        const index = Number(card.dataset.index);
        openLightbox(index);
      });
    });

    requestAnimationFrame(() => {
      finalizeLayout();
    });
  }

  function openLightbox(index) {
    if (!photos.length || !lightbox || !lightboxImg) return;

    currentIndex = index;
    const fileName = photos[currentIndex];
    lightboxImg.src = `${current.folder}/web/${encodeURIComponent(fileName)}`;
    lightboxImg.alt = `Showroom image ${currentIndex + 1}`;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  function showPrev() {
    if (!photos.length) return;
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    openLightbox(currentIndex);
  }

  function showNext() {
    if (!photos.length) return;
    currentIndex = (currentIndex + 1) % photos.length;
    openLightbox(currentIndex);
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", showPrev);
  if (lightboxNext) lightboxNext.addEventListener("click", showNext);

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (!lightbox || lightbox.hidden) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  });

  window.addEventListener("resize", () => {
    finalizeLayout();
  });

  async function init() {
    try {
      window.SHOWROOM_PHOTOS = undefined;
      await loadScript(`${current.folder}/photos.js`);

      if (!Array.isArray(window.SHOWROOM_PHOTOS)) {
        throw new Error("SHOWROOM_PHOTOS is missing or invalid in photos.js");
      }

      photos = window.SHOWROOM_PHOTOS;
      renderGrid();
    } catch (error) {
      console.error(error);
      if (gridEl) {
        gridEl.innerHTML = `
          <div class="showroom-empty">
            Unable to load this showroom right now.
          </div>
        `;
      }
    }
  }

  init();
})();