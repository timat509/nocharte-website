// tools/generate-album-zips.js
// Zips each album's full/ folder into a sibling downloads/<slug>.zip (not
// inside full/, so it isn't caught by the **/full/ .gitignore rule, and
// downloads/ itself is gitignored too — this file is a local artifact for
// you to upload to Google Drive by hand, not something committed or served
// by Netlify).
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ALBUMS_DIR = path.join(process.cwd(), "assets", "albums");

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);
}

function zipAlbum(slug) {
  const albumDir = path.join(ALBUMS_DIR, slug);
  const fullDir = path.join(albumDir, "full");

  if (!fs.existsSync(fullDir)) return;

  const files = fs.readdirSync(fullDir).filter(f => !f.startsWith("."));
  if (!files.length) return console.warn(`⚠️  Skip ${slug}: full/ is empty`);

  const downloadsDir = path.join(albumDir, "downloads");
  if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

  const zipPath = path.join(downloadsDir, `${slug}.zip`);
  const fullMTime = Math.max(...files.map(f => fs.statSync(path.join(fullDir, f)).mtimeMs));

  if (fs.existsSync(zipPath) && fs.statSync(zipPath).mtimeMs > fullMTime) {
    return console.log(`   ${slug}: up to date, skipping`);
  }

  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  // -j: junk the full/ path prefix so the zip contains flat files, not folders
  execFileSync("zip", ["-jq", zipPath, ...files.map(f => path.join(fullDir, f))]);

  const sizeMB = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(1);
  console.log(`✅ ${slug}: wrote downloads/${slug}.zip (${files.length} photos, ${sizeMB}MB)`);
}

(function run(){
  const requested = process.argv.slice(2);
  const slugs = requested.length ? requested : listDirs(ALBUMS_DIR);
  if (!slugs.length) return console.log("No albums found.");
  slugs.forEach(zipAlbum);
})();
