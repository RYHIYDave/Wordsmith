## THE SPEED AND TANK TEST (his words, 26 Nov 2026: “Give me a speed test to see which class can finish a level the fastest.  And
## which class can get the tankiest.  And a breakdown of the builds and why”):
##   godot ... -- --only=speed --shots=<dir>   with WS_DMG_GEAR=<file> (tools/godot_dmg_gear.ts 20); WS_SPEED="warrior ranger" for
##   some builds only; WS_SPEED_PART="clear" or "tank" for one half only; WS_TOUGH (the hard clear's life, x1000 if not given);
##   WS_TANK_DMG (the tank fight's blows, x15 if not given). Written to <shots>/speed.txt.
## Each hero of level 50, every talent point and word slot open, as the damage check makes them (check_dmg.gd, whose choosing this
## uses: the best gear there is, four words burned into each piece, his attribute points and his four words chosen for it).
##   THE CLEAR. His fastest build: the damage check's, its front led by lightning (in the damage test of 25 Nov every hero's quickest
##     pack of six died fastest to Forking or Wildfire in front). Then floor 19 as the game has it, every monster on it but its
##     boss, cleared by a player who does nothing clever: he walks the shortest way to the nearest monster, strikes with his quick
##     attack and his hold as often as each is ready, and uses his evasive move to cover ground; blows do him no harm. Seconds
##     till all are dead; then again with every monster a thousand times as tough (as deep in endless as a build like his is
##     made for), where his damage counts as much as his feet.
##   THE TANK. His toughest build: the same choosing, but for what he can stand rather than what he deals (his life and barrier,
##     less what his armour, dodge, block and resistances take off a blow, his regeneration, leech and shield over twenty seconds:
##     _ehp), with the talents of his tree that keep him alive. Then on floor 20, seven of its own (one an elite) that cannot die,
##     striking many times harder than on the story floor; he fights back with his quick attack and his hold. Seconds till he falls
##     (the practice room's rule keeps the game going: up again at once), three times.
extends "res://scripts/check_dmg.gd"

const Iso := preload("res://scripts/iso.gd")
const CLEAR_FLOOR := "floor19"
const CLEAR_CAP := 1500.0
const TANK_CAP := 180.0

## The tank builds' talents: those of each tree that keep him alive, and the rest on what he deals.
const TANK_TALENTS := {
	"ranger": ["wildcompanion", "huntcompanion", "longshot", "widetraps", "snare", "minefield", "lightstep", "keeneye", "venom", "quickdraw"],
	"warrior": ["greatsword", "sweepingcut", "thickskin", "bulwark", "shieldwall", "resolute", "unbreakable", "drilledleap", "footwork", "honededge"],
	"tinkerer": ["lightningrod", "markii", "growthserum", "shrapnel", "tar", "thebigone", "clustervials", "madmixture", "bombsaway", "overdrive"],
	"mage_fire": ["bittercold", "aura", "lasting", "deepfreeze", "frostwarp", "rime", "shatter", "kindling", "searing", "spear"],
	"warlock": ["branded", "withering", "hexchain", "terribleroar", "bounddemon", "pyre", "hunger", "feast", "bloodlust", "souldebt"],
	"brawler": ["vguardup", "vhangtime", "vstiffjab", "vknockdown", "vwallslam", "vlauncher", "vaftershock", "vthunderknee", "vlonglegs", "vswitchkick"],
}

var tank_mode := false
var lines: Array = []


func _put(s: String) -> void:
	lines.append(s)
	print("SPEED " + s)


## The chooser's measure: his damage (the damage check's), or in the tank's choosing what he can stand.
func _dps() -> float:
	if not tank_mode:
		return super._dps()
	return _ehp()


