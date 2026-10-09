// Entry point: builds the art, then runs the frame loop that ties input, rules, drawing and
// interface together.

import { FIGURE_SIZE, figureOf, makeBestiary } from './art/bestiary';
import { makeHeroArt } from './art/heroes';
import { makeHeroArt3 } from './art/heroes3';
import { useComboMends, useRangerStances } from './art/moves3';
import { makeIconArt } from './art/icons';
import { PAINTING } from './art/kit';
import { makeSpellArt } from './art/spells';
import { WALLS_BLOCKS, WALLS_FADING, WALL_LOOK, makeGroundArt, setWallLook } from './art/ground';
import { makeGateArt } from './art/gates';
import { makeHazardArt } from './art/hazards';
import { TRAPS } from './game/traps';
import { MODES } from './game/modes';
import type { WallLook } from './art/ground';
import { makeDungeonProps } from './art/props';
import { makeTownProps } from './art/town';
import { townSprite } from './art/townscene';
import { makeTownsfolk } from './art/townsfolk';
import { SMITH3 } from './art/smith3';
import { QUEST3, makeStoneArt } from './art/quest3';
import { makeTitleArt } from './art/title';
import { makeSmithTitle } from './art/title_smith';
import type { SmithTake } from './art/title_smith';
import { SMITH2_CHOSEN, makeSmith2Title } from './art/title_smith2';
import { botStep, newBot } from './dev/bot';
import type { BotState } from './dev/bot';
import { initAudio, isMuted, setMuted, sfx, speak } from './engine/audio';
import type { Speaker, SpeakerVoice } from './engine/audio';
import { MISSING_GLYPHS, drawText, textWidth } from './engine/font';
import { Input } from './engine/input';
import { LEDGE_H, screenDirToWorld, toWorldX, toWorldY } from './engine/iso';
import { spriteCovers } from './engine/px';
import type { Sprite } from './engine/px';
import { createScreen } from './engine/screen';
import { ARRIVAL_LINES, CLASSES, COMBO, FIRST_LEVELS, SKILLS, SLOT_OPENS, TUNE, useFirstLevels } from './game/defs';
import type { Limit } from './game/defs';
import { DOORS } from './game/doors';
import { MIX, RELIEF } from './game/dungeon';
import { Game, cleanMeta } from './game/game';
import type { RunSave } from './game/game';
import { SHAPES } from './game/level';
import type { Hall } from './game/level';
import { LOCK, LockOn, aimAhead, autoTargets, placedAim } from './game/lock';
import { AIM_MODES, emptyControls } from './game/state';
import { flowDir, flowField, lineOfSight } from './game/nav';
import type { AimMode, Controls, Level, Meta, Monster, PropInst, Station, TownVoice } from './game/state';
import { rollItem } from './game/items';
import { RNG } from './engine/rng';
import { CLASS_IDS, WORD_IDS } from './game/types';
import type { ClassId, Item, Rarity, Slot, WordId } from './game/types';
import { Fx, wx, wy } from './render/fx';
import { NAME_LIFT, Renderer, STATION_NAME } from './render/render';
import type { Art } from './render/render';
import { drawHud, drawMap } from './ui/hud';
import type { HudIn, HudOut } from './ui/hud';
import { guideBanner } from './ui/guide';
import { drawInventory, gameRect, newInvUi, resetInvUi } from './ui/inventory';
import type { Side } from './ui/inventory';
import { drawLexicon, lexiconSide, newLexUi } from './ui/lexicon';
import { ENTER_OUT, drawDeath, drawLevelUp, drawPause, drawTitle, enterLength, newPanels, newTitleUi, wakeLine } from './ui/panels';
import type { SmithPicture } from './ui/panels';
import { gateSide, stashSide, vendorSide } from './ui/town';
import { gambleSide, wordsmithSide } from './ui/trades';
import { THEME, Ui } from './ui/ui';
import { WORDS3, demo3, events3 } from './render/words3';

declare const __BUILD__: string;

/** Working title only. Change it here. */
// (the owner, 4 Oct 2026: "Let's try Wordsmith for now"; before that it was Wordhoard)
const TITLE = 'WORDSMITH';
/**
 * How long a fallen hero is shown before the words YOU DIED come up over them, in seconds: their
 * fall (about a second and a half: each hero's `fall`, art/hero_*.ts) and a moment of stillness.
 */
const FALL_SEEN = 2;
/** What each hero says when their voice is tried out on the class cards. */
const VOICE_SAMPLE: Record<ClassId, string> = { warrior: 'Was that it?', ranger: 'Quiet now.', mage: 'Jolly good.' };
/** Where everything is kept between visits (this browser only): the run in progress, the Lexicon and the stash. */
const SAVE_KEY = 'arpg.save';
/** Build 1 kept only the run, under this name. Still read, so an old run carries over. */
const OLD_SAVE_KEY = 'arpg.run';

/** Things in the world that are used by standing next to them: the town's services, the way home from a dungeon, the fallen wordsmith. */
type Spot = Station | 'portal' | 'body';
/**
 * The town's furniture that counts, when it is touched, as the person whose it is: the anvil and
 * the forge are the armourer, the tent and the trader in it are the mystic (whose service is used
 * from the table of wares, across from him), the slab of runes is the wordsmith.
 */
const SPOT_OF: Partial<Record<PropInst['kind'], Station>> = { anvil: 'armourer', forge: 'armourer', mystic: 'mystic', tentBack: 'mystic', runeSlab: 'wordsmith' };
/** How much of the screen each one covers, for fingers: [half width, height above its floor point] in game pixels. */
const SPOT_SIZE: Record<Spot | 'anvil' | 'forge' | 'tentBack' | 'runeSlab', readonly [number, number]> = {
  // (the gate is an arch in the wall, 64 wide and 55 high: its service is used from the floor before it)
  gate: [34, 70],
  portal: [26, 60],
  body: [22, 20],
  wordsmith: [18, 54],
  armourer: [18, 54],
  // (the mystic's is his table of wares, and what stands on it; and, by SPOT_OF, the trader behind it)
  // (Version 14.5: the town's things stand on the grid, and the sizes are those of what is drawn now:
  // the table runs along the grid, the tent is a canopy, the forge has its hood and flue)
  mystic: [34, 40],
  lexicon: [18, 44],
  stash: [20, 28],
  // (the shady man in his corner: his gamble, once the trades are open)
  stranger: [18, 54],
  anvil: [14, 26],
  forge: [20, 66],
  // (the tent is touched where it is painted, not by this box: SPOT_PAINTED. Of the box only its
  // middle is used, to say which of two things a touch is nearer to)
  tentBack: [40, 84],
  runeSlab: [18, 34],
};
/**
 * The things that are touched where they are PAINTED, and nowhere else, instead of by a box round
 * them. The boxes are for fingers, and suit what is no bigger than a finger. The tent is far
 * bigger, and no box: a roof that runs along the grid, with open floor on the screen in three of
 * the corners of any box that holds it. One of those corners is the floor before the gate, which
 * on the screen is where the roof's far corner comes to (Version 14.5: with a box round the tent,
 * a click on the gate's threshold sent the hero to the trader, and so did a click on the open
 * floor on the way to the smithy).
 */
const SPOT_PAINTED: ReadonlySet<PropInst['kind']> = new Set<PropInst['kind']>(['tentBack']);

interface SaveFile {
  v: 2;
  run: RunSave | null;
  meta: Meta;
}

/** The claude.ai page viewer's update hook: lets a new version of the page pick up where the old one was. Absent everywhere else. */
interface HotHook {
  ready?: (fn: (data: unknown) => void) => void;
  snapshot?: (fn: () => unknown) => void;
  data?: unknown;
}

/**
 * The town's services that have half the screen beside the inventory (Version 14.3: the owner,
 * "Vendors, stash, and lexicon would take up the left side so you would have access to your
 * inventory on the right side"). With the trades open (TUNE.tradesOpen) the wordsmith and the
 * stranger are two more (ui/trades.ts); until then the wordsmith opens the inventory alone, and
 * the stranger has nothing to offer.
 */
const TOWN_PANELS: readonly string[] = TUNE.tradesOpen ? ['gate', 'vendor', 'lexicon', 'stash', 'wordsmith', 'stranger'] : ['gate', 'vendor', 'lexicon', 'stash'];
/** The voice each of the town's people speaks a line in (the heroes' voices, more quietly: they have none of their own yet). */
const TOWN_VOICE: Record<TownVoice, readonly [Speaker, SpeakerVoice]> = { armourer: ['warrior', 'male'], mystic: ['mage', 'male'], wordsmith: ['mage', 'male'], stranger: ['ranger', 'male'] };
/** The inventory is on the screen: by itself, or beside one of those. */
const withInventory = (open: string): boolean => open === 'inv' || TOWN_PANELS.includes(open);

