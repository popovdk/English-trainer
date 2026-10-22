// Генерирует PNG-иконки (apple-touch-icon, PWA, favicon) из public/favicon.svg.
// Запуск: node scripts/make-icons.mjs (нужен playwright с Chromium).
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');
// Для иконок «на экран Домой» iOS сам скругляет углы — фон делаем квадратным
const fullBleed = svg.replace('rx="16"', 'rx="0"');

const targets = [
  { file: 'public/apple-touch-icon.png', size: 180, src: fullBleed },
  { file: 'public/icons/icon-192.png', size: 192, src: fullBleed },
  { file: 'public/icons/icon-512.png', size: 512, src: fullBleed },
  { file: 'public/favicon-32.png', size: 32, src: svg },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { file, size, src } of targets) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${src}`,
  );
  await page.screenshot({ path: file, omitBackground: true });
  console.log('✓', file);
}
await browser.close();
