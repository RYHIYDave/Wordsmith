## THE AUTOPILOT RUN (his pick, 27 Nov 2026, the next sweep: “A full run per class”): `--only=autorun --cls=<class> --shots=<dir>`.
## A new hero of the class, as he starts, plays floors 1 to 5 as a plain player would (check_speed.gd's player: the shortest way to
## the nearest monster, his quick attack and his hold as each is ready, his evasive move to cover ground), every monster on each floor
## and its boss, none of his blows harming him, the monsters a fifth as hard to kill (WS_AUTORUN_LIFE) so that a level 1 hero gets
## through: what is watched is where a player gets stuck, not how hard it is. Each floor: how many of its monsters fell, whether its
## boss did, how often he could get no nearer to the one he went for (STALLS: let be and come back to), how long; and, the boss
## dead, whether its way on opened. Pictured where he stalls. One line a floor, AUTORUN, and the sum.
extends "res://scripts/check_speed.gd"

const CAP := 300.0
var n_bad := 0


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	var k := float(OS.get_environment("WS_AUTORUN_LIFE")) if OS.has_environment("WS_AUTORUN_LIFE") else 0.2
	for f in range(1, 6):
		await M.go_to("floor%d" % f, "down" if f > 1 else "stairs")
		await M._wait(2.0)
		var r := await _play(f, k)
		var ok: bool = r["boss"] and r["stalls"] <= 3 and r["dead"] * 10 >= r["all"] * 8
		if not ok:
			n_bad += 1
		print("AUTORUN %s floor %d %s: %d of %d monsters, boss %s, %d stalls, %.0f s; the way on %s" % [h.cls, f, "OK" if ok else "LOOK", r["dead"], r["all"], "dead" if r["boss"] else "alive", r["stalls"], r["t"], r["way"]])
	print("AUTORUN %s: 5 floors, %d to look at" % [h.cls, n_bad])


func _play(f: int, life_k: float) -> Dictionary:
	h.unhurt = true
	h.practice = false
	var mons: Array = M._monsters.list.filter(func(m): return is_instance_valid(m) and not m.dead)
	for m in mons:
		m.max_life *= life_k
		m.life = m.max_life
	var all := mons.size()
	var melee: bool = h.cls in ["warrior", "brawler"]
	var reach := 1.6 if melee else 5.0
	var t := 0.0
	var stalls := 0
	var skip := {}
	var target = null
	var path: Array = []
	var replan := 0.0
	var best_d := INF
	var since := 0.0
	var stranded := 0.0
	var ldist := PackedInt32Array()
	while t < CAP:
		await M.get_tree().process_frame
		var dt: float = M.get_process_delta_time()
		t += dt
		h.life = h.max_life
		replan -= dt
		if M.place != "floor%d" % f:
			break
		if stranded > 0.0 and replan > 0.0:
			h.auto_dir = Vector2.ZERO
			continue
		if target == null or not is_instance_valid(target) or target.dead or replan <= 0.0:
			replan = 0.5
			var fl := _flood(_tile_of(h.world))
			var dist: PackedInt32Array = fl[0]
			var came: PackedInt32Array = fl[1]
			ldist = dist
			var pick = null
			var pick_d := 1 << 30
			var unreached := 0
			for m in M._monsters.list:
				if not is_instance_valid(m) or m.dead or skip.get(m.get_instance_id(), -1.0) > t:
					continue
				var tl := _tile_of(m.world)
				var dd := -1
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
				if unreached == 0:
					break
				stranded += 0.5
				if stranded > 15.0:
					break
				target = null
				continue
			stranded = 0.0
			if pick != target:
				best_d = INF
				since = 0.0
			target = pick
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
			since = 0.0
		else:
			# (walking: his attacks let go, as a player's are, so that a held Whirlwind does not keep him spinning where he stands)
			h.auto_attack = false
			h.auto_whirl = false
			while path.size() > 1 and h.world.distance_to(path[0]) < 0.6:
				path.pop_front()
			var aim: Vector2 = target.world if see else (path[0] if not path.is_empty() else target.world)
			for kk in range(mini(3, path.size()) - 1, 0, -1):
				if M._monsters.sees(h.world, path[kk]):
					aim = path[kk]
					break
			var wd: Vector2 = (aim - h.world).normalized()
			h.auto_dir = Iso.to_screen(wd.x, wd.y).normalized()
			if dlen < best_d - 0.5:
				best_d = dlen
				since = 0.0
			else:
				since += dt
				if since > 6.0:
					# (A STALL: no nearer in six seconds; pictured, let be for twenty)
					stalls += 1
					if stalls <= 3:
						M._snap(dir + "/stall_%s_f%d_%d.png" % [h.cls, f, stalls])
					print("AUTORUN   stall on floor %d at %s going for %s at %s" % [f, h.world, target.def.get("name", "?") if target.get("def") is Dictionary else "?", target.world])
					skip[target.get_instance_id()] = t + 20.0
					target = null
					since = 0.0
	h.auto_dir = Vector2.ZERO
	h.auto_whirl = false
	h.auto_attack = false
	var dead := 0
	var boss := true
	for m in mons:
		var gone: bool = not is_instance_valid(m) or m.dead
		if gone:
			dead += 1
		elif m.boss:
			boss = false
	await M._wait(4.0)
	var way := "not looked for"
	if M._stairs != null:
		way = "open" if M._stairs.opened >= 0 else "shut"
	return {"t": t, "dead": dead, "all": all, "boss": boss, "stalls": stalls, "way": way}


## (the way to a monster as a player walks it: a shut door is no wall, it opens as he walks into it (doors.gd); a gate still down is,
## and so stands in his way as it does in the game)
func _flood(from: Vector2i) -> Array:
	var mp = M.map
	var saved: PackedByteArray = mp.shut.duplicate()
	for d in mp.doors:
		if str(d.get("kind", "")) == "door":
			for t in d.get("way", []):
				mp.shut[int(t)] = 0
	var out := super._flood(from)
	mp.shut = saved
	return out
