import { ArtStyle, baseInk } from '../types';

/**
 * Tranh Đông Hồ — Vietnamese folk woodblock prints (Bắc Ninh), one style per well-known print.
 * Every variant prints flat colour from one carved block per colour, slightly out of register with the black key
 * block (bản nét) pressed last; pigment sits unevenly on dó paper and the điệp (scallop shell) coating glints
 * through. The variants borrow each print's palette and surface motifs (pig bristles and âm dương swirls, rooster
 * feathers, mouse fur, lotus petals, palm fronds, toad warts, armour scales) and lay them on the ribbons.
 * The protein's shape is never changed into the print's figures: only its colours and textures follow the print.
 */

type RGB = [number, number, number];
interface Print {
  id: string;
  label: string;
  about: string;
  helix: RGB; helixUnder: RGB; strand: RGB; strandUnder: RGB; loop: RGB; loopMark: RGB; accent: RGB; arrow: RGB;
  /** helix motif: 0 comb bristles + belly line, 1 feathers, 2 fur, 3 lotus petals, 4 toad warts, 5 armour scales */
  helixMotif: number;
  /** strand motif: 0 leaf chevrons, 1 dots, 2 trunk rings, 3 wave lines */
  strandMotif: number;
  /** share of helix panels carrying an âm dương swirl */
  swirl: number;
}

const prints: Print[] = [
  {
    id: 'dongho', label: 'Lợn nái (Sow)',
    about: 'Lợn nái / Lợn đàn — the sow and piglets, a wish for abundance: laterite-red bodies with comb-cut bristles and âm dương swirls, verdigris leaf strands, sophora-yellow loops.',
    helix: [0.76, 0.24, 0.15], helixUnder: [0.52, 0.18, 0.12], strand: [0.27, 0.52, 0.38], strandUnder: [0.23, 0.39, 0.40],
    loop: [0.89, 0.71, 0.30], loopMark: [0.76, 0.24, 0.15], accent: [0.89, 0.71, 0.30], arrow: [0.76, 0.24, 0.15],
    helixMotif: 0, strandMotif: 0, swirl: 0.24,
  },
  {
    id: 'dongho-ga', label: 'Gà trống (Rooster)',
    about: 'Gà trống / Gà đàn — the rooster and the hen with chicks, courage and a big family: red and yellow feather rows cut in black, dark green tail-feather strands.',
    helix: [0.80, 0.28, 0.14], helixUnder: [0.90, 0.70, 0.28], strand: [0.16, 0.34, 0.27], strandUnder: [0.11, 0.10, 0.09],
    loop: [0.90, 0.70, 0.28], loopMark: [0.11, 0.10, 0.09], accent: [0.92, 0.74, 0.30], arrow: [0.80, 0.28, 0.14],
    helixMotif: 1, strandMotif: 0, swirl: 0,
  },
  {
    id: 'dongho-chuot', label: 'Đám cưới chuột (Mouse Wedding)',
    about: 'Đám cưới chuột — the mouse wedding procession, a satire of corrupt officials: grey fur-stroked bodies, wedding-red strands with yellow dots, yellow loops.',
    helix: [0.50, 0.47, 0.43], helixUnder: [0.93, 0.88, 0.76], strand: [0.74, 0.22, 0.15], strandUnder: [0.18, 0.26, 0.42],
    loop: [0.89, 0.71, 0.30], loopMark: [0.11, 0.10, 0.09], accent: [0.89, 0.71, 0.30], arrow: [0.89, 0.71, 0.30],
    helixMotif: 2, strandMotif: 1, swirl: 0,
  },
  {
    id: 'dongho-vinhhoa', label: 'Vinh hoa · Phú quý',
    about: 'Vinh hoa / Phú quý — chubby children holding a chicken or a duck, a wish for wealth and status: peach-pink lotus-petal bodies, green pond-wave strands, red loops.',
    helix: [0.93, 0.63, 0.52], helixUnder: [0.30, 0.54, 0.38], strand: [0.30, 0.54, 0.38], strandUnder: [0.18, 0.26, 0.42],
    loop: [0.76, 0.24, 0.15], loopMark: [0.89, 0.71, 0.30], accent: [0.76, 0.24, 0.15], arrow: [0.89, 0.71, 0.30],
    helixMotif: 3, strandMotif: 3, swirl: 0,
  },
  {
    id: 'dongho-dua', label: 'Hứng dừa (Coconuts)',
    about: 'Hứng dừa — catching coconuts, a humorous village scene: palm-green frond helices, ringed brown coconut-trunk strands, red loops.',
    helix: [0.33, 0.55, 0.30], helixUnder: [0.89, 0.71, 0.30], strand: [0.55, 0.36, 0.20], strandUnder: [0.40, 0.25, 0.14],
    loop: [0.76, 0.24, 0.15], loopMark: [0.89, 0.71, 0.30], accent: [0.89, 0.71, 0.30], arrow: [0.33, 0.55, 0.30],
    helixMotif: 1, strandMotif: 2, swirl: 0,
  },
  {
    id: 'dongho-coc', label: 'Thầy đồ cóc (Toad Teacher)',
    about: 'Thầy đồ cóc — the toad teacher and his village school: warty olive toad-skin helices, indigo scholar-robe strands with dots, red loops.',
    helix: [0.50, 0.52, 0.27], helixUnder: [0.89, 0.71, 0.30], strand: [0.18, 0.26, 0.42], strandUnder: [0.11, 0.10, 0.09],
    loop: [0.76, 0.24, 0.15], loopMark: [0.11, 0.10, 0.09], accent: [0.89, 0.71, 0.30], arrow: [0.76, 0.24, 0.15],
    helixMotif: 4, strandMotif: 1, swirl: 0,
  },
  {
    id: 'dongho-batrieu', label: 'Bà Triệu · Hai Bà Trưng',
    about: 'Bà Triệu and Hai Bà Trưng — the heroines riding into battle: red armour-scale helices edged in gold, gold banner strands with wave lines, indigo loops.',
    helix: [0.72, 0.20, 0.14], helixUnder: [0.11, 0.10, 0.09], strand: [0.86, 0.66, 0.22], strandUnder: [0.72, 0.20, 0.14],
    loop: [0.18, 0.26, 0.42], loopMark: [0.89, 0.71, 0.30], accent: [0.92, 0.74, 0.30], arrow: [0.72, 0.20, 0.14],
    helixMotif: 5, strandMotif: 3, swirl: 0.12,
  },
];

