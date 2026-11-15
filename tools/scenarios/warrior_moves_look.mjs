// THE WARRIOR'S MOVES, EVERY ONE, IN THE GAME (15 Nov 2026; his words to the main chat: “make sure all the animations for the
// warrior are correct”), on the page served as the published game is, its bake beside it:
//   OUT_DIR=shots/wmoves node tools/playtest.mjs --serve --file dist/wrapped.html --size 844x390 --dpr 2 --scenario tools/scenarios/warrior_moves_look.mjs --out shots/wmoves/x
// For each of his three weapons, and each weapon's change (the Whirlwind, Twin Axes, Tremors): in town standing and walking; then
// on floor 2 his three moves (the tap twice, for the second blow; the hold; the swipe), each facing down and right and then up and
// left, a picture every so often of the game's time (the game slowed); struck; and his fall. The pictures go to OUT_DIR/<weapon>/
// (tools/warrior_moves_sheet.py lays them out, a row a move). It ASKS: every clip each move wants is in his pictures, from all
// eight sides (Twin Axes' four, the crouches, the catch on the run); his weapon's group from the bake; none of his frames left to
// paint; his moves are his weapon's. TWIN=1: the Twin Axes' own pictures shown (render/figure.ts TWIN_AXES_SHOWN), for his film.
// Lines marked !! are problems.
import fs from 'node:fs';
import { log } from './lib.mjs';

const KITS = {
  greatsword: { talents: ['greatsword'], skills: ['strike', 'whirl', 'leap'], arms: undefined },
  gswhirlwind: { talents: ['greatsword', 'gswhirlwind'], skills: ['strike', 'whirl', 'leap'], arms: undefined, hold: true, only: ['hold'] },
  battleaxe: { talents: ['battleaxe'], skills: ['cleave', 'axethrow', 'chop'], arms: 'axe' },
  twinaxes: { talents: ['battleaxe', 'twinaxes'], skills: ['cleave', 'axethrow', 'chop'], arms: 'axe', only: ['hold', 'runthrow'] },
  warhammer: { talents: ['warhammer'], skills: ['smash', 'quake', 'charge'], arms: 'hammer' },
  tremors: { talents: ['warhammer', 'tremors'], skills: ['smash', 'quake', 'charge'], arms: 'hammer', only: ['hold'] },
};
/** What each weapon's pictures must hold, from every side (render/figure.ts reads them so). */
const WANTS = {
  greatsword: { clips: ['attack', 'attack2', 'whirl', 'whirlEnd', 'leap', 'reel', 'lurch', 'fall'], moves: [] },
  axe: { clips: ['attack', 'attack2', 'heavy', 'hold', 'release', 'leap', 'land', 'reel', 'lurch', 'fall'], moves: ['chopCrouch', 'cleaveAppear', 'runEmpty', 'runCatch', 'twinThrow', 'twinBraced', 'twinCatch', 'twinRunCatch'] },
  hammer: { clips: ['attack', 'attack2', 'heavy', 'leap', 'land', 'reel', 'lurch', 'fall'], moves: ['chargeCrouch'] },
};
const WAYS = { dr: [0.7071, 0.7071], ul: [-0.7071, -0.7071] };

