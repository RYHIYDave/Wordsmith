// (MOCK-UP, NOT IN THE GAME) WORDS IN THE WORLD (render/words_world.ts, art/carving.ts): stills of a
// real dungeon room with the decorations (game/decor.ts), the hero holding a weapon with a word burned
// into it, and a named monster with a word beside him: as the game draws them today, and in each look.
//
// Both switches (`__dbg.decor.on`, `__dbg.words.on`) are OFF in the game: this playtest sets them,
// and puts them back as it found them.
//   SEED=6 DEPTH=2 ROOM=0 AT='5,5.5,0.7,0.7' (the hero: from the room's corner, in tiles, and the way he faces)
//   FOE='2.2,-1.2'   where the named monster stands, from the hero, in tiles
//   KIND=skeleton WORD=twin   the monster and its word
//   IMBUE=fire       the word burned into the hero's weapon
//   LOOKS='now;ring,rise,plain;ring,rise,glow'   each still: 'now' (the switch off), or monster,gear,carved
//   WAIT=2300        how long after setting a look the still is taken (ms): long enough for the rising word to be spelled out
//   node tools/playtest.mjs --file dist/words.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/words_world.mjs --out shots/words/a
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED || 6);
  const depth = Number(process.env.DEPTH || 2);
  const room = Number(process.env.ROOM || 0);
  const at = (process.env.AT || '5,5.5,0.7,0.7').split(',').map(Number);
  const foe = (process.env.FOE || '2.2,-1.2').split(',').map(Number);
  const kind = process.env.KIND || 'skeleton';
  const word = process.env.WORD || 'twin';
  const imbue = process.env.IMBUE || 'fire';
  const looks = (process.env.LOOKS || 'now;ring,rise,plain;ring,rise,glow').split(';');
  const wait = Number(process.env.WAIT || 2300);
  const info = await page.evaluate(([seed, depth, room, at, foe, kind, word, imbue]) => {
    const d = window.__dbg; d.saving(false);
    window.__wordsWas = { decor: { ...d.decor }, words: { ...d.words } };
    d.decor.on = true;
    d.run('warrior', seed);
    const g = d.game();
    g.depth = depth; g.cleared = depth; g.enterDungeon();
    d.autoLevel = false; d.autoWords = false; d.god = true;
    g.wakeUp = () => {};
    const kept = g.monsters.splice(0);
    g.projectiles.length = 0;
    const r = g.level.floor.rooms[room];
    const h = g.hero;
    h.x = r.x + at[0]; h.y = r.y + at[1]; h.fx = at[2]; h.fy = at[3]; h.move = null;
    // the word burned into his weapon
    const w = h.gear.mainhand;
    if (w) w.imbues = [{ word: imbue, kind: 'prefix', mods: [] }];
    // a named monster with a word, asleep beside him
    const m = kept.find((q) => q.kind === kind) || kept[0];
    if (m) {
      m.x = h.x + foe[0]; m.y = h.y + foe[1];
      m.elite = true; m.words = [word]; m.seen = true; m.dead = false;
      m.name = `${word[0].toUpperCase()}${word.slice(1)} ${m.kind[0].toUpperCase()}${m.kind.slice(1)}`;
      g.monsters.push(m);
    }
    clearInterval(window.__lit);
    window.__lit = setInterval(() => { const q = window.__dbg.game(); if (!q) return; q.level.explored.fill(1); q.level.visible.fill(1); window.__dbg.fx.messages.length = 0; }, 3);
    const dec = (g.level.floor.decor || []).filter((q) => q.room === room).map((q) => `${q.kind}@${q.x},${q.y}${q.alongX ? 'x' : 'y'} v${q.variant}`).join(' ');
    return { room: `${r.id} ${r.kind} ${r.x},${r.y} ${r.w}x${r.h}`, dec, monster: m ? `${m.kind} ${m.name} at ${m.x.toFixed(1)},${m.y.toFixed(1)}` : 'none', weapon: w ? w.name : 'none' };
  }, [seed, depth, room, at, foe, kind, word, imbue]);
  log('room', info.room);
  log('decor', info.dec);
  log('monster', info.monster);
  log('weapon', info.weapon);
  for (const look of looks) {
    const [monster, gear, carved] = look.split(',');
    await page.evaluate(([look, monster, gear, carved]) => {
      const d = window.__dbg;
      if (look === 'now') d.words.on = false;
      else Object.assign(d.words, { on: true, monster, gear, carved });
    }, [look, monster, gear, carved]);
    // (long enough for the rising word to be spelled out, and not yet faded)
    await page.waitForTimeout(wait);
    await snap(look === 'now' ? 'now' : `${monster}_${gear}_${carved}`);
  }
  await page.evaluate(() => { const d = window.__dbg; const was = window.__wordsWas; if (was) { Object.assign(d.decor, was.decor); Object.assign(d.words, was.words); } });
}
