## THE HOLLOW STAG (floor 9's boss, the Pinewood, "The Hollow Wood"), as the game fights him as it starts: HIS FIGHT DONE THE
## ACTION WAY (STAG_ACTION on: game/enemy_moves.ts; game/act1_rules/stag.ts ACTION, STAG9_ACTS, STAG9_GAIT, LAND9, BOUND9, own,
## insideClearing, fenceOf, landable, bound9, closeDue, called9, runOf, putIn, callWolves9; art/stag_action.ts STOT9, GORE9,
## CHARGE9, CLOSE, STARE, charge9Carry, stareCarry; art/stag_action_fx.ts CLEARING, WALL, outOf, thrownIn). His words of 31 Oct:
## “I love this.  It shrinks at 3/4, 1/2, and 1/4.  And I’d like him to move around the arena like the horse does in the princess
## fight.  Really explore the space.  Not EXACTLY like the horse but similar”. His pictures are the art chat's (his baked
## figure, art/stag_action.ts); what he lays on the floor is act1/stag_marks.gd's.
##   HIS BOUNDS: the great stot, 5.5 tiles a second, a round of 1.2 s, turning and stopping only as he lands (0.535 s and 1.135 s
##     into each round); between his blows he bounds all round the clearing the way he is going, swung in and out from its middle
##     (45 to 80 hundredths of the way out), jinking one way and the other as he lands, now and then cutting sharply across, never
##     within 1.3 tiles of its edge; when his blow is ready he comes at the hero; every six to eight bounds he lands heavy and
##     STANDS TO STARE (list `stare`, 1.8 s: his heavy landing knocks whoever is within 1.2 tiles 0.8 of a step, his body run on
##     over his planted hoofs, a snort at 1.24 s). Struck as he bounds, he bounds on.
##   HIS GORE (his basic blow, within 2.6 tiles; list `attack`, 2.0 s): his forefoot pawing, held, and at 0.9 s a sweep before
##     him from 0.3 to 3.0 tiles, 150 degrees across: struck, x1, and thrown back 1.4 of a step. Its sweep marked while it is held,
##     its gouges torn along it.
##   HIS CHARGE (3.2 to 9.5 tiles, every 9 s, first 2.5 s in, with a clear run of 3.4 tiles toward the hero; list `charge`, 2.8 s,
##     x1.5): the lane marked from 0.2 s (9.6 tiles long, 0.9 to either side); he bursts off at 1.0 s and is carried 7.94 tiles to
##     his crash at 1.54 s (12 tiles a second); a hero in the lane as he comes by is run down, once, and thrown aside 1.8 of a step;
##     where the wall (or the wood) is nearer, the run is cut where his antlers (1.5 tiles before him) meet it, and the crash plays
##     there; at the crash, whoever is before his antlers is struck, and the wall there splinters (growing back in 2.4 s).
##   THE WOOD CLOSES IN: at 3/4, 1/2 and 1/4 of his life, as soon as he is free, he rears and bellows (list `close`, 3.0 s), the
##     new edge marked from the start; at 1.4 s a wall of roots and thorny trunks bursts up round it (the clearing, an ellipse 8.5
##     by 10 tiles round his area's middle, at 0.8, 0.6, then 0.4 of it), rippling round from the side the hero is on, and STAYS:
##     from then the clearing is all the floor there is for the hero, for him and for the wolves (the floor's fence); whoever is
##     in its band (0.5 to either side of the edge) or outside it is struck (x1.2) and thrown in, a tile inside the new edge; the
##     wall inside it sinks away. He dies: the wall sinks, the fence is gone.
##   HIS BELLOW (within 14 tiles, every 18 s, first 7 s in, while fewer than four of his calling are up; list `bellow`, 2.6 s): the
##     roar at 0.75 s; at 1.3 s the fog wolves answer, two (three once he is below half his life), never more than four of his
##     calling up at once, out of the wood inside the clearing 3 to 9.5 tiles from the hero: "<his name> bellows: wolves answer
##     from the fog".
## His marks (perils.gd "a1"; act1/stag_marks.gd steps and draws them):
##   stag:lane  his charge's lane, from where he set off (`d` how far he may run), for its run.
##   stag:wall  the wall of roots round the clearing, all the fight from its first close: (x, y) the clearing's middle; `c` the
##              clearing now (its share across), `b` the one before it (sinking); `hit` its clock as it now burst up, `d` the way
##              round from which it rippled; `fx` the way round where his charge splintered it, and `fy` when (-1: never).
##   stag:gore, stag:edge  drawn only: his gore's sweep while he makes it; the new edge marked while he closes the wood.
extends "res://scripts/act1/act1.gd"

