import { ArtStyle, baseInk } from '../types';

/**
 * Tranh Đông Hồ — Vietnamese folk woodblock print (Bắc Ninh).
 * Flat colour from one carved block per colour, every pigment natural: đỏ son (red laterite) on
 * the helices, xanh đồng (verdigris green) on the strands, vàng hoè (sophora yellow) on loops and
 * helix undersides, chàm (indigo) under the strands. The colour blocks print slightly out of
 * register with the black key block (bản nét, charcoal of burnt bamboo leaves), which is pressed
 * last as a thick, even line. Motifs come from the classic prints: comb-like hair / feather
 * hatching (Lợn nái, Gà trống) cut from the ribbon edges, âm dương swirls on some helix faces, and
 * leaf chevrons on strands. Pigment sits unevenly on the dó paper, and the điệp (crushed scallop
 * shell) coating glints through where the block printed thin.
 */
export const donghoStyle: ArtStyle = {
  id: 'dongho',
  label: 'Đông Hồ painting (Northern Vietnamese traditional art)',
  technique: 'Vietnamese folk woodblock: flat natural pigments (laterite red, sophora yellow, verdigris, indigo) printed out of register, comb hatching and âm dương swirls cut in black, shimmering điệp paper, thick charcoal key-block line.',
  mesh: 'smooth',
  ribbon: { helixWidth: 3.2, helixThickness: 0.28, strandWidth: 2.9, strandThickness: 0.3, arrowWidth: 4.4, coilWidth: 1.15, coilThickness: 0.3, coilFlatness: 7, flatness: 12 },
  art: {
    note: 'folk print: every element lies flat in the picture plane and swells into the round, plump forms of the Đông Hồ animals; helices become fat rounded bodies, strands broad leaves, loops curl like the tails and whiskers.',
    ribbon: { smooth: { helix: 8, strand: 4, coil: 4 }, face: 'all', curl: { radius: 3.4, turns: 1.25 }, outline: { strand: { kind: 'brush', amount: 0.5 } }, helixWidth: 5.6, strandWidth: 4.4, coilWidth: 1.1 },
  },
  surfaceGLSL: /* glsl */ `
// âm dương (taijitu) in a disc of radius R: 1 = black, 0 = paper, -1 = outside
float amduong(vec2 p, float R, float aa){
  float r = length(p);
  if (r > R + aa) return -1.0;
  float h = R * 0.5;
  float d1 = length(p - vec2(0.0, h)), d2 = length(p + vec2(0.0, h));
  float dark = step(0.0, p.x);                                    // one half black
  dark = mix(dark, 1.0, 1.0 - sstep(h - aa, h + aa, d1));         // top lobe black
  dark = mix(dark, 0.0, 1.0 - sstep(h - aa, h + aa, d2));         // bottom lobe paper
  dark = mix(dark, 0.0, 1.0 - sstep(R * 0.13 - aa, R * 0.13 + aa, d1));   // eyes
  dark = mix(dark, 1.0, 1.0 - sstep(R * 0.13 - aa, R * 0.13 + aa, d2));
  float ring = 1.0 - sstep(R * 0.09 - aa, R * 0.09 + aa, abs(r - R)); // carved rim
  return max(dark, ring);
}
vec3 shadeSurface(Surface s){
  float X = s.phys.x, Y = s.phys.y;
  vec3 diep   = lin(vec3(0.95, 0.91, 0.80));   // scallop-shell coated paper
  vec3 son    = lin(vec3(0.76, 0.24, 0.15));   // red laterite (sỏi son)
  vec3 hoe    = lin(vec3(0.89, 0.71, 0.30));   // sophora flower yellow (hoa hoè)
  vec3 dong   = lin(vec3(0.27, 0.52, 0.38));   // verdigris (gỉ đồng)
  vec3 cham   = lin(vec3(0.18, 0.26, 0.42));   // indigo (chàm)
  vec3 than   = lin(vec3(0.11, 0.10, 0.09));   // bamboo-leaf charcoal (than lá tre)
  float aa = 0.06;
  float A = abs(s.across);
  float id = hash11(s.chain * 7.3 + s.seed);
  vec3 c;
  float ink = 1.0;      // how much pigment the block carries here (0 = paper)
  float blk = 0.0;      // black key-block cuts printed over the colour

  if (abs(s.faceY) < 0.45) {
    c = than;                                                     // ribbon edges: key block
  } else if (s.ss > 1.5) {
    // strands: verdigris leaves with yellow chevron veins, indigo underside, red arrow heads
    if (s.faceY >= 0.0) {
      c = s.arrow > 0.5 ? son : dong;
      float v = abs(fract(X / 1.15 - 0.42 * abs(Y) + id) - 0.5);
      float vein = (1.0 - sstep(0.07, 0.07 + aa, v)) * sstep(0.12, 0.2, abs(Y));
      float rib = 1.0 - sstep(0.07, 0.07 + aa, abs(Y));
      c = mix(c, hoe, max(vein, rib) * (1.0 - s.arrow));
    } else {
      c = mix(dong, cham, 0.45);
      float dots = 1.0 - sstep(0.16, 0.16 + aa, length(fract(vec2(X / 1.0, Y / 1.0 + 0.5 * floor(X))) - 0.5));
      c = mix(c, diep, dots * 0.9);                               // scattered white rice-grain dots
    }
  } else if (s.ss > 0.5) {
    if (s.faceY >= 0.0) {
      // helices: red body; comb hatching cut from both edges like the hair of the Lợn nái / feathers of Gà trống
      c = son;
      float cell = 3.6;
      float pid = floor(X / cell);
      float h = hash11(pid * 1.37 + s.seed * 2.1 + s.chain * 5.0);
      vec2 q = vec2((fract(X / cell) - 0.5) * cell, Y);
      float R = 1.2;
      float ad = h < 0.24 ? amduong(q, R, aa) : -1.0;
      if (ad >= 0.0) {
        c = mix(diep, than, ad);
        ink = 1.0;
      } else {
        float sl = fract(X / 0.62 + 0.55 * A * sign(s.across) + id);
        float hair = (1.0 - sstep(0.10 * A + 0.01, 0.10 * A + 0.01 + aa, abs(sl - 0.5))) * sstep(0.40, 0.55, A);
        blk = max(blk, hair);
        // a thin yellow band down the middle, like the belly line of the printed animals
        c = mix(c, hoe, 1.0 - sstep(0.09, 0.09 + aa, abs(s.across)));
      }
    } else {
      // underside: sophora yellow with fine black comb strokes
      c = mix(son, than, 0.35);
      float sl = abs(fract(X / 0.5 + id) - 0.5);
      c = mix(c, hoe, (1.0 - sstep(0.07, 0.07 + aa, sl)) * sstep(0.55, 0.7, A));
    }
  } else {
    // loops: yellow cord with a red twist every few Å
    c = hoe;
    float tw = abs(fract(X / 2.6 + id) - 0.5);
    c = mix(c, son, (1.0 - sstep(0.05, 0.05 + aa, tw)) * 0.85);
  }

  // printed by hand: the block carries pigment unevenly, wood grain and paper tooth show through
  float grain = fbm2(vec2(X * 0.16 + s.seed, Y * 5.0 + s.chain));
  c *= 0.86 + 0.24 * grain;
  float thin = sstep(0.60, 0.80, fbm2(s.canvas * 0.55 + vec2(s.seed * 3.1, 1.7)));
  float pits = sstep(0.80, 0.86, vnoise2(s.canvas * 6.0 + 11.0));    // small unprinted pits, soft-edged
  ink *= 1.0 - 0.45 * thin - 0.5 * pits;
  // điệp: the shell coating glitters where pigment is thin, more strongly towards the light
  float glint = sstep(0.86, 0.94, vnoise2(s.canvas * 11.0 + 3.0)) * (0.3 + 0.7 * lambert(s.n));
  vec3 paper = diep + vec3(0.18, 0.17, 0.15) * glint;
  c = mix(paper, c, clamp(ink, 0.0, 1.0));
  c = mix(c, c + vec3(0.08, 0.08, 0.07) * glint, 0.5 * (1.0 - ink));
  // key block printed last, it sits on top of everything
  c = mix(c, than, clamp(blk, 0.0, 1.0) * (0.92 + 0.08 * grain));
  return c;
}`,
  ink: { ...baseInk, color: [0.11, 0.1, 0.09], color2: [0.16, 0.13, 0.11], width: 3.6, widthVar: 0.22, wobble: 0.25, softness: 0.4, frequency: 0.7, misregister: [1.8, -1.2], breaks: 0.03 },
};
