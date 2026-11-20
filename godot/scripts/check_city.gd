## THE CHECK OF THE CITY'S FLOORS' MONSTERS (--only=city --floor=N; main.gd sends it here): the floor laid out with its kinds each by
## its own rules (game/act1_rules/<kind>.ts; scripts/act2/); then each common kind on it fought alone, the hero set where its moves
## reach him, each move made and what it does seen (its blow landing, what it lays on the floor and throws), pictured as it goes;
## then the floor's boss, met, each of his moves made in turn and what it does seen, pictured; then struck dead. A line a step (OK or
## WRONG); then the sum, CITY.
extends RefCounted

var M
var h
var n := 0
var bad: Array = []
var dir := ""
var tag := ""
var P
var shot := 0


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("CITY %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/%s%02d_%s.png" % [dir, tag, shot, name])


## A mark of the kind's on the floor now, named so (and, where asked, as `cond` has it).
func _a1(name: String, cond := Callable()) -> Dictionary:
	for p in P.list:
		if p.get("kind") == "a1" and p.get("a1") == name and (not cond.is_valid() or cond.call(p)):
			return p
	return {}


## Runs the world on for up to `secs`, the hero kept whole (counting each time he is struck), until `until` holds; true if it did.
func _run(secs: float, until := Callable(), keep := Callable()) -> bool:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		if h.life < h.max_life:
			struck += 1
			h.life = h.max_life
		if keep.is_valid():
			keep.call()
		if until.is_valid() and until.call():
			return true
	return not until.is_valid()


var struck := 0


## Only move `i` of its rules ready, now: the others' waits put far off.
static func _ready_only(m, i: int) -> void:
	var A: Array = m.h2.acts()
	if m.h2.cds.size() != A.size():
		m.h2.cds = []
		for a in A:
			m.h2.cds.append(0.0)
	for k in A.size():
		m.h2.cds[k] = 0.0 if k == i else 999.0
	m._cd = 0.0


func run(main, hero, out: String) -> void:
	M = main
	h = hero
	dir = out
	var depth := int(M._arg("floor")) if M._arg("floor") != "" else 11
	tag = "c%d_" % depth
	M.loot.level = 30
	M.loot.derive()
	h.walked = 50.0
	# (he is struck as the game strikes him: each blow counted, then he is made whole again)
	h.unhurt = false
	await M.go_to("floor%d" % depth, "down")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	P = M._monsters.perils
	var kinds := {}
	var own := {}
	for m in M._monsters.list:
		if is_instance_valid(m):
			kinds[m.kind] = kinds.get(m.kind, 0) + 1
			if m.h2 != null:
				own[m.kind] = true
	var want: Array = KINDS.get(depth, [])
	var all := true
	for k in want:
		all = all and own.has(k)
	_line(all and not want.is_empty(), "floor %d laid out: %s, each by its own rules (%s)" % [depth, kinds, ", ".join(own.keys())])
	await _snap("the_floor")
	# (one plain one of each common kind kept, the nearest; held where it stands till its turn; the rest of the floor, but the boss, put away)
	for k in COMMON.get(depth, []):
		# (a plain one, wordless, where the floor has one; else the plainest: a pack's minion)
		var m = null
		for o in M._monsters.list:
			if is_instance_valid(o) and not o.dead and o.kind == k and not o.boss and not o.elite and not o.champion and o.words.is_empty() and (m == null or o.world.distance_to(h.world) < m.world.distance_to(h.world)):
				m = o
		if m == null:
			for o in M._monsters.list:
				if is_instance_valid(o) and not o.dead and o.kind == k and not o.boss and not o.elite and not o.champion and (m == null or o.world.distance_to(h.world) < m.world.distance_to(h.world)):
					m = o
		if m != null:
			chosen[k] = m
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.boss and not chosen.values().has(o):
			o.queue_free()
	for m in chosen.values():
		m.rise(1e9)
	await M._wait(0.1)
	for k in COMMON.get(depth, []):
		await _common(k)
	if depth == 11:
		await _crier()
	print("CITY: floor %d, %d steps, %d as the game's%s" % [depth, n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + str(bad)])


## The kinds of each floor with rules of their own; its common ones fought alone (the boss apart).
const KINDS := {11: ["hushed", "hound", "scribe", "watch", "crier"]}
const COMMON := {11: ["hushed", "hound", "scribe", "watch"]}


var chosen := {}


## One of a kind, alone: its kept one let go into the fight, the others still held; the floor's marks cleared.
func _alone(kind: String):
	var m = chosen.get(kind)
	if m == null or not is_instance_valid(m):
		return null
	P.list.clear()
	m._t = 0.0
	await M._wait(0.1)
	return m