## (art/new_mobs3.ts TILE3)
const T3 := 39.191835884530846
## (STOT9: his bound's pace, how long a bound takes, his hoofs down; LAND9, BOUND9; EDGE9: never within this of the clearing's
## edge, bounding; ANTLERS: they meet what is before him this far before his floor point)
const STOT9 := {"pace": 5.5, "bound": 0.6, "down": 0.13, "period": 1.2}
const LAND9 := [0.535, 1.135]
const BOUND9 := 3.3
const EDGE9 := 1.3
const ANTLERS := 1.5
const GAIT := {"pace": 5.5, "cycle": 1.2, "setOff": 0.0, "halt": 0.0, "stopAt": 2.4, "slack": 0.4, "trueBack": false}
const ACTS := [
	{"id": "stag:gore", "clip": "attack", "long": 2.0, "hit": 0.9, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.3, "near": 0.0, "far": 2.6},
	{"id": "stag:stare", "clip": "stare", "long": 1.8, "hit": 0.05, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.1, "near": 0.0, "far": 0.0, "forced": true},
	{"id": "stag:charge", "clip": "charge", "long": 2.8, "hit": 32.0 / 30.0, "dmg": 1.5, "cooldown": 9.0, "first": 2.5, "after": 0.5, "near": 3.2, "far": 9.5},
	{"id": "stag:bellow", "clip": "bellow", "long": 2.6, "hit": 0.75, "dmg": 0.0, "cooldown": 18.0, "first": 7.0, "after": 0.6, "near": 0.0, "far": 14.0},
	{"id": "stag:close", "clip": "close", "long": 3.0, "hit": 1.4, "dmg": 1.2, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 0.0, "forced": true},
]
const GORE9 := {"paw": [0.3, 0.4, 0.5], "held": 0.5, "hit": 0.9, "near": 0.3, "reach": 3.0, "arc": 150.0, "knock": 1.4}
const CHARGE9 := {"aim": 0.2, "paws": [0.28, 0.36, 0.44, 0.5, 0.58, 0.66], "hit": 32.0 / 30.0, "strike": [1.0, 32.0 / 30.0], "launch": [1.1, 2.3],
	"pace": 12.0, "run": 0.47, "crash": 32.0 / 30.0 + 0.47, "lane": 9.6, "half": 0.9, "knock": 1.8}
