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
	# (standing, not walking on to the end of a step it had begun)
	if m.h2.act == null:
		m.h2._to("stand")


func run(main, hero, out: String) -> void:
	M = main
	h = hero
	dir = out
	var depth := int(M._arg("floor")) if M._arg("floor") != "" else 11
	tag = "c%d_" % depth
	M.loot.level = 30
	M.loot.ring_lit = true
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
	elif depth == 12:
		await _ratking()
	elif depth == 13:
		await _pair()
	print("CITY: floor %d, %d steps, %d as the game's%s" % [depth, n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + str(bad)])


## The kinds of each floor with rules of their own; its common ones fought alone (the boss apart).
const KINDS := {11: ["hushed", "hound", "scribe", "watch", "crier"], 12: ["rat", "dredger", "scribe", "hushed", "ratking"],
	13: ["fieldhand", "carter", "hushed", "scraper", "quill"]}
const COMMON := {11: ["hushed", "hound", "scribe", "watch"], 12: ["rat", "dredger"], 13: ["fieldhand", "carter"]}


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
		"rat":
			h.world = M._spot_near(m.world, 1.0, h.world)
			_ready_only(m, 0)
			var went: bool = await _run(6.0, func(): return m.h2.act != null and float(m.h2.act["t"]) >= 0.42)
			await _snap("rat_leaps")
			await _run(1.0)
			_line(went and struck > 0, "the plague rat: its leap and bite (%s), the hero bitten (%d)" % [M._monsters.used, struck])
		"dredger":
			# (the hook: caught out where the hook bites, and hauled in)
			h.world = M._spot_near(m.world + m.face * 2.0, 0.0, h.world)
			m.face = (h.world - m.world).normalized()
			_ready_only(m, 0)
			var d0: float = h.world.distance_to(m.world)
			var hooked: bool = await _run(6.0, func(): return int(m.h2.a1.get("hooked", 0)) == 1)
			var held: bool = h.held > 0.0
			await _run(0.3)
			await _snap("dredger_hauls")
			await _run(1.2)
			var d1: float = h.world.distance_to(m.world)
			_line(hooked and held and struck > 0 and d1 < d0 - 0.3, "the dredger's hook and haul: the hero struck (%d), HOOKED, held, hauled in from %.2f to %.2f tiles" % [struck, d0, d1])
			await _run(1.0)
			# (the cast net, at him out past the hook)
			struck = 0
			var way: Vector2 = (h.world - m.world).normalized()
			# (kept 3 tiles off before it, where its net reaches, till it casts)
			var stay := func():
				if m.h2.act == null:
					h.world = M._spot_near(m.world + way * 3.0, 0.0, h.world)
			_ready_only(m, 1)
			var aimed: bool = await _run(6.0, func(): return not _a1("dredger:aim", func(p): return float(p["t"]) >= 0.9).is_empty(), stay)
			await _snap("dredger_net_marked")
			var flies: bool = await _run(2.0, func(): return not _a1("dredger:net", func(p): return float(p["t"]) >= 0.25).is_empty())
			await _snap("dredger_net_flies")
			var netted: bool = await _run(1.0, func(): return h.held > 0.5)
			await _run(0.2)
			await _snap("dredger_net_lies")
			_line(aimed and flies and netted and struck > 0, "the dredger's cast net: where it falls marked, flying, falling on him: struck (%d) and NETTED (held %.1f s)" % [struck, h.held])
		"fieldhand":
			# (thrown along the floor's way nearest him: he stands 3.5 tiles off along it, in the sickle's way out)
			var ax: Vector2 = m.h2.axis_of(h.world - m.world)
			h.world = M._spot_near(m.world + ax * 3.6, 0.0, h.world)
			m.face = ax
			_ready_only(m, 0)
			# (once it has begun, he stands where the sickle passes on its way out, a third of its flight along)
			var on_way := func():
				if m.h2.act != null and float(m.h2.act["t"]) < 0.7:
					var q = m.h2.boom_at(m.h2.BOOM_HIT + 0.3 * float(m.h2.BOOM["fly"]))
					h.world = m.h2.beside(m.world, m.face, m.h2.act["hand"], q.x, q.y)
			var marked: bool = await _run(6.0, func(): return not _a1("fieldhand:boom", func(p): return float(p["t"]) >= 0.5).is_empty(), on_way)
			await _snap("fieldhand_curve_marked")
			var flies: bool = await _run(2.0, func(): return m.h2.act != null and float(m.h2.act["t"]) >= 1.1)
			await _snap("fieldhand_sickle_flies")
			await _run(2.0, func(): return m.h2.act == null)
			var b := int(m.h2.act.get("b", 0)) if m.h2.act != null else 0
			_line(marked and flies and struck > 0, "the fieldhand's sickle boomerang: its curve marked, flung, spinning out and back: the hero struck %d (out and back)" % struck)
		"carter":
			# (the lash: caught out at its end, coiled round and dragged in)
			h.world = M._spot_near(m.world + m.face * 2.2, 0.0, h.world)
			m.face = (h.world - m.world).normalized()
			_ready_only(m, 0)
			var d0: float = h.world.distance_to(m.world)
			var lashed: bool = await _run(6.0, func(): return int(m.h2.a1.get("grab", 0)) == 1)
			var held: bool = h.held > 0.0
			await _run(0.4)
			await _snap("carter_lash_drags")
			await _run(1.0)
			_line(lashed and held and struck > 0 and h.world.distance_to(m.world) < d0 - 0.3, "the carter's lash: struck (%d), LASHED, held, dragged in from %.2f to %.2f tiles" % [struck, d0, h.world.distance_to(m.world)])
			await _run(1.0)
			# (the driver's lash: he stands where its first crack falls)
			struck = 0
			var way: Vector2 = (h.world - m.world).normalized()
			var stay := func():
				if m.h2.act == null:
					h.world = M._spot_near(m.world + way * 1.3, 0.0, h.world)
			_ready_only(m, 1)
			var rings: bool = await _run(6.0, func(): return not _a1("carter:warn", func(p): return float(p["t"]) >= 0.7).is_empty(), stay)
			await _snap("carter_lashes_marked")
			var cracked: bool = await _run(2.0, func(): return not _a1("carter:crack").is_empty())
			await _run(0.1)
			await _snap("carter_lashes_crack")
			await _run(1.5)
			_line(rings and cracked and struck > 0, "the carter's driver's lash: its three rings marked, the cracks striking the floor; the hero struck (%d)" % struck)
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


