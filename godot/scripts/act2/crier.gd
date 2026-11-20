## FLOOR 11'S BOSS, THE CRIER (the Gate Ward, "The Crier's Square"), as the game fights him with his fight done the action way
## (game/act1_rules/crier.ts ACTION: CRIER_ACTION on, his yes of 2 Nov 2026; art/crier_action.ts, crier_action_fx.ts). The owner's
## doc: "The town crier, a huge man whose voice was the first one taken. Now the Hush speaks through his great brass speaking-
## trumpet, and nothing comes out of it but silence." His brief to the art chat (18 Oct): "Heavy and pompous, then sudden
## (Recommended)"; his death, "The Hush pours out of him"; his pick of 2 Nov 2026 for his basic blow: "The toll follows you".
##   HIS MARCH: 1.7 tiles a second, chest out, setting off and stopping in pictures of their own; he stops 2.2 tiles off.
##   THE TOLL (his basic, within 9 tiles; list `attack`, 4.2 s): his handbell off his belt, raised high and held; five tolls, at
##     0.967, 1.5, 2.033, 2.567 and 3.1 s, each marking where the hero stands THEN (crier:toll), bursting 0.6 s later: struck x0.9
##     within 1.6 of it. Keep moving.
##   THE SHOUT OFF THE WALLS (every 8 s, the first 3 s in; list `shout`, 3.33 s): he faces down his square along the floor's way
##     nearest the hero; his square's walls found from where he stands (20 tiles at most each way); the wave out of his trumpet at
##     1.733 s, out at 20 tiles a second, and its echoes back off the three walls it meets at 16 (crier:shout9); a hero within a
##     front as it passes struck x0.6, once by each, and HUSHED (his words dark 4 s); THE ONE SPOT behind him none reach.
##   THE PROCLAMATION (every 11 s, the first 5 s in; 2 to 13.5 tiles; list `proclaim`, 2.8 s): the decree flung down a lane at him,
##     to the wall (13.5 at most), at 1.4 s: its roll striking x1.2 once as it passes; then THE FLOOR TAKEN AWAY: on it while its
##     letters burn (to 4.3 s after), struck 0.4 of that every 0.5 s (crier:decree).
##   THE CROWD (every 16 s, the first 7 s in; list `crowd`, 3.33 s): the Hush welling up in pools at the edges of his square, the
##     mouths of the lanes into it first; out of each two of the Hushed come; three at a call, four once he is down to half his
##     life, never more than six of his calling up at once (crier:call9).
##   HIS LINE: "..." (he has no voice; doors.gd); HIS DEATH: what of his would still harm goes with him.
extends "res://scripts/act1/act1.gd"

const FloorMap := preload("res://scripts/floor_map.gd")
## (defs.ts MSG.foe)
const FOE := Color("#ff8a3a")

## (CRIER_GAIT)
const GAIT := {"pace": 1.7, "cycle": 0.8, "setOff": 0.2472871273885219, "halt": 0.29379867887472483, "stopAt": 2.2, "slack": 0.5, "trueBack": true}
## (TOLL_HITS, TOLL; SHOUT_HIT, SHOUT_HOLD; PROCLAIM_HIT, PROCLAIM_HOLD; CROWD_HIT, CROWD_HOLD)
const TOLL_HITS := [29.0 / 30.0, 45.0 / 30.0, 61.0 / 30.0, 77.0 / 30.0, 93.0 / 30.0]
const TOLL := {"r": 1.6, "burst": 0.6, "far": 9.0}
const SHOUT_HIT := 52.0 / 30.0
const SHOUT_HOLD := [20.0 / 30.0, 50.0 / 30.0]
const PROCLAIM_HIT := 42.0 / 30.0
const PROCLAIM_HOLD := [18.0 / 30.0, 40.0 / 30.0]
const CROWD_HIT := 48.0 / 30.0
const CROWD_HOLD := [20.0 / 30.0, 46.0 / 30.0]
## (CRIER9_ACTS)
const ACTS := [
	{"id": "crier:toll", "clip": "attack", "long": 126.0 / 30.0, "hit": 29.0 / 30.0, "dmg": 0.9, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 9.0},
	{"id": "crier:shout", "clip": "shout", "long": 100.0 / 30.0, "hit": SHOUT_HIT, "dmg": 0.6, "cooldown": 8.0, "first": 3.0, "after": 0.4, "near": 0.0, "far": 14.0},
	{"id": "crier:proclaim", "clip": "proclaim", "long": 84.0 / 30.0, "hit": PROCLAIM_HIT, "dmg": 1.2, "cooldown": 11.0, "first": 5.0, "after": 0.4, "near": 2.0, "far": 13.5},
	{"id": "crier:crowd", "clip": "crowd", "long": 100.0 / 30.0, "hit": CROWD_HIT, "dmg": 0.0, "cooldown": 16.0, "first": 7.0, "after": 0.4, "near": 0.0, "far": 14.0},
]
## (WALLS; WALL_LOOK)
const WALLS := {"from": 0.6, "out": 20.0, "back": 16.0, "band": 0.45, "side": 1.3, "behind": 1.6, "dark": 1.2}
const WALL_LOOK := 20.0
## (DECREE)
const DECREE := {"from": 1.3, "to": 13.5, "half": 1.5, "lands": 0.1, "unrolled": 0.3, "burn": 40.0, "out": 4.3, "gone": 5.0, "every": 0.5}
## (CALL; CRIER.crowd)
const CALL := {"speed": 12.0, "reach": 16.0, "rings": 4, "every": 0.18, "each": 2, "apart": 0.35, "first": 0.25, "out": 0.45, "sink": 0.8}
const CROWD := {"n": 3, "more": 4, "most": 6, "edge": [0.66, 1.0], "near": 4.0, "gap": 2.0, "round": [5.0, 8.0]}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


