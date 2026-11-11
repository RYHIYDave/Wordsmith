// UNIQUE ITEMS: THE NUMBERS, WRITTEN OUT FOR HIS YES (docs/uniques/NUMBERS.md). Made from game/uniques.ts itself, so that what he
// reads is what the build does: every number of UNIQUE_TUNE and UNIQUE_DROPS, each unique's ordinary stats, and what those roll.
//   run: tsx tools/unique_numbers.ts > docs/uniques/NUMBERS.md
import { TUNE } from '../src/game/defs';
import { STAT_INFO, statRangeAt } from '../src/game/items';
import type { StatKey } from '../src/game/types';
import { UNIQUE_DEFS, UNIQUE_DROPS, UNIQUE_TUNE, uniqueDef, uniqueSlot, uniqueWeapon } from '../src/game/uniques';
import type { UniqueDef } from '../src/game/uniques';

const T = UNIQUE_TUNE;
const pc = (n: number): string => `${Math.round(n * 1000) / 10}%`;
const oneIn = (p: number): string => `1 in ${Math.round(1 / p)}`;
const STAT_NAME: Partial<Record<StatKey, string>> = { maxMana: 'Max Mana (reads as Cooldown Recovery)', dmgMin: 'Adds Damage' };
const statName = (s: StatKey): string => STAT_NAME[s] ?? STAT_INFO[s].label;

/** The numbers behind each unique, in plain words: what its card does not already say, or says in passing. */
const NUMS: Record<string, string> = {
  twofacedmask: 'No number: the rule itself.',
  censorsseal: `Tap attack's words ${pc(T.half)} stronger.`,
  quillsband: `Hold attack's words ${pc(T.half)} stronger.`,
  polyglotsmantle: 'Two damage words a side, where the rule is one.',
  longecho: 'No number: it adds the word.',
  thirdword: 'One more slot.',
  brokenshackles: 'Cooldown: none.',
  bloodprice: `${pc(T.bloodprice.more)} harder for ${T.bloodprice.secs} seconds.`,
  freehand: `+${T.freeHand.atkSpeed}% Attack Speed, +${T.freeHand.critMult}% Critical Damage.`,
  millstone: 'No time limit.',
  rainwalker: 'No number: the rule itself.',
  shepherdscrook: `The Orb comes after you at ${T.crook.speed} tiles a second and stops ${T.crook.near} tiles off.`,
  secondwhistle: `${T.whistle.more} more Golem.`,
  lastround: 'No number: the third globe.',
  headsmanshood: 'No number: it adds the word.',
  fleshmancersbrand: `Fights for ${T.brand.secs} seconds; a blow every ${T.brand.every} seconds for ${pc(T.brand.share)} of your hit.`,
  cantorsecho: 'No number: it adds the word.',
  drownedarm: `Every ${T.arm.every} seconds; ${pc(T.arm.share)} of your hit to everything within ${T.arm.r} tiles of it; seen ${T.arm.lead} seconds before it lands.`,
  criershush: `Within ${T.hush.reach} tiles of you. Not a boss's words.`,
  kingsknot: `${T.knot.secs} seconds.`,
  physicianscoat: `One flask for every ${T.coat.hits} hits on elites and bosses.`,
  queensglass: 'No number: it adds the word.',
  wardenskeys: `Doors open from ${T.keys.reach} tiles; ${T.keys.more} more piece in every chest.`,
  amalgamsheart: 'No number: the meld, free.',
  halfcarvedhand: `Below ${pc(T.halfHand.below)} life: attacks ${pc(T.halfHand.attack)} faster, feet ${pc(T.halfHand.move)} faster.`,
  queenstalons: `${pc(T.talons.share)} of your hit; no more than one bird every ${T.talons.gap} seconds.`,
  hollowcrown: 'No number: it adds the word.',
  nettleshirt: `+${pc(T.nettle.each)} every ${T.nettle.every} seconds unhit, up to +${pc(T.nettle.most)} (${(T.nettle.most / T.nettle.each) * T.nettle.every} seconds).`,
  dancingshoes: 'No number: the rule itself.',
  clockworksongbird: `Words ${pc(T.half)} stronger at full life.`,
  mothswing: `${pc(T.moth.less)} less damage; a word dark for ${T.moth.dark} seconds.`,
  dogearedpage: 'Asks for level 1, so a new hero can put it on.',
  ghostwriter: 'No number: the rule itself.',
  miserspurse: `${pc(T.purse.each * 1000)} harder for every 1,000 gold (the Tinkerer's Fortune talent's own rate); a hit spills ${pc(T.purse.spill)} of your gold on the floor, to pick up again.`,
  alloyband: `Melded words ${pc(T.half)} stronger.`,
  longodds: `${pc(T.odds.more)} harder against elites and bosses; ${pc(T.odds.less)} softer against the rest.`,
  standingstone: `After ${T.stone.after} seconds still: ${pc(T.stone.less)} less damage.`,
  windcutter: `Every ${T.windcutter.every} Strikes; ${pc(T.windcutter.share)} of a Strike; flies ${T.windcutter.range} tiles.`,
  undertow: 'No number: it adds the word.',
  pivot: `${T.pivot.cuts} cuts of Whirlwind.`,
  press: `${pc(T.press.each)} for each enemy within ${T.press.near} tiles, up to ${pc(T.press.most)}.`,
  fan: `${T.fan.arrows} arrows, each ${pc(T.fan.share)} of a Shot. One enemy takes only one of them.`,
  poachersbow: `The trap bursts as hard as one of your own (${pc(T.poacher.share)}).`,
  packcollar: 'One more companion.',
  hairtrigger: `${T.trigger.mult} times as hard.`,
  tide: `${pc(T.tide.share)} on the way home.`,
  tuningstaff: `${T.tuning.mult} times as hard.`,
  prism: `What the hit's own element does not do: a chill of ${pc(T.prism.chill)}, a burn of ${pc(T.prism.burn)} of the hit over 3 seconds, and shocked.`,
  shortway: `${T.shortWay.secs} seconds.`,
  ledgerofdebts: `${pc(T.ledger.each)} for each cursed enemy within ${T.ledger.near} tiles, up to ${pc(T.ledger.most)}.`,
  restlesstome: `Circles ${T.tome.r} tiles out, once round every ${T.tome.turn} seconds; its hellfire is ${pc(T.tome.share)} of your hit's; the same enemy not again for ${T.tome.again} second.`,
  burningverse: 'No number: until it dies.',
  unsignedpact: `${pc(T.pact.drain)} of your life a second; it lets you go at ${pc(T.pact.floor)} life, or when you tap him.`,
  clovenboots: 'Cooldown: none, as the demon.',
  stickywrench: `Bursts ${T.sticky.fuse} seconds after it lands, ${T.sticky.wide} times as wide.`,
  foremanswrench: `Each Golem's vial is ${pc(T.foreman.share)} of yours.`,
  towline: 'A full ground pound where it lands.',
  companyscrip: `${T.scrip.gold} gold a use for each floor of depth (floor 10: ${T.scrip.gold * 10} gold). No gold: the cooldown as ever.`,
  fourthglobe: `${T.fourth.globes} globes.`,
  winningstreak: `${pc(T.streak.each)} a combo, up to ${pc(T.streak.most)}.`,
  sprungheels: `${T.heels.jumps} jumps.`,
  receipt: `A punch of ${pc(T.receipt.share)} of your hit; no more than one every ${T.receipt.gap} seconds.`,
};

