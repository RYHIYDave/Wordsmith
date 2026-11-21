## THE SMALL MAP, top right, and what it opens (ui/hud.ts minimap, wayMarks, drawMap; ui/panels.ts drawPause; main.ts), in
## game pixels (two picture pixels to one), in the HUD's own colours and letters (hud.gd):
##   THE SMALL MAP: the floor round him, a tile a pixel (a tile to the right is one pixel right and half a pixel down, as the
##     floor lies on the screen), what he has seen (sight.gd): floor in sight bright, floor seen before dim, wall dark; and on
##     it the waypoint (bright once awake), the town's gate, floor 1's gate home, the stairwell once it opens, chests seen and
##     not yet opened, the fallen wordsmith until he is searched, the monsters in sight (the boss, a champion, an elite, and
##     whoever is awake), and him in white.
##   THE LARGE MAP (M, or a press on the small one; not in town): everything seen so far, as large as fits (up to three
##     times), with its legend; the game is held while it is open, and a click or M closes it.
##   THE PAUSE BUTTON under the small map, and Esc (a controller's START): the game held, the controls as a short table,
##     RESUME and the sound on or off. (The game's third button, END RUN, waits for the title screen.) Esc also closes the
##     gear screen, as in the game.
extends Control

const PF := preload("res://scripts/pixel_font.gd")
const FloorMap := preload("res://scripts/floor_map.gd")

## (hud.ts minimap: how far round him the small map looks, in tiles; its height)
const R := 36
const MH := 46.0
## (what the port's keys do: panels.ts drawPause's table, for the keys this version has)
const HELP := [["MOVE", "WASD"], ["ATTACK", "left button"], ["SLOW ATTACK", "right button"], ["EVADE", "Space"], ["FLASK", "Q"], ["INTERACT", "E"], ["INVENTORY", "Tab"], ["MAP", "M"]]

var main  # main.gd
var hud  # hud.gd: its colours
var inv  # inventory.gd
## ("": the game goes on; "map": the large map; "pause": the pause panel; "death": a fallen hero's screen, main.gd death_info)
var open := ""

var T := {}
var P := {}
var _t := 0.0
var _img: Image
var _tex: ImageTexture
var _key := ""
## (the large map: everything seen so far, added to as he sees more: hud.ts chartFor)
var _chart: Image
var _chart_tex: ImageTexture
var _chart_of = null
var _done := PackedByteArray()
var _x0 := 0
var _y0 := 0
var _x1 := -1
var _y1 := -1
var _resume_at := -1
var _hits: Array = []
var _enter_was := true


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	process_mode = Node.PROCESS_MODE_ALWAYS
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	for pair in [["map", KEY_M], ["pause", KEY_ESCAPE]]:
		if not InputMap.has_action(pair[0]):
			InputMap.add_action(pair[0])
			var e := InputEventKey.new()
			e.physical_keycode = pair[1]
			InputMap.action_add_event(pair[0], e)
	var b := InputEventJoypadButton.new()
	b.button_index = JOY_BUTTON_START
	InputMap.action_add_event("pause", b)


func _process(dt: float) -> void:
	_t += dt
	if main == null or main.hero == null:
		return
	# (a press that closed a panel lets the game go on the frame after, so that it is not a blow as well)
	if _resume_at >= 0 and Engine.get_process_frames() > _resume_at:
		_resume_at = -1
		if open == "" and (inv == null or not inv.visible):
			get_tree().paused = false
	if inv != null and inv.visible:
		# (the gear screen is up, and holds the game itself: Esc closes it, as in the game)
		open = ""
		if Input.is_action_just_pressed("pause"):
			inv.toggle()
	elif open == "death":
		# (the fallen hero's screen: Enter presses its button, as in the game, but not one already held as it came up; Esc does
		# nothing)
		var enter := Input.is_key_pressed(KEY_ENTER)
		if (enter and not _enter_was) or Input.is_action_just_pressed("interact"):
			_press("death")
		_enter_was = enter
	elif Input.is_action_just_pressed("pause"):
		show_panel("" if open != "" else "pause")
	elif Input.is_action_just_pressed("map") and not main.is_home(main.place) and open != "pause":
		show_panel("" if open == "map" else "map")
	queue_redraw()