func _common(kind: String) -> void:
	var m = await _alone(kind)
	if m == null:
		_line(false, "no plain %s on the floor" % kind)
		return
	struck = 0
	match kind:
		"hushed":
			h.world = M._spot_near(m.world, 0.9, h.world)
			_ready_only(m, 0)
			var went: bool = await _run(6.0, func(): return m.h2.act != null and float(m.h2.act["t"]) >= 0.5)
			await _snap("hushed_lunges")
			await _run(1.2)
			_line(went and struck > 0, "the Hushed: its lunge and grab (%s), the hero caught (%d)" % [M._monsters.used, struck])
		"hound":
			h.world = M._spot_near(m.world, 1.0, h.world)
			_ready_only(m, 0)
			var went: bool = await _run(6.0, func(): return m.h2.act != null and float(m.h2.act["t"]) >= 0.45)
			await _snap("hound_pounces")
			await _run(1.0)
			_line(went and struck > 0, "the watch hound: its pounce (%s), the hero struck (%d)" % [M._monsters.used, struck])
		"scribe":
			h.world = M._spot_near(m.world, 4.0, h.world)
			_ready_only(m, 0)
			var marked: bool = await _run(6.0, func(): return not _a1("scribe:mark").is_empty() and float(_a1("scribe:mark")["t"]) >= 0.5)
			await _snap("scribe_marks_the_spot")
			var flies: bool = await _run(3.0, func(): return not _a1("scribe:ink", func(p): return float(p["t"]) >= 0.12 and float(p["t"]) < float(p["hit"])).is_empty())
			await _snap("scribe_ink_flies")
			var pool: bool = await _run(2.0, func(): return not _a1("scribe:ink", func(p): return float(p["t"]) - float(p["hit"]) >= 0.25).is_empty())
			await _snap("scribe_ink_pool")
			var ink: Dictionary = _a1("scribe:ink")
			var slowed := false
			if not ink.is_empty():
				h.world = Vector2(ink["x"], ink["y"])
				await _run(0.3)
				slowed = h.chill_t > 0.0 and h.chill_k > 0.0
			_line(marked and flies and pool and struck > 0 and slowed, "the scribe: the spot marked, the ink flicked and flying, its pool lying; the hero struck (%d), slowed in it (%.2f)" % [struck, h.chill_k])
		"watch":
			# (the chop: its reach ringed, the bite, the split)
			h.world = M._spot_near(m.world, 1.8, h.world)
			_ready_only(m, 0)
			var ringed: bool = await _run(6.0, func(): return m.h2.act != null and m.h2.act["i"] == 0 and float(m.h2.act["t"]) >= 0.6)
			var warned := false
			for p in P.list:
				if p.get("kind") == "warn":
					warned = true
			await _snap("watch_chop_held")
			var at0: Vector2 = h.world
			var bit: bool = await _run(2.0, func(): return not _a1("watch:bite", func(p): return float(p["t"]) >= 0.08).is_empty())
			await _snap("watch_chop_bites")
			var knocked: bool = h.world.distance_to(at0) > 0.1
			await _run(0.5)
			await _snap("watch_chop_split")
			_line(ringed and warned and bit and struck > 0 and knocked, "the Watchman's chop: held, its reach ringed (%s); the bite and the split; the hero struck (%d) and knocked back %.2f" % [warned, struck, h.world.distance_to(at0)])
			await _run(1.5)
			# (the lantern: lobbed where he stands, smashing, its oil burning)
			struck = 0
			h.world = M._spot_near(m.world, 5.0, h.world)
			_ready_only(m, 1)
			var lobbed: bool = await _run(6.0, func(): return not _a1("watch:lantern", func(p): return float(p["t"]) >= 0.25).is_empty())
			await _snap("watch_lantern_flies")
			var smashed: bool = await _run(2.0, func(): return not _a1("watch:lantern", func(p): return float(p["t"]) - float(p["hit"]) >= 0.1).is_empty())
			await _snap("watch_lantern_smashes")
			var hit_by_smash := struck
			await _run(1.5)
			await _snap("watch_oil_burns")
			var burned_before := struck
			await _run(1.6)
			_line(lobbed and smashed and hit_by_smash > 0 and struck > burned_before, "the Watchman's lantern: lobbed, smashing on him (%d), its oil burning him as he stands in it (%d more)" % [hit_by_smash, struck - burned_before])


# --- THE CRIER (floor 11's boss) ---

