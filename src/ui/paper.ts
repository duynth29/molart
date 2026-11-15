/**
 * Print a finished render onto giấy điệp — dó paper brushed with crushed scallop shell — and frame it
 * like a Đông Hồ print. The render is on white, so multiplying it by the paper leaves the pigment and turns
 * every unprinted (white) area into paper. Deterministic for a given seed. Same look as scripts/dongho_paper.py.
 */

function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth value noise over the image: a coarse random grid, sampled with smoothstep-bilinear interpolation. */
function grid(gw: number, gh: number, r: () => number) {
  gw = Math.max(2, Math.round(gw));
  gh = Math.max(2, Math.round(gh));
  const g = new Float32Array(gw * gh);
  for (let i = 0; i < g.length; i++) g[i] = r();
  return (u: number, v: number) => {
    const x = u * (gw - 1), y = v * (gh - 1);
    const x0 = Math.min(gw - 2, Math.floor(x)), y0 = Math.min(gh - 2, Math.floor(y));
    let fx = x - x0, fy = y - y0;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    const i = y0 * gw + x0;
    const a = g[i] + (g[i + 1] - g[i]) * fx;
    const b = g[i + gw] + (g[i + gw + 1] - g[i + gw]) * fx;
    return a + (b - a) * fy;
  };
}

/** Multiply `px` (opaque RGBA, top row first) onto điệp paper and draw the printed frame, in place. */
export function printOnPaper(px: Uint8ClampedArray, w: number, h: number, seed = 7, frame = true): void {
  const r = rng(seed * 2654435761 + 7);
  const s = Math.min(w, h);
  // features are sized relative to the picture, so every export size looks the same
  const big = grid(w / (s / 9), h / (s / 9), r);           // slow tone changes across the sheet
  const mid = grid(w / (s / 35), h / (s / 35), r);
  const fine = grid(w / (s / 175), h / (s / 175), r);
  const brush = grid(w / (s / 15), h / (s / 15), r);       // broad strokes of the shell coating
  const fibre = grid(w / (s / 230), h / (s / 470), r);     // dó bark fibres: short horizontal streaks
  const base = [0.95, 0.9, 0.79];
  const flecksPer = 0.012 * (1400 / s) * (1400 / s);       // same number of glints at every size
  const fleckR = Math.max(1, s / 1400);
  for (let y = 0; y < h; y++) {
    const v = y / (h - 1);
    for (let x = 0; x < w; x++) {
      const u = x / (w - 1);
      const tone = 0.62 * big(u, v) + 0.3 * mid(u, v) + 0.08 * fine(u, v);
      const b = brush(u, v);
      const f = 1 - 0.05 * Math.min(1, Math.max(0, (fibre(u, v) - 0.6) * 4));
      const k = (0.93 + 0.09 * tone) * f;
      const add = 0.035 * b;
      const i = (y * w + x) * 4;
      px[i] = px[i] * Math.min(1, base[0] * k + add);
      px[i + 1] = px[i + 1] * Math.min(1, base[1] * k + add * 0.98);
      px[i + 2] = px[i + 2] * Math.min(1, base[2] * k + add * 0.95);
    }
  }
  // điệp glints: tiny bright flecks of shell, also catching the light through thin pigment
  const n = Math.round(w * h * flecksPer);
  for (let k = 0; k < n; k++) {
    const cx = r() * w, cy = r() * h, a = 0.18 + 0.3 * r() * (0.4 + 0.6 * brush(cx / w, cy / h));
    const R = fleckR * (0.6 + 0.6 * r());
    const x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(w - 1, Math.ceil(cx + R));
    const y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(h - 1, Math.ceil(cy + R));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / R;
        if (d >= 1) continue;
        const t = a * (1 - d * d), i = (y * w + x) * 4;
        px[i] += (255 - px[i]) * t;
        px[i + 1] += (250 - px[i + 1]) * t;
        px[i + 2] += (240 - px[i + 2]) * t;
      }
  }
  if (!frame) return;
  // the printed border: a bold outer rule and a thin inner one, in the key block's charcoal
  const ink = [28, 26, 23];
  const t = Math.max(3, Math.round(s / 220));
  const rect = (x0: number, y0: number, x1: number, y1: number) => {
    for (let y = Math.max(0, y0); y < Math.min(h, y1); y++)
      for (let x = Math.max(0, x0); x < Math.min(w, x1); x++) {
        const i = (y * w + x) * 4;
        px[i] = ink[0]; px[i + 1] = ink[1]; px[i + 2] = ink[2];
      }
  };
  const m1 = Math.round(s / 22), m2 = m1 + 3 * t;
  for (const [m, th] of [[m1, 2 * t], [m2, t]]) {
    rect(m, m, w - m, m + th);
    rect(m, h - m - th, w - m, h - m);
    rect(m, m, m + th, h - m);
    rect(w - m - th, m, w - m, h - m);
  }
}
