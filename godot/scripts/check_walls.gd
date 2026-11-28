## SHOT MODE, EVERY WALL OF A FLOOR (--only=walls --floor=N): the whole floor as the look draws it, every tile seen, without its
## dark, its vignette and the screen's writing, the camera stepped across it a screen at a time (at half the game's size) and
## each step pictured, so that the pictures put together show every wall it has (his question, 28 Nov 2026: “If I boot up the
## game and play the first level, every single wall will be in place?”). The hero is put far off, so that no wall fades round
## him; the monsters are put out of the way. Its pictures: <dir>/walls_f<N>_<i>_<j>.png and walls_f<N>.json (where each was taken).
extends RefCounted

const ZOOM := 0.5


func run(M, h, dir: String) -> void:
	var f := int(M._arg("floor")) if M._arg("floor") != "" else 1
	if M.place != "floor%d" % f:
		await M.go_to("floor%d" % f, "down" if f > 1 else "stairs")
	await M._wait(2.0)
	for m in M._monsters.list:
		if is_instance_valid(m):
			m.world = Vector2(-500, -500)
			m.state = "sleep"
	var L = M.look
	if L == null:
		print("WALLS floor %d: no look" % f)
		return
	L.reveal_all()
	# (nothing over the pictures: the dark, the vignette, the screen's writing)
	if L._dark != null:
		L._dark.visible = false
	if M._veil != null:
		M._veil.visible = false
	if M._hud != null and M._hud is CanvasItem:
		M._hud.visible = false
	for c in M.get_children():
		if c is CanvasLayer and c.layer > 0:
			c.visible = false
	# (the hero far off the floor: no wall fades round him)
	h.world = Vector2(-400, -400)
	h.position = M.Iso.to_screen(-400, -400)
	await M._wait(0.5)
	var cam: Camera2D = M.get_viewport().get_camera_2d()
	cam.top_level = true
	cam.zoom = Vector2(ZOOM, ZOOM)
	cam.offset = Vector2.ZERO
	# (the floor's corners on the screen, picture pixels)
	var lo := Vector2(INF, INF)
	var hi := Vector2(-INF, -INF)
	for c in [Vector2(0, 0), Vector2(M.map.w, 0), Vector2(0, M.map.h), Vector2(M.map.w, M.map.h)]:
		var p: Vector2 = M.Iso.to_screen(c.x, c.y)
		lo = lo.min(p)
		hi = hi.max(p)
	lo.y -= 260.0
	var view: Vector2 = M.get_viewport().get_visible_rect().size / ZOOM
	var shots: Array = []
	var j := 0
	var y := lo.y + view.y / 2.0
	while y - view.y / 2.0 < hi.y:
		var i := 0
		var x := lo.x + view.x / 2.0
		while x - view.x / 2.0 < hi.x:
			cam.global_position = Vector2(x, y)
			await M._wait(0.25)
			var path := "%s/walls_f%d_%d_%d.png" % [dir, f, i, j]
			await M._snap(path)
			shots.append([i, j, x - view.x / 2.0, y - view.y / 2.0])
			x += view.x
			i += 1
		y += view.y
		j += 1
	var fh := FileAccess.open("%s/walls_f%d.json" % [dir, f], FileAccess.WRITE)
	fh.store_string(JSON.stringify({"floor": f, "zoom": ZOOM, "view": [view.x, view.y], "shots": shots}))
	fh.close()
	print("WALLS floor %d: %d pictures" % [f, shots.size()])