## Open the large map ("map") or the pause panel ("pause"), or close whichever is open ("").
func show_panel(what: String) -> void:
	if what == open:
		return
	open = what
	_enter_was = Input.is_key_pressed(KEY_ENTER)
	if what != "":
		get_tree().paused = true
		_resume_at = -1
		if what == "map":
			_chart_up()
	else:
		_resume_at = Engine.get_process_frames()


func _input(e: InputEvent) -> void:
	if not (e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT):
		return
	if main == null or main.hero == null or (inv != null and inv.visible):
		return
	var p: Vector2 = e.position / 2.0
	if open == "map":
		show_panel("")
		get_viewport().set_input_as_handled()
		return
	if open == "pause" or open == "death":
		for h in _hits:
			if h[0].has_point(p):
				_press(h[1])
				break
		get_viewport().set_input_as_handled()
		return
	var W := floorf(size.x / 2.0)
	var mw := minf(66.0, floorf(W * 0.2))
	if not main.is_home(main.place) and Rect2(W - mw - 4, 4, mw, MH).has_point(p):
		show_panel("map")
		get_viewport().set_input_as_handled()
	elif Rect2(W - 14 - 4, MH + 7, 14, 12).has_point(p):
		show_panel("pause")
		get_viewport().set_input_as_handled()


func _press(what: String) -> void:
	match what:
		"resume":
			show_panel("")
		"death":
			open = ""
			main.death_done()
		"sound":
			AudioServer.set_bus_mute(0, not AudioServer.is_bus_mute(0))


# --- the game's drawing kit (ui/ui.ts), in game pixels, as hud.gd has it ---

func _rect(x: float, y: float, w: float, h: float, c: Color) -> void:
	if w > 0.0 and h > 0.0:
		draw_rect(Rect2(x, y, w, h), c)


func _block(x: float, y: float, w: float, h: float, c: Color) -> void:
	if w < 4 or h < 4:
		_rect(x, y, w, h, c)
		return
	_rect(x + 1, y, w - 2, h, c)
	_rect(x, y + 1, w, h - 2, c)
	_rect(x + 0.5, y + 0.5, w - 1, h - 1, c)


func _box(x: float, y: float, w: float, h: float, fill: Color, edge: Color) -> void:
	_block(x, y, w, h, edge)
	if w < 4 or h < 4:
		_rect(x + 0.5, y + 0.5, w - 1, h - 1, fill)
		return
	_rect(x + 1, y + 0.5, w - 2, h - 1, fill)
	_rect(x + 0.5, y + 1, w - 1, h - 2, fill)


func _text(s: String, x: float, y: float, c: Color, opts := {}) -> float:
	return PF.draw(self, s, x, y, c, opts)


## ui.ts drawButton: a pink block for the one thing to press, else a plain one (brighter under the pointer); its label.
func _button(x: float, y: float, w: float, h: float, label: String, small := false, primary := false) -> void:
	var hot := Rect2(x, y, w, h).has_point(get_viewport().get_mouse_position() / 2.0)
	if primary:
		_box(x, y, w, h, T["callHi"] if hot else T["call"], P["white"] if hot else T["callHi"])
	else:
		_box(x, y, w, h, T["hot"] if hot else T["bg2"], T["accent"] if hot else T["edgeHi"])
	var th := 5.0 if small else 8.0
	_text(label, x + floorf(w / 2.0), y + floorf((h - th) / 2.0) + (0.0 if small else 1.0), P["white"] if primary else T["text"], {"align": "center", "font": "small" if small else "normal"})


