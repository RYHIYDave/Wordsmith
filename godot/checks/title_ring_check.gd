## THE START SCREEN'S PICTURE ALIVE: the port's (scripts/title_ring.gd, laid up out of the game's own layers) against the game's own
## (art/title_ring.ts makeRingTitle life(t), flash(t)), the whole picture at a few moments of its life: before its first surge, the
## surge's light running up the column, its wave across the sky and its ring across the hill, the runes dying back, between surges,
## the second surge. Each picture's pixels compared: how many differ, and by how much at most (the game's canvas and the screen
## each round light added a little their own way: within a level or two is the same picture); and the flash.
##   node tools/godot_title.mjs --life <dir>
##   xvfb-run -a godot --path godot --rendering-driver opengl3 -s res://checks/title_ring_check.gd -- --dir=<dir>
extends SceneTree

const Ring := preload("res://scripts/title_ring.gd")


func _initialize() -> void:
	_run.call_deferred()


func _run() -> void:
	var dir := ""
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--dir="):
			dir = a.substr(6)
	var cases: Array = JSON.parse_string(FileAccess.get_file_as_string(dir + "/life.json"))
	var vp := SubViewport.new()
	vp.size = Vector2i(640, 360)
	vp.transparent_bg = false
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	root.add_child(vp)
	var ring := Ring.new()
	vp.add_child(ring)
	await process_frame
	var bad := 0
	for c in cases:
		var tt := float(c["t"])
		ring.at(tt)
		for i in 3:
			await process_frame
		await RenderingServer.frame_post_draw
		var img := vp.get_texture().get_image()
		img.convert(Image.FORMAT_RGBA8)
		img.save_png(dir + "/godot_%05.2f.png" % tt)
		var want := Marshalls.base64_to_raw(c["rgba"])
		var got := img.get_data()
		var off := 0
		var far := 0
		var most := 0
		for i in range(0, want.size(), 4):
			var d := maxi(maxi(absi(got[i] - want[i]), absi(got[i + 1] - want[i + 1])), absi(got[i + 2] - want[i + 2]))
			if d > 0:
				off += 1
			if d > 2:
				far += 1
			most = maxi(most, d)
		var fl: Array = ring.flash(tt)
		var fw: Array = c["flash"]
		var flash_ok := absf(float(fl[1]) - float(fw[1])) < 1e-6 and (float(fw[1]) == 0.0 or Ring.css(fl[0]).to_html(false) == _css_hex(str(fw[0])))
		var ok := far == 0 and flash_ok
		if not ok:
			bad += 1
		print("TITLE RING %s at %5.2f s: %d pixels differ, %d by more than 2 levels (at most %d); flash %.4f, the game's %.4f" % ["OK" if ok else "DIFFERS", tt, off, far, most, fl[1], fw[1]])
	print("TITLE RING CHECK: %d moments, %d differ" % [cases.size(), bad])
	quit(1 if bad > 0 else 0)


## (the game's css colour, "rgb(r,g,b)", as hex)
func _css_hex(s: String) -> String:
	var p := s.replace("rgb(", "").replace(")", "").split(",")
	return Color8(int(p[0]), int(p[1]), int(p[2])).to_html(false)
