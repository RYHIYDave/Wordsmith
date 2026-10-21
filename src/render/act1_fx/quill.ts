// ACT 2, THE HUSH: FLOOR 13'S DOUBLE BOSS: THE QUILL: what it does to the floor, drawn (render/act1_fx/types.ts), where its
// rules put it (game/act1_rules/quill.ts), in the art chat's own pictures of them (art/pair_shots.ts), which are its hit
// areas: through its stab's warning, the ring where its nib will go in, and the splash it leaves; ITS INK LINES, each laid
// across the floor as its neck whips across, lying wet and burning pink, then bursting in a wall of ink, drying away. Its
// flight, its writing on the Scraper and its swoop are its own pictures (the Scraper's back written over: act1_fx/scraper.ts).

import { LINE_BURST_AFTER, drawInkLine, drawStab, drawStabWarn } from '../../art/pair_shots';
import { QL_STAB, STAB_AT } from '../../art/quill';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
/** When a line not to burst stops being drawn: its stroke and its wait (art/pair_shots.ts LINE_STROKE, LINE_BURST_AFTER). */
const LINE_DRY_FROM = 0.22 + LINE_BURST_AFTER;

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      const act = m.act;
      if (!act || m.state !== 'act') return;
      if (act.id === 'quill:stab' && act.t < QL_STAB.hit) drawStabWarn(g, c.at, m.x, m.y, m.fx, m.fy, STAB_AT, Math.max(0.02, clamp01((act.t - 0.04) / (QL_STAB.hit - 0.04))));
      return;
    }
    if (!p) return;
    if (p.a1 === 'quill:stab') drawStab(g, c.at, p.x, p.y, p.fx, p.fy, STAB_AT, p.t);
    else if (p.a1 === 'quill:line') {
      // (its Quill felled before it burst: it dries where it lies, and does not burst)
      if (p.done === 2 && p.t > LINE_DRY_FROM) return;
      drawInkLine(g, c.at, p.x, p.y, p.fx, p.fy, p.c, p.t);
    }
  },
};
