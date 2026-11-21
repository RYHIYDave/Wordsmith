## THE SCARF, THE FEATHER AND THE BRAIDS (scripts/tails.gd), held against the game's own (engine/tails.ts). Run from the repository's
## root:
##   npx tsx tools/godot_tails_check.ts
##   godot --headless --path godot -s res://checks/tails_check.gd
## The first walks the game's Tails through a few seconds of a figure running, stopping, turning, warping and blown by a blast, and
## keeps what it paints at four moments (and where each point of each chain is); this walks Godot's through the same, a line a
## moment: how far its points are from the game's, and how many picture pixels of the two patches differ. (tails_check.json is not
## kept in the repository: it is made when wanted.)
extends SceneTree

const Tails := preload("res://scripts/tails.gd")


func _init() -> void:
	var path := "res://assets/heroes/tails_check.json"
	if not FileAccess.file_exists(path):
		print("TAILS CHECK: no tails_check.json: run `npx tsx tools/godot_tails_check.ts` first")
		quit(1)
		return
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	var defs: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/clips.json"))["tails"]
	var lines := 0
	var same := 0
	for c in data["cases"]:
		var t := Tails.new(defs)
		var kept: Array = c["kept"]
		var ki := 0
		for f in c["frames"].size():
			var fr: Dictionary = c["frames"][f]
			t.step(float(fr["dt"]), fr["roots"], float(fr["ax"]), float(fr["ay"]), float(fr["facing"]), float(fr["x"]), float(fr["y"]))
			if ki >= kept.size() or int(kept[ki]["f"]) != f:
				continue
			var k: Dictionary = kept[ki]
			ki += 1
			# (where the points are: the furthest any is from the game's, in game pixels)
			var far := 0.0
			var ids: Array = []
			for sh in k["shapes"]:
				ids.append(sh["id"])
				var ch = t.chains.get(sh["id"])
				if ch == null:
					far = INF
					continue
				var p: PackedFloat32Array = ch["p"]
				var pts: Array = sh["points"]
				for i in range(0, pts.size(), 2):
					far = maxf(far, absf(p[i] - t.ox - float(pts[i])) + absf(p[i + 1] - t.oy - float(pts[i + 1])))
			# (what is painted: each patch, pixel by pixel)
			var differ := 0
			var painted := 0
			for over in [false, true]:
				var want = k["paint"][1 if over else 0]
				var box := t.paint(over)
				if want == null:
					if box.size.x > 0:
						differ += box.size.x * box.size.y
					continue
				var b: Dictionary = want["box"]
				var wbox := Rect2i(int(b["x0"]), int(b["y0"]), int(b["x1"]) - int(b["x0"]) + 1, int(b["y1"]) - int(b["y0"]) + 1)
				if box != wbox:
					differ += wbox.size.x * wbox.size.y
					continue
				var px: Array = want["px"]
				var n := 0
				for py in range(wbox.position.y, wbox.end.y):
					for qx in range(wbox.position.x, wbox.end.x):
						var o := (py * Tails.PW + qx) * 4
						var got := (t.work[o] << 16) | (t.work[o + 1] << 8) | t.work[o + 2] if t.work[o + 3] != 0 else -1
						if got != int(px[n]):
							differ += 1
						if int(px[n]) != -1:
							painted += 1
						n += 1
			lines += 1
			var ok := far < 0.01 and differ == 0
			if ok:
				same += 1
			print("TAILS %s at frame %d (%s): points within %.5f of the game's; %d of %d painted pixels differ: %s" % [c["name"], f, ", ".join(ids), far, differ, painted, "OK" if ok else "WRONG"])
	print("TAILS CHECK: %d of %d as the game's" % [same, lines])
	quit(0 if same == lines else 1)
