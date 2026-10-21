// Usage: node render.js <page.html> <out.mp4> <seconds> [fps]
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const [html, out, dur, fps = '30'] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.resolve(html));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.ready === true);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', fps, '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'medium', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(Number(dur) * Number(fps));
  for (let i = 0; i < n; i++) {
    const url = await page.evaluate(t => { draw(t); return canvas.toDataURL('image/png'); }, i / Number(fps));
    if (!ff.stdin.write(Buffer.from(url.slice(22), 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('wrote', out, n, 'frames');
})();