# --- THE RAT KING (floor 12's boss) ---

func _ratking() -> void:
	var boss = null
	for o in M._monsters.list:
		if is_instance_valid(o) and o.boss:
			boss = o
	if boss == null:
		_line(false, "floor 12 has no boss")
		return
	for o in M._monsters.list:
		if is_instance_valid(o) and o != boss:
			o.queue_free()
	await M._wait(0.1)
	P.list.clear()
	struck = 0
	h.world = M._spot_near(boss.world, 5.0, h.world)
	var met: bool = await _run(4.0, func(): return boss._said != "")
	await _snap("ratking_met")
	_line(met and boss.state != "sleep", "the Rat King met in his cistern: '%s', %s, %.0f life" % [boss._said, boss.title, boss.max_life])
	await _run(2.0)
	var keep := func():
		if h.world.distance_to(boss.world) > 12.0:
			h.world = M._spot_near(boss.world, 5.0, h.world)
	# THE BITE
	struck = 0
	h.world = M._spot_near(boss.world, 2.0, h.world)
	_ready_only(boss, 0)
	var marked: bool = await _run(6.0, func(): return not _a1("ratking:wedge", func(p): return float(p["t"]) >= 0.6).is_empty(), keep)
	await _snap("ratking_bite_wedge")
	await _run(0.45)
	await _snap("ratking_bite_snaps")
	await _run(1.5, func(): return boss.h2.act == null)
	_line(marked and struck > 0, "the bite: the wedge marked, the front rats snapping shut on him (%d)" % struck)
	# STOLEN WORDS: his own word FROST set, that the King steals it
	struck = 0
	h.loadout.put(0, "front", "frost")
	h.world = M._spot_near(boss.world, 6.0, h.world)
	_ready_only(boss, 1)
	var lined: bool = await _run(6.0, func(): return not _a1("ratking:aim", func(p): return float(p["t"]) >= 1.1).is_empty(), keep)
	await _snap("ratking_word_locked")
	var flies: bool = await _run(1.5, func(): return not _a1("ratking:word", func(p): return float(p["t"]) >= 0.12 and int(p["done"]) == 0).is_empty())
	await _snap("ratking_word_flies")
	var wd: Dictionary = _a1("ratking:word")
	var burst: bool = await _run(2.0, func(): return not _a1("ratking:word", func(p): return int(p["done"]) == 1 and float(p["t"]) - float(p["hit"]) >= 0.1).is_empty())
	await _snap("ratking_word_bursts")
	var stole: String = RK_STOLEN[int(wd.get("b", -1))] if wd.has("b") else "-"
	_line(lined and flies and burst and struck > 0 and stole == "frost", "stolen words: his own FROST stolen (%s), its line following him and locked, spat, bursting on him (%d)" % [stole, struck])
	await _run(1.5, func(): return boss.h2.act == null)
	# THE ROLL
	struck = 0
	var lane := Vector2.ZERO
	for w in [Vector2(1, 0), Vector2(0, 1), Vector2(-1, 0), Vector2(0, -1), Vector2(0.7071, 0.7071), Vector2(-0.7071, 0.7071), Vector2(0.7071, -0.7071), Vector2(-0.7071, -0.7071)]:
		if boss.h2.clear_for(boss, boss.world, w, 0.6, 8.0) >= 7.9:
			lane = w
			break
	if lane != Vector2.ZERO:
		h.world = boss.world + lane * 5.0
	_ready_only(boss, 2)
	var curled: bool = await _run(6.0, func(): return not _a1("ratking:roll9", func(p): return float(p["t"]) >= 1.0).is_empty())
	await _snap("ratking_roll_lane")
	var from: Vector2 = boss.world
	await _run(0.45)
	await _snap("ratking_rolls")
	var opened: bool = await _run(2.0, func(): return not _a1("ratking:roll9", func(p): return float(p["t"]) >= 2.3).is_empty())
	await _snap("ratking_bursts_open")
	var ran: float = boss.world.distance_to(from)
	_line(curled and opened and ran > 3.0 and struck > 0, "the roll: his lane marked, barrelling down it %.1f tiles, bursting open at its end; the hero run down (%d)" % [ran, struck])
	await _run(2.0, func(): return boss.h2.act == null, keep)
	# UNKNOT
	struck = 0
	h.world = M._spot_near(boss.world, 2.0, h.world)
	_ready_only(boss, 3)
	var swelled: bool = await _run(6.0, func(): return boss.h2.act != null and boss.h2.acts()[boss.h2.act["i"]]["id"] == "ratking:unknot" and float(boss.h2.act["t"]) >= 1.1)
	await _snap("ratking_bursts_apart")
	var at0: Vector2 = boss.world
	var gone: bool = await _run(1.5, func(): return boss.h2.swarming())
	var out_of_reach: bool = not boss.h2.reachable(boss)
	await _run(0.3)
	await _snap("ratking_swarm")
	var back: bool = await _run(3.0, func(): return boss.h2.act == null)
	await _snap("ratking_knotted_again")
	_line(swelled and gone and out_of_reach and back and boss.world.distance_to(at0) > 2.0 and struck > 0, "unknot: the rats burst outward (%d struck), gone into the cracks, out of reach; the swarm across him; knotted again %.1f tiles off" % [struck, boss.world.distance_to(at0)])
	# THE SLUICES: his fight's clock run on to their first opening; the hero in a lane, by the gates
	struck = 0
	_ready_only(boss, 0)
	boss.h2.cds[0] = 999.0
	boss.h2.a1["fight"] = 8.9
	var opened2: bool = await _run(1.0, func(): return not _a1("ratking:sluice").is_empty())
	# (he is held where he is while it runs, that the flood alone strikes the hero)
	boss.rise(1e9)
	struck = 0
	var sl: Dictionary = _a1("ratking:sluice")
	if not sl.is_empty():
		var C: Dictionary = boss.h2.cistern_of_peril(sl)
		var L: Array = boss.h2.lanes_for(C["across"])
		# (in the lane furthest from him, by the gates)
		var best := 0
		for i in L.size():
			if boss.h2.from_cistern(C, 0.0, float(L[i]["y"])).distance_to(boss.world) > boss.h2.from_cistern(C, 0.0, float(L[best]["y"])).distance_to(boss.world):
				best = i
		h.world = M._spot_near(boss.h2.from_cistern(C, -float(C["half"]) + 3.0, float(L[best]["y"])), 0.0, h.world)
	await _run(1.0)
	await _snap("ratking_sluices_marked")
	var at1: Vector2 = h.world
	var C1: Dictionary = boss.h2.cistern_of_peril(sl) if not sl.is_empty() else {}
	var flooded: bool = await _run(2.5, func(): return struck > 0)

	await _run(0.25)
	await _snap("ratking_flood")
	await _run(0.5)
	boss._t = 0.0
	_line(opened2 and flooded and h.world.distance_to(at1) > 0.8, "the sluices: the lanes marked, the gates grinding open, the flood down his lane: struck (%d), carried %.1f tiles" % [struck, h.world.distance_to(at1)])
	# HIS DEATH
	await _run(0.3)
	boss.hurt(1e9)
	await _run(1.2)
	await _snap("ratking_falls")
	_line(boss.dead, "the Rat King struck dead")