# --- the art's numbers of his moves (art/crier_action_fx.ts) ---

## echoTimes: when the wave reaches each wall, and when each echo is done (seconds after the shout).
static func echo_times(w: Dictionary) -> Dictionary:
	var reach := func(d: float) -> float: return maxf(0.0, d - float(WALLS["from"])) / float(WALLS["out"])
	var B: float = WALLS["back"]
	return {
		"far": [reach.call(w["far"]), reach.call(w["far"]) + (float(w["far"]) + float(WALLS["behind"])) / B],
		"left": [reach.call(w["left"]), reach.call(w["left"]) + (float(w["left"]) - float(WALLS["side"])) / B],
		"right": [reach.call(w["right"]), reach.call(w["right"]) + (float(w["right"]) - float(WALLS["side"])) / B],
	}


## frontsAt: where each front is `s` seconds after the shout (his frame); null where it is not.
static func fronts_at(s: float, w: Dictionary) -> Dictionary:
	var T := echo_times(w)
	var wave = float(WALLS["from"]) + float(WALLS["out"]) * s if s >= 0.0 else null
	var echo := func(tw: Array, from: float) -> Variant:
		return null if (s < float(tw[0]) or s > float(tw[1])) else from - float(WALLS["back"]) * (s - float(tw[0]))
	return {
		"wave": wave if (wave != null and wave < Vector2(maxf(float(w["far"]), 0.0), maxf(float(w["left"]), float(w["right"]))).length() + 0.5) else null,
		"far": echo.call(T["far"], float(w["far"])),
		"left": echo.call(T["left"], float(w["left"])),
		"right": echo.call(T["right"], float(w["right"])),
	}


## decreeFront: how far down its lane the roll is, `s` seconds after the fling (tiles); null in the air.
static func decree_front(s: float, to: float):
	if s < float(DECREE["lands"]):
		return null
	var u := clamp01((s - float(DECREE["lands"])) / (float(DECREE["unrolled"]) - float(DECREE["lands"])))
	return float(DECREE["from"]) + (to - float(DECREE["from"])) * (1.0 - pow(1.0 - u, 1.6))


## decreeBurns: whether the decree burns under a hero at (fwd, left) (its frame), `s` seconds after the fling.
static func decree_burns(s: float, fwd: float, left: float, to: float) -> bool:
	var front = decree_front(s, to)
	return front != null and s < float(DECREE["out"]) and absf(left) <= float(DECREE["half"]) and fwd >= float(DECREE["from"]) and fwd <= float(front)


## comesOut: when the `k`th of a pool comes out of it (seconds after the call), the `i`th pool of a call.
static func comes_out(i: int, k: int) -> float:
	return float(CALL["first"]) + i * 0.08 + k * float(CALL["apart"])


# --- his fight ---

