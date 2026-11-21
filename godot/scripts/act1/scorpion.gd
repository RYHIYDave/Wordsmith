## THE CANYON SCORPIONS (floor 8), as the game fights them with their acid spit, as the game starts (game/act1_rules/scorpion.ts
## RULES, SCORPION, SPIT_ACTS, GLOB_PERIL, globNow, poison; art/action_f6_canyon.ts SNAP9, SPIT, spitFly, spitArc, spitFrom;
## SCORPION_SPIT on: game/enemy_moves.ts). His doc's table: "A pincer snap; a poison tail strike from range."
##   IT DARTS: it scuttles (2 tiles a second, half a second a round of its walk) in dashes of one or two rounds, then stops dead
##     still 0.35 to 0.75 s, turned to him, then goes again; still, it strikes at one in its reach. With its spit ready and the
##     hero nearer than 1.5 tiles, it darts back a round of its walk first, straight away from him, to strike from range.
##   THE PINCER SNAP (its basic blow, within 2 tiles; list `attack`, 1.0 s): both pincers held, and snapped shut at 0.567 s:
##     a hero in the strip 0.2 to 2.0 tiles before it and 0.8 to either side is struck, x1.
##   THE ACID SPIT (1.5 to 6 tiles; list `spit`, 1.6 s; every 6 s, first 2 s after waking): at 0.867 s a glob from its sting at
##     where the hero stands then, high over its shadow, coming down 0.45 s and 0.07 s a tile later (scorpion:glob): a hero
##     within 1.2 tiles is struck, x1.1, and POISONED ("Poisoned"): half the harm it did again over 4 s; then a pool of acid
##     1.4 round lies 4.5 s, burning a hero in it x0.3 every half second, shrinking over its last 0.8.
extends "res://scripts/act1/act1.gd"

## (art/new_mobs3.ts TILE3)
const TILE3 := 39.191835884530846
## (RULES.gait)
const GAIT := {"pace": 2.0, "cycle": 0.5, "setOff": 0.0, "halt": 0.0, "stopAt": 1.05, "slack": 0.4, "trueBack": true}
## (SPIT_ACTS)
const ACTS := [
	{"id": "scorpion:snap", "clip": "attack", "long": 1.0, "hit": 17.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 1.0, "near": 0.0, "far": 2.0},
	{"id": "scorpion:spit", "clip": "spit", "long": 1.6, "hit": 26.0 / 30.0, "dmg": 1.1, "cooldown": 6.0, "first": 2.0, "after": 0.6, "near": 1.5, "far": 6.0},
]
## (SNAP9; SPIT; POOL: the pool's tick and its share of the blow; SCORPION.sting.poison: the share of the harm it took that
## the poison does again over the hero's poison time; SCORPION.dash, still, back)
const SNAP := {"fwd": [0.2, 2.0], "half": 0.8}
const SPIT := {"splash": 1.2, "pool": 1.4, "stays": 4.5, "fade": 0.8}
const POOL := {"tick": 0.5, "share": 0.3}
const POISON_SHARE := 0.5
const DASH := [1, 2]
const STILL := [0.35, 0.75]
const BACK := 1
## (spitFrom: where the glob leaves its sting, its own lengths before it, to its left, and up: worked out there and copied here)
const SPIT_FROM := [20.98345264455592, 0.0, 23.510219157983894]
## (the colour of "Poisoned")
const POISONED := Color("#ff8a80")


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## (keep: `dash` its walk's rounds still to go; `still` seconds still to stand; `ph` its walk's place in its round when last
## seen; `back` its dart back's rounds still to go, the way (`bx`, `by`))
func spawned(_m) -> void:
	a1 = {"dash": -1, "still": 0.0, "ph": 0.0, "back": 0, "bx": 0.0, "by": 0.0}


