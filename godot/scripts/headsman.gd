## THE HEADSMAN MADE NEW, floor 2's boss, as the game fights him (game/bosses.ts HEADSMAN2_FIGHT, H2_GAIT, H2_ACTS; BossRules
## step, pickAct, startAct, acting, endAct, h2Clear; game/facing.ts handOf, beside, fromFigure; game/boss_calls.ts).
## The owner, 17 Oct 2026: "I'd like the headsman completely redesigned to be sleeker and more agile."
##   HIS PROWL: he stands; he sets off after a hero further than 2.6 + 0.6 tiles (or out of his sight), walks, and halts where his
##     walk comes round to its first frame, as near the hero as he likes to stand; his feet keep their grip (his pictures go by
##     the ground he covers: a clock of dt * pace / 1.6).
##   HIS ACTS, the biggest ready one he is in reach of (and sees the hero), each at its own clock; a move that carries him only
##     where the floor lets him go, and it ends with him moved where his pictures have taken him:
##     THE LUNGE (his basic blow): the blade round low before him, from his right to his left, at 3.7 tiles.
##     THE DASHES: a quick bound 1.5 tiles to his left or right (their waits shared).
##     THE FLURRY: three darts, a cut at each; the third, the heaviest, bites the floor.
##     THE BLADE WHEEL: he drives on behind the axe spun before him; whoever the wheel meets is struck, once in 11/30 s at most.
##     THE VAULT: the spot 6 tiles before him marked from 0.26 s; at 1.44 s the slam strikes all within 2.5 tiles of it, hard,
##       and throws them 2.2 steps.
##   He calls out his big moves ("Hold still.", "Heads will roll.", "The block awaits."), a line at most every 5 seconds.
extends RefCounted

const GAIT := {"pace": 1.6, "cycle": 10.0 / 15.0, "setOff": 0.34064691833451377, "halt": 0.4073135850011804, "stopAt": 2.6, "slack": 0.6}
const ACTS := [
	{"id": "lunge", "clip": "attack", "long": 1.5, "hit": 0.6, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 3.4},
	{"id": "dashL", "clip": "dashL", "long": 0.5, "hit": 0.5, "dmg": 0.0, "cooldown": 4.5, "first": 2.0, "after": 0.15, "near": 0.0, "far": 7.0},
	{"id": "dashR", "clip": "dashR", "long": 0.5, "hit": 0.5, "dmg": 0.0, "cooldown": 4.5, "first": 3.5, "after": 0.15, "near": 0.0, "far": 7.0},
	{"id": "flurry", "clip": "flurry", "long": 2.38, "hit": 0.62, "dmg": 0.7, "cooldown": 8.0, "first": 3.0, "after": 0.5, "near": 2.2, "far": 6.2},
	{"id": "wheel", "clip": "wheel", "long": 2.36, "hit": 0.8, "dmg": 0.5, "cooldown": 9.0, "first": 5.0, "after": 0.5, "near": 0.0, "far": 3.8},
	{"id": "vault", "clip": "vault", "long": 2.5, "hit": 1.44, "dmg": 1.8, "cooldown": 11.0, "first": 6.0, "after": 0.6, "near": 3.7, "far": 8.4},
]
const LUNGE := {"reach": 3.7, "from": -1.5, "to": 1.3}
const FLURRY := {"r": 1.3, "cuts": [[0.62, 3.421, 2.165, 0.7], [1.08, 4.022, -2.123, 0.7], [1.54, 5.513, -0.021, 1.0]]}
const WHEEL := {"stop": 1.86, "every": 11.0 / 30.0, "from": 0.6, "to": 1.7, "drive": 2.5, "ahead": 0.97, "r": 1.5}
const VAULT := {"warnFrom": 0.26, "spot": [6.121, -0.102], "reach": 2.5, "knock": 2.2, "shake": 7.0}
## Where a move that carries him leaves him: tiles forward and to his left (the art's H2_SHIFT).
const SHIFT := {"dashL": [0.0, 1.5], "dashR": [0.0, -1.5], "flurry": [2.2963966338592297, 0.0], "wheel": [2.5, 0.0], "vault": [3.061862178478973, 0.0]}
const CALLS := {"flurry": "Hold still.", "wheel": "Heads will roll.", "vault": "The block awaits."}
const CALL_GAP := 5.0
const SAY_FOR := 1.8
## (game.ts knockHero: HEAVY.knock tiles a step)
const HEAVY_KNOCK := 0.6
const HERO_R := 0.3

