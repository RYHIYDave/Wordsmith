## THE HUSHED WATCH (floor 11, and the city's own), as the game fights them with their new moves on (game/act1_rules/watch.ts
## RULES, LANTERN_ACTS: WATCH_LANTERN on, his yes of 2 Nov 2026; art/action_f11_watch.ts). His picks to the art chat, 18 Oct
## 2026, of the watch: "The Order's black gags (Recommended)", "A head taller, menacing (Recommended)", "Gag falls, they kneel
## (Recommended)"; his review of 31 Oct 2026: "His basic becomes a halberd chop. Lantern throw, in place of the spin: he hurls his
## lantern, which smashes into a spreading pool of burning oil."
##   THEIR TRUDGE: 0.8 tiles a second, stopping only where both boots are down (each half of their twelve frames), 1.9 tiles off
##     and 0.4 nearer.
##   THE HALBERD CHOP (their basic blow, within 2.6 tiles; list `attack`, 2.1 s): heaved back over the head and held, shaking, the
##     bite's reach marked (a ring of 1.3 round where it will bite, from 0.4 s); in two frames its head bites the floor 2.01 tiles
##     before him (0.867 s): a hero within 1.3 of the bite, or on the split it runs on along the floor (from 0.4 to 4 tiles before
##     him, 0.7 to either side), struck x1 and knocked back 0.6 of a Heavy blow's step; the split seen 1.6 s (act2/marks11.gd
##     watch:bite).
##   THE LANTERN THROW (from 2 to 8 tiles; every 7 s at most, the first 2.5 s in; list `lantern`, 2.4 s): swung back low and held,
##     flaring; lobbed at where the hero stands as it leaves his hand (0.933 s), 0.5 s and 0.06 s a tile in the air; where it will
##     smash marked; it smashes: a hero within 1.4 struck x1.2 (fire); its oil burns 6 s, out to 1.9, burning a hero in it 0.3 of
##     that every 0.5 s (watch:lantern).
##   THE SERGEANT: a yellow pack's leader (its form 1, "Hushed Sergeant"), his brace of hounds at his heels: all as the floor's
##     monsters.json carries them, laid as the game lays them.
extends "res://scripts/act1/act1.gd"

## (GAIT)
const GAIT := {"pace": 0.8, "cycle": 6.0 / 8.0, "setOff": 0.0, "halt": 0.0, "stopAt": 1.9, "slack": 0.4, "trueBack": true}
## (CHOP, CHOP_HIT; LOB, LOB_HIT)
const CHOP_HIT := 26.0 / 30.0
const CHOP := {"up": 0.4, "long": 2.1, "r": 1.3, "from": 0.4, "half": 0.7, "split": 4.0, "knock": 0.6, "seen": 1.6}
const LOB_HIT := 28.0 / 30.0
const LOB := {"off": 0.34, "back": 0.52, "long": 2.4, "near": 2.0, "far": 8.0}
## (POOL; OIL_BURN)
const POOL := {"burst": 1.4, "r": 1.9, "spread": 0.35, "burn": 6.0, "fade": 1.0, "smash": 0.5}
const OIL_BURN := {"share": 0.3, "tick": 0.5}
## (LANTERN_ACTS)
const ACTS := [
	{"id": "watch:chop", "clip": "attack", "long": 2.1, "hit": CHOP_HIT, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.7, "near": 0.0, "far": 2.6},
	{"id": "watch:lantern", "clip": "lantern", "long": 2.4, "hit": LOB_HIT, "dmg": 1.2, "cooldown": 7.0, "first": 2.5, "after": 0.8, "near": 2.0, "far": 8.0},
]
## biteAt(): where its blade is in the floor at the bite (tiles before him, to his left), measured off its picture by the art.
const BITE := Vector2(2.01266607876527, -0.054137724544121774)
## lobFrom(): where the lantern leaves his hand (tiles before him, to his left; how high its middle is, picture pixels).
const FROM := Vector3(0.5664445030186099, 0.2551551815399144, 47.7)


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## chopStrikes: whether a hero `x` tiles before him and `y` to his left is in the bite or on the split.
static func chop_strikes(x: float, y: float) -> bool:
	return Vector2(x, y).distance_to(BITE) <= float(CHOP["r"]) or (x >= float(CHOP["from"]) and x <= float(CHOP["split"]) and absf(y - BITE.y) <= float(CHOP["half"]))


