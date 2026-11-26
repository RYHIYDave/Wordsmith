## THE FIVE WEAKEST FLOORS REMADE, THEIR CHECK AND PICTURES (--only=levels2 --levels2=1 --floor=<N> --shots=<dir>; main.gd LEVELS2):
## the floor as it was and as remade, side by side in numbers (its monsters, its packs, its chests, its rooms by kind); then the
## remade one walked into: where it begins, each of its new side areas (a treasure area's chests, a guardian's pack), and its
## large map; a line a step (OK or WRONG).
extends RefCounted

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("LEVELS2 %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


## (what a floor's files hold: its monsters, packs, chests, rooms by kind)
func _sum(dir: String) -> Dictionary:
	var L: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/layout.json"))
	var Mo: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/monsters.json"))
	var packs := {}
	for m in Mo["monsters"]:
		packs[m.get("packId", -1)] = true
	var kinds := {}
	for r in L["rooms"]:
		kinds[r["kind"]] = int(kinds.get(r["kind"], 0)) + 1
	var chests: int = (L["props"] as Array).filter(func(p): return p["kind"] == "chest").size()
	return {"monsters": (Mo["monsters"] as Array).size(), "packs": packs.size(), "chests": chests, "rooms": kinds}


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M.loot.taught = true
	M.loot.ring_lit = true
	h.walked = 500.0
	var d := int(M._arg("floor")) if M._arg("floor") != "" else 7
	var place := "floor%d" % d
	var was := _sum("res://assets/" + place)
	var now := _sum(M.dir_of(place))
	_line(M.files_of(place) == place + "v2", "floor %d remade: its files %s" % [d, M.files_of(place)])
	print("LEVELS2 was: %s" % [was])
	print("LEVELS2 now: %s" % [now])
	_line(int(now["monsters"]) > int(was["monsters"]) and int(now["packs"]) > int(was["packs"]),
		"more fights: monsters %d to %d, packs %d to %d" % [int(was["monsters"]), int(now["monsters"]), int(was["packs"]), int(now["packs"])])
	await M._wait(0.4)
	M.go_to(place, "start")
	await M._wait(3.0)
	M._hud.card = {}
	M._hud.floor_card = {}
	M.guide._speak = {}
	await M._wait(0.1)
	await M._snap("%s/f%d_1_start.png" % [dir, d])
	# its new side areas, each looked at (and an open area off the main way that is no side area: floor 8's second way)
	var k := 2
	# (off the main way: a room of the open ground with no place on the way, not a stronghold's yard or hall, nor the Colossus's
	# stone)
	var off_way := {}
	var held := {}
	var holds_at: String = M.dir_of(place) + "/holds.json"
	if FileAccess.file_exists(holds_at):
		for q in (JSON.parse_string(FileAccess.get_file_as_string(holds_at)) as Dictionary).get("holds", []):
			held[int(q["yard"])] = true
			held[int(q["hall"])] = true
	for r in M.map.rooms:
		if d in [8, 10] and str(r["kind"]) == "normal" and int(r.get("path", 0)) < 0 and not held.has(int(r["id"])) and int(r["w"]) < 20:
			off_way[int(r["id"])] = true
	for r in M.map.rooms:
		if off_way.has(int(r["id"])):
			r = r.duplicate()
			r["kind"] = "second_way"
		elif str(r["kind"]) == "elite" and int(r.get("path", 0)) < 0:
			# (floor 19's armoury wing: a yellow pack's room off the way)
			r = r.duplicate()
			r["kind"] = "armoury_wing"
		elif not (str(r["kind"]) in ["treasure", "guardian"]):
			continue
		var c := Vector2(float(r["x"]) + float(r["w"]) / 2.0, float(r["y"]) + float(r["h"]) / 2.0)
		h.world = M._free_near(c + Vector2(1.5, 1.5))
		await M._wait(1.2)
		var near: int = M._monsters.list.filter(func(o): return is_instance_valid(o) and not o.dead and o.world.distance_to(c) < 8.0).size()
		_line(true, "its %s area at %.0f, %.0f: %d monsters near" % [r["kind"], c.x, c.y, near])
		M._hud.card = {}
		M.guide._speak = {}
		await M._wait(0.1)
		await M._snap("%s/f%d_%d_%s.png" % [dir, d, k, r["kind"]])
		k += 1
	# (floors 1 and 7: a fight along the way between areas, a pack in no room: the corridors' and the trail's new ones)
	if d in [1, 7]:
		var L2: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(M.dir_of(place) + "/layout.json"))
		var Mo2: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(M.dir_of(place) + "/monsters.json"))
		var at_of := {}
		for m in Mo2["monsters"]:
			if not m.get("boss", false):
				at_of[m["packId"]] = Vector2(float(m["x"]), float(m["y"]))
		var start := Vector2(float(L2["start"]["x"]), float(L2["start"]["y"]))
		var shot := 0
		for id in at_of:
			var at: Vector2 = at_of[id]
			if shot >= 2 or at.distance_to(start) < 30.0:
				continue
			if (L2["rooms"] as Array).any(func(r): return at.x >= float(r["x"]) and at.y >= float(r["y"]) and at.x < float(r["x"]) + float(r["w"]) and at.y < float(r["y"]) + float(r["h"])):
				continue
			h.world = M._free_near(at + Vector2(2.5, 2.5))
			await M._wait(1.2)
			M._hud.card = {}
			M.guide._speak = {}
			await M._wait(0.1)
			await M._snap("%s/f%d_%d_along.png" % [dir, d, k])
			_line(true, "a fight along the way at %.0f, %.0f" % [at.x, at.y])
			k += 1
			shot += 1
	# (floor 19: one of each of its two new kinds, the palace guard and the footmen, stood among)
	if d == 19:
		for kind in ["pguard", "footman"]:
			var one = null
			for o in M._monsters.list:
				if is_instance_valid(o) and not o.dead and o.kind == kind:
					one = o
					break
			_line(one != null, "its new kind %s on the floor" % kind)
			if one == null:
				continue
			h.world = M._free_near(one.world + Vector2(3.0, 3.0))
			await M._wait(1.2)
			M._hud.card = {}
			M.guide._speak = {}
			await M._wait(0.1)
			await M._snap("%s/f%d_%d_%s.png" % [dir, d, k, kind])
			k += 1
	# (`--at=x,y;x,y`: the hero set down at each such place and pictured, to look at a part of the floor)
	if M._arg("at") != "":
		for pair in M._arg("at").split(";"):
			var xy: PackedStringArray = str(pair).split(",")
			h.world = M._free_near(Vector2(float(xy[0]), float(xy[1])))
			await M._wait(1.0)
			M._hud.card = {}
			M.guide._speak = {}
			await M._wait(0.1)
			await M._snap("%s/f%d_at_%s_%s.png" % [dir, d, xy[0], xy[1]])
	# the large map, all of it seen
	if M.sight != null:
		M.sight.see_all()
	M._mini.show_panel("map")
	await M._wait(0.5)
	await M._snap("%s/f%d_%d_map.png" % [dir, d, k])
	M._mini.show_panel("")
	print("LEVELS2: %d checks, %s" % [n, "all OK" if bad.is_empty() else "WRONG: %s" % [bad]])
