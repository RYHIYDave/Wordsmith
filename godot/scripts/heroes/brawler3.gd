## THE BRAWLER'S BUILDS (his ask, 27 Nov 2026, 11:42: “I’d like you to look at build diversity and classes combined with talents and
## uniques.  Which class would you say is the weakest in these regards?”; the Brawler, the weakest; his “Yes, plan it (Recommended)”;
## to the plan, “How can you hold to punch as it is a tap ability?” (Flurry a tap, the Cannon Kick his push kick), “Shadow double is
## too close to the warlock” (Stepping Stones in its place), then “Build it as written (Recommended)”).
##
## WITH IT ON (the Brawler remade, heroes/brawler2.gd, on as well): three new talents that change how he fights, one hung under each
## globe's first stone, as the Mage's Ball, Beam and Spear hang under hers:
##   FLURRY (Punch): every tap throws three quick punches, not one, each lighter (FLURRY): the fast build's, with Quick Hands.
##   STEPPING STONES (Jump): a swipe made during a flying blow springs off what it hits onto the one nearest where the swipe points,
##     for another flying blow, free, twice as quick, up to STEP n in all for the one jump; no swipe, he comes down as ever. (First it
##     sprang on by itself, all three; his “So using a jump swipe move now just makes him jump two more times?  Kind of a seriously
##     long animation chain to locked into”, then “Swipe again to chain (Recommended)”, 27 Nov 2026.)
##   CANNON KICK (Kick): his push kick, the second kick in a row, sends the one it kicks flying (CANNON): everything it flies into is
##     struck and knocked aside; with Wall Slam it is stunned too, as one driven into another.
## And a STANCE, the element he fights in: three stones, one in the middle of each globe, only one of them his:
##   FIRE (Jump's globe): his flying blows leave the floor burning where he comes down (FIRE).
##   LIGHTNING (Kick's): every kick that lands arcs to the two nearest (LIGHTNING); THUNDER KNEE builds on it: what his lightning
##     kills passes it on to the next.
##   POISON (Punch's): every punch poisons (POISON); VIPER JAB builds on it: a poisoned one he drives into another passes its poison on.
## THE LAST ROUND (his unique wraps), that did nothing since the remake took the fire globes away: a swipe with three globes lit
## costs no jump.
## OFF (`--bbuilds=0`): he is as the remake made him. Checked: check_bbuilds.gd, `--only=bbuilds`.
extends RefCounted

## Switched on at his word, 27 Nov 2026, by 12:32, asked after the film and the cards: “Yes, switch them on (Recommended)”.
static var on := true

## (Flurry) punches a tap throws; how much faster each is played; each one's share of a punch
const FLURRY := {"n": 3, "pace": 2.0, "share": 0.6}
## (Stepping Stones) enemies in all, the first included; how far from where he lands the next may be, tiles; how much quicker a
## spring on is played
const STEP := {"n": 3, "far": 4.5, "pace": 2.0}
## (Cannon Kick) how far the one kicked flies, tiles, and in how long; the share of the kick each it flies into takes; how far
## those are knocked aside
const CANNON := {"far": 5.0, "secs": 0.45, "share": 0.6, "aside": 1.0}
## (Fire Stance) the burning floor where a flying blow comes down: its size, how long, its burn's share of a hit
const FIRE := {"r": 1.4, "secs": 3.0, "share": 0.4}
## (Lightning Stance) how many each kick arcs to, how far, the share of the kick each arc strikes for; (Thunder Knee with it) how many
## times a kill may pass it on
const LIGHTNING := {"n": 2, "far": 3.5, "share": 0.5, "on": 4}
## (Poison Stance) each punch's poison, of the hit; (Viper Jab with it) the share of its poison one driven into another passes on
const POISON := {"dose": 0.4, "spread": 0.5}

const STANCES := ["vfirestance", "vlightningstance", "vpoisonstance"]

## The new stones (talents.gd _brawler2): where each is, what it hangs from, its card.
const NODES := {
	"vflurry": {"name": "Flurry", "path": "punch", "from": ["vstiffjab"], "at": [0.0, 4.25], "big": true,
		"text": "Every tap throws 3 quick punches instead of 1, each for 60% damage."},
	"vsteppingstones": {"name": "Stepping Stones", "path": "jump", "from": ["vlightfeet"], "at": [3.3, 4.25], "big": true,
		"text": "Swipe again during a flying blow to spring off the enemy it hits onto another, free and twice as fast: up to 3 enemies for 1 jump."},
	"vcannonkick": {"name": "Cannon Kick", "path": "kick", "from": ["vswitchkick"], "at": [6.6, 4.25], "big": true,
		"text": "Your push kick (the second kick in a row) sends the enemy flying like a cannonball: everything it hits on the way takes 60% damage and is knocked aside."},
	"vpoisonstance": {"name": "Poison Stance", "path": "punch", "from": ["vviperjab", "vguardup"], "at": [0.0, 2.0], "big": true, "rune": "poison",
		"text": "Every punch poisons what it hits. (Fire, Lightning or Poison Stance: only one.)"},
	"vfirestance": {"name": "Fire Stance", "path": "jump", "from": ["vfirestarter", "vstoke"], "at": [3.3, 2.0], "big": true, "rune": "fire",
		"text": "Your flying blows leave the ground burning where you land for 3 seconds. (Fire, Lightning or Poison Stance: only one.)"},
	"vlightningstance": {"name": "Lightning Stance", "path": "kick", "from": ["vlonglegs", "vwallslam"], "at": [6.6, 2.0], "big": true, "rune": "lightning",
		"text": "Every kick that lands arcs lightning to the 2 nearest enemies for 50% damage. (Fire, Lightning or Poison Stance: only one.)"},
}
## (each path's name now under its new stone, at the foot of the tree)
const LABELS := {"punch": "vflurry", "jump": "vsteppingstones", "kick": "vcannonkick"}
## (the foot of the room, to hold the new row)
const ROOM_FOOT := 4.75

## The two talents that build on a stance, their cards.
const TEXT := {
	"vviperjab": "Your jab poisons what it hits. With Poison Stance: a poisoned enemy you knock into another spreads its poison to it.",
	"vthunderknee": "Your flying knee cracks with lightning: it arcs to 3 more nearby enemies and stuns them. With Lightning Stance: an enemy your lightning kills arcs it on to the next one.",
}

## THE LAST ROUND's card now.
const LAST_ROUND := "Swipe with 3 globes lit: your flying blow costs no jump."