# --- the screen ---

func _draw() -> void:
	if main == null or main.hero == null or main.map == null or hud == null or hud.T.is_empty():
		return
	T = hud.T
	P = hud.P
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	var W := floorf(size.x / 2.0)
	var H := floorf(size.y / 2.0)
	var mw := minf(66.0, floorf(W * 0.2))
	_small(W - mw - 4, 4, mw, MH)
	if not main.is_home(main.place):
		_text("M", W - mw - 2, 6, T["dim"], {"font": "small", "shadow": P["ink"]})
	_button(W - 14 - 4, MH + 7, 14, 12, "II", true)
	_keys()
	if open == "map":
		_large(W, H)
	elif open == "pause":
		_pause(W, H)
	elif open == "death":
		_death(W, H)
	elif main.hero != null and not main.hero.alive and main.hero.stays_down and main._fell_for >= 0.0:
		# (he is falling: the screen darkens a little round him as he goes down: main.ts)
		_rect(0, 0, W, H, Color(P["black"], 0.3 * minf(1.0, main._fell_for / main.FALL_SEEN)))


## FLOOR 5, THE TEMPLE DOOR'S KEYS (ui/hud.ts): top left, after the inventory button (and the word he may place, and the stone
## he may carry): a key for each the door wants, whole for each he holds and faint for each he lacks, and how many of how
## many; from when he has been told of the door or holds one, until the door is open.
func _keys() -> void:
	var T = main.temple
	if T == null or not is_instance_valid(T) or not (T.told or T.keys > 0) or T.open:
		return
	var p: Array = hud._data["pics"].get("key", [])
	if p.is_empty():
		return
	# (after the rune and the count of the words he holds, where there are any: hud.gd)
	var spare: int = main.loot.spare() if main.loot != null else 0
	var kx := 4.0 + PF.width("INVENTORY (I)", "small") + 10.0 + 3.0 + (26.0 if spare > 0 else 0.0) + (16.0 if main.loot != null and main.loot.quest != "" else 0.0) + 7.0
	var cy := 24.0 + 13.0 / 2.0
	for i in T.need:
		draw_texture_rect_region(hud._tex, Rect2(roundf(kx - p[4] / 2.0), roundf(cy - p[5] / 2.0), p[2] / 2.0, p[3] / 2.0), Rect2(p[0], p[1], p[2], p[3]), Color(1, 1, 1, 1.0 if i < T.keys else 0.35))
		kx += 13.0
	_text("%d/%d" % [T.keys, T.need], kx - 4.0, roundf(cy - 3.0), Color("#dcaa52"), {"font": "small", "shadow": P["ink"]})


## Whether a tile has been seen, and whether it is in sight now (the town is seen whole).
func _seen(i: int) -> bool:
	var s = main.sight
	return s == null or s.explored[i] == 1


func _lit(i: int) -> bool:
	var s = main.sight
	return s == null or s.visible_now[i] == 1