const SLOT_NAME: Record<string, string> = { helm: 'Helm', chest: 'Chest', gloves: 'Gloves', belt: 'Belt', boots: 'Boots', amulet: 'Amulet', ring: 'Ring', mainhand: 'Weapon' };
const WEAPON_NAME: Record<string, string> = { greatsword: 'Greatsword', bow: 'Bow', staff: 'Staff', tome: 'Tome', wrench: 'Wrench', wraps: 'Wraps' };
const kindOf = (d: UniqueDef): string => {
  const w = uniqueWeapon(d);
  return w ? WEAPON_NAME[w] : SLOT_NAME[uniqueSlot(d)];
};
const also = (d: UniqueDef): string => (d.stats.length ? d.stats.map(statName).join(', ') : 'Nothing else');
const row = (id: string): string => {
  const d = uniqueDef(id)!;
  if (!NUMS[id]) throw new Error(`no numbers written for ${id}`);
  return `| ${d.name} (${kindOf(d)}) | ${NUMS[id]} | ${also(d)} |`;
};
const table = (ids: string[]): string => ['| Unique | Proposed | Also on it |', '| --- | --- | --- |', ...ids.map(row)].join('\n');
const idsWhere = (f: (d: UniqueDef) => boolean): string[] => UNIQUE_DEFS.filter(f).map((d) => d.id);

