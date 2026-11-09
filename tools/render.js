// Renders a scene page (window.renderFrame(t)) to MP4 or still PNGs.
//   node tools/render.js scene_01                 -> output/scene_01.mp4
//   node tools/render.js scene_01 --stills 1.0,6.5 -> output/stills/scene_01_t1.0.png ...
//   node tools/render.js scene_01 --from 9 --to 12 --out output/test.mp4  (partial, no audio offset issues)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const scene = args[0];
const opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
const root = path.resolve(__dirname, '..');
const page_url = 'file://' + path.join(root, 'scenes', scene, 'index.html');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
  await page.goto(page_url + '?render=1');
  await page.evaluate(() => document.fonts.ready);
  const { fps, duration } = await page.evaluate(() => ({ fps: window.TIMING.fps, duration: window.TIMING.duration }));

  if (opt('stills')) {
    const dir = path.join(root, 'output', 'stills'); fs.mkdirSync(dir, { recursive: true });
    for (const t of opt('stills').split(',').map(Number)) {
      await page.evaluate(t => window.renderFrame(t), t);
      const f = path.join(dir, `${scene}_t${t.toFixed(2)}.png`);
      await page.screenshot({ path: f, type: 'png' });
      console.log(f);
    }
    await browser.close(); return;
  }

  const from = Number(opt('from') || 0), to = Number(opt('to') || duration);
  const out = opt('out') || path.join(root, 'output', `${scene}.mp4`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const audio = path.join(root, 'scenes', scene, 'audio.wav');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-ss', String(from), '-t', String(to - from), '-i', audio,
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
    '-r', String(fps), '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = Math.round(from * fps), n1 = Math.round(to * fps);
  const t0 = Date.now();
  for (let f = n0; f < n1; f++) {
    await page.evaluate(t => window.renderFrame(t), f / fps);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) process.stdout.write(`frame ${f}/${n1} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('done ->', out);
})();
