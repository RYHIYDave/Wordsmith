## STRONGHOLDS ON ANY ENDLESS LEVEL, THE CULT'S GATE AT THE MAP'S EDGE (act1/altar_rooms.gd): `--only=altarrooms --shots=<dir>`.
## With the switch on for the check: the story's floor 3, none; an endless level of floor 3, two gates, well apart, each in a wall at
## the map's edge (its court open floor, nothing walked behind it), with its altar, braziers and banners, its hall laid past the
## floor's south edge (the floor grown for it) and that hall's five waves of the floor's own packs; a word laid and the door opened:
## the altar gone and its tiles walked again; into the doorway, and he is at the far end of the hall's hallway, the floor's look put
## away and the hall's drawn, its first wave rising; its five waves one after another, then its reward; out by its threshold, and he
## is before the gate again, the floor drawn; an endless level of floor 7 keeps its own strongholds (no gate); an endless level of
## floor 13, the city's streets, its gates too. Pictures: the gate asleep, the altar's half of the gear screen, the door open, in the
## hall as the cult rises, the hall won, out before the open gate, a gate on floor 13.
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


## The monsters near a gate gone (none of its waves), the rest asleep.
func _quiet(q: Dictionary) -> void:
	var a := Vector2(q["altar"]["x"], q["altar"]["y"])
	for o in M._monsters.list.duplicate():
		if not is_instance_valid(o) or o.dead:
			continue
		if o.world.distance_to(a) < 12.0 and int(o.get("chained")) == 0:
			M._monsters.list.erase(o)
			o.queue_free()
		else:
			o.state = "sleep"


func _gates():
	var H = M.holds
	return H if H != null and is_instance_valid(H) and H.get_script() == AltarRooms else null


