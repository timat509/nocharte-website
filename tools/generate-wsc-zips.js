// tools/generate-wsc-zips.js
// Zips each WSC match's full/ folder into a sibling download.zip (NOT inside
// full/, so it isn't caught by the **/full/ .gitignore rule) — this is what
// the "Download match photos" button on the WSC page links to, served
// directly by Netlify instead of an external Drive link.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const WSC_DIR = path.join(process.cwd(), "daylight", "gallery", "sports", "wsc-2026");

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);
}

function zipMatch(dayDir, daySlug, matchSlug) {
  const matchDir = path.join(dayDir, "matches", matchSlug);
  const fullDir = path.join(matchDir, "full");

  if (!fs.existsSync(fullDir)) return;

  const files = fs.readdirSync(fullDir).filter(f => !f.startsWith("."));
  if (!files.length) return console.warn(`⚠️  Skip ${daySlug}/${matchSlug}: full/ is empty`);

  const zipPath = path.join(matchDir, "download.zip");
  const fullMTime = Math.max(...files.map(f => fs.statSync(path.join(fullDir, f)).mtimeMs));

  if (fs.existsSync(zipPath) && fs.statSync(zipPath).mtimeMs > fullMTime) {
    return console.log(`   ${daySlug}/${matchSlug}: up to date, skipping`);
  }

  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  // -j: junk the full/ path prefix so the zip contains flat files, not folders
  execFileSync("zip", ["-jq", zipPath, ...files.map(f => path.join(fullDir, f))]);

  const sizeMB = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(1);
  console.log(`✅ ${daySlug}/${matchSlug}: wrote download.zip (${files.length} photos, ${sizeMB}MB)`);
}

(function run(){
  const days = listDirs(WSC_DIR).filter(name => /^day-\d+$/.test(name));

  days.forEach(daySlug => {
    const dayDir = path.join(WSC_DIR, daySlug);
    const matchesDir = path.join(dayDir, "matches");

    listDirs(matchesDir).forEach(matchSlug => {
      zipMatch(dayDir, daySlug, matchSlug);
    });
  });
})();
