## THE MONSTERS' OWN MOVES on floor 1 (game/defs.ts MONSTER_MOVES and movesOf, with ACTION_F1 on), and the numbers the moves
## go by. A move: its wind-up, its blow (a share of the monster's own), its own cooldown and the first one (set from half to
## half as much again of `first`, so a pack does not slam together), how long the monster waits after it (`after`), its
## recovery (the rest of its picture), and from how near to how far it is made (0 for `far`: as far as its basic blow).
## Which picture each move plays: the figure's list of that name where it has one (art/bestiary.ts framesOf), else its attack.

const MOVES := {
	# the bone archer: its one shot, and now and then its ARROW RAIN, from 3 to 8 tiles
	"archer": [
		{"id": "shoot", "windup": 0.55, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 2.0, "recover": 0.3, "near": 0.0, "far": 0.0},
		{"id": "rain", "windup": 0.9, "dmg": 1.4, "cooldown": 7.0, "first": 3.0, "after": 1.8, "recover": 0.82, "near": 3.0, "far": 8.0},
	],
	# the marksman: his shot, and his great shot, its line of aim drawn first (from 2.5 to 13 tiles)
	"marksman": [
		{"id": "shoot", "windup": 0.7, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 2.2, "recover": 0.5, "near": 0.0, "far": 0.0},
		{"id": "pierce", "windup": 1.6, "dmg": 2.2, "cooldown": 8.0, "first": 2.0, "after": 2.0, "recover": 0.9, "near": 2.5, "far": 13.0},
	],
	# the red troll, a lair's guardian (a brute that is a champion): his swing, his slam (the red circle), his charge
	"guardian": [
		{"id": "swing", "windup": 0.6, "dmg": 0.65, "cooldown": 0.0, "first": 0.0, "after": 1.7, "recover": 0.55, "near": 0.0, "far": 0.0},
		{"id": "slam", "windup": 0.85, "dmg": 1.0, "cooldown": 7.0, "first": 2.0, "after": 2.3, "recover": 0.3, "near": 0.0, "far": 0.0},
		{"id": "charge", "windup": 0.9, "dmg": 1.3, "cooldown": 9.0, "first": 0.0, "after": 2.2, "recover": 0.6, "near": 3.5, "far": 9.0},
	],
	# the skeleton champion, a pack's leader: his cleave, and his rallying cry (heard only by minions that carry his words:
	# none do on floor 1, where no monster has words, so there he only cleaves)
	"champion": [
		{"id": "swing", "windup": 0.8, "dmg": 1.3, "cooldown": 0.0, "first": 0.0, "after": 2.0, "recover": 0.6, "near": 0.0, "far": 0.0},
		{"id": "rally", "windup": 0.85, "dmg": 0.0, "cooldown": 14.0, "first": 2.0, "after": 1.4, "recover": 0.9, "near": 0.0, "far": 10.0},
	],
	# the cultist (floor 2): its FIRE SIGIL in place of its fire bolt, from up to 7.5 tiles (ACTION_F2: cultistSigil)
	"cultist": [
		{"id": "sigil", "windup": 1.2, "dmg": 1.2, "cooldown": 0.0, "first": 0.0, "after": 3.2, "recover": 0.75, "near": 0.0, "far": 7.5},
	],
	# the Warden: his swing, his fan of bolts, the LOCKDOWN (bars across his hall: from anywhere in it) and the dead he calls
	"warden": [
		{"id": "swing", "windup": 0.7, "dmg": 0.8, "cooldown": 0.0, "first": 0.0, "after": 1.5, "recover": 0.55, "near": 0.0, "far": 0.0},
		{"id": "bolts", "windup": 0.7, "dmg": 0.5, "cooldown": 3.5, "first": 0.0, "after": 2.4, "recover": 0.3, "near": 3.4, "far": 12.0},
		{"id": "lockdown", "windup": 1.2, "dmg": 1.0, "cooldown": 8.0, "first": 3.0, "after": 2.4, "recover": 0.95, "near": 0.0, "far": 14.0},
		{"id": "summon", "windup": 1.1, "dmg": 0.0, "cooldown": 18.0, "first": 9.0, "after": 1.5, "recover": 0.8, "near": 0.0, "far": 12.0},
	],
}

## The picture each move plays, by the figure's own list names (assets/monsters/lists.json).
const PICTURE := {
	"guardian": {"swing": "swing", "slam": "attack", "charge": "chargeWind"},
	"warden": {"swing": "swing", "bolts": "attack", "lockdown": "lockdown", "summon": "summon"},
	"archer": {"shoot": "attack", "rain": "rain"},
	"marksman": {"shoot": "attack", "pierce": "pierce"},
	"champion": {"swing": "attack", "rally": "rally"},
	"cultist": {"sigil": "attack"},
}