## WHAT IS MARKED ON BOTH MAPS (hud.ts minimap, drawMap): [tile x, tile y, colour, its size on the small map, on the large
## one (0: not on it), whether it is a way down].
func _marks() -> Array:
	var map: FloorMap = main.map
	var out: Array = []
	var town: bool = main.is_home(main.place)
	# (in town the way out is the gate in the back wall)
	if town and main.town != null:
		for s in main.town.data.get("stations", []):
			if s["kind"] == "gate":
				out.append([floori(s["x"]), floori(s["y"]) - 1, P["tl4"], 2, 4, false])
	# (wayMarks: the waypoint, the stairwell once it is open, floor 1's gate home)
	if main._way != null and _seen_at(floori(main._way.at.x), floori(main._way.at.y)):
		out.append([floori(main._way.at.x), floori(main._way.at.y), P["tl4"] if main._way.awake else P["tl2"], 2, 4, false])
	if main._stairs != null and main._stairs.opened >= 0:
		var st: Dictionary = map.stairs[main._stairs.opened]
		if _seen_at(int(st["x"]), int(st["y"])):
			out.append([int(st["x"]) + (1 if st["way"] == "x" else 0), int(st["y"]) + (0 if st["way"] == "x" else 1), P["bn3"], 2, 4, true])
	if not town and map.ways is Dictionary and int(map.ways.get("gate", -1)) >= 0 and int(map.ways["gate"]) < map.doors.size():
		var mid: Dictionary = map.doors[int(map.ways["gate"])]["middle"]
		if _seen_at(floori(mid["x"]), floori(mid["y"])):
			out.append([floori(mid["x"]), floori(mid["y"]), P["tl4"], 2, 4, false])
	# (chests that have been seen and not yet opened, so that a vault left for later can be found again; and the fallen
	# wordsmith, until his satchel has been searched)
	for p in map.props:
		if p["kind"] == "chest" and int(p["state"]) == 0 and _seen_at(int(p["tx"]), int(p["ty"])):
			out.append([int(p["tx"]), int(p["ty"]), P["gd4"], 2, 3, false])
	var body = main.loot._body if main.loot != null else null
	if not town and body != null and not body["searched"] and _seen_at(floori(body["at"].x), floori(body["at"].y)):
		out.append([floori(body["at"].x), floori(body["at"].y), P["tl5"], 3, 4, false])
	if main._monsters != null:
		for m in main._monsters.list:
			if not is_instance_valid(m) or m.dead or not m.seen:
				continue
			var tx := floori(m.world.x)
			var ty := floori(m.world.y)
			if m.boss:
				out.append([tx, ty, P["bl4"], 3, 4, false])
			elif m.champion:
				out.append([tx, ty, P["fr5"], 3, 4, false])
			elif m.elite:
				out.append([tx, ty, P["fr4"], 2, 3, false])
			elif m.state != "sleep":
				out.append([tx, ty, P["bl3"], 1, 0, false])
	return out


func _seen_at(tx: int, ty: int) -> bool:
	var map: FloorMap = main.map
	return tx >= 0 and ty >= 0 and tx < map.w and ty < map.h and _seen(ty * map.w + tx)


## hud.ts minimap.
func _small(x: float, y: float, w: float, h: float) -> void:
	var map: FloorMap = main.map
	var hx := floori(main.hero.world.x)
	var hy := floori(main.hero.world.y)
	_rect(x, y, w, h, Color(P["black"], 0.6))
	var iw := int(w)
	var ih := int(h)
	# (the tiles' picture is kept while he stands on the same tile, for half a second at most)
	var key := "%d,%d,%d,%d,%d,%d" % [hx, hy, iw, ih, int(_t * 2.0), map.get_instance_id()]
	if key != _key or _img == null:
		_key = key
		_tiles(map, hx, hy, iw, ih)
	draw_texture_rect(_tex, Rect2(x, y, w, h), false)
	var cx := x + floorf(w / 2.0)
	var cy := y + floorf(h / 2.0)
	var marks := _marks()
	# (ACT 2, THE BELLS: his word, 18 Oct 2026, 05:31: "I’d like the affected area of the hush to be visible on the minimap
	# somehow": the Hush's ground and the bells still to ring, act2/bells.gd on_map)
	if main.bells != null and main.bells.on() and not main.is_home(main.place):
		var veil := func(tx: int, ty: int, c: Color, a: float) -> void:
			var px: float = cx + (tx - ty) - (hx - hy)
			var py: float = cy + floorf(((tx + ty) - (hx + hy)) / 2.0)
			if px >= x + 1 and py >= y + 1 and px < x + w - 1 and py < y + h - 1:
				_rect(px, py, 1, 1, Color(c, a))
		marks.append_array(main.bells.on_map(hx, hy, maxi(iw, ih), veil, _seen_at))
	marks.append([hx, hy, P["white"], 2, 0, false])
	for m in marks:
		var s: float = m[3]
		var px: float = cx + (m[0] - m[1]) - (hx - hy)
		var py: float = cy + floorf(((m[0] + m[1]) - (hx + hy)) / 2.0)
		if px < x + 1 or py < y + 1 or px >= x + w - s or py >= y + h - s:
			continue
		_rect(px, py, s, s, m[2])
	var edge: Color = T["edge"]
	_rect(x, y, w, 1, edge)
	_rect(x, y + h - 1, w, 1, edge)
	_rect(x, y, 1, h, edge)
	_rect(x + w - 1, y, 1, h, edge)


