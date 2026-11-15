/**
 * Text printed on the exported picture, the way Đông Hồ prints carry a title or verse: across the top, along
 * the bottom, or as a vertical column (one word per line) in the upper right. The text is printed from its own
 * "block": charcoal or laterite red, multiplied into the paper, with the same uneven ink as the picture.
 */

export type CaptionPosition = 'top' | 'bottom' | 'side';
export type CaptionFont = 'sign' | 'serif' | 'brush';
export type CaptionColor = 'black' | 'red';

export interface Caption {
  text: string;
  /** print the structure's PDB ID instead of `text` (the default, until the user types their own) */
  auto: boolean;
  position: CaptionPosition;
  font: CaptionFont;
  color: CaptionColor;
}

export const defaultCaption: Caption = { text: '', auto: true, position: 'top', font: 'sign', color: 'black' };

const FAMILY: Record<CaptionFont, string> = {
  // rounded, boxy sign-painter capitals in the spirit of VPS Đồng Hới, with full Unicode Vietnamese (SIL OFL)
  sign: '"Bungee", "Chakra Petch", Impact, sans-serif',
  serif: '"Playfair Display", "Noto Serif", Georgia, serif',
  brush: '"Dancing Script", "Brush Script MT", cursive',
};
const WEIGHT: Record<CaptionFont, number> = { sign: 400, serif: 900, brush: 700 };
const INK: Record<CaptionColor, [number, number, number]> = { black: [28, 26, 23], red: [178, 52, 34] };

export function sanitizeCaption(c: unknown): Caption {
  const o = (c && typeof c === 'object' ? c : {}) as Partial<Caption>;
  return {
    text: typeof o.text === 'string' ? o.text.slice(0, 200) : '',
    auto: typeof o.auto === 'boolean' ? o.auto : !o.text,   // older saved settings: keep text someone already typed
    position: o.position === 'bottom' || o.position === 'side' ? o.position : 'top',
    font: o.font === 'brush' || o.font === 'serif' ? o.font : 'sign',
    color: o.color === 'red' ? 'red' : 'black',
  };
}

/** Wait for the caption's web font (with the glyphs this text needs) so the export never falls back mid-way. */
export async function loadCaptionFont(c: Caption): Promise<void> {
  if (!c.text.trim() || typeof document === 'undefined' || !document.fonts) return;
  const fam = FAMILY[c.font].split(',')[0];
  try {
    await Promise.race([document.fonts.load(`${WEIGHT[c.font]} 48px ${fam}`, c.text), new Promise((r) => setTimeout(r, 4000))]);
  } catch {
    /* offline: the fallback font is used */
  }
}

interface Layout { font: string; items: { text: string; x: number; y: number }[]; band: { top: number; bottom: number; right: number } }

/** Where the words go, and how much of the picture they need (px from each edge). */
function layout(g: CanvasRenderingContext2D, w: number, h: number, c: Caption): Layout | null {
  const text = c.text.trim();
  if (!text) return null;
  const s = Math.min(w, h);
  const inner = Math.round(s / 22) + 4 * Math.max(3, Math.round(s / 220));   // inside the printed frame
  const pad = inner + Math.round(s * 0.025);
  const font = (size: number) => `${WEIGHT[c.font]} ${Math.round(size)}px ${FAMILY[c.font]}`;
  const fit = (lines: string[], maxW: number, size: number) => {
    g.font = font(size);
    const widest = Math.max(...lines.map((l) => g.measureText(l).width));
    return widest > maxW ? size * (maxW / widest) : size;
  };
  const band = { top: 0, bottom: 0, right: 0 };
  const items: Layout['items'] = [];
  let size: number;
  if (c.position === 'side') {
    // a column of words down the right side, like the verses beside a Đông Hồ picture
    const words = text.split(/\s+/);
    size = fit(words, s * 0.16, s * 0.05);
    size = Math.min(size, (h - 2 * pad) / (words.length * 1.2));
    g.font = font(size);
    const lh = size * 1.2;
    const colW = Math.max(...words.map((wd) => g.measureText(wd).width));
    const x = w - pad - colW / 2;
    words.forEach((wd, i) => items.push({ text: wd, x, y: pad + lh * 0.5 + i * lh }));
    band.right = pad + colW + s * 0.02;
  } else {
    // across the top or along the bottom, wrapped onto at most two lines
    const maxW = w - 2 * pad;
    let lines = [text];
    size = s * 0.058;
    g.font = font(size);
    if (g.measureText(text).width > maxW * 1.25) {
      const words = text.split(/\s+/);
      let best = 1, bestD = Infinity;
      for (let k = 1; k < words.length; k++) {
        const d = Math.abs(g.measureText(words.slice(0, k).join(' ')).width - g.measureText(words.slice(k).join(' ')).width);
        if (d < bestD) { bestD = d; best = k; }
      }
      lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
    }
    size = fit(lines, maxW, size);
    g.font = font(size);
    const lh = size * 1.2;
    const y0 = c.position === 'top' ? pad + lh * 0.5 : h - pad - lh * (lines.length - 0.5);
    lines.forEach((l, i) => items.push({ text: l, x: w / 2, y: y0 + i * lh }));
    band[c.position] = pad + lh * lines.length + s * 0.01;
  }
  return { font: font(size), items, band };
}