## THE RED TROLL'S CHARGE (defs.ts CHARGE): 10 tiles a second, on 1.5 past where the hero stood, a line 0.75 either side;
## the hero he runs down knocked aside twice Heavy's knock (0.6 tiles).
const CHARGE := {"speed": 10.0, "past": 1.5, "half": 0.75, "knock": 1.2}
## THE DEAD HE CALLS (defs.ts SUMMON): four, 0.1 s after one another, each 1.4 s crawling out of the ground; no more while
## six of his stand.
const SUMMON := {"count": 4, "apart": 0.1, "rise": 1.4, "most": 6}
## THE MARKSMAN'S LINE OF AIM (defs.ts AIM): it follows the hero until 0.4 s before he looses; the great arrow at 16 tiles a
## second, 14 at most, 0.3 round, through whoever it meets.
const AIM := {"lock": 0.4, "speed": 16.0, "range": 14.0, "r": 0.3}
## THE ARROW RAIN (art/action_f1_fx.ts RAIN): a ring of 2 tiles where the hero stood as it looses, struck 1.5 s later; the
## arrows stand 0.6 s, gone in 0.25.
const RAIN := {"radius": 2.0, "delay": 1.5, "stuck": 0.6, "gone": 0.25}
## THE LOCKDOWN (art/action_f1_fx.ts LOCKDOWN): rows of bars both ways across his hall 2.75 tiles apart, he in the middle of
## a cell; a hero within 0.42 of a row at the crash is struck; the bars stand 1.5 s as a cage, and are gone in 0.4.
const LOCKDOWN := {"cell": 2.75, "band": 0.42, "stand": 1.5, "rise": 0.4}
## THE FIRE SIGIL (art/action_f2_fx.ts SIGIL; game/action_f2.ts): a ring of 1.75 tiles under where the hero stood as the cast
## began; at the cultist's slam (its wind-up's end) it erupts, striking a hero inside; the pillar stands 0.3 s and falls in 0.2;
## the floor burns on 3 s, its fire shrinking in to the middle (burn_radius), burning a hero inside 18% of the blow each 0.5 s.
## If the cultist falls, or is stopped, before its slam, nothing erupts.
const SIGIL := {"radius": 1.75, "pillar": 0.3, "fall": 0.2, "burn": 3.0, "strike": 1.0 / 30.0, "share": 0.18, "every": 0.5}
## THE RIME (art/action_f2_fx.ts RIME): at the Shade's blow, a patch of frost 1.2 tiles round, 1 tile before it; spreading in
## 0.2 s, lying 4 s, melting from its edge over the last 1; a hero in it walks 40% slower.
const RIME := {"radius": 1.2, "ahead": 1.0, "form": 0.2, "lie": 4.0, "melt": 1.0, "slow": 0.4}
## THE WARDEN'S BOLTS: seven in a fan, 0.2 radians apart, as far as 13 tiles.
const BOLTS := {"n": 7, "apart": 0.2, "range": 13.0}


## Which moves a monster has (movesOf): the guardian is a brute that is a champion.
static func moves_of(kind: String, champion: bool) -> Array:
	if kind == "brute":
		return MOVES["guardian"] if champion else []
	return MOVES.get(kind, [])


## How far the sigil's fire still burns, `t` seconds after it erupted (burnRadius).
static func burn_radius(t: float) -> float:
	if t < 0.0:
		return 0.0
	if t < SIGIL["pillar"]:
		return SIGIL["radius"]
	var u: float = (t - SIGIL["pillar"]) / (SIGIL["fall"] + SIGIL["burn"])
	return 0.0 if u >= 1.0 else SIGIL["radius"] * pow(1.0 - u, 0.7)


## How far out the rime lies `t` seconds after the blow, in the way `a` (radians on the floor): ragged, spreading, melting (rimeEdge).
static func rime_edge(t: float, a: float) -> float:
	if t < 0.0 or t > RIME["lie"]:
		return 0.0
	var rag := 0.86 + 0.06 * sin(3.0 * a + 1.3) + 0.05 * sin(5.0 * a + 0.4) + 0.03 * sin(9.0 * a + 2.2)
	var grow: float = 1.0 - pow(1.0 - t / RIME["form"], 2.0) if t < RIME["form"] else 1.0
	var from: float = RIME["lie"] - RIME["melt"]
	var melt := 1.0
	if t > from:
		var u := clampf((t - from) / RIME["melt"], 0.0, 1.0)
		melt = 1.0 - 0.55 * u * u * (3.0 - 2.0 * u)
	return RIME["radius"] * minf(1.0, rag + 0.03) * grow * melt


static func picture_of(figure: String, move: String) -> String:
	return PICTURE.get(figure, {}).get(move, "attack")