## The small map's tiles, painted into its own little picture.
func _tiles(map: FloorMap, hx: int, hy: int, w: int, h: int) -> void:
	if _img == null or _img.get_width() != w or _img.get_height() != h:
		_img = Image.create(w, h, false, Image.FORMAT_RGBA8)
		_tex = null
	_img.fill(Color(0, 0, 0, 0))
	var lit: Color = T["edgeHi"]
	var dim: Color = T["hot"]
	var wall: Color = T["bg2"]
	var cx := w / 2
	var cy := h / 2
	for ty in range(maxi(0, hy - R), mini(map.h - 1, hy + R) + 1):
		for tx in range(maxi(0, hx - R), mini(map.w - 1, hx + R) + 1):
			var px := cx + (tx - ty) - (hx - hy)
			if px < 1 or px >= w - 1:
				continue
			var py := cy + floori(((tx + ty) - (hx + hy)) / 2.0)
			if py < 1 or py >= h - 1:
				continue
			var i := ty * map.w + tx
			if not _seen(i):
				continue
			var k := map.tiles[i]
			if k == FloorMap.FLOOR:
				_img.set_pixel(px, py, lit if _lit(i) else dim)
			elif k == FloorMap.WALL:
				_img.set_pixel(px, py, wall)
	if _tex == null:
		_tex = ImageTexture.create_from_image(_img)
	else:
		_tex.update(_img)


## hud.ts chartFor: everything seen so far, in one picture, added to as he sees more.
func _chart_up() -> void:
	var map: FloorMap = main.map
	var cw := map.w + map.h
	var ch := ceili((map.w + map.h) / 2.0) + 1
	if _chart == null or _chart_of != map:
		_chart_of = map
		_chart = Image.create(cw, ch, false, Image.FORMAT_RGBA8)
		_chart.fill(Color(0, 0, 0, 0))
		_chart_tex = null
		_done.resize(map.w * map.h)
		_done.fill(0)
		_x0 = cw
		_y0 = ch
		_x1 = -1
		_y1 = -1
	var floor_c: Color = T.get("edgeHi", hud.T["edgeHi"])
	var wall_c: Color = T.get("bg2", hud.T["bg2"])
	for i in map.w * map.h:
		if _done[i] == 1 or not _seen(i):
			continue
		_done[i] = 1
		var k := map.tiles[i]
		if k != FloorMap.FLOOR and k != FloorMap.WALL:
			continue
		var tx := i % map.w
		var ty := i / map.w
		var px := tx - ty + map.h - 1
		var py := (tx + ty) >> 1
		_chart.set_pixel(px, py, floor_c if k == FloorMap.FLOOR else wall_c)
		_x0 = mini(_x0, px)
		_x1 = maxi(_x1, px)
		_y0 = mini(_y0, py)
		_y1 = maxi(_y1, py)
	if _chart_tex == null:
		_chart_tex = ImageTexture.create_from_image(_chart)
	else:
		_chart_tex.update(_chart)