## (charge9Carry(crash + 1): how far he has gone when he crashes)
const CHARGE9_CARRIED := 2.3 + 12.0 * 0.47
const CLOSE := {"roar": 0.55, "hit": 1.4, "mark": 0.0, "at": [0.75, 0.5, 0.25], "stages": [1.0, 0.8, 0.6, 0.4], "band": 0.5, "throwIn": 1.0}
const STARE := {"snort": 1.24, "knock": 1.2}
## (stareCarry: the landing's last S_LAND of his lengths, run on over his planted hoofs as he stops)
const S_LAND := 5.5 * T3 * 0.13 / 2.0
## (CLEARING: his arena, an ellipse `rx` by `ry` tiles round its middle; WALL: its band, its rising (`rise`, rippling round
## over `ripple`), the wall inside sinking away (`sink`, WALL_SINK_AFTER after the new one is all up), splintered growing back
## (`regrow`), a clump every `step` tiles along it, of ten kinds)
const CLEARING := {"rx": 8.5, "ry": 10.0}
const WALL := {"band": 0.5, "rise": 0.16, "ripple": 0.14, "sink": 0.7, "regrow": 2.4, "kinds": 10, "step": 0.8}
const WALL_SINK_AFTER := 0.3
## (STAG.bellow; STAG.charge: what a pine before his antlers at the crash becomes)
const BELLOW := {"roar": 0.75, "call": 1.3, "n": 2, "more": 3, "most": 4, "near": 6.0, "far": 9.5}
const PINES := ["young pine", "pine snag", "old pine", "pine"]
const SPLINTER := 1.9
## (defs.ts DEPTH_SCALE: a monster's life and blows grow by this share for every floor below the first; defs.ts MSG.foe)
const DEPTH_SCALE := {"life": 0.35, "dmg": 0.22}
const FOE := Color("#ff8a3a")


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## own: his fight's own (on him): the clearing's middle (his area's) and its share across now, which close is next, his bounds.
func own(m) -> Dictionary:
	if a1.has("cx"):
		return a1
	var area = m.mgr.map.area("boss") if m.mgr != null and m.mgr.map != null else null
	var cx: float = float(area["blob"]["x"]) if area != null else m.world.x
	var cy: float = float(area["blob"]["y"]) if area != null else m.world.y
	a1.merge({"cx": cx, "cy": cy, "k": 1.0, "stage": 0, "bound": -1, "side": 1, "spin": 0, "bounds": 0, "stareAt": 7, "stareNow": 0, "way": 0.6}, true)
	return a1


## (his clearing is taken from the floor's open ground the first time it is wanted, the floor laid out by then)
func spawned(_m) -> void:
	pass


func forced(m) -> int:
	own(m)
	if _close_due(m) >= 0:
		return 4
	if int(a1["stareNow"]) != 0:
		a1["stareNow"] = 0
		return 1
	return -1


func tick(m, dt: float, dist: float, hero) -> bool:
	if m.state == "act":
		return false
	own(m)
	_wall_kept(m)
	if mode != "walk":
		# (stood, with nothing to do yet: off again, round the clearing)
		if mode == "stand" and _close_due(m) < 0 and int(a1["stareNow"]) == 0 and m._cd > 0.0 and gt > 0.25:
			mode = "walk"
			gt = float(LAND9[0]) + 0.01
			a1["bound"] = -1
			_bound9(m, hero)
		else:
			return false
	var slow: float = m.slow()
	var before := gt
	var go := dt * slow
	var p0 := before - floorf(before / float(STOT9["period"])) * float(STOT9["period"])
	for L in LAND9:
		if not (p0 < L and p0 + go >= L):
			continue
		# HE LANDS: he may stop here (a close due, a stare, his blow), else his way for the next bound
		a1["bounds"] = int(a1["bounds"]) + 1
		var sees: bool = m.mgr.sees(m.world, hero.world)
		if _close_due(m) >= 0:
			return _stop(m)
		if int(a1["bounds"]) >= int(a1["stareAt"]):
			a1["bounds"] = 0
			a1["stareAt"] = 6 + floori(randf() * 3.0)
			a1["stareNow"] = 1
			return _stop(m)
		if m._cd <= 0.0 and sees and dist <= float(ACTS[0]["far"]) - 0.1:
			return _stop(m)
		if m._cd <= 0.0 and sees and cds.size() > 2 and cds[2] <= 0.0 and dist >= float(ACTS[2]["near"]) and dist <= float(ACTS[2]["far"]):
			return _stop(m)
		_bound9(m, hero)
	for k in cds.size():
		cds[k] -= dt
	slide(m, m.face * float(STOT9["pace"]) * slow * dt)
	gt = before + go
	m.state = "chase"
	return true


## (the port's own: the hero fallen and set back where he came in, what his enemies had sent out is gone (perils.gd clear), his
## wall with it; in the game a fallen hero wakes in town and the floor is made anew. Here the wood opens again, its fence gone
## with its wall, so that the hero can come back to him; and as he meets him again it closes in again, a stage at a time)
func _wall_kept(m) -> void:
	if int(a1.get("stage", 0)) <= 0 or wall_of(m) != null:
		return
	a1["stage"] = 0
	a1["k"] = 1.0
	m.mgr.map.fence = null


func _stop(m) -> bool:
	_to("stand")
	m._set_list("idle")
	return false


