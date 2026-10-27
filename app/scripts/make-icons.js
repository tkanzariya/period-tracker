/**
 * Builds the logo files and app icons from the locked logo (drop + flowing line + sparkle + crescent).
 * Run from app/:  node scripts/make-icons.js
 * Writes the master SVGs into design/logo/ and the PNGs referenced in app.json into assets/.
 * The mark is drawn once, below, in the 1254px space of the original sketch.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SIZE = 1024;
const BLUSH = '#FCEDE7'; // icon background (a deeper step of the app's off-white)
// Centre of the mark's visual bounds, in sketch coordinates.
const CX = 647;
const CY = 602;

const DROP = 'M641 520 C 612 580 557 648 557 722 A 93 93 0 0 0 743 722 C 743 650 672 580 641 520 Z';
const LINE =
  'M645 253 C 686 286 706 340 688 378 C 660 440 570 470 500 512 C 430 555 414 620 428 668 ' +
  'C 445 730 520 790 580 825 C 625 850 638 890 641 934 ' +
  'C 632 884 620 858 576 828 C 512 790 440 735 424 668 C 412 620 432 556 504 516 ' +
  'C 576 476 668 446 696 380 C 712 340 690 290 645 253 Z';
const SPARKLE = 'M761 438 Q 768 474 804 481 Q 768 488 761 526 Q 754 488 718 481 Q 754 474 761 438 Z';
const ARC =
  'M888 525 C 932 610 936 720 882 810 C 822 902 722 956 610 953 C 520 949 430 902 368 818 ' +
  'C 436 886 526 938 612 940 C 714 942 808 890 864 806 C 916 726 912 612 888 525 Z';

/** The mark. `flat` = one solid colour (for the themed icon); otherwise full colour. */
function mark(scale, flat) {
  const f = (full) => flat || full;
  return `<g transform="translate(512 512) scale(${scale}) translate(${-CX} ${-CY})">
    <path d="${ARC}" fill="${f('url(#arc)')}" stroke="${f('url(#arc)')}" stroke-width="5" stroke-linejoin="round"/>
    <path d="${LINE}" fill="${f('url(#line)')}" stroke="${f('url(#line)')}" stroke-width="5" stroke-linejoin="round"/>
    <path d="${DROP}" fill="${f('url(#drop)')}"/>
    <path d="${SPARKLE}" fill="${f('#D6485E')}"/>
  </g>`;
}

const defs = `<defs>
  <linearGradient id="drop" gradientUnits="userSpaceOnUse" x1="740" y1="600" x2="585" y2="800">
    <stop offset="0" stop-color="#EE6F7B"/><stop offset="0.55" stop-color="#C13348"/><stop offset="1" stop-color="#951F36"/>
  </linearGradient>
  <linearGradient id="line" gradientUnits="userSpaceOnUse" x1="690" y1="260" x2="640" y2="930">
    <stop offset="0" stop-color="#C4445A"/><stop offset="0.5" stop-color="#A5273F"/><stop offset="1" stop-color="#9C2640"/>
  </linearGradient>
  <linearGradient id="arc" gradientUnits="userSpaceOnUse" x1="900" y1="540" x2="380" y2="830">
    <stop offset="0" stop-color="#E9AFA6"/><stop offset="0.55" stop-color="#CD7D7C"/><stop offset="1" stop-color="#E4A59E"/>
  </linearGradient>
</defs>`;

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">${defs}${body}</svg>`;
const bg = `<rect width="${SIZE}" height="${SIZE}" fill="${BLUSH}"/>`;

const files = {
  // Full icon (store/legacy): blush square with the mark.
  'icon.png': svg(bg + mark(0.92)),
  // Android adaptive icon: Android masks the outer third, so the mark stays inside the safe zone.
  'android-icon-foreground.png': svg(mark(0.92)),
  'android-icon-background.png': svg(bg),
  // Themed (monochrome) icon: Android recolours the shape, only the alpha matters.
  'android-icon-monochrome.png': svg(mark(0.92, '#000000')),
  // Splash: the mark on a transparent canvas.
  'splash-icon.png': svg(mark(0.8)),
  'favicon.png': svg(`<rect width="${SIZE}" height="${SIZE}" rx="220" fill="${BLUSH}"/>` + mark(0.92)),
};

(async () => {
  // Master logo files for the design folder (vector).
  const logoDir = path.join(__dirname, '..', '..', 'design', 'logo');
  fs.writeFileSync(path.join(logoDir, 'logo-mark.svg'), svg(mark(1)) + '\n');
  fs.writeFileSync(path.join(logoDir, 'logo-icon.svg'), files['icon.png'] + '\n');
  fs.writeFileSync(path.join(logoDir, 'logo-mark-mono.svg'), svg(mark(1, '#000000')) + '\n');
  await sharp(Buffer.from(svg(mark(1)))).resize(1024, 1024).png().toFile(path.join(logoDir, 'logo-mark.png'));

  const out = path.join(__dirname, '..', 'assets');
  for (const [name, content] of Object.entries(files)) {
    const size = name === 'favicon.png' ? 96 : SIZE;
    await sharp(Buffer.from(content)).resize(size, size).png().toFile(path.join(out, name));
    console.log('wrote', name);
  }
})();