## hud.ts drawMap: the dungeon map, filling the screen.
func _large(W: float, H: float) -> void:
	var map: FloorMap = main.map
	var ink: Color = P["ink"]
	_rect(0, 0, W, H, Color(P["black"], 0.85))
	if _chart_of != map:
		_chart_up()
	if _x1 < _x0:
		return
	# (as large as fits, up to three times; what has been seen in the middle of the screen; if even once is too big for the
	# screen, the map is centred on him instead)
	var top := 6
	var avail_w := int(W) - 12
	var avail_h := int(H) - top - 30
	var bw := _x1 - _x0 + 1
	var bh := _y1 - _y0 + 1
	var k := maxi(1, mini(3, mini(avail_w / bw, avail_h / bh)))
	var fits := bw * k <= avail_w and bh * k <= avail_h
	var hx := floori(main.hero.world.x)
	var hy := floori(main.hero.world.y)
	var ox: int = floori((W - bw * k) / 2.0) - _x0 * k if fits else floori(W / 2.0) - (hx - hy + map.h - 1) * k
	var oy: int = top + floori((avail_h - bh * k) / 2.0) - _y0 * k if fits else floori(H / 2.0) - ((hx + hy) >> 1) * k
	draw_texture_rect(_chart_tex, Rect2(ox, oy, _chart.get_width() * k, _chart.get_height() * k), false)
	var marks := _marks()
	var down := false
	# (ACT 2, THE BELLS: the Hush's ground and the bells still to ring, as on the small map)
	if main.bells != null and main.bells.on() and not main.is_home(main.place):
		var veil := func(tx: int, ty: int, c: Color, a: float) -> void:
			_rect(ox + (tx - ty + map.h - 1) * k, oy + ((tx + ty) >> 1) * k, k, k, Color(c, a))
		marks.append_array(main.bells.on_map(hx, hy, maxi(map.w, map.h), veil, _seen_at))
	# (himself last: a dark square, and on it one that blinks)
	marks.append([hx, hy, ink, 0, 6, false])
	marks.append([hx, hy, P["white"] if int(floorf(_t * 3.0)) % 2 == 0 else P["tl5"], 0, 4, false])
	for m in marks:
		if m[5]:
			down = true
		if int(m[4]) <= 0:
			continue
		var s: int = int(m[4]) + k - 1
		_rect(ox + (m[0] - m[1] + map.h - 1) * k - (s >> 1), oy + ((m[0] + m[1]) >> 1) * k - (s >> 1), s, s, m[2])
	# (the legend, on its own dark strip so that the dimmed screen under it does not show through)
	_rect(0, H - 25, W, 25, P["black"])
	var ly := H - 10
	var items: Array = [[P["white"], "you"], [P["gd4"], "chest"], [P["fr5"], "guardian"], [P["bl4"], "boss"], [P["tl4"], "way home"]]
	if down:
		items.append([P["bn3"], "way down"])
	var width := 0.0
	for it in items:
		width += 5 + PF.width(it[1], "small") + 7
	var lx := floorf((W - width) / 2.0)
	for it in items:
		_rect(lx, ly + 1, 3, 3, it[0])
		lx += 5
		lx += _text(it[1], lx, ly, T["text"], {"font": "small", "shadow": ink}) + 7
	_text("click or M to close", floorf(W / 2.0), ly - 9, T["dim"], {"align": "center", "font": "small", "shadow": ink})