const v3 = (c: RGB) => `vec3(${c.map((x) => x.toFixed(3)).join(', ')})`;

function glsl(p: Print): string {
  return /* glsl */ `
// âm dương (taijitu) in a disc of radius R: 1 = black, 0 = paper, -1 = outside
float amduong(vec2 p, float R, float aa){
  float r = length(p);
  if (r > R + aa) return -1.0;
  float h = R * 0.5;
  float d1 = length(p - vec2(0.0, h)), d2 = length(p + vec2(0.0, h));
  float dark = step(0.0, p.x);
  dark = mix(dark, 1.0, 1.0 - sstep(h - aa, h + aa, d1));
  dark = mix(dark, 0.0, 1.0 - sstep(h - aa, h + aa, d2));
  dark = mix(dark, 0.0, 1.0 - sstep(R * 0.13 - aa, R * 0.13 + aa, d1));
  dark = mix(dark, 1.0, 1.0 - sstep(R * 0.13 - aa, R * 0.13 + aa, d2));
  float ring = 1.0 - sstep(R * 0.09 - aa, R * 0.09 + aa, abs(r - R));
  return max(dark, ring);
}
float band(float d, float w, float aa){ return 1.0 - sstep(w, w + aa, d); }
vec3 shadeSurface(Surface s){
  float X = s.phys.x, Y = s.phys.y;
  vec3 diep = lin(vec3(0.95, 0.91, 0.80));   // scallop-shell coated paper
  vec3 than = lin(vec3(0.11, 0.10, 0.09));   // bamboo-leaf charcoal: the key block
  vec3 cH = lin(${v3(p.helix)}), cHU = lin(${v3(p.helixUnder)});
  vec3 cS = lin(${v3(p.strand)}), cSU = lin(${v3(p.strandUnder)});
  vec3 cL = lin(${v3(p.loop)}), cLM = lin(${v3(p.loopMark)});
  vec3 acc = lin(${v3(p.accent)}), cA = lin(${v3(p.arrow)});
  const float HM = ${p.helixMotif.toFixed(1)}, SM = ${p.strandMotif.toFixed(1)}, SWIRL = ${p.swirl.toFixed(3)};
  float aa = 0.06;
  float A = abs(s.across);
  float id = hash11(s.chain * 7.3 + s.seed);
  vec3 c;
  float ink = 1.0;      // how much pigment the block carries here (0 = paper)
  float blk = 0.0;      // black key-block cuts printed over the colour

  if (abs(s.faceY) < 0.45) {
    c = than;
  } else if (s.ss > 1.5) {
    if (s.faceY >= 0.0) {
      c = s.arrow > 0.5 ? cA : cS;
      float m = 0.0;
      if (SM < 0.5) {          // leaf: chevron veins and a midrib
        float v = abs(fract(X / 1.15 - 0.42 * abs(Y) + id) - 0.5);
        m = max(band(v, 0.07, aa) * sstep(0.12, 0.2, abs(Y)), band(abs(Y), 0.07, aa));
      } else if (SM < 1.5) {   // dots in staggered rows
        m = band(length(fract(vec2(X / 0.9, Y / 0.9 + 0.5 * floor(X / 0.9))) - 0.5), 0.17, aa * 1.5);
      } else if (SM < 2.5) {   // trunk rings, a little uneven, with short black bark strokes
        float r = abs(fract(X / 0.8 + 0.12 * sin(Y * 3.0 + id * 6.0)) - 0.5);
        m = band(r, 0.08, aa);
        blk = max(blk, band(abs(fract(X / 0.8 + 0.5) - 0.5), 0.03, aa) * step(0.35, fract(Y * 1.7 + floor(X / 0.8) * 0.37)) * 0.8);
      } else {                 // wave lines: water or banner folds
        float wv = abs(fract(Y * 1.6 + 0.22 * sin(X * 1.8 + id * 6.0)) - 0.5);
        m = band(wv, 0.08, aa);
      }
      c = mix(c, acc, m * (1.0 - s.arrow));
    } else {
      c = cSU;
      float dots = band(length(fract(vec2(X, Y + 0.5 * floor(X))) - 0.5), 0.16, aa);
      c = mix(c, diep, dots * 0.9);
    }
  } else if (s.ss > 0.5) {
    if (s.faceY >= 0.0) {
      c = cH;
      float cell = 3.6;
      float pid = floor(X / cell);
      float h = hash11(pid * 1.37 + s.seed * 2.1 + s.chain * 5.0);
      vec2 q = vec2((fract(X / cell) - 0.5) * cell, Y);
      float ad = h < SWIRL ? amduong(q, 1.2, aa) : -1.0;
      if (ad >= 0.0) {
        c = mix(diep, than, ad);
      } else if (HM < 0.5) {   // pig: comb bristles cut from both edges, belly line
        float sl = fract(X / 0.62 + 0.55 * A * sign(s.across) + id);
        blk = max(blk, band(abs(sl - 0.5), 0.10 * A + 0.01, aa) * sstep(0.40, 0.55, A));
        c = mix(c, acc, band(abs(s.across), 0.09, aa));
      } else if (HM < 1.5) {   // feathers / fronds: overlapping rows of rounded scales, each with a black quill
        float row = floor(X / 0.9);
        vec2 f = vec2(fract(X / 0.9), fract(Y / 0.9 + 0.5 * mod(row, 2.0))) - vec2(0.0, 0.5);
        float d = length(vec2(f.x * 1.2, f.y));
        float edge = band(abs(d - 0.52), 0.05, aa);
        c = mix(c, acc, sstep(0.55, 0.62, f.x) * 0.55);
        blk = max(blk, edge * 0.95);
        blk = max(blk, band(abs(f.y), 0.035, aa) * sstep(0.15, 0.3, f.x) * (1.0 - sstep(0.45, 0.5, f.x)) * 0.8);
      } else if (HM < 2.5) {   // fur: short dense strokes slanting back, darker along the spine
        vec2 g = vec2(X * 3.2 + Y * 1.1, Y * 2.2);
        vec2 gi = floor(g);
        vec2 gf = fract(g) - 0.5;
        float r = hash12(gi + id);
        float st = band(abs(gf.x + (r - 0.5) * 0.3), 0.06, 0.05) * band(abs(gf.y), 0.32, 0.08);
        blk = max(blk, st * step(0.35, r) * 0.75);
        c = mix(c, c * 0.72, sstep(0.55, 0.9, 1.0 - A));
      } else if (HM < 3.5) {   // lotus petals: pointed petals pointing along the chain, with deeper tips
        float px = fract(X / 1.6 + id), py = Y / 1.4;
        float petal = abs(py) - 0.55 * sin(3.14159 * px);
        float inside = 1.0 - sstep(-aa, aa, petal);
        c = mix(acc, cH, inside);
        c = mix(c, mix(cH, acc, 0.45), inside * sstep(0.6, 0.95, px));
        blk = max(blk, band(abs(petal), 0.04, aa) * 0.85);
      } else if (HM < 4.5) {   // toad warts: raised dots, pale with a dark ring, scattered irregularly
        vec2 g = vec2(X, Y) / 0.75;
        vec2 gi = floor(g);
        vec2 o = hash22(gi + id * 13.0) * 0.5 + 0.25;
        float d = length(fract(g) - o) * 0.75;
        float rr = 0.10 + 0.12 * hash12(gi + 3.0);
        c = mix(c, acc, band(d, rr, aa) * 0.85);
        blk = max(blk, band(abs(d - rr - 0.03), 0.025, aa) * 0.8);
        c = mix(c, c * 0.7, sstep(0.55, 0.85, vnoise2(vec2(X, Y) * 0.8 + id)));
      } else {                 // armour: lamellar scales in staggered rows, gold edged
        float row = floor(Y / 0.55);
        vec2 f = vec2(fract(X / 0.7 + 0.5 * mod(row, 2.0)), fract(Y / 0.55));
        float e = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
        c = mix(acc, c, sstep(0.08, 0.14, e));
        blk = max(blk, band(e, 0.035, aa) * 0.9);
      }
    } else {
      c = cHU;
      float sl = abs(fract(X / 0.5 + id) - 0.5);
      c = mix(c, acc, band(sl, 0.07, aa) * sstep(0.55, 0.7, A) * (HM == 0.0 ? 1.0 : 0.6));
    }
  } else {
    c = cL;
    float tw = abs(fract(X / 2.6 + id) - 0.5);
    c = mix(c, cLM, band(tw, 0.05, aa) * 0.85);
  }

  // printed by hand: the block carries pigment unevenly, wood grain and paper tooth show through
  float grain = fbm2(vec2(X * 0.16 + s.seed, Y * 5.0 + s.chain));
  c *= 0.86 + 0.24 * grain;
  float thin = sstep(0.60, 0.80, fbm2(s.canvas * 0.55 + vec2(s.seed * 3.1, 1.7)));
  float pits = sstep(0.80, 0.86, vnoise2(s.canvas * 6.0 + 11.0));
  ink *= 1.0 - 0.45 * thin - 0.5 * pits;
  // điệp: the shell coating glitters where pigment is thin, more strongly towards the light
  float glint = sstep(0.86, 0.94, vnoise2(s.canvas * 11.0 + 3.0)) * (0.3 + 0.7 * lambert(s.n));
  vec3 paper = diep + vec3(0.18, 0.17, 0.15) * glint;
  c = mix(paper, c, clamp(ink, 0.0, 1.0));
  c = mix(c, c + vec3(0.08, 0.08, 0.07) * glint, 0.5 * (1.0 - ink));
  // key block printed last, it sits on top of everything
  c = mix(c, than, clamp(blk, 0.0, 1.0) * (0.92 + 0.08 * grain));
  return c;
}`;
}

