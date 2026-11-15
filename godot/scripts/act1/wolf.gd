## THE FOG WOLVES (floor 9), as the game fights them with their PACK STRIKE, as the game starts (game/act1_rules/wolf.ts RULES,
## LUNGE_ACTS, packOf, packState, placeOf, onRing, itsTurn, clearLeap, runOn, gather; art/action_f9_pinewood.ts LEAP, PACK,
## LEAP_HIT, LEAP_STRIKE, leapCarry, leapStrikes; WOLF_PACK on: game/enemy_moves.ts). His doc's table: "A bite. They circle to
## come at you from behind." made more by his review of 31 Oct 2026: “Pack strike: the pack spreads in a ring round you, then
## lunges in one after another from every side, a beat apart.” A small mob: one attack. Nothing of it is drawn on the floor.
##   ITS GLIDE: 3 tiles a second (its walk painted for it), its legs never touching the floor, so it stops at any frame; as near
##     as 1.0 tile, off again beyond 1.3.
##   THE PACK: the wolves awake and in sight of him within 6.5 tiles are a pack, counted round him in the order they stand
##     round him as it gathers (newcomers last, once it is mostly there). Each glides round him the shorter way to its own place
##     on a ring 2.6 tiles round him, the places spread evenly about where they came from, drawing in to the ring as it goes
##     (half a tile a second's worth of pull, at most 0.8), and holds there, facing him, still (its stand's first picture).
##     One that is blocked as it goes round (it moved less than a third of its step), or has gone round 3.5 s without getting
##     there, comes straight in for 2 s.
##   THE LUNGE (list `attack`, 1.5 s, within 2.9 tiles): one after another, going round, each a beat (0.35 s) after the one
##     before: the first of a round once all are on the ring, or once it has held its place 1.2 s; the next round from the last
##     within 1.5 + 0.7 s of it. Crouched by 0.25 s, held; in two frames (0.567 to 0.633 s) it leaps clean through where he
##     stands, the game carrying it 2 tiles in the first and 4.4 by the second, then skidding 0.8 more over 0.34 s (to a wall);
##     at 0.633 s a hero in the strip it leapt through (from 0.3 behind where it set off to 0.2 past where it ran to, within
##     0.6 to either side; not in the air of his lunge) is bitten, x1. It lands on the ring across from where it was: its place
##     is across from then on. None leaps at him into a wall: its way must be clear for 4.4 tiles, or a tile and a half past
##     him (one that comes straight in, only to him and 0.2 on); its turn but no room for a second together, it comes straight in.
extends "res://scripts/act1/act1.gd"

## (RULES.gait: its glide)
const GAIT := {"pace": 3.0, "cycle": 1.0 / 16.0, "setOff": 0.0, "halt": 0.0, "stopAt": 1.0, "slack": 0.3, "trueBack": false}
## (LUNGE_ACTS)
const ACTS := [
	{"id": "wolf:lunge", "clip": "attack", "long": 1.5, "hit": 19.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.3, "near": 0.0, "far": 2.6 + 0.3},
]
## (LEAP; LEAP_STRIKE; PACK; WOLF.circle: to, most, rest; ON_RING: within this of its place it is on it)
const LEAP := {"hit": 19.0 / 30.0, "crouch": 0.25, "long": 1.5, "mid": 2.0, "leap": 4.4, "skid": 0.8, "skidFor": 0.34, "half": 0.6}
const STRIKE := [17.0 / 30.0, 19.0 / 30.0]
const FR := 1.0 / 30.0
const CARRIED := 4.4 + 0.8
const PACK := {"ring": 2.6, "beat": 0.35, "gather": 1.2}
const CIRCLE := {"to": 6.5, "most": 3.5, "rest": 2.0}
const ON_RING := 0.4

