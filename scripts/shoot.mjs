// Dev helper: render styles for a structure with the Vite dev server (no build needed).
// usage: node scripts/shoot.mjs <structure file> <outdir> <size> <style,style,...> [seed] [deform] [camera.json]
import { createServer } from 'vite';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { launch } from '../cli/browser.mjs';

const [file, outDir = 'outputs/dev', size = '1200', styles = 'dongho', seed = '7', deform = '0', camFile] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const server = await createServer({ logLevel: 'error', server: { port: 0 } });
await server.listen();
const url = server.resolvedUrls.local[0];
const { browser, page, errors } = await launch();
try {
  await page.goto(`${url}?empty=1`);
  await page.waitForFunction(() => !!window.molart, null, { timeout: 60000 });
  console.log('GL:', await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  }));
  const info = await page.evaluate(([t, n]) => window.molart.loadText(t, n), [readFileSync(file, 'utf8'), basename(file)]);
  console.log(JSON.stringify(info));
  await page.evaluate(([s, d]) => { window.molart.setSeed(s); window.molart.setDeform(d); }, [parseInt(seed, 10), parseFloat(deform)]);
  if (process.env.CHAINS) await page.evaluate((c) => window.molart.frameChains(c.split(',')), process.env.CHAINS);
  if (camFile) await page.evaluate((c) => window.molart.setCamera(c), JSON.parse(readFileSync(camFile, 'utf8')));
  if (process.env.INK) await page.evaluate((o) => window.molart.setInkOverride(o), JSON.parse(process.env.INK));
  if (process.env.ART) await page.evaluate(() => window.molart.setArtMode(true));
  const n = parseInt(size, 10);
  for (const st of styles.split(',')) {
    const t0 = Date.now();
    await page.evaluate((s) => window.molart.setStyle(s), st);
    const b64 = await page.evaluate(([w]) => window.molart.exportPNGBase64(w, w), [n]);
    const out = join(outDir, `${info.id}-${st}.png`);
    writeFileSync(out, Buffer.from(b64, 'base64'));
    console.log(out, `${Date.now() - t0}ms`);
  }
  if (errors.length) console.log('PAGE ERRORS:\n' + errors.join('\n'));
} finally {
  await browser.close();
  await server.close();
}
