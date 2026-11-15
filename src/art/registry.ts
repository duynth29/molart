import type { ArtStyle } from './types';
import { donghoStyle } from './dongho';

/** Style registry. To add a style: create src/art/<name>/index.ts exporting an ArtStyle and register it here. */
const styles: ArtStyle[] = [donghoStyle];

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
