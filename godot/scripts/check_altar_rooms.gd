## STRONGHOLDS ON ANY ENDLESS LEVEL, THE CULT'S ALTAR ROOM (act1/altar_rooms.gd): `--only=altarrooms --shots=<dir>`. With the
## switch on for the check: the story's floor 3, none; an endless level of floor 3, two altar rooms, well apart, each with its
## altar, braziers and banners and five waves of the floor's own packs; a word laid and the altar woken: fire in every doorway (wall
## to whatever walks), its first wave rising; its five waves one after another, then its reward and the fire gone, the doorways open
## again; an endless level of floor 7 keeps its own strongholds (none of these); an endless level of floor 13, two, away from the
## Bells. Pictures: the room asleep, the altar's half of the gear screen, the fire up and the cult rising, the room won.
extends RefCounted

const AltarRooms := preload("res://scripts/act1/altar_rooms.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("ALTARROOMS %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func _go(where: String) -> void:
	await M.go_to(where, "start")
	await _wait(0.8)
	if M.sight != null:
		M.sight.see_all()


## The monsters in an altar's room or ring gone (none of its waves yet), the rest asleep.
func _quiet(q: Dictionary) -> void:
	var r: Dictionary = q["room"]
	var box := Rect2(float(r["x"]) - 1.0, float(r["y"]) - 1.0, float(r["w"]) + 2.0, float(r["h"]) + 2.0)
	for o in M._monsters.list.duplicate():
		if not is_instance_valid(o) or o.dead:
			continue
		if box.has_point(o.world) and int(o.get("chained")) == 0:
			M._monsters.list.erase(o)
			o.queue_free()
		else:
			o.state = "sleep"


func _rooms():
	var H = M.holds
	return H if H != null and is_instance_valid(H) and H.get("altar_room") == true else null


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	var was: bool = AltarRooms.ON
	AltarRooms.ON = true
	h.unhurt = true
	M.loot.ring_lit = true
	M.loot.taught = true
	# (every move open already: no NEW MOVE moment holding the game while the waves come)
	M.loot.level = 20
	M.loot.derive()
	# --- THE STORY'S FLOOR 3: none
	M.in_endless = false
	await _go("floor3")
	_line(_rooms() == null, "the story's floor 3: no altar room (%s)" % str(M.holds))
	# --- AN ENDLESS LEVEL OF FLOOR 3: two, apart, each with its pieces and five waves
	M.endless = 6
	M.endless_floor = 3
	M.in_endless = true
	M.altar_seed = 3
	await _go("floor3")
	var R = _rooms()
	var qs: Array = R.data["holds"] if R != null else []
	var apart := INF
	for i in qs.size():
		for j in range(i + 1, qs.size()):
			apart = minf(apart, Vector2(qs[i]["altar"]["x"], qs[i]["altar"]["y"]).distance_to(Vector2(qs[j]["altar"]["x"], qs[j]["altar"]["y"])))
	var fine := qs.all(func(q): return (q["waves"] as Array).size() == 5 and (q["waves"] as Array).all(func(W): return not (W["monsters"] as Array).is_empty()) and not (q["ways"] as Array).is_empty())
	_line(R != null and qs.size() == AltarRooms.N and apart >= AltarRooms.APART and fine,
		"an endless level of floor 3: %d altar rooms, %.1f tiles apart, each five waves (%s monsters) and doorways (%s)" % [qs.size(), apart, ", ".join(PackedStringArray(qs.map(func(q): return "/".join(PackedStringArray((q["waves"] as Array).map(func(W): return str((W["monsters"] as Array).size()))))))), ", ".join(PackedStringArray(qs.map(func(q): return str((q["ways"] as Array).size()))))])
	if R == null or qs.is_empty():
		print("ALTARROOMS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
		AltarRooms.ON = was
		return
	var q0: Dictionary = qs[0]
	var a := Vector2(q0["altar"]["x"], q0["altar"]["y"])
	var stood: int = R._pieces[0]["stand"].size()
	_line(stood >= 3 and not M.map.walkable(int(q0["gx"]), int(q0["gy"])), "room 0: its altar, braziers and banners standing (%d pieces), the altar's tiles not walked through" % stood)
	# (a quiet picture: the room's own pack gone, the rest of the floor's asleep, the floor's name gone by)
	_quiet(q0)
	await _wait(3.0)
	h.world = M._spot_near(a + Vector2(0.4, 1.6), 1.2, h.world)
	await _wait(0.6)
	await M._snap(dir + "/r01_altar_room_asleep.png")
	var near: int = R.altar_near()
	await _wait(0.1)
	_line(near == 0 and str(R.prompt[0]).begins_with("E: Altar"), "beside it: '%s' (altar %d)" % [R.prompt[0], near])
	# --- THE ALTAR'S HALF: a word laid
	M.loot.words["fire"] = 1
	M.loot.words["swift"] = 1
	M._inv.open_altar(0, R)
	var no: String = R.lay(0, "fire")
	await _wait(0.3)
	await M._snap(dir + "/r02_altar_half.png")
	_line(no == "" and R.st[0]["words"] == ["fire"], "FLAME laid on it ('%s'): %s" % [no, str(R.st[0]["words"])])
	M._inv.toggle()
	await _wait(0.2)
	# --- WOKEN: fire in every doorway, the first wave rising
	var woke: bool = R.open_door(0)
	await _wait(1.0)
	var ways: Array = q0["ways"]
	var shut: bool = ways.all(func(t): return not M.map.walkable(t.x, t.y))
	await M._snap(dir + "/r03_fire_up_cult_rising.png")
	_line(woke and shut and R._pieces[0]["ward"].size() == ways.size() * 2 and int(R.st[0]["wave"]) == 1, "woken: fire in all %d doorway tiles (%s), wave %d" % [ways.size(), shut, int(R.st[0]["wave"])])
	# --- ITS FIVE WAVES, each slain as it comes; then its reward, the fire gone
	var seen: Array = []
	var t := 0.0
	var shot := false
	while not R.st[0]["won"] and t < 60.0:
		var s: Dictionary = R.st[0]
		if not seen.has(int(s["wave"])):
			seen.append(int(s["wave"]))
		if int(s["wave"]) == 3 and not shot and not R._risers.is_empty():
			shot = true
			await M._snap(dir + "/r04_wave_three_rising.png")
		for o in M._monsters.list.duplicate():
			if is_instance_valid(o) and not o.dead and (s["packs"] as Array).has(o.pack_id):
				o.damage(1e7, "phys")
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
	if not R.st[0]["won"]:
		var s0: Dictionary = R.st[0]
		print("ALTARROOMS stuck: wave %d, coming %s, packs %s, risers %d, later %d" % [int(s0["wave"]), s0["coming"], str(s0["packs"]), R._risers.size(), R._later.size()])
		for o in M._monsters.list:
			if is_instance_valid(o) and (s0["packs"] as Array).has(o.pack_id):
				print("ALTARROOMS   %s pack %d dead %s life %.0f/%.0f state %s at %s" % [o.kind, o.pack_id, o.dead, o.life, o.max_life, o.state, str(o.world)])
	await _wait(0.8)
	var open: bool = ways.all(func(t2): return M.map.walkable(t2.x, t2.y))
	await M._snap(dir + "/r05_room_won.png")
	_line(R.st[0]["won"] and seen == [1, 2, 3, 4, 5] and open and R._pieces[0]["ward"].is_empty(),
		"its waves came %s; won %s in %.1f s, the fire gone and the doorways open again %s" % [str(seen), R.st[0]["won"], t, open])
	if M._arg("cases") == "room":
		AltarRooms.ON = was
		M.in_endless = false
		print("ALTARROOMS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
		return
	# --- AN ENDLESS LEVEL OF FLOOR 7: its own strongholds
	M.endless_floor = 7
	await _go("floor7")
	_line(M.holds != null and M.holds.get("altar_room") == null and M.holds.data["holds"].size() >= 1, "an endless level of floor 7: its own strongholds (%d), no altar room" % (M.holds.data["holds"].size() if M.holds != null else 0))
	# --- AN ENDLESS LEVEL OF FLOOR 13: two, away from the Bells
	M.endless_floor = 13
	M.altar_seed = 5
	await _go("floor13")
	var R13 = _rooms()
	var q13: Array = R13.data["holds"] if R13 != null else []
	_line(q13.size() == AltarRooms.N, "an endless level of floor 13: %d altar rooms" % q13.size())
	if not q13.is_empty():
		h.world = M._spot_near(Vector2(q13[0]["altar"]["x"], q13[0]["altar"]["y"]) + Vector2(0.4, 1.6), 1.2, h.world)
		_quiet(q13[0])
		await _wait(3.0)
		await M._snap(dir + "/r06_floor13_asleep.png")
		M.loot.words["frost"] = 1
		R13.lay(0, "frost")
		R13.open_door(0)
		await _wait(1.2)
		await M._snap(dir + "/r07_floor13_ring_up.png")
	_line(q13.is_empty() or q13[0].get("ring", false) == true, "floor 13's streets have no room that closes: a ring of fire there (%s), %d tiles of it" % [str(q13[0].get("ring", false)) if not q13.is_empty() else "-", (q13[0]["ways"] as Array).size() if not q13.is_empty() else 0])
	M.altar_seed = -1
	M.in_endless = false
	AltarRooms.ON = was
	print("ALTARROOMS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