## THE PACKS, by the floor they are on (the game's, by game: wolf.ts `packs`): {base, ids, across, t, i}.
static var _packs := {}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## (keep: `circ` how long it has gone round, `rest` how long it comes straight in yet, `held` how long it has held its place,
## `blocked` how long its turn has found no room to leap, `run` how far its lunge may carry it)
func spawned(_m) -> void:
	a1 = {"circ": 0.0, "rest": 0.0, "held": 0.0, "blocked": 0.0, "run": CARRIED}


# --- the pack (wolf.ts packOf, packState, placeOf, onRing, itsTurn) ---

## The game's clock (g.time): the floor's.
static func now(m) -> float:
	return float(m.mgr.perils._clock) if m.mgr.perils != null else Time.get_ticks_msec() / 1000.0


static func wrap_a(a: float) -> float:
	var v := fmod(a, TAU)
	if v > PI:
		v -= TAU
	if v <= -PI:
		v += TAU
	return v


## packOf: the wolves awake and in sight of him, near enough, by their numbers.
static func pack_of(m) -> Array:
	var h: Vector2 = m.mgr.hero.world
	var out: Array = []
	for o in m.mgr.list:
		if is_instance_valid(o) and o.kind == "wolf" and not o.dead and o.state != "sleep" and o.world.distance_to(h) <= float(CIRCLE["to"]) and m.mgr.sees(o.world, h):
			out.append(o)
	out.sort_custom(func(a, b): return a.id < b.id)
	return out


## packState: the pack's state, gathered afresh when who is in it has changed: a pack new come in counted round him in the order
## its wolves stand round him, its places spread evenly about where they came from; one still mostly there keeps its way round
## and its order, the newcomers last.
static func pack_state(m) -> Dictionary:
	var pack := pack_of(m)
	var now_ids := {}
	for o in pack:
		now_ids[o.id] = true
	var key: int = m.mgr.get_instance_id()
	var P = _packs.get(key)
	var h: Vector2 = m.mgr.hero.world
	var same: bool = P != null and P["ids"].size() == now_ids.size()
	if same:
		for id in P["ids"]:
			if not now_ids.has(id):
				same = false
				break
	if not same:
		var kept: Array = []
		if P != null:
			for id in P["ids"]:
				if now_ids.has(id):
					kept.append(id)
		if P != null and not kept.is_empty():
			var ids: Array = kept.duplicate()
			for o in pack:
				if not kept.has(o.id):
					ids.append(o.id)
			var across := {}
			for id in P["across"]:
				if now_ids.has(id):
					across[id] = true
			P = {"base": P["base"], "ids": ids, "across": across, "t": P["t"], "i": P["i"]}
		else:
			# (where they came from: the way round him most of them stand; counted round from there)
			var sx := 0.0
			var cx := 0.0
			var ang: Array = []
			for o in pack:
				var a := atan2(o.world.y - h.y, o.world.x - h.x)
				ang.append(a)
				sx += sin(a)
				cx += cos(a)
			var mid := atan2(sx, cx)
			var order: Array = []
			for k in pack.size():
				order.append([pack[k].id, wrap_a(float(ang[k]) - mid)])
			order.sort_custom(func(u, v): return float(u[1]) < float(v[1]))
			var n := maxi(1, pack.size())
			var ids: Array = []
			for q in order:
				ids.append(q[0])
			P = {"base": mid - (float(n - 1) / 2.0) * (TAU / n), "ids": ids, "across": {}, "t": P["t"] if P != null else -INF, "i": n - 1}
		_packs[key] = P
	return {"P": P, "pack": pack}


## placeOf: its place on the ring round the hero, its number in the pack and how many they are; empty: none.
static func place_of(m) -> Dictionary:
	var S := pack_state(m)
	var P: Dictionary = S["P"]
	var i: int = P["ids"].find(m.id)
	if i < 0:
		return {}
	var h: Vector2 = m.mgr.hero.world
	var n: int = S["pack"].size()
	var a: float = float(P["base"]) + (float(i) / n) * TAU + (PI if P["across"].has(m.id) else 0.0)
	return {"at": h + Vector2(cos(a), sin(a)) * float(PACK["ring"]), "i": i, "n": n}


