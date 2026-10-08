// Dev-only helper for previewing art: lays sprites out on a dark sheet, scaled up, with labels.
// Used by the src/dev/preview_*.ts entries via `node tools/preview.mjs`.

import type { Sprite } from '../engine/px';

export interface SheetItem {
  label: string;
  sprite?: Sprite;
  /** Several sprites drawn side by side under one label (e.g. animation frames). */
  frames?: Sprite[];
}

export interface SheetOptions {
  scale?: number;
  background?: string;
  /** Page width in CSS pixels. */
  width?: number;
  title?: string;
}

/** Draw a labelled sprite sheet into the page and flag the page as ready for a screenshot. */
export function showSheet(items: SheetItem[], opts: SheetOptions = {}): HTMLCanvasElement {
  const scale = opts.scale ?? 4;
  const width = opts.width ?? 960;
  const pad = 12;
  const labelH = 14;
  // layout pass
  let x = pad;
  let y = pad + (opts.title ? 22 : 0);
  let rowH = 0;
  const placed: { item: SheetItem; x: number; y: number; w: number; h: number }[] = [];
  for (const item of items) {
    const frames = item.frames ?? (item.sprite ? [item.sprite] : []);
    const w = Math.max(60, frames.reduce((a, f) => a + f.w * scale + 4, 0));
    const h = frames.reduce((a, f) => Math.max(a, f.h * scale), 0) + labelH;
    if (x + w > width - pad) {
      x = pad;
      y += rowH + pad;
      rowH = 0;
    }
    placed.push({ item, x, y, w, h });
    x += w + pad;
    rowH = Math.max(rowH, h);
  }
  const height = y + rowH + pad;
  const cv = document.createElement('canvas');
  cv.width = width;
  cv.height = height;
  cv.style.position = 'static';
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  document.body.style.height = 'auto';
  document.body.appendChild(cv);
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.fillStyle = opts.background ?? '#1c1722';
  g.fillRect(0, 0, width, height);
  g.font = '11px monospace';
  g.textBaseline = 'top';
  if (opts.title) {
    g.fillStyle = '#ffe070';
    g.font = 'bold 14px monospace';
    g.fillText(opts.title, pad, pad);
    g.font = '11px monospace';
  }
  for (const p of placed) {
    const frames = p.item.frames ?? (p.item.sprite ? [p.item.sprite] : []);
    let fx = p.x;
    const maxH = frames.reduce((a, f) => Math.max(a, f.h * scale), 0);
    for (const f of frames) {
      // checker backdrop so transparent areas and sprite bounds are visible
      g.fillStyle = '#241d2b';
      g.fillRect(fx, p.y, f.w * scale, f.h * scale);
      g.drawImage(f.img, fx, p.y, f.w * scale, f.h * scale);
      // anchor mark
      g.fillStyle = '#ff00ff';
      g.fillRect(fx + f.ax * scale, p.y + f.ay * scale, Math.max(1, scale / 2), Math.max(1, scale / 2));
      fx += f.w * scale + 4;
    }
    g.fillStyle = '#a89cab';
    g.fillText(p.item.label, p.x, p.y + maxH + 2);
  }
  return cv;
}

/** Call when the page has finished drawing so tools/preview.mjs takes its screenshot. */
export function ready(): void {
  (window as unknown as { __ready: boolean }).__ready = true;
}
