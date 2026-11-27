## HIS COMPUTER'S FINDINGS, 27 Nov 2026, CHECKED: `--only=pcfixes --shots=<dir>`.
##   BARRIER ONLY WITH BARRIER ON HIS GEAR (“if you have no barrier on gear i dont think you should have just because you have 1 point
##   of int”): a hero with Intelligence and no barrier on his gear has none; a cloth piece on, he has it, his Intelligence adding.
##   AUTO AIM WITH A MOUSE (“and no options for targetting like auto aim”): the pause panel's ATTACKS switch on a computer; on AUTO
##   AIM his blows go at the enemy locked onto (the hero's aim set to it), on WHERE YOU POINT at the mouse (none set).
extends RefCounted

var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("PCFIX %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func run(M, h, dir: String) -> void:
	h.unhurt = true
	M.go_to("floor2", "down")
	await M._wait(1.2)
	# BARRIER
	M.loot.derive()
	var intel: float = float(h.stats["int"])
	_line(h.max_barrier == 0.0 and intel > 0.0, "no barrier on his gear, Intelligence %d: barrier %d" % [intel, h.max_barrier])
	# (a cloth piece of the floor's own, a Cowl, laid on his head)
	var it := _cloth("res://assets/loot/depth/1.json")
	if not it.is_empty():
		var before = M.loot.gear.get("helm")
		M.loot.gear["helm"] = it
		M.loot.derive()
		_line(h.max_barrier > 0.0, "a %s on: barrier %d" % [it.get("name"), h.max_barrier])
		M.loot.gear["helm"] = before
		M.loot.derive()
	else:
		_line(false, "no cloth helm found in the floor's pieces")
	# AUTO AIM WITH A MOUSE
	var T = M._touch
	T.on = false
	var was: String = T.mouse_aim
	T.mouse_aim = "auto"
	var m = null
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead:
			m = o
			break
	if m != null:
		m.seen = true
		m.state = "hunt"
		h.world = m.world + Vector2(2.5, 0.0)
		h._place()
	await M._wait(0.4)
	_line(h.touch_aim.has(0) and m != null and (h.touch_aim[0] as Vector2).distance_to(m.world) < 3.0, "AUTO AIM: his blows go at the one locked onto (%s)" % [h.touch_aim.get(0)])
	M._mini.show_panel("pause")
	await M._wait(0.3)
	M._snap(dir + "/pause_auto_aim.png")
	await M._wait(0.2)
	M._mini.show_panel("")
	T.mouse_aim = "point"
	await M._wait(0.3)
	_line(h.touch_aim.is_empty(), "WHERE YOU POINT: his blows go where the mouse points (none set: %s)" % [h.touch_aim])
	T.mouse_aim = was
	print("PCFIX: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## The first cloth helm among a floor's pieces.
func _cloth(path: String) -> Dictionary:
	const L := preload("res://scripts/loot.gd")
	var stack: Array = [JSON.parse_string(FileAccess.get_file_as_string(path))]
	while not stack.is_empty():
		var x = stack.pop_back()
		if x is Dictionary:
			if x.has("slot") and str(x["slot"]) == "helm" and L.base_family(x) == "cloth":
				return x
			for v in x.values():
				stack.append(v)
		elif x is Array:
			for v in x:
				stack.append(v)
	return {}
