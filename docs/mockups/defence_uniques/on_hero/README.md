# Every unique weapon on its hero, side by side (24 Nov 2026)

His question: “Do any of these uniques resemble other unique weapons too closely to be able to distinguish them on the
character?” Made with `godot --path godot -- --shots=<dir> --only=skinsheet` (godot/scripts/check_skinsheet.gd): each hero with
his own weapon first, then each unique in alphabetical order of its id, from two sides.

- warrior: own, barndoor, deadweight, deathknell, gyre, millstone, redtithe, rotaxe, starbreaker, tenderizer, undertow, whettededge, widowfall, windcutter
- ranger: own, fan (Threefold), fledgling, longshot, poachersbow, rainwalker, runnersbow
- mage: own, icicle, kindlingrod, shepherdscrook, tide (Ebb and Flow), tuningstaff (Resonance), walkingstick
- warlock: own, bloodstainedprimer, burningverse, hornbook, ledgerofdebts, pennydreadful, restlesstome (its book flies: none at his hip)
- tinkerer: own, borrowedspanner, foremanswrench, goldplatedwrench, rustywrench, secondwhistle, stickywrench
- brawler: own, brassknuckles, butcherswraps, fourthglobe, lastround, tapedknuckles, winningstreak

Too close, as read off these: Butcher's Wraps and Taped Knuckles; Bloodstained Primer and Penny Dreadful; Long Shot and his own
bow and the Poacher's; Whetted Edge and Windcutter; Brass Knuckles and his own wraps; the Icicle and her own staff (less so).

## Reworked (24 Nov 2026, late)

His words: “rework the look a like weapons”. The six, each repainted in its hero's hands and in the bag, baked again, and these
sheets made again:

- Butcher's Wraps: soaked dark red all over (were pale, blotted red: Taped Knuckles).
- The Penny Dreadful: bright yellow covers, a black block (was grey with a red block: the Bloodstained Primer).
- Long Shot: red lacquer, brass bands (was black wood: his own bow, the Poacher's).
- Whetted Edge: black steel, only its edge white (was bright steel: Windcutter).
- Icicle: a pole white with frost, a thick block of ice for its head, icicles hanging down (was a blue pole and one long
  icicle, point up: her own staff).
- Brass Knuckles: each fist cased in brass, all of it (twice: brass from the knuckles down still read as his own wraps).
  Still the nearest to another of the six: Hot Streak has gilt and white at the knuckles.

## Brass Knuckles and Hot Streak (24 Nov 2026, later still)

His words, told Brass Knuckles was still the nearest of the six to another (Hot Streak's gilt): “I mean we all know what brass
knuckles look like so if it's similar to another unique I feel like the other one needs to be changed”.

- BRASS KNUCKLES: as brass knuckles are. Black straps, a thick bar of brass over the knuckles, a knob standing off it on every
  knuckle (`src/art/wrap_skins.ts` BRASS_WRAPS).
- HOT STREAK (one of the first four, his yes of 15 Nov to its first look): blue silk, a white band at the knuckles, a white
  rosette with a gilt heart, in place of white linen with gilt round the knuckles and a blue rosette. The brass is Brass
  Knuckles' alone. CHANGED WITHOUT A PICTURE FIRST, at his word above; `brawler.png` here is its picture, his to turn down.
- Both baked again; the bag pictures the same. Checked: `defuniques` 43 of 43, `skins` 50 of 50.