## lobFly: seconds in the air to a place `d` tiles off; lobArc: how high its arc rises over the straight way (picture pixels).
static func lob_fly(d: float) -> float:
	return 0.5 + 0.06 * d


static func lob_arc(d: float) -> float:
	return 50.0 + 6.0 * d


## lanternAt: where the lantern is `p.t` seconds after it left his hand: over the floor (tiles) and how high (game pixels).
static func lantern_at(p: Dictionary) -> Vector3:
	var hit: float = p["hit"]
	var u := clamp01(float(p["t"]) / hit if hit > 0.0 else 1.0)
	return Vector3(lerpf(p["a"], p["x"], u), lerpf(p["b"], p["y"], u), float(p["c"]) * (1.0 - u) + float(p["d"]) * 4.0 * u * (1.0 - u))


## The pool's ragged edge: how far out along a way `a` it reaches (tiles), `t` seconds after it smashes.
static func pool_edge(a: float, t: float) -> float:
	var grow := 1.0 - pow(1.0 - clamp01(t / float(POOL["spread"])), 2.0)
	return float(POOL["r"]) * grow * (1.0 + 0.09 * sin(a * 5.0 + 0.7) + 0.06 * sin(a * 11.0 + 2.1) + 0.03 * sin(a * 17.0 + t * 0.6))


## inOil: whether a point `v` tiles from where it smashed is in the burning oil `t` seconds after.
static func in_oil(v: Vector2, t: float) -> bool:
	return t >= 0.0 and t <= float(POOL["burn"]) and v.length() <= pool_edge(atan2(v.y, v.x), t)


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] == "watch:chop":
		var b := beside(m.world, m.face, act["hand"], BITE.x, BITE.y)
		# (its reach marked as he heaves it back over his head)
		if crossed(t0, t1, float(CHOP["up"])):
			m.mgr.perils.warn(b.x, b.y, float(CHOP["r"]), CHOP_HIT - float(CHOP["up"]), 0.0, m)
			sound(m, "swing", 0.4)
		if not crossed(t0, t1, float(a["hit"])):
			return
		var r := rel(m, hero)
		if open_to(hero) and chop_strikes(r.x, r.y):
			blow(m, hero, float(a["dmg"]))
			knock(hero, m.world, float(CHOP["knock"]))
		# (the floor split on from the bite, along the way he faces)
		peril(m, "watch:bite", b, {"dur": CHOP["seen"]})
		hero.kick(3.0)
		sound(m, "slam", 0.7)
		return
	if a["id"] != "watch:lantern":
		return
	if crossed(t0, t1, float(LOB["back"])):
		sound(m, "fire", 0.3)
	if not crossed(t0, t1, float(a["hit"])):
		return
	# (lobbed at where the hero stands now: it comes down there)
	var o := beside(m.world, m.face, act["hand"], FROM.x, FROM.y)
	var h: Vector2 = hero.world
	var d := h.distance_to(o)
	var fly := lob_fly(d)
	var way: Vector2 = (h - o) / d if d > 0.01 else m.face
	peril(m, "watch:lantern", h, {"hit": fly, "dur": fly + float(POOL["burn"]), "dmg": m._roll() * float(a["dmg"]), "el": "fire",
		"fx": way.x, "fy": way.y, "a": o.x, "b": o.y, "c": FROM.z / 2.0, "d": lob_arc(d) / 2.0})
	sound(m, "swing", 0.5)
