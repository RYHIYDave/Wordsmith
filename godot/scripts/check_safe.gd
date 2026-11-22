## A PHONE'S NOTCH AND ROUNDED CORNERS (main.gd safe_insets, place_safe): `--only=safe --safe=L,T,R,B` (screen pixels, as a phone
## gives them). The HUD, the small map and the gear screen stand within the safe part; presses on the flask, the INVENTORY
## button and the pause button still land where they are now drawn, and not where they were; pictures of the HUD and the gear
## screen. With `--upright=1` too, a phone held upright.
extends RefCounted

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("SAFE %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	M.go_to("floor1", "start")
	await _wait(1.6)
	h.unhurt = true
	h.walked = 1000.0
	M.loot.taught = true
	var s: Dictionary = M.safe_insets()
	var hud = M._hud
	var mini = M._mini
	var inv = M._inv
	_line(s["l"] + s["t"] + s["r"] + s["b"] > 0.0, "the safe area's insets in game pixels: left %d, top %d, right %d, bottom %d" % [s["l"], s["t"], s["r"], s["b"]])
	var all_in := true
	for c in [hud, mini, inv]:
		all_in = all_in and is_equal_approx(c.position.x, s["l"] * 2.0) and is_equal_approx(c.position.y, s["t"] * 2.0) \
			and is_equal_approx(c.size.x, M.get_viewport().get_visible_rect().size.x - (s["l"] + s["r"]) * 2.0) \
			and is_equal_approx(c.size.y, M.get_viewport().get_visible_rect().size.y - (s["t"] + s["b"]) * 2.0)
	_line(all_in, "the HUD, the small map and the gear screen each stand within it: at %s, %s across" % [str(hud.position / 2.0), str(hud.size / 2.0)])
	await _wait(0.3)
	await M._snap(dir + "/safe_hud.png")
	# (the flask and the INVENTORY button, where they are drawn now, in the view's game pixels)
	var off: Vector2 = hud.position / 2.0
	var flask: Vector2 = hud._flask.get_center() + off
	var invb: Vector2 = hud._inv_button.get_center() + off
	_line(hud.claims(flask) and hud.claims(invb), "a press on the flask (%s) and on the INVENTORY button (%s), where they are now drawn: the HUD's" % [str(flask), str(invb)])
	var old_flask: Vector2 = hud._flask.get_center()
	_line(not hud.claims(old_flask) or s["l"] + s["b"] == 0.0, "a press where the flask was before (%s): not the flask's" % str(old_flask))
	var W := floorf(mini.size.x / 2.0)
	var pause: Vector2 = Vector2(W - 14 - 4 + 7, mini.MH + 7 + 6) + mini.position / 2.0
	_line(mini.claims(pause), "a press on the pause button where it is now drawn (%s): the small map's" % str(pause))
	# (the INVENTORY button pressed by a click there: the gear screen opens)
	var ev := InputEventMouseButton.new()
	ev.button_index = MOUSE_BUTTON_LEFT
	ev.pressed = true
	ev.position = invb * 2.0
	hud._input(ev)
	await _wait(0.5)
	_line(inv.visible, "a click on the INVENTORY button as drawn: the gear screen opens (%s)" % ("open" if inv.visible else "shut"))
	await M._snap(dir + "/safe_gear.png")
	if inv.visible:
		inv.toggle()
	print("SAFE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## PLAY UPRIGHT TAKEN OUT (main.gd UPRIGHT_ON, at his word): `--only=noupright`. With fingers, the pause panel and the start
## screen's OPTIONS no longer offer it, and the game is held sideways; pictured.
func noupright(main, hero, dir: String) -> void:
	M = main
	h = hero
	M.go_to("floor1", "start")
	await _wait(1.2)
	M._touch.on = true
	M._mini.show_panel("pause")
	await _wait(0.4)
	await M._snap(dir + "/pause_touch.png")
	var hits: Array = M._mini._hits.map(func(x): return x[1])
	_line(not hits.has("turn") and hits.has("aim"), "the pause panel with fingers: %s, no PLAY UPRIGHT" % ", ".join(PackedStringArray(hits)))
	M._mini.show_panel("")
	await _wait(0.2)
	var ts = M.title_up("floor1")
	ts.page = "options"
	await _wait(0.5)
	await M._snap(dir + "/options_touch.png")
	var ids: Array = ts._items().map(func(x): return x[0])
	_line(not ids.has("turn") and ids.has("aim"), "the start screen's OPTIONS with fingers: %s, no PLAY UPRIGHT" % ", ".join(PackedStringArray(ids)))
	_line(not M.upright, "the game held sideways (upright: %s)" % str(M.upright))
	print("NOUPRIGHT: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
