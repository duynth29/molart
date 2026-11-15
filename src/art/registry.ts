import type { ArtStyle } from './types';
import { normalStyle } from './normal';
import { schieleStyle } from './schiele';
import { picassoStyle } from './picasso';
import { klimtStyle } from './klimt';
import { vanGoghStyle } from './vangogh';
import { daliStyle } from './dali';
import { monetStyle } from './monet';
import { hokusaiStyle } from './hokusai';
import { okeeffeStyle } from './okeeffe';
import { warholStyle } from './warhol';
import { pollockStyle } from './pollock';
import { kandinskyStyle } from './kandinsky';
import { matisseStyle } from './matisse';
import { mondrianStyle } from './mondrian';
import { sumieStyle } from './sumie';
import { davinciStyle } from './davinci';
import { glassStyle } from './glass';
import { asciiFoldStyle } from './asciifold';
import { toonStyle } from './toon';
import { surfaceStyle } from './surface';
import { frostedStyle } from './frosted';
import { donghoStyle } from './dongho';

/** Style registry. To add a style: create src/art/<name>/index.ts exporting an ArtStyle and register it here. */
const styles: ArtStyle[] = [
  normalStyle, schieleStyle, picassoStyle, klimtStyle, vanGoghStyle, daliStyle,
  monetStyle, hokusaiStyle, okeeffeStyle, warholStyle, pollockStyle, kandinskyStyle, matisseStyle, mondrianStyle, sumieStyle, davinciStyle, glassStyle, asciiFoldStyle, toonStyle, surfaceStyle, frostedStyle, donghoStyle,
];

export function registerStyle(s: ArtStyle) {
  const i = styles.findIndex((x) => x.id === s.id);
  if (i >= 0) styles[i] = s;
  else styles.push(s);
}
export const allStyles = (): readonly ArtStyle[] => styles;
export function getStyle(id: string): ArtStyle {
  const s = styles.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown style "${id}". Available: ${styles.map((x) => x.id).join(', ')}`);
  return s;
}
