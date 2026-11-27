## THE PLAYER'S SWEEP (his words, 27 Nov 2026, after a night of finds on his computer: “K I need you to go through the game and find
## fixes like these I made tonight”): `--only=sweep --shots=<dir> [--cls=<class>]`. What a player meets, not the rules beneath:
##   ARRIVALS: every way into every place (the towns, every floor, the endless town): set down on open floor, and able to walk off.
##   LEVELS: from level 1 up, each move opening with a level named in the news and the HUD's NEW MOVE as its plate names it.
## One line each, SWEEP; what is wrong pictured.
extends RefCounted

const Words := preload("res://scripts/words.gd")

var M
var h
var dir := ""
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("SWEEP %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	h.unhurt = true
	if OS.get_environment("WS_SWEEP_PART") != "levels":
		await _arrivals()
	if OS.get_environment("WS_SWEEP_PART") != "arrivals":
		await _levels()
	print("SWEEP: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## Each move held 0.4 s: how far he got the furthest.
func _walks() -> float:
	var best := 0.0
	for way in ["move_right", "move_down", "move_left", "move_up"]:
		var at: Vector2 = h.world
		Input.action_press(way)
		await M._wait(0.4)
		Input.action_release(way)
		await M._wait(0.1)
		best = maxf(best, h.world.distance_to(at))
		if best > 0.3:
			break
	return best


func _arrivals() -> void:
	var places: Array = [["town", "start"], ["town", "gate"], ["town", "way"], ["town", "cage"], ["town", "in_gate"],
		["camp", "start"], ["camp", "way"], ["camp", "in_gate"], ["rim", "start"], ["rim", "way"]]
	for f in range(1, M.FLOORS + 1):
		if M.has_floor(f):
			places.append(["floor%d" % f, "down"])
			places.append(["floor%d" % f, "way"])
	places.append(["floor1", "stairs"])
	for p in places:
		await M.go_to(p[0], p[1])
		await M._wait(1.2)
		if M.place != p[0]:
			_line(false, "%s by '%s': went to %s instead" % [p[0], p[1], M.place])
			continue
		var tx := floori(h.world.x)
		var ty := floori(h.world.y)
		var open_floor: bool = M.map.walkable(tx, ty)
		var went := await _walks()
		var ok := open_floor and went > 0.3
		_line(ok, "%s by '%s': set down at %s (open floor %s), walked %.2f tiles" % [p[0], p[1], h.world, open_floor, went])
		if not ok:
			M._snap(dir + "/sweep_%s_%s.png" % [p[0], p[1]])
			await M._wait(0.2)


func _levels() -> void:
	await M.go_to("floor1", "stairs")
	await M._wait(0.8)
	var L = M.loot
	var opens: Array = Words.data()["moveOpens"]
	var top := 1
	for i in opens.size():
		top = maxi(top, int(opens[i]))
	h.first_levels = true
	L.level = 1
	L.xp = 0
	h.loadout.level = 1
	for lv in range(2, top + 1):
		L.msgs.clear()
		M.move_toast = {}
		L.gain_xp(float(L.xp_to_next(L.level)) + 1.0)
		await M._wait(0.2)
		for i in range(1, opens.size()):
			if int(opens[i]) != lv:
				continue
			var said := ""
			for m in L.msgs:
				if str(m["text"]).begins_with("A new move"):
					said = str(m["text"])
			var plate: String = str(M._hud._skills()[i]["name"]).to_upper()
			var toast := ""
			if not M.move_toast.is_empty():
				toast = str(Words.skill(h.own_move_id(int(M.move_toast["skill"])))["name"]).to_upper()
			_line(said.contains(plate) and (toast == plate or int(M.move_toast.get("skill", -1)) != i), "%s, level %d: the news \"%s\", NEW MOVE %s, its plate %s" % [h.cls, lv, said, toast, plate])