## WHAT HE CAN STAND, worked out: his life and barrier, and twenty seconds of what he gets back (regeneration, leech and his shield
## from his quick attack's hits), over the share of an average blow that reaches him (dodged, blocked, his armour off its plain
## part, his resistances off the rest: seven tenths of floor 20's blows plain).
func _ehp() -> float:
	var r: Dictionary = h.loadout.r(0)
	var d: float = h.dodge_chance()
	var b: float = minf(float(Words.data()["guard"]["blockCap"]), float(h.stats.get("block_chance", 0.0))) / 100.0
	var a: float = h.armour_cut()
	var res: float = (h.resist("fire") + h.resist("frost") + h.resist("light")) / 300.0
	var m: float = (1.0 - d) * (1.0 - b) * (0.7 * (1.0 - a) + 0.3 * (1.0 - clampf(res, 0.0, 0.9)))
	var hits: float = maxf(0.3, float(r["rate"])) * h.attack_pace() * float(r["count"])
	var back: float = float(h.stats.get("life_regen", 0.0)) + (float(r.get("leech", 0.0)) + float(r.get("shield", 0.0))) * hits
	return (h.max_life + h.max_barrier + 20.0 * back) / maxf(0.02, m)


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	G = JSON.parse_string(FileAccess.get_file_as_string(OS.get_environment("WS_DMG_GEAR")))
	var only: Array = Array(OS.get_environment("WS_SPEED").split(" ", false)) if OS.has_environment("WS_SPEED") else []
	var part := OS.get_environment("WS_SPEED_PART") if OS.has_environment("WS_SPEED_PART") else ""
	# (floor 20 first, for its own kind of monster: what the chooser's dummy and the tank's foes are made of)
	M.go_to("floor20", "start")
	await M._wait(2.0)
	_arena()
	_put("FLOOR 20's own monsters: %s" % _lives())
	await _set_out()
	_put("the tank fight's foes: %s (the floor's most common)" % kind)
	for b in BUILDS:
		if b["id"] == "mage_frost":
			continue
		if not only.is_empty() and not only.has(b["id"]):
			continue
		if part != "tank":
			await _clear_test(b)
		if part != "clear":
			await _tank_test(b)
	var f := FileAccess.open(dir + "/speed.txt", FileAccess.WRITE)
	f.store_string("\n".join(lines) + "\n")
	f.close()
	print("SPEED DONE")


# --- the builds ---

func _show_build(b: Dictionary, picks: Dictionary, ws: Array, talents: Array) -> void:
	var s: Dictionary = h.stats
	_put("  attributes: Str %d, Dex %d, Int %d; life %d, barrier %d, armour %d (takes %d%% of a plain blow), dodge %d%%, block %d%%, resist fire %d%% frost %d%% lightning %d%%, regeneration %.1f a second; walks %.2f tiles a second" % [s["str"], s["dex"], s["int"], int(h.max_life), int(h.max_barrier), int(s.get("armor", 0)), roundi(h.armour_cut() * 100.0), roundi(h.dodge_chance() * 100.0), roundi(minf(50.0, float(s.get("block_chance", 0.0)))), roundi(h.resist("fire")), roundi(h.resist("frost")), roundi(h.resist("light")), float(s.get("life_regen", 0.0)), h.walk_pace()])
	_put("  his quick attack's words: in front %s; behind %s. Worked out: %d damage a second into one, what he can stand %d" % [_wn(ws[0]) + ", " + _wn(ws[1]), _wn(ws[2]) + ", " + _wn(ws[3]), int(super._dps()), int(_ehp())])
	_put("  talents: %s" % ", ".join(talents))
	for sl in picks:
		_put("    %s: %s + %s" % [sl, picks[sl]["base"]["name"], ", ".join((picks[sl]["opts"] as Array).map(func(o): return str(o["word"])))])


static func _wn(w) -> String:
	return "-" if w == null else str(w)


## His fastest build: the damage check's, led by lightning.
func _speed_build(b: Dictionary) -> Dictionary:
	tank_mode = false
	await M.go_to("floor20", "start")
	await M._wait(1.0)
	_arena()
	_hero(b, true)
	var bb: Dictionary = b.duplicate()
	bb["must"] = "lightning"
	bb.erase("also")
	var ws: Array = [null, null, null, null]
	_gear(b["cls"])
	ws = _with_must(bb, ws, [1, 2, 3])
	_gear(b["cls"])
	ws = _with_must(bb, ws, [1, 2, 3])
	var picks := _gear(b["cls"])
	_share_points(b)
	_set_words(ws)
	return {"picks": picks, "ws": ws}


