/**
 * Generates web-ready images from the source files in /public. Re-run after replacing a source:
 *
 *   npm run images
 *
 * - public/portrait.png               → public/portrait.webp (hero portrait, much smaller)
 * - public/8-bit pixel portrait.jpg   → public/icons/* + app/favicon.ico (round, crisp pixel-art icons)
 * - public/get-in-touch.jpg           → public/get-in-touch.webp (enlarged + sharpened for full screen)
 *                                     → public/og-image.jpg (1200×630 social share card)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Keep in sync with lib/site.ts and the dictionaries.
const NAME = 'Trương Công Trí';
const ROLE = 'Full-stack Developer';
const STACK = 'Node.js · NestJS · Express.js · React · Next.js';

const PORTRAIT = 'public/portrait.png';
const GET_IN_TOUCH = 'public/get-in-touch.jpg';
const ICON = 'public/8-bit pixel portrait.jpg';

await mkdir('public/icons', { recursive: true });

// 1. Hero portrait: keep the alpha channel, trim the empty transparent margins (so the person fills
//    the hero's portrait box, which is sized by the image), cap the height at 2× the largest on-screen size.
const portrait = await sharp(PORTRAIT)
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 })
  .resize({ height: 1400, withoutEnlargement: true })
  .webp({ quality: 82, alphaQuality: 90, effort: 6 })
  .toFile('public/portrait.webp');
console.log(`portrait.webp  ${portrait.width}×${portrait.height}  ${(portrait.size / 1024) | 0} KB`);

// 2. Icons: nearest-neighbour keeps the pixel art sharp at every size, then a circular mask makes
// them round (the JPEG source stays square; it has no transparency to hold the corners).
// ensureAlpha(): ICO decoders require RGBA PNG entries, and the mask needs an alpha channel anyway.
const circleMask = (size) =>
  Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);
const pixelSquare = (size) => sharp(ICON).resize(size, size, { kernel: 'nearest' }).ensureAlpha().png().toBuffer();
const pixel = async (size) =>
  sharp(await pixelSquare(size))
    .composite([{ input: circleMask(size), blend: 'dest-in' }])
    .png({ compressionLevel: 9 });

for (const [file, size] of [
  ['icon-32.png', 32],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  await (await pixel(size)).toFile(`public/icons/${file}`);
  console.log(`icons/${file}  ${size}×${size}  round`);
}

// Apple touch icon: iOS fills transparent corners with black, so the circle sits on the site background.
const roundApple = await (await pixel(180)).toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#f3f3f3' } })
  .composite([{ input: roundApple }])
  .flatten({ background: '#f3f3f3' })
  .png({ compressionLevel: 9 })
  .toFile('public/icons/apple-touch-icon.png');
console.log('icons/apple-touch-icon.png  180×180  round on #f3f3f3');

// favicon.ico with PNG-encoded 16/32/48 entries (valid ICO; replaces Next's default favicon).
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map(async (size) => (await pixel(size)).toBuffer()));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const entries = pngs.map((png, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(icoSizes[i], 0); // width
  entry.writeUInt8(icoSizes[i], 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});
await writeFile('app/favicon.ico', Buffer.concat([header, ...entries, ...pngs]));
console.log('app/favicon.ico  16/32/48');

// 3. Home "get in touch" image: shown full screen, but the source is small. Enlarge with Lanczos to a
// full-HD width, then an unsharp mask restores edge crispness lost in the resample (enlarging can't
// add real detail — a higher-resolution source is always better).
const touchMeta = await sharp(GET_IN_TOUCH).metadata();
const touch = await sharp(GET_IN_TOUCH)
  .resize({ width: Math.max(1920, touchMeta.width), kernel: 'lanczos3', withoutEnlargement: false })
  .sharpen({ sigma: 1.2, m1: 0.8, m2: 2.4, x1: 2, y2: 10, y3: 20 })
  .modulate({ saturation: 1.06 })
  .linear(1.04, -4) // a touch more contrast
  .webp({ quality: 86, effort: 6 })
  .toFile('public/get-in-touch.webp');
console.log(`get-in-touch.webp  ${touchMeta.width}×${touchMeta.height} → ${touch.width}×${touch.height}  ${(touch.size / 1024) | 0} KB`);

// 4. Open Graph card (1200×630): pixel portrait on the left, name and role on the right.
const W = 1200;
const H = 630;
const avatar = await (await pixel(430)).toBuffer();
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .name { font: 500 76px 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; fill: #1a1a1a; letter-spacing: -2px; }
    .role { font: 500 36px 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; fill: #1a1a1a; }
    .stack { font: 400 26px 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; fill: #6b6b6b; }
  </style>
  <rect x="560" y="200" width="560" height="1" fill="#1a1a1a" opacity="0.25"/>
  <text x="560" y="290" class="name">${escape(NAME)}</text>
  <text x="560" y="350" class="role">${escape(ROLE)}</text>
  <text x="560" y="400" class="stack">${escape(STACK)}</text>
</svg>`);
await sharp({ create: { width: W, height: H, channels: 3, background: '#f3f3f3' } })
  .composite([
    { input: avatar, left: 80, top: 100 },
    { input: text, left: 0, top: 0 },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile('public/og-image.jpg');
console.log(`og-image.jpg  ${W}×${H}`);