var mode := "stand"
var gt := 0.0
var cds: Array = []
## The act he is making: {i, t, hand, a, b, x, y}; null: none.
var act = null
var _clock := 0.0
var _last_call := -1000.0


## A step of him, awake (monster.gd step hands him here).
func step(m, dt: float, hero) -> void:
	_clock += dt
	if cds.is_empty():
		for a in ACTS:
			cds.append(float(a["first"]) * randf_range(0.7, 1.2))
	for k in cds.size():
		cds[k] -= dt
	if act != null:
		_step_act(m, dt, hero)
		return
	m._cd -= dt
	m.state = "chase"
	var to: Vector2 = hero.world - m.world
	var dist := to.length()
	var los: bool = hero.alive and dist < 16.0 and m.mgr.sees(m.world, hero.world)
	var want := _pick(m, dist, los, hero) if m._cd <= 0.0 and hero.alive else -1
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
	var sp: float = m.speed * m.slow()
	var v := Vector2.ZERO
	if dist > 0.01:
		v = to / dist if dist < 2.5 and los else m.mgr.flow_dir(m.world)
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


## pickAct: the biggest ready act he is in reach of; -1, none (he comes on, or waits).
func _pick(m, dist: float, los: bool, hero) -> int:
	for i in range(ACTS.size() - 1, -1, -1):
		var a: Dictionary = ACTS[i]
		if cds[i] > 0.0:
			continue
		if dist < a["near"] or dist > a["far"]:
			continue
		if SHIFT.has(a["id"]) and not _clear(m, a, hero):
			continue
		if not los:
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
	act = {"i": i, "t": 0.0, "hand": hand_of(m.face), "a": 0.0, "b": 0, "x": hero.world.x, "y": hero.world.y}
	m._set_list(a["clip"], true)
	m.mgr.used[a["id"]] = m.mgr.used.get(a["id"], 0) + 1
	if a["id"] == "vault":
		var p := beside(m.world, m.face, act["hand"], VAULT["spot"][0], VAULT["spot"][1])
		act["x"] = p.x
		act["y"] = p.y
		m.mgr.sfx.play("boss_roar", -6.0)
	if CALLS.has(a["id"]) and _clock - _last_call >= CALL_GAP:
		_last_call = _clock
		m.say(CALLS[a["id"]], SAY_FOR)


func _step_act(m, dt: float, hero) -> void:
	var a: Dictionary = ACTS[act["i"]]
	var t0: float = act["t"]
	act["t"] = minf(a["long"], t0 + dt)
	var t1: float = act["t"]
	_acting(m, a, t0, t1, hero)
	if t1 >= a["long"]:
		_end(m, a)


## What each act does from t0 to t1 of it.
func _acting(m, a: Dictionary, t0: float, t1: float, hero) -> void:
	var at := func(T: float) -> bool: return t0 < T and t1 >= T
	var h: Vector2 = hero.world
	var hand: int = act["hand"]
	match a["id"]:
		"lunge":
			if not at.call(a["hit"]):
				return
			var rel := from_figure(m.world, m.face, hand, h)
			var bearing := atan2(rel.y, rel.x)
			if rel.length() <= LUNGE["reach"] and bearing >= LUNGE["from"] and bearing <= LUNGE["to"]:
				_blow(m, hero, a["dmg"])
			m.mgr.sfx.play("swing", -2.0)
		"flurry":
			var cuts: Array = FLURRY["cuts"]
			for j in cuts.size():
				var c: Array = cuts[j]
				if not at.call(c[0]):
					continue
				var e := beside(m.world, m.face, hand, c[1], c[2])
				if h.distance_to(e) <= FLURRY["r"]:
					_blow(m, hero, c[3])
				m.mgr.sfx.play("swing", -3.0)
				# (the third, the heaviest, bites the floor: its chips are in his picture)
				if j == cuts.size() - 1:
					hero.kick(3.0)
					m.mgr.sfx.play("slam", -4.0)
		"wheel":
			if at.call(WHEEL["from"]):
				m.mgr.sfx.play("swing", -2.0)
			if t1 < a["hit"] or t0 >= WHEEL["stop"]:
				return
			# (the wheel goes on before him as he drives on behind it)
			var k := clampf((t1 - WHEEL["from"]) / (WHEEL["to"] - WHEEL["from"]), 0.0, 1.0)
			var c := beside(m.world, m.face, hand, WHEEL["ahead"] + WHEEL["drive"] * k, 0.0)
			if h.distance_to(c) > WHEEL["r"]:
				return
			if int(act["b"]) > 0 and t1 - float(act["a"]) < WHEEL["every"]:
				return
			act["b"] = int(act["b"]) + 1
			act["a"] = t1
			_blow(m, hero, a["dmg"])
			m.mgr.sfx.play("hit", -4.0)
		"vault":
			var spot := Vector2(act["x"], act["y"])
			if at.call(VAULT["warnFrom"]):
				m.mgr.perils.vault_mark(spot.x, spot.y, a["hit"] - VAULT["warnFrom"], m)
			if not at.call(a["hit"]):
				return
			# (THE SLAM: everything within its reach of the spot struck, hard, and thrown)
			if hero.alive and h.distance_to(spot) <= VAULT["reach"] + HERO_R * 0.5:
				_blow(m, hero, a["dmg"])
				var way := h - spot
				hero.knock(way.normalized() if way.length() > 0.01 else -hero.face, HEAVY_KNOCK * VAULT["knock"])
			m.mgr.perils.vault_slam(spot.x, spot.y)
			hero.kick(VAULT["shake"])
			m.mgr.sfx.play("slam")
			m.mgr.sfx.play("explode", -4.0)