## His toughest: points where they make him toughest, the gear and the four words chosen for it, the talents that keep him alive.
func _tank_build(b: Dictionary) -> Dictionary:
	tank_mode = true
	await M.go_to("floor20", "start")
	await M._wait(1.0)
	_arena()
	var tb: Dictionary = b.duplicate()
	tb["talents"] = TANK_TALENTS[b["id"]]
	_hero(tb, false)
	_gear(b["cls"])
	var best_attr := ""
	for _round in 2:
		var best := -1.0
		for at in ["str", "dex", "int"]:
			_points_in(b, at)
			var v := _ehp()
			if v > best:
				best = v
				best_attr = at
		_points_in(b, best_attr)
		_gear(b["cls"])
	var ws: Array = _words([null, null, null, null], [0, 1, 2, 3])
	var picks := _gear(b["cls"])
	ws = _words(ws, [0, 1, 2, 3])
	_set_words(ws)
	tank_mode = false
	return {"picks": picks, "ws": ws, "attr": best_attr, "talents": tb["talents"]}


## Every attribute point of his fifty levels in one attribute.
func _points_in(b: Dictionary, at: String) -> void:
	var C: Dictionary = Words.data()["classes"][b["cls"]]
	for k in ["str", "dex", "int"]:
		M.loot.attrs[k] = float(C["attrs"][k])
	M.loot.attrs[at] += float(G.get("attrPerLevel", 5)) * (LEVEL - 1)
	M.loot.derive()


# --- the clear ---

func _clear_test(b: Dictionary) -> void:
	_put("")
	_put("=== %s: THE CLEAR ===" % str(b["cls"]).to_upper())
	var t0 := Time.get_ticks_msec()
	var made: Dictionary = await _speed_build(b)
	_put("  (his build chosen in %.0f s)" % ((Time.get_ticks_msec() - t0) / 1000.0))
	_show_build(b, made["picks"], made["ws"], b["talents"])
	var tough := float(OS.get_environment("WS_TOUGH")) if OS.has_environment("WS_TOUGH") else 1000.0
	for k in [1.0, tough]:
		var res: Dictionary = await _clear_level(b, k)
		_put("  FLOOR 19%s: %d of %d monsters dead in %.1f s (walking %.0f s, fighting %.0f s, %.0f tiles walked; %d out of reach)%s" % ["" if k == 1.0 else " x%d TOUGH" % int(k), res["dead"], res["all"], res["t"], res["walk"], res["fight"], res["tiles"], res["unreached"], "" if res["done"] else " — NOT FINISHED in %d s" % int(CLEAR_CAP)])


## The walk grid from where he stands: each tile's steps from him (-1 never), and the tile it was reached from.
func _flood(from: Vector2i) -> Array:
	var mp = M.map
	var n: int = mp.w * mp.h
	var dist := PackedInt32Array()
	dist.resize(n)
	dist.fill(-1)
	var came := PackedInt32Array()
	came.resize(n)
	came.fill(-1)
	# (standing where the walk grid has no floor, on a ledge's edge or a door's pier: from the nearest tile that has)
	if not mp.passable(from.x, from.y):
		var near := Vector2i(-1, -1)
		for rr in range(1, 4):
			for oy in range(-rr, rr + 1):
				for ox in range(-rr, rr + 1):
					if near.x < 0 and mp.passable(from.x + ox, from.y + oy):
						near = Vector2i(from.x + ox, from.y + oy)
			if near.x >= 0:
				break
		if near.x < 0:
			return [dist, came]
		from = near
	var q := PackedInt32Array([from.y * mp.w + from.x])
	dist[q[0]] = 0
	var head := 0
	while head < q.size():
		var c: int = q[head]
		head += 1
		var cx: int = c % mp.w
		var cy: int = c / mp.w
		for o in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1), Vector2i(1, 1), Vector2i(1, -1), Vector2i(-1, 1), Vector2i(-1, -1)]:
			var nx: int = cx + o.x
			var ny: int = cy + o.y
			if not mp.passable(nx, ny):
				continue
			# (a corner cut only where both sides are open)
			if o.x != 0 and o.y != 0 and (not mp.passable(cx + o.x, cy) or not mp.passable(cx, cy + o.y)):
				continue
			var j: int = ny * mp.w + nx
			if dist[j] >= 0:
				continue
			dist[j] = dist[c] + 1
			came[j] = c
			q.append(j)
	return [dist, came]