func can(m, a: Dictionary, dist: float, _los: bool) -> bool:
	if a["id"] == "stag:charge":
		# (a clear run toward him, of a good way at least)
		var f: Vector2 = (m.mgr.hero.world - m.world) / maxf(0.01, dist)
		var d := 0.4
		while d <= 3.4:
			if not m.mgr.map.fits(m.world.x + f.x * d, m.world.y + f.y * d, 0.42):
				return false
			d += 0.3
		return true
	if a["id"] == "stag:bellow":
		return called(m) < int(BELLOW["most"])
	return true


func start(m, a: Dictionary, hero) -> void:
	own(m)
	match str(a["id"]):
		"stag:charge":
			# (where he set off, and how far he may run: to his crash, or where his antlers meet the wall)
			act["x"] = m.world.x
			act["y"] = m.world.y
			var body := _run_of(m, CHARGE9_CARRIED)
			a1["run"] = CHARGE9_CARRIED if body >= CHARGE9_CARRIED - 0.05 else maxf(0.3, minf(CHARGE9_CARRIED, body + 0.42 - ANTLERS))
			a1["ranDown"] = 0
			peril(m, "stag:lane", m.world, {"t": 0.0, "dur": float(CHARGE9["crash"]) + 0.2, "d": a1["run"]})
		"stag:stare":
			# (his heavy landing: a ring of dust, knocking whoever is in it)
			if hero.world.distance_to(m.world) <= float(STARE["knock"]) and hero._act != "lunge" and hero.alive:
				knock(hero, m.world, 0.8)
			hero.kick(2.0)
			sound(m, "slam", 0.45)
		"stag:gore":
			peril(m, "stag:gore", m.world, {"dur": float(GORE9["hit"]) + 1.2})
		"stag:close":
			peril(m, "stag:edge", Vector2(a1["cx"], a1["cy"]), {"dur": float(CLOSE["hit"]) + 0.1})


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var h: Vector2 = hero.world
	var free := open_to(hero)
	match str(a["id"]):
		"stag:gore":
			if crossed(t0, t1, GORE9["paw"][2]):
				sound(m, "slam", 0.3)
			if crossed(t0, t1, GORE9["held"]):
				sound(m, "swing", 0.5)
			if not crossed(t0, t1, a["hit"]):
				return
			# (the sweep before him, GORE9.arc across, from near to its reach)
			var r := rel(m, hero)
			var d := r.length()
			var half := deg_to_rad(float(GORE9["arc"]) / 2.0)
			if free and d >= float(GORE9["near"]) - HERO_R and d <= float(GORE9["reach"]) + HERO_R * 0.5 and absf(atan2(r.y, r.x)) <= half:
				blow(m, hero, a["dmg"])
				knock(hero, m.world, GORE9["knock"])
			hero.kick(3.0)
			sound(m, "slam", 0.6)
		"stag:stare":
			# (run on over his planted hoofs as he stops)
			var c := _stare_carry(t1) - _stare_carry(t0)
			if c > 0.0:
				slide(m, m.face * c)
			if crossed(t0, t1, STARE["snort"]):
				sound(m, "gust", 0.3)
		"stag:charge":
			for T in CHARGE9["paws"]:
				if crossed(t0, t1, T):
					sound(m, "slam", 0.15)
			if crossed(t0, t1, CHARGE9["hit"]):
				m.mgr.sfx.play("boss_roar", linear_to_db(0.6))
			var run: float = a1.get("run", CHARGE9_CARRIED)
			var from := Vector2(act["x"], act["y"])
			if t1 > float(CHARGE9["strike"][0]) and t0 < float(CHARGE9["crash"]):
				var c0 := minf(carry(t0), run)
				var c1 := minf(carry(t1), run)
				m.world = from + m.face * c1
				# (run down as he comes by: once, thrown aside)
				if int(a1.get("ranDown", 0)) == 0 and free and c1 > c0:
					var along: float = (h - from).dot(m.face)
					var aside: float = -(h.x - from.x) * m.face.y + (h.y - from.y) * m.face.x
					if absf(aside) <= float(CHARGE9["half"]) + HERO_R * 0.5 and along >= c0 - 0.4 and along <= c1 + ANTLERS:
						a1["ranDown"] = 1
						blow(m, hero, a["dmg"])
						var s := 1.0 if aside >= 0.0 else -1.0
						knock(hero, Vector2(from.x + m.face.x * along + m.face.y * s * 0.05, from.y + m.face.y * along - m.face.x * s * 0.05), CHARGE9["knock"])
				if floori(t1 * 3.3) != floori(t0 * 3.3):
					hero.kick(1.0)
				# (cut short where his antlers meet the wall: the crash plays here)
				if run < CHARGE9_CARRIED - 0.05 and c1 >= run - 1e-6 and t1 < float(CHARGE9["crash"]) - 0.02:
					act["t"] = float(CHARGE9["crash"]) - 0.01
			if not crossed(t0, t1, CHARGE9["crash"]):
				return
			# THE CRASH: whoever is before his antlers; the wall there splinters; a pine there splinters
			var r := rel(m, hero)
			if int(a1.get("ranDown", 0)) == 0 and free and r.x > -0.2 and r.x <= ANTLERS + 0.6 and absf(r.y) <= float(CHARGE9["half"]):
				a1["ranDown"] = 1
				blow(m, hero, a["dmg"])
				knock(hero, m.world, CHARGE9["knock"])
			var wall = wall_of(m)
			var ant: Vector2 = m.world + m.face * ANTLERS
			if wall != null and not inside_clearing(ant.x, ant.y, a1["cx"], a1["cy"], a1["k"], 0.0, 0.3):
				wall["fx"] = atan2((ant.y - float(a1["cy"])) / float(CLEARING["ry"]), (ant.x - float(a1["cx"])) / float(CLEARING["rx"]))
				wall["fy"] = wall["t"]
			for p in m.mgr.map.props:
				if p.get("kind", "") != "piece" or not PINES.has(p.get("name", "")):
					continue
				var q := from_figure(m.world, m.face, act["hand"], Vector2(p["x"], p["y"]))
				if q.x < 0.2 or q.x > SPLINTER or absf(q.y) > 1.1:
					continue
				p["name"] = "stump"
			hero.kick(6.0)
			sound(m, "slam", 1.0)
			sound(m, "hit", 0.8)
		"stag:close":
			if crossed(t0, t1, CLOSE["roar"]):
				m.mgr.sfx.play("boss_roar")
				hero.kick(2.0)
			if not crossed(t0, t1, a["hit"]):
				return
			# THE WALL BURSTS UP round the new edge, and stays
			var s := _close_due(m)
			if s < 0:
				return
			a1["stage"] = s + 1
			var k: float = CLOSE["stages"][s + 1]
			var was: float = a1["k"]
			a1["k"] = k
			var cx: float = a1["cx"]
			var cy: float = a1["cy"]
			var from := atan2(h.y - cy, h.x - cx)
			var wall = wall_of(m)
			if wall == null:
				wall = peril(m, "stag:wall", Vector2(cx, cy), {"dur": 1e9, "hit": 1e9, "a": m.id, "fx": 0.0, "fy": -1.0})
			wall["d"] = atan2(sin(from) / float(CLEARING["ry"]), cos(from) / float(CLEARING["rx"]))
			wall["b"] = was
			wall["c"] = k
			wall["hit"] = wall["t"]
			wall["fy"] = -1.0
			m.mgr.map.fence = fence_of(cx, cy, k)
			# (whoever it catches, in its band or outside it: struck, and thrown in)
			var inh = thrown_in(h.x - cx, h.y - cy, k)
			if inh != null and out_of(h.x - cx, h.y - cy, 1.0) < 1.25:
				if hero.alive:
					blow(m, hero, a["dmg"])
				hero.world = put_in(m.mgr.map, hero.world, Vector2(cx, cy) + inh, HERO_R)
			for o in m.mgr.list:
				if not is_instance_valid(o) or o.dead or o == m or out_of(o.world.x - cx, o.world.y - cy, 1.0) >= 1.25:
					continue
				var to = thrown_in(o.world.x - cx, o.world.y - cy, k)
				if to != null:
					o.world = put_in(m.mgr.map, o.world, Vector2(cx, cy) + to, minf(o.r, 0.42))
			# (and he himself, should he stand in it)
			var tm = thrown_in(m.world.x - cx, m.world.y - cy, k)
			if tm != null:
				m.world = put_in(m.mgr.map, m.world, Vector2(cx, cy) + tm, minf(m.r, 0.42))
			hero.kick(7.0)
			sound(m, "slam", 1.0)
			sound(m, "explode", 0.6)
		"stag:bellow":
			if crossed(t0, t1, BELLOW["roar"]):
				m.mgr.sfx.play("boss_roar")
				hero.kick(3.0)
			if crossed(t0, t1, BELLOW["call"]):
				var n := _call_wolves(m, hero)
				if m.mgr.loot != null:
					m.mgr.loot.say("%s bellows: wolves answer from the fog" % m.title if n > 0 else "%s bellows" % m.title, FOE)