const RK_STOLEN := ["fire", "frost", "lightning", "poison"]


# --- THE SCRAPER AND THE QUILL (floor 13's double boss) ---

func _pair() -> void:
	var sr = null
	var ql = null
	for o in M._monsters.list:
		if is_instance_valid(o) and o.kind == "scraper":
			sr = o
		elif is_instance_valid(o) and o.kind == "quill":
			ql = o
	if sr == null or ql == null:
		_line(false, "floor 13 has not its pair")
		return
	for o in M._monsters.list:
		if is_instance_valid(o) and o != sr and o != ql:
			o.queue_free()
	await M._wait(0.1)
	P.list.clear()
	struck = 0
	h.world = M._spot_near(sr.world, 5.0, h.world)
	var met: bool = await _run(4.0, func(): return sr._said != "")
	await _snap("pair_met")
	_line(met and sr.state != "sleep" and ql.state != "sleep" and M._hud.card.get("name", "").find(" and ") > 0,
		"the pair met on the Pulping Floor, waking together: '%s'; across the screen '%s'" % [sr._said, M._hud.card.get("name", "")])
	await _run(3.5)
	var keep := func():
		if h.world.distance_to(sr.world) > 10.0:
			h.world = M._spot_near(sr.world, 4.0, h.world)
	# (the Quill held aside while the Scraper makes its own three)
	ql.rise(1e9)
	sr.h2.a1["combo"] = 999.0
	sr.h2.a1["heal"] = 999.0
	struck = 0
	h.world = M._spot_near(sr.world + sr.face * 3.4, 0.0, h.world)
	_ready_only(sr, 0)
	var ringed: bool = await _run(6.0, func(): return not _a1("scraper:aim", func(p): return float(p["t"]) >= 0.3).is_empty(), keep)
	await _snap("scraper_snap_ring")
	await _run(0.4)
	await _snap("scraper_snaps")
	_line(ringed and struck > 0, "the Scraper's claw snap: its ring closing, the claw snapping shut on him (%d)" % struck)
	await _run(1.0, func(): return sr.h2.act == null)
	struck = 0
	h.world = M._spot_near(sr.world + sr.face * 2.5, 0.0, h.world)
	_ready_only(sr, 2)
	var fan: bool = await _run(6.0, func(): return not _a1("scraper:aim", func(p): return float(p["t"]) >= 0.7).is_empty(), keep)
	await _snap("scraper_scour_fan")
	await _run(0.4)
	await _snap("scraper_scours")
	# (straight before it he is the last the claws reach, as they meet in its middle)
	await _run(1.5, func(): return struck > 0 or sr.h2.act == null)
	_line(fan and struck > 0, "the scour: the fan marked, both claws slammed down and dragged in; the hero struck (%d)" % struck)
	await _run(2.0, func(): return sr.h2.act == null)
	struck = 0
	var lane := Vector2.ZERO
	for w in [Vector2(1, 0), Vector2(0, 1), Vector2(-1, 0), Vector2(0, -1)]:
		if sr.h2.clear_along(sr, sr.world, w, 0.25, 6.0, 0.42):
			lane = w
			break
	h.world = M._spot_near(sr.world + lane * 3.0, 0.0, h.world)
	_ready_only(sr, 1)
	var marked: bool = await _run(6.0, func(): return not _a1("scraper:aim", func(p): return int(p["c"]) == 1 and float(p["t"]) >= 0.5).is_empty())
	await _snap("scraper_rush_lane")
	var from: Vector2 = sr.world
	await _run(0.9)
	await _snap("scraper_rushes")
	_line(marked and struck > 0 and sr.world.distance_to(from) > 3.0, "the backward rush: its tail turned on him, the lane marked, shooting back %.1f tiles: the hero struck and thrown aside (%d)" % [sr.world.distance_to(from), struck])
	await _run(1.5, func(): return sr.h2.act == null)
	# (the Quill's own two; the Scraper held aside)
	ql._t = 0.0
	await _run(0.2)
	sr.rise(1e9)
	struck = 0
	h.world = M._spot_near(ql.world + ql.face * 2.4, 0.0, h.world)
	_ready_only(ql, 0)
	var stab: bool = await _run(6.0, func(): return not _a1("quill:aim", func(p): return float(p["t"]) >= 0.3).is_empty())
	await _snap("quill_stab_ring")
	await _run(0.5)
	await _snap("quill_stabs")
	_line(stab and struck > 0, "the Quill's nib stab: its ring closing, the nib striking (%d)" % struck)
	await _run(1.0, func(): return ql.h2.act == null)
	struck = 0
	var qway: Vector2 = ql.face
	h.world = M._spot_near(ql.world + qway * 3.3, 0.0, h.world)
	_ready_only(ql, 1)
	var laid: bool = await _run(6.0, func(): return not _a1("quill:line", func(p): return int(p["c"]) == 2).is_empty())
	await _snap("quill_lines_laid")
	await _run(0.8)
	await _snap("quill_lines_burst")
	_line(laid and struck > 0, "the ink lines: three lines laid across the floor before it, bursting; the hero on one struck (%d)" % struck)
	await _run(1.5, func(): return ql.h2.act == null)
	# OVERWRITE: the Scraper hurt; the Quill sent to write over its wounds
	sr._t = 0.0
	await _run(0.3)
	sr.life = sr.max_life * 0.6
	var l0: float = sr.life
	sr.h2.a1["heal"] = 0.0
	h.world = M._spot_near(sr.world, 6.0, h.world)
	var sent: bool = await _run(4.0, func(): return int(ql.h2.a1["mode"]) == 1 or ql.h2.act != null and ql.h2.acts()[ql.h2.act["i"]]["id"] == "quill:takeoff")
	var flew: bool = await _run(4.0, func(): return ql.h2.act != null and ql.h2.acts()[ql.h2.act["i"]]["id"] == "quill:fly")
	await _snap("quill_flies")
	var writes: bool = await _run(5.0, func(): return ql.h2.act != null and ql.h2.acts()[ql.h2.act["i"]]["id"] == "quill:write")
	await _run(1.5)
	await _snap("quill_overwrites")
	await _run(1.0)
	_line(sent and flew and writes and sr.life > l0 + 1.0, "overwrite: the Quill sent, flying to the Scraper's side and landing; writing over its wounds: %.0f to %.0f life" % [l0, sr.life])
	await _run(5.0, func(): return int(sr.h2.a1["written"]) == 0)
	# THE PALIMPSEST: their ultimate, five strips, each at him
	struck = 0
	sr.h2.a1["combo"] = 0.0
	h.world = M._spot_near(sr.world, 5.0, h.world)
	var begun: bool = await _run(6.0, func(): return int(sr.h2.a1["ult"]) == 1)
	var stripped: bool = await _run(8.0, func(): return not _a1("scraper:strip").is_empty(), keep)
	var stp: Dictionary = _a1("scraper:strip")
	# (he stands on the strip, at its middle)
	if not stp.is_empty():
		h.world = M._spot_near(Vector2(stp["x"], stp["y"]) + Vector2(stp["fx"], stp["fy"]) * 6.0, 0.0, h.world)
	await _snap("palimpsest_strip")
	var written: bool = await _run(4.0, func(): return not _a1("scraper:strip", func(p): return int(p["d"]) >= 1).is_empty())
	await _run(0.2)
	await _snap("palimpsest_swoop")
	var burst: bool = await _run(4.0, func(): return not _a1("scraper:strip", func(p): return int(p["done"]) == 1).is_empty())
	await _run(0.1)
	await _snap("palimpsest_bursts")
	await _run(0.5)
	var rounds: bool = await _run(30.0, func(): return int(sr.h2.a1["ult"]) == 0, func():
		var q: Dictionary = _a1("scraper:strip", func(p): return int(p["done"]) == 0)
		if not q.is_empty():
			h.world = M._spot_near(Vector2(q["x"], q["y"]) + Vector2(q["fx"], q["fy"]) * 6.0, 0.0, h.world))
	_line(begun and stripped and written and burst and struck > 0 and int(sr.h2.a1["round"]) >= 2, "the Palimpsest: %d strips scraped, the Quill swooping down each writing it, each bursting; the hero on them struck (%d); over %s" % [int(sr.h2.a1["round"]), struck, rounds])
	# ONE FALLS, THE OTHER FIGHTS ON (the Quill struck down on the floor: in the air it is not felled)
	await _run(6.0, func(): return not ql.h2.aloft(ql))
	ql.hurt(1e9)
	await _run(0.5)
	var alone: bool = ql.dead and not sr.dead
	await _snap("pair_one_falls")
	sr.hurt(1e9)
	await _run(1.5)
	await _snap("pair_both_fallen")
	_line(alone and sr.dead, "the Quill struck dead: the Scraper fights on alone; then it too")


func _called() -> int:
	var k := 0
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and o.has_meta("crier_called"):
			k += 1
	return k
