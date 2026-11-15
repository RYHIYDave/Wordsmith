## THE EYESPAWN (floor 10), as the game fights them (game/act1_rules/spawn.ts RULES, SPAWN, pictureWay, beamFar; render/act1_fx/
## spawn.ts). His picks: "An eye on tentacles (Recommended)", its basic attack "A tentacle lash (Recommended)", its big attack "A
## gold gaze beam (Recommended)". A medium mob: two attacks. Its gaze's warning, its beam and the line it burns are painted with it
## (its own pictures, list `gaze`): nothing more is drawn.
##   ITS HAUL: 1.1 tiles a second, stopping at any frame; as near as 0.95 tiles, off again beyond 1.2.
##   THE LASH (its basic blow, within 1.25 tiles; list `attack`, 1.1 s): its arm whipped across before it at 0.533 s: a hero
##     -0.2 tiles before it or more, within 1.3 of it and 0.9 to either side, is struck, x1, and knocked back 0.4 of a heavy
##     blow's step; the screen kicked 1.
##   THE GOLD GAZE (within 2.75 tiles; list `gaze`, 2.2 s; every 8 s, first 3 s after waking): only at a hero who stands on the
##     line its picture would burn (one of the floor's four ways, the one its picture faces: 0.2 to 2.6 tiles along it, within
##     0.4 of it); it is turned square to that way as it begins. Its beam burns from 1.0 to 1.65 s, striking the floor along its
##     forward from 0.4 tiles out to 2.6 (eased): the beam's point and the line burnt behind it, once a gaze: a hero within 0.4
##     of the line, from 0.1 tiles out to 0.15 past the point, is struck, x1.5, in FIRE (he burns a while).
##   HATCHING (one hatched out of the Drowned Eye's egg, `a1.hatch` 1): its hatch played whole first (1.3 s, list `hatch`), its
##     first picture till then; it may be struck as it hatches.
extends "res://scripts/act1/act1.gd"

## (RULES.gait)
const GAIT := {"pace": 1.1, "cycle": 1.0 / 15.0, "setOff": 0.0, "halt": 0.0, "stopAt": 0.95, "slack": 0.25, "trueBack": false}
## (ACTS)
const ACTS := [
	{"id": "spawn:lash", "clip": "attack", "long": 1.1, "hit": 16.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.55, "near": 0.0, "far": 1.25},
	{"id": "spawn:gaze", "clip": "gaze", "long": 2.2, "hit": 1.0, "dmg": 1.5, "cooldown": 8.0, "first": 3.0, "after": 0.6, "near": 0.0, "far": 2.75},
	{"id": "spawn:hatch", "clip": "hatch", "long": 1.3, "hit": 0.95, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.3, "near": 0.0, "far": 0.0, "forced": true},
]
## (SPAWN.lash, SPAWN.gaze)
const LASH := {"reach": 1.15, "half": 0.9, "knock": 0.4}
const GAZE := {"beam": [1.0, 1.65], "near": 0.4, "reach": 2.6, "half": 0.4}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## (keep: `hatch` 1 till it hatches, 2 as it hatches; none for one the floor has from the first)
func spawned(_m) -> void:
	if not a1.has("hatch"):
		a1["hatch"] = 0


## pictureWay: the way its picture faces for one that faces `f`: one of the floor's four (in front: along x; turned over, along
## y; from behind, along -y; from behind turned over, along -x).
static func picture_way(f: Vector2) -> Vector2:
	var back := f.x + f.y < -0.2
	var flip := f.x - f.y < 0.0
	if back:
		return Vector2(-1, 0) if flip else Vector2(0, -1)
	return Vector2(0, 1) if flip else Vector2(1, 0)


## beamFar: how far along its beam's line it strikes the floor `t` seconds into its gaze; less than 0 while it does not burn.
static func beam_far(t: float) -> float:
	var b0: float = GAZE["beam"][0]
	var b1: float = GAZE["beam"][1]
	if t < b0 or t > b1:
		return -1.0
	var u := clamp01((t - b0) / (b1 - b0))
	return float(GAZE["near"]) + (float(GAZE["reach"]) - float(GAZE["near"])) * u * u * (3.0 - 2.0 * u)


func forced(_m) -> int:
	return 2 if int(a1.get("hatch", 0)) == 1 else -1


func can(m, a: Dictionary, dist: float, _los: bool) -> bool:
	if a["id"] != "spawn:gaze":
		return true
	# (only at a hero who stands on the line its picture would burn)
	var d: Vector2 = m.mgr.hero.world - m.world
	var w := picture_way(d / maxf(0.01, dist))
	var along := d.dot(w)
	var side := absf(d.x * w.y - d.y * w.x)
	return along >= float(GAZE["near"]) - 0.2 and along <= float(GAZE["reach"]) and side <= float(GAZE["half"])


func start(m, a: Dictionary, _hero) -> void:
	if a["id"] == "spawn:hatch":
		a1["hatch"] = 2
	elif a["id"] == "spawn:gaze":
		# (turned to the way its picture faces it: its beam goes where its picture burns)
		m.face = picture_way(m.face)
		act["hand"] = hand_of(false, m.face)


func end(_m, a: Dictionary, _hero) -> void:
	if a["id"] == "spawn:hatch":
		a1["hatch"] = 0


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var free := open_to(hero)
	if a["id"] == "spawn:lash":
		if not crossed(t0, t1, a["hit"]):
			return
		# (its arm whipped across before it)
		var r := rel(m, hero)
		if free and r.x > -0.2 and hero.world.distance_to(m.world) <= float(LASH["reach"]) + HERO_R * 0.5 and absf(r.y) <= float(LASH["half"]):
			blow(m, hero, a["dmg"])
			knock(hero, m.world, LASH["knock"])
		hero.kick(1.0)
		sound(m, "swing", 0.6)
	elif a["id"] == "spawn:gaze":
		var b0: float = GAZE["beam"][0]
		var b1: float = GAZE["beam"][1]
		if crossed(t0, t1, b0):
			sound(m, "beam", 0.6)
			hero.kick(2.0)
		if int(act.get("b", 0)) == 1 or t1 <= b0 or t0 >= b1:
			return
		# (the beam's point, and the line it has burnt behind it: once a gaze)
		var far := beam_far(minf(t1, b1))
		if far < 0.0:
			far = GAZE["reach"]
		var r := rel(m, hero)
		if free and r.x >= float(GAZE["near"]) - HERO_R and r.x <= far + HERO_R * 0.5 and absf(r.y) <= float(GAZE["half"]):
			act["b"] = 1
			hero.hurt_by(m._roll() * float(a["dmg"]), "fire", m.words, m.half_of(), m)


## (render/act1_fx/spawn.ts sprite: one that is to hatch and has not yet begun is its hatching's first picture, not its stand)
func shown(m) -> Dictionary:
	if int(a1.get("hatch", 0)) == 1 and m.art.has("hatch"):
		return {"list": "hatch", "i": 0}
	return {}