## The way of the floor's four nearest (fx, fy).
static func axis(f: Vector2) -> Vector2:
	return Vector2(signf(f.x) if f.x != 0.0 else 1.0, 0.0) if absf(f.x) >= absf(f.y) else Vector2(0.0, signf(f.y) if f.y != 0.0 else 1.0)


## openTo: how far the open floor runs from `at` along `u`, to WALL_LOOK.
static func open_run(m, at: Vector2, u: Vector2) -> float:
	var d := 0.0
	while d < WALL_LOOK and m.mgr.clear(at.x + u.x * (d + 0.25), at.y + u.y * (d + 0.25), 0.2):
		d += 0.25
	return d


## wallsHere: his square's walls from where he stands, facing `f` along one of the floor's ways, drawn with `hand`.
static func walls_here(m, at: Vector2, f: Vector2, hand: int) -> Dictionary:
	var L := beside(Vector2.ZERO, f, hand, 0.0, 1.0)
	return {"far": open_run(m, at, f), "back": open_run(m, at, -f), "left": open_run(m, at, L), "right": open_run(m, at, -L)}


## Those of his calling still up, and those still to come out of his pools.
func called(m) -> int:
	var n := 0
	for o in m.mgr.list:
		if is_instance_valid(o) and not o.dead and o != m and o.has_meta("crier_called"):
			n += 1
	for p in m.mgr.perils.list:
		if p.get("kind") == "a1" and p.get("a1") == "crier:call9" and p.get("src") == m:
			n += maxi(0, int(p["a"]) - int(p.get("out_n", 0)))
	return n


## How many he calls now: three, four once he is down to half his life; never more than six of his up at once.
func _want(m) -> int:
	return maxi(0, mini(int(CROWD["more"]) if m.life < m.max_life / 2.0 else int(CROWD["n"]), int(CROWD["most"]) - called(m)))


## spotsFor: where his call's pools well up: at the edges of his square (its area of the floor), on whole floor, no nearer the hero
## than 4, 2 apart; at the mouths of the lanes into it first ("from the alleys"); where there is none, round the hero.
func spots_for(m, hero, want: int) -> Array:
	var map = m.mgr.map
	var spots: Array = []
	var ok := func(p: Vector2) -> bool:
		if not m.mgr.clear(p.x, p.y, 0.36) or p.distance_to(hero.world) < float(CROWD["near"]) or p.distance_to(m.world) < 2.0:
			return false
		for q in spots:
			if q.distance_to(p) < float(CROWD["gap"]):
				return false
		return true
	var land = map.land
	var area = null
	if land != null:
		for a in land.get("areas", []):
			if a.get("role") == "boss":
				area = a
	if area != null:
		var b: Dictionary = area["blob"]
		var reach := ceili(maxf(float(b["rx"]), float(b["ry"])) * 1.1) + 1
		var cands: Array = []
		for ty in range(floori(float(b["y"]) - reach), ceili(float(b["y"]) + reach) + 1):
			for tx in range(floori(float(b["x"]) - reach), ceili(float(b["x"]) + reach) + 1):
				var p := Vector2(tx + 0.5, ty + 0.5)
				var e := FloorMap.blob_dist(b, p)
				if e < float(CROWD["edge"][0]) or e > float(CROWD["edge"][1]):
					continue
				var alley := false
				for l in land.get("lanes", []):
					if _lane_dist(l, p) <= float(l["w"]) / 2.0 + 0.5:
						alley = true
						break
				cands.append([p, alley, randf()])
		# (the lanes' mouths first, then anywhere round the edge; each pass in the dice's order)
		cands.sort_custom(func(a, c): return a[2] < c[2] if a[1] == c[1] else a[1])
		for c in cands:
			if spots.size() >= want:
				break
			if ok.call(c[0]):
				spots.append(c[0])
	var tries := 0
	while spots.size() < want and tries < 80:
		tries += 1
		var a := randf_range(0.0, TAU)
		var d := randf_range(float(CROWD["round"][0]), float(CROWD["round"][1]))
		var p: Vector2 = hero.world + Vector2(cos(a), sin(a)) * d
		if ok.call(p):
			spots.append(p)
	return spots


