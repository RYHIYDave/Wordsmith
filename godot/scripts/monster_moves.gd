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
		{"id": "charge", "windup": 0.9, "dmg": 1.3, "cooldown": 9.0, "first": 0.0, "after": 2.2, "recover": 0.6, "near": 2.5, "far": 9.0},
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
	# FLOOR 3 (ACTION_F3): the green troll (a brute that is no champion): his RAMPAGE in place of his swing and his slam (two
	# swings, each a step in, at 0.6 and 1.167 s, then a leap and a two-fisted slam at 2.367 s; begun within 2.4 tiles), and
	# his BULL RUSH, the red troll's charge his own way, from 3 to 8 tiles, about every 7 s
	"bruteRampage": [
		{"id": "rampage", "windup": 71.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 2.0, "recover": 22.0 / 30.0, "near": 0.0, "far": 2.4},
		{"id": "charge", "windup": 1.0, "dmg": 1.3, "cooldown": 7.0, "first": 2.0, "after": 2.2, "recover": 1.0, "near": 3.0, "far": 8.0},
	],
	# the Boneward (floors 3 to 5): its thrust; its spear thrown from afar; and while its spear is gone, its shield
	"boneward": [
		{"id": "swing", "windup": 0.7, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 1.9, "recover": 0.5, "near": 0.0, "far": 0.0},
		{"id": "bash", "windup": 0.55, "dmg": 0.7, "cooldown": 0.0, "first": 0.0, "after": 1.6, "recover": 0.5, "near": 0.0, "far": 0.0},
		{"id": "throw", "windup": 0.75, "dmg": 1.3, "cooldown": 6.0, "first": 0.6, "after": 1.2, "recover": 0.55, "near": 3.5, "far": 8.0},
	],
	# the high priest, a pack's leader: his fire bolt, and his censer within 3.2 tiles (its `dmg` the whole of what its smoke
	# does to one who stays in it)
	"priest": [
		{"id": "shoot", "windup": 0.75, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 2.7, "recover": 0.3, "near": 0.0, "far": 0.0},
		{"id": "censer", "windup": 0.8, "dmg": 1.8, "cooldown": 7.0, "first": 1.5, "after": 2.0, "recover": 0.55, "near": 0.0, "far": 3.2},
	],
	# FLOOR 4 (ACTION_F4): the dagger cultist's FRENZY in place of his leap and plunge: four stabs, at 0.5, 0.733, 0.967 and
	# 1.2 s, each a share of his blow, carrying him 1.2 tiles; winded to 2.7 s; begun within 2.4 tiles
	"dagger": [
		{"id": "frenzy", "windup": 1.2, "dmg": 0.45, "cooldown": 0.0, "first": 0.0, "after": 1.6, "recover": 1.5, "near": 0.0, "far": 2.4},
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
	"brute": {"rampage": "attack", "charge": "chargeWind"},
	"boneward": {"swing": "attack", "bash": "bash", "throw": "throw"},
	"priest": {"shoot": "attack", "censer": "censer"},
	"dagger": {"frenzy": "attack"},
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
const RAIN := {"radius": 2.0, "delay": 1.5, "stuck": 0.6, "gone": 0.25, "rise": 0.15}
## THE LOCKDOWN (art/action_f1_fx.ts LOCKDOWN): rows of bars both ways across his hall 2.75 tiles apart, he in the middle of
## a cell; a hero within 0.42 of a row at the crash is struck; the bars stand 1.5 s as a cage, and are gone in 0.4.
const LOCKDOWN := {"cell": 2.75, "band": 0.42, "stand": 1.5, "rise": 0.4}
## THE FIRE SIGIL (art/action_f2_fx.ts SIGIL; game/action_f2.ts): a ring of 1.75 tiles under where the hero stood as the cast
## began; at the cultist's slam (its wind-up's end) it erupts, striking a hero inside; the pillar stands 0.3 s and falls in 0.2;
## the floor burns on 3 s, its fire shrinking in to the middle (burn_radius), burning a hero inside 18% of the blow each 0.5 s.
## If the cultist falls, or is stopped, before its slam, nothing erupts.
const SIGIL := {"radius": 1.75, "delay": 1.04, "pillar": 0.3, "fall": 0.2, "burn": 3.0, "strike": 1.0 / 30.0, "share": 0.18, "every": 0.5}
## THE RIME (art/action_f2_fx.ts RIME): at the Shade's blow, a patch of frost 1.2 tiles round, 1 tile before it; spreading in
## 0.2 s, lying 4 s, melting from its edge over the last 1; a hero in it walks 40% slower.
const RIME := {"radius": 1.2, "ahead": 1.0, "form": 0.2, "lie": 4.0, "melt": 1.0, "slow": 0.4}
## THE WARDEN'S BOLTS: seven in a fan, 0.2 radians apart, as far as 13 tiles.
const BOLTS := {"n": 7, "apart": 0.2, "range": 13.0}


## THE GREEN TROLL'S RAMPAGE (art/action_f3_fx.ts RAMPAGE, RING; game/action_f3.ts): its swings at `hits` strike a hero within
## `reach` of him in the half of the floor before him, for `swing` of his blow; as his club goes up over his head (`raise`)
## the ring is marked where it will come down, `ahead` before where he will land; the slam (the move's wind-up's end) strikes
## a hero within `radius` of it, for `slam` of his blow; the ring goes out over `wave` and its cracks lie `long`.
const RAMPAGE := {"hits": [0.6, 35.0 / 30.0], "raise": 1.4, "reach": 2.1, "travel": 2.0, "swing": 0.6, "slam": 1.0}
const RING := {"radius": 2.5, "ahead": 1.25, "wave": 0.2, "fade": 0.25, "long": 1.6}
## (art/monster_brute.ts RAMPAGE_CARRIED: how far the game carries him, tiles along the way he faces: [from, to, a, b, eased])
const RAMPAGE_CARRIED := [[0.7, 0.92, 0.0, 0.45, true], [1.27, 1.49, 0.45, 0.9, true], [62.0 / 30.0, 71.0 / 30.0, 0.9, 2.0, false]]
## HIS BULL RUSH (art/action_f3_fx.ts RUSH; action_f3.ts chargeOf): down a lane 0.9 wide each side, to 1.3 past the hero, at 11
## tiles a second; his run ended as its round (six frames) comes to one of `end_on`; then his stop carries him 1.2 on (the lane
## is drawn to there), most of it in the first 0.4 s.
const RUSH := {"speed": 11.0, "half": 0.9, "past": 1.3, "stop": 1.2, "stop_long": 0.4, "end_on": [3, 4, 5, 0], "knock": 1.2}
## THE BONEWARD'S SPEAR (defs.ts SPEAR): thrown at 7 tiles a second from its hand (0.9 before it) at where the hero stands;
## what it meets of the hero on the way is hurt, and it lies where it comes down until the Boneward picks it up. While it is
## gone the Boneward fights with its shield (reach `bash`) when the hero is within `near` of it; otherwise it goes for its
## spear (and with the spear within `close` of it, whoever is near), stoops for it within `pick`, and has it in hand `grab`
## into the `stoop`.
const SPEAR := {"speed": 7.0, "hand": 0.9, "r": 0.22, "bash": 1.0, "near": 2.5, "close": 1.2, "pick": 0.55, "grab": 0.5, "stoop": 1.0, "knock": 0.48}
## ITS SHIELD WALL (art/action_f3_fx.ts WALL; game.ts wallUp, hitMonster): while the wall is up a blow from within 60 degrees
## of straight before it glances off and does nothing. Up while it stands or walks with its spear in hand, and through its
## thrust's wind-up to `thrust_open`; down from the start of its throw, all the while its spear is gone, and until
## `raised_again` after it has picked it up. The glance shows for `glance`.
const WALL := {"arc": 120.0, "thrust_open": 0.6, "glance": 0.3, "raised_again": 1.0}
## THE HIGH PRIEST'S CENSER (defs.ts SMOKE): its burning smoke settles on the floor before him, as far as `at` (nearer if the
## hero is, no nearer than `near`), `r` across its middle, and burns whoever is in it every `tick` for `dur`.
const SMOKE := {"at": 1.9, "near": 1.0, "r": 1.15, "dur": 3.0, "tick": 0.5}
## THE DAGGER CULTIST'S FRENZY (art/cultists.ts FRENZY): its four stabs land at `hits` (the fourth is the move's wind-up's
## end); each strikes a hero within `reach` of where his steps have taken him, within 45 degrees of the way he faces; each
## stab steps him in 0.3 tiles.
const FRENZY := {"hits": [0.5, 22.0 / 30.0, 29.0 / 30.0], "reach": 1.2, "arc": 90.0, "step": 0.3, "travel": 1.2, "long": 2.7}
## (art/cultists.ts frenzyCame, a frame at a time, 30 a second: how far his pictures have carried him, tiles. The rules carry
## him as far, and his picture is drawn back by it: action_f4.ts frenzyAt, frenzyShift.)
const FRENZY_CAME := [0.0089, 0.0058, -0.0023, -0.0131, -0.0245, -0.0345, -0.0408, -0.0439, -0.0455, -0.046, -0.0455, -0.0443, -0.0427, -0.0408, -0.0255, 0.3188, 0.351, 0.3305, 0.3004, 0.2745, 0.2745, 0.2745, 0.6188, 0.651, 0.6305, 0.6004, 0.5745, 0.5745, 0.5745, 0.9188, 0.951, 0.9305, 0.9004, 0.8745, 0.8745, 0.8745, 1.2188, 1.251, 1.2857, 1.2788, 1.2699, 1.2603, 1.2513, 1.2444, 1.2408, 1.2395, 1.2385, 1.2377, 1.2372, 1.2369, 1.2368, 1.2369, 1.2371, 1.2374, 1.2379, 1.2384, 1.239, 1.2396, 1.2403, 1.2409, 1.2415, 1.2421, 1.2426, 1.2429, 1.2432, 1.2433, 1.2432, 1.243, 1.2425, 1.2418, 1.2408, 1.239, 1.2358, 1.2316, 1.2268, 1.2215, 1.2163, 1.2112, 1.2068, 1.2032, 1.2009, 1.2]


## Which moves a monster has (movesOf): the guardian is a brute that is a champion (the red troll); every other brute is the
## green troll, with his rampage and his rush.
static func moves_of(kind: String, champion: bool) -> Array:
	if kind == "brute":
		return MOVES["guardian"] if champion else MOVES["bruteRampage"]
	return MOVES.get(kind, [])


## How long a move has run, as its pictures show it: its wind-up counted down (`t` left of it), then its recovery (moveAge).
static func move_age(state: String, t: float, windup: float, recover: float) -> float:
	return windup - clampf(t, 0.0, windup) if state == "windup" else windup + recover - clampf(t, 0.0, recover)


## How far the rampage has carried him `t` seconds in (rampageTravel): a step in after each swing, then the leap.
static func rampage_travel(t: float) -> float:
	var at := 0.0
	for span in RAMPAGE_CARRIED:
		if t <= span[0]:
			return at
		var k := clampf((t - span[0]) / (span[1] - span[0]), 0.0, 1.0)
		at = span[2] + (span[3] - span[2]) * (k * k * (3.0 - 2.0 * k) if span[4] else k)
		if t < span[1]:
			return at
	return at


## How far his stop has carried the bull rush on, `t` seconds into it (rushStopTravel).
static func rush_stop_travel(t: float) -> float:
	var k := clampf(t / RUSH["stop_long"], 0.0, 1.0)
	var n: float = RUSH["speed"] * RUSH["stop_long"] / RUSH["stop"]
	return RUSH["stop"] * (1.0 - pow(1.0 - k, n))


## How far the frenzy's pictures have carried him by `age` seconds in (frenzyAt).
static func frenzy_at(age: float) -> float:
	return FRENZY_CAME[clampi(floori(age * 30.0 + 1e-6), 0, FRENZY_CAME.size() - 1)]


## How many steps the frenzy has taken by `t` (frenzyTravel): one with each stab.
static func frenzy_travel(t: float) -> float:
	var n := 0
	for at in [0.5, 22.0 / 30.0, 29.0 / 30.0, 1.2]:
		if t >= at - 1e-6:
			n += 1
	return n * FRENZY["step"]


## The way a figure's pictures face on the floor, for the way it truly faces (action_f4.ts pictureWays): one of the four
## corners it is painted from.
static func picture_ahead(f: Vector2) -> Vector2:
	var ahead := Vector2(0, -1) if f.x + f.y < -0.2 else Vector2(1, 0)
	if f.x - f.y < 0.0:
		ahead = Vector2(ahead.y, ahead.x)
	return ahead


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