/** Shrink the picture (protein on white) into the space the text leaves free, so the words never cover it. */
export function makeRoom(px: Uint8ClampedArray, w: number, h: number, c: Caption): void {
  const tmp = document.createElement('canvas').getContext('2d')!;
  const L = layout(tmp, w, h, c);
  if (!L) return;
  const s = Math.min(w, h);
  const margin = Math.round(s / 22);               // the frame's own margin: the picture already sits inside it
  const fx0 = 0, fx1 = w - Math.max(0, L.band.right - margin);
  const fy0 = Math.max(0, L.band.top - margin), fy1 = h - Math.max(0, L.band.bottom - margin);
  const k = Math.min((fx1 - fx0) / w, (fy1 - fy0) / h);
  if (k >= 0.999) return;
  const src = document.createElement('canvas');
  src.width = w;
  src.height = h;
  src.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(px), w, h), 0, 0);
  const dst = document.createElement('canvas');
  dst.width = w;
  dst.height = h;
  const g = dst.getContext('2d', { alpha: false })!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, w, h);
  g.imageSmoothingQuality = 'high';
  const dw = w * k, dh = h * k;
  g.drawImage(src, fx0 + (fx1 - fx0 - dw) / 2, fy0 + (fy1 - fy0 - dh) / 2, dw, dh);
  px.set(g.getImageData(0, 0, w, h).data);
}

/** Print the caption into `px` (opaque RGBA, top row first) in place. Call loadCaptionFont first. */
export function drawCaption(px: Uint8ClampedArray, w: number, h: number, c: Caption, seed = 7): void {
  const s = Math.min(w, h);
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  const L = layout(g, w, h, c);
  if (!L) return;
  g.font = L.font;
  g.fillStyle = '#000';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (const it of L.items) g.fillText(it.text, it.x, it.y);
  // print it: the block's ink sits unevenly, with tiny unprinted pits, multiplied into the paper
  const a = g.getImageData(0, 0, w, h).data;
  const ink = INK[c.color];
  let r = (seed * 2654435761 + 99) >>> 0 || 1;
  const rnd = () => ((r = (Math.imul(r ^ (r >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0) / 4294967296);
  const cell = Math.max(2, Math.round(s / 600));
  const cw = Math.ceil(w / cell);
  const pits = new Float32Array(cw * Math.ceil(h / cell));
  for (let i = 0; i < pits.length; i++) pits[i] = rnd();
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const al = a[i + 3] / 255;
      if (al <= 0) continue;
      const p = pits[Math.floor(y / cell) * cw + Math.floor(x / cell)];
      const cov = al * (p > 0.93 ? 0.35 : 0.88 + 0.12 * p);
      px[i] = px[i] * (1 - cov) + (px[i] * ink[0] / 255) * cov;
      px[i + 1] = px[i + 1] * (1 - cov) + (px[i + 1] * ink[1] / 255) * cov;
      px[i + 2] = px[i + 2] * (1 - cov) + (px[i + 2] * ink[2] / 255) * cov;
    }
}