## A tile his monsters may stand on near it, for one standing where the walk grid has no floor (on a ledge's edge).
func _tile_of(p: Vector2) -> Vector2i:
	return Vector2i(floori(p.x), floori(p.y))


func _clear_level(b: Dictionary, life_k: float) -> Dictionary:
	await M.go_to(CLEAR_FLOOR, "start")
	await M._wait(2.0)
	h.unhurt = true
	h.practice = false
	h.life = h.max_life
	var mons: Array = M._monsters.list.filter(func(m): return is_instance_valid(m) and not m.dead and not m.boss)
	for m in mons:
		m.max_life *= life_k
		m.life = m.max_life
	var all := mons.size()
	var melee: bool = b["cls"] in ["warrior", "brawler"]
	var reach := 1.6 if melee else 5.0
	var t := 0.0
	var walk_t := 0.0
	var fight_t := 0.0
	var tiles := 0.0
	var skip := {}
	var target = null
	var path: Array = []
	var replan := 0.0
	var best_d := INF
	var since := 0.0
	var unreached := 0
	var done := false
	var stranded := 0.0
	var ldist := PackedInt32Array()
	var was: Vector2 = h.world
	while t < CLEAR_CAP:
		await M.get_tree().process_frame
		var dt: float = M.get_process_delta_time()
		t += dt
		h.life = h.max_life
		tiles += h.world.distance_to(was)
		was = h.world
		replan -= dt
		if target == null or not is_instance_valid(target) or target.dead or replan <= 0.0:
			replan = 0.5
			var fl := _flood(_tile_of(h.world))
			var dist: PackedInt32Array = fl[0]
			var came: PackedInt32Array = fl[1]
			ldist = dist
			var pick = null
			var pick_d := 1 << 30
			unreached = 0
			for m in M._monsters.list:
				if not is_instance_valid(m) or m.dead or m.boss or skip.get(m.get_instance_id(), -1.0) > t:
					continue
				var tl := _tile_of(m.world)
				var dd := -1
				# (it, or a tile beside it)
				for oy in range(-1, 2):
					for ox in range(-1, 2):
						var tx: int = tl.x + ox
						var ty: int = tl.y + oy
						if tx < 0 or ty < 0 or tx >= M.map.w or ty >= M.map.h:
							continue
						var v: int = dist[ty * M.map.w + tx]
						if v >= 0 and (dd < 0 or v < dd):
							dd = v
				if dd < 0:
					unreached += 1
					continue
				if dd < pick_d:
					pick_d = dd
					pick = m
			if pick == null:
				# (none left he can walk to: done; or, while some are out of his reach where he stands, a moment more)
				if unreached == 0:
					done = true
					break
				stranded += 0.5
				if stranded > 5.0:
					break
				target = null
				continue
			stranded = 0.0
			if pick != target:
				best_d = INF
				since = 0.0
			target = pick
			# the way to it, from him
			path = []
			var tl2 := _tile_of(target.world)
			var at := -1
			var at_d := 1 << 30
			for oy in range(-1, 2):
				for ox in range(-1, 2):
					var tx: int = tl2.x + ox
					var ty: int = tl2.y + oy
					if tx < 0 or ty < 0 or tx >= M.map.w or ty >= M.map.h:
						continue
					var v: int = dist[ty * M.map.w + tx]
					if v >= 0 and v < at_d:
						at_d = v
						at = ty * M.map.w + tx
			while at >= 0:
				path.push_front(Vector2(at % M.map.w + 0.5, at / M.map.w + 0.5))
				at = came[at]
		var to: Vector2 = target.world - h.world
		var dlen: float = to.length()
		var see: bool = M._monsters.sees(h.world, target.world)
		if dlen <= reach + float(target.r) and see:
			h.auto_dir = Vector2.ZERO
			if to.length() > 0.01:
				h._turn(to.normalized())
			h.auto_attack = true
			h.auto_whirl = true
			fight_t += dt
			since = 0.0
		else:
			# (along the way: the furthest of the next few tiles of it he can walk straight to)
			while path.size() > 1 and h.world.distance_to(path[0]) < 0.6:
				path.pop_front()
			var aim: Vector2 = target.world if see else (path[0] if not path.is_empty() else target.world)
			for k in range(mini(3, path.size()) - 1, 0, -1):
				if M._monsters.sees(h.world, path[k]):
					aim = path[k]
					break
			var wd: Vector2 = (aim - h.world).normalized()
			h.auto_dir = Iso.to_screen(wd.x, wd.y).normalized()
			# (his evasive move, to cover ground, where the way runs straight on)
			# (never over a wall or a drop: where it lands, floor a short walk from him by the walk grid)
			var land: Vector2 = h.world + wd * 4.0
			var lt := _tile_of(land)
			var ok: bool = lt.x >= 0 and lt.y >= 0 and lt.x < M.map.w and lt.y < M.map.h and ldist.size() == M.map.w * M.map.h
			if ok:
				var ld: int = ldist[lt.y * M.map.w + lt.x]
				ok = ld >= 0 and ld <= 8
			if dlen > 6.0 and ok and M._monsters.sees(h.world, land):
				h.auto_lunge = land
			walk_t += dt
			# (no nearer in four seconds: let it be for twenty)
			if dlen < best_d - 0.5:
				best_d = dlen
				since = 0.0
			else:
				since += dt
				if since > 4.0:
					skip[target.get_instance_id()] = t + 20.0
					target = null
					since = 0.0
	h.auto_dir = Vector2.ZERO
	h.auto_whirl = false
	var dead := 0
	for m in mons:
		if not is_instance_valid(m) or m.dead:
			dead += 1
	return {"t": t, "walk": walk_t, "fight": fight_t, "tiles": tiles, "dead": dead, "all": all, "unreached": unreached, "done": done}


