#!/usr/bin/env node
// Render the frames for a vertical promo video: one framed print per Đông Hồ style (top half) and the same
// protein spinning in that style (bottom half). Composed into a video by scripts/promo_compose.py.
//
// usage: node scripts/promo.mjs [structure.cif] [out-dir] [--fps 30] [--seconds 15] [--turns 2]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { launch, openApp, serveStatic } from '../cli/browser.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 ? argv[i + 1] : d;
};
const flags = new Set(["--test", "--rendered-top"]);
const pos = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--") && !flags.has(argv[i - 1])));
const file = resolve(pos[0] ?? join(ROOT, 'public/samples/1TIM.cif'));
const out = resolve(pos[1] ?? join(ROOT, 'out/promo'));
const fps = parseInt(opt('fps', '30'), 10);
const seconds = parseFloat(opt('seconds', '15'));
const turns = parseFloat(opt('turns', '1'));
// --test: render only the middle frame of each print, to check the look quickly
const test = argv.includes('--test');
const W = 1080, HALF = 960;
const N = Math.round(fps * seconds);

if (!existsSync(join(ROOT, 'dist/index.html'))) execSync('npx vite build --logLevel error', { cwd: ROOT, stdio: 'inherit' });
mkdirSync(join(out, 'bottom'), { recursive: true });

// rotate p about the axis u (unit) by angle a (Rodrigues)
function rotate(p, u, a) {
  const c = Math.cos(a), s = Math.sin(a), d = p[0] * u[0] + p[1] * u[1] + p[2] * u[2];
  const x = [u[1] * p[2] - u[2] * p[1], u[2] * p[0] - u[0] * p[2], u[0] * p[1] - u[1] * p[0]];
  return [0, 1, 2].map((i) => p[i] * c + x[i] * s + u[i] * d * (1 - c));
}

const server = await serveStatic(join(ROOT, 'dist'));
const { browser, page, errors } = await launch();
try {
  await openApp(page, server.url);
  await page.evaluate(([t, n]) => window.molart.loadText(t, n), [readFileSync(file, 'utf8'), basename(file)]);
  await page.evaluate(() => { window.molart.setSeed(7); window.molart.setArtMode(false); window.molart.resetCamera(); });
  const styles = await page.evaluate(() => window.molart.styles());
  const cam0 = await page.evaluate(() => window.molart.getCamera());
  const segs = styles.map((s, i) => ({ id: s.id, label: s.label, from: Math.round((i * N) / styles.length), to: Math.round(((i + 1) * N) / styles.length) }));

  // top (optional, --rendered-top): the protein printed in each style; by default the top half shows the original prints
  for (const [i, s] of (argv.includes('--rendered-top') ? segs : []).entries()) {
    const title = s.label.replace(/\s*\(.*\)\s*$/, '');
    await page.evaluate(([id, t]) => { window.molart.setStyle(id); window.molart.setCaption({ text: t, auto: false, position: 'top', font: 'lactu', color: 'black' }); }, [s.id, title]);
    await page.evaluate((c) => window.molart.setCamera(c), cam0);
    const b64 = await page.evaluate(([w, h]) => window.molart.exportPNGBase64(w, h, true), [W, HALF]);
    writeFileSync(join(out, `top_${i}.png`), Buffer.from(b64, 'base64'));
    console.log(`top ${i + 1}/${segs.length} ${title}`);
  }

  // bottom: the protein turning about its up axis, in the style of the current segment, on white (paper added later)
  await page.evaluate(() => window.molart.setCaption({ text: '', auto: false }));
  const up = cam0.up, len = Math.hypot(...up), u = up.map((x) => x / len);
  const rel = [0, 1, 2].map((k) => cam0.position[k] - cam0.target[k]);
  let current = '';
  const t0 = Date.now();
  const frames = test ? segs.map((s) => Math.floor((s.from + s.to) / 2)) : [...Array(N).keys()];
  for (const f of frames) {
    const seg = segs.find((s) => f >= s.from && f < s.to);
    if (seg.id !== current) {
      await page.evaluate((id) => window.molart.setStyle(id), seg.id);
      current = seg.id;
    }
    // steady turn: a whole number of turns, so the video loops seamlessly on Instagram
    const a = (2 * Math.PI * turns * f) / N;
    const p = rotate(rel, u, a);
    await page.evaluate((c) => window.molart.setCamera(c), { ...cam0, position: [0, 1, 2].map((k) => cam0.target[k] + p[k]) });
    const b64 = await page.evaluate(([w, h]) => window.molart.exportPNGBase64(w, h, false), [W, HALF]);
    writeFileSync(join(out, 'bottom', `${String(f).padStart(4, '0')}.png`), Buffer.from(b64, 'base64'));
    if (f % 30 === 0) console.log(`bottom ${f}/${N} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  writeFileSync(join(out, 'segments.json'), JSON.stringify({ fps, frames: N, test, segments: segs, structure: basename(file) }, null, 2));
  if (errors.length) throw new Error('Browser errors:\n' + errors.join('\n'));
} finally {
  await browser.close();
  server.close();
}
