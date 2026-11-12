// THE FLOORS' MONSTERS BAKED (the queue's make-floors-monsters-before-play, 11 Nov 2026). His words to the eight-sides chat,
// 11 Nov 2026, 21:30: “Explain to me why the game lags at literally every new screen regardless of introducing loading screens?”
// What that chat measured (tools/scenarios/new_screen.mjs): the loading screen waited for the hero's pictures only; each
// floor's monsters' frames were painted the first time each was shown, in play, on the thread that draws the game, 10 to 15 ms
// each (floor 6: 494 pictures, 5.4 s of painting, in the first 15 s of play; floor 11: 548, 5.6 s), until each of the floor's
// monsters had been seen in each of its moves from each side; and again on the next floor.
//
// So the monsters are made before play, as the heroes (render/baked.ts), the Swamp Colossus (render/colossus_baked.ts) and the
// town's people (render/townsfolk_baked.ts) are: every figure painted once when the game is built (tools/bake_monsters.mjs),
// shipped beside the game's page as sheets of pictures (monsters/<mark>/: <figure>.json and its sheets, a group a figure, so
// that a floor fetches its own kinds and no others), TAKEN IN UNDER THE LOADING SCREEN as a floor is come into (main.ts
// loadingFrame waits for them), and let go of as the floor is left, as its monsters' pictures always were (art/bestiary.ts
// forgetOthers, HEAVY_FIGURES). By his standing rule of 6 Nov 2026 that the game may carry files.
//
// THE PICTURES are the very ones the game would paint (the bake's page makes them with the game's own code, and each sheet is
// read back and checked against them, pixel by pixel), given into the same lists in the same places the painter's worker gives
// its into (art/bestiary.ts paintOrder, giveFrame), where a place is still unpainted.
// A FIGURE THAT COMES INTO A FLOOR LATER (one called up in a fight) is asked for as it is first seen (render/render.ts); the
// ones known to be called (`bringsOf`) are asked for with the floor's own, under the loading screen. While a figure's pictures
// are still coming, a frame of its not here yet is shown as the nearest that is (art/kit.ts LEFT_TO_PAINTER), never painted
// where the game is played.
// WHERE THEY ARE NOT TO BE HAD (no bake in this build, a page opened from a file, a file that will not load, a figure whose
// lists are not as they were baked) that figure is painted as it was before: by the painter's worker beside the game, and by
// the game itself what the worker has not come to. Nothing is lost but time.

import { giveFrame } from '../art/bestiary';
import type { Bestiary, MonsterFigure } from '../art/bestiary';
import type { ActorArt } from '../art/actor_types';
import type { Sprite } from '../engine/px';
import { bakeName, bakedFigures, figureLens } from './monsters_bake_list';
import type { MonsterBakeFile } from './monsters_bake_list';

export { HOLD_MOST_MB, TOO_BIG, bakeName, bakedFigures, figureLens } from './monsters_bake_list';
export type { MonsterBakeFile } from './monsters_bake_list';

declare const __MONSTER_BAKE__: string | undefined;

/**
 * The switches. `on`: off, the files are not asked for, and the monsters are painted as the game is played, as before.
 * `waitHeavy`: does the loading screen wait for a heavy figure's pictures too (a boss's: art/bestiary.ts HEAVY_FIGURES)? Off,
 * it waits for the floor's other monsters only, and a boss's, asked for with them, come in the seconds after it lifts (he
 * stands at the far end of his floor).
 */
export const MONSTERS_BAKED = { on: true, waitHeavy: true };

/** The folder beside the page the bakes are in, each in a folder of its own named by its mark (tools/build.mjs). */
export const MONSTER_BAKE_DIR = 'monsters';

/** The bake this build of the game was made with ('' : none). */
export function monsterBakeMark(): string {
  return typeof __MONSTER_BAKE__ === 'string' ? __MONSTER_BAKE__ : '';
}

/**
 * WHAT A FIGURE BRINGS INTO ITS FLOOR THAT IS NOT THERE AS THE FLOOR IS COME INTO: what it becomes (the Chained One as his
 * chains break; a kind's stages, `stages`: the Palimpsest more torn), and what it calls up in its fight (game/bosses.ts,
 * game/act1_rules/, game/game.ts: each `spawn` of a kind by name). Asked for with the floor's own, under the loading screen.
 * One missed here is asked for the moment it is first seen, and shown meanwhile as the nearest of its frames that has come.
 */