export default async function (page) {
  const out = process.env.OUT_DIR || 'shots/wmoves';
  const only = (process.env.KITS || Object.keys(KITS).join(',')).split(',');
  const twin = process.env.TWIN === '1';
  let fails = 0;
  const check = (what, ok, detail = '') => { if (!ok) fails++; log(what, `${ok ? 'ok' : '!! FAILED'} ${detail}`); };
  const ev = (fn, arg) => page.evaluate(fn, arg);
  for (const name of only) {
    const K = KITS[name];
    const dir = `${out}/${name}`;
    fs.mkdirSync(dir, { recursive: true });
    const took = await ev(({ K, twin }) => {
      const D = window.__dbg;
      D.saving(false);
      D.twinAxesShown.on = twin;
      D.run('warrior', 9);
      D.autoLevel = false;
      D.autoWords = false;
      D.god = true;
      D.seasoned(30);
      const g = D.game();
      return K.talents.map((t) => `${t}: ${g.takeTalent(t) ?? 'taken'}`);
    }, { K, twin });
    log(`${name}: talents`, took.join(', '));
    // (his weapon's group from the bake)
    const group = K.arms ? `warrior-${K.arms}` : 'warrior';
    let st = null;
    for (let i = 0; i < 160; i++) {
      await page.waitForTimeout(250);
      st = await ev(() => window.__dbg.baked());
      if (!st || st.failed.length || (st.ms && st.ms[group] !== undefined)) break;
    }
    check(`${name}: his group ${group} from the bake`, !!st && !st.failed.length && st.ms && st.ms[group] !== undefined, JSON.stringify(st && { ms: st.ms, failed: st.failed }));
    // (every clip each move wants, from all eight sides, in town and in a dungeon)
    const missing = await ev(({ arms, want }) => {
      const heroes = window.__dbg.renderer.art.heroes;
      const out = [];
      for (const town of [false]) {
        const set = heroes.of('warrior', { twoHanded: true, town, ...(arms ? { weapon: arms } : {}) });
        for (const [side, s] of Object.entries(set)) {
          if (!s || typeof s !== 'object' || !('idle' in s)) continue;
          for (const k of want.clips) if (!s.clips || !s.clips[k] || !(s.clips[k].frames.length > 0)) out.push(`${side}.${k}`);
          for (const k of want.moves) if (!s.clips || !s.clips.moves || !s.clips.moves[k] || !(s.clips.moves[k].frames.length > 0)) out.push(`${side}.moves.${k}`);
        }
      }
      return out;
    }, { arms: K.arms, want: WANTS[K.arms ?? 'greatsword'] });
    check(`${name}: every clip his moves want, from every side`, missing.length === 0, missing.slice(0, 12).join(' '));
    // TOWN: standing, walking
    const shoot = async (tag, secs, n, act) => {
      const t0 = await ev(() => window.__dbg.game().time);
      if (act) await act();
      for (let i = 0; i < n; i++) {
        const want = t0 + (secs * i) / Math.max(1, n - 1);
        for (let k = 0; k < 400; k++) {
          const t = await ev(() => { const g = window.__dbg.game(); g.hero.life = g.hero.d.maxLife; return g.time; });
          if (t >= want) break;
          await page.waitForTimeout(15);
        }
        const at = await ev(() => { const D = window.__dbg; const h = D.game().hero; const g = D.at(h.x, h.y); const p = D.screen.toClient(g.x, g.y); return { x: p.x, y: p.y, anim: h.anim, empty: !!h.handsEmpty }; });
        const clip = { x: Math.max(0, Math.round(at.x - 95)), y: Math.max(0, Math.round(at.y - 120)), width: 190, height: 160 };
        await page.screenshot({ path: `${dir}/${tag}_${String(i).padStart(2, '0')}.png`, clip });
      }
    };
    if (!K.only) {
      await ev(() => { window.__dbg.slowmo = 0.25; });
      await shoot('town_stand', 1.0, 4);
      await page.keyboard.down('KeyD');
      await shoot('town_walk', 0.8, 6);
      await page.keyboard.up('KeyD');
      await ev(() => { window.__dbg.slowmo = 1; });
    }
    // FLOOR 2: an open spot, no one about but a skeleton who cannot hurt or die
    await ev(() => { const g = window.__dbg.game(); g.depth = 2; g.cleared = 1; g.enterDungeon(); });
    await page.waitForTimeout(2500);
    const skills = await ev(() => {
      const g = window.__dbg.game();
      const h = g.hero;
      const f = g.level.floor;
      let best = null;
      for (let ty = 3; ty < f.h - 3 && !best; ty++) for (let tx = 3; tx < f.w - 3 && !best; tx++) {
        let ok = true;
        for (let dy = -3; dy <= 3 && ok; dy++) for (let dx = -3; dx <= 3 && ok; dx++) if (g.level.walk[(ty + dy) * f.w + tx + dx] !== 1) ok = false;
        if (ok && Math.hypot(tx - h.x, ty - h.y) < 40) best = { x: tx + 0.5, y: ty + 0.5 };
      }
      if (best) { h.x = best.x; h.y = best.y; }
      g.monsters.length = 0;
      g.projectiles.length = 0;
      return h.skills.map((s) => s.id);
    });
    check(`${name}: his moves are his weapon's`, JSON.stringify(skills) === JSON.stringify(K.skills), JSON.stringify(skills));
    for (let i = 0; i < 12; i++) { await ev(() => { const g = window.__dbg.game(); g.hero.life = g.hero.d.maxLife; }); await page.waitForTimeout(250); }
    const ready = (way) => ev((way) => {
      const D = window.__dbg; const g = D.game(); const h = g.hero;
      h.fx = way[0]; h.fy = way[1];
      h.swingT = 0; h.mana = h.d.maxMana; h.life = h.d.maxLife;
      for (const s of h.skills) { s.cd = 0; s.charges = Math.max(1, s.maxCharges ?? s.charges); }
      g.monsters.length = 0;
      D.slowmo = 0.15;
    }, way);
    const moves = K.only ?? ['tap', 'hold', 'swipe', 'walk'];
    for (const [wn, way] of Object.entries(WAYS)) {
      for (const mv of moves) {
        await ready(way);
        const tag = `${mv}_${wn}`;
        if (mv === 'tap') {
          await shoot(tag, 1.3, 12, async () => {
            await ev((way) => { const g = window.__dbg.game(); const h = g.hero; g.useBasic(h.x + way[0] * 1.5, h.y + way[1] * 1.5); }, way);
            setTimeout(() => ev((way) => { const g = window.__dbg.game(); const h = g.hero; h.swingT = 0; g.useBasic(h.x + way[0] * 1.5, h.y + way[1] * 1.5); }, way).catch(() => {}), 0.42 / 0.15 * 1000);
          });
        } else if (mv === 'hold') {
          const secs = K.arms === 'axe' ? 2.2 : K.hold ? 1.6 : 1.2;
          if (K.hold) {
            // (held: the right button down toward a point before him, let go after a second)
            const p = await ev((way) => { const D = window.__dbg; const h = D.game().hero; const g = D.at(h.x + way[0] * 3, h.y + way[1] * 3); return D.screen.toClient(g.x, g.y); }, way);
            await page.mouse.move(p.x, p.y);
            await shoot(tag, secs, 14, async () => {
              await page.mouse.down({ button: 'right' });
              setTimeout(() => page.mouse.up({ button: 'right' }).catch(() => {}), 1.0 / 0.15 * 1000);
            });
          } else {
            await shoot(tag, secs, 14, () => ev((way) => { const g = window.__dbg.game(); const h = g.hero; g.useSkill(1, h.x + way[0] * 4, h.y + way[1] * 4); }, way));
          }
        } else if (mv === 'runthrow') {
          // (the axe thrown, and he runs while it flies: his run with empty hands, the catch on the run)
          const key = way[0] > 0 ? 'KeyD' : 'KeyA';
          await shoot(tag, 2.2, 14, async () => {
            await ev((way) => { const g = window.__dbg.game(); const h = g.hero; g.useSkill(1, h.x + way[0] * 4, h.y + way[1] * 4); }, way);
            setTimeout(() => page.keyboard.down(key).catch(() => {}), 0.5 / 0.15 * 1000);
          });
          await page.keyboard.up(key);
        } else if (mv === 'swipe') {
          // (the swipe is his evasive move: game.ts useEvasive, as tools/scenarios/warrior_baked.mjs makes it)
          await shoot(tag, 1.6, 12, () => ev((way) => {
            const g = window.__dbg.game(); const h = g.hero; const tx = h.x + way[0] * 3; const ty = h.y + way[1] * 3;
            g.useEvasive(tx, ty, { mx: 0, my: 0, aimX: tx, aimY: ty, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: true, evadeX: tx, evadeY: ty, potion: false, interact: false });
          }, way));
        } else if (mv === 'walk') {
          const key = way[0] > 0 ? 'KeyS' : 'KeyW';
          await page.keyboard.down(key);
          await shoot(tag, 0.8, 6);
          await page.keyboard.up(key);
        }
        await ev(() => { window.__dbg.slowmo = 1; });
        await page.waitForTimeout(900);
      }
    }
    if (!K.only) {
      // STRUCK, from before him and from behind; then HIS FALL
      for (const [tag, ox] of [['struck_front', 1], ['struck_behind', -1]]) {
        await ready(WAYS.dr);
        await shoot(tag, 0.6, 6, () => ev((ox) => {
          const g = window.__dbg.game(); const h = g.hero;
          const m = g.spawn('skeleton', h.x + ox * h.fx, h.y + ox * h.fy, 1, 0, false, g.rng);
          m.speed = 0; m.cd = 1e9;
          g.hurtHero(Math.round(h.d.maxLife * 0.3), 'phys', [], m);
        }, ox));
        await ev(() => { window.__dbg.slowmo = 1; });
        await page.waitForTimeout(700);
      }
      await ready(WAYS.dr);
      await shoot('fall', 2.0, 10, () => ev(() => { const D = window.__dbg; D.god = false; const g = D.game(); const h = g.hero; h.life = 1; g.hurtHero(h.d.maxLife * 5, 'phys', [], null); }));
      await ev(() => { window.__dbg.slowmo = 1; window.__dbg.god = true; });
    }
    // (none of his frames left to paint: the bake holds them all)
    const end = await ev((arms) => {
      const d = window.__dbg;
      return { workerFrames: d.painter.heroFrames };
    }, K.arms);
    log(`${name}: the worker painted`, `${end.workerFrames} of the hero's frames`);
  }
  if (fails) console.log(`  !! ${fails} check(s) failed`);
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
