## THE AUTOPILOT RUN (his pick, 27 Nov 2026, the next sweep: “A full run per class”): `--only=autorun --cls=<class> --shots=<dir>`.
## A new hero of the class, as he starts, plays floors 1 to 5 as a plain player would (check_speed.gd's player: the shortest way to
## the nearest monster, his quick attack and his hold as each is ready, his evasive move to cover ground), every monster on each floor
## and its boss, none of his blows harming him, the monsters a fifth as hard to kill (WS_AUTORUN_LIFE) so that a level 1 hero gets
## through: what is watched is where a player gets stuck, not how hard it is. Each floor: how many of its monsters fell, whether its
## boss did, how often he could get no nearer to the one he went for (STALLS: let be and come back to), how long; and, the boss
## dead, whether its way on opened. Pictured where he stalls. One line a floor, AUTORUN, and the sum.
extends "res://scripts/check_speed.gd"

## (how long a floor is played at most, in seconds of the game: WS_AUTORUN_CAP)
var CAP := float(OS.get_environment("WS_AUTORUN_CAP")) if OS.has_environment("WS_AUTORUN_CAP") else 300.0


## (a place he walks to that is no monster: a lever, a thing of a quest lying where it fell, the forge crank, the temple door)
class Spot:
	var world: Vector2
	var r := 0.3
	var dead := false
	var def := {}
	var done: Callable
	func _init(what: String, at: Vector2, is_done: Callable) -> void:
		def = {"name": what}
		world = at
		done = is_done


const GEAR = preload("res://scripts/stoker.gd").Gear
const KEY = preload("res://scripts/keybearers.gd").TempleKey
var n_bad := 0


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	var k := float(OS.get_environment("WS_AUTORUN_LIFE")) if OS.has_environment("WS_AUTORUN_LIFE") else 0.2
	if OS.has_environment("WS_AUTORUN_PROBE"):
		await _probe(OS.get_environment("WS_AUTORUN_PROBE"))
		return
	var last := int(OS.get_environment("WS_AUTORUN_TO")) if OS.has_environment("WS_AUTORUN_TO") else 5
	for f in range(int(OS.get_environment("WS_AUTORUN_FROM")) if OS.has_environment("WS_AUTORUN_FROM") else 1, last + 1):
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
	var spots := {}
	var hit_life := INF
	var hit_since := 0.0
	var vain := 0
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
			if pick == null and unreached > 0:
				# (all he can reach are dead: what a player goes to next, the nearest he can reach: a lever to raise its gate, a gear or
				# key lying where its bearer fell, the forge crank with its gear, the temple door with its keys)
				var lv_d := 1 << 30
				for sp in _spots(spots):
					var lt := Vector2i(floori(sp.world.x), floori(sp.world.y))
					for oy in range(-1, 2):
						for ox in range(-1, 2):
							var tx: int = lt.x + ox
							var ty: int = lt.y + oy
							if tx < 0 or ty < 0 or tx >= M.map.w or ty >= M.map.h:
								continue
							var v: int = dist[ty * M.map.w + tx]
							if v >= 0 and v < lv_d:
								lv_d = v
								pick = sp
				if pick != null:
					pick_d = lv_d
				elif stranded == 0.0:
					var far: Array = []
					for m in M._monsters.list:
						if is_instance_valid(m) and not m.dead and far.size() < 6:
							far.append("%s at %s" % [m.def.get("name", "?") if m.get("def") is Dictionary else "?", m.world])
					print("AUTORUN   out of reach on floor %d, he at %s: %s" % [f, h.world, ", ".join(far)])
					M._snap(dir + "/reach_%s_f%d.png" % [h.cls, f])
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
				hit_life = INF
				hit_since = 0.0
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
		if target is Spot and target.done.call():
			print("AUTORUN   %s done on floor %d at %s" % [target.def["name"], f, target.world])
			target.dead = true
			continue
		var to: Vector2 = target.world - h.world
		var dlen: float = to.length()
		var see: bool = M._monsters.sees(h.world, target.world)
		if dlen <= (0.4 if target is Spot else reach) + float(target.r) and see:
			h.auto_dir = Vector2.ZERO
			if to.length() > 0.01:
				h._turn(to.normalized())
			h.auto_attack = true
			h.auto_whirl = true
			since = 0.0
			# (STRUCK AT IN VAIN: twelve seconds at it, in reach and in sight, and its life no less: pictured, let be for twenty)
			if not (target is Spot):
				if float(target.life) < hit_life - 0.01:
					hit_life = float(target.life)
					hit_since = 0.0
				else:
					hit_since += dt
				if hit_since > 12.0:
					stalls += 1
					vain += 1
					if vain <= 3:
						M._snap(dir + "/vain_%s_f%d_%d.png" % [h.cls, f, vain])
					print("AUTORUN   struck in vain on floor %d at %s at %s at %s (%.1f of %.1f)" % [f, h.world, target.def.get("name", "?") if target.get("def") is Dictionary else "?", target.world, target.life, target.max_life])
					skip[target.get_instance_id()] = t + 20.0
					target = null
					hit_since = 0.0
		else:
			# (walking: his attacks let go, as a player's are, so that a held Whirlwind does not keep him spinning where he stands)
			h.auto_attack = false
			h.auto_whirl = false
			while path.size() > 1 and h.world.distance_to(path[0]) < 0.6:
				path.pop_front()
			# (straight for it only where a body could walk the line: sight passes over a torch's tile, he does not)
			var aim: Vector2 = target.world if see and _walkable_line(h.world, target.world) else (path[0] if not path.is_empty() else target.world)
			for kk in range(mini(3, path.size()) - 1, 0, -1):
				if _walkable_line(h.world, path[kk]):
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
					if stalls <= 3:
						print("AUTORUN     aim %s, the way %s, auto_dir %s, act '%s', kit move %s, scene_pace %s, held %s, hp %s" % [aim, path.slice(0, 4), h.auto_dir, h._act, (h.kit.move if h.kit != null else {}), h.scene_pace, h.held, h.life])
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