## panels.ts drawPause: the game held; the controls as a short table; RESUME and the sound.
func _pause(W: float, H: float) -> void:
	var bh := 13.0
	var key_w := 0.0
	var val_w := 0.0
	for r in HELP:
		key_w = maxf(key_w, PF.width(r[0], "small"))
		val_w = maxf(val_w, PF.width(r[1], "small"))
	key_w += 8
	var pw := minf(W - 8, 250.0)
	var ph := minf(H - 6, 18 + HELP.size() * 7 + 8 + bh + 6)
	var px := floorf((W - pw) / 2.0)
	var py := maxf(3.0, floorf((H - ph) / 2.0))
	var bw := floorf((pw - 14) / 2.0)
	var by := py + ph - bh - 5
	_rect(0, 0, W, H, Color(P["black"], 0.6))
	# (ui.ts panel: its shadow, its box, and a hair of light where its top edge catches the accent)
	_block(px + 2, py + 2, pw, ph, Color(P["black"], 0.55))
	_box(px, py, pw, ph, T["bg"], T["edge"])
	_rect(px + 2, py + 0.5, pw - 4, 0.5, T["accentLo"])
	_text("Paused", px + floorf(pw / 2.0), py + 5, T["accent"], {"align": "center"})
	var y := py + 18
	var tx := px + maxf(7.0, floorf((pw - key_w - val_w) / 2.0))
	for r in HELP:
		_text(r[0], tx, y, T["dim"], {"font": "small"})
		_text(r[1], tx + key_w, y, T["text"], {"font": "small"})
		y += 7
	_hits = [[Rect2(px + 6, by, bw, bh), "resume"], [Rect2(px + 8 + bw, by, bw, bh), "sound"]]
	_button(px + 6, by, bw, bh, "Resume", false, true)
	_button(px + 8 + bw, by, bw, bh, "Sound off" if AudioServer.is_bus_mute(0) else "Sound on")


## (ui/panels.ts drawDeath) A FALLEN HERO'S SCREEN: YOU FELL (a Normal hero, who wakes in town) or YOU DIED (a Hardcore hero, lost),
## in the bad red, twice the size; who he was and where he fell (and, lost, what he did); a Normal hero's "You wake in town." and
## what it cost, or what the Lexicon and the stash keep; and its one button.
func _death(W: float, H: float) -> void:
	var d: Dictionary = main.death_info()
	var rows: Array = d["rows"]
	var pw := minf(W - 8, 220.0)
	var after: Array = _wrap(str(d["after"]), pw - 14.0)
	var w: bool = d["wakes"]
	var ph := 124.0 + (rows.size() - 4) * 10.0 + (11.0 if w else 0.0) + (after.size() - 1) * 7.0
	var px := floorf((W - pw) / 2.0)
	var py := maxf(3.0, floorf((H - ph) / 2.0))
	var bh := 14.0
	_rect(0, 0, W, H, Color(P["black"], 0.7))
	_block(px + 2, py + 2, pw, ph, Color(P["black"], 0.55))
	_box(px, py, pw, ph, T["bg"], T["edge"])
	_rect(px + 2, py + 0.5, pw - 4, 0.5, T["accentLo"])
	_text(str(d["title"]), px + floorf(pw / 2.0), py + 8, T["bad"], {"align": "center", "scale": 2, "shadow": T["lifeLo"]})
	var y := py + 34.0
	for r in rows:
		var small := PF.width(r, "normal") > pw - 10.0
		_text(r, px + floorf(pw / 2.0), y + (1.0 if small else 0.0), T["text"], {"align": "center", "font": "small" if small else "normal"})
		y += 10.0
	if w:
		_text("You wake in town.", px + floorf(pw / 2.0), y + 1.0, T["text"], {"align": "center"})
		y += 11.0
	for part in after:
		_text(part, px + floorf(pw / 2.0), y + 3.0, T["accent"], {"align": "center", "font": "small"})
		y += 7.0
	var by := py + ph - bh - 6.0
	_hits = [[Rect2(px + 40, by, pw - 80, bh), "death"]]
	_button(px + 40, by, pw - 80, bh, str(d["button"]), false, true)


## Words broken into lines no wider than `w` (ui/text.ts wrapText, the small letters).
func _wrap(s: String, w: float) -> Array:
	var out: Array = []
	var line := ""
	for word in s.split(" "):
		var t := word if line == "" else line + " " + word
		if line != "" and PF.width(t, "small") > w:
			out.append(line)
			line = word
		else:
			line = t
	if line != "":
		out.append(line)
	return out
