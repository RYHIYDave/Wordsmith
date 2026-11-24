## THE WARLOCK'S DEMON FROM EIGHT SIDES (the art chat's hand-over, docs/mockups/demon_eight/README.md; his "Yes, all eight are
## right (Recommended)", 22 Nov 2026): the bake held here (assets/heroes/warlock-demon*) read as the game reads it (baked_hero.gd):
## eight sides, every list as long on each as on the others, every frame's picture inside its sheet, and a sheet of it from all
## eight, in the screen's ways round, of its stand, its run, a slash, Damning and its burning out, drawn from the frames themselves
## (each hung from its anchor, as the game hangs it).
##   xvfb-run -a godot --path godot --rendering-driver opengl3 -s res://checks/demon_eight_check.gd -- --dir=<dir>
extends SceneTree

const BakedHero := preload("res://scripts/baked_hero.gd")
const DIR := "res://assets/heroes"
# (the screen's ways round, from facing the camera: the sides by name, as the game's order has them)
const ROUND := ["toward", "front", "side", "back", "away", "backL", "sideL", "frontL"]
# (what is pictured of each: [list, frame, name])
const ROWS := [[0, 0, "stand"], [2, 12, "run"], [14, 14, "slash"], [20, 24, "Damning"], [56, 120, "burning out"]]
const CELL := Vector2i(260, 250)
# (each picture at half its size: one sheet pixel a game pixel at the bake's two picture pixels to one)
const SHRINK := 0.5


func _init() -> void:
	var dir := "/tmp"
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--dir="):
			dir = a.substr(6)
	var wrong := 0
	var art = BakedHero.new(DIR, "warlock-demon", "demon")
	var n: int = art.sides()
	print("DEMON8 sides: %d" % n)
	if n != 8:
		wrong += 1
	# every list as long on each side as on the first
	var lens: Array = []
	for s in n:
		var per: Array = []
		for l in art._lists[s].size():
			per.append(art.count(s, l))
		lens.append(per)
	for s in n:
		if lens[s] != lens[0]:
			wrong += 1
			print("DEMON8 WRONG: %s's lists not as long as %s's" % [BakedHero.SIDES[s], BakedHero.SIDES[0]])
	# every frame inside its sheet: the sheets always held, then each pack's, one at a time
	var bad := 0
	for f in art._frames:
		var sz: Vector2 = art.sheets[int(f[0])].get_size()
		if f[1] + f[3] > sz.x or f[2] + f[4] > sz.y or f[3] <= 0 or f[4] <= 0:
			bad += 1
	var frames_packed := 0
	for pk in art._packs:
		var t: Texture2D = load("%s/%s" % [DIR, pk["sheet"]])
		if t == null:
			bad += 1
			continue
		var sz := t.get_size()
		for f in pk["frames"]:
			frames_packed += 1
			if f[0] + f[2] > sz.x or f[1] + f[3] > sz.y or f[2] <= 0 or f[3] <= 0:
				bad += 1
	print("DEMON8 frames: %d held, %d in %d packs; outside their sheets: %d" % [art._frames.size(), frames_packed, art._packs.size(), bad])
	wrong += bad
	# the sheet
	var img := Image.create(CELL.x * ROUND.size(), CELL.y * ROWS.size(), false, Image.FORMAT_RGBA8)
	img.fill(Color(0.09, 0.08, 0.11))
	for c in ROUND.size():
		var s := BakedHero.SIDES.find(ROUND[c])
		for r in ROWS.size():
			var row: Array = ROWS[r]
			var cnt: int = art.count(s, row[0])
			if cnt == 0:
				wrong += 1
				print("DEMON8 WRONG: no %s from %s" % [row[2], ROUND[c]])
				continue
			var g: Dictionary = art.frame(s, row[0], mini(row[1], cnt - 1))
			var at: AtlasTexture = g["tex"]
			var pic := at.atlas.get_image()
			if pic.is_compressed():
				pic.decompress()
			pic.convert(Image.FORMAT_RGBA8)
			var cut := pic.get_region(Rect2i(at.region))
			cut.resize(maxi(1, int(cut.get_width() * SHRINK)), maxi(1, int(cut.get_height() * SHRINK)), Image.INTERPOLATE_BILINEAR)
			# (its anchor at the cell's foot, middle)
			var foot := Vector2i(c * CELL.x + CELL.x / 2, r * CELL.y + CELL.y - 24)
			var off := Vector2i(Vector2(g["offset"]) * SHRINK)
			img.blend_rect(cut, Rect2i(Vector2i.ZERO, cut.get_size()), foot + off)
	img.save_png("%s/demon_eight_godot.png" % dir)
	print("DEMON8 sheet: %s/demon_eight_godot.png (sides across: %s; down: %s)" % [dir, ", ".join(ROUND), ", ".join(ROWS.map(func(x): return x[2]))])
	print("DEMON8 %s, %d wrong" % ["OK" if wrong == 0 else "WRONG", wrong])
	quit()