## (the places a player would go to next that are not yet done, each kept by its key so that the same one is gone for)
func _spots(kept: Dictionary) -> Array:
	var out: Array = []
	for p in M.map.props:
		if p["kind"] == "lever" and int(p["state"]) == 0 and p.get("name", "") != "crank":
			var k := "lever%d" % int(p["i"])
			if not kept.has(k):
				kept[k] = Spot.new("lever", Vector2(float(p["x"]), float(p["y"])), func(): return int(p["state"]) != 0)
			out.append(kept[k])
	for holder in [M._monsters.perils, M._monsters.stands]:
		if holder == null:
			continue
		for n in holder.get_children():
			if (n is GEAR or n is KEY) and not n.is_queued_for_deletion():
				var k := "item%d" % n.get_instance_id()
				if not kept.has(k):
					var node = n
					kept[k] = Spot.new("gear" if n is GEAR else "key", n.at, func(): return not is_instance_valid(node) or node.is_queued_for_deletion())
				out.append(kept[k])
	var fu = M.furnace
	if fu != null and fu.step == "gear" and not fu._crank.is_empty():
		if not kept.has("crank"):
			kept["crank"] = Spot.new("crank", Vector2(float(fu._crank["x"]), float(fu._crank["y"])), func(): return fu.step != "gear")
		out.append(kept["crank"])
	var te = M.temple
	if te != null and not te.open and te.keys >= te.need and not te._door.is_empty():
		if not kept.has("temple"):
			kept["temple"] = Spot.new("temple door", Vector2(float(te._door["middle"]["x"]), float(te._door["middle"]["y"])), func(): return te.open)
		out.append(kept["temple"])
	return out


## (whether a body could walk straight from a to b: the map lets it stand all along the line)
func _walkable_line(a: Vector2, b: Vector2) -> bool:
	var n := maxi(1, ceili(a.distance_to(b) / 0.2))
	for i in range(1, n + 1):
		var p := a.lerp(b, float(i) / n)
		if not M.map.fits(p.x, p.y, h.RADIUS):
			return false
	return true


## (the way to a monster as a player walks it: a shut door is no wall, it opens as he walks into it (doors.gd); a gate still down is,
## and so stands in his way as it does in the game)
func _flood(from: Vector2i) -> Array:
	var mp = M.map
	var saved: PackedByteArray = mp.shut.duplicate()
	for d in mp.doors:
		if str(d.get("kind", "")) == "door":
			for t in d.get("way", []):
				mp.shut[int(t)] = 0
	var out := _flood_heights(from)
	mp.shut = saved
	return out


## (the shortest way as check_speed.gd floods it, and the heights kept: from one tile to the next only where the step grid lets a
## body over, so that a ledge is gone round by its stairs, as he must, not walked into)
func _flood_heights(from: Vector2i) -> Array:
	var mp = M.map
	if mp.step.is_empty():
		return super._flood(from)
	var n: int = mp.w * mp.h
	var dist := PackedInt32Array()
	dist.resize(n)
	dist.fill(-1)
	var came := PackedInt32Array()
	came.resize(n)
	came.fill(-1)
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
			if not mp.passable(nx, ny) or not mp.may_overlap(cx, cy, nx, ny):
				continue
			if o.x != 0 and o.y != 0 and (not mp.passable(cx + o.x, cy) or not mp.passable(cx, cy + o.y)):
				continue
			var j: int = ny * mp.w + nx
			if dist[j] >= 0:
				continue
			dist[j] = dist[c] + 1
			came[j] = c
			q.append(j)
	return [dist, came]


