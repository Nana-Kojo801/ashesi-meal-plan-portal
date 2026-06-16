/**
 * Generate PWA icons for Ashesi Meals using Playwright.
 * Renders the exact same SVG used in the app header → pixel-perfect match.
 *
 * Run: node generate_icons.mjs
 */

import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';

// Exact SVG paths from lucide-react v1.18.0 UtensilsCrossed icon
const UTENSILS_CROSSED_PATHS = [
  'm16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8',
  'M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7',
  'm2.1 21.8 6.4-6.3',
  'm19 5-7 7',
];

function makeHtml(size) {
  // Always flat square — Python applies rounded corners
  const iconSize = Math.round(size * 0.56);
  // stroke-width is in viewBox (0–24) units — Lucide standard is 2
  const strokeW = 2;

  const pathsMarkup = UTENSILS_CROSSED_PATHS
    .map(d => `    <path d="${d}" fill="none" stroke="white" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; }
.icon {
  width: ${size}px;
  height: ${size}px;
  background: #D81E2C;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
</head>
<body>
<div class="icon">
  <svg
    width="${iconSize}"
    height="${iconSize}"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
${pathsMarkup}
  </svg>
</div>
</body>
</html>`;
}

(async () => {
  mkdirSync('public/icons', { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Render flat 512×512 source — Python will round and resize
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(makeHtml(512), { waitUntil: 'load' });

  const screenshot = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width: 512, height: 512 },
  });

  writeFileSync('public/icons/source.png', screenshot);
  await page.close();
  await browser.close();
  console.log('[OK] public/icons/source.png  (512x512 flat source)');
  console.log('Run: python round_icons.py');
})();