func _done(was: bool) -> void:
	M.altar_seed = -1
	M.in_endless = false
	AltarRooms.ON = was
	print("ALTARROOMS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


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
	if M._arg("cases") == "city":
		M.endless = 6
		M.in_endless = true
		await _city()
		_done(was)
		return
	if M._arg("cases") == "tour":
		M.endless = 6
		M.in_endless = true
		await _tour()
		_done(was)
		return
	# --- THE STORY'S FLOOR 3: none
	M.in_endless = false
	await _go("floor3")
	_line(_gates() == null and M.map.grown_from < 0, "the story's floor 3: no gate (%s), the floor not grown (%d rows)" % [str(M.holds), M.map.h])
	# --- AN ENDLESS LEVEL OF FLOOR 3: two, apart, each at the map's edge with its hall past the south edge and five waves
	M.endless = 6
	M.endless_floor = 3
	M.in_endless = true
	M.altar_seed = 3
	await _go("floor3")
	var R = _gates()
	var qs: Array = R.data["holds"] if R != null else []
	var apart := INF
	for i in qs.size():
		for j in range(i + 1, qs.size()):
			apart = minf(apart, Vector2(qs[i]["altar"]["x"], qs[i]["altar"]["y"]).distance_to(Vector2(qs[j]["altar"]["x"], qs[j]["altar"]["y"])))
	var fine := qs.all(func(q): return (q["waves"] as Array).size() == 5 and (q["waves"] as Array).all(func(W): return not (W["monsters"] as Array).is_empty()))
	_line(R != null and qs.size() == AltarRooms.N and apart >= AltarRooms.APART and fine,
		"an endless level of floor 3: %d gates, %.1f tiles apart, each five waves (%s monsters)" % [qs.size(), apart, ", ".join(PackedStringArray(qs.map(func(q): return "/".join(PackedStringArray((q["waves"] as Array).map(func(W): return str((W["monsters"] as Array).size())))))))])
	if R == null or qs.is_empty():
		_done(was)
		return
	# (each at the map's edge: its court open, nothing walked behind it; its hall past the floor's own south edge, walked inside)
	var edge := true
	var beyond := true
	for q in qs:
		var gx := int(q["gx"])
		var gy := int(q["gy"])
		for a2 in range(-3, 3):
			for b2 in range(-4, 0):
				var t2: Vector2i = R._gt(bool(q["turned"]), gx, gy, a2, b2)
				if M.map.walkable(t2.x, t2.y):
					edge = false
		var I: Dictionary = q["inside"]
		var E: Dictionary = q["entry"]
		if float(I["y"]) < M.map.grown_from or not M.map.walkable(floori(float(E["x"])), floori(float(E["y"]))) or not M.map.walkable(floori(float(q["fight"]["x"])), floori(float(q["fight"]["y"]))):
			beyond = false
	_line(edge and beyond and M.map.grown_from > 0, "each gate in a wall with nothing walked behind it (%s); each hall past the floor's south edge (row %d, the floor now %d rows), walked inside (%s): %s" % [edge, M.map.grown_from, M.map.h, beyond, ", ".join(PackedStringArray(qs.map(func(q): return "%s at (%d, %d)%s, hall %s" % [q["look"], int(q["gx"]), int(q["gy"]), " in a wall along y" if q["turned"] else "", str(q["shift"])])))])
	var q0: Dictionary = qs[0]
	var gx0 := int(q0["gx"])
	var gy0 := int(q0["gy"])
	var turned0 := bool(q0["turned"])
	var at0: Array = R._altar_tiles(q0)
	var a := Vector2(q0["altar"]["x"], q0["altar"]["y"])
	var P: Dictionary = R._pieces[0]
	_line((P["gate"] as Array).size() >= 8 and P["altar"] != null and (P["stand"] as Array).size() >= 1 and not M.map.walkable(at0[0].x, at0[0].y) and not M.map.walkable(at0[1].x, at0[1].y),
		"gate 0: its gatehouse in %d strips, its altar, %d braziers and banners, %d flagstones; the altar's tiles not walked through" % [(P["gate"] as Array).size(), (P["stand"] as Array).size(), (P["flags"] as Array).size()])
	# (a quiet picture: what was near the gate gone, the rest of the floor's asleep, the floor's name gone by)
	_quiet(q0)
	await _wait(3.0)
	h.world = M._spot_near(R._gw(turned0, gx0, gy0, 1.2, 1.9), 0.6, h.world)
	h.face = Vector2(-0.7071, -0.7071)
	await _wait(0.6)
	await M._snap(dir + "/g01_gate_asleep.png")
	var near: int = R.altar_near()
	await _wait(0.1)
	_line(near == 0 and str(R.prompt[0]).begins_with("E: Altar"), "beside it: '%s' (altar %d; he at %s, it at %s)" % [R.prompt[0], near, str(h.world), str(a)])
	# --- THE ALTAR'S HALF: a word laid
	M.loot.words["fire"] = 1
	M._inv.open_altar(0, R)
	var no: String = R.lay(0, "fire")
	await _wait(0.3)
	await M._snap(dir + "/g02_altar_half.png")
	_line(no == "" and R.st[0]["words"] == ["fire"], "FLAME laid on it ('%s'): %s" % [no, str(R.st[0]["words"])])
	M._inv.toggle()
	await _wait(0.2)
	# --- OPEN THE DOOR: the seal broken, the altar gone
	var opened: bool = R.open_door(0)
	await _wait(1.0)
	await M._snap(dir + "/g03_door_open.png")
	_line(opened and R.st[0]["open"] and P["altar"] == null and M.map.walkable(at0[0].x, at0[0].y) and M.map.walkable(at0[1].x, at0[1].y),
		"the door opened: the altar gone, its tiles walked again (%s)" % M.map.walkable(at0[0].x, at0[0].y))
	# --- INTO THE DOORWAY: in the hall, the floor put away, its first wave rising
	h.world = R._gw(turned0, gx0, gy0, -0.5, 0.4)
	await _wait(1.6)
	var I0: Dictionary = q0["inside"]
	var W0: Dictionary = q0["way"]
	var in_hall: bool = R._in_hold(q0, h.world)
	var mask: int = M.get_viewport().canvas_cull_mask
	_line(in_hall and R.inside == 0 and (mask & (1 << R.FLOOR_BIT)) == 0 and (mask & (1 << R._hall_bit(0))) != 0 and int(R.st[0]["wave"]) == 1,
		"through the door: in the hall at %s (%s), the floor's look put away and the hall's drawn (mask %x), wave %d" % [str(h.world), in_hall, mask, int(R.st[0]["wave"])])
	await _wait(0.6)
	await M._snap(dir + "/g04_in_the_hall_rising.png")
	# --- ITS FIVE WAVES, each slain as it comes; then its reward
	var seen: Array = []
	var t := 0.0
	while not R.st[0]["won"] and t < 60.0:
		var s: Dictionary = R.st[0]
		if not seen.has(int(s["wave"])):
			seen.append(int(s["wave"]))
		for o in M._monsters.list.duplicate():
			if is_instance_valid(o) and not o.dead and (s["packs"] as Array).has(o.pack_id):
				o.damage(1e7, "phys")
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
	await _wait(0.8)
	await M._snap(dir + "/g05_hall_won.png")
	_line(R.st[0]["won"] and seen == [1, 2, 3, 4, 5], "its waves came %s; won %s in %.1f s" % [str(seen), R.st[0]["won"], t])
	# --- OUT BY ITS THRESHOLD: before the gate again, the floor drawn
	h.world = Vector2(float(W0["x"]) + float(W0["w"]) / 2.0, float(W0["y"]) + float(W0["h"]) - 0.3)
	await _wait(1.6)
	var out_at: Vector2 = h.world
	mask = M.get_viewport().canvas_cull_mask
	_line(out_at.distance_to(R._out_at(q0)) < 1.0 and R.inside == -1 and (mask & (1 << R.FLOOR_BIT)) != 0 and (mask & (1 << R._hall_bit(0))) == 0,
		"out by the threshold: before the gate at %s, the floor drawn again (mask %x)" % [str(out_at), mask])
	h.world = M._spot_near(R._gw(turned0, gx0, gy0, 1.6, 2.6), 1.2, h.world)
	await _wait(0.6)
	await M._snap(dir + "/g06_out_door_open.png")
	if M._arg("cases") == "gate":
		_done(was)
		return
	# --- AN ENDLESS LEVEL OF FLOOR 7: its own strongholds
	M.endless_floor = 7
	await _go("floor7")
	_line(M.holds != null and _gates() == null and M.holds.data["holds"].size() >= 1 and M.quest610.rooms == null and M.map.grown_from < 0,
		"an endless level of floor 7: its own strongholds (%d), no gate, the floor not grown" % (M.holds.data["holds"].size() if M.holds != null else 0))
	await _city()
	_done(was)


## An endless level of floor 13, the city's streets: its gates too, at the edge of its open ground.
func _city() -> void:
	var dir: String = M._arg("shots")
	M.endless_floor = 13
	M.altar_seed = 5
	await _go("floor13")
	var R13 = _gates()
	var q13: Array = R13.data["holds"] if R13 != null else []
	_line(q13.size() == AltarRooms.N, "an endless level of floor 13: %d gates" % q13.size())
	if not q13.is_empty():
		_quiet(q13[0])
		h.world = M._spot_near(R13._gw(bool(q13[0]["turned"]), int(q13[0]["gx"]), int(q13[0]["gy"]), 1.4, 2.3), 1.2, h.world)
		h.face = Vector2(-0.7071, -0.7071)
		await _wait(6.0)
		_quiet(q13[0])
		await _wait(0.5)
		await M._snap(dir + "/g07_floor13_gate.png")


## (pictures for his yes: a gate on more of the floors, each as he comes up to it, in either way its wall runs)
func _tour() -> void:
	var dir: String = M._arg("shots")
	for e in [[3, 3, 1], [17, 4, 0], [19, 2, 0], [1, 6, 0], [15, 3, 0]]:
		M.endless_floor = int(e[0])
		M.altar_seed = int(e[1])
		await _go("floor%d" % int(e[0]))
		var R = _gates()
		var qs: Array = R.data["holds"] if R != null else []
		_line(not qs.is_empty(), "an endless level of floor %d: %d gates (%s)" % [int(e[0]), qs.size(), ", ".join(PackedStringArray(qs.map(func(q): return "(%d, %d)%s" % [int(q["gx"]), int(q["gy"]), " along y" if q["turned"] else ""])))])
		if qs.size() <= int(e[2]):
			continue
		var q: Dictionary = qs[int(e[2])]
		_quiet(q)
		h.world = M._spot_near(R._gw(bool(q["turned"]), int(q["gx"]), int(q["gy"]), 1.2, 2.2), 0.8, h.world)
		h.face = Vector2(-0.7071, -0.7071)
		await _wait(5.0)
		_quiet(q)
		await _wait(0.5)
		await M._snap(dir + "/t_floor%d_gate%d.png" % [int(e[0]), int(e[2])])