func end(m, a: Dictionary, _hero) -> void:
	# (off again from where the act left him)
	if a["id"] in ["stag:stare", "stag:gore", "stag:charge", "stag:close"]:
		own(m)["bound"] = -1


## The wood lets go: the wall sinks away, the fence is gone.
func died(m) -> void:
	m.mgr.map.fence = null
	var wall = wall_of(m)
	if wall != null:
		var t: float = wall["t"]
		wall["b"] = wall["c"] if float(wall["c"]) != 0.0 else 1.0
		wall["c"] = 1.0
		wall["hit"] = t - (float(WALL["rise"]) + float(WALL["ripple"]) + WALL_SINK_AFTER)
		wall["dur"] = t + float(WALL["rise"]) + float(WALL["ripple"]) + WALL_SINK_AFTER + float(WALL["sink"]) + 0.2


## Struck as he bounds, he bounds on: his flinch is a standing one (render/act1_fx/stag.ts sprite).
func shown(m) -> Dictionary:
	if m.dead or m.state == "act" or mode != "walk" or not m.art.has("reel") or m.struck_t >= m.art.length("reel"):
		return {}
	var n: int = m.art.count(0, "walk")
	return {"list": "walk", "i": floori(maxf(0.0, gt) * m.art.fps("walk") + 1e-6) % maxi(1, n)} if n > 0 else {}


