// THE CAMP'S TOUCHES (25.3.10; game/camp.ts, main.ts spotAt): in the camp, the town of floors 11 to 15, each service's name is
// touched where it is written, at the camp's own height for it (StationSpot.lift), and its GATE (the city gate he came in by)
// opens nothing, as a key beside it opens nothing. Before, the names were touched at the first town's heights, and a touch on
// GATE opened the old gate panel, whose ENTER DUNGEON went down as before the ways (found by the Endless town build chat, 11 Nov).
//   node tools/playtest.mjs --scenario tools/scenarios/camp_tap.mjs --out shots/camp_tap
//   node tools/playtest.mjs --size 844x390 --dpr 3 --touch --scenario tools/scenarios/camp_tap.mjs --out shots/camp_tap_phone
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  await page.evaluate(() => { window.__dbg.run('warrior', 31); });
  await page.waitForTimeout(400);
  // (down to the camp: as floor 10's way on brings him, in through its city gate)
  const camp = await page.evaluate(() => {
    const g = window.__dbg.game();
    g.wayDepth = 11;
    g.enterTown('gate');
    return { town: g.level.town, camp: g.campTown(), stations: g.level.stations.map((s) => ({ kind: s.kind, x: s.x, y: s.y, lift: s.lift ?? null })) };
  });
  await page.waitForTimeout(800);
  let fails = 0;
  if (!camp.town || !camp.camp) {
    console.log(`  !! not in the camp: town=${camp.town} camp=${camp.camp}`);
    log('RESULT', '1 FAILED');
    return;
  }
  await snap('camp');
  log('the camp\'s services', camp.stations.map((s) => `${s.kind}${s.lift === null ? '' : ` (name ${s.lift} up)`}`).join(', '));

  /** What a touch on a station's name, as it is written, would send him to use (and the same at the first town's height). */
  const onName = (s) => page.evaluate((st) => {
    const d = window.__dbg; const z = d.zoom();
    const at = d.at(st.x, st.y);
    return d.spot(at.x, at.y + (3 - st.lift) * z);
  }, s);
  for (const s of camp.stations) {
    if (s.kind === 'gate' || s.lift === null) continue;
    const got = await onName(s);
    const ok = got === s.kind;
    if (!ok) fails++;
    log(`touch the name ${s.kind}`, `${ok ? 'ok' : '!!'} sends him to ${got}`);
  }

  // GATE: neither its name nor its arch opens anything; and a touch on it opens no panel, and leaves him in the camp
  const gate = camp.stations.find((s) => s.kind === 'gate');
  if (gate) {
    const name = gate.lift === null ? null : await onName(gate);
    const body = await page.evaluate((st) => { const d = window.__dbg; const at = d.at(st.x, st.y); return d.spot(at.x, at.y - 8 * d.zoom()); }, gate);
    const ok = name !== 'gate' && body !== 'gate';
    if (!ok) fails++;
    log('touch GATE', `${ok ? 'ok' : '!!'} its name sends him to ${name}, its arch to ${body}`);
    // (and its arch touched as a player would, with a finger or the mouse: no panel, still in the camp, a few seconds on)
    const p = await page.evaluate((st) => { const d = window.__dbg; const at = d.at(st.x, st.y); return { x: at.x, y: at.y - 8 * d.zoom() }; }, gate);
    const hands = await makeHands(page);
    await hands.pressAt(p.x, p.y);
    await page.waitForTimeout(3000);
    const after = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); return { panel: d.panels.open, town: g.level.town, camp: g.campTown(), depth: g.depth }; });
    const still = after.panel !== 'gate' && after.town && after.camp;
    if (!still) fails++;
    log('GATE touched', `${still ? 'ok' : '!!'} panel=${after.panel} town=${after.town} camp=${after.camp} depth=${after.depth}`);
    await snap('gate_touched');
  } else log('touch GATE', 'the camp has no gate station');

  if (fails) console.log(`  !! ${fails} check(s) failed`);
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
