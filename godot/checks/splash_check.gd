## THE HANNAR MANOR GAMES SPLASH (scripts/splash.gd), checked: its film is there and is a film the game can play; it plays, about
## 6.6 s, then says it is done, and its black fades away (1.3 s) and it is gone; a tap skips it at once. A picture of it at 1.0 s,
## 2.6 s and 4.2 s into `--dir`, if given.
##   godot --headless --path godot -s res://checks/splash_check.gd
##   xvfb-run -a godot --path godot --rendering-driver opengl3 -s res://checks/splash_check.gd -- --dir=<dir>   (with pictures)
extends SceneTree

const Splash := preload("res://scripts/splash.gd")

var _bad := 0


func _initialize() -> void:
	_run.call_deferred()


func _say(ok: bool, what: String) -> void:
	print(("ok   " if ok else "FAIL ") + what)
	if not ok:
		_bad += 1


func _wait(s: float) -> void:
	var until := Time.get_ticks_msec() + int(s * 1000.0)
	while Time.get_ticks_msec() < until:
		await process_frame


func _run() -> void:
	var dir := ""
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--dir="):
			dir = a.substr(6)
	var film = load(Splash.FILM)
	_say(film is VideoStream, "the film %s loads as a film (%s)" % [Splash.FILM, film])
	# 1. played through
	var sp = Splash.new()
	var ended := [-1]
	var t0 := Time.get_ticks_msec()
	sp.done.connect(func() -> void: ended[0] = Time.get_ticks_msec() - t0)
	root.add_child(sp)
	await _wait(1.0)
	_say(sp.playing(), "playing 1 s in")
	if dir != "":
		for at in [1.0, 2.6, 4.2]:
			await _wait(at - float(Time.get_ticks_msec() - t0) / 1000.0)
			await RenderingServer.frame_post_draw
			root.get_texture().get_image().save_png(dir + "/splash_%.1f.png" % at)
	while ended[0] < 0 and Time.get_ticks_msec() - t0 < 10000:
		await process_frame
	_say(ended[0] >= 5800 and ended[0] <= 7600, "done after %.2f s (the film is 6.6 s)" % (ended[0] / 1000.0))
	await _wait(Splash.REVEAL + 0.4)
	_say(not is_instance_valid(sp), "gone %.1f s after (its black faded away)" % (Splash.REVEAL + 0.4))
	# 2. skipped by a tap
	var sp2 = Splash.new()
	var ended2 := [-1]
	sp2.done.connect(func() -> void: ended2[0] = 1)
	root.add_child(sp2)
	await _wait(0.5)
	var tap := InputEventMouseButton.new()
	tap.button_index = MOUSE_BUTTON_LEFT
	tap.pressed = true
	tap.position = Vector2(480, 270)
	Input.parse_input_event(tap)
	for i in 4:
		await process_frame
	_say(ended2[0] == 1, "a tap at 0.5 s skips it")
	print("SPLASH %s" % ("OK" if _bad == 0 else "%d FAILED" % _bad))
	quit(0 if _bad == 0 else 1)
