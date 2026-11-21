## THE MINI FLESHMANCER (kind `minifm`: an elite of floors 4 and 5, the leader of a pack of the cult's daggers), as the game
## fights him (game/bosses.ts GAITS.minifm, MINI2_ACTS, MINIFM, CORPSES; BossRules step, pickAct, startAct, fmActing, acting
## 'miniRaise', bodiesNear, called, endAct, died). He goes by a gait and acts of his own, as the bosses of floors 2 to 5 do.
##   HIS GAIT: he stands; he sets off after a hero further than 1.8 + 0.5 tiles (or out of his sight), walks, and halts where
##     his walk comes round to its first frame, as near the hero as he likes to stand.
##   HIS ACTS, the bigger ready one he is in reach of:
##     HIS FIRE (his basic blow, within 3.2 tiles, in his sight): claws cocked, held, thrust; from 0.87 s to 1.47 s his fire
##       is whipped across before him, from well off to his right to well off to his left, out to 3.6 tiles; the floor is
##       left burning in five lanes, 2 s each; the stream burns 40% of his blow every 0.22 s, a lane half that (the
##       Fleshmancer's fire, smaller: perils.gd fm_fire, its numbers in fleshmancer.gd).
##     HIS CALL (within 12 tiles, seen or not; every 9 s; never more than 4 of his dead standing): the dead come up out of
##       as many as two of the cult's bodies (a dagger's, a cultist's, a priest's) that lie within 7 tiles of him, the
##       nearest first; a body is his from 0.8 s after it fell. His fire catches them 0.8 s into the call; the first of the
##       dead crawls up from 1.1 s, the second 0.16 s after it, each 1.4 s coming up (as the Warden's dead come); the body
##       is gone from where it lay.
##   When he falls, the dead of his pack fall with him.
extends RefCounted

const FM := preload("res://scripts/fleshmancer.gd")

## (GAITS.minifm: the pace his walk is painted for and its loop; setting off, stopping; how near the hero he comes, and how
## much further off the hero must be before he sets off again. He goes at his own speed: 1.6 tiles a second, a Swift one more.)
const GAIT := {"pace": 1.0, "cycle": 1.0, "setOff": 0.4, "halt": 0.5, "stopAt": 1.8, "slack": 0.5}
## (MINI2_ACTS; the game's names for them: fm:minifire, miniRaise)
const ACTS := [
	{"id": "minifire", "clip": "attack", "long": 68.0 / 30.0, "hit": 26.0 / 30.0, "dmg": 0.4, "cooldown": 0.0, "first": 0.0, "after": 1.6, "near": 0.0, "far": 3.2},
	{"id": "miniRaise", "clip": "raise", "long": 2.2, "hit": 1.1, "dmg": 0.0, "cooldown": 9.0, "first": 1.5, "after": 0.8, "near": 0.0, "far": 12.0},
]
## (MINIFM.raise: out of as many as `n` bodies within `reach` of him, the second `apart` after the first; never more than
## `most` of his standing; a body is his from `fresh` seconds after it fell; his fire on it `glow` before the dead comes up)
const RAISE := {"n": 2, "reach": 7.0, "apart": 0.16, "most": 4, "fresh": 0.8, "glow": 0.3}
## (CORPSES: whose bodies are the cult's, and no more than this many of them lie at once)
const CORPSES := {"most": 24, "kinds": ["dagger", "cultist", "priest"]}

var mode := "stand"
var gt := 0.0
var cds: Array = []
## The act he is making: {i, t, hand}; null: none.
var act = null
## The dead he has called that have not yet begun to come up: {at, in}.
var _coming: Array = []


