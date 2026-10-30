// THE HIGH CITY, FLOOR 17: THE MASQUE'S HAZARD, THE GREAT EBONY CLOCK (his doc, level 17: "the great ebony clock in the black
// room. Every so often it chimes: every dancer stops dead and turns to look at you, then the music starts again and they all come
// at once."). The main chat's numbers, his to try and change: it first chimes CHIME.first seconds after he comes onto the floor,
// then every CHIME.every; its bell rings CHIME.ring seconds (the clock's prop's state 1: its hammer and bell drawn,
// render/act1_pieces.ts); every masked dancer within CHIME.reach of him stops dead and turns to look at him (game/act1_rules/
// dancer.ts, its chime: the art chat's, 1.9 s, stopped by 0.06, the masks round by 0.26, held to 1.3), the waltzing ones woken
// by it; then they all come at once. Not while the Prince lives on his floor and fights (the Black Room's own music is his).

import type { Level, Monster, PropInst } from '../state';

export const CHIME = { first: 20, every: 40, reach: 18, ring: 2.0 } as const;

interface ChimeState {
  /** Seconds he has been on the floor. */
  t: number;
  /** When it next chimes. */
  next: number;
  /** Seconds left of its ringing. */
  ring: number;
}
const STATE = new WeakMap<Level, ChimeState>();

/** A step of the Masque's clock: true on the step it chimes (the game calls each dancer near him to the chime, and sounds it). */
export function stepClock(L: Level, hero: { x: number; y: number }, monsters: readonly Monster[], dt: number): Monster[] | null {
  if (L.land?.kind !== 'masque') return null;
  let s = STATE.get(L);
  if (!s) {
    s = { t: 0, next: CHIME.first, ring: 0 };
    STATE.set(L, s);
  }
  s.t += dt;
  const clock = clockOf(L);
  if (s.ring > 0) {
    s.ring -= dt;
    if (s.ring <= 0 && clock) clock.state = 0;
  }
  if (s.t < s.next) return null;
  s.next = s.t + CHIME.every;
  s.ring = CHIME.ring;
  if (clock) clock.state = 1;
  return monsters.filter((m) => !m.dead && m.kind === 'dancer' && Math.hypot(m.x - hero.x, m.y - hero.y) <= CHIME.reach);
}

/** (For the playtests and films) make the clock chime at its next step. */
export function chimeNow(L: Level): void {
  const s = STATE.get(L);
  if (s) s.next = s.t;
}

/** The clock's prop on this floor. */
export function clockOf(L: Level): PropInst | undefined {
  return L.props.find((p) => p.kind === 'piece' && p.name === 'the great ebony clock');
}
