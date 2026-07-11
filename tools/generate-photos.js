// tools/generate-photos.js
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ALBUMS_DIR = path.join(process.cwd(), "assets", "albums");
const WSC_DIR = path.join(process.cwd(), "daylight", "gallery", "sports", "wsc-2026");
const IMG_EXT = new Set([".jpg",".jpeg",".png",".webp",".gif",".JPG",".JPEG",".PNG",".WEBP",".GIF"]);

function listDirs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);
}

// Batch-reads pixel dimensions for every file in dir via one ImageMagick
// `identify` call, so <img width/height> can be set to prevent layout shift.
function readDimensions(dir, files) {
  if (!files.length) return {};

  try {
    const out = execFileSync("identify", ["-format", "%f %wx%h\n", ...files], { cwd: dir })
      .toString();

    const dims = {};
    out.trim().split("\n").forEach(line => {
      const match = line.match(/^(.*) (\d+)x(\d+)$/);
      if (match) dims[match[1]] = { w: Number(match[2]), h: Number(match[3]) };
    });

    return dims;
  } catch (e) {
    console.warn(`⚠️  Couldn't read image dimensions in ${dir}: ${e.message}`);
    return {};
  }
}

function makePhotosJS(files, dims = {}) {
  const entries = files.map(f => {
    const d = dims[f];
    return d
      ? `  { src: "${f}", w: ${d.w}, h: ${d.h} }`
      : `  "${f}"`;
  }).join(",\n");

  return `window.PHOTOS = [\n${entries}\n];\n`;
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

function toWebp(filename) {
  return filename.replace(/\.(jpe?g|png)$/i, ".webp");
}

function generateForAlbum(slug) {
  const originalDir = path.join(ALBUMS_DIR, slug, "original");
  const webDir = path.join(ALBUMS_DIR, slug, "web");
  if (!fs.existsSync(originalDir)) return console.warn(`⚠️  Skip ${slug}: no original/ folder`);
  const files = listImages(originalDir);

  // Dimensions come from web/ (what's actually displayed), keyed back to the
  // original/ filenames so photoCardHTML can set width/height and prevent CLS.
  const webFiles = fs.existsSync(webDir) ? listImages(webDir) : [];
  const webDims = readDimensions(webDir, webFiles);
  const dims = {};
  files.forEach(f => {
    const d = webDims[toWebp(f)];
    if (d) dims[f] = d;
  });

  const outPath = path.join(ALBUMS_DIR, slug, "photos.js");
  fs.writeFileSync(outPath, makePhotosJS(files, dims), "utf8");
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