## (A LOOK AT ONE STALL: `WS_AUTORUN_PROBE=f,x,y,tx,ty`: the hero set down at (x, y) on floor f, the way to (tx, ty) as the autopilot
## would walk it, each of its first tiles with what the map says of it, and where he stands after walking for two seconds)
func _probe(spec: String) -> void:
	var a := spec.split(",")
	var f := int(a[0])
	await M.go_to("floor%d" % f, "down" if f > 1 else "stairs")
	await M._wait(1.0)
	h.unhurt = true
	if a.size() > 5 and a[5] == "doors":
		var at := Vector2(float(a[1]), float(a[2]))
		for d in M.map.doors:
			var mid := Vector2(float(d["middle"]["x"]), float(d["middle"]["y"]))
			if mid.distance_to(at) < 16.0:
				print("PROBE door %s want %s at %s, room %s, word %s" % [d["kind"], d.get("want"), mid, d.get("room", "-"), d.get("word", d.get("need", "-"))])
		for r in M.map.rooms:
			if at.x >= r["x"] and at.y >= r["y"] and at.x < r["x"] + r["w"] and at.y < r["y"] + r["h"]:
				print("PROBE in room %s: %s" % [r.get("id"), r])
		var fl := _flood(_tile_of(h.world))
		var dist: PackedInt32Array = fl[0]
		print("PROBE from his arrival the spot is %s" % ("reached in %d" % dist[floori(at.y) * M.map.w + floori(at.x)] if dist[floori(at.y) * M.map.w + floori(at.x)] >= 0 else "not reached"))
		M.map.step = PackedByteArray()
		fl = _flood(_tile_of(h.world))
		dist = fl[0]
		print("PROBE heights set aside, the spot is %s" % ("reached" if dist[floori(at.y) * M.map.w + floori(at.x)] >= 0 else "not reached"))
		return
	print("PROBE arrived at %s, kit %s, scene_pace %s, act '%s'" % [h.world, h.kit != null, h.scene_pace, h._act])
	if float(a[1]) >= 0.0:
		for m in M._monsters.list:
			if is_instance_valid(m):
				m.world = Vector2(-100, -100)
		h.world = Vector2(float(a[1]), float(a[2]))
	var goal := Vector2(float(a[3]), float(a[4]))
	var mp = M.map
	print("PROBE steps on this floor: %s; cut: %s" % [not mp.step.is_empty(), not mp.cut.is_empty()])
	for ty in range(floori(h.world.y) - 2, floori(h.world.y) + 3):
		var row := ""
		for tx in range(floori(h.world.x) - 3, floori(h.world.x) + 4):
			var i: int = ty * mp.w + tx
			row += "%d/%s/%s " % [tx, "W" if mp.walkable(tx, ty) else "-", str(mp.step[i]) if not mp.step.is_empty() else "."]
		print("PROBE row %d: %s" % [ty, row])
	var fl := _flood(_tile_of(h.world))
	var dist: PackedInt32Array = fl[0]
	var came: PackedInt32Array = fl[1]
	var at: int = floori(goal.y) * mp.w + floori(goal.x)
	var path: Array = []
	while at >= 0:
		path.push_front(Vector2i(at % mp.w, at / mp.w))
		at = came[at]
	print("PROBE the way: %d tiles, first: %s" % [path.size(), path.slice(0, 10)])
	for i in range(mini(6, path.size())):
		var c := Vector2(path[i].x + 0.5, path[i].y + 0.5)
		print("PROBE   %s fits %s flat %s sees %s" % [path[i], mp.fits(c.x, c.y, h.RADIUS), mp.fits(c.x, c.y, h.RADIUS, true), M._monsters.sees(h.world, c)])
	var w0: Vector2 = h.world
	for d in [Vector2(0.02, 0.0), Vector2(0.0, 0.02), Vector2(0.02, 0.0075)]:
		print("PROBE   slide %s from %s -> %s; fits there %s, flat %s" % [d, w0, mp.slide(w0, h.RADIUS, d), mp.fits(w0.x + d.x, w0.y + d.y, h.RADIUS), mp.fits(w0.x + d.x, w0.y + d.y, h.RADIUS, true)])
	print("PROBE   he fits where he stands: %s, flat %s" % [mp.fits(w0.x, w0.y, h.RADIUS), mp.fits(w0.x, w0.y, h.RADIUS, true)])
	var aim := Vector2(path[2].x + 0.5, path[2].y + 0.5) if path.size() > 2 else goal
	for k in range(4):
		var wd: Vector2 = (aim - h.world).normalized()
		h.auto_dir = Iso.to_screen(wd.x, wd.y).normalized()
		await M._wait(0.5)
		print("PROBE   walking for %s: at %s; auto_dir %s, scene_pace %s, act '%s', paused %s" % [aim, h.world, h.auto_dir, h.scene_pace, h._act, M.get_tree().paused])
	h.auto_dir = Vector2.ZERO
	M._snap(dir + "/probe_%d.png" % f)