## A step of him, awake (monster.gd step hands him here).
func step(m, dt: float, hero) -> void:
	_come_up(m, dt, hero)
	if cds.is_empty():
		for a in ACTS:
			cds.append(float(a["first"]) * randf_range(0.7, 1.2))
	# (FRENZIED, on him, hurrying him, and Withering slowing him: game.ts updateMonsters, `m.cd -= mdt * rage * wither`; bosses.ts step, his acts' waits by `rage`, his pace by it)
	m._cd -= dt * m.rage()
	for k in cds.size():
		cds[k] -= dt * m.frenzy()
	# (stunned or staggered in the middle of an act, or put to sleep in it and woken again: the act is broken off, bosses.ts
	# breakOff; monster.gd break_off)
	if act != null and m.state != "act":
		act = null
		_to("stand")
	if act != null:
		_step_act(m, dt, hero)
		return
	m.state = "chase"
	var to: Vector2 = hero.world - m.world
	var dist := to.length()
	var los: bool = hero.alive and dist < 16.0 and m.mgr.sees(m.world, hero.world)
	var want := _pick(m, dist, los) if m._cd <= 0.0 and hero.alive else -1
	var moving := mode == "setOff" or mode == "walk" or mode == "halt"
	var go: bool = hero.alive and want < 0 and (dist > GAIT["stopAt"] + GAIT["slack"] or (not los and dist > 1.2))
	if not moving:
		m._set_list("idle")
		gt += dt
		if dist > 0.01:
			m.face = to / dist
		if want >= 0:
			_start(m, want, hero)
		elif go:
			_to("setOff")
		return
	# CARRIED OVER THE FLOOR AT HIS PACE, from the first moment of setting off to the last of stopping
	# (chilled, slower by the chill's share: bosses.ts step, `slow`; monster.gd slow)
	var sp: float = m.speed * m.slow() * m.rage()
	var v: Vector2 = to / dist if dist < 2.5 and los and dist > 0.01 else m.mgr.flow_dir(m.world)
	if mode != "halt" and v != Vector2.ZERO:
		m.face = v
	var step: Vector2 = m.face * sp * dt
	var rr := minf(m.r, 0.42)
	if m.mgr.clear(m.world.x + step.x, m.world.y, rr):
		m.world.x += step.x
	if m.mgr.clear(m.world.x, m.world.y + step.y, rr):
		m.world.y += step.y
	var before := gt
	gt += dt * sp / GAIT["pace"]
	var stop := want >= 0 or v == Vector2.ZERO
	var here: bool = stop or (los and dist - GAIT["pace"] * GAIT["halt"] <= GAIT["stopAt"])
	if mode == "setOff":
		if gt >= GAIT["setOff"]:
			_to("halt" if here else "walk")
	elif mode == "walk":
		if here and floori(gt / GAIT["cycle"]) > floori(before / GAIT["cycle"]):
			_to("halt")
	elif gt >= GAIT["halt"]:
		_to("stand")
	# (his pictures go by the ground he has covered)
	if mode == "stand":
		m._set_list("idle")
	else:
		m._set_list(mode)
		m._anim_t = gt


func _to(next: String) -> void:
	mode = next
	gt = 0.0


## pickAct: the bigger ready act he is in reach of; -1, none (he comes on, or waits).
func _pick(m, dist: float, los: bool) -> int:
	for i in range(ACTS.size() - 1, -1, -1):
		var a: Dictionary = ACTS[i]
		if cds[i] > 0.0:
			continue
		if dist < a["near"] or dist > a["far"]:
			continue
		if a["id"] == "miniRaise":
			# (never more than four of his dead, and only where a body lies for one to come up out of; it needs no sight of the hero)
			if _called(m) > RAISE["most"] - 1 or _bodies(m).is_empty():
				continue
		elif not los:
			continue
		return i
	return -1


## startAct: turned to the hero, and from here on turned no more until it is over.
func _start(m, i: int, hero) -> void:
	var a: Dictionary = ACTS[i]
	var to: Vector2 = hero.world - m.world
	if to.length() > 0.01:
		m.face = to.normalized()
	m.state = "act"
	act = {"i": i, "t": 0.0, "hand": FM.hand_of(m.face)}
	m._set_list(a["clip"], true)
	m.mgr.used[a["id"]] = m.mgr.used.get(a["id"], 0) + 1
	if a["id"] == "miniRaise":
		m.mgr.sfx.play("boss_roar", -8.0)


