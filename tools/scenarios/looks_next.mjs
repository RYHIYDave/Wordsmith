// THE NEXT VERSION'S LOOKS, BEFORE AND AFTER, FOR HIS YES (main.ts __dbg.looks: each off until he has seen it). The same
// floor made twice, the switch off then on, and a picture of the same spot each time.
//   node tools/build_to.mjs dist/next1.html
//   CASE=props node tools/playtest.mjs --file dist/next1.html --size 1014x468 --scenario tools/scenarios/looks_next.mjs --out shots/looks/props
// CASE: props (DRESS_EDGES: the things on a floor fewer and toward its areas' edges, the cult's camp a ring round its fire;
// floors 6, 8 and 10), path (PINE_PATH: the Pinewood's paths wider), altar (ALTAR_GOES: a stronghold's altar gone once
// its door is open), bodies (BODIES: the dead gone after a while). SEED: the run's (9).
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const which = process.env.CASE || 'props';
  const seed = Number(process.env.SEED || 9);
  await page.evaluate((s) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', s); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
  }, seed);
  await page.waitForTimeout(800);
  const looks = () => page.evaluate(() => Object.fromEntries(Object.entries(window.__dbg.looks).map(([k, v]) => [k, v.on])));
  const set = (name, on) => page.evaluate(([k, v]) => { window.__dbg.looks[k].on = v; }, [name, on]);
  /** The floor made afresh (the same floor every time: its seed is the run's, its depth's and how far he has been). */
  const enter = (n, foes = false) => page.evaluate(([n, foes]) => {
    const g = window.__dbg.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    g.level.explored.fill(1);
    if (!foes) g.monsters = g.monsters.filter((m) => m.boss);
    for (const m of g.monsters) m.state = 'sleep';
    return { w: g.level.floor.w, h: g.level.floor.h, props: g.level.props.length };
  }, [n, foes]);
  const stand = async (x, y, wait = 2500) => {
    await page.evaluate(([x, y]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; h.fx = 0.7; h.fy = 0.7; }, [x, y]);
    await page.waitForTimeout(wait);
  };
  log('looks', JSON.stringify(await looks()));

  if (which === 'props') {
    for (const n of [6, 8, 10]) {
      // ON first: where the camp's fire is, and an open area of the main way that is not the camp's
      await set('DRESS_EDGES', true);
      const on = await enter(n);
      const at = await page.evaluate(() => {
        const g = window.__dbg.game(); const L = g.level;
        const fire = L.props.find((p) => p.name === "the cult's watchfire");
        const st = L.floor.start;
        const areas = L.land.areas.filter((a) => a.role === 'path' && (!fire || Math.hypot(a.blob.x - fire.x, a.blob.y - fire.y) > 8));
        areas.sort((a, b) => Math.hypot(a.blob.x - st.x, a.blob.y - st.y) - Math.hypot(b.blob.x - st.x, b.blob.y - st.y));
        const area = areas[Math.min(2, areas.length - 1)];
        const pieces = L.props.filter((p) => p.kind === 'piece').length;
        return { fire: fire ? [fire.x, fire.y] : null, area: area ? [area.blob.x, area.blob.y] : null, pieces };
      });
      log(`floor ${n} on`, JSON.stringify({ ...on, ...at }));
      if (!at.fire) log(`!! floor ${n}: no watchfire with DRESS_EDGES on`);
      if (at.fire) { await stand(at.fire[0] - 1.6, at.fire[1] + 1.6); await snap(`props_${n}_camp_after`); }
      if (at.area) { await stand(at.area[0], at.area[1]); await snap(`props_${n}_area_after`); }
      await set('DRESS_EDGES', false);
      const off = await enter(n);
      const pieces = await page.evaluate(() => window.__dbg.game().level.props.filter((p) => p.kind === 'piece').length);
      log(`floor ${n} off`, JSON.stringify({ ...off, pieces }));
      if (at.fire) { await stand(at.fire[0] - 1.6, at.fire[1] + 1.6); await snap(`props_${n}_camp_before`); }
      if (at.area) { await stand(at.area[0], at.area[1]); await snap(`props_${n}_area_before`); }
    }
  } else if (which === 'path') {
    for (const on of [false, true]) {
      await set('PINE_PATH', on);
      await enter(9);
      const at = await page.evaluate(() => {
        const g = window.__dbg.game(); const L = g.level; const W = L.floor.w;
        const way = L.land.way;
        // (a spot on the path between the second and third areas of the way: the middle of it, or near it)
        for (const k of [0.5, 0.45, 0.55, 0.4, 0.6]) {
          const x = way[1][0] + (way[2][0] - way[1][0]) * k; const y = way[1][1] + (way[2][1] - way[1][1]) * k;
          if (L.walk[Math.floor(y) * W + Math.floor(x)] === 1) return [x, y];
        }
        return [way[1][0], way[1][1]];
      });
      log(`path ${on ? 'on' : 'off'}`, JSON.stringify(at));
      await stand(at[0], at[1], 3500);
      await snap(`path_${on ? 'after' : 'before'}`);
    }
  } else if (which === 'altar') {
    for (const on of [false, true]) {
      await set('ALTAR_GOES', on);
      await enter(6);
      const info = await page.evaluate(() => {
        const g = window.__dbg.game(); const q = g.level.land.holds[0];
        for (const w of ['fire', 'power']) g.hero.words[w] = (g.hero.words[w] || 0) + 1;
        g.hero.x = q.altar.x + 1.2; g.hero.y = q.altar.y + 0.9; g.hero.fx = -0.7; g.hero.fy = -0.7;
        for (const m of g.monsters) if (m.packId >= 9100) m.state = 'sleep';
        return { altar: q.altar, gate: [q.gx, q.gy] };
      });
      await page.waitForTimeout(2500);
      await snap(`altar_${on ? 'after' : 'before'}_1_shut`);
      const hint = await page.evaluate(() => window.__dbg.game().interactHint());
      const hands = await makeHands(page);
      if (await hands.mark(`button:${hint}`)) await hands.press(`button:${hint}`);
      else await page.keyboard.press('KeyE');
      await page.waitForTimeout(500);
      await page.evaluate(() => { const g = window.__dbg.game(); g.altarWord(0, 'fire'); g.altarWord(0, 'power'); });
      await page.waitForTimeout(300);
      if (await hands.mark('button:OPEN THE DOOR')) await hands.press('button:OPEN THE DOOR');
      else await page.keyboard.press('Enter');
      await page.waitForTimeout(1500);
      const st = await page.evaluate(() => {
        const g = window.__dbg.game(); const q = g.level.land.holds[0]; const L = g.level;
        const altar = L.props.filter((p) => Math.hypot(p.x - q.altar.x, p.y - q.altar.y) < 1.2).map((p) => p.name || p.kind);
        return { open: g.level.holds[0].open, near: altar };
      });
      log(`altar ${on ? 'on' : 'off'}`, JSON.stringify({ ...info, ...st }));
      if (!st.open) log('!! the door did not open');
      // (stood back, so that the door and where the altar stood are both seen)
      await stand(info.altar.x + 2.2, info.altar.y + 2.2, 1500);
      await snap(`altar_${on ? 'after' : 'before'}_2_open`);
    }
  } else if (which === 'bodies') {
    for (const on of [false, true]) {
      await set('BODIES', on);
      await enter(6);
      const n = await page.evaluate(() => {
        const g = window.__dbg.game(); const L = g.level; const a = L.land.areas.find((q) => q.role === 'path') || L.land.areas[0];
        g.hero.x = a.blob.x; g.hero.y = a.blob.y;
        const made = [];
        for (let i = 0; i < 5; i++) {
          const ang = (i / 5) * Math.PI * 2;
          made.push(g.spawn('chanter', a.blob.x + Math.cos(ang) * 2, a.blob.y + Math.sin(ang) * 2, 7, 0, false, g.rng));
        }
        for (const m of made) g.kill(m);
        return made.length;
      });
      log(`bodies ${on ? 'on' : 'off'}`, `${n} killed`);
      await page.waitForTimeout(4000);
      await snap(`bodies_${on ? 'after' : 'before'}_1_at_4s`);
      await page.waitForTimeout(28000);
      await snap(`bodies_${on ? 'after' : 'before'}_2_at_32s`);
    }
  }
  // (as the game is: every look off again)
  for (const k of ['DRESS_EDGES', 'PINE_PATH', 'ALTAR_GOES', 'BODIES']) await set(k, false);
}
