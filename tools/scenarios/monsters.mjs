// The monsters, repainted (Version 14): every figure of art/bestiary.ts stood in the practice room
// and looked at as the game shows it. Standing and from behind, walking, each one's attack wound up
// and at the blow from both sides, the Warden's two attacks, what ails them (frozen, burning,
// poisoned, chilled) laid over the new pictures, their fire in the dark, and the bars, names and
// runes that hang over their heads.
//
// What it checks, besides taking the pictures: the attack's picture is played by the rules' clock
// (while the rules wind the blow up the picture is short of its blow; in the step the rules land it
// the picture has reached it; it is back at rest when the monster may act again), with the game
// slowed so that single frames can be told apart.
//   node tools/playtest.mjs --scenario tools/scenarios/monsters.mjs --out shots/mon/pc
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/monsters.mjs --out shots/mon/phone
import { log } from './lib.mjs';

export default async function (page, snap) {
  const bad = (s) => console.log(`  !! ${s}`);
  const check = (what, cond, more = '') => { if (cond) console.log(`  ok ${what}${more !== '' ? `   (${more})` : ''}`); else bad(`${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };

  // ---- a practice room with nothing in it, and a hero who cannot be hurt ---------------------------------
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  });
  await page.waitForTimeout(400);
  const size = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h, touch: window.__dbg.screen.touch }));
  log('screen (game pixels)', `${size.w} x ${size.h}, ${size.touch ? 'fingers' : 'mouse'}`);

  /** Empty the room. */
  const clear = () => page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0; g.boss = null; });
  /**
   * Stand a figure at a place on the screen, measured from the hero in game pixels (right, down).
   * what: a monster kind, 'guardian', 'elite:<kind>' or 'warden'. mode: 'still' (awake, stands, never strikes),
   * 'fight' (as the rules have it, ready to strike at once), 'walk' (comes at the hero, never strikes).
   * ('still' is the rest after a blow, made to last: the one state in which the rules leave a monster
   * exactly as it is. A monster merely given no speed and no attack still "comes at" the hero: it
   * walks on the spot, and a bat weaves and looks about. Version 14.0's regression caught a bat doing so.)
   * Returns its id, or null if there is no floor there.
   */
  const put = (what, dx, dy, mode = 'still') => page.evaluate(([what, dx, dy, mode]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const x = h.x + (dx / 16 + dy / 8) / 2; const y = h.y + (dy / 8 - dx / 16) / 2;
    if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) return null;
    const elite = what.startsWith('elite:');
    const kind = what === 'guardian' ? 'brute' : elite ? what.slice(6) : what;
    const m = g.spawn(kind, x, y, 1, what === 'guardian' ? 2 : elite ? 1 : 0, what === 'warden', g.rng);
    g.wakeUp(m);
    m.life = m.maxLife = 1e7;
    if (m.boss) g.boss = m;
    if (mode === 'still') { m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; }
    else if (mode === 'walk') { m.cd = 1e9; }
    else { m.cd = 0; m.speed = 0; }
    // (it looks at the hero from where it stands)
    const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
    return m.id;
  }, [what, dx, dy, mode]);
  /** What the rules and the picture say about a monster now. `frame`: which frame of its attack is shown, or -1. */
  const look = (id) => page.evaluate((id) => {
    const d = window.__dbg; const g = d.game(); const R = d.renderer;
    const m = g.monsters.find((q) => q.id === id);
    if (!m) return null;
    const art = R.monsterArt(m);
    const set = m.fx + m.fy < -0.2 ? art.back : art.front;
    const heavy = m.boss && m.atk === 1;
    const clip = (heavy ? set.clips.heavy : null) || set.clips.attack;
    const sp = R.monsterSprite(m);
    const at = d.at(m.x, m.y);
    return {
      state: m.state, t: m.t, anim: m.anim, atk: m.atk, back: m.fx + m.fy < -0.2, left: m.fx - m.fy < 0,
      frame: clip.frames.indexOf(sp), frames: clip.frames.length, hitFrame: Math.floor(clip.hit * clip.fps + 1e-6), hit: clip.hit,
      w: sp.w, h: sp.h, lights: (sp.lights || []).length, lit: R.monsterLit.some((q) => q.s === sp), x: at.x, y: at.y,
    };
  }, id);
  const slow = (k) => page.evaluate((k) => { window.__dbg.slowmo = k; }, k);

  // ---- 1. all of them, standing: seen from the front (above the hero) and from behind (below) -----------
  const ROW = ['skeleton', 'archer', 'cultist', 'bat', 'brute', 'guardian'];
  // (the practice room is a diamond on the screen: this far out to the sides there is still floor in both rows)
  const span = Math.min(128, size.w / 2 - 44);
  const ids = [];
  for (let i = 0; i < ROW.length; i++) ids.push(await put(ROW[i], Math.round(-span + (2 * span * i) / (ROW.length - 1)), -58));
  for (let i = 0; i < ROW.length; i++) ids.push(await put(ROW[i], Math.round(-span + (2 * span * i) / (ROW.length - 1)), 62));
  check('there is floor for all twelve', ids.every((q) => q !== null), `${ids.filter((q) => q !== null).length} placed`);
  await page.waitForTimeout(900);
  await snap('01_standing');
  for (let i = 0; i < ROW.length; i++) {
    const a = ids[i] !== null ? await look(ids[i]) : null;
    const b = ids[i + ROW.length] !== null ? await look(ids[i + ROW.length]) : null;
    if (a && b) check(`${ROW[i]}: above the hero it is seen from the front, below the hero from behind, and it stands`, !a.back && b.back && a.w > 4 && b.w > 4 && a.anim === 'idle' && b.anim === 'idle', `${a.w}x${a.h} and ${b.w}x${b.h} game pixels; ${a.anim}, ${b.anim}`);
  }
  await page.waitForTimeout(350);
  await snap('02_standing_a_moment_later');

  // ---- 2. what ails them, laid over the new pictures -----------------------------------------------------
  await page.evaluate((ids) => {
    const g = window.__dbg.game(); const by = (id) => g.monsters.find((m) => m.id === id);
    const set = (id, f) => { const m = by(id); if (m) f(m); };
    set(ids[0], (m) => { m.frozenT = 30; });
    set(ids[1], (m) => { m.chillT = 30; m.chill = 0.5; });
    set(ids[2], (m) => { m.burnT = 30; });
    set(ids[3], (m) => { m.poisonT = 30; m.poisonN = 5; m.poisonDps = 0; });
    set(ids[4], (m) => { m.frozenT = 30; });
    set(ids[5], (m) => { m.flash = 0.5; });
  }, ids);
  await page.waitForTimeout(250);
  await snap('03_frozen_chilled_burning_poisoned_frozen_struck');

  // ---- 3. bars, names and runes over their heads ---------------------------------------------------------
  await clear();
  const e1 = await put('elite:skeleton', -120, -40);
  const e2 = await put('guardian', 0, -62);
  const e3 = await put('elite:cultist', 120, -40);
  const e4 = await put('brute', -70, 56);
  const e5 = await put('bat', 70, 56);
  await page.evaluate((ids) => {
    const g = window.__dbg.game();
    for (const id of ids) { const m = g.monsters.find((q) => q.id === id); if (!m) continue; m.life = m.maxLife * 0.55; m.barT = 60; if (m.elite) m.carries = [m.words[0] || 'power']; }
  }, [e1, e2, e3, e4, e5]);
  await page.waitForTimeout(500);
  await snap('04_bars_names_runes');

  // ---- 4. walking ---------------------------------------------------------------------------------------------
  await clear();
  const walkers = [];
  for (const [what, dx, dy] of [['skeleton', -180, -30], ['cultist', 180, -30], ['brute', -150, 70], ['bat', 150, 70], ['archer', 0, -100]]) walkers.push(await put(what, dx, dy, 'walk'));
  await slow(0.25);
  await page.waitForTimeout(900);
  await snap('05_walking');
  await page.waitForTimeout(500);
  await snap('06_walking_a_step_on');
  await slow(1);

  // ---- 5. each one's attack, from the front and from behind, by the rules' clock ---------------------------
  // (the monster stands to screen-left of the hero, so its picture is not the mirror image; above
  // the hero it is seen from the front, below from behind)
  const REACH = { skeleton: 1.0, bat: 0.8, brute: 1.5, guardian: 1.6, archer: 4.5, cultist: 4.5 };
  const strike = async (what, back, tag) => {
    await clear();
    await slow(1);
    const far = REACH[what] ?? 2.6;
    // world step (-far, 0) is up and to the left on the screen; (0, +far) down and to the left
    const [dx, dy] = back ? [-16 * far, 8 * far] : [-16 * far, -8 * far];
    const id = await put(what, dx, dy, 'fight');
    if (id === null) { bad(`${what}: no floor to stand it on`); return; }
    await slow(0.12);
    const seen = [];
    let wound = false; let blow = false;
    for (let i = 0; i < 400; i++) {
      const q = await look(id);
      if (!q) break;
      if (q.anim === 'attack') seen.push(q);
      if (q.state === 'windup' && !wound && q.frame >= Math.floor(q.hitFrame * 0.72)) { wound = true; await snap(`${tag}_wound_up`); }
      if (q.state === 'recover' && !blow) { blow = true; await snap(`${tag}_blow`); }
      if (seen.length > 3 && q.anim !== 'attack') break;
      await page.waitForTimeout(25);
    }
    await slow(1);
    const up = seen.filter((q) => q.state === 'windup');
    const rec = seen.filter((q) => q.state === 'recover');
    const first = up[0]; const last = up[up.length - 1]; const landed = rec[0]; const end = rec[rec.length - 1];
    const name = `${what}${back ? ' from behind' : ''}`;
    if (!first || !landed || !end) { bad(`${name}: it never made its attack (${seen.length} looks at it)`); return; }
    check(`${name}: seen from ${back ? 'behind' : 'the front'}, not in a mirror, every frame one of its attack`, seen.every((q) => q.back === back && !q.left && q.frame >= 0), `${seen.length} looks`);
    check(`${name}: while the rules wind it up the picture is short of its blow, and never goes backwards`, up.every((q, i) => q.frame < q.hitFrame && (i === 0 || q.frame >= up[i - 1].frame)) && first.frame <= 3 && last.frame >= first.hitFrame - 4, `frames ${first.frame} to ${last.frame}; the blow is frame ${first.hitFrame} of ${first.frames}`);
    check(`${name}: in the step the rules land the blow the picture has reached it`, landed.frame >= landed.hitFrame && landed.frame <= landed.hitFrame + 2, `frame ${landed.frame}, ${(0.3 - landed.t).toFixed(3)} s after`);
    check(`${name}: and it is back at rest when the monster may act again`, end.frame >= end.frames - 4 && rec.every((q, i) => i === 0 || q.frame >= rec[i - 1].frame), `last seen at frame ${end.frame} of ${end.frames}`);
  };
  for (const what of ['skeleton', 'archer', 'cultist', 'bat', 'brute', 'guardian']) {
    await strike(what, false, `1${ROW.indexOf(what)}_${what}`);
    await strike(what, true, `2${ROW.indexOf(what)}_${what}_back`);
  }

  // ---- 6. the Warden: the slam from close by, the volley from further off --------------------------------
  const warden = async (far, back, tag, wantAtk) => {
    await clear();
    await slow(1);
    const [dx, dy] = back ? [-16 * far, 8 * far] : [-16 * far, -8 * far];
    const id = await put('warden', dx, dy, 'fight');
    if (id === null) { bad('the Warden: no floor to stand him on'); return; }
    await slow(0.12);
    const seen = [];
    let wound = false; let blow = false; let late = false;
    for (let i = 0; i < 500; i++) {
      const q = await look(id);
      if (!q) break;
      if (q.anim === 'attack') seen.push(q);
      if (q.state === 'windup' && !wound && q.frame >= Math.floor(q.hitFrame * 0.75)) { wound = true; await snap(`${tag}_wound_up`); }
      if (q.state === 'recover' && !blow) { blow = true; await snap(`${tag}_blow`); }
      if (q.state === 'recover' && blow && !late && q.t < 0.14) { late = true; await snap(`${tag}_after`); }
      if (seen.length > 3 && q.anim !== 'attack') break;
      await page.waitForTimeout(25);
    }
    await slow(1);
    const up = seen.filter((q) => q.state === 'windup');
    const rec = seen.filter((q) => q.state === 'recover');
    const name = `the Warden's ${wantAtk === 1 ? 'volley' : 'slam'}${back ? ' from behind' : ''}`;
    if (!up.length || !rec.length) { bad(`${name}: he never made it (${seen.length} looks)`); return; }
    // (the picture's blow is on a frame: within a sixtieth of a second of the wind-up the rules give that attack)
    check(`${name}: it is that attack, with its own picture`, seen.every((q) => q.atk === wantAtk) && Math.abs(up[0].hit - (wantAtk === 1 ? 0.7 : 0.95)) <= 1 / 60 + 1e-9, `attack ${seen[0].atk}, the picture's blow at ${up[0].hit.toFixed(3)} s`);
    check(`${name}: short of the blow while it is wound up, at the blow when it lands`, up.every((q) => q.frame < q.hitFrame) && rec[0].frame >= rec[0].hitFrame && rec[0].frame <= rec[0].hitFrame + 2, `wound up through frames ${up[0].frame} to ${up[up.length - 1].frame}; landed at ${rec[0].frame}; the blow is frame ${rec[0].hitFrame} of ${rec[0].frames}`);
    check(`${name}: his fire lights the room`, seen.some((q) => q.lit && q.lights > 0), `${Math.max(...seen.map((q) => q.lights))} lights on the picture at most`);
  };
  await warden(2.4, false, '30_warden_slam', 0);
  await warden(2.4, true, '31_warden_slam_back', 0);
  await warden(6, false, '32_warden_volley', 1);
  await warden(6, true, '33_warden_volley_back', 1);
  // (and standing beside the others, for his size)
  await clear();
  await put('warden', -70, -50);
  await put('skeleton', 40, -60);
  await put('guardian', 110, -30);
  await put('warden', -80, 70);
  await page.waitForTimeout(700);
  await snap('34_warden_beside_the_others');

  // ---- 7. in the dark: what glows, and what a cultist's fire lights ------------------------------------------
  await clear();
  const edge = Math.min(215, size.w / 2 - 22);
  const dark = [];
  for (const [what, dx, dy] of [['cultist', -edge, -30], ['skeleton', -edge + 40, 50], ['cultist', edge, 20], ['bat', edge - 30, -60], ['guardian', edge - 50, 80]]) dark.push([what, await put(what, dx, dy)]);
  await page.waitForTimeout(600);
  await snap('40_in_the_dark');
  for (const [what, id] of dark) {
    if (id === null) continue;
    const q = await look(id);
    if (q && what === 'cultist') check('a cultist in the dark: its fire is one of the lights of the room', q.lit && q.lights >= 1, `${q.lights} lights on its picture`);
  }

  // (every character the game asked for must be one the fonts can draw)
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) bad('text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
