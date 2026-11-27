## UP FROM FLOOR 1 TO THE TOWN, AND WALKING ON (his words, 27 Nov 2026: “Coming back up the town from level 1 gets me stuck and I
## can't move”): `--only=townup --shots=<dir>`. Floor 1 come into by its gate, walked out of it the way he came: in the town by the
## top of its stairs; then each way held a second: how far he goes.
extends RefCounted

var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("TOWNUP %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func run(M, h, dir: String) -> void:
	h.unhurt = true
	await M.go_to("floor1", "stairs")
	await M._wait(1.0)
	var t0: Array = M._gate["tiles"][0]
	h.world = Vector2(float(t0[0]) + 0.5, float(t0[1]) + 0.5)
	h._place()
	var waited := 0.0
	while M.place != "town" and waited < 6.0:
		await M.get_tree().process_frame
		waited += M.get_process_delta_time()
	await M._wait(1.5)
	_line(M.place == "town", "walked into floor 1's gate: in %s at %s (paused %s)" % [M.place, h.world, M.get_tree().paused])
	M._snap(dir + "/town_up_1.png")
	await M._wait(0.2)
	for way in ["move_left", "move_right", "move_up", "move_down"]:
		var at: Vector2 = h.world
		Input.action_press(way)
		await M._wait(1.0)
		Input.action_release(way)
		await M._wait(0.2)
		_line(h.world.distance_to(at) > 0.5, "%s held a second: he went %.2f tiles (from %s to %s; scene_pace %s, alive %s, held %s)" % [way, h.world.distance_to(at), at, h.world, h.scene_pace, h.alive, h.get("held")])
	M._snap(dir + "/town_up_2.png")
	await M._wait(0.2)
	print("TOWNUP: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