func _crier() -> void:
	var boss = null
	for o in M._monsters.list:
		if is_instance_valid(o) and o.boss:
			boss = o
	if boss == null:
		_line(false, "floor 11 has no boss")
		return
	for o in M._monsters.list:
		if is_instance_valid(o) and o != boss:
			o.queue_free()
	await M._wait(0.1)
	P.list.clear()
	struck = 0
	# (met: the hero come into his square)
	h.world = M._spot_near(boss.world, 5.0, h.world)
	var met: bool = await _run(4.0, func(): return boss._said != "")
	await _snap("crier_met")
	_line(met and boss._said == "..." and boss.state != "sleep", "the Crier met in his square: his line '%s' (no voice: the Hush took it first), %s, %.0f life" % [boss._said, boss.title, boss.max_life])
	await _run(3.0)
	var keep := func():
		if h.world.distance_to(boss.world) > 10.0:
			h.world = M._spot_near(boss.world, 5.0, h.world)
	# THE TOLL
	struck = 0
	h.world = M._spot_near(boss.world, 4.0, h.world)
	_ready_only(boss, 0)
	var tolled: bool = await _run(6.0, func(): return not _a1("crier:toll", func(p): return float(p["t"]) >= 0.3).is_empty(), keep)
	await _snap("crier_toll_marked")
	await _run(0.4, Callable(), keep)
	await _snap("crier_toll_bursts")
	await _run(3.0, func(): return boss.h2.act == null, keep)
	var used_toll: int = M._monsters.used.get("crier_toll", 0)
	_line(tolled and struck >= 3, "the toll follows you: five tolls rung, each marking where he stood, bursting on him standing still (%d struck)" % struck)
	await _run(1.0, Callable(), keep)
	# THE SHOUT OFF THE WALLS
	struck = 0
	h.world = M._spot_near(boss.world, 5.0, h.world)
	_ready_only(boss, 1)
	var walls: bool = await _run(6.0, func(): return not _a1("crier:shout9", func(p): return float(p["t"]) >= 1.2).is_empty(), keep)
	await _snap("crier_shout_warning")
	var sh: Dictionary = _a1("crier:shout9")
	var w := [float(sh.get("a", 0.0)), float(sh.get("b", 0.0)), float(sh.get("c", 0.0)), float(sh.get("d", 0.0))]
	# (he is put before him, in the wave's way)
	if not sh.is_empty():
		var f := Vector2(sh["fx"], sh["fy"])
		h.world = M._spot_near(boss.world + f * minf(4.0, w[0] - 0.5), 0.0, h.world)
	var hushed: bool = await _run(2.5, func(): return h.hush_t > 0.0)
	await _run(0.15)
	await _snap("crier_shout_fronts")
	var dark: bool = h.loadout.hushed
	await _run(1.0)
	await _snap("crier_shout_dark")
	_line(walls and w[0] > 0.0 and hushed and dark and struck > 0, "the shout off the walls: his square's walls found (ahead %.1f, behind %.1f, left %.1f, right %.1f); a front over him, struck (%d), HUSHED (%.1f s, his moves wordless: %s)" % [w[0], w[1], w[2], w[3], struck, h.hush_t, dark])
	await _run(4.5, func(): return h.hush_t <= 0.0)
	_line(h.hush_t <= 0.0 and not h.loadout.hushed, "the Hush runs out: his words his again")
	# THE PROCLAMATION
	struck = 0
	h.world = M._spot_near(boss.world, 6.0, h.world)
	_ready_only(boss, 2)
	var marked: bool = await _run(8.0, func(): return not _a1("crier:decree", func(p): return float(p["t"]) >= 1.0).is_empty(), keep)
	await _snap("crier_decree_marked")
	var dc: Dictionary = _a1("crier:decree")
	# (he stands in its lane, on it)
	if not dc.is_empty():
		h.world = M._spot_near(Vector2(dc["x"], dc["y"]) + Vector2(dc["fx"], dc["fy"]) * minf(4.0, float(dc["d"]) - 0.5), 0.0, h.world)
	var rolled: bool = await _run(2.0, func(): return not _a1("crier:decree", func(p): return float(p["t"]) - float(p["hit"]) >= 0.2).is_empty())
	await _snap("crier_decree_unrolls")
	var by_roll := struck
	await _run(1.2)
	await _snap("crier_decree_burns")
	_line(marked and rolled and by_roll > 0 and struck > by_roll, "the Proclamation: its lane marked (%.1f tiles), the decree flung down it, its roll striking him (%d), then its burning letters (%d more)" % [float(dc.get("d", 0.0)), by_roll, struck - by_roll])
	await _run(3.0, Callable(), keep)
	# THE CROWD
	h.world = M._spot_near(boss.world, 3.5, boss.world)
	_ready_only(boss, 3)
	var called0 := _called()
	var pools: bool = await _run(8.0, func(): return not _a1("crier:call9", func(p): return float(p["t"]) >= 1.1).is_empty(), keep)
	await _snap("crier_crowd_pools")
	var cl: Dictionary = _a1("crier:call9")
	var np: int = (cl.get("pools", []) as Array).size()
	var came: bool = await _run(3.0, func(): return _called() >= called0 + 3, keep)
	await _snap("crier_crowd_comes")
	_line(pools and np >= 2 and came, "the Crowd: %d pools at the edges of his square; the Hushed out of them (%d called)" % [np, _called()])
	# HIS DEATH: what of his would harm goes with him
	_ready_only(boss, 0)
	await _run(1.4, func(): return not _a1("crier:toll").is_empty(), keep)
	boss.hurt(1e9)
	await _run(0.2)
	var left := 0
	for p in P.list:
		if p.get("kind") == "a1" and str(p.get("a1", "")).begins_with("crier:") and float(p["t"]) < float(p["dur"]):
			left += 1
	await M._wait(1.0)
	await _snap("crier_falls")
	_line(boss.dead and left == 0, "the Crier struck dead: the Hush pours out of him; what of his would harm gone with him (%d left)" % left)


func _called() -> int:
	var k := 0
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and o.has_meta("crier_called"):
			k += 1
	return k