# --- his sums ---

## charge9Carry: how far the game has carried him down his lane, `t` seconds into the charge (tiles).
static func carry(t: float) -> float:
	var s0: float = CHARGE9["strike"][0]
	var s1: float = CHARGE9["strike"][1]
	var l0: float = CHARGE9["launch"][0]
	var l1: float = CHARGE9["launch"][1]
	var fr := 1.0 / 30.0
	if t <= s0:
		return 0.0
	if t < s0 + fr:
		return l0 * ((t - s0) / fr)
	if t < s1:
		return l0 + (l1 - l0) * ((t - s0 - fr) / fr)
	return l1 + float(CHARGE9["pace"]) * minf(float(CHARGE9["run"]), t - s1)


## stareCarry: how far he has run on over his planted hoofs `t` seconds into his stare (tiles).
static func _stare_carry(t: float) -> float:
	var k := clampf(t / float(STOT9["down"]), 0.0, 1.0)
	return S_LAND * (1.0 - (1.0 - k) * (1.0 - k)) / T3


## outOf: how far out a floor point (tiles from the clearing's middle) is, as a share of its edge at `k` (1: on the edge).
static func out_of(x: float, y: float, k: float) -> float:
	return Vector2(x / (float(CLEARING["rx"]) * k), y / (float(CLEARING["ry"]) * k)).length()


## clearingEdge: the point of the clearing's edge at angle `a` round its middle, at `k` of it across.
static func edge(a: float, k: float) -> Vector2:
	return Vector2(cos(a) * float(CLEARING["rx"]) * k, sin(a) * float(CLEARING["ry"]) * k)


