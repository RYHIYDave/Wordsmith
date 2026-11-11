// ACT 2, THE HUSH: FLOOR 15: THE BOOKWARDENS: what they do to the floor, drawn (render/act1_fx/types.ts), where their rules
// (game/act1_rules/bookwarden.ts) have it. Their tome's whirl and slam are in their own pictures (art/act1_figs/
// bookwarden.ts); where it comes down flat on the floor ('bookwarden:mark'), the art chat's mark of it (art/
// bookwarden_shots.ts drawTomeSlam): the ring of dust shoved out from under it, the cracks run out from its edges, the loose
// pages knocked out of it and fluttering down round it, gone by TOME_MARK_FOR.

import { STORM_POUR, STORM_TAIL, drawPageStorm, drawStormWarn, drawTomeSlam } from '../../art/bookwarden_shots';
import { BOOKWARDEN } from '../../game/act1_rules/bookwarden';
import { BARRAGE, BOOK_CANVAS, WARDEN_BARRAGE, bookAt, bookPainted, bookStreak } from '../../art/action_f11_warden';
import { toSprite } from '../../art/kit';
import type { Sprite } from '../../engine/px';
import { BARRAGE_PERIL, aimFor } from '../../game/act1_rules/bookwarden';
import { beside, fromFigure } from '../../game/facing';
import { keptPictures } from './kept';
import { livePicture } from './live';
import type { Act1Fx } from './types';

// (Version 23.2, THE PAGE STORM, their second move: through its warning the art's fan of pink before them (drawStormWarn);
// from the book's opening, the pages flung out across it (drawPageStorm), from where they stand, the way they face)
const OLD: Act1Fx = {
  ground(c, m, p) {
    if (m && c.g && m.act && m.act.id === 'bookwarden:storm') {
      const W = BOOKWARDEN.storm;
      const t = m.act.t;
      if (t >= W.warn[0] && t < W.open) drawStormWarn(c.g, c.at, m.x, m.y, m.fx, m.fy, Math.min(1, (t - W.warn[0]) / (W.open - W.warn[0])), c.t);
      if (t >= W.open && t < W.open + STORM_POUR + STORM_TAIL) drawPageStorm(c.g, c.at, m.x, m.y, m.fx, m.fy, t - W.open);
      return;
    }
    if (!p || p.a1 !== 'bookwarden:mark' || !c.g) return;
    drawTomeSlam(c.g, c.at, p.x, p.y, p.fx, p.fy, p.t);
  },
};

// THE BOOK BARRAGE (WARDEN_BARRAGE: art/action_f11_warden.ts, his yes, 2 Nov 2026): the nine books torn up and wheeling round him at
// head height, then flung at the hero one after another, each turning over, its streak behind it (the art's bookStreak), coming down,
// skidding and lying a moment; each among the figures at the floor point under it. Each book's picture by how far it has turned
// (BOOK_TURNS a turn), its cover, lying or not: painted once and kept.
const BOOK_TURNS = 24;
const books = keptPictures<string, Sprite>(true);
function book(spin: number, cover: number, lying: boolean, glint: number): Sprite {
  const q = ((Math.round((spin / (Math.PI * 2)) * BOOK_TURNS) % BOOK_TURNS) + BOOK_TURNS) % BOOK_TURNS;
  const g = glint > 0.4 ? 1 : 0;
  const key = `${q}:${cover}:${lying ? 1 : 0}:${g}`;
  let s = books.get(key);
  if (!s) books.set(key, (s = toSprite({ px: bookPainted((q / BOOK_TURNS) * Math.PI * 2, cover, lying, g), lights: [] }, null, BOOK_CANVAS.ax, BOOK_CANVAS.ay)));
  return s;
}
const BARRAGE_FX: Act1Fx = {
  ground: (c, m, p) => OLD.ground!(c, m, p),
  standing(c, m, p) {
    if (!p || p.a1 !== BARRAGE_PERIL) return;
    const h = c.game.hero;
    const r = fromFigure(p.x, p.y, p.fx, p.fy, p.hand, h.x, h.y);
    const aim = aimFor(p, [r.fwd, r.left]);
    for (let i = 0; i < BARRAGE.n; i++) {
      const b = bookAt(i, p.t, aim);
      const w = beside(p.x, p.y, p.fx, p.fy, p.hand, b.x, b.y);
      const [sx, sy] = c.at(w.x, w.y);
      const z = b.z / 2;
      if (b.flying && b.since > 0.02) {
        // (its streak: after-images along the way it came)
        const b0 = bookAt(i, p.t - 1 / 30, aim);
        const w0 = beside(p.x, p.y, p.fx, p.fy, p.hand, b0.x, b0.y);
        const [x0, y0] = c.at(w0.x, w0.y);
        const dx = (sx - x0) * 2;
        const dy = (sy - z - (y0 - b0.z / 2)) * 2;
        const S = livePicture(`wb:streak:${i}`, 160, 160, 80, 80, `${p.t.toFixed(3)}`, (px) => bookStreak(px, 80, 80, dx, dy, i));
        if (S) c.stand(w.x + w.y - 0.01, S, sx, sy - z);
      }
      c.stand(w.x + w.y, book(b.spin, b.cover, b.lying, b.flying ? 0 : 1), sx, sy - z);
    }
  },
};

export const FX: Act1Fx | null = {
  ground: (c, m, p) => (WARDEN_BARRAGE.on ? BARRAGE_FX : OLD).ground!(c, m, p),
  standing: (c, m, p) => (WARDEN_BARRAGE.on ? BARRAGE_FX.standing!(c, m, p) : undefined),
};
