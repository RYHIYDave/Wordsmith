// THE GODOT PORT: THE START SCREEN'S PICTURE (art/title_ring.ts, THE RING ON THE HILL), painted here by the game's own art in a page
// (tools/godot_title.mjs runs it): its still, the picture as it stands before its first surge (makeRingTitle's `still`, life(0)),
// handed over as RGBA.
import { makeRingTitle } from '../../src/art/title_ring';

declare global {
  interface Window {
    ringStill: () => { w: number; h: number; rgba: string };
  }
}

window.ringStill = () => {
  const r = makeRingTitle();
  const g = r.still.getContext('2d') as CanvasRenderingContext2D;
  const d = g.getImageData(0, 0, r.w, r.h).data;
  let s = '';
  for (let i = 0; i < d.length; i += 0x8000) s += String.fromCharCode(...d.subarray(i, i + 0x8000));
  return { w: r.w, h: r.h, rgba: btoa(s) };
};