func _step_act(m, dt: float, hero) -> void:
	var a: Dictionary = ACTS[act["i"]]
	var t0: float = act["t"]
	act["t"] = minf(a["long"], t0 + dt)
	var t1: float = act["t"]
	_acting(m, a, t0, t1, hero)
	if t1 >= a["long"]:
		_end(m, a)


## What each act does from t0 to t1 of it (fmActing 'fm:minifire'; acting 'miniRaise').
func _acting(m, a: Dictionary, t0: float, t1: float, hero) -> void:
	var at := func(T: float) -> bool: return t0 < T and t1 >= T
	match a["id"]:
		"minifire":
			# (his fire is a peril with its own clock from here, its harm rolled once: perils.gd fm_fire)
			if at.call(1e-4):
				m.mgr.perils.fm_fire(m.world, m.face, act["hand"], m._roll() * a["dmg"], true, m)
			if at.call(a["hit"]):
				m.mgr.sfx.play("fire")
				hero.kick(1.0)
		"miniRaise":
			# (his fire catches the bodies a moment before the dead come up out of them)
			if not at.call(a["hit"] - RAISE["glow"]):
				return
			var bodies := _bodies(m)
			var room := maxi(0, mini(RAISE["n"], RAISE["most"] - _called(m)))
			for k in mini(room, bodies.size()):
				var body = bodies[k]
				_coming.append({"at": body.world, "in": RAISE["glow"] + k * RAISE["apart"]})
				m.mgr.perils.fm_glow(body.world, k * RAISE["apart"], RAISE["glow"])
				# (the body is gone from where it lay)
				FM.gone(body)


## endAct: he stands as his pictures leave him, and waits his moment.
func _end(m, a: Dictionary) -> void:
	var i: int = act["i"]
	m.state = "chase"
	act = null
	_to("stand")
	# (SWIFT on him, bosses.ts endAct: his wait after a move and the move's own wait shorter, a minion's word half as much)
	var swift: float = 1.0 - 0.3 * m.word_share("swift")
	m._cd = float(a["after"]) * swift * randf_range(0.9, 1.15)
	if a["cooldown"] > 0.0:
		cds[i] = a["cooldown"] * swift
	m._set_list("idle", true)


## died: THE DEAD HE RAISED FALL WITH HIM: they were up by his will alone.
func died(m) -> void:
	_coming.clear()
	FM.fall_with(m)


## How many of the dead he has raised still stand, or are coming (called).
func _called(m) -> int:
	return _coming.size() + FM.raised_by(m)


## bodiesNear: the cult's bodies he could raise the dead out of now: within his reach, lain long enough, not already taken;
## the nearest first. (A body lies 30 s, as any does: monster.gd.)
func _bodies(m) -> Array:
	var lying: Array = []
	for o in m.mgr.list:
		if is_instance_valid(o) and o.dead and not o.is_queued_for_deletion() and o.kind in CORPSES["kinds"]:
			lying.append(o)
	# (no more than 24 of the cult's bodies lie at once: the oldest are gone)
	lying.sort_custom(func(a, b) -> bool: return a._dead_for < b._dead_for)
	if lying.size() > CORPSES["most"]:
		lying.resize(CORPSES["most"])
	var out: Array = []
	for o in lying:
		if o._dead_for >= RAISE["fresh"] and o.world.distance_to(m.world) <= RAISE["reach"]:
			out.append(o)
	out.sort_custom(func(a, b) -> bool: return a.world.distance_to(m.world) < b.world.distance_to(m.world))
	return out


## Each of the dead he has called begins to crawl up when its moment comes, and is up and in the fight 1.4 s later.
func _come_up(m, dt: float, hero) -> void:
	if _coming.is_empty():
		return
	var still: Array = []
	for c in _coming:
		c["in"] -= dt
		if c["in"] <= 0.0:
			FM.raise_dead(m, c["at"], hero, FM.SUMMON_RISE)
		else:
			still.append(c)
	_coming = still
