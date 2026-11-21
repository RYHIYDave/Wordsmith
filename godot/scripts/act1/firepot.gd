## THE FIREPOT THROWER (the cult, floors 6 to 10), as the game fights it with its lob made big, as the game starts
## (game/act1_rules/firepot.ts RULES, FIREPOT, firepotNums, potAt; art/action_f6_cult.ts LOB, LOB_HIT, BLAZE, blazeFly, blazeArc,
## lobFrom; FIREPOT_BLAZE on: game/enemy_moves.ts). His doc's mob table: "Lobs pots that leave burning ground: the siege's
## bombardier" (small: one attack).
##   ITS TRUDGE: 1.1 tiles a second, its walk a second round, looping from its stand; it stands off as near as 4.5 tiles and
##     sets off again beyond 5.5.
##   THE LOB (within 8 tiles; list `attack`, 2.2 s): the lit pot whirled round over its head, held, the fuse catching (0.4 s),
##     and slung at 1.0 s from its sling, at where the hero stands then: it comes down there 0.55 s and 0.06 s a tile later,
##     over an arc 46 game pixels and 5 a tile above the straight way (firepot:pot). Where it comes down it bursts in the
##     cult's fire: a hero within 1.6 tiles is struck, x1, of Flame whatever its words; then the floor burns 5 s, burning a
##     hero within 1.55 of its middle (its 1.4 and half his width) x0.35 every half second until it dies down (its last 0.8).
extends "res://scripts/act1/act1.gd"

## (RULES.gait)
const GAIT := {"pace": 1.1, "cycle": 1.0, "setOff": 0.0, "halt": 0.0, "stopAt": 4.5, "slack": 1.0, "trueBack": true}
const ACTS := [
	{"id": "firepot:lob", "clip": "attack", "long": 2.2, "hit": 1.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 1.5, "near": 0.0, "far": 8.0},
]
## (firepotNums: where the pot leaves the sling, tiles before it, to the left it is drawn with, and game pixels up: art lobFrom,
## worked out there from its bones at the sling's last frame and copied here; its burst; the floor burning after: how long, its
## tick, its share of the blow, its dying down. FIREPOT.pot.rest: how high it comes to rest, game pixels)
const FROM := [0.6948123776932196, -0.3230165212184451, 27.38950218990842]
const BURST := {"r": 1.6, "long": 0.6}
const FIRE := {"r": 1.4, "burn": 5.0, "tick": 0.5, "dmg": 0.35, "fade": 0.8}
const REST := 1.5
## (BLAZE.spin: how fast the pot tumbles, times its 8 pictures a second)
const SPIN := 1.6


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	# (the fuse catches as it whirls)
	if crossed(t0, t1, 0.4):
		sound(m, "fire", 0.25)
	if not crossed(t0, t1, a["hit"]):
		return
	var h: Vector2 = hero.world
	var o := beside(m.world, m.face, act["hand"], FROM[0], FROM[1])
	var d := h.distance_to(o)
	var fly := fly_of(d)
	var way: Vector2 = (h - o) / d if d > 0.01 else m.face
	peril(m, "firepot:pot", h, {"hit": fly, "dur": fly + float(BURST["long"]) + float(FIRE["burn"]), "dmg": m._roll() * float(a["dmg"]),
		"fx": way.x, "fy": way.y, "a": o.x, "b": o.y, "c": FROM[2], "d": arc_of(d), "el": "fire"})
	sound(m, "swing", 0.5)


## blazeFly: how long the pot is in the air, slung at a hero `d` tiles off.
static func fly_of(d: float) -> float:
	return 0.55 + 0.06 * d


## blazeArc: how high its arc rises above the straight way, game pixels.
static func arc_of(d: float) -> float:
	return 46.0 + 5.0 * d


## potAt: where the pot is `p.t` seconds after it was let go: over the floor (tiles) and how high (game pixels).
static func pot_at(p: Dictionary) -> Vector3:
	var hit: float = p["hit"]
	var u := clamp01(float(p["t"]) / hit if hit > 0.0 else 1.0)
	return Vector3(lerpf(p["a"], p["x"], u), lerpf(p["b"], p["y"], u), float(p["c"]) * (1.0 - u) + REST * u + float(p["d"]) * 4.0 * u * (1.0 - u))
