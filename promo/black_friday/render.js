// Renders poster.html -> black_friday.png (1080x1350, @2x for crisp export)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const scale = Number(process.argv[2] || 2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: scale });
  await page.goto('file://' + path.join(__dirname, 'poster.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(__dirname, 'black_friday.png') });
  await browser.close();
})();