static func on_ring(m) -> bool:
	var p := place_of(m)
	return not p.is_empty() and m.world.distance_to(p["at"]) <= ON_RING


## itsTurn: never within a beat of the last of the pack; on the ring, the next round from the last; the first of a round once
## all are on the ring or it has held there long enough.
static func its_turn(m, anyway := false) -> bool:
	var S := pack_state(m)
	var P: Dictionary = S["P"]
	var since := now(m) - float(P["t"])
	if since < float(PACK["beat"]):
		return false
	if anyway:
		return true
	var p := place_of(m)
	if p.is_empty():
		return true
	if since <= float(LEAP["long"]) + float(PACK["beat"]) * 2.0:
		return int(p["i"]) == (int(P["i"]) + 1) % int(p["n"])
	# (a new round: once all are on their places, or it has held a while)
	for o in S["pack"]:
		if not on_ring(o):
			return float(m.h2.a1.get("held", 0.0)) >= float(PACK["gather"])
	return true


## clearLeap: whether its leap at the hero (`dist` off) is clear of walls for `need` tiles.
static func clear_leap(m, dist: float, need: float) -> bool:
	var f: Vector2 = (m.mgr.hero.world - m.world) / maxf(0.01, dist)
	var d := 0.3
	while d <= need:
		if not m.mgr.clear(m.world.x + f.x * d, m.world.y + f.y * d, minf(m.r, 0.42)):
			return false
		d += 0.3
	return true


## runOn: how far it can be carried from where it is along the way it faces, to `most` tiles, before a wall.
static func run_on(m, most: float) -> float:
	var d := 0.0
	while d < most and m.mgr.clear(m.world.x + m.face.x * (d + 0.1), m.world.y + m.face.y * (d + 0.1), minf(m.r, 0.42)):
		d += 0.1
	return minf(d, most)


## leapCarry: how far the game has carried it, `t` seconds into its lunge (tiles, the way it faces).
static func leap_carry(t: float) -> float:
	var s0: float = STRIKE[0]
	var s1: float = STRIKE[1]
	if t <= s0:
		return 0.0
	if t < s0 + FR:
		return float(LEAP["mid"]) * ((t - s0) / FR)
	if t < s1:
		return float(LEAP["mid"]) + (float(LEAP["leap"]) - float(LEAP["mid"])) * ((t - s0 - FR) / FR)
	var u := clamp01((t - s1) / float(LEAP["skidFor"]))
	return float(LEAP["leap"]) + float(LEAP["skid"]) * (1.0 - (1.0 - u) * (1.0 - u))


## leapStrikes: whether the hero `x`, `y` tiles from where it set off (along the way it leaps, and aside) is in the strip it leaps through.
static func leap_strikes(x: float, y: float) -> bool:
	return x >= -0.3 and x <= float(LEAP["leap"]) + 0.2 and absf(y) <= float(LEAP["half"])


# --- its rules ---

func can(m, a: Dictionary, dist: float, _los: bool) -> bool:
	if a["id"] != "wolf:lunge":
		return true
	# (come straight in: once a beat has gone by, if it reaches him; on the ring, at its turn, with room to land out on the ring)
	if float(a1.get("rest", 0.0)) > 0.0:
		return clear_leap(m, dist, dist + 0.2) and its_turn(m, true)
	return on_ring(m) and clear_leap(m, dist, minf(float(LEAP["leap"]), dist + 1.5)) and its_turn(m)


func start(m, a: Dictionary, _hero) -> void:
	if a["id"] != "wolf:lunge":
		return
	act["x"] = m.world.x
	act["y"] = m.world.y
	a1["run"] = run_on(m, CARRIED)
	a1["held"] = 0.0
	# (it will land across the ring from where it is: its place is there now)
	var p := place_of(m)
	var P: Dictionary = pack_state(m)["P"]
	P["t"] = now(m)
	P["i"] = int(p["i"]) if not p.is_empty() else 0
	if P["across"].has(m.id):
		P["across"].erase(m.id)
	else:
		P["across"][m.id] = true


