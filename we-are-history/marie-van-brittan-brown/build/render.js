// Usage: node render.js stills|video [feed|reel|both] [slides e.g. 1,3]
// Renders carousel.html deterministically via window.seek(t), frame by frame.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MODE = process.argv[2] || 'stills';
const FMTS = (process.argv[3] || 'both') === 'both' ? ['feed', 'reel'] : [process.argv[3]];
const SLIDES = process.argv[4] ? process.argv[4].split(',').map(Number) : [1, 2, 3, 4, 5, 6, 7];
const FPS = 30;
const ROOT = path.resolve(__dirname, '..');
const OUT = { feed: path.join(ROOT, 'carousel-4x5'), reel: path.join(ROOT, 'reel-9x16') };
const FRAMES = path.join(__dirname, 'frames');
const DURS = process.env.DURS ? JSON.parse(process.env.DURS) : {};
const SUB = process.env.OUTSUB || 'mp4';

(async () => {
  const http = require('http');
  const MIME = { '.html': 'text/html', '.png': 'image/png', '.css': 'text/css', '.woff2': 'font/woff2', '.js': 'text/javascript' };
  const server = http.createServer((req, res) => {
    const f = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(__dirname) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  }).listen(8765, '127.0.0.1');
  const browser = await chromium.launch();
  for (const fmt of FMTS) {
    const H = fmt === 'reel' ? 1920 : 1350;
    const page = await browser.newPage({ viewport: { width: 1080, height: H }, deviceScaleFactor: 1 });
    const outDir = OUT[fmt] + (MODE === 'stills' ? '' : '/' + SUB);
    fs.mkdirSync(outDir, { recursive: true });
    for (const n of SLIDES) {
      await page.goto('http://127.0.0.1:8765/carousel.html?fmt=' + fmt);
      const dur = DURS[n] || await page.evaluate(n => window.load(n), n);
      if (DURS[n]) await page.evaluate(n => window.load(n), n);
      const el = await page.$('#canvas');
      const name = 'slide-' + String(n).padStart(2, '0');
      if (MODE === 'stills') {
        await page.evaluate(t => window.seek(t), dur);
        await el.screenshot({ path: path.join(outDir, name + '.png') });
        console.log(fmt, name, 'png');
      } else {
        const dir = path.join(FRAMES, fmt + '-' + n);
        fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
        const total = Math.round(dur * FPS);
        for (let f = 0; f < total; f++) {
          await page.evaluate(t => window.seek(t), f / FPS);
          await el.screenshot({ path: path.join(dir, String(f).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 94 });
        }
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, '%04d.jpg'),
          '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
          path.join(outDir, name + '.mp4')]);
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(fmt, name, 'mp4', total, 'frames');
      }
    }
    await page.close();
  }
  await browser.close();
  server.close();
})();