## endAct: a move that carries him ends where he has gone; his dashes share a wait.
func _end(m, a: Dictionary) -> void:
	var i: int = act["i"]
	if SHIFT.has(a["id"]):
		var sh: Array = SHIFT[a["id"]]
		var p := beside(m.world, m.face, act["hand"], sh[0], sh[1])
		if _walkable(m, p):
			m.world = p
	if a["id"] == "dashL" or a["id"] == "dashR":
		var other := 2 if a["id"] == "dashL" else 1
		cds[other] = maxf(cds[other], 2.0)
	m.state = "chase"
	act = null
	_to("stand")
	m._cd = float(a["after"]) * randf_range(0.9, 1.15)
	if a["cooldown"] > 0.0:
		cds[i] = a["cooldown"]
	m._set_list("idle", true)


func _blow(m, hero, mult: float) -> void:
	if hero.alive:
		# (with his words: bosses.ts blow, hurtHero(roll, monsterElement(m), m.words, m))
		m.harm_hero(hero, m._roll() * mult)


## h2Clear: whether a move that carries him has a clear way toward the hero, every step of it on floor he may walk, and room to
## stand where he lands.
func _clear(m, a: Dictionary, hero) -> bool:
	var sh: Array = SHIFT[a["id"]]
	var to: Vector2 = hero.world - m.world
	var f: Vector2 = to.normalized() if to.length() > 0.01 else m.face
	var end := beside(m.world, f, hand_of(f), sh[0], sh[1])
	var n := maxi(2, ceili(m.world.distance_to(end) / 0.25))
	for k in range(1, n + 1):
		if not _walkable(m, m.world.lerp(end, float(k) / n)):
			return false
	for o in [Vector2(0.35, 0), Vector2(-0.35, 0), Vector2(0, 0.35), Vector2(0, -0.35)]:
		if not _walkable(m, end + o):
			return false
	return true


func _walkable(m, p: Vector2) -> bool:
	return m.mgr.map.walkable(floori(p.x), floori(p.y))


## game/facing.ts handOf, for pictures from behind painted as the camera truly sees them: 1 if his left in his picture is the
## world's left of the way he faces, -1 if his right is (he is drawn turned over when he faces screen-left).
static func hand_of(f: Vector2) -> int:
	return -1 if f.x - f.y < 0.0 else 1


## A point `fwd` tiles before him and `left` tiles to the left he is drawn with (beside).
static func beside(at: Vector2, f: Vector2, hand: int, fwd: float, left: float) -> Vector2:
	return Vector2(at.x + f.x * fwd + f.y * hand * left, at.y + f.y * fwd - f.x * hand * left)


## Where `p` is from him: (tiles before him, tiles to the left he is drawn with) (fromFigure).
static func from_figure(at: Vector2, f: Vector2, hand: int, p: Vector2) -> Vector2:
	var d := p - at
	return Vector2(d.x * f.x + d.y * f.y, (d.x * f.y - d.y * f.x) * hand)