function start(carried: unknown, hot: HotHook | undefined): void {
  const scr = createScreen();
  scr.canvas.style.cursor = 'crosshair';
  const art: Art = {
    ground: makeGroundArt(),
    props: makeDungeonProps(),
    gates: makeGateArt(),
    hazards: makeHazardArt(),
    town: makeTownProps(),
    folk: makeTownsfolk(),
    // THE HEROES PAINTED OVER THE BONES (art/heroes3.ts) ARE THE GAME'S from Version 16: the
    // battle mage, the warrior in the pig-faced helm, the ranger with the moustache (the owner,
    // 7 Oct 2026, 00:34: "im happy with all three.  run the tests, throw them in the game").
    // The first heroes (art/heroes.ts) are still painted for a page opened with #heroes=old, so
    // that a picture of before and after can be made.
    heroes: new URLSearchParams(location.hash.slice(1)).get('heroes') === 'old' ? makeHeroArt() : makeHeroArt3(),
    bestiary: makeBestiary(),
    icons: makeIconArt(),
    spells: makeSpellArt(),
    // (THE MASTER RUNE-STONE, art/quest3.ts: a mock-up behind QUEST3, off; its pictures are painted the first time they are shown)
    quest: makeStoneArt(),
  };
  /** The two pictures behind the starting screen. */
  const titleArt = makeTitleArt();
  // WHICH START SCREEN. 'library' is the one the game has had since Version 11 (the library that
  // turns into the dream). The owner asked on 5 Oct 2026 for the wordsmith alone at his forge
  // table, the whole screen, the menu along the bottom (drawSmithMenu in ui/panels.ts). 'smith'
  // was the first painting of that (art/title_smith.ts: a bust behind his table, four moments),
  // which he was not sold on; 'floor' is the one he chose from the sketches that followed
  // (art/title_smith2.ts: the old skald leaning over us, seen from the floor). IT WAS 'library'
  // until he had seen the new one finished, moving, to his recipe (sent 20:46 on 5 Oct 2026) and
  // said yes (23:08: "everything else looks great"): 'floor' since Version 15. The test hook
  // `__dbg.titleLook('library')` still shows the old one. A picture is painted the first time
  // it is asked for.
  let titleLook: 'library' | 'smith' | 'floor' = 'floor';
  let smithTitle: SmithPicture | null = null;
  const ui = new Ui();
  const fx = new Fx();
  const renderer = new Renderer(art);
  const input = new Input(scr.canvas, scr.toGame, (x, y) => ui.blocks(x, y), () => scr.w);
  input.touchMode = scr.touch;
  input.onTouch = () => scr.sawTouch();
  input.onGesture = () => {
    initAudio();
    if (!awakeAsked) {
      awakeAsked = true;
      keepAwake();
    }
  };
  /** The sideways/upright switch only means something on a phone whose page is upright. */
  const turnLabel = (): string | null => (!scr.touch || !scr.upright ? null : scr.turned ? 'PLAY UPRIGHT' : 'PLAY SIDEWAYS');
  const flipTurn = (): void => scr.setTurnMode(scr.turned ? 'upright' : 'auto');
  const panels = newPanels();
  const controls = emptyControls();

  let game: Game | null = null;
  let mode: 'title' | 'play' = 'title';
  let bot: BotState | null = null;
  let last = performance.now();
  let clock = 0;
  let wantInteract = false;
  let calm = 0;
  let saveT = 0;
  let wasPaused = false;
  /** The death has been written to storage (the Lexicon's tally changes when a character dies). */
  let deathSaved = false;
  /**
   * How long the hero has been down, in seconds of the screen's own clock. A hero whose life runs
   * out FALLS first, in a world that has stopped (render/figure.ts: fallT; the owner, 6 Oct 2026:
   * "I want things to have weight"); the words YOU DIED wait until that has been seen (FALL_SEEN),
   * or until the player presses to get on with it.
   */
  let fellFor = 0;
  /** When the level-up choice last appeared, and what was open the frame before. */
  let levelShownAt = 0;
  let mapShownAt = 0;
  let wasOpen: string = 'none';
  /** Touch: the attack a tap asked for, kept until it has been carried out (or given up on). */
  let order: { id: number | null; x: number; y: number; t: number; uses: number } | null = null;
  /** (Strike's combo, game/defs.ts COMBO) ON A PC: a click on a monster made in the middle of a swing, waiting its turn as a tap does. */
  let click: { id: number | null; x: number; y: number; t: number; uses: number } | null = null;
  /** Touch: how often the slow ability had been used when the current hold began (-1 = no hold). One use per hold. */
  let holdUses = -1;
  /**
   * A beam that is being held with a thumb (the owner: "Fires towards your finger ... You can move
   * the beam around in different directions as long as you hold down"). It begins toward the
   * enemy the thumb means (aim help, as for any attack), which need not be where the thumb is.
   * As the thumb then slides, the beam turns with it, and over the first SWEEP_TRAVEL pixels of
   * that slide it comes round to point at the thumb itself: so a thumb that rests keeps what aim
   * help gave it, a thumb that sweeps has the beam under it, and nothing jumps. `off` is how far
   * round from the thumb the beam began; `k` how much of that has been given up (it never comes back).
   */
  let sweep: { off: number; k: number } | null = null;
  const SWEEP_TRAVEL = 36;
  /**
   * The thumb is down and held: keep an attack that goes on while held going (Controls.hold), and
   * point a beam. `begun`: the attack this hold asked for has started. `p`: where it was (or is
   * being) aimed; `w0`: where the thumb is in the world now; `moved`: how far it has slid from
   * where it landed, in game pixels.
   */
  const holdOn = (c: Controls, g: Game, begun: boolean, p: { x: number; y: number }, w0: { x: number; y: number }, moved: number): void => {
    const h = g.hero;
    const def = SKILLS[h.skills[1].id];
    if (!def.channel) return;
    c.hold = true;
    const round = Math.atan2(w0.y - h.y, w0.x - h.x);
    if (!begun || !sweep) {
      let off = Math.atan2(p.y - h.y, p.x - h.x) - round;
      while (off > Math.PI) off -= Math.PI * 2;
      while (off < -Math.PI) off += Math.PI * 2;
      sweep = { off, k: 0 };
    }
    if (def.kind !== 'beam') return;
    if (begun) sweep.k = Math.max(sweep.k, Math.min(1, moved / SWEEP_TRAVEL));
    const a = round + sweep.off * (1 - sweep.k);
    c.castX = h.x + Math.cos(a) * 6;
    c.castY = h.y + Math.sin(a) * 6;
  };
  /** Touch: the monster a tap last went for (its id). A blade keeps to it while it is in reach. */
  let fought: number | null = null;
  /** Touch, attacking the way the hero faces: the enemy locked onto, and the level it is on. */
  const lock = new LockOn();
  let lockLevel: Level | null = null;
  /** Something the player touched in order to use it: the hero walks there, and then it is used. */
  let errand: { kind: Spot; x: number; y: number; t: number; level: Level; flow: Uint16Array } | null = null;
  /** A class card pressed once while a saved run exists: a second press starts over. */
  let confirm: { cls: ClassId; t: number } | null = null;
  /**
   * PICKING A HERO (the owner, 6 Oct 2026, 22:24: "when you select the character in the selection
   * screen, they go into their battle stance, then warp out, and warp into the beginning of the
   * dungeon.  Then maybe a tag line ... Something thematic to each character").
   * `entering`: the hero picked is making ready on their card (ui/panels.ts): who, for how long
   * so far, how long it takes in all, and whether the warp has been heard yet. The run begins
   * when it is over, or at once if the screen is pressed again.
   * `arrived`: a hero who has just come into the world by that warp: how long ago, and the line
   * they have yet to say (null once it is said, and for one who arrives in town).
   */
  let entering: { cls: ClassId; t: number; long: number; heard: boolean } | null = null;
  let arrived: { t: number; line: string | null } | null = null;
  /** How long after they arrive a hero speaks, in seconds, and how long their line stays up: a moment for each letter, on top of the usual. */
  const ARRIVAL_SAYS = 0.75;
  const lineTime = (text: string): number => Math.max(2.6, 1.3 + text.length * 0.065);
  /** The starting screen: which of its pages is showing. */
  const titleUi = newTitleUi();
  /** The Lexicon: which page is open (it is read from the starting screen, and from its lectern in town). */
  const lexUi = newLexUi();
  let titleLex = false;
  /** The inventory: what is in hand there, and so on. */
  const invUi = newInvUi();
  /** When the inventory last appeared, and whether it opened by itself. */
  let invShownAt = 0;
  let invAuto = false;
  /** The class cards' voice switch was pressed: which of the three is to speak next, and when. */
  let voiceTry: { i: number; at: number } | null = null;
  /** The attacks as they were named, and the words they held, when the inventory was opened. */
  let invWas: { name: string; words: (WordId | null)[] }[] = [];
  /** How long nothing has been near enough to fight: a new word is offered a place in a quiet moment. */
  let quiet = 0;
  /** A word just picked up, announced at the top of the screen (`big`: a new player's first, announced large). */
  let toast: { word: WordId; t: number; big: boolean } | null = null;
  /** THE FIRST LEVELS: the ability that has just opened, for its "NEW MOVE" (ui/hud.ts). */
  let moveToast: { skill: number; t: number } | null = null;
  /** Every prompt of the first dungeon shown to the current character, in order (playtests check it). */
  const guideLog: string[] = [];

  // ---- saving ----------------------------------------------------------------------------------
  // Kept in this browser: the run in progress (so closing the page, or a phone call, does not end
  // it) and the Lexicon and stash, which outlast any one character. Automated tests switch
  // saving off.
  let saving = true;
  const validRun = (s: RunSave | null | undefined): RunSave | null => (s && s.v === 1 && CLASS_IDS.includes(s.cls) ? s : null);
  const readSave = (): { run: RunSave | null; meta: Meta } => {
    try {
      const text = localStorage.getItem(SAVE_KEY);
      if (text) {
        const f = JSON.parse(text) as Partial<SaveFile>;
        return { run: validRun(f.run), meta: cleanMeta(f.meta) };
      }
      const old = localStorage.getItem(OLD_SAVE_KEY);
      if (old) return { run: validRun(JSON.parse(old) as RunSave), meta: cleanMeta(null) };
    } catch {
      /* unreadable: start clean */
    }
    return { run: null, meta: cleanMeta(null) };
  };
  const loaded = readSave();
  /** The run as last written to storage: what "Continue" would bring back. */
  let saved: RunSave | null = loaded.run;
  /** The Lexicon and stash. One object for the life of the page; every character shares it. */
  let meta: Meta = loaded.meta;
  /**
   * The options' prompts switch: the next new character begins in the first dungeon, and is shown
   * how to play as they go. On until the prompts have been seen through once on this device; it can
   * be switched back on to see them again.
   */
  let guideOn = !meta.taught;
  const writeSave = (): void => {
    if (!saving) return;
    // (the practice room is never saved)
    // (a fallen hero is gone, unless they are a Normal hero (game/modes.ts): then what is kept is the
    // hero as they will wake in town, so that closing the page on the death screen changes nothing)
    if (game && mode === 'play' && !game.practice) saved = game.over ? game.wakeSave() : game.save();
    try {
      const file: SaveFile = { v: 2, run: saved, meta };
      localStorage.setItem(SAVE_KEY, JSON.stringify(file));
      localStorage.removeItem(OLD_SAVE_KEY);
    } catch {
      /* saving is a convenience; play goes on without it */
    }
  };
  /** The run is over (death, or the player ended it). The Lexicon and stash stay. */
  const clearSave = (): void => {
    if (!saving) return;
    saved = null;
    try {
      const file: SaveFile = { v: 2, run: null, meta };
      localStorage.setItem(SAVE_KEY, JSON.stringify(file));
      localStorage.removeItem(OLD_SAVE_KEY);
    } catch {
      /* nothing to do */
    }
  };
  /** Ask the phone not to dim the screen mid-fight. Purely optional: many browsers say no. */
  const keepAwake = (): void => {
    try {
      const nav = navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<unknown> } };
      if (nav.wakeLock && document.visibilityState === 'visible') nav.wakeLock.request('screen').catch(() => undefined);
    } catch {
      /* optional */
    }
  };
  let awakeAsked = false;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // switching away saves the run and pauses, so nobody comes back to a fight in progress
      writeSave();
      if (game && !game.over && mode === 'play' && panels.open === 'none' && !bot) panels.open = 'pause';
    } else if (awakeAsked) keepAwake();
  });
  window.addEventListener('pagehide', writeSave);

  const begin = (g: Game): void => {
    game = g;
    arrived = null;
    fx.clear();
    fx.messages = [];
    panels.open = 'none';
    panels.sel = null;
    panels.pick = null;
    panels.pick2 = null;
    mode = 'play';
    confirm = null;
    saveT = 0;
    deathSaved = false;
    fellFor = 0;
    order = null;
    holdUses = -1;
    sweep = null;
    lock.clear();
    lockLevel = null;
    fought = null;
    // (a new character: the quick attack is the one the ATTACKS page reads out)
    resetInvUi(invUi);
    invUi.focus = 0;
    invAuto = false;
    quiet = 0;
    toast = null;
    moveToast = null;
    guideLog.length = 0;
  };

  /** What a character is told on first setting foot in the town. */
  const welcome = (g: Game): void => {
    const banked = WORD_IDS.some((w) => meta.lexicon[w] > 0) || meta.stash.some((it) => it !== null);
    g.msg(banked ? 'The Lexicon and the stash hold what earlier characters left.' : 'The gate leads to the first dungeon.', THEME.text);
  };

  /**
   * A new character. With `guide`, they wake in the first dungeon and are shown how to play as they
   * go; without, they begin in town (as anyone does who has seen the prompts through).
   */
  const newRun = (cls: ClassId, seed?: number, guide = false): void => {
    const sd = seed ?? ((Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0);
    const g = guide ? Game.forFirstRun(cls, sd, meta) : new Game(cls, sd, meta);
    // (NORMAL OR HARDCORE, as the cards had it: game/modes.ts. Without the switch, the old rule.)
    if (MODES.on) g.mode = meta.mode;
    begin(g);
    if (!guide) welcome(g);
    writeSave();
  };

  /** Show the inventory. `focus`: the attack it was opened from. `word`: a spare word to have in hand already. */
  const openInventory = (focus = -1, word: WordId | null = null, auto = false): void => {
    panels.open = 'inv';
    panels.sel = null;
    resetInvUi(invUi, word, focus);
    // (the practice room is there for trying words: its inventory opens where the words go)
    if (game && game.practice) invUi.page = 'attacks';
    invAuto = auto;
    invWas = game ? game.hero.skills.map((s) => ({ name: s.r.name, words: [...s.front, ...s.behind] })) : [];
    // (the news of a word found has been read by now: it does not wait behind the screen to be shown again)
    toast = null;
    moveToast = null;
    if (game) game.offer = null;
    input.eat('Tab', 'KeyI');
    sfx('click');
  };

  // (LEDGES AND STAIRS, not in any dungeon yet: a page opened with #hall=ledges has the practice
  // room in the hall built for them, with its terrace, two flights of stairs, a pit and a gap)
  const hallAsked = new URLSearchParams(location.hash.slice(1)).get('hall');
  const PRACTICE_HALL: Hall = hallAsked === 'ledges' || hallAsked === 'steps' || hallAsked === 'mix' || hallAsked === 'traps' ? hallAsked : hallAsked !== null && SHAPES.some((k) => hallAsked === `shape:${k}`) ? (hallAsked as Hall) : 'arena';

  /** The practice room: a throwaway character with every word. It leaves the saved run, the Lexicon and the stash alone. */
  const startPractice = (cls: ClassId, seed?: number, hall: Hall = PRACTICE_HALL): void => {
    const g = Game.forPractice(cls, seed ?? ((Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0), hall);
    // (it has a Lexicon of its own, so nothing done there is learned; but the device's choice of limit holds there too)
    g.setLimit(meta.limit);
    begin(g);
  };

  /**
   * Touch: how attacks are aimed. The switch goes round the three ways (AIM_MODES): where the
   * thumb lands, at an enemy the game picks, the way the hero faces. Kept with the device.
   */
  const setAim = (aim: AimMode): void => {
    meta.aim = aim;
    // (a choice made: it is kept, whatever the game's own default becomes)
    meta.aimChosen = true;
    order = null;
    fought = null;
    holdUses = -1;
    sweep = null;
    lock.clear();
    writeSave();
    sfx('click');
  };
  const flipAim = (): void => setAim(AIM_MODES[(AIM_MODES.indexOf(meta.aim) + 1) % AIM_MODES.length]);

  /** Switch between cooldowns and mana as what limits the slow abilities: kept with the device, and felt at once. */
  const flipLimit = (): void => {
    const next: Limit = meta.limit === 'mana' ? 'cooldown' : 'mana';
    meta.limit = next;
    if (game) game.setLimit(next);
    writeSave();
    sfx('click');
  };

  const continueRun = (): void => {
    if (!saved) return;
    try {
      const g = Game.restore(saved, meta);
      begin(g);
      g.msg(`Welcome back. The gate leads to dungeon ${g.depth}.`, THEME.text);
    } catch {
      clearSave();
    }
  };

  /**
   * NORMAL MODE (game/modes.ts): the fallen hero wakes in town, as they went into the dungeon but
   * for what was found there and a share of their gold; the same dungeon waits beyond the gate.
   */
  const wake = (g: Game): void => {
    const run = g.wakeSave();
    const lost = g.losses();
    const depth = g.depth;
    if (!run) return;
    let w: Game;
    try {
      w = Game.restore(run, meta);
    } catch {
      return;
    }
    begin(w);
    // (one line, so that it reads the same where the newest line is at the top, as on a phone)
    w.msg(`You wake in town. ${lost ? wakeLine(lost, depth) : ''}`.trim(), THEME.text);
    writeSave();
    sfx('portal');
  };

  /** Open the panel for a town service the hero is standing at. */
  const openStation = (kind: Station): void => {
    // (until the trades are open, the wordsmith's work is done in the inventory alone: words are burned into gear there)
    if (kind === 'wordsmith' && !TUNE.tradesOpen) {
      input.eat('KeyE', 'KeyF', 'Enter');
      openInventory();
      return;
    }
    if (kind === 'lexicon') {
      lexUi.pick = null;
      lexUi.hand = null;
    }
    // (the two vendors have the one screen: the game is told whose shelf it is)
    if (kind === 'armourer' || kind === 'mystic') {
      if (game) game.vendor = kind;
      panels.open = 'vendor';
    } else panels.open = kind;
    panels.sel = null;
    panels.pick = null;
    panels.pick2 = null;
    panels.carry = null;
    panels.noteT = 0;
    // the inventory stands beside it: nothing in hand, on GEAR (as when it is opened alone)
    resetInvUi(invUi);
    invAuto = false;
    invWas = game ? game.hero.skills.map((s) => ({ name: s.r.name, words: [...s.front, ...s.behind] })) : [];
    toast = null;
    moveToast = null;
    if (game) game.offer = null;
    // the key that opened the panel must not also act inside it
    input.eat('KeyE', 'KeyF', 'Enter');
    sfx('click');
  };

  /** Picking a class starts a run at once, unless that would throw away a saved one. */
  const pickClass = (cls: ClassId): void => {
    if (titleUi.practice) {
      sfx('click');
      startPractice(cls);
      return;
    }
    if (saved && !(confirm && confirm.cls === cls && clock - confirm.t < 5)) {
      confirm = { cls, t: clock };
      return;
    }
    sfx('click');
    // (where the art has a picture of the hero making ready, they do that on their card first, and the run begins with them warping in: see `entering`)
    const long = enterLength(art, cls);
    if (long > 0) {
      entering = { cls, t: 0, long, heard: false };
      return;
    }
    newRun(cls, undefined, guideOn);
  };

  /** The hero picked has made ready and gone from their card: the run begins, and they warp in where it begins. */
  const enter = (cls: ClassId): void => {
    entering = null;
    newRun(cls, undefined, guideOn);
    if (!game) return;
    fx.arrive(game.hero.x, game.hero.y);
    sfx('portal');
    // (a line of their own as they come into a dungeon; in town there is nothing to say it about)
    const lines = ARRIVAL_LINES[cls];
    arrived = { t: 0, line: game.level.town || lines.length === 0 ? null : lines[Math.floor(Math.random() * lines.length)] };
  };

  /** The monster whose picture is under a screen point, if any. */
  const monsterAt = (g: Game, px: number, py: number): Monster | null => {
    const cam = renderer.cam;
    let best: Monster | null = null;
    let bd = 1e9;
    for (const m of g.monsters) {
      if (m.dead || !m.seen) continue;
      const sx = wx(cam, m.x, m.y);
      const sy = wy(cam, m.x, m.y);
      // (the figure as it stands, a little generously: art/bestiary.ts)
      const size = FIGURE_SIZE[figureOf(m)];
      const tall = size.top + 3;
      const wide = size.half + 1;
      if (Math.abs(px - sx) > wide || py > sy + 5 || py < sy - tall) continue;
      const d = Math.abs(px - sx) + Math.abs(py - (sy - tall / 2)) * 0.5;
      if (d < bd) {
        bd = d;
        best = m;
      }
    }
    return best;
  };

  /**
   * The town service (or the way home from a dungeon) whose picture or name is under a screen point.
   * The furniture of a townsperson's place counts as that person (SPOT_OF).
   */
  const spotAt = (g: Game, px: number, py: number): { kind: Spot; x: number; y: number } | null => {
    const cam = renderer.cam;
    const L = g.level;
    let best: { kind: Spot; x: number; y: number } | null = null;
    let bd = 1e9;
    // (`painted`: the thing's own picture, for one that is touched where it is painted and not by its box)
    const test = (kind: Spot, size: keyof typeof SPOT_SIZE, drawnX: number, drawnY: number, goX: number, goY: number, painted: Sprite | null = null): void => {
      const [wide, tall] = SPOT_SIZE[size];
      const sx = wx(cam, drawnX, drawnY);
      const sy = wy(cam, drawnX, drawnY);
      if (painted ? !spriteCovers(painted, px - Math.round(sx - painted.ax), py - Math.round(sy - painted.ay)) : Math.abs(px - sx) > wide || py > sy + 10 || py < sy - tall) return;
      const d = Math.hypot(px - sx, py - (sy - tall / 2));
      if (d < bd) {
        bd = d;
        best = { kind, x: goX, y: goY };
      }
    };
    /** The plate a service's name is written on, over it (render.ts), and a little round it for fingers: a name is touched like the thing it names. */
    const named = (st: { kind: Station; x: number; y: number }): void => {
      const half = (textWidth(STATION_NAME[st.kind], 'small') + 4) / 2 + 2;
      const sx = wx(cam, st.x, st.y);
      const top = wy(cam, st.x, st.y) - NAME_LIFT[st.kind];
      if (Math.abs(px - sx) > half || py < top - 3 || py > top + 8) return;
      const d = Math.hypot(px - sx, py - (top + 3));
      if (d < bd) {
        bd = d;
        best = { kind: st.kind, x: st.x, y: st.y };
      }
    };
    if (L.town) {
      for (const st of L.stations) {
        test(st.kind, st.kind, st.x, st.y, st.x, st.y);
        named(st);
      }
      for (const p of L.props) {
        const whose = SPOT_OF[p.kind];
        if (!whose) continue;
        const st = L.stations.find((q) => q.kind === whose);
        // (a person is the size of the wordsmith; a thing has a size of its own)
        if (st) test(st.kind, p.kind === 'mystic' ? 'wordsmith' : (p.kind as 'anvil' | 'forge' | 'tentBack' | 'runeSlab'), p.x, p.y, st.x, st.y, SPOT_PAINTED.has(p.kind) ? townSprite(art, p.kind, p.variant, 0) : null);
      }
    } else {
      if (L.portal && L.portal.state === 1) test('portal', 'portal', L.portal.x, L.portal.y, L.portal.x, L.portal.y);
      // the fallen wordsmith, once it has been seen: pressing it sends the hero to search it
      const b = L.body;
      if (b && b.state === 0 && L.explored[b.ty * L.floor.w + b.tx]) test('body', 'body', b.x, b.y, b.x, b.y);
    }
    return best;
  };

  const readControls = (g: Game, dt: number): void => {
    const c = controls;
    const h = g.hero;
    const cam = renderer.cam;
    c.mx = 0;
    c.my = 0;
    c.fire = false;
    c.approach = false;
    c.face = false;
    c.cast = false;
    c.hold = false;
    c.evade = false;
    c.potion = false;
    c.interact = wantInteract;
    renderer.lockId = null;
    wantInteract = false;
    input.mark = null;
    // (LEDGES AND STAIRS: where the ground is lifted, the place under the pointer is the highest
    // ground that is drawn there: raised floor hides the floor behind it. Tried from the top down.)
    const world = (px: number, py: number): { x: number; y: number } => {
      const lift = cam.lift;
      if (lift) {
        // (down to SUNKEN floor: where a place on the room's own floor and a place on sunken floor
        // are drawn on one pixel, the room's floor is the one in front: it is tried first)
        for (let up = LEDGE_H; up >= -LEDGE_H; up--) {
          const x = toWorldX(px - cam.ox, py + up - cam.oy);
          const y = toWorldY(px - cam.ox, py + up - cam.oy);
          if (Math.abs(lift(x, y) - up) <= 0.75) return { x, y };
        }
      }
      return { x: toWorldX(px - cam.ox, py - cam.oy), y: toWorldY(px - cam.ox, py - cam.oy) };
    };

    let sx = 0;
    let sy = 0;
    const k = input.keys;
    if (k.has('KeyW') || k.has('ArrowUp')) sy -= 1;
    if (k.has('KeyS') || k.has('ArrowDown')) sy += 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) sx -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) sx += 1;
    if (input.stick.active) {
      sx = input.stick.dx;
      sy = input.stick.dy;
    }
    const mag = Math.min(1, Math.hypot(sx, sy));
    const moving = mag > 0.18;
    if (moving) {
      const v = screenDirToWorld(sx, sy);
      // THE STICK GOES AT ONE SPEED (the owner, 8 Oct 2026, 22:25: "Also can you change the movement
      // speed so it’s constant no matter where the joystick is in relation to the center"): pushed
      // past the small still middle, the hero goes at full speed whatever the thumb's distance.
      // (Before, the speed grew with it, full only at STICK_RADIUS.)
      const k = input.stick.active ? 1 : mag;
      c.mx = v.x * k;
      c.my = v.y * k;
    }

    // A touch or a click on something that is used by standing next to it sends the hero there.
    // (A monster in front of it is still a monster: that touch is an attack.)
    const poke = input.touchMode ? input.poke : input.lpress;
    const spot = poke && !monsterAt(g, poke.x, poke.y) ? spotAt(g, poke.x, poke.y) : null;
    if (spot) {
      const f = g.level.floor;
      errand = { kind: spot.kind, x: spot.x, y: spot.y, t: 0, level: g.level, flow: flowField(g.level.walk, f.w, f.h, spot.x, spot.y, Infinity, undefined, g.level.step) };
      order = null;
      sfx('click');
    } else if (poke) errand = null;

    if (!input.touchMode) {
      // aim a little below the cursor: characters and shots are drawn above the floor
      const a = world(input.mx, input.my + 8);
      c.aimX = a.x;
      c.aimY = a.y;
      const shift = k.has('ShiftLeft') || k.has('ShiftRight');
      const target = monsterAt(g, input.mx, input.my);
      if (target) {
        c.aimX = target.x;
        c.aimY = target.y;
      }
      // STRIKE'S COMBO (game/defs.ts, COMBO): A CLICK MADE IN THE MIDDLE OF A SWING WAITS ITS TURN, as a
      // tap does on a phone (the touch controls below, `order`), so that two quick clicks are the two
      // swings and not one. Only a click that attacks (on a monster, with Shift, or walking); it is
      // given up when the swing it waited for has landed, after 1.2 seconds, or if its monster dies.
      if (COMBO.on && SKILLS[h.skills[0].id].kind === 'melee') {
        if (input.lpress && (target || moving || shift)) {
          // (a swing already wound up lands without it: it waits for the one after)
          const under = h.windup !== null && h.windup.skill === 0 ? 1 : 0;
          click = { id: target ? target.id : null, x: c.aimX, y: c.aimY, t: 0, uses: h.skills[0].uses + under };
        }
        if (click) {
          const o = click;
          o.t += dt;
          const was = o.id === null ? null : g.monsters.find((m) => m.id === o.id && !m.dead) ?? null;
          if (h.skills[0].uses > o.uses || o.t > 1.2 || (o.id !== null && !was)) click = null;
          else if (!input.lmb) {
            const a = was ?? o;
            c.aimX = a.x;
            c.aimY = a.y;
            c.fire = true;
            c.approach = !!was && !moving;
          }
        }
      } else click = null;
      if (input.lmb) {
        if (target || moving || shift) {
          c.fire = true;
          c.approach = !!target && !moving && !shift;
        } else {
          // open ground: walk toward the cursor
          const g0 = world(input.mx, input.my);
          const dx = g0.x - h.x;
          const dy = g0.y - h.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0.4) {
            c.mx = dx / dist;
            c.my = dy / dist;
          }
        }
      }
      if (input.rpress || input.rmb) {
        const p = target ?? world(input.mx, input.my);
        c.cast = true;
        c.castX = p.x;
        c.castY = p.y;
        // (an attack that goes on while held goes on for as long as the button is down, toward the pointer)
        c.hold = input.rmb;
      }
      if (input.pressed('Space')) {
        const p = world(input.mx, input.my);
        c.evade = true;
        c.evadeX = p.x;
        c.evadeY = p.y;
      }
      if (input.pressed('KeyQ')) c.potion = true;
      if (input.pressed('KeyE') || input.pressed('KeyF')) c.interact = true;
    } else if (meta.aim === 'auto') {
      // Touch, with everything aimed by the game (the owner, 4 Oct 2026, 21:10: "a third option to
      // the attacks: option which will auto aim everything. So any ability that goes where you
      // tap or hold will auto target an enemy"). Where the right thumb lands does not matter: TAP
      // is the quick attack and HOLD the slow one, each at the enemy game/lock.ts picks
      // (autoTargets: the nearest one awake and in sight, kept until another is clearly nearer;
      // a blade or a slam goes first for one it can reach). A ring marks it. With nothing to aim
      // at, they go the way the hero faces. The hero is not turned for the player, as the 'face'
      // way turns them: they walk and face as the left thumb says. SWIPE goes the way it is swiped.
      if (lockLevel !== g.level) {
        lock.clear();
        lockLevel = g.level;
      }
      const quick = h.skills[0];
      const slow = h.skills[1];
      const melee = SKILLS[quick.id].kind === 'melee';
      const aims = autoTargets(g, lock.update(g, dt), fought);
      c.aimX = h.x + h.fx;
      c.aimY = h.y + h.fy;
      if (aims.quick) renderer.lockId = aims.quick.id;

      // TAP: one use of the quick attack, at the enemy picked (a quick touch right on a monster is
      // a tap too, whichever side of the screen it is on: a newcomer told to "tap" taps the
      // monster). The hero walks into reach first if need be, so the tap is kept as an order until
      // it is carried out, exactly as where the thumb aims.
      const touched = input.tap ?? (input.poke && !spot && monsterAt(g, input.poke.x, input.poke.y) ? input.poke : null);
      if (touched && !spot) {
        order = { id: aims.quick ? aims.quick.id : null, x: h.x + h.fx * 3, y: h.y + h.fy * 3, t: 0, uses: quick.uses };
        if (aims.quick) fought = aims.quick.id;
      }
      if (order) {
        const o = order;
        o.t += dt;
        // (the one it was for is dead: it goes for whatever is picked now, so a tap is never wasted on the air)
        let target = o.id === null ? null : g.monsters.find((m) => m.id === o.id && !m.dead) ?? null;
        if (!target && o.id !== null && aims.quick) {
          target = aims.quick;
          o.id = target.id;
        }
        if (quick.uses > o.uses || o.t > 3 || (o.id !== null && !target)) order = null;
        else {
          const a = target ?? { x: h.x + h.fx * 3, y: h.y + h.fy * 3 };
          c.aimX = a.x;
          c.aimY = a.y;
          c.fire = !(melee && target && moving && !g.quickReaches(target));
          c.approach = !!target && !moving;
        }
      }

      // HOLD: the slow attack, once per hold, at the enemy picked: a thing that is placed (the orb)
      // is set on it, a slam lands on it, a beam burns toward it. One that goes on while held is
      // kept going for as long as the thumb is down, and a beam keeps to the enemy as it moves (and
      // goes on to the next when that one falls).
      const aim = input.aim;
      if (aim.active && aim.held) {
        if (holdUses < 0) holdUses = slow.uses;
        const def = SKILLS[slow.id];
        const reach = Math.min(def.range > 0 ? def.range : 3, 4);
        // (a volley is put where the enemy is going: see placedAim)
        const p = aims.slow ? placedAim(g, aims.slow, def.kind) : { x: h.x + h.fx * reach, y: h.y + h.fy * reach };
        if (slow.uses === holdUses) {
          c.cast = true;
          c.castX = p.x;
          c.castY = p.y;
        }
        if (def.channel) {
          c.hold = true;
          if (def.kind === 'beam') {
            c.castX = p.x;
            c.castY = p.y;
          }
        }
        if (aims.slow) renderer.lockId = aims.slow.id;
      } else {
        holdUses = -1;
        sweep = null;
      }
      if (input.flick) {
        const v = screenDirToWorld(input.flick.dx, input.flick.dy);
        c.evade = true;
        c.evadeX = h.x + v.x * 6;
        c.evadeY = h.y + v.y * 6;
      }
    } else if (meta.aim === 'face') {
      // Touch, with attacks going the way the hero faces (the owner's experiment of 4 Oct 2026:
      // game/lock.ts has his words and the rules of the lock). Where the right thumb lands does
      // not matter: TAP is the quick attack, HOLD the slow one, SWIPE the evasive move.
      if (lockLevel !== g.level) {
        lock.clear();
        lockLevel = g.level;
      }
      // A quick touch right on a monster is an attack whichever side of the screen it is on, as
      // it always was (a newcomer told to "tap" taps the monster). It does not AIM the attack:
      // where the thumb lands is not to matter. (LOCK.touchPicks would make it pick that monster
      // out as the one locked onto; it is off until the owner has felt the plain version.)
      const touched = input.tap ?? (input.poke && !spot ? input.poke : null);
      const picked = touched ? monsterAt(g, touched.x, touched.y) : null;
      if (picked && LOCK.touchPicks) lock.pin(picked);
      const target = lock.update(g, dt);
      const slow = h.skills[1];
      // (with nothing locked: a monster standing roughly ahead, else the point straight ahead)
      const ahead = target ? null : aimAhead(g, Math.min(SKILLS[slow.id].range, 4));
      if (target) {
        // in a fight: the hero stays turned toward the enemy locked onto, whichever way they walk
        c.aimX = target.x;
        c.aimY = target.y;
        c.face = true;
        renderer.lockId = target.id;
      } else {
        c.aimX = h.x + h.fx;
        c.aimY = h.y + h.fy;
      }

      // TAP: one use of the quick attack. A tap made in the middle of a swing waits its turn.
      if ((input.tap || picked) && !spot) order = { id: null, x: 0, y: 0, t: 0, uses: h.skills[0].uses };
      if (order) {
        order.t += dt;
        if (h.skills[0].uses > order.uses || order.t > 1.2) order = null;
        else {
          if (ahead) {
            c.aimX = ahead.x;
            c.aimY = ahead.y;
          }
          c.fire = true;
        }
      }

      // HOLD: the slow attack, once per hold: at the enemy locked onto, else ahead of the hero.
      const aim = input.aim;
      if (aim.active && aim.held) {
        if (holdUses < 0) holdUses = slow.uses;
        const p = (target ? placedAim(g, target, SKILLS[slow.id].kind) : null) ?? ahead ?? { x: h.x + h.fx, y: h.y + h.fy };
        if (slow.uses === holdUses) {
          c.cast = true;
          c.castX = p.x;
          c.castY = p.y;
        }
        holdOn(c, g, slow.uses !== holdUses, p, world(aim.x, aim.y), Math.hypot(aim.x - aim.sx, aim.y - aim.sy));
      } else {
        holdUses = -1;
        sweep = null;
      }
      if (input.flick) {
        const v = screenDirToWorld(input.flick.dx, input.flick.dy);
        c.evade = true;
        c.evadeX = h.x + v.x * 6;
        c.evadeY = h.y + v.y * 6;
      }
    } else {
      // Touch, with attacks going where the thumb lands (the default; the other way is switched
      // on in OPTIONS and in the pause menu). The owner's rule: the ability with the shorter base
      // cooldown is on TAP, the longer one on HOLD (each class lists its quick ability first; a
      // test keeps it that way).
      c.aimX = h.x + h.fx;
      c.aimY = h.y + h.fy;
      const quick = h.skills[0];
      const slow = h.skills[1];
      /** A hero who fights with a blade (the warrior): see nearAssist. */
      const melee = SKILLS[quick.id].kind === 'melee';

      // TAP: one use of the quick ability. A thumb is a blunt pointer and hides what it points
      // at, so a tap gets aim help: the monster under it, else one roughly that way, else the
      // nearest one already fighting. The hero walks into range first if need be, so a tap is
      // remembered as an order until it has been carried out. A tap made mid-swing waits its turn.
      // (The left of the screen belongs to the walking thumb, so a quick touch there is not an
      // attack. But a newcomer told to "tap a monster" taps the monster wherever it stands: a quick
      // touch that lands on one is an attack on it, whichever side of the screen it is on.)
      //
      // A BLADE finds its enemy as the orb does (the owner, having played the mage: "Just give
      // the same targeting that the mage has to the melee attacks as well"). For a shot, any
      // monster the thumb points toward will do: it gets there. For a sword it will not: so one
      // within reach comes before any that the thumb happens to point toward, and the one being
      // fought already before any other.
      let tap = input.tap;
      if (!tap && input.poke && !spot) {
        const q = world(input.poke.x, input.poke.y + 8);
        if (monsterAt(g, input.poke.x, input.poke.y) || g.monsterNear(q.x, q.y, 1.0)) tap = input.poke;
      }
      if (tap && !spot) {
        const p = world(tap.x, tap.y + 8);
        // (the thumb right on a monster means that monster; a thumb that only lands NEAR one, far
        // from the hero, does not outrank an enemy the blade can reach)
        const target = monsterAt(g, tap.x, tap.y) ?? (melee ? g.nearAssist(SKILLS[quick.id].range * quick.r.size * 0.9, fought) : null) ?? g.monsterNear(p.x, p.y, 1.5) ?? g.aimAssist(p.x, p.y);
        order = { id: target ? target.id : null, x: p.x, y: p.y, t: 0, uses: quick.uses };
        if (target) fought = target.id;
      }
      if (order) {
        const o = order;
        o.t += dt;
        const target = o.id === null ? null : g.monsters.find((m) => m.id === o.id && !m.dead) ?? null;
        if (quick.uses > o.uses || o.t > 3 || (o.id !== null && !target)) order = null;
        else {
          const a = target ?? o;
          c.aimX = a.x;
          c.aimY = a.y;
          // A blade out of reach of its enemy does not swing at the air. With the left thumb idle
          // the hero walks into reach by themselves (the rules do that); with the left thumb
          // steering, the blow waits until the hero has got there, and lands the moment they have.
          c.fire = !(melee && target && moving && !g.quickReaches(target));
          c.approach = !!target && !moving;
          // (the mark sits on its body: two fifths of the way up it)
          if (target) input.mark = { x: wx(cam, target.x, target.y), y: wy(cam, target.x, target.y) - Math.round(FIGURE_SIZE[figureOf(target)].top * 0.4) };
        }
      }

      // HOLD: the slow ability, once per hold. If it is still cooling down it goes off the moment
      // it is ready, as long as the thumb stays down. A thing that is PLACED (the trap) goes where
      // the thumb is. A blow struck beside the hero (the slam) lands on the monster under the
      // thumb, else on an enemy near enough to be caught by it, else toward whoever the aim help
      // finds: until Version 11.1 it landed under the thumb, which for a thumb resting on the
      // right of the screen meant to the right of the hero, whoever stood to the left.
      // An attack that goes on while it is held (a beam, a whirlwind) goes on for as long as the
      // thumb stays down. A beam begins toward the monster under the thumb, else one near it, else
      // one the aim help finds that way, else the thumb itself; then it turns as the thumb moves.
      const aim = input.aim;
      if (aim.active && aim.held) {
        if (holdUses < 0) holdUses = slow.uses;
        const w0 = world(aim.x, aim.y);
        let p = w0;
        if (slow.uses === holdUses) {
          const def = SKILLS[slow.id];
          const near = def.kind === 'burst' ? g.nearAssist(def.range + def.radius * slow.r.size * 0.8, fought) : null;
          const on = monsterAt(g, aim.x, aim.y) ?? near ?? g.monsterNear(w0.x, w0.y, 1.2) ?? (def.kind === 'burst' || def.kind === 'beam' ? g.aimAssist(w0.x, w0.y) : null);
          p = on ?? w0;
          c.cast = true;
          c.castX = p.x;
          c.castY = p.y;
        }
        holdOn(c, g, slow.uses !== holdUses, p, w0, Math.hypot(aim.x - aim.sx, aim.y - aim.sy));
      } else {
        holdUses = -1;
        sweep = null;
      }
      if (input.flick) {
        const v = screenDirToWorld(input.flick.dx, input.flick.dy);
        c.evade = true;
        c.evadeX = h.x + v.x * 6;
        c.evadeY = h.y + v.y * 6;
      }
    }

    // The errand: walk to what was touched, then use it. Steering, or doing anything else, calls it off.
    if (errand) {
      const e = errand;
      e.t += dt;
      const d = Math.hypot(e.x - h.x, e.y - h.y);
      if (e.level !== g.level || moving || c.cast || c.evade || e.t > 12) errand = null;
      else if (d < (e.kind === 'portal' ? 1.5 : e.kind === 'body' ? 1.0 : TUNE.useRange - 0.25)) {
        errand = null;
        c.mx = 0;
        c.my = 0;
        if (e.kind === 'portal') c.interact = true;
        // (the body is searched by being walked up to: there is nothing more to press)
        else if (e.kind !== 'body') openStation(e.kind);
      } else {
        const f = g.level.floor;
        const walk = g.level.walk;
        const ux = (e.x - h.x) / d;
        const uy = (e.y - h.y) / d;
        // with a clear run to the spot beside it, walk straight; otherwise follow the path round what is in the way
        // (a ledge is in the way as a wall is: the way round it is by the stairs)
        const straight = lineOfSight(walk, f.w, f.h, h.x, h.y, e.x - ux * 1.35, e.y - uy * 1.35) && g.walksStraight(h.x, h.y, e.x - ux * 1.35, e.y - uy * 1.35);
        const v = straight ? { x: ux, y: uy } : flowDir(e.flow, walk, f.w, f.h, h.x, h.y, undefined, g.level.step);
        if (v.x === 0 && v.y === 0) {
          // on its tile already, or no path the field knows: head straight for it
          v.x = ux;
          v.y = uy;
        }
        c.mx = v.x;
        c.my = v.y;
        c.fire = false;
        c.approach = false;
        input.mark = { x: wx(cam, e.x, e.y), y: wy(cam, e.x, e.y) - 14 };
      }
    }
  };

  /** Deal with what the rules reported: open town panels, start effects, play sounds. */
  const drain = (g: Game): void => {
    if (!g.events.length) return;
    for (const e of g.events) {
      if (e.t === 'station' && !bot) openStation(e.kind);
      // (words set in the inventory may be moved about before it closes: what came of it is shown then)
      else if (e.t === 'worded' && panels.open !== 'inv') fx.wordJoined(g.hero.x, g.hero.y, e.word, e.name);
      else if (e.t === 'moveOpen') moveToast = { skill: e.skill, t: 0 };
      else if (e.t === 'wordGot') {
        // a new player's first word is the big moment: it is announced large, and the game holds its breath
        const big = !!g.guide && !g.guide.set;
        toast = { word: e.word, t: 0, big };
        if (big) fx.freeze = Math.max(fx.freeze, 0.35);
        // (the word is seen and named before any screen opens for it)
        quiet = 0;
      } else if (e.t === 'quip') {
        // the hero has something to say about a big kill: heard in their own voice (it is drawn by the effects)
        speak(g.hero.cls, g.voice, e.text);
      } else if (e.t === 'tag') {
        // one of the town's people has a word for the hero as they come up (drawn by the effects, over whoever said it)
        speak(TOWN_VOICE[e.who][0], TOWN_VOICE[e.who][1], e.text, 0.55);
      } else if (e.t === 'guide') {
        guideLog.push(e.step);
        if (e.step === 'done') {
          // the prompts have been seen through: the next character begins in town
          guideOn = false;
          g.msg('Words are rare. A rune over a monster\'s head means it carries one. The boss always does.', '#b0f0dc');
          writeSave();
        }
      }
    }
    const levelled = g.events.some((e) => e.t === 'levelup');
    fx.handle(g.events, (n, v) => sfx(n, v === undefined ? undefined : { vol: v }));
    // (the new words' looks, called up by what the rules say happened: render/words3.ts)
    if (WORDS3.on) events3(g.events, g, fx);
    g.events.length = 0;
    if (levelled) fx.celebrate(g.hero.x, g.hero.y);
  };

  const frame = (now: number): void => {
    // (playtests can slow time down to photograph effects that last a fraction of a second)
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)) * dbg.slowmo;
    last = now;
    clock += dt;
    input.beginFrame();
    const cg = scr.g;
    ui.begin(cg, scr.w, scr.h, input.uiPress, input.mx, input.my, input.touchMode);
    ui.held = input.hold.active ? { x: input.hold.x, y: input.hold.y } : null;
    ui.release = input.uiRelease;

    if (mode === 'title' || !game) {
      if (confirm && clock - confirm.t >= 5) confirm = null;
      // (a hero who has been picked is making ready on their card: see `entering`. The warp is
      // heard as they begin to go; a press anywhere lets them go at once.)
      if (entering) {
        entering.t += dt;
        if (!entering.heard && entering.t >= entering.long - ENTER_OUT) {
          entering.heard = true;
          sfx('dodge');
        }
        if (titleUi.page !== 'class' || titleLex || input.pressed('Escape')) {
          // (Escape: they stand down, and the cards are as they were)
          entering = null;
          input.eat('Escape');
        } else if (entering.t >= entering.long || (ui.press && entering.t > 0.15)) {
          const cls = entering.cls;
          ui.press = null;
          enter(cls);
        }
      }
      // (while the Lexicon lies open over the menu, the menu does not listen)
      const press = ui.press;
      if (titleLex) ui.press = null;
      const res = drawTitle(ui, art, titleArt, clock, TITLE, titleUi, {
        turn: turnLabel(),
        resume: saved ? `${CLASSES[saved.cls].name}, level ${saved.level}, dungeon ${saved.depth}${MODES.on && saved.mode === 'hardcore' ? ', Hardcore' : ''}` : null,
        note: saved && confirm && !titleUi.practice ? `${input.touchMode ? 'Tap' : 'Choose'} ${CLASSES[confirm.cls].name} again to start over. Your saved ${CLASSES[saved.cls].name} will be lost.` : null,
        guide: guideOn,
        limit: meta.limit,
        aim: scr.touch ? meta.aim : null,
        muted: isMuted(),
        voice: meta.voice,
        mode: MODES.on && !titleUi.practice ? meta.mode : null,
        speaking: voiceTry && voiceTry.i > 0 && titleUi.page === 'class' ? CLASS_IDS[voiceTry.i - 1] : null,
        entering: entering ? { cls: entering.cls, t: entering.t } : null,
      }, titleLook === 'library' ? null : (smithTitle ??= titleLook === 'floor' ? makeSmith2Title(SMITH2_CHOSEN) : makeSmithTitle()));
      // the voices being tried out: warrior, ranger, mage, a breath apart
      if (voiceTry && (titleUi.page !== 'class' || titleLex)) voiceTry = null;
      if (voiceTry && clock >= voiceTry.at) {
        if (voiceTry.i >= CLASS_IDS.length) voiceTry = null;
        else {
          const who = CLASS_IDS[voiceTry.i];
          speak(who, meta.voice, VOICE_SAMPLE[who], 1.4);
          voiceTry = { i: voiceTry.i + 1, at: clock + 1.25 };
        }
      }
      ui.press = press;
      drawText(cg, __BUILD__, scr.w - 3, 2, '#3a3040', { align: 'right', font: 'small' });
      if (titleLex) {
        if (drawLexicon(ui, art, meta, lexUi, dt) || input.pressed('Escape')) {
          titleLex = false;
          sfx('click');
        }
      } else {
        if (res.mute) setMuted(!isMuted());
        if (res.limit) flipLimit();
        if (res.aim) flipAim();
        if (res.guide) {
          guideOn = !guideOn;
          // (the switch is the device's: kept as "has been shown the game", or not)
          meta.taught = !guideOn;
          writeSave();
          sfx('click');
        }
        if (res.voice) {
          // the other voice; and each of the three is heard in it, one after another
          meta.voice = meta.voice === 'female' ? 'male' : 'female';
          writeSave();
          voiceTry = { i: 0, at: clock + 0.05 };
          sfx('click');
        }
        if (res.mode) {
          // NORMAL OR HARDCORE for the next hero (game/modes.ts); the cards remember it
          meta.mode = meta.mode === 'hardcore' ? 'normal' : 'hardcore';
          writeSave();
          sfx('click');
        }
        if (res.turn) flipTurn();
        if (res.lexicon) {
          titleLex = true;
          lexUi.pick = null;
          sfx('click');
        } else if (res.resume || (saved && titleUi.page === 'menu' && input.pressed('Enter'))) {
          sfx('click');
          continueRun();
        } else if (res.pick) pickClass(res.pick);
        else if (entering) {
          // (a hero is making ready: the keys that pick a class or leave the cards wait until they have gone)
        } else if (titleUi.page === 'class') {
          for (let i = 0; i < CLASS_IDS.length; i++) if (input.pressed(`Digit${i + 1}`)) pickClass(CLASS_IDS[i]);
          if (input.pressed('Escape')) titleUi.page = titleUi.practice ? 'options' : 'menu';
        } else if (titleUi.page === 'options' && input.pressed('Escape')) titleUi.page = 'menu';
      }
    } else {
      const g = game;
      if (!g.over) {
        // Tab, or I (or C, or B): the inventory, where words, attacks and gear are.
        if (input.pressed('Tab') || input.pressed('KeyI') || input.pressed('KeyC') || input.pressed('KeyB')) {
          // (beside one of the town's services it is already open: the key closes both)
          if (withInventory(panels.open)) panels.open = 'none';
          else openInventory();
        }
        if (input.pressed('KeyL') && g.hero.pending > 0) panels.open = 'level';
        // the dungeon map (there is nothing to map in town)
        if (input.pressed('KeyM') && !g.level.town && (panels.open === 'none' || panels.open === 'map')) panels.open = panels.open === 'map' ? 'none' : 'map';
        if (input.pressed('Escape')) panels.open = panels.open === 'none' ? 'pause' : 'none';
        // the key that opened a town panel also closes it (the gate keeps E for "enter")
        else if (TOWN_PANELS.includes(panels.open) && panels.open !== 'gate' && (input.pressed('KeyE') || input.pressed('KeyF'))) {
          panels.open = 'none';
          input.eat('KeyE', 'KeyF');
        }
      }
      if (panels.open === 'level' && g.hero.pending <= 0) panels.open = 'none';
      const paused = panels.open !== 'none' || g.over;
      let gdt = dt;
      if (!paused) {
        // (tests can fast-forward the bot; a person always plays at 1x)
        const steps = bot ? Math.max(1, Math.floor(dbg.speed)) : 1;
        // the instant a heavy blow lands, the game holds almost still (never for the bot: it is on a clock)
        gdt = fx.freeze > 0 && !bot ? dt * 0.06 : dt;
        fx.freeze = Math.max(0, fx.freeze - dt);
        for (let k = 0; k < steps && !g.over; k++) {
          if (dbg.god) g.hero.life = g.hero.d.maxLife;
          if (bot) botStep(g, controls, bot, gdt);
          else readControls(g, gdt);
          g.update(gdt, controls);
          drain(g);
          fx.follow(g.projectiles, gdt * 60);
        }
        // offer the level-up choice at the first quiet moment
        const h = g.hero;
        const busy = g.monsters.some((m) => !m.dead && m.state !== 'sleep' && Math.hypot(m.x - h.x, m.y - h.y) < 10);
        calm = h.pending > 0 && !busy ? calm + dt : 0;
        quiet = busy ? 0 : quiet + dt;
        if (moveToast) {
          moveToast.t += dt;
          if (moveToast.t > 3.4) moveToast = null;
        }
        if (toast) {
          toast.t += dt;
          if (toast.t > (toast.big ? 3.6 : 2.8)) toast = null;
        }
        if (g.offer && (h.words[g.offer] <= 0 || !g.placeable(g.offer))) g.offer = null;
        // (a new player's first word is seen in its light for a moment before the screen opens for it)
        const wait = g.guide && !g.guide.set ? 2.4 : 0.9;
        if (g.offer && quiet > wait && !bot && dbg.autoWords && !g.over) {
          // a word was picked up that has somewhere to go: the inventory, with the word in hand
          // (for a new player's first word it is left on its tile, so that the drag can be shown)
          openInventory(-1, g.guide && !g.guide.set ? null : g.offer, true);
        } else if (calm > 0.9 && !bot && dbg.autoLevel) panels.open = 'level';
        // keep the saved run fresh: every few seconds, and whenever a panel closes
        saveT += dt;
        if (!g.over && (saveT > 5 || wasPaused)) {
          saveT = 0;
          writeSave();
        }
      }
      wasPaused = paused;
      // death ends the run: nothing is left to continue, but the Lexicon and stash are kept. A
      // NORMAL hero (game/modes.ts) is not lost: the save becomes the hero as they will wake in town.
      if (g.over && !deathSaved) {
        deathSaved = true;
        if (g.wakes) writeSave();
        else clearSave();
      }
      // what was done inside a panel last frame (a word set, a thing bought) is heard at once
      if (paused) drain(g);
      if (!paused || g.over) fx.update(gdt, dt);
      renderer.goal = errand && errand.level === g.level && errand.kind !== 'portal' && errand.kind !== 'body' ? errand.kind : null;
      fx.hero.x = g.hero.x;
      fx.hero.y = g.hero.y;
      // The inventory takes half the screen: the world is seen, standing still, in the other half,
      // with the hero in the middle of it. (The owner, 5 Oct 2026: "Pause the game when the
      // inventory is open to the right side of the screen and recenter the camera on the player in
      // the left side of the screen.")
      // (Beside one of the town's services nothing of the world is seen: the service has that
      // half. The picture stays where it was, so that the town is not seen sliding back into
      // the middle each time a service is closed.)
      const invOpen = withInventory(panels.open) && !g.over;
      if (invOpen && panels.open === 'inv') {
        const half = gameRect(scr.w, scr.h);
        renderer.view = { x: half.x + half.w / 2, y: half.y + half.h / 2 };
      } else renderer.view = null;
      // (Nothing shakes under a panel. The effects are not stepped while one is open, so a shake
      // caught half way would stand at its last offset, and hold the whole picture a pixel or two
      // off its place for as long as the panel stayed open: seen, now that the inventory leaves
      // half the world in view.)
      if (paused && !g.over) {
        fx.shakeX = 0;
        fx.shakeY = 0;
      }
      renderer.draw(cg, scr.w, scr.h, g, fx, clock, paused ? 0 : gdt * 60);
      // (a hero who has just warped in says their line when they have come together: `arrived`)
      if (arrived && !paused) {
        arrived.t += dt;
        if (arrived.line !== null && arrived.t >= ARRIVAL_SAYS && !g.over) {
          fx.say(arrived.line, lineTime(arrived.line));
          speak(g.hero.cls, g.voice, arrived.line);
          arrived.line = null;
        }
        if (arrived.line === null && arrived.t > 2) arrived = null;
      }

      // the HUD is always drawn, but only listens when nothing is open on top of it
      const press = ui.press;
      if (paused) ui.press = null;
      // (the first dungeon's prompt gives way to whatever is open on top of the game)
      const banner = paused ? null : guideBanner(g, input.touchMode);
      // (a fight is on while something awake can be seen on the screen: the attacks written along
      // the bottom are not buttons then, so that a press meant for a monster is never a press on one)
      const fightOn = !paused && g.monsters.some((m) => {
        if (m.dead || !m.seen || m.state === 'sleep') return false;
        const mx = wx(renderer.cam, m.x, m.y);
        const my = wy(renderer.cam, m.x, m.y);
        return mx > -16 && mx < scr.w + 16 && my > -8 && my < scr.h + 24;
      });
      const hudIn: HudIn = { banner, toast: paused ? null : toast, moveToast: paused ? null : moveToast, gesture: null, fight: fightOn };
      if (banner && input.touchMode) {
        // on a phone, the gesture the prompt is asking for is shown as a ghost, where it should be made
        const cam = renderer.cam;
        const hero = g.hero;
        let near: Monster | null = null;
        for (const m of g.monsters) if (!m.dead && m.seen && (!near || Math.hypot(m.x - hero.x, m.y - hero.y) < Math.hypot(near.x - hero.x, near.y - hero.y))) near = m;
        const onMonster = (kind: 'tap' | 'hold'): HudIn['gesture'] => {
          if (!near) return null;
          // on the monster if the right thumb can reach it there; otherwise out on the right, where a tap aims itself
          const mx = wx(cam, near.x, near.y);
          const my = wy(cam, near.x, near.y) - 10;
          const reach = mx >= scr.w * 0.45 && mx <= scr.w - 12 && my >= 60 && my <= scr.h - 50;
          return { kind, x: reach ? mx : Math.round(scr.w * 0.72), y: reach ? my : Math.round(scr.h * 0.56), dx: 0, dy: 0 };
        };
        if (banner.step === 'move') {
          // the walking thumb, pushed the way the dungeon goes: toward the nearest thing in it
          let to: { x: number; y: number } | null = null;
          for (const m of g.monsters) if (!m.dead && (!to || Math.hypot(m.x - hero.x, m.y - hero.y) < Math.hypot(to.x - hero.x, to.y - hero.y))) to = m;
          const tx = to ? to.x : hero.x + 1;
          const ty = to ? to.y : hero.y - 1;
          hudIn.gesture = { kind: 'stick', x: 0, y: 0, dx: wx(cam, tx, ty) - wx(cam, hero.x, hero.y), dy: wy(cam, tx, ty) - wy(cam, hero.x, hero.y) };
        } else if (banner.step === 'fight') {
          const next = banner.lines.find((l) => !l.done);
          if (next && next.id === 'quick') hudIn.gesture = onMonster('tap');
          else if (next && next.id === 'slow') hudIn.gesture = onMonster('hold');
          else if (next && next.id === 'evade') hudIn.gesture = { kind: 'flick', x: 0, y: 0, dx: 1, dy: 0 };
        } else if (banner.step === 'use' && g.guide && g.guide.set) {
          // (the word may be on the swipe: the ranger's first goes on Trap)
          const sk = g.guide.set.skill;
          hudIn.gesture = sk === 2 ? { kind: 'flick', x: 0, y: 0, dx: 1, dy: 0 } : onMonster(sk === 0 ? 'tap' : 'hold');
        }
        else if (banner.step === 'body' && g.level.body) {
          const b = g.level.body;
          hudIn.gesture = { kind: 'tap', x: wx(cam, b.x, b.y), y: wy(cam, b.x, b.y) - 4, dx: 0, dy: 0 };
        }
      }
      // (under the inventory the game's own buttons are not drawn: half of them would be cut off by
      // its edge, and none of them is listening)
      const hud: HudOut = invOpen ? { inventory: -1, potion: false, interact: false, level: false, pause: false, map: false } : drawHud(ui, g, art, fx, clock, input, hudIn);
      ui.press = press;
      if (hud.map) {
        panels.open = 'map';
        sfx('click');
      }
      if (hud.inventory >= 0) openInventory(hud.inventory < 3 ? hud.inventory : -1);
      if (hud.potion) g.usePotion();
      if (hud.interact) wantInteract = true;
      if (hud.level) panels.open = 'level';
      if (hud.pause) panels.open = 'pause';

      if (panels.open === 'level' && wasOpen !== 'level') levelShownAt = clock;
      if (panels.open === 'map' && wasOpen !== 'map') mapShownAt = clock;
      if (withInventory(panels.open) && !withInventory(wasOpen)) invShownAt = clock;
      if (!withInventory(panels.open) && withInventory(wasOpen)) {
        // the inventory has closed: nothing stays in hand
        resetInvUi(invUi);
        invAuto = false;
        // every attack that came out of it with a new name announces it, once
        g.hero.skills.forEach((s, i) => {
          const was = invWas[i];
          const now = [...s.front, ...s.behind].filter((w): w is WordId => w !== null);
          if (!was || s.r.name === was.name || !now.length) return;
          fx.wordJoined(g.hero.x, g.hero.y, now.find((w) => !was.words.includes(w)) ?? now[0], s.r.name);
        });
        invWas = [];
      }
      wasOpen = panels.open;
      if (g.over) {
        fellFor += dt;
        if (fellFor < FALL_SEEN) {
          // the hero is falling: the screen darkens a little round them as they go down, and a
          // press (not one that was already on its way when the blow fell) brings the words at once
          ui.shade(0.3 * Math.min(1, fellFor / FALL_SEEN));
          if (fellFor > 0.4 && (ui.press || input.pressed('Enter') || input.pressed('Space'))) {
            fellFor = FALL_SEEN;
            ui.press = null;
            input.eat('Enter', 'Space');
          }
        } else if (drawDeath(ui, g) || input.pressed('Enter')) {
          if (g.wakes) wake(g);
          else {
            // straight to the class cards: one more go
            mode = 'title';
            game = null;
            titleUi.page = 'class';
            titleUi.practice = false;
          }
        }
      } else if (panels.open === 'wordsmith' && !TUNE.tradesOpen) openInventory();
      else if (withInventory(panels.open)) {
        // (when it opens by itself, a press already on its way must not land on it)
        if (invAuto && clock - invShownAt < 0.3) ui.press = null;
        // The inventory; and, at one of the town's services, that service in the other half of the screen.
        const half = gameRect(scr.w, scr.h);
        const gate = { enter: false };
        const at = panels.open;
        const side: Side | null =
          at === 'vendor'
            ? vendorSide(ui, g, art, panels, invUi, half)
            : at === 'stash'
              ? stashSide(ui, g, art, panels, invUi, half)
              : at === 'lexicon'
                ? lexiconSide(ui, art, meta, g, lexUi, invUi, half)
                : at === 'gate'
                  ? // at the gate, the key that opened it (pressed again) or Enter steps through
                    gateSide(ui, g, art, invUi, half, input.pressed('Enter') || input.pressed('KeyE') || input.pressed('KeyF'), gate, clock)
                  : at === 'wordsmith'
                    ? wordsmithSide(ui, g, art, meta, panels, invUi, half)
                    : at === 'stranger'
                      ? gambleSide(ui, g, art, panels, invUi, half)
                      : null;
        if (drawInventory(ui, g, art, invUi, clock, dt, side)) {
          panels.open = 'none';
          sfx('click');
        }
        if (gate.enter) {
          input.eat('KeyE', 'KeyF', 'Enter');
          panels.open = 'none';
          g.enterDungeon();
        }
      } else if (panels.open === 'map') {
        // any press closes it, except the press that opened it
        const shut = drawMap(ui, g, clock);
        if (g.level.town || (shut && clock - mapShownAt > 0.2)) panels.open = 'none';
      } else if (panels.open === 'level') drawLevelUp(ui, g, (code) => input.pressed(code), clock - levelShownAt > 0.45);
      else if (panels.open === 'pause') {
        const p = drawPause(ui, isMuted(), turnLabel(), meta.limit, scr.touch ? meta.aim : null, g.practice ? 'Leave' : 'End run');
        if (p.resume) panels.open = 'none';
        if (p.mute) setMuted(!isMuted());
        if (p.turn) flipTurn();
        if (p.limit) flipLimit();
        if (p.aim) flipAim();
        if (p.quit) {
          if (!g.practice) clearSave();
          mode = 'title';
          game = null;
          titleUi.page = 'menu';
        }
      }
    }
    input.endFrame();
    requestAnimationFrame(frame);
  };

  // Test hooks: automated playtests drive the game through these. Not used in normal play.
  const hash = new URLSearchParams(location.hash.slice(1));
  const auto = hash.get('bot') as ClassId | null;
  if (auto && CLASS_IDS.includes(auto)) {
    saving = false;
    saved = null;
    newRun(auto, Number(hash.get('seed') ?? 1234), false);
    bot = newBot(true);
  }
  const dbg = {
    game: () => game,
    /** The hero who has been picked and is making ready on their card (see `entering`), or null: a playtest that picks a class waits for them to have gone. */
    entering: () => (entering ? { cls: entering.cls, t: entering.t, long: entering.long } : null),
    /** A new character, straight into the town: no prompts. */
    run: (cls: ClassId, seed?: number) => {
      saving = false;
      saved = null;
      newRun(cls, seed, false);
    },
    /** A new player's first character: in the first dungeon, with its prompts. */
    first: (cls: ClassId, seed?: number) => {
      saving = false;
      saved = null;
      newRun(cls, seed, true);
    },
    /**
     * THE FIRST LEVELS (game/defs.ts, FIRST_LEVELS; the game's own since Version 19.5): a hero who
     * has been through them, for the playtests that are about something else. The wordsmith's ring
     * lit (for the hero, and on this device), and the level raised to `level` if it is lower, so
     * that the moves and slots of that level are open (all three moves from 5; a slot behind from
     * 7; two a side from 10). No points to spend come with it, so no level-up choice opens.
     */
    seasoned: (level = 10) => {
      if (!game) return;
      const h = game.hero;
      h.ring = true;
      meta.ring = true;
      if (h.level < level) h.level = level;
      game.refresh();
      h.life = h.d.maxLife;
      h.mana = h.d.maxMana;
    },
    /** THE FIRST LEVELS: the NEW MOVE banner showing now (the move that has just opened, and how long it has shown), or null. */
    moveToast: () => (moveToast ? { skill: moveToast.skill, t: moveToast.t } : null),
    /** The inventory, as the HUD opens it. */
    inv: (focus = -1) => openInventory(focus),
    /** NORMAL MODE's switch (game/modes.ts), for its pictures and playtests: `modes.on`. */
    modes: MODES,
    /**
     * THE FIRST LEVELS (game/defs.ts, FIRST_LEVELS): a mock-up behind a switch that is off. Its
     * pictures and playtests switch it on (or off again) for themselves; the run made after follows it.
     */
    firstLevels: (on: boolean) => useFirstLevels(on),
    firstLevelsOn: () => FIRST_LEVELS.on,
    /**
     * A third word slot a side, switched on or off (the owner's idea, not in the game: see
     * SLOT_OPENS in game/defs.ts). For pictures of how the menus and the game screen hold it.
     */
    thirdSlots: (on: boolean) => {
      SLOT_OPENS.front.length = 2;
      SLOT_OPENS.behind.length = 2;
      if (on) {
        SLOT_OPENS.front.push(15);
        SLOT_OPENS.behind.push(20);
      }
      if (game) game.refresh();
    },
    /** A piece of gear made to order (playtests of crafting want a white, a blue and a yellow one of a kind they choose). */
    item: (slot: Slot, rarity: Rarity, ilvl = 5, seed = 1): Item => rollItem(ilvl, new RNG(seed), { slot, rarity }),
    invUi,
    lexUi,
    titleUi,
    guideLog,
    /** Characters some text asked for that the fonts cannot draw (should be empty). */
    missing: (): string[] => [...MISSING_GLYPHS],
    /** Start the practice room (playtests photograph effects there). */
    practice: (cls: ClassId, seed?: number, hall?: Hall) => {
      saving = false;
      startPractice(cls, seed, hall);
    },
    bot: (on: boolean) => {
      saving = false;
      bot = on ? newBot(true) : null;
    },
    /** Tests of saving itself switch it back on. */
    saving: (on: boolean) => {
      saving = on;
      if (on) {
        const f = readSave();
        saved = f.run;
        // (a run already under way keeps the Lexicon it was started with)
        if (!game) {
          meta = f.meta;
          guideOn = !meta.taught;
        }
      } else saved = null;
    },
    meta: () => meta,
    // ('vendor' opens the armourer's: for the playtests that only want a vendor's screen)
    open: (kind: Station | 'vendor') => openStation(kind === 'vendor' ? 'armourer' : kind),
    save: () => writeSave(),
    toTitle: () => {
      mode = 'title';
      game = null;
      titleUi.page = 'menu';
      titleLex = false;
    },
    /** Which start screen is shown: the library and the dream, or the wordsmith at his forge table (not yet approved by the owner). */
    titleLook: (look: 'library' | 'smith' | 'floor', take?: SmithTake) => {
      titleLook = look;
      // (each picture is painted when it is first shown: a change of look, or of the first painting's moment, paints afresh)
      smithTitle = look === 'smith' && take ? makeSmithTitle(take) : null;
    },
    /** The start screen's page: the menu, the options or the class cards. */
    titlePage: (page: 'menu' | 'options' | 'class') => {
      titleUi.page = page;
    },
    /** Switch between cooldowns and mana, as the options do. */
    flipLimit: () => flipLimit(),
    /** Touch: how attacks are aimed ('tap', 'auto' or 'face'): set it, as the options' switch does. */
    setAim: (aim: AimMode) => {
      if (meta.aim !== aim) setAim(aim);
    },
    /** Touch: the enemy the hero is locked onto. */
    lock,
    panels,
    fx,
    /** Keep the hero alive (for screenshots of long fights). */
    god: false,
    /** Game steps per frame while the test bot plays. */
    speed: 1,
    /** Time runs this much slower than real (1 = normal). */
    slowmo: 1,
    /** The world's painter (its `skip` set leaves parts of the picture out, for measuring). */
    renderer,
    /** How many frames of art have been painted so far, and how long that took in all (art/kit.ts). */
    painting: PAINTING,
    /** The level-up choice opens by itself in a quiet moment. Tests that need an uninterrupted fight switch this off. */
    autoLevel: true,
    /** The inventory opens by itself for a new word that has somewhere to go. Likewise. */
    autoWords: true,
    input,
    ui,
    screen: scr,
    cam: () => renderer.cam,
    /** The map-maker's switches for terraces and sunken floor (game/dungeon.ts): pictures of what is not yet in the game switch it on. */
    relief: RELIEF,
    /** THE MIX (game/dungeon.ts, MIX): ON in the game since Version 18.9; playtests that lay a dungeon without it (or with it) set it for themselves and put it back. */
    mix: MIX,
    /** DOORS AND GATES (game/doors.ts): the map-maker's switch for them, and the share of rooms that have a door. Playtests that change them put them back. */
    doors: DOORS,
    /** THE TRAPS (game/traps.ts, TRAPS): ON in the game since the owner's yes (8 Oct 2026, 11:36); playtests that lay a dungeon without them set it for themselves and put it back. */
    traps: TRAPS,
    /** THE NEW WORDS (render/words3.ts): how the eight words he chose on 8 Oct look at work, a mock-up behind a switch that is off; its playtest switches it on for its own page. */
    words3: demo3(fx, () => game),
    /** STRIKE'S COMBO (game/defs.ts, COMBO): OFF in the game until the owner has said yes to it; the pictures of it and its playtests switch it on for themselves. */
    combo: COMBO,
    /** STRIKE'S COMBO MENDED (art/moves3.ts, COMBO_MENDS): ON since Version 19.2, on his yes; pictures of the swings as they were before switch it off and paint the heroes again (true: the mended, the game's own, back). */
    comboMends: (on: boolean) => {
      useComboMends(on);
      art.heroes = makeHeroArt3();
    },
    /** THE WORDSMITH ON BONES AND HIS RING MADE NEW (art/smith3.ts, SMITH3): a mock-up behind a switch that is off; its pictures switch it on and paint the town's people again. */
    smith3: (on: boolean) => {
      SMITH3.on = on;
      art.folk = makeTownsfolk();
      art.town = makeTownProps();
    },
    /** The clock the town's things go by (seconds, slowed with `slowmo`): a playtest can wait for the moment someone acts. */
    clock: () => clock,
    /**
     * THE MASTER RUNE-STONE (art/quest3.ts, QUEST3): a mock-up behind a switch that is off; its films
     * set what the rules will one day say. `on`; the ring `dark`; `give`: the stone is given now;
     * `take`: it is taken up now from beside the fallen wordsmith (and carried); `lying`: it lies there.
     */
    quest3: (o: { on?: boolean; dark?: boolean; give?: boolean; take?: boolean; lying?: boolean; carried?: boolean }) => {
      if (o.on !== undefined) QUEST3.on = o.on;
      if (o.dark !== undefined) QUEST3.dark = o.dark;
      if (o.give) {
        QUEST3.givenAt = clock;
        QUEST3.carried = false;
      }
      if (o.take) {
        QUEST3.takenAt = clock;
        QUEST3.stone = 'gone';
        QUEST3.carried = true;
        // (for the pictures only: the fallen wordsmith is then searched, as the rules will have it)
        if (game?.level.body) game.level.body.state = 1;
      }
      if (o.lying) {
        QUEST3.stone = 'lying';
        QUEST3.takenAt = -1;
      }
      if (o.carried !== undefined) QUEST3.carried = o.carried;
      return { ...QUEST3 };
    },
    /** THE RANGER'S NEW STANCES AND MOVES (art/moves3.ts, RANGER_STANCES, with game/defs.ts RANGER_ARROW): ON since Version 19.4, on his yes; pictures of him as he was before switch them off and paint the heroes again (true: the new, the game's own, back). */
    rangerStances: (on: boolean) => {
      useRangerStances(on);
      art.heroes = makeHeroArt3();
    },
    /**
     * THE WALLS' LOOK (art/ground.ts): set it, and the floor and walls are painted again. For
     * playtests that photograph a look, who put back the one they found; the game's own is
     * whatever `WALL_LOOK` starts as. `wallLook()` says which is in force.
     */
    walls: (look: Partial<WallLook>) => {
      setWallLook(look);
      art.ground = makeGroundArt();
      // (a gate's post is as tall as the walls, and it fades as they do)
      art.gates = makeGateArt();
    },
    wallLook: (): WallLook => ({ ...WALL_LOOK }),
    wallLooks: { blocks: WALLS_BLOCKS, fading: WALLS_FADING },
    /** Where a world point is on screen, in game pixels (playtests press things in the world). */
    at: (x: number, y: number) => ({ x: wx(renderer.cam, x, y), y: wy(renderer.cam, x, y) }),
    errand: () => (errand ? errand.kind : null),
    /** What a touch or a click at a screen point (game pixels) would send the hero to use, if anything. */
    spot: (x: number, y: number) => (game ? (spotAt(game, x, y)?.kind ?? null) : null),
  };
  (window as unknown as Record<string, unknown>).__dbg = dbg;
  (window as unknown as Record<string, unknown>).__ready = true;

  // When the page is replaced by a newer version while someone is playing, hand the run across
  // and carry straight on (in town) instead of dropping them at the title screen.
  try {
    if (hot && typeof hot.snapshot === 'function') hot.snapshot(() => ({ run: saving && game && !game.over && mode === 'play' ? (game.practice ? saved : game.save()) : null, meta: saving ? meta : null }));
  } catch {
    /* the hook is optional */
  }
  const handed = carried && typeof carried === 'object' ? (carried as { run?: RunSave | null; meta?: Meta | null }) : null;
  if (handed && saving && !game) {
    if (handed.meta) {
      meta = cleanMeta(handed.meta);
      guideOn = !meta.taught;
    }
    if (validRun(handed.run)) {
      saved = handed.run as RunSave;
      continueRun();
    }
  }
  requestAnimationFrame(frame);
}

function boot(): void {
  const hot = (window as unknown as { claude?: { hot?: HotHook } }).claude?.hot;
  let started = false;
  const go = (data: unknown): void => {
    if (started) return;
    started = true;
    start(data, hot);
  };
  try {
    if (hot && typeof hot.ready === 'function') {
      hot.ready(go);
      // never wait on the hook for long: a game that does not start is worse than a lost hand-over
      setTimeout(() => go(hot.data ?? null), 1500);
    } else go(hot ? hot.data ?? null : null);
  } catch {
    go(null);
  }
}

boot();