func tick(m, dt: float, dist: float, hero) -> bool:
	if m.state == "act":
		return false
	if int(a1["back"]) > 0:
		# ITS DART BACK: away from him at its pace, its scuttle playing; it stops as its walk comes round, and strikes
		if mode != "walk":
			_to("walk")
		m.face = Vector2(a1["bx"], a1["by"])
		var sp: float = m.speed * m.slow()
		slide(m, m.face * sp * dt)
		var before := gt
		gt += dt * sp / 2.0
		if floori(gt / 0.5) > floori(before / 0.5):
			a1["back"] = int(a1["back"]) - 1
		if int(a1["back"]) <= 0:
			_to("stand")
			a1["still"] = 0.0
			a1["dash"] = -1
			a1["ph"] = 0.0
		return true
	if mode == "walk":
		# ITS DASH: so many rounds of its walk, counted as each comes round to its first frame; then it stops there
		if int(a1["dash"]) < 0:
			a1["dash"] = randi_range(DASH[0], DASH[1])
		var ph := fmod(gt, 0.5) / 0.5
		if ph < float(a1["ph"]):
			a1["dash"] = int(a1["dash"]) - 1
		a1["ph"] = ph
		if int(a1["dash"]) <= 0:
			_to("stand")
			a1["dash"] = -1
			a1["ph"] = 0.0
			a1["still"] = randf_range(STILL[0], STILL[1])
			return true
		return false
	a1["ph"] = 0.0
	a1["dash"] = -1
	# (standing, its spit ready and he too near for it: it darts back first)
	var spit: Dictionary = ACTS[1]
	if mode == "stand" and m._cd <= 0.0 and cds.size() > 1 and cds[1] <= 0.0 and dist < float(spit["near"]) and m.mgr.sees(m.world, hero.world):
		var n := dist if dist > 0.0 else 1.0
		a1["bx"] = (m.world.x - hero.world.x) / n
		a1["by"] = (m.world.y - hero.world.y) / n
		a1["back"] = BACK
		a1["still"] = 0.0
		return true
	if float(a1["still"]) <= 0.0:
		return false
	# DEAD STILL, but for its breath; it turns to him, and strikes if he is in its reach and it is ready
	a1["still"] = float(a1["still"]) - dt
	gt += dt
	if dist > 0.01:
		m.face = (hero.world - m.world) / dist
	var ready := false
	if m._cd <= 0.0:
		for i in ACTS.size():
			var d: Dictionary = ACTS[i]
			if (cds.size() <= i or cds[i] <= 0.0) and dist >= float(d["near"]) and dist <= float(d["far"]):
				ready = true
	if ready:
		a1["still"] = 0.0
		return false
	# (its big move cools as it stands)
	for k in cds.size():
		cds[k] -= dt
	return true


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if not crossed(t0, t1, a["hit"]):
		return
	match a["id"]:
		"scorpion:spit":
			# (spat at where he stands now: it comes down there)
			var o := beside(m.world, m.face, act["hand"], float(SPIT_FROM[0]) / TILE3, float(SPIT_FROM[1]) / TILE3)
			var d: float = hero.world.distance_to(o)
			var fly := 0.45 + 0.07 * d
			peril(m, "scorpion:glob", hero.world, {"hit": fly, "dur": fly + float(SPIT["stays"]), "dmg": m._roll() * float(a["dmg"]), "a": o.x, "b": o.y, "c": float(SPIT_FROM[2]) / 2.0, "d": 40.0 + 6.0 * d})
			sound(m, "swing", 0.8)
			hero.kick(1.5)
		"scorpion:snap":
			var r := rel(m, hero)
			if r.x >= SNAP["fwd"][0] and r.x <= SNAP["fwd"][1] and absf(r.y) <= float(SNAP["half"]):
				blow(m, hero, a["dmg"])
			sound(m, "swing", 0.5)


## globNow: where a glob is `p.t` seconds after it was spat: over the floor (tiles) and how high (game pixels).
static func glob_at(p: Dictionary) -> Vector3:
	var hit: float = p["hit"]
	var u := clamp01(float(p["t"]) / hit if hit > 0.0 else 1.0)
	return Vector3(lerpf(p["a"], p["x"], u), lerpf(p["b"], p["y"], u), float(p["c"]) * (1.0 - u) + 2.0 * u + float(p["d"]) * 4.0 * u * (1.0 - u))


## Poisoned, as its venom poisons: `took` of his life taken, `share` of it again over his poison time (Hero.poisonT, as a
## monster's Poison word gives it).
static func poison(m, hero, took: float, share: float) -> void:
	if took <= 0.0 or not hero.alive:
		return
	hero.poison_dps = maxf(hero.poison_dps if hero.poison_t > 0.0 else 0.0, took * share / POISON_TIME)
	hero.poison_t = POISON_TIME
	word(m, hero, "Poisoned", POISONED)
