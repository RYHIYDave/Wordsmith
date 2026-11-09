// THE SWAMP COLOSSUS'S SOUNDS (25.3.1; the sound chat's fifth batch, assets/sound/README.md, played at his fight's beats by
// game/act1_rules/colossus.ts `sounds`): fetched ahead as his floor is come into; the rumble as his waking's water first stirs (once,
// at WAKE.still); his two tentacles bursting up; his whole entrance as one sound as phase 2's change begins, its tentacles not heard
// again, played at its own pitch and length; the water pouring off him as phase 3's slide begins.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { GameEvent } from '../src/game/state';
import { COLOSSUS, CHANGE3, ColossusFight, STONE, WAKE, stoneToWorld } from '../src/game/colossus_fight';
import { COLOSSUS_SOUND_NAMES, soundsOf } from '../src/game/sound_families';

const DT = 1 / 60;
const recs = (ev: readonly GameEvent[]): string[] => ev.filter((e): e is Extract<GameEvent, { t: 'rec' }> => e.t === 'rec').map((e) => (e.exact ? `${e.name}!` : e.name));

test('his sounds fetched ahead with floor 10, and only while he is its boss', () => {
  assert.equal(COLOSSUS.on, true);
  const on = soundsOf(['eye']);
  for (const n of COLOSSUS_SOUND_NAMES) assert.ok(on.includes(n), `${n} fetched ahead`);
  COLOSSUS.on = false;
  try {
    const off = soundsOf(['eye']);
    for (const n of COLOSSUS_SOUND_NAMES) assert.ok(!off.includes(n), `${n} not with the old Eye`);
  } finally {
    COLOSSUS.on = true;
  }
});

test('his waking: the rumble once as the water stirs, then his tentacles bursting up; his entrance one sound; the slide the water pouring', () => {
  const g = new Game('warrior', 9);
  g.depth = 10;
  g.cleared = 9;
  g.enterDungeon();
  const L = g.level;
  const S = L.land!.stone!;
  const c = emptyControls();
  g.hero.x = L.land!.landing!.x;
  g.hero.y = L.land!.landing!.y;
  for (let i = 0; i < 180; i++) g.update(DT, c);
  const boss = g.monsters.find((m) => m.boss)!;
  const mid = stoneToWorld(S, STONE.w / 2, 8);
  const heard: { t: number; name: string }[] = [];
  let f: ColossusFight | undefined;
  const play = (secs: number, each?: () => void): void => {
    for (let i = 0; i < secs / DT; i++) {
      g.hero.x = mid.x;
      g.hero.y = mid.y;
      g.hero.life = g.hero.d.maxLife;
      if (each) each();
      g.events.length = 0;
      g.update(DT, c);
      f = f ?? (boss.a1 as { fight?: ColossusFight } | undefined)?.fight;
      for (const n of recs(g.events)) heard.push({ t: f ? f.time : -1, name: n });
    }
  };
  play(8);
  assert.ok(f && f.mode === 'fight', 'his fight begun');
  const rise = heard.filter((h) => h.name === 'colossus_rise');
  assert.equal(rise.length, 1, 'the rumble once');
  assert.ok(Math.abs(rise[0].t - WAKE.still) < 0.1, `as the water stirs (${rise[0].t.toFixed(2)} s)`);
  assert.ok(heard.some((h) => h.name === 'colossus_tentacle' && Math.abs(h.t - WAKE.rise) < 0.1), 'a tentacle bursting up as they rise');
  // (phase 1's tentacles killed: his entrance)
  heard.length = 0;
  for (const m of g.monsters.filter((q) => q.kind === 'eye' && !q.boss && !q.dead)) g.kill(m);
  play(20, () => {
    if (f && f.mode === 'fight' && f.ph === 2) {
      f.shovelIn = 1e9;
      f.waterIn = 1e9;
      f.body2In = 1e9;
    }
  });
  assert.equal(f!.ph, 2, 'phase 2');
  assert.equal(heard.filter((h) => h.name === 'colossus_entrance!').length, 1, 'his entrance, one sound, at its own pitch and length (timed to the frames)');
  assert.equal(heard.filter((h) => h.name === 'colossus_tentacle').length, 0, "its tentacles in its own sound, not again");
  // (phase 2's tentacles killed: his slide)
  heard.length = 0;
  for (const m of g.monsters.filter((q) => q.kind === 'eye' && !q.boss && !q.dead)) g.kill(m);
  let slideAt = -1;
  play(14, () => {
    if (f && f.mode === 'change' && slideAt < 0) slideAt = f.time;
  });
  const pour = heard.filter((h) => h.name === 'colossus_pour');
  assert.equal(pour.length, 1, 'the water pouring off him once');
  assert.ok(slideAt >= 0 && Math.abs(pour[0].t - slideAt - CHANGE3.slide) < 0.1, `as his slide begins (${(pour[0].t - slideAt).toFixed(2)} s into the change)`);
});
