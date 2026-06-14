export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type MarginPreset = 'none' | 'narrow' | 'normal' | 'wide' | 'custom';

export type PageSizeKey = 'a4' | 'letter' | 'legal' | 'a3' | 'a5' | 'b5';

export type Orientation = 'portrait' | 'landscape';
export type ContentFit = 'scale' | 'paper';

export interface PageConfig {
  pageSize: PageSizeKey;
  orientation: Orientation;
  marginPreset: MarginPreset;
  margins: Margins;
  fileName: string;
  contentScale: number; // 0.5 = 50%, 1 = 100%, 2 = 200%
  contentFit: ContentFit;
}

// Page sizes in mm [width, height] in portrait
export const PAGE_SIZES: Record<PageSizeKey, { width: number; height: number; label: string }> = {
  a3: { width: 297, height: 420, label: 'A3 — 297 × 420 mm' },
  a4: { width: 210, height: 297, label: 'A4 — 210 × 297 mm' },
  a5: { width: 148, height: 210, label: 'A5 — 148 × 210 mm' },
  b5: { width: 176, height: 250, label: 'B5 — 176 × 250 mm' },
  letter: { width: 215.9, height: 279.4, label: 'Letter — 8.5 × 11 in' },
  legal: { width: 215.9, height: 355.6, label: 'Legal — 8.5 × 14 in' },
};

export const MARGIN_PRESETS: Record<Exclude<MarginPreset, 'custom'>, Margins> = {
  none: { top: 0, right: 0, bottom: 0, left: 0 },
  narrow: { top: 6.35, right: 6.35, bottom: 6.35, left: 6.35 },
  normal: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 },
  wide: { top: 25.4, right: 50.8, bottom: 25.4, left: 50.8 },
};

export function getPageDimensions(config: PageConfig) {
  const size = PAGE_SIZES[config.pageSize];
  const w = config.orientation === 'landscape' ? size.height : size.width;
  const h = config.orientation === 'landscape' ? size.width : size.height;
  return { width: w, height: h };
}
