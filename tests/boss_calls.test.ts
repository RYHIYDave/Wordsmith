// THE BOSSES CALL OUT THEIR BIG MOVES (game/boss_calls.ts, behind BOSS_CALLS, off; engine/audio.ts BOSS_VOICES). His idea, 31 Oct
// 2026, 07:28; his pick, “Words + his own sound (Recommended)”; the lines and voices heard on the Boss Voices page, “Yes, they're
// good”. Here:
//   1. every boss with lines has a voice of his own, and each line is one of his own moves; his basic blow's only for the two
//      whose basic blow is a big one (the Fleshmancer's shards, the King's charge);
//   2. those whose silence is their story, and the beasts, have neither;
//   3. off, nothing is said; on, in a fight his line comes up over him, in his own voice, as he begins a big move, and never two
//      within BOSS_CALLS.gap; the Warden's too (his moves are the game's own);
//   4. his voice never throws, with no sound to play it on.
//   run: tsx --test tests/boss_calls.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { BOSS_CALLS, BOSS_CALL_LINES, bossCall } from '../src/game/boss_calls';
import { BOSS_VOICES, speakBoss } from '../src/engine/audio';
import { MONSTER_MOVES } from '../src/game/defs';
import { ACTS, H2_ACTS } from '../src/game/bosses';
import { act1Rules } from '../src/game/act1_rules/index';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';
import type { MonsterKind } from '../src/game/types';

const DT = 1 / 30;
function movesOf(kind: string): { ids: string[]; basic: string } {
  if (kind === 'warden') return { ids: MONSTER_MOVES.warden.map((m) => m.id), basic: MONSTER_MOVES.warden[0].id };
  if (kind === 'headsman') return { ids: H2_ACTS.map((a) => a.id), basic: H2_ACTS[0].id };
  const r = act1Rules(kind as MonsterKind);
  const acts = r ? r.acts : (ACTS as Record<string, readonly { id: string }[]>)[kind];
  assert.ok(acts, `${kind}: his moves`);
  return { ids: acts.map((a) => a.id), basic: acts[0].id };
}
function on<T>(fn: () => T): T {
  const was = BOSS_CALLS.on;
  BOSS_CALLS.on = true;
  try {
    return fn();
  } finally {
    BOSS_CALLS.on = was;
  }
}

test('1. every boss with lines has a voice of his own; each line is one of his own moves; a basic blow\'s only for two', () => {
  for (const [kind, lines] of Object.entries(BOSS_CALL_LINES)) {
    assert.ok((BOSS_VOICES as Record<string, unknown>)[kind], `${kind} has a voice`);
    const { ids, basic } = movesOf(kind);
    for (const [move, line] of Object.entries(lines!)) {
      assert.ok(ids.includes(move), `${kind}: ${move} is one of his moves`);
      if (move === basic) assert.ok(['fleshmancer', 'gking'].includes(kind), `${kind}: his basic blow says nothing`);
      assert.ok(line.length > 0 && line.length <= 40, `${kind}: “${line}” short enough to read in a moment`);
    }
  }
  for (const kind of Object.keys(BOSS_VOICES)) assert.ok((BOSS_CALL_LINES as Record<string, unknown>)[kind], `${kind}'s voice has lines to say`);
  assert.equal(BOSS_CALL_LINES.gking!['gking:weight'], 'Heavy is the crown.', 'the King\'s crown line is his');
});

test('2. the silent and the beasts have neither lines nor a voice', () => {
  for (const kind of ['crier', 'palimpsest', 'scraper', 'quill', 'censor', 'princess', 'queen', 'stag']) {
    assert.equal((BOSS_CALL_LINES as Record<string, unknown>)[kind], undefined, `${kind}: no lines`);
    assert.equal((BOSS_VOICES as Record<string, unknown>)[kind], undefined, `${kind}: no voice`);
  }
});

/** A fight with the boss of floor `depth`, the hero unhurtable before him: what is said, and when. */
function fight(depth: number, secs: number): { said: { t: number; text: string; voice?: string }[]; kind: string } {
  const g = new Game('warrior', 7);
  g.depth = depth;
  g.cleared = depth - 1;
  g.enterDungeon();
  const m = g.boss as Monster;
  for (const q of g.monsters) if (q !== m) q.dead = true;
  g.bossReady();
  g.hero.invuln = 1e9;
  m.life = m.maxLife = 1e7;
  m.state = 'chase';
  const said: { t: number; text: string; voice?: string }[] = [];
  for (let k = 0; k < secs / DT; k++) {
    // (he keeps a few tiles off, so the far moves and the near are both made)
    const a = k * DT * 0.4;
    const r = 2 + 4 * (0.5 + 0.5 * Math.sin(k * DT * 0.7));
    const x = m.x + Math.cos(a) * r;
    const y = m.y + Math.sin(a) * r;
    if (g.isOpen(x, y)) {
      g.hero.x = x;
      g.hero.y = y;
    }
    g.update(DT, emptyControls());
    for (const e of g.events as GameEvent[]) if (e.t === 'bossSay') said.push({ t: g.time, text: e.text, voice: e.voice });
    g.events.length = 0;
  }
  return { said, kind: m.kind };
}

test('3. off, nothing is said; on, his line over him in his own voice as a big move begins, never two within the gap', () => {
  assert.equal(BOSS_CALLS.on, false, 'off until he has seen it in the game');
  assert.equal(bossCall({ kind: 'chained', boss: true }, 'hook', 0), null);
  assert.equal(fight(3, 30).said.filter((s) => s.voice).length, 0, 'off: none said');
  on(() => {
    for (const depth of [1, 3, 5]) {
      const { said, kind } = fight(depth, 60);
      const mine = said.filter((s) => s.voice);
      assert.ok(mine.length >= 2, `floor ${depth}: he called out (${mine.length})`);
      const lines = Object.values(BOSS_CALL_LINES[kind as MonsterKind]!);
      for (const s of mine) {
        assert.equal(s.voice, kind, 'in his own voice');
        assert.ok(lines.includes(s.text), `“${s.text}” is one of his`);
      }
      for (let i = 1; i < mine.length; i++) assert.ok(mine[i].t - mine[i - 1].t >= BOSS_CALLS.gap - 1e-6, 'never two within the gap');
      assert.ok(new Set(mine.map((s) => s.text)).size >= 2, `floor ${depth}: more than one of his lines`);
    }
    assert.equal(bossCall({ kind: 'chained', boss: false }, 'hook', 0), null, 'only a boss calls out');
    // (a basic blow's line, no more than once in the longer gap)
    const fm = { kind: 'fleshmancer' as MonsterKind, boss: true };
    assert.ok(bossCall(fm, 'shards', 100, true));
    assert.equal(bossCall(fm, 'shards', 100 + BOSS_CALLS.gap + 1, true), null);
    assert.ok(bossCall(fm, 'rings', 100 + BOSS_CALLS.gap + 1));
    assert.ok(bossCall(fm, 'shards', 100 + BOSS_CALLS.basicGap + 1, true));
  });
});

test('4. his voice never throws, with no sound to play it on', () => {
  for (const kind of Object.keys(BOSS_VOICES)) speakBoss(kind, 'Heavy is the crown.');
  speakBoss('nobody', 'Nothing.');
});
