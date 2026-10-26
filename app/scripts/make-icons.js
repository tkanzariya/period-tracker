/**
 * Builds the app icons from the locked logo (concept A: open ring + dot).
 * Run from app/:  node scripts/make-icons.js
 * Writes the PNGs referenced in app.json into assets/.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROSE = '#C9265F';
const SIZE = 1024;

function point(r, deg) {
  const a = (deg * Math.PI) / 180;
  return [512 + r * Math.cos(a), 512 + r * Math.sin(a)];
}

/** The ring-and-dot mark, scaled around the centre. `colour` is the stroke/fill colour. */
function mark(colour, scale) {
  const r = 290;
  // The dot sits in the middle of the gap (ring ends at -30° and 265°, dot at -62.5°).
  const [sx, sy] = point(r, -30);
  const [ex, ey] = point(r, 265);
  const [dx, dy] = point(r, -62.5);
  return `<g transform="translate(512 512) scale(${scale}) translate(-512 -512)">
    <path d="M${sx.toFixed(1)} ${sy.toFixed(1)} A${r} ${r} 0 1 1 ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="${colour}" stroke-width="72" stroke-linecap="round"/>
    <circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="78" fill="${colour}"/>
  </g>`;
}

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">${body}</svg>`;

const files = {
  // Full icon (used for the store/legacy icon): rose square with the white mark.
  'icon.png': svg(`<rect width="${SIZE}" height="${SIZE}" fill="${ROSE}"/>${mark('#FFFFFF', 1)}`),
  // Android adaptive icon: Android masks the outer third, so keep the mark inside the safe zone.
  'android-icon-foreground.png': svg(mark('#FFFFFF', 0.82)),
  'android-icon-background.png': svg(`<rect width="${SIZE}" height="${SIZE}" fill="${ROSE}"/>`),
  // Themed (monochrome) icon: Android recolours the shape, only the alpha matters.
  'android-icon-monochrome.png': svg(mark('#000000', 0.82)),
  // Splash: the mark in rose on a transparent canvas.
  'splash-icon.png': svg(mark(ROSE, 0.7)),
  'favicon.png': svg(`<rect width="${SIZE}" height="${SIZE}" rx="200" fill="${ROSE}"/>${mark('#FFFFFF', 1)}`),
};

(async () => {
  // Keep the master logo file in design/ in sync with the app icons.
  fs.writeFileSync(path.join(__dirname, '..', '..', 'design', 'logo', 'concept-a-ring.svg'), files['icon.png'] + '\n');
  const out = path.join(__dirname, '..', 'assets');
  for (const [name, content] of Object.entries(files)) {
    const size = name === 'favicon.png' ? 96 : SIZE;
    await sharp(Buffer.from(content)).resize(size, size).png().toFile(path.join(out, name));
    console.log('wrote', name);
  }
})();
