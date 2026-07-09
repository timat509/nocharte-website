// tools/generate-photos.js
const fs = require("fs");
const path = require("path");

const ALBUMS_DIR = path.join(process.cwd(), "assets", "albums");
const WSC_DIR = path.join(process.cwd(), "daylight", "gallery", "sports", "wsc-2026");
const IMG_EXT = new Set([".jpg",".jpeg",".png",".webp",".gif",".JPG",".JPEG",".PNG",".WEBP",".GIF"]);

function listDirs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);
}

function makePhotosJS(files) {
  const quoted = files.map(f => `  "${f}"`).join(",\n");
  return `window.PHOTOS = [\n${quoted}\n];\n`;
}

function makeHighlightsJS(files) {
  const quoted = files.map(f => `  "${f}"`).join(",\n");
  return `window.HIGHLIGHTS = [\n${quoted}\n];\n`;
}

function listImages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(f => f.isFile() && IMG_EXT.has(path.extname(f.name)))
    .map(f => f.name)
    .sort((a,b) => a.localeCompare(b, undefined, {numeric:true, sensitivity:"base"}));
}

// Evenly-spaced sample across the full set, so the hero reel isn't just the first few shots
function pickHighlights(files, count = 6) {
  if (files.length <= count) return files.slice();

  const step = files.length / count;
  const picked = [];

  for (let i = 0; i < count; i++) {
    picked.push(files[Math.floor(i * step)]);
  }

  return picked;
}

// Only auto-fill highlights.js if it isn't already curated (no entries yet)
function hasCuratedHighlights(highlightsPath) {
  if (!fs.existsSync(highlightsPath)) return false;
  const content = fs.readFileSync(highlightsPath, "utf8");
  return /["'][^"']+["']/.test(content);
}

function generateForAlbum(slug) {
  const photosDir = path.join(ALBUMS_DIR, slug, "photos");
  if (!fs.existsSync(photosDir)) return console.warn(`⚠️  Skip ${slug}: no photos/ folder`);
  const files = listImages(photosDir);

  const outPath = path.join(ALBUMS_DIR, slug, "photos.js");
  fs.writeFileSync(outPath, makePhotosJS(files), "utf8");
  console.log(`✅ ${slug}: wrote ${files.length} entries → ${path.relative(process.cwd(), outPath)}`);
}

// Writes photos.js (+ a default highlights.js, if not already curated) next to a
// "web/" folder (used by the WSC day + match pages)
function generateFromWebFolder(dir, label) {
  const webDir = path.join(dir, "web");
  if (!fs.existsSync(webDir)) return console.warn(`⚠️  Skip ${label}: no web/ folder`);

  const files = listImages(webDir);

  const photosPath = path.join(dir, "photos.js");
  fs.writeFileSync(photosPath, makePhotosJS(files), "utf8");
  console.log(`✅ ${label}: wrote ${files.length} entries → ${path.relative(process.cwd(), photosPath)}`);

  const highlightsPath = path.join(dir, "highlights.js");
  if (files.length && !hasCuratedHighlights(highlightsPath)) {
    const picks = pickHighlights(files);
    fs.writeFileSync(highlightsPath, makeHighlightsJS(picks), "utf8");
    console.log(`   ↳ highlights: wrote ${picks.length} entries → ${path.relative(process.cwd(), highlightsPath)}`);
  }
}

function generateForWSC() {
  if (!fs.existsSync(WSC_DIR)) return console.warn("WSC dir not found:", WSC_DIR);

  const days = listDirs(WSC_DIR).filter(name => /^day-\d+$/.test(name));
  if (days.length === 0) return console.log("No WSC days found.");

  days.forEach(daySlug => {
    const dayDir = path.join(WSC_DIR, daySlug);
    generateFromWebFolder(dayDir, daySlug);

    const matchesDir = path.join(dayDir, "matches");
    if (!fs.existsSync(matchesDir)) return;

    listDirs(matchesDir).forEach(matchSlug => {
      const matchDir = path.join(matchesDir, matchSlug);
      generateFromWebFolder(matchDir, `${daySlug}/${matchSlug}`);
    });
  });
}

(function run(){
  if (fs.existsSync(ALBUMS_DIR)) {
    const albums = listDirs(ALBUMS_DIR);
    if (albums.length === 0) console.log("No albums found.");
    albums.forEach(generateForAlbum);
  } else {
    console.warn("albums dir not found:", ALBUMS_DIR);
  }

  generateForWSC();
})();
