// Run with a local Sharp installation: SHARP_PATH may point to its package directory.
import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_PATH || 'sharp');
const mark = await readFile(new URL('../public/meal-mark.svg', import.meta.url), 'utf8');
await mkdir(new URL('../public/icons/', import.meta.url), { recursive: true });
await sharp(Buffer.from(mark)).resize(64, 64).png().toFile(fileURLToPath(new URL('../public/favicon.png', import.meta.url)));
for (const [name, size, inset] of [['icon-192', 192, 28], ['icon-512', 512, 76], ['icon-512-maskable', 512, 102], ['apple-touch-icon', 180, 27], ['source', 512, 76]]) {
  const art = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#850008"/><g transform="translate(${inset} ${inset}) scale(${(size - inset * 2) / 52})">${mark.replace(/<svg[^>]*>|<\/svg>/g, '').replaceAll('#c60016', '#ffffff')}</g></svg>`;
  // Inherited fill from the source SVG becomes explicit when embedded.
  await sharp(Buffer.from(art.replace('<g transform=', '<g fill="white" transform='))).png().toFile(fileURLToPath(new URL(`../public/icons/${name}.png`, import.meta.url)));
}
