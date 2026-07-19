// Regenerates the PWA / home-screen icons from the "Autong." wordmark:
// the ink "A" + coral "." on cream paper, tilted like the real wordmark.
// Run with: npm run icons
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fontPath = path.join(
  root,
  'node_modules/@fontsource/comic-neue/files/comic-neue-latin-700-italic.woff2',
);
const fontBuf = readFileSync(fontPath);

const CREAM = '#efe2c4';
const INK = '#2c2a26';
const CORAL = '#e24b4a';

// viewBox is always 512; width/height set the actual raster size.
function svg(size, fontSize, baselineY) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${CREAM}"/>
  <g transform="rotate(-2 256 256)">
    <text x="256" y="${baselineY}" text-anchor="middle"
          font-family="Comic Neue" font-style="italic" font-weight="700"
          font-size="${fontSize}" letter-spacing="-4">
      <tspan fill="${INK}">A</tspan><tspan fill="${CORAL}">.</tspan>
    </text>
  </g>
</svg>`;
}

function render(svgStr) {
  const r = new Resvg(svgStr, {
    font: { fontBuffers: [fontBuf], defaultFontFamily: 'Comic Neue', loadSystemFonts: false },
  });
  return r.render().asPng();
}

const ANY = [300, 340];   // fills the tile — "any" purpose + apple
const MASK = [240, 322];  // letters inside the 80% maskable safe zone

const jobs = [
  ['public/pwa-192x192.png',          svg(192, ...ANY)],
  ['public/pwa-512x512.png',          svg(512, ...ANY)],
  ['public/pwa-512x512-maskable.png', svg(512, ...MASK)],
  ['public/apple-touch-icon.png',     svg(180, ...ANY)],
];

for (const [rel, s] of jobs) {
  writeFileSync(path.join(root, rel), render(s));
  console.log(`wrote ${rel}`);
}