## laneDist: how far a point is from a lane's middle line.
static func _lane_dist(l: Dictionary, p: Vector2) -> float:
	var pts: Array = l["pts"]
	var d := INF
	for i in range(pts.size() - 1):
		var a := Vector2(pts[i][0], pts[i][1])
		var b := Vector2(pts[i + 1][0], pts[i + 1][1])
		d = minf(d, Geometry2D.get_closest_point_to_segment(p, a, b).distance_to(p))
	if pts.size() == 1:
		d = p.distance_to(Vector2(pts[0][0], pts[0][1]))
	return d


func can(m, a: Dictionary, dist: float, _los: bool) -> bool:
	if a["id"] == "crier:crowd":
		return called(m) < int(CROWD["most"])
	if a["id"] == "crier:proclaim":
		# (the first stretch of its lane open floor, toward him)
		var hero = m.mgr.hero
		var f: Vector2 = (hero.world - m.world) / maxf(0.01, dist)
		var d := float(DECREE["from"])
		while d <= minf(dist, 5.0) + 1e-6:
			if not m.mgr.clear(m.world.x + f.x * d, m.world.y + f.y * d, 0.25):
				return false
			d += 0.35
	return true


func start(m, a: Dictionary, hero) -> void:
	if a["id"] == "crier:shout":
		# (down his square along the floor's way nearest the hero; its walls from here)
		m.face = axis(hero.world - m.world)
		act["hand"] = hand_of(true, m.face)
		var w := walls_here(m, m.world, m.face, act["hand"])
		var T := echo_times(w)
		peril(m, "crier:shout9", m.world, {"hit": SHOUT_HIT, "dur": SHOUT_HIT + maxf(float(T["far"][1]), maxf(float(T["left"][1]), float(T["right"][1]))) + float(WALLS["dark"]),
			"dmg": m._roll() * float(a["dmg"]), "a": w["far"], "b": w["back"], "c": w["left"], "d": w["right"], "hand": act["hand"]})
	elif a["id"] == "crier:proclaim":
		# (down a lane at him, to the wall)
		var to := minf(float(DECREE["to"]), open_run(m, m.world, m.face))
		peril(m, "crier:decree", m.world, {"hit": PROCLAIM_HIT, "dur": PROCLAIM_HIT + float(DECREE["gone"]), "dmg": m._roll() * float(a["dmg"]), "d": maxf(float(DECREE["from"]) + 1.0, to), "b": 0.0})
	elif a["id"] == "crier:crowd":
		var want := _want(m)
		var pools: Array = spots_for(m, hero, ceili(float(want) / float(CALL["each"]))) if want > 0 else []
		peril(m, "crier:call9", m.world, {"hit": CROWD_HIT, "dur": CROWD_HIT + comes_out(maxi(0, pools.size() - 1), int(CALL["each"]) - 1) + float(CALL["out"]) + float(CALL["sink"]) + 0.2,
			"a": want, "pools": pools, "out_n": 0, "pack": m.pack_id})


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] == "crier:toll":
		for T in TOLL_HITS:
			if not crossed(t0, t1, T):
				continue
			# (a toll: marked where he stands now, bursting a beat later)
			peril(m, "crier:toll", hero.world, {"hit": TOLL["burst"], "dur": float(TOLL["burst"]) + 0.5, "dmg": m._roll() * float(a["dmg"])})
			sound(m, "echo", 0.5)
		return
	if not crossed(t0, t1, float(a["hit"])):
		return
	if a["id"] == "crier:shout":
		hero.kick(3.0)
		sound(m, "gust", 0.7)
	elif a["id"] == "crier:proclaim":
		sound(m, "swing", 0.6)
	elif a["id"] == "crier:crowd":
		m.mgr.loot.say("%s calls, and no sound comes: the Hushed answer" % m.title, FOE)
		sound(m, "gust", 0.3)


## (the Hush pours out of him: what of his would still harm goes with him)
func died(m) -> void:
	for p in m.mgr.perils.list:
		if p.get("kind") == "a1" and str(p.get("a1", "")).begins_with("crier:") and p.get("src") == m:
			p["dur"] = minf(float(p["dur"]), float(p["t"]))


## render/act1_fx/crier.ts sprite: struck as he marches, he marches on (his flinch a standing one).
func _show(m) -> void:
	if m.state != "act" and (mode == "walk" or mode == "setOff" or mode == "halt"):
		var list := mode if (mode == "walk" or m.art.has(mode)) else "walk"
		m._set_list(list)
		m._anim_t = gt
		return
	super._show(m)