func tick(m, dt: float, dist: float, hero) -> bool:
	if m.state == "act":
		return false
	return _gather(m, dt, dist, hero)


## THE PACK'S GATHERING ON THE RING, each step (wolf.ts gather): true if this step is all it does (gliding to its place, or
## holding it).
func _gather(m, dt: float, dist: float, hero) -> bool:
	a1["rest"] = maxf(0.0, float(a1.get("rest", 0.0)) - dt)
	var p := place_of(m)
	if not hero.alive or float(a1["rest"]) > 0.0 or p.is_empty() or dist > float(CIRCLE["to"]):
		a1["circ"] = 0.0
		a1["held"] = 0.0
		return false
	var at: Vector2 = p["at"]
	if m.world.distance_to(at) <= ON_RING:
		# (on its place: it holds there, facing him, until it is its turn)
		a1["circ"] = 0.0
		a1["held"] = float(a1.get("held", 0.0)) + dt
		m.face = (hero.world - m.world) / dist
		if its_turn(m):
			# (its turn, but no room to leap from here, a while: it comes straight in)
			if not clear_leap(m, dist, minf(float(LEAP["leap"]), dist + 1.5)):
				a1["blocked"] = float(a1.get("blocked", 0.0)) + dt
				if float(a1["blocked"]) > 1.0:
					a1["blocked"] = 0.0
					a1["rest"] = CIRCLE["rest"]
			else:
				a1["blocked"] = 0.0
			return false
		m.state = "chase"
		_to("stand")
		return true
	a1["held"] = 0.0
	a1["circ"] = float(a1.get("circ", 0.0)) + dt
	if float(a1["circ"]) > float(CIRCLE["most"]):
		a1["circ"] = 0.0
		a1["rest"] = CIRCLE["rest"]
		return false
	# ROUND HIM, the shorter way to its place, drawing in to the ring
	var b: Vector2 = (m.world - hero.world) / dist
	var off := wrap_a(atan2(at.y - hero.world.y, at.x - hero.world.x) - atan2(m.world.y - hero.world.y, m.world.x - hero.world.x))
	var side := 0.0 if absf(off) < 0.05 else (1.0 if off >= 0.0 else -1.0)
	var pull := clampf((dist - float(PACK["ring"])) * 1.2, -0.8, 0.8)
	var v := Vector2(-b.y * side - b.x * pull, b.x * side - b.y * pull)
	if v.length() < 1e-6:
		return false
	v = v.normalized()
	var sp: float = m.speed * m.slow()
	var step := minf(sp * dt, m.world.distance_to(at))
	var was: Vector2 = m.world
	slide(m, v * step)
	if m.world.distance_to(was) < step * 0.3:
		# (blocked: it comes straight in)
		a1["circ"] = 0.0
		a1["rest"] = CIRCLE["rest"]
		return false
	m.face = v
	m.state = "chase"
	if mode != "walk":
		_to("walk")
	gt += dt * sp / float(GAIT["pace"])
	return true


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] != "wolf:lunge":
		return
	if crossed(t0, t1, 0.25):
		sound(m, "gust", 0.3)
	var from := Vector2(act["x"], act["y"])
	if t1 > float(STRIKE[0]):
		# (the game carries it through where he stands, and on)
		var c := minf(leap_carry(t1), float(a1.get("run", CARRIED)))
		m.world = from + m.face * c
	if not crossed(t0, t1, a["hit"]):
		return
	# (its jaws snap shut past him: a hero in the strip it leapt through, from where it set off)
	var d: Vector2 = hero.world - from
	var along: float = d.dot(m.face)
	var aside: float = -d.x * m.face.y + d.y * m.face.x
	if open_to(hero) and along <= float(a1.get("run", CARRIED)) + 0.2 and leap_strikes(along, aside):
		blow(m, hero, a["dmg"])
	sound(m, "swing", 0.5)
