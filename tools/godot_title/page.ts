// THE GODOT PORT: THE START SCREEN'S PICTURE (art/title_ring.ts, THE RING ON THE HILL), painted here by the game's own art in a page
// (tools/godot_title.mjs runs it), handed over as RGBA: its still (makeRingTitle's `still`, life(0)); the layers it is laid up from
// and what its life is drawn with (ringPort); and the picture whole at a few moments of its life, with its flash (life(t), flash(t)),
// for the port's own to be held to.
import { makeRingTitle, ringPort } from '../../src/art/title_ring';

declare global {
  interface Window {
    ringStill: () => { w: number; h: number; rgba: string };
    ringLayers: () => { layers: Record<string, { w: number; h: number; rgba: string }>; data: Record<string, unknown> };
    ringLife: (ts: number[]) => { t: number; w: number; h: number; rgba: string; flash: readonly [string, number] }[];
  }
}

const rgbaOf = (cv: HTMLCanvasElement): { w: number; h: number; rgba: string } => {
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  const d = g.getImageData(0, 0, cv.width, cv.height).data;
  let s = '';
  for (let i = 0; i < d.length; i += 0x8000) s += String.fromCharCode(...d.subarray(i, i + 0x8000));
  return { w: cv.width, h: cv.height, rgba: btoa(s) };
};

window.ringStill = () => rgbaOf(makeRingTitle().still);

window.ringLayers = () => {
  const p = ringPort();
  const layers: Record<string, { w: number; h: number; rgba: string }> = {};
  for (const k of Object.keys(p.layers)) layers[k] = rgbaOf(p.layers[k]);
  return { layers, data: p.data };
};

window.ringLife = (ts: number[]) => {
  const r = makeRingTitle();
  return ts.map((t) => ({ t, ...rgbaOf(r.life(t)), flash: r.flash(t) }));
};
