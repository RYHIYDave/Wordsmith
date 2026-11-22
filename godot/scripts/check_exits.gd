## THE EXITS' NAMES (ways.gd EXIT_LABELS; game/exit_labels.ts): `--only=exits --shots=<dir>`. On floors 1, 3, 4, 5, 6, 11 and 17
## the boss struck dead, the way out let open, the hero set beside it: its name over it, the one the game gives it.
extends RefCounted

var M
var h
var dir := ""
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("EXITS %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	h.unhurt = true
	h.walked = 1000.0
	M.loot.taught = true
	var want := {1: "STAIRS", 3: "DOOR", 4: "CAVE", 5: "CAGE", 6: "STAIRS", 11: "GRATE", 17: "WAY ON"}
	for f in [1, 3, 4, 5, 6, 11, 17]:
		M.go_to("floor%d" % f, "start")
		await _wait(1.6)
		if M.sight != null:
			M.sight.see_all()
		var tw := 0.0
		while M.ways == null and M._stairs == null and tw < 4.0:
			await M.get_tree().process_frame
			tw += M.get_process_delta_time()
		var W = M.ways if M.ways != null else M._stairs
		if W == null:
			_line(false, "floor %d: no way out made" % f)
			continue
		for m in M._monsters.list:
			if is_instance_valid(m) and m.boss and not m.dead:
				m._die()
		M._monsters.boss_fell = true
		var t := 0.0
		while t < 8.0 and W.exit_labels().is_empty():
			await M.get_tree().process_frame
			t += M.get_process_delta_time()
		var labels: Array = W.exit_labels()
		var text: String = labels[0]["text"] if not labels.is_empty() else "(none)"
		_line(text == want[f], "floor %d (%s), its way out open after %.1f s: \"%s\"" % [f, W.way_kind() if W.has_method("way_kind") else "stair", t, text])
		if not labels.is_empty():
			# (the hero beside it, the rest of the floor's monsters put away, for the picture)
			for m in M._monsters.list:
				if is_instance_valid(m) and not m.dead:
					m.world = Vector2(-400, -400)
					m.state = "sleep"
					m._place()
			var at: Vector2 = labels[0]["at"]
			for r in [2.5, 3.0, 3.5, 2.0, 4.0]:
				var put := false
				for k in 8:
					var p: Vector2 = at + Vector2(cos(k * PI / 4.0), sin(k * PI / 4.0)) * r
					if h._clear(p.x, p.y):
						h.world = p
						put = true
						break
				if put:
					break
			await _wait(0.6)
			await M._snap(dir + "/exit_floor%02d.png" % f)
	print("EXITS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
