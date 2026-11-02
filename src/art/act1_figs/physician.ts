// ACT 2, THE HUSH: FLOOR 14'S BOSS: THE PHYSICIAN: his pictures as the game holds a monster (art/act1_figs/types.ts), from the art chat's
// (art/physician.ts, physician_moves.ts, physician_shots.ts): makePhysicianArt(), on the heroes' bones (mobSet, from in front and
// from behind, his stalking stride at its own pace): his stand over his cane, his walk, the rap of his cane (attack), struck
// (reel), his death (die), and in clips.moves the Draw (`draw`), Tonic (`tonic`) and Rounds (`rounds`).
//
// HEAVY, as a boss is: made for his floor, let go of after (art/bestiary.ts HEAVY_FIGURES). His frames are a tall thin man's,
// not a giant's: about 760 of them both ways round, about 17 MB painted (measured off his paintings, every eighth frame of
// every clip, both ways: the descent's three big bosses held about 300 MB each).

import { PHYSICIAN_ON } from '../physician';
import { PHYSICIAN_ACTION, makePhysicianActionArt } from '../physician_action';
import { makePhysicianArt } from '../physician_moves';
import type { Act1Fig } from './types';
import { OPERATION, TOOL_KINDS, layTool } from '../physician_action_fx';
import { toSprite } from '../kit';
import { FLAME } from '../mkit';
import { Px } from '../../engine/px';
import type { Sprite } from '../../engine/px';

export const FIG: Act1Fig | null = {
  // (HIS FIGHT DONE THE ACTION WAY, PHYSICIAN_ACTION: his rap, draw and rounds new, the Diagnosis and his operation in place of the
  // tonic; his stand, walk, struck and death the very same, so his measure is the same: art/physician_action.ts)
  make: () => (PHYSICIAN_ACTION.on ? makePhysicianActionArt() : makePhysicianArt()),
  // (measured off his stand as tests/act2_physician.test.ts measures it: the top of his hat over his floor point, half his width at the body)
  size: { top: 35, half: 12 },
  heavy: true,
  switches: [PHYSICIAN_ON],
};

// HIS INSTRUMENTS (PHYSICIAN_ACTION: his operation, art/physician_action_fx.ts layTool), as the game draws them: each of the five kinds
// turned to each of TOOL_TURNS ways round, painted ahead (art/films.ts things:physician), or, until they are, as each is first wanted;
// and with each, its blade alone in his gold (`glint`), for the glint running along it (render/act1_fx/physician.ts).
export const TOOL_TURNS = 24;
/** Which of the ways round a tool pointing (dx, dy) on the picture is drawn as. */
export function toolTurn(dx: number, dy: number): number {
  const k = Math.round((Math.atan2(dy, dx) / (Math.PI * 2)) * TOOL_TURNS);
  return ((k % TOOL_TURNS) + TOOL_TURNS) % TOOL_TURNS;
}
/** The blade's steel (art/physician_action_fx.ts ST, what of a tool is blade), and the gold its glint runs in. */
const BLADE = ['#68667a', '#a4a2b2', '#d8d6e2', '#fffaf0'].map((c) => parseInt(c.slice(1), 16));
const GOLD = FLAME[3];
/** Tool `kind` turned the `k`th way round: its picture, its middle the anchor; and its blade alone, in his gold. */
export function toolSprites(kind: number, k: number): { tool: Sprite; glint: Sprite } {
  const a = (k / TOOL_TURNS) * Math.PI * 2;
  const R = Math.ceil((19 + 8) * OPERATION.size) + 2;
  const p = new Px(2 * R + 1, 2 * R + 1);
  layTool(p, kind, R, R, Math.cos(a), Math.sin(a), -99, OPERATION.size);
  const q = new Px(p.w, p.h);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      if (p.d[i + 3] === 0) continue;
      if (BLADE.includes((p.d[i] << 16) | (p.d[i + 1] << 8) | p.d[i + 2])) q.set(x, y, GOLD);
    }
  }
  return { tool: toSprite({ px: p, lights: [] }, null, R, R), glint: toSprite({ px: q, lights: [] }, null, R, R) };
}
/** HIS INSTRUMENTS, painted ahead: `tool:<kind>` and `glint:<kind>`, each way round. */
export function physicianThings(): Record<string, Sprite[]> {
  const out: Record<string, Sprite[]> = {};
  for (let kind = 0; kind < TOOL_KINDS.length; kind++) {
    const all = Array.from({ length: TOOL_TURNS }, (_, k) => toolSprites(kind, k));
    out[`tool:${kind}`] = all.map((s) => s.tool);
    out[`glint:${kind}`] = all.map((s) => s.glint);
  }
  return out;
}
