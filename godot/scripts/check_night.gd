## NIGHT IN THE TOWN AND ON FLOOR 1, PICTURED (night.gd: `--only=night --night=1 --shots=<dir>`, and `--night=0` for the day's, to
## set beside them). The town as he comes into it; its gate close, shut and barred; the gate unbarred and risen as he comes up to
## it (the way out beyond it); floor 1 as he comes down; floor 1 by one of its pools of light. Lines: what the night has done to
## each look's dark, daylight and gate (OK or WRONG).
extends RefCounted

const Night := preload("res://scripts/night.gd")
var M
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("NIGHT %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func run(main, h, dir: String) -> void:
	M = main
	var tag := "night" if Night.on else "day"
	await M._wait(1.4)
	var L = M.look
	await M._snap("%s/%s_1_town.png" % [dir, tag])
	if Night.on:
		var dk: Dictionary = L.data["dark"]
		var gate_light := false
		for l in L.data["lights"]:
			if str(l.get("of", "")) == "gate":
				gate_light = true
		_line(is_equal_approx(float(dk["a"]), float(Night.PLACES["town"]["dark"])) and not gate_light, "the town at night: its dark %.2f, blue %s; the light through its gate gone (%s)" % [float(dk["a"]), dk["rgb"], not gate_light])
		# (a pane of the windows' glass, cream by day: the moon's blue at night)
		var pane: Color = L._sheet.get_image().get_pixel(1038, 1998)
		_line(pane.to_html(false) == "aac4f6" and L._grade != null, "the windows' glass at night: %s (by day fff0c4); the moon's blue over the town %s" % [pane.to_html(false), L._grade != null])
	# (its gate, close: shut, barred)
	var T = M.town
	h.walked = 5.0
	var mid := Vector2(T._gate["middle"]["x"], T._gate["middle"]["y"])
	h.world = M._spot_near(mid + Vector2(2.5, 2.5), 1.2, h.world)
	await M._wait(0.8)
	await M._snap("%s/%s_2_gate_shut.png" % [dir, tag])
	# (unbarred, risen as he comes up to it)
	T.barred = false
	T.unbar = null
	h.world = M._spot_near(mid + Vector2(2.0, 2.0), 1.2, h.world)
	await M._wait(1.6)
	await M._snap("%s/%s_3_gate_risen.png" % [dir, tag])
	if Night.on:
		_line(T._port.size() > 0 and M.Perils._fx["films"].has("tgw_port_6"), "the gate in wood: its strips the wooden gate's films (%d strips, tgw_port_6 %s)" % [T._port.size(), M.Perils._fx["films"].has("tgw_port_6")])
	# (floor 1)
	M.loot.quest_given = true
	M.loot.taught = true
	M.go_to("floor1", "stairs")
	await M._wait(1.6)
	L = M.look
	await M._snap("%s/%s_4_floor1.png" % [dir, tag])
	# (by one of its pools of light, the nearest to where he came down)
	var best := Vector2.INF
	for it in L.data["items"]:
		if str(it.get("what", "")) == "daylight on the floor":
			var p := Vector2(float(it["x"]), float(it["y"]))
			if best == Vector2.INF or p.distance_to(Vector2(0, 0)) < best.distance_to(Vector2(0, 0)):
				best = p
	var pools: Array = []
	for it in L.data["items"]:
		if str(it.get("what", "")) == "daylight on the floor":
			pools.append(Vector2(float(it["x"]), float(it["y"])))
	if not pools.is_empty():
		var hs: Vector2 = M.Iso.to_screen(h.world.x, h.world.y) / 2.0
		pools.sort_custom(func(a, b): return a.distance_to(hs) < b.distance_to(hs))
		var p: Vector2 = pools[min(1, pools.size() - 1)]
		# (screen to the floor's tiles: x = (sx / 16 + sy / 8) / 2, y = (sy / 8 - sx / 16) / 2)
		var w := Vector2((p.x / 16.0 + p.y / 8.0) / 2.0, (p.y / 8.0 - p.x / 16.0) / 2.0)
		h.world = M._spot_near(w + Vector2(1.0, 1.0), 2.0, h.world)
		await M._wait(0.8)
		await M._snap("%s/%s_5_floor1_pool.png" % [dir, tag])
	if Night.on:
		var dk2: Dictionary = L.data["dark"]
		_line(is_equal_approx(float(dk2["a"]), float(Night.PLACES[L.place]["dark"])) and L._grade != null, "floor 1 at night (%s): its dark %.2f, blue %s; the moon's blue over it %s" % [L.place, float(dk2["a"]), dk2["rgb"], L._grade != null])
	# (THE MORNING: up the shaft from floor 5 (ways.gd), the town as by day, its gate still wood)
	if Night.on:
		M.loot.morning = true
		M.go_to("town", "cage")
		await M._wait(1.8)
		L = M.look
		await M._snap("%s/%s_6_morning_town.png" % [dir, tag])
		var dk3: Dictionary = L.data["dark"]
		var pane2: Color = L._sheet.get_image().get_pixel(1038, 1998)
		var gate_light2 := false
		for l in L.data["lights"]:
			if str(l.get("of", "")) == "gate":
				gate_light2 = true
		_line(not Night.now() and float(dk3["a"]) < 0.3 and L._grade == null and pane2.to_html(false) == "fff0c4" and not gate_light2, "the morning, up from floor 5: the town's dark %.2f (by day), no moon's blue (%s), its glass %s, no light through the shut wooden gate (%s)" % [float(dk3["a"]), L._grade == null, pane2.to_html(false), not gate_light2])
		T = M.town
		mid = Vector2(T._gate["middle"]["x"], T._gate["middle"]["y"])
		h.world = M._spot_near(mid + Vector2(2.5, 2.5), 1.2, h.world)
		await M._wait(0.8)
		await M._snap("%s/%s_7_morning_gate.png" % [dir, tag])
		_line(T._port.size() > 0 and Night.port_film(6) == "tgw_port_6" and M.Save.run_of(M).get("morning") == true, "the morning: the gate still wood (%s); the save keeps the morning (%s)" % [Night.port_film(6), M.Save.run_of(M).get("morning")])
		M.loot.morning = false
	print("NIGHT DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else ": " + str(bad)])