const out: string[] = [];
const P = UNIQUE_DROPS.pool;
out.push(`# Wordsmith: Unique Items, the Numbers

Every number here is a first proposal, for your yes. They are what the build uses now, behind its switch, and each is one line to change. The 62 and their rules are as your doc “Wordsmith: Unique Items” has them.

## How often you would see one

| Where | Chance | Which is |
| --- | --- | --- |
| A boss's own unique | ${pc(UNIQUE_DROPS.boss)} each time he dies | ${oneIn(UNIQUE_DROPS.boss)} kills |
| A piece dropped by an ordinary monster | ${pc(P.plain)} is a pool unique instead | ${oneIn(P.plain)} pieces |
| A piece from an elite, or a chest along the way | ${pc(P.elite)} | ${oneIn(P.elite)} pieces |
| A piece from a hoard: a boss, a guardian, a vault | ${pc(P.hoard)} | ${oneIn(P.hoard)} pieces |
| The stranger's gamble | ${pc(TUNE.gambleOdds.unique)} a throw | ${oneIn(TUNE.gambleOdds.unique)} throws |
| The endless final boss | ${pc(UNIQUE_DROPS.final)} a kill, one of his two | when he is built |

Counted on the game's twenty floors (tools/unique_odds.ts): about 28 pieces of gear drop on a floor, 560 in a run. So a run gives about three pool uniques and two of the bosses' own: about five uniques in all, with no magic find. 66 rares drop in the same run.

- Magic find raises the pool's chance the way it raises a rare's.
- The pool starts on floor ${P.from}.
- The pool gives a hero the ten for everyone and his own five: never another hero's.
- The stranger gives only pool uniques, of the kind you throw for. A boss's unique comes only from its boss.

## What I took as read where you had not said

Each of these is yours to change.

- **A hero-only piece on another hero:** he can wear it, its stats count, and its rule does nothing.
- **A word a unique adds, set by hand on that attack too:** it is there once. Nothing more.
- **“Half as strong again”:** ${pc(T.half)} more on the word's own number, the way Rank II works. Two such uniques worn together add up: twice as strong, not two and a quarter.
- **The Nettle Shirt with The Clockwork Songbird:** they stack, by adding.
- **The Crier's Hush:** it darkens elites' and packs' words, not a boss's.
- **The Fleshmancer's Brand:** a new elite killed takes the place of the one risen.
- **The King's Knot:** the borrowed word sits beside your own, even where it is a second damage word.
- **The Rainwalker with the Hail talent:** the rain goes with her. Hail's longer, wider rain still counts; its chasing an enemy does not.
- **The Unsigned Pact:** the demon never takes your last ${pc(T.pact.floor)} of life, and a tap on him sends it away.
- **The Pack Collar:** the second companion is the next in the same list after your pick. It needs a way to pick, in town.
- **Ordinary stats:** two on most. None on the five your doc marks “Nothing else on it”. One on Broken Shackles, as you said: movement speed. Each rolls as a found affix of the item's level, not as a crafted one, so a unique is always short of a well-crafted yellow in raw stats.

## The numbers

### The ten for the pool
${table(idsWhere((d) => d.from === 'pool' && !d.cls))}

### One for each boss, floors 1 to 20
${table(UNIQUE_DEFS.filter((d) => d.from === 'boss').sort((a, b) => (a.floor ?? 0) - (b.floor ?? 0)).map((d) => d.id))}

### The endless final boss's two
${table(idsWhere((d) => d.from === 'final'))}
`);
for (const [cls, name] of [['warrior', 'The Warrior'], ['ranger', 'The Ranger'], ['mage', 'The Mage'], ['warlock', 'The Warlock'], ['tinkerer', 'The Tinkerer'], ['brawler', 'The Brawler']] as const) {
  out.push(`### ${name}\n${table(idsWhere((d) => d.cls === cls))}\n`);
}
const stats = [...new Set(UNIQUE_DEFS.flatMap((d) => d.stats))].sort((a, b) => statName(a).localeCompare(statName(b)));
const span = (s: StatKey, lv: number): string => {
  const [lo, hi] = statRangeAt(s, lv);
  const pct = STAT_INFO[s].pct ? '%' : '';
  return `${lo}${pct} to ${hi}${pct}`;
};
out.push(`## What the ordinary stats roll

The same as a found affix of the item's level. A boss's unique is of his floor's level; a pool unique of the floor it dropped on.

| Stat | Level 5 | Level 10 | Level 20 |
| --- | --- | --- | --- |
${stats.map((s) => `| ${statName(s)} | ${span(s, 5)} | ${span(s, 10)} | ${span(s, 20)} |`).join('\n')}

## What waits on something else

- **The ten new words:** The Headsman's Hood (Culling), The Queen's Glass (Mirroring) and The Long Echo (Lasting) are built, and add nothing until those words are in the game.
- **The endless final boss:** The Third Word and The Ghostwriter work, and drop from nothing until he is built.
- **Pictures, the art chat's:** an icon for each; and what is seen in play. Until those are drawn the build shows a plain stand-in (a burst, a spark) so each can be tried.
- **The Fourth Globe:** the globes over his head are painted as three. The fourth works and is not shown yet.
`);
console.log(out.join('\n'));