## insideClearing: whether a body of radius `r` at (x, y) is inside the clearing at `k` (its middle at cx, cy), clear of its
## wall and `more` besides.
static func inside_clearing(x: float, y: float, cx: float, cy: float, k: float, r: float, more := 0.0) -> bool:
	var dx := x - cx
	var dy := y - cy
	var d := out_of(dx, dy, k)
	var rr := Vector2(dx, dy).length()
	return rr < 1e-6 or (d < 1.0 and rr * (1.0 / d - 1.0) >= float(WALL["band"]) + r + more)


## thrownIn: whoever the wall catches as it rises (in its band, or outside the new edge) is thrown in, to CLOSE.throwIn tiles
## inside the new edge along the way to the middle: where (from the middle); null if he is clear.
static func thrown_in(x: float, y: float, k: float):
	if inside_clearing(x, y, 0.0, 0.0, k, 0.0):
		return null
	var a := atan2(y / float(CLEARING["ry"]), x / float(CLEARING["rx"]))
	var e := edge(a, k)
	var r := e.length()
	return e * (maxf(0.0, r - float(CLOSE["throwIn"]) - float(WALL["band"])) / r)


## fenceOf: the fence the clearing makes at `k`: inside it, or well out in the wood beyond the arena (nothing there is of his fight).
static func fence_of(cx: float, cy: float, k: float) -> Callable:
	return func(x: float, y: float, r: float) -> bool:
		return out_of(x - cx, y - cy, 1.0) >= 1.25 or inside_clearing(x, y, cx, cy, k, r)


## putIn: a body thrown in by the wall, put where it may stand: at `to`, or the nearest open place about it.
static func put_in(map, was: Vector2, to: Vector2, r: float) -> Vector2:
	for ring in 7:
		var n := maxi(1, ring * 8)
		for i in n:
			var a := float(i) / n * TAU
			var p := to + Vector2(cos(a), sin(a)) * ring * 0.35
			if map.fits(p.x, p.y, r):
				return p
	return was


## His wall, if it has risen.
static func wall_of(m):
	for p in m.mgr.perils.list:
		if p["kind"] == "a1" and p["a1"] == "stag:wall" and p.get("src") == m:
			return p
	return null


## closeDue: the close due now (its index in CLOSE.at), or -1.
func _close_due(m) -> int:
	var s := int(a1.get("stage", 0))
	return s if s < CLOSE["at"].size() and m.life <= m.max_life * float(CLOSE["at"][s]) else -1


## landable: whether a body may land at (x, y): open floor, inside the clearing as it is now with EDGE9 to spare.
func _landable(m, x: float, y: float) -> bool:
	# (inside the arena's own edge too, while the wood stands where it always stood: k 1)
	if not inside_clearing(x, y, a1["cx"], a1["cy"], a1["k"], 0.42, EDGE9 - float(WALL["band"])):
		return false
	return m.mgr.map.fits(x, y, 0.5) and m.mgr.map.fits((x + m.world.x) / 2.0, (y + m.world.y) / 2.0, 0.42)


## bound9: as he lands, his way for the next bound (the pictures' model, dev/stag_action_scene.ts boundRun).
func _bound9(m, hero) -> void:
	var h: Vector2 = hero.world
	var px: float = m.world.x - float(a1["cx"])
	var py: float = m.world.y - float(a1["cy"])
	var k: float = a1["k"]
	var head := atan2(m.face.y, m.face.x)
	if int(a1["spin"]) == 0:
		a1["spin"] = 1 if sin(head - atan2(py, px)) >= 0.0 else -1
	var spin := float(a1["spin"])
	var rx: float = CLEARING["rx"]
	var ry: float = CLEARING["ry"]
	var ang := atan2(py / ry, px / rx)
	var tang := atan2(ry * cos(ang) * spin, -rx * sin(ang) * spin)
	if int(a1["bounds"]) % 2 == 0:
		a1["way"] = 0.45 + 0.35 * randf()
	var in_out := (out_of(px, py, k) - float(a1["way"])) * 1.6
	var goal := tang + spin * in_out
	# (his blow ready: at the hero)
	var ready: bool = m._cd <= 0.4 and m.mgr.sees(m.world, h)
	if ready:
		goal = atan2(h.y - m.world.y, h.x - m.world.x)
	var cut := spin * (1.1 + 0.6 * randf()) if not ready and randf() > 0.82 else 0.0
	a1["side"] = -(int(a1["side"]) if int(a1["side"]) != 0 else 1)
	var jink := float(a1["side"]) * ((0.1 + 0.15 * randf()) if ready else (0.18 + 0.3 * randf()))
	var d := goal + cut + jink - head
	d = atan2(sin(d), cos(d))
	var next := head + clampf(d, -2.2, 2.2)
	for t in [0.0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2, 1.6, -1.6, 2.0, -2.0, 2.6, -2.6, PI]:
		if _landable(m, m.world.x + cos(next + t) * BOUND9, m.world.y + sin(next + t) * BOUND9):
			next += t
			break
	m.face = Vector2(cos(next), sin(next))