const BRINGS: Partial<Record<string, readonly MonsterFigure[]>> = {
  // (the Chained One as he will be with his next chain broken, and no further: a phone has not the room for all three at once,
  // as the painter has it, render/render.ts)
  chained: ['chained1'],
  chained1: ['chained2'],
  // (the Warden calls the dead out of the ground; the Amalgamation its bone beasts and its mites; the Fleshmancer and his
  // small ones raise the dead out of the heaps and the bodies)
  warden: ['skeleton'],
  amalgam: ['beast', 'mite'],
  fleshmancer: ['skeleton'],
  minifm: ['skeleton'],
  // (the Carrion Queen's flock, the Stag's wolves out of the fog, the eyespawn of floor 10's boss)
  queen: ['vulture'],
  stag: ['wolf'],
  eye: ['spawn'],
  // (the Crier's call answered; the Hushed watch's hound loosed; the Physician's patients; the glass Queen's reflections)
  crier: ['hushed'],
  watch: ['hound'],
  physician: ['patient'],
  gqueen: ['reflection'],
};
export function bringsOf(figure: MonsterFigure, stages?: (f: MonsterFigure) => readonly MonsterFigure[] | null | undefined): MonsterFigure[] {
  const out: MonsterFigure[] = [...(BRINGS[figure] ?? [])];
  for (const s of stages?.(figure) ?? []) if (!out.includes(s)) out.push(s);
  return out;
}

/** How many of a sheet's frames are cut from it at a time. */
const AT_ONCE = 96;
/** How many of a figure's sheets are fetched and opened at a time (a boss has thirty). */
const SHEETS_AT_ONCE = 3;
/**
 * How long a figure whose pictures are still coming is shown, for a frame not here yet, as the nearest that is (`coming`), in
 * thousandths of a second from when it was asked for. Its files beside the game come in well under a second; where they are
 * slow (a page on the web, a poor line), a monster is not left standing in one pose until they come: after this its frames
 * not here yet are painted as they are shown, as before, and the files' pictures fill the rest as they come.
 */
export const STAND_IN_MS = 5000;

type Get = (name: string) => Promise<Response>;

/** One figure's pictures, as asked for: for which pictures of the bestiary's (they are made again when a figure is forgotten), and how far it has come. */
interface Asked {
  art: ActorArt;
  state: 'loading' | 'done' | 'failed';
  /** When it was asked for (performance.now()). */
  at: number;
}

/**
 * THE BAKED PICTURES, TAKEN IN: `take` a figure as its floor is come into (main.ts, under the loading screen) or as it is
 * first seen (render/render.ts). They are let go of with the figure's other pictures, by the bestiary (forget, forgetOthers:
 * every picture given is the figure's own from then on), and a figure forgotten is taken in again the next time it is asked for.
 */
export class BakedMonsters {
  private asked = new Map<MonsterFigure, Asked>();
  private readonly names: ReadonlySet<MonsterFigure>;
  /** For measuring: frames taken in, frames not wanted (painted already), the loads done and those stopped (a figure forgotten as it came), how long each figure took last (ms), and what failed. */
  readonly stats = { given: 0, unwanted: 0, loads: 0, stopped: 0, ms: {} as Record<string, number>, failed: [] as string[] };

  constructor(
    private readonly mark: string,
    private readonly bestiary: () => Bestiary,
    private readonly get: Get = (name) => fetch(`${MONSTER_BAKE_DIR}/${mark}/${name}`),
    names: readonly MonsterFigure[] = bakedFigures(),
  ) {
    this.names = new Set(names);
  }

  /** Are the baked pictures to be had on this page at all (a bake in this build, a page served over the web)? */
  static toBeHad(): boolean {
    if (!MONSTERS_BAKED.on || !monsterBakeMark()) return false;
    if (typeof fetch !== 'function' || typeof createImageBitmap !== 'function' || typeof location === 'undefined') return false;
    return location.protocol === 'http:' || location.protocol === 'https:';
  }

  /** The baked pictures for this page, or null where there are none to be had. */
  static make(bestiary: () => Bestiary): BakedMonsters | null {
    return BakedMonsters.toBeHad() ? new BakedMonsters(monsterBakeMark(), bestiary) : null;
  }

  /** Is this figure one of the bake's (whether or not its pictures have come)? */
  has(figure: MonsterFigure): boolean {
    return this.names.has(figure);
  }

  /** Its pictures as the bestiary holds them now, if this figure's asking is for those (not for ones since forgotten). */
  private now(figure: MonsterFigure): Asked | null {
    const a = this.asked.get(figure);
    return a && a.art === this.bestiary().made(figure) ? a : null;
  }

  /**
   * A figure's pictures are wanted: fetched if they are not here or coming. True: they are the bake's (coming, or come), and
   * nobody else need paint them; false: they are not to be had (not baked, switched off, or failed), and are painted as before.
   */
  take(figure: MonsterFigure): boolean {
    if (!MONSTERS_BAKED.on || !this.names.has(figure)) return false;
    const was = this.asked.get(figure);
    // (one that failed is not asked for again: it would fail again, each time the figure was seen)
    if (was && was.state === 'failed') return false;
    const art = this.bestiary().of(figure);
    if (was && was.art === art) return true;
    const a: Asked = { art, state: 'loading', at: performance.now() };
    this.asked.set(figure, a);
    void this.load(figure, a);
    return true;
  }

  /**
   * Are this figure's pictures the bake's, still coming, and asked for no longer ago than STAND_IN_MS (a frame of its not here
   * yet is then shown as the nearest that is)?
   */
  coming(figure: MonsterFigure): boolean {
    if (!MONSTERS_BAKED.on) return false;
    const a = this.now(figure);
    return !!a && a.state === 'loading' && performance.now() - a.at < STAND_IN_MS;
  }

