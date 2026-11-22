## THE QUARRY GOLEM (floor 6), as the game fights it with its new moves on, as the game starts (game/act1_rules/qgolem.ts RULES,
## ROLL_ACTS, BOULDER_PERIL, QUAKE_PERIL, boulderDown; its pictures' own numbers, art/action_f6_golem.ts HAMMER, BOULDER, ROLL_HIT,
## BOULDER_R, boulderGone, boulderHop, boulderStrikes, smashStrikes; GOLEM_BOULDER on: game/enemy_moves.ts). His doc's mob table:
## "A rock slam; a chunk torn off its body and thrown", made more by his review of 31 Oct 2026: “Boulder roll, in place of the
## throw”. A medium mob: two attacks.
##   ITS PLOD: a tile a second, its walk 1.5 s round, setting off and stopping 0.6 s each (pictures of their own); it stops only
##     as its walk comes round, from 1.8 tiles, and sets off again beyond 2.0.
##   THE HAMMER (its basic blow, within 2.3 tiles; list `attack`, 2.0 s): both fists up over its head by 0.45 s and held, its
##     reach marked from then on the floor 1.3 tiles before it, 1.5 round (the game's red circle, harmless of itself); down in
##     two frames at 0.967 s: a hero within 1.5 of there is struck, x1, and knocked back 0.8 of a heavy blow's step (not in the
##     air of his lunge); the floor cracks there (qgolem:quake, drawn only, 1.6 s), the screen kicked 4.
##   THE BOULDER ROLL (2.5 to 8 tiles; list `throw`, 2.7 s; every 7 s, first 1.2 s after waking): a boulder torn up out of the
##     rock before it (0.42 s), hauled up and held over its head; at 0.85 s where the hero stands is taken, and the lane marked
##     from it through there, 9 tiles or to a wall (qgolem:boulder); bowled at 1.6 s, the boulder rolls down the lane from 1.1
##     tiles out at 7 tiles a second, hopping (18 game pixels, then 9, then 4); a hero whose middle is within 0.75 of the lane's
##     middle line as it comes by (within its own half and 0.3 along) is struck, and it SMASHES on him; else at the lane's end;
##     a hero within 1.5 of where it smashes is struck, once, x1.4, and knocked back 0.8 of a step; its rock lies 1.6 s. If the
##     golem falls, or is stopped, before it bowls, the boulder and its lane go.
extends "res://scripts/act1/act1.gd"

## (art/new_mobs3.ts TILE3: so many of a figure's own lengths to a tile)
const TILE3 := 39.191835884530846
## (RULES.gait)
const GAIT := {"pace": 1.0, "cycle": 1.5, "setOff": 0.6, "halt": 0.6, "stopAt": 1.8, "slack": 0.2, "trueBack": false}
## (HAMMER: its fists' blow at `hit`, `at` tiles before it, `r` round; knocked back `knock` of a heavy blow's step)
const HAMMER := {"hit": 29.0 / 30.0, "long": 2.0, "at": 1.3, "r": 1.5, "knock": 0.8, "marked": 0.45}
## (BOULDER: the lane taken at `aim`; rolling from `from` at `pace`, `half` the lane's half width; its smash `r` round; the
## lane `long` at most; `hops`, each hop's end (tiles on) and height (game pixels); its rock lying `rubble`. BOULDER_R: its
## half across, tiles. ROLL_ROUND: how long a turn of it takes)
const BOULDER := {"aim": 0.85, "from": 1.1, "pace": 7.0, "half": 0.75, "r": 1.5, "long": 9.0, "near": 2.5, "far": 8.0, "hops": [[0.4, 18.0], [2.6, 9.0], [4.6, 4.0]], "rubble": 1.6, "tear": 0.42}
const ROLL_HIT := 48.0 / 30.0
const BOULDER_R := 20.0 / TILE3
const ROLL_ROUND := 0.45805351077209433
## (ROLL_ACTS)
const ACTS := [
	{"id": "qgolem:hammer", "clip": "attack", "long": 2.0, "hit": 29.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": 2.3},
	{"id": "qgolem:boulder", "clip": "throw", "long": 2.7, "hit": 48.0 / 30.0, "dmg": 1.4, "cooldown": 7.0, "first": 1.2, "after": 0.6, "near": 2.5, "far": 8.0},
]


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var h: Vector2 = hero.world
	if a["id"] == "qgolem:hammer":
		var s := beside(m.world, m.face, act["hand"], HAMMER["at"], 0.0)
		# (its reach marked as it holds its fists up)
		if crossed(t0, t1, HAMMER["marked"]):
			m.mgr.perils.mark(s.x, s.y, HAMMER["r"], float(HAMMER["hit"]) - float(HAMMER["marked"]), m)
		if not crossed(t0, t1, a["hit"]):
			return
		if h.distance_to(s) <= float(HAMMER["r"]) * m.mgr.perils.wide(m):
			blow(m, hero, a["dmg"])
			if hero._act != "lunge" and hero._invuln <= 0.0:
				knock(hero, m.world, HAMMER["knock"])
		peril(m, "qgolem:quake", s, {"dur": BOULDER["rubble"]})
		hero.kick(4.0)
		sound(m, "slam", 0.8)
		return
	# THE BOULDER ROLL
	if crossed(t0, t1, BOULDER["tear"]):
		sound(m, "slam", 0.35)
	if not crossed(t0, t1, BOULDER["aim"]):
		return
	# (where the hero stands now: the lane through there, to its length or a wall)
	var d: Vector2 = h - m.world
	var u: Vector2 = d / (d.length() if d.length() > 0.0 else 1.0)
	var long: float = BOULDER["from"]
	while long < float(BOULDER["long"]) and is_open(m, m.world + u * (long + 0.3)):
		long += 0.25
	peril(m, "qgolem:boulder", m.world, {"t": -(ROLL_HIT - float(BOULDER["aim"])), "hit": 1e9, "dur": 1e9, "dmg": m._roll() * float(a["dmg"]), "fx": u.x, "fy": u.y, "d": long})


# --- the boulder's own sums (art/action_f6_golem.ts) ---

## boulderDown: where it is down its lane, `t` seconds after it was bowled (tiles from the golem).
static func down(t: float) -> float:
	return float(BOULDER["from"]) + maxf(0.0, t) * float(BOULDER["pace"])


## boulderHop: how high it is over the floor `d` tiles from where it was bowled (game pixels): its hops, each a little arc.
static func hop(d: float) -> float:
	var prev := 0.0
	for q in BOULDER["hops"]:
		if d < float(q[0]):
			var u := (d - prev) / (float(q[0]) - prev)
			return float(q[1]) * 4.0 * u * (1.0 - u)
		prev = q[0]
	return 0.0