function makeStyle(p: Print): ArtStyle {
  return {
    id: p.id,
    label: p.label,
    technique: `${p.about} Printed as a Đông Hồ woodblock: flat natural pigments out of register under a thick charcoal key line, on shimmering điệp paper.`,
    mesh: 'smooth',
    ribbon: { helixWidth: 3.2, helixThickness: 0.28, strandWidth: 2.9, strandThickness: 0.3, arrowWidth: 4.4, coilWidth: 1.15, coilThickness: 0.3, coilFlatness: 7, flatness: 12 },
    art: {
      note: 'folk print: every element lies flat in the picture plane and swells into the round, plump forms of the Đông Hồ figures; helices become fat rounded bodies, strands broad leaves, loops curl like the tails and whiskers.',
      ribbon: { smooth: { helix: 8, strand: 4, coil: 4 }, face: 'all', curl: { radius: 3.4, turns: 1.25 }, outline: { strand: { kind: 'brush', amount: 0.5 } }, helixWidth: 5.6, strandWidth: 4.4, coilWidth: 1.1 },
    },
    surfaceGLSL: glsl(p),
    ink: { ...baseInk, color: [0.11, 0.1, 0.09], color2: [0.16, 0.13, 0.11], width: 3.6, widthVar: 0.22, wobble: 0.25, softness: 0.4, frequency: 0.7, misregister: [1.8, -1.2], breaks: 0.03 },
  };
}

export const donghoStyles: ArtStyle[] = prints.map(makeStyle);
export const donghoStyle = donghoStyles[0];