## runOf: how far he can run from where he is along the way he faces, his body clear, to `most`.
func _run_of(m, most: float) -> float:
	var d := 0.0
	while d < most and m.mgr.map.fits(m.world.x + m.face.x * (d + 0.1), m.world.y + m.face.y * (d + 0.1), 0.42):
		d += 0.1
	return minf(d, most)


## called9: those of his calling still up.
static func called(m) -> int:
	var n := 0
	for o in m.mgr.list:
		if is_instance_valid(o) and not o.dead and o != m and o.pack_id == m.pack_id and o.has_meta("stag_called"):
			n += 1
	return n


## callWolves9: THE WOLVES ANSWER FROM THE FOG, inside the clearing as it is now: so many fog wolves (the game's spawn: the
## floor's own kind, its life and its blows grown with the floor, worth nothing), each awake and turned to the hero.
func _call_wolves(m, hero) -> int:
	var mgr = m.mgr
	var h: Vector2 = hero.world
	var want := maxi(0, mini(int(BELLOW["more"]) if m.life < m.max_life / 2.0 else int(BELLOW["n"]), int(BELLOW["most"]) - called(m)))
	var kind := "wolf" if mgr._defs.has("wolf") else "dagger"
	if not mgr._defs.has(kind):
		return 0
	var spots: Array = []
	var tries := 0
	while tries < 200 and spots.size() < want:
		tries += 1
		var a := randf_range(0.0, TAU)
		var d := randf_range(minf(float(BELLOW["near"]), 3.0), BELLOW["far"])
		var p := h + Vector2(cos(a), sin(a)) * d
		if not inside_clearing(p.x, p.y, a1["cx"], a1["cy"], a1["k"], 0.36, 0.3) or not mgr.map.fits(p.x, p.y, 0.36):
			continue
		var apart := true
		for q in spots:
			if q.distance_to(p) < 1.5:
				apart = false
		if apart:
			spots.append(p)
	var def: Dictionary = mgr._defs[kind]
	var deep := float(mgr.map.depth) - 1.0
	var life := roundf(float(def["life"]) * (1.0 + float(DEPTH_SCALE["life"]) * deep))
	var dm := 1.0 + float(DEPTH_SCALE["dmg"]) * deep
	if not mgr._figures.has(kind):
		mgr._figures[kind] = m.art.get_script().new(mgr._figures_dir, kind, mgr._info)
	for s in spots:
		var to: Vector2 = h - s
		var f := to.normalized() if to.length() > 0.0 else Vector2(0.7071, 0.7071)
		var w = m.get_script().new()
		w.mgr = mgr
		w.setup({"kind": kind, "name": str(def.get("name", kind)), "x": s.x, "y": s.y, "fx": f.x, "fy": f.y, "r": float(def["radius"]), "life": life,
			"maxLife": life, "dmgMin": float(def["dmgMin"]) * dm, "dmgMax": float(def["dmgMax"]) * dm, "speed": float(def["speed"]),
			"packId": m.pack_id, "boss": false, "champion": false, "xp": 0}, def, mgr._figures[kind])
		w.set_meta("stag_called", 1)
		w.state = "chase"
		w._cd = randf_range(0.4, 0.9)
		mgr.stands.add_child(w)
		mgr.list.append(w)
	return spots.size()