# --- the tank ---

func _tank_test(b: Dictionary) -> void:
	_put("")
	_put("=== %s: THE TANK ===" % str(b["cls"]).to_upper())
	var t0 := Time.get_ticks_msec()
	var made: Dictionary = await _tank_build(b)
	_put("  (his build chosen in %.0f s; his points all in %s)" % [(Time.get_ticks_msec() - t0) / 1000.0, made["attr"]])
	_show_build(b, made["picks"], made["ws"], made["talents"])
	var k := float(OS.get_environment("WS_TANK_DMG")) if OS.has_environment("WS_TANK_DMG") else 15.0
	var times: Array = []
	for _try in 3:
		times.append(await _tank_fight(k))
	times.sort()
	_put("  STANDS among seven of floor 20's own (blows x%d), fighting back: %s s (middle %.1f s)" % [int(k), ", ".join(times.map(func(x): return "%.1f" % x)), times[1]])


func _tank_fight(k: float) -> float:
	_clear()
	await M.get_tree().process_frame
	h.world = spot
	h._place()
	h.unhurt = false
	h.practice = true
	h.life = h.max_life
	h.barrier = h.max_barrier
	var foes: Array = []
	for n in 7:
		var a := TAU * n / 7.0
		var m = M._monsters.call_up(kind, spot + Vector2(cos(a), sin(a)) * 1.6, 900, -Vector2(cos(a), sin(a)))
		m.xp = 0
		m.max_life = 1e12
		m.life = 1e12
		m.dmg_min *= k
		m.dmg_max *= k
		if n == 0:
			m.elite = true
		m.state = "chase"
		m.seen = true
		foes.append(m)
	var t := 0.0
	var prev: float = h.life
	while t < TANK_CAP:
		await M.get_tree().process_frame
		var dt: float = M.get_process_delta_time()
		t += dt
		# (he stands his ground, his face to the nearest)
		var near = null
		for m in foes:
			if is_instance_valid(m) and not m.dead and (near == null or m.world.distance_to(h.world) < near.world.distance_to(h.world)):
				near = m
		if near != null and near.world.distance_to(h.world) > 0.01:
			h._turn((near.world - h.world).normalized())
		h.auto_attack = true
		h.auto_whirl = true
		# (fallen: the practice room's rule stood him up again, his life full at once)
		if h.life >= h.max_life - 0.5 and prev < h.max_life * 0.5:
			break
		prev = h.life
	h.practice = false
	h.unhurt = true
	h.auto_whirl = false
	return t
