const PORTFOLIO_ALTS = {
  dj: [
    "DJ performance shot",
    "DJ portrait at the booth",
    "DJ under nightlife lighting",
    "Wide DJ booth scene",
    "DJ performance close-up",
    "DJ and lights atmosphere",
    "DJ set in warm lighting",
    "DJ crowd and booth moment"
  ],
  artist: [
    "Artist performance shot",
    "Artist on stage",
    "Artist close-up",
    "Artist live performance",
    "Artist crowd moment",
    "Artist under stage lighting",
    "Artist portrait",
    "Artist performance detail",
    "Artist stage energy",
    "Artist nightlife moment",
    "Artist live set",
    "Artist atmosphere shot"
  ],
  crowd: [
    "Party crowd portrait",
    "Group nightlife portrait",
    "Two guests at event",
    "Party crowd wide image",
    "Group nightlife portrait",
    "Guest holding a drink",
    "Group of women at event",
    "Friends group shot",
    "Couple or pair at venue",
    "Group nightlife portrait",
    "Friends at event",
    "Nightlife portrait",
    "Guest portrait in venue",
    "Two guests in nightlife setting",
    "Group portrait with tunnel background",
    "Group nightlife image",
    "Two women portrait",
    "Couple portrait",
    "Nightlife group moment",
    "Friends enjoying the event"
  ],
  sponsor: [
    "Branded bottle display",
    "Product detail",
    "Sponsor activation scene",
    "Brand crowd moment",
    "Bar service shot",
    "Shelf branding scene",
    "Backbar detail",
    "Brand ambassador shot"
  ]
};

const PORTFOLIO_GROUPS = {
  dj: [4, 4],
  artist: [4, 4, 4],
  crowd: [4, 4, 4, 4, 4],
  sponsor: [4, 4]
};

function createCard(src, alt, eager = false) {
  const figure = document.createElement("figure");
  figure.className = "chapter-card";

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt || "";
  img.loading = eager ? "eager" : "lazy";
  img.decoding = "async";

  figure.appendChild(img);
  return figure;
}

function getAlt(key, index) {
  const alts = PORTFOLIO_ALTS[key] || [];
  return alts[index] || `${key} portfolio image ${index + 1}`;
}

function chunkByGroups(files, groups) {
  const chunks = [];
  let start = 0;

  groups.forEach((size) => {
    const chunk = files.slice(start, start + size);
    if (chunk.length) chunks.push(chunk);
    start += size;
  });

  if (start < files.length) {
    chunks.push(files.slice(start));
  }

  return chunks;
}

function createSubgrid() {
  const subgrid = document.createElement("div");
  subgrid.className = "chapter-subgrid";
  return subgrid;
}

function renderSection({ key, files, containerId, basePath }) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!Array.isArray(files) || files.length === 0) return;

  container.innerHTML = "";

  const safeBasePath = String(basePath).replace(/\/+$/, "");
  const groups = PORTFOLIO_GROUPS[key] || [4];
  const chunks = chunkByGroups(files, groups);

  let globalIndex = 0;

  chunks.forEach((chunk) => {
    const subgrid = createSubgrid();

    chunk.forEach((file) => {
      const safeFile = String(file).trim();
      const alt = getAlt(key, globalIndex);
      const eager = key === "dj" && globalIndex < 2;

      const card = createCard(`${safeBasePath}/${safeFile}`, alt, eager);
      subgrid.appendChild(card);
      globalIndex += 1;
    });

    container.appendChild(subgrid);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderSection({
    key: "dj",
    files: window.PORTFOLIO_DJ || [],
    containerId: "portfolio-dj-grid",
    basePath: "assets/portfolio/dj/web"
  });

  renderSection({
    key: "artist",
    files: window.PORTFOLIO_ARTIST || [],
    containerId: "portfolio-artist-grid",
    basePath: "assets/portfolio/artist/web"
  });

  renderSection({
    key: "crowd",
    files: window.PORTFOLIO_CROWD || [],
    containerId: "portfolio-crowd-grid",
    basePath: "assets/portfolio/crowd/web"
  });

  renderSection({
    key: "sponsor",
    files: window.PORTFOLIO_SPONSOR || [],
    containerId: "portfolio-sponsors-grid",
    basePath: "assets/portfolio/sponsor/web"
  });
});