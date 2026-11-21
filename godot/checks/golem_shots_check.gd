## THE GOLEM'S SHOTS THAT RUN ANY WAY: the port's painter (scripts/heroes/golem_paint.gd) against the game's own pictures of them
## (tools/godot_golem_shots.ts), pixel for pixel, and how long each takes to paint.
##   npx tsx tools/godot_golem_shots.ts <dir>
##   godot --headless --path godot -s res://checks/golem_shots_check.gd -- --dir=<dir>
extends SceneTree

const Paint := preload("res://scripts/heroes/golem_paint.gd")


func _init() -> void:
	var dir := ""
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--dir="):
			dir = a.substr(6)
	var cases: Array = JSON.parse_string(FileAccess.get_file_as_string(dir + "/shots.json"))
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/golem.json"))
	var paint = Paint.new(d["charge"])
	var bad := 0
	var worst := {}
	var zaps := {}
	for c in cases:
		var t0 := Time.get_ticks_usec()
		var got := {}
		match str(c["kind"]):
			"shell":
				got = paint.shell_flight(c["view"], c["flip"], c["dx"], c["dy"], int(c["k"]), int(c["n"]))
			"beam":
				got = paint.beam(c["view"], c["flip"], c["dx"], c["dy"], int(c["k"]))
			"zap":
				var key := "%s,%s" % [c["x"], c["y"]]
				if not zaps.has(key):
					zaps[key] = Paint.zap(float(c["x"]), float(c["y"]), float(c["up"]), c["to"])
				got = zaps[key][int(c["k"])]
		var ms := (Time.get_ticks_usec() - t0) / 1000.0
		var kind := str(c["kind"])
		worst[kind] = maxf(float(worst.get(kind, 0.0)), ms)
		var want := Marshalls.base64_to_raw(c["data"])
		var w: int = c["w"]
		var h: int = c["h"]
		var tag := "%s %s" % [kind, JSON.stringify({"view": c.get("view"), "flip": c.get("flip"), "dx": c.get("dx"), "dy": c.get("dy"), "k": c["k"]})]
		var is_empty := true
		for i in range(3, want.size(), 4):
			if want[i] != 0:
				is_empty = false
				break
		if got.is_empty():
			if not is_empty:
				print("DIFFERS %s: nothing painted, the game paints it" % tag)
				bad += 1
			continue
		var img: Image = got["img"]
		if img.get_width() != w or img.get_height() != h or absf(float(got["ax"]) - float(c["ax"])) > 1e-6 or absf(float(got["ay"]) - float(c["ay"])) > 1e-6:
			print("DIFFERS %s: %dx%d at %s,%s, the game's %dx%d at %s,%s" % [tag, img.get_width(), img.get_height(), got["ax"], got["ay"], w, h, c["ax"], c["ay"]])
			bad += 1
			continue
		var data := img.get_data()
		var off := 0
		for i in range(0, want.size(), 4):
			if data[i] != want[i] or data[i + 1] != want[i + 1] or data[i + 2] != want[i + 2] or data[i + 3] != want[i + 3]:
				off += 1
		if off > 0:
			print("DIFFERS %s: %d pixels of %d" % [tag, off, w * h])
			bad += 1
	print("GOLEM SHOTS CHECK: %d pictures, %d differ; slowest to paint (ms): %s" % [cases.size(), bad, JSON.stringify(worst)])
	quit(1 if bad > 0 else 0)