  /** Is there nothing more of this figure for the loading screen to wait for: its pictures have come whole, or none will? */
  settled(figure: MonsterFigure): boolean {
    if (!MONSTERS_BAKED.on || !this.names.has(figure)) return true;
    const a = this.asked.get(figure);
    if (a && a.state === 'failed') return true;
    return this.now(figure)?.state === 'done';
  }

  /** Have this figure's pictures come whole (for the tests)? */
  done(figure: MonsterFigure): boolean {
    return this.now(figure)?.state === 'done';
  }

  /** The failures forgotten (main.ts __dbg, after the switch is put on again by hand): each may be asked for once more. */
  again(): void {
    for (const [f, a] of this.asked) if (a.state === 'failed') this.asked.delete(f);
  }

  private async load(figure: MonsterFigure, a: Asked): Promise<void> {
    // (still wanted: the figure's pictures are the ones this was asked for, not forgotten since, and nothing has taken its place)
    const live = (): boolean => this.asked.get(figure) === a && this.bestiary().made(figure) === a.art;
    const t0 = a.at;
    const name = bakeName(figure);
    try {
      const r = await this.get(`${name}.json`);
      if (!live()) return void this.stats.stopped++;
      if (!r.ok) throw new Error(`${name}.json: ${r.status}`);
      const f = (await r.json()) as MonsterBakeFile;
      if (!live()) return void this.stats.stopped++;
      if (f.mark !== this.mark || f.figure !== figure) throw new Error(`${name}: of another bake`);
      // (the figure as the game has it now, against the bake's: the same lists, as long)
      const lens = figureLens(a.art);
      if (JSON.stringify(lens) !== JSON.stringify(f.lens)) throw new Error(`${name}: not as baked`);
      const wants = new Map<number, [number, number, number][]>();
      for (let n = 0; n + 3 < f.at.length; n += 4) {
        const fi = f.at[n + 3];
        let w = wants.get(fi);
        if (!w) wants.set(fi, (w = []));
        w.push([f.at[n], f.at[n + 1], f.at[n + 2]]);
      }
      // (a few sheets at a time, in the order they were baked: the frames wanted first are on the first. `stop`: why the load
      // ended early: the figure forgotten as it came, 'gone'; or what failed)
      let next = 0;
      let stop: 'gone' | Error | null = null;
      const sheets = async (): Promise<void> => {
        while (!stop && next < f.sheets.length) {
          const s = next++;
          try {
            const rs = await this.get(f.sheets[s]);
            if (stop) return;
            if (!live()) return void (stop = 'gone');
            if (!rs.ok) throw new Error(`${f.sheets[s]}: ${rs.status}`);
            const sheet = await createImageBitmap(await rs.blob(), { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
            try {
              if (stop) return;
              if (!live()) return void (stop = 'gone');
              const on: number[] = [];
              for (let fi = 0; fi < f.frames.length; fi++) if (f.frames[fi][0] === s) on.push(fi);
              for (let n = 0; n < on.length; n += AT_ONCE) {
                const part = on.slice(n, n + AT_ONCE);
                const bmps = await Promise.all(part.map((fi) => {
                  const [, x, y, w, h] = f.frames[fi];
                  return createImageBitmap(sheet, x, y, w, h, { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
                }));
                if (stop || !live()) {
                  for (const b of bmps) b.close();
                  if (!stop) stop = 'gone';
                  return;
                }
                for (let q = 0; q < part.length; q++) {
                  const fi = part[q];
                  // (one picture for every place that shows it, as the painter's worker hands a frame that is the same as another)
                  const sprite = { ...f.parts[f.frames[fi][5]], img: bmps[q] as unknown as HTMLCanvasElement } as Sprite;
                  let took = false;
                  for (const [v, l, i] of wants.get(fi) ?? []) if (giveFrame(a.art, v, l, i, sprite)) took = true;
                  if (took) this.stats.given++;
                  else {
                    this.stats.unwanted++;
                    bmps[q].close();
                  }
                }
              }
            } finally {
              sheet.close();
            }
          } catch (e) {
            if (!stop) stop = e instanceof Error ? e : new Error(String(e));
            return;
          }
        }
      };
      await Promise.all(Array.from({ length: Math.min(SHEETS_AT_ONCE, f.sheets.length) }, sheets));
      if (stop === 'gone' || (!stop && !live())) return void this.stats.stopped++;
      if (stop) throw stop;
      a.state = 'done';
      this.stats.loads++;
      this.stats.ms[figure] = Math.round(performance.now() - t0);
    } catch (e) {
      if (!live()) return void this.stats.stopped++;
      // (what had come of it stays, the figure's own; the rest is painted as before, by the painter and the game)
      a.state = 'failed';
      this.stats.failed.push(e instanceof Error ? e.message : String(e));
    }
  }
}
