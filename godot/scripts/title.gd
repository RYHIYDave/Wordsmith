## THE START SCREEN (ui/panels.ts drawTitle and drawSmithMenu, main.ts mode 'title'): the game begins here, every time.
##   THE PICTURE, THE RING ON THE HILL, ALIVE (title_ring.gd): where smithLayout puts it, its middle column the screen's and the row
## under the ring's front stones (its `lip`) `lift` above the screen's foot; round it, the screen's own dark. Its surge's flash over
## the whole screen. The name of the game over it, as big as there is room for, half way up what is above the column's head (and
## never far above it).
##   THE MENU, a row of buttons along the foot (held upright, a column under the ring): CONTINUE, where a hero is saved, its line
## over it ("Warrior, level 3, dungeon 2", and ", Hardcore"); NEW GAME; LEXICON; OPTIONS. The one to press is the pink one,
## blinking: CONTINUE where there is a hero to go on with, else NEW GAME. Enter continues a saved hero.
##   OPTIONS: SOUND: ON or OFF; PROMPTS: ON or OFF (the first dungeon's prompts: whether a new hero is shown how to play; loot.gd
## `taught`, kept with the Lexicon); LEVEL SELECT; BACK (Escape too). The picture put back a little behind them, in three thin
## steps.
##   THE LEVEL SELECT (ui/panels.ts drawFloors; defs.ts LEVEL_SELECT, his: “Test hero, any floor (Recommended)”): over the picture put
## back into the dark, "Level select: choose a floor", "A test hero, levelled and geared for the floor. Not saved.", and the floors
## five to a row, each row a part of the way down with its name over it; a floor pressed opens the class cards for a test hero
## there (no mode: a test hero is Normal), their BACK back to the floors; BACK (Escape) to the options.
##   NEW GAME: the class cards (class_cards.gd) over the picture put back into the dark; their BACK, or Escape, back to the menu. A
## hero saved, CONFIRM first warns that the saved hero will be lost, and starts over only pressed again within 5 s (main.ts
## pickClass `confirm`).
##   THE LEXICON (ui/lexicon.ts drawLexicon), over the menu, the screen darkened: LEXICON, "N of 28 words found", its x; its five
## pages by what the words do, a tab each; the open page's words, each its rune stone, its name in its colour and four pips for
## what is known of it (in front, behind, on gear, on a dungeon), or "? ? ?" not yet found; the open word's page (its name twice
## the size, what it grows with, what it is, ON AN ATTACK, ON GEAR, ON A DUNGEON); and along the foot KEPT FOR YOUR NEXT CHARACTER,
## the words kept in the book. A tab, a word, a kept word pressed opens it; x, a press outside it, or Escape closes it.
##   THE TITLE THEME plays while it is up (music.gd title_music).
extends Control

signal resumed
signal picked(cls: String, mode: String)

const PF := preload("res://scripts/pixel_font.gd")
const Ring := preload("res://scripts/title_ring.gd")
const Cards := preload("res://scripts/class_cards.gd")
## (ui/panels.ts: the least the table's edge stands above the screen's foot; the room under it held upright; the most options
## a column is made for; the gap squeezed to, where there are more; how far over the column's head the name may drift)
const SQUEEZE_GAP := 2.0
const NAME_GAP := 24.0

var main  # main.gd
var sfx  # sfx.gd
var music  # music.gd
## "menu", "options", "class"
var page := "menu"
## (where the pointer is taken to be in shot mode, game pixels; null: the mouse)
var pointer = null
## What CONTINUE carries on with ("Warrior, level 3, dungeon 2"), or "" where no hero is saved; and the saved hero's class.
var resume := ""
var saved_cls := ""
## The mode the next hero is made in (the cards remember it: main.ts meta.mode).
var mode := "normal"
## (a hero saved: CONFIRM pressed once, for whom and when: main.ts confirm)
var confirm := {}
## THE LEVEL SELECT: the floor a test hero is picked for (0: none)
var trial := 0
## THE PRACTICE ROOM: its hero being picked
var practice := false
## (ui/panels.ts FLOOR_ROWS: the floors' rows, each a part of the way down; as many floors as are built)
const FLOOR_ROWS := [["THE PRISON", 1, 5], ["DOWN THE MOUNTAIN", 6, 10], ["THE CITY OF VELLUM", 11, 15], ["THE HIGH CITY", 16, 20]]
var lex_open := false
var lx_tab := -1
var lx_sel := ""
var t := 0.0
var cards: Control = null

var K := {}
var T := {}
var P := {}
var H := {}
var _pic: Node2D
var _flash: Control
var _front: Control
var _lex: Control
var _press = null
var _hits: Array = []


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	process_mode = Node.PROCESS_MODE_ALWAYS
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	K = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/clips.json"))["cards"]
	H = JSON.parse_string(FileAccess.get_file_as_string("res://assets/hud/hud.json"))
	for k in H["theme"]:
		T[k] = Color(H["theme"][k])
	for k in H["palette"]:
		var v = H["palette"][k]
		if v is String and v.begins_with("#"):
			P[k] = Color(v)
	_pic = Ring.new()
	add_child(_pic)
	for n in ["_flash", "_front", "_lex"]:
		var c := Control.new()
		c.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		c.mouse_filter = Control.MOUSE_FILTER_IGNORE
		add_child(c)
		set(n, c)
	_flash.draw.connect(_draw_flash)
	_front.draw.connect(_draw_front)
	_lex.draw.connect(_draw_lex)
	# (the night round the picture, where the screen shows past it)
	draw.connect(func() -> void: draw_rect(Rect2(Vector2.ZERO, size), Color(K["smithNight"])))


func _W() -> float:
	return floorf(size.x / 2.0)


func _H() -> float:
	return floorf(size.y / 2.0)


func _pointer() -> Vector2:
	if pointer != null:
		return pointer
	return get_local_mouse_position() / 2.0


func _click() -> void:
	if sfx != null:
		sfx.play("click")


## A press at (x, y), game pixels (shot mode presses through this; on the class page, the cards').
func press_at(p: Vector2) -> void:
	if cards != null:
		cards.press_at(p)
	else:
		_press = p


func _gui_input(e: InputEvent) -> void:
	if e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
		_press = e.position / 2.0
		accept_event()


func _unhandled_key_input(e: InputEvent) -> void:
	if not (e is InputEventKey and e.pressed and not e.echo) or cards != null:
		return
	var k: int = e.keycode
	if lex_open:
		if k == KEY_ESCAPE:
			lex_open = false
			_click()
			get_viewport().set_input_as_handled()
		return
	if k == KEY_ESCAPE and page == "options":
		page = "menu"
		get_viewport().set_input_as_handled()
	elif k == KEY_ESCAPE and page == "floors":
		page = "options"
		get_viewport().set_input_as_handled()
	elif (k == KEY_ENTER or k == KEY_KP_ENTER) and page == "menu" and resume != "":
		_click()
		resumed.emit()
		get_viewport().set_input_as_handled()


# --- where everything is (ui/panels.ts smithLayout) ---------------------------------------------------------------------------

## The buttons of the page: [id, label, the line kept over it, lit, primary].
func _items() -> Array:
	if page == "options":
		return [
			["mute", "SOUND: OFF" if AudioServer.is_bus_mute(0) else "SOUND: ON", "", false, false],
			["limit", "ABILITIES: MANA" if main != null and main.loot.limit == "mana" else "ABILITIES: COOLDOWNS",
				"No cooldowns: use them until you run dry" if main != null and main.loot.limit == "mana" else "No mana: each waits its turn", false, false],
			["guide", "PROMPTS: OFF" if main != null and main.loot.taught else "PROMPTS: ON", "", false, false],
			["practice", "PRACTICE ROOM", "", false, false],
			["floors", "LEVEL SELECT", "", false, false],
			["back", "BACK", "", false, false],
		]
	var out: Array = []
	if resume != "":
		out.append(["resume", "CONTINUE", resume, true, true])
	out.append_array([["new", "NEW GAME", "", resume == "", resume == ""], ["lexicon", "LEXICON", "", false, false], ["options", "OPTIONS", "", false, false]])
	return out


static func _rows_h(n: int, bh: float, gap: float) -> float:
	return n * bh + (n - 1) * gap


func layout() -> Dictionary:
	var W := _W()
	var Hh := _H()
	var R: Dictionary = K["ring"]
	var menu_page := page == "menu"
	var count := _items().size() if page in ["menu", "options"] else 4
	var wide := W >= 400.0 or W >= Hh * 1.3
	var gap := 4.0
	var bh := 22.0 if wide else 24.0
	var head_room := float(R["lip"]) - float(R["headTop"]) + 9.0 * 2.0 + 6.0
	var least := float(R["least"])
	var under := float(R["under"])
	var most := int(R["most"])
	var lift := maxf(least, minf(float(R["lift"]), Hh - head_room))
	var per := count if menu_page else mini(4, count)
	var bw := minf(132.0, floorf((W - 12.0 - (per - 1) * gap) / per))
	if not wide:
		lift = maxf(least, minf(under + _rows_h(most, bh, gap) + 6.0, Hh - head_room))
		if not menu_page and count > most:
			var room := _rows_h(most, bh, gap)
			gap = SQUEEZE_GAP
			bh = floorf((room - (count - 1) * gap) / count)
		per = 1 if _rows_h(count, bh, gap) <= lift - under - 6.0 else 2
		bw = minf(W - 24.0, 220.0) if per == 1 else floorf((W - 12.0 - gap) / 2.0)
	var rows := ceili(float(count) / per)
	var rows_top := Hh - 3.0 - _rows_h(rows, bh, gap) if wide else minf(Hh - lift + under, Hh - 6.0 - _rows_h(rows, bh, gap))
	var rects: Array = []
	for i in count:
		var row := floori(float(i) / per)
		var in_row := mini(per, count - row * per)
		var x0 := floorf((W - in_row * bw - (in_row - 1) * gap) / 2.0)
		rects.append(Rect2(x0 + (i - row * per) * (bw + gap), rows_top + row * (bh + gap), bw, bh))
	var oy := Hh - lift - float(R["lip"])
	var head_top := oy + float(R["headTop"])
	var name_w := PF.width(str(K["title"]))
	var big := 3 if name_w * 3.0 <= W - 12.0 and head_top >= 9.0 * 3.0 + 1.0 else 2
	var name_y := maxf(3.0, maxf(floorf((head_top - 9.0 * big) / 2.0), head_top - 9.0 * big - NAME_GAP))
	return {"lift": lift, "oy": oy, "ox": floorf((W - float(R["w"])) / 2.0), "rects": rects, "rowsTop": rows_top, "big": big, "nameY": name_y}


# --- each frame ----------------------------------------------------------------------------------------------------------------

func _process(dt: float) -> void:
	t += dt
	var L := layout()
	_pic.position = Vector2(L["ox"], L["oy"]) * 2.0
	_pic.scale = Vector2(2, 2)
	_pic.at(t)
	if music != null:
		music.title_music(true)
	# (a hero saved: CONFIRM's warning, for 5 s after it was pressed once)
	if not confirm.is_empty() and t - float(confirm["t"]) >= 5.0:
		confirm = {}
	if cards != null:
		cards.note = ("Press CONFIRM again to start over. Your saved %s will be lost." % _class_name(saved_cls)) if not confirm.is_empty() and saved_cls != "" else ""
	var p = _press
	_press = null
	if p != null and cards == null:
		if lex_open:
			_lex_press(p)
		elif page == "floors":
			_floors_press(p)
		else:
			var items := _items()
			for i in items.size():
				if (L["rects"][i] as Rect2).has_point(p):
					_pressed(items[i][0])
					break
	_flash.queue_redraw()
	_front.queue_redraw()
	_lex.queue_redraw()


func _pressed(id: String) -> void:
	_click()
	match id:
		"resume":
			resumed.emit()
		"new":
			open_cards()
		"lexicon":
			open_lexicon()
		"options":
			page = "options"
		"floors":
			page = "floors"
		"practice":
			open_cards(0, true)
		"back":
			page = "menu"
		"mute":
			AudioServer.set_bus_mute(0, not AudioServer.is_bus_mute(0))
		"limit":
			main.loot.set_limit("cooldown" if main.loot.limit == "mana" else "mana")
			if main.saving:
				preload("res://scripts/save.gd").write(main, main._restored if not main._restored.is_empty() else null)
		"guide":
			# (the switch is the device's, kept as "has been shown the game", or not: main.ts guideOn, meta.taught)
			main.loot.taught = not main.loot.taught
			if main.saving:
				preload("res://scripts/save.gd").write(main, main._restored if not main._restored.is_empty() else null)


func _class_name(c: String) -> String:
	return str(K["classes"][c]["name"]) if K["classes"].has(c) else c.capitalize()


## NEW GAME: the class cards, over the picture put back into the dark. (`floor`: a test hero's, for the level select)
func open_cards(floor := 0, room := false) -> void:
	page = "class"
	trial = floor
	practice = room
	confirm = {}
	cards = Cards.new()
	cards.main = main
	cards.sfx = sfx
	cards.over_pic = true
	cards.mode = mode
	cards.no_mode = trial > 0 or practice
	cards.gate = _gate
	if pointer != null:
		cards.pointer = pointer
	add_child(cards)
	move_child(cards, _lex.get_index())
	cards.back.connect(_cards_back)
	cards.picked.connect(func(c: String, m: String) -> void:
		mode = m
		picked.emit(c, m))


func _cards_back() -> void:
	mode = cards.mode
	cards.queue_free()
	cards = null
	page = "floors" if trial > 0 else ("options" if practice else "menu")
	trial = 0
	practice = false
	confirm = {}


## (main.ts pickClass: a hero saved, the first CONFIRM only warns; pressed again within 5 s, the new hero begins)
func _gate(cls: String) -> bool:
	if trial == 0 and not practice and saved_cls != "" and not (not confirm.is_empty() and confirm["cls"] == cls and t - float(confirm["t"]) < 5.0):
		confirm = {"cls": cls, "t": t}
		_click()
		return false
	return true


# --- drawing ----------------------------------------------------------------------------------------------------------------

func _rect(ci: CanvasItem, x: float, y: float, w: float, h: float, c: Color) -> void:
	if w > 0.0 and h > 0.0:
		ci.draw_rect(Rect2(x, y, w, h), c)


## ui.ts block: a rectangle with its corners cut by half a game pixel.
func _block(ci: CanvasItem, x: float, y: float, w: float, h: float, c: Color) -> void:
	if w < 4 or h < 4:
		_rect(ci, x, y, w, h, c)
		return
	_rect(ci, x + 1, y, w - 2, h, c)
	_rect(ci, x, y + 1, w, h - 2, c)
	_rect(ci, x + 0.5, y + 0.5, w - 1, h - 1, c)


## ui.ts box: a block of `fill` rimmed in `edge`.
func _box(ci: CanvasItem, x: float, y: float, w: float, h: float, fill: Color, edge: Color) -> void:
	_block(ci, x, y, w, h, edge)
	if w < 4 or h < 4:
		_rect(ci, x + 0.5, y + 0.5, w - 1, h - 1, fill)
		return
	_rect(ci, x + 1, y + 0.5, w - 2, h - 1, fill)
	_rect(ci, x + 0.5, y + 1, w - 1, h - 2, fill)


func _text(ci: CanvasItem, s: String, x: float, y: float, c: Color, opts := {}) -> float:
	return PF.draw(ci, s, x, y, c, opts)


## ui.ts drawButton: a pink block for the one thing to press, else a plain one (brighter under the pointer, or lit); its label.
func _button(ci: CanvasItem, r: Rect2, label: String, opts := {}) -> void:
	var hot: bool = not opts.get("disabled", false) and r.has_point(_pointer())
	var x := r.position.x
	var y := r.position.y
	if opts.get("disabled", false):
		_box(ci, x, y, r.size.x, r.size.y, T["bg"], T["edge"])
	elif opts.get("primary", false):
		_box(ci, x, y, r.size.x, r.size.y, T["callHi"] if hot or opts.get("lit", false) else T["call"], P["white"] if hot else T["callHi"])
	else:
		_box(ci, x, y, r.size.x, r.size.y, T["hot"] if hot or opts.get("lit", false) else T["bg2"], T["accent"] if hot else T["edgeHi"])
	var col: Color = T["faint"] if opts.get("disabled", false) else (P["white"] if opts.get("primary", false) else opts.get("color", T["text"]))
	var small: bool = opts.get("small", false)
	var th := 5.0 if small else 8.0
	_text(ci, label, x + floorf(r.size.x / 2.0), y + floorf((r.size.y - th) / 2.0) + (0.0 if small else 1.0), col, {"align": "center", "font": "small" if small else "normal"})


## The surge's flash, over the whole screen (and under the class cards' dark).
func _draw_flash() -> void:
	var f: Array = _pic.flash(t)
	if float(f[1]) > 0.0:
		_flash.draw_rect(Rect2(Vector2.ZERO, _flash.size), Color(f[0], float(f[1])))


func _draw_front() -> void:
	if page == "class":
		return
	if page == "floors":
		_draw_floors()
		return
	var ci := _front
	ci.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	var W := _W()
	var Hh := _H()
	var L := layout()
	var rows_top: float = L["rowsTop"]
	# (behind the options, which stand higher than the ring's foot, the picture is put back a little: the dark in three thin steps)
	if rows_top < Hh - float(L["lift"]) + 12.0:
		var night := Color(K["smithNight"])
		for i in 3:
			_rect(ci, 0, rows_top - 18.0 + i * 2.0, W, 2, Color(night, [0.15, 0.3, 0.45][i]))
		_rect(ci, 0, rows_top - 12.0, W, Hh - rows_top + 12.0, Color(night, 0.6))
	# the name of the game, over the column's head
	_text(ci, str(K["title"]), floorf(W / 2.0), L["nameY"], T["text"], {"align": "center", "scale": L["big"], "shadow": T["call"]})
	var items := _items()
	for i in items.size():
		var m: Array = items[i]
		var r: Rect2 = L["rects"][i]
		_button(ci, r, m[1], {"primary": m[4], "lit": m[3] and int(floorf(t * 2.0)) % 2 == 0, "small": PF.width(m[1]) > r.size.x - 6.0})
		# (the one line kept says WHICH hero CONTINUE carries on with: over its button)
		var sub: String = m[2]
		var sw := PF.width(sub, "small")
		if sub != "" and page == "menu" and sw <= W - 8.0:
			var sx := maxf(4.0 + ceilf(sw / 2.0), minf(W - 4.0 - ceilf(sw / 2.0), r.position.x + floorf(r.size.x / 2.0)))
			_text(ci, sub, sx, r.position.y - 8.0, T["text"], {"align": "center", "font": "small", "shadow": P["black"]})
	# (what the abilities' switch means, in a line over the options)
	if page == "options":
		var hint: String = items.filter(func(m): return m[2] != "").map(func(m): return m[2]).front() if items.any(func(m): return m[2] != "") else ""
		if hint != "" and PF.width(hint, "small") <= W - 8.0:
			_text(ci, hint, floorf(W / 2.0), L["rowsTop"] - 9.0, T["dim"], {"align": "center", "font": "small", "shadow": P["black"]})


# --- THE LEVEL SELECT'S PAGE (ui/panels.ts drawFloors) -------------------------------------------------------------------------

func _last_floor() -> int:
	var n := 1
	while n < 20 and main != null and main.has_floor(n + 1):
		n += 1
	return n


## Where the floors' page puts things: the lines over them, each row's name and its floors' buttons, BACK.
func _floors_layout() -> Dictionary:
	var W := _W()
	var Hh := _H()
	var big := 3 if W >= 380.0 else 2
	var y := 6.0 + 9.0 * big + 1.0
	var pitch := "Level select: choose a floor"
	var head_y := y
	y += 11.0
	var lines := PF.wrap("A test hero, levelled and geared for the floor. Not saved.", W - 16.0, "small")
	var lines_y := y
	y += 7.0 * lines.size() + 6.0
	var last := _last_floor()
	var rows: Array = FLOOR_ROWS.filter(func(r): return int(r[1]) <= last)
	var per := 5
	var gap := 4.0
	var head_h := 9.0
	var row_gap := 7.0
	var room := Hh - 28.0 - y
	var bh := maxf(16.0, minf(32.0, floorf((room - rows.size() * head_h - (rows.size() - 1) * row_gap) / rows.size())))
	var bw := maxf(18.0, minf(52.0, floorf((W - 16.0 - (per - 1) * gap) / per)))
	var x0 := floorf((W - per * bw - (per - 1) * gap) / 2.0)
	y += maxf(0.0, floorf((room - rows.size() * (head_h + bh) - (rows.size() - 1) * row_gap) / 2.0))
	var heads: Array = []
	var floors: Array = []
	for r in rows:
		heads.append(["%s  %d-%d" % [r[0], r[1], mini(int(r[2]), last)], y])
		y += head_h
		for d in range(int(r[1]), mini(int(r[2]), last) + 1):
			floors.append([d, Rect2(x0 + (d - int(r[1])) * (bw + gap), y, bw, bh)])
		y += bh + row_gap
	return {"big": big, "pitch": pitch, "headY": head_y, "lines": lines, "linesY": lines_y, "heads": heads, "floors": floors,
		"back": Rect2(4, Hh - 22, PF.width("BACK") + 20.0, 18)}


func _floors_press(p: Vector2) -> void:
	var L := _floors_layout()
	if (L["back"] as Rect2).has_point(p):
		_click()
		page = "options"
		return
	for f in L["floors"]:
		if (f[1] as Rect2).has_point(p):
			_click()
			open_cards(int(f[0]))
			return


func _draw_floors() -> void:
	var ci := _front
	ci.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	var W := _W()
	var Hh := _H()
	var L := _floors_layout()
	# (over the picture put back into the dark, as the class cards are)
	_rect(ci, 0, 0, W, Hh, Color(Color(K["smithNight"]), 0.74))
	_text(ci, str(K["title"]), floorf(W / 2.0), 6, T["text"], {"align": "center", "scale": L["big"], "shadow": T["call"]})
	_text(ci, L["pitch"], floorf(W / 2.0), L["headY"], T["accent"], {"align": "center", "font": "normal" if PF.width(L["pitch"]) <= W - 8.0 else "small"})
	var y: float = L["linesY"]
	for line in L["lines"]:
		_text(ci, line, floorf(W / 2.0), y, T["dim"], {"align": "center", "font": "small"})
		y += 7.0
	for h in L["heads"]:
		_text(ci, h[0], floorf(W / 2.0), h[1], T["text"], {"align": "center", "font": "small"})
	for f in L["floors"]:
		_button(ci, f[1], str(f[0]))
	_button(ci, L["back"], "BACK")


# --- THE LEXICON (ui/lexicon.ts drawLexicon) --------------------------------------------------------------------------------

func open_lexicon() -> void:
	lex_open = true
	lx_tab = -1
	lx_sel = ""


func _found(w: String) -> bool:
	return main != null and bool(main.loot._know(w)["found"])


func _lex_layout() -> Dictionary:
	var W := _W()
	var Hh := _H()
	var D: Dictionary = preload("res://scripts/words.gd").data()
	var ids: Array = D["ids"]
	var pages: Array = D["lexPages"]
	var narrow := W < 400.0
	var found: Array = ids.filter(_found)
	if lx_sel != "" and not _found(lx_sel):
		lx_sel = ""
	if lx_sel == "" and not found.is_empty():
		lx_sel = found[0]
	var kept: Array = ids.filter(func(w): return int(main.loot.lexicon.get(w, 0)) > 0)
	var pw := minf(W - 6.0, 290.0 if narrow else 470.0)
	var ph := minf(Hh - 6.0, 600.0 if narrow else 226.0)
	var px := floorf((W - pw) / 2.0)
	var py := maxf(3.0, floorf((Hh - ph) / 2.0))
	var hdr := 18.0
	var row_h := 17.0
	var at := lx_tab if lx_tab >= 0 and lx_tab < pages.size() else (_page_of(lx_sel) if lx_sel != "" else 0)
	var listed: Array = pages[at]["words"]
	var tab_h := 15.0
	var tab_w := minf(58.0, floorf((pw - 12.0 - (pages.size() - 1) * 2.0) / pages.size()))
	var tabs: Array = []
	for i in pages.size():
		tabs.append(Rect2(px + 6.0 + i * (tab_w + 2.0), py + hdr + 2.0, tab_w, tab_h))
	var head_h := hdr + 2.0 + tab_h + 3.0
	var cols := 3 if narrow else (1 if head_h + listed.size() * row_h + 4.0 <= ph else 2)
	var list_w := pw - 12.0 if narrow else 104.0 * cols
	var cell_w := floorf(list_w / cols)
	var list_x := px + 6.0
	var list_y := py + head_h
	var cells: Array = []
	for i in listed.size():
		cells.append([Rect2(list_x + (i % cols) * cell_w, list_y + floorf(float(i) / cols) * row_h, cell_w - 2.0, row_h - 2.0), listed[i]])
	var list_h := ceilf(float(listed.size()) / cols) * row_h
	var open := lx_sel if lx_sel != "" and listed.has(lx_sel) else ""
	if open == "":
		for w in listed:
			if _found(w):
				open = w
				break
	var chip_w := 30.0
	var chip_h := 16.0
	var page_x := px + 6.0 if narrow else list_x + list_w + 8.0
	var page_w := px + pw - 6.0 - page_x
	var per_row := maxi(1, floori((page_w + 3.0) / (chip_w + 3.0)))
	var kept_h := maxf(1.0, ceilf(float(kept.size()) / per_row)) * (chip_h + 3.0) - 3.0
	var strip_h := 9.0 + kept_h + 3.0 if not kept.is_empty() else 0.0
	var strip_y := py + ph - strip_h - 4.0
	var page_y := list_y + list_h + 6.0 if narrow else list_y
	var chips: Array = []
	for i in kept.size():
		chips.append([Rect2(page_x + (i % per_row) * (chip_w + 3.0), strip_y + 9.0 + floorf(float(i) / per_row) * (chip_h + 3.0), chip_w, chip_h), kept[i]])
	return {"px": px, "py": py, "pw": pw, "ph": ph, "narrow": narrow, "found": found, "ids": ids, "pages": pages, "at": at, "tabs": tabs,
		"cells": cells, "open": open, "pageX": page_x, "pageY": page_y, "pageW": page_w, "pageH": strip_y - page_y - 2.0, "stripY": strip_y,
		"stripH": strip_h, "chips": chips, "close": Rect2(px + pw - 15.0, py + 3.0, 12.0, 11.0)}


func _page_of(w: String) -> int:
	var pages: Array = preload("res://scripts/words.gd").data()["lexPages"]
	for i in pages.size():
		if (pages[i]["words"] as Array).has(w):
			return i
	return 0


func _lex_press(p: Vector2) -> void:
	var L := _lex_layout()
	if (L["close"] as Rect2).has_point(p):
		lex_open = false
		_click()
		return
	for i in (L["tabs"] as Array).size():
		if (L["tabs"][i] as Rect2).has_point(p):
			if i != int(L["at"]) and sfx != null:
				sfx.play("click")
			lx_tab = i
			for w in L["pages"][i]["words"]:
				if _found(w):
					lx_sel = w
					break
			return
	for c in L["cells"]:
		if (c[0] as Rect2).has_point(p):
			if _found(c[1]):
				lx_sel = c[1]
			return
	for c in L["chips"]:
		if (c[0] as Rect2).has_point(p):
			if _found(c[1]):
				lx_sel = c[1]
				lx_tab = -1
			return
	if not Rect2(L["px"], L["py"], L["pw"], L["ph"]).has_point(p):
		lex_open = false
		_click()


func _icon(ci: CanvasItem, w: String, x: float, y: float) -> void:
	var pics: Dictionary = main.loot.pics
	if not pics.has("word:" + w):
		return
	var src: Rect2 = pics["word:" + w]["rect"]
	ci.draw_texture_rect_region(main.loot.sheet, Rect2(x, y, 12, 12), src)


func _draw_lex() -> void:
	if not lex_open or main == null:
		return
	var ci := _lex
	ci.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	var L := _lex_layout()
	var px: float = L["px"]
	var py: float = L["py"]
	var pw: float = L["pw"]
	var ph: float = L["ph"]
	var hp := _pointer()
	var loot = main.loot
	# (ui.ts shade, panel)
	_rect(ci, 0, 0, _W(), _H(), Color(P["black"], 0.75))
	_block(ci, px + 2, py + 2, pw, ph, Color(P["black"], 0.55))
	_box(ci, px, py, pw, ph, T["bg"], T["edge"])
	_rect(ci, px + 2, py + 0.5, pw - 4, 0.5, T["accentLo"])
	var hx := px + 7.0
	hx += _text(ci, "LEXICON", hx, py + 5, T["accent"]) + 8.0
	_text(ci, "%d of %d words found" % [(L["found"] as Array).size(), (L["ids"] as Array).size()], hx, py + 7, T["dim"], {"font": "small"})
	_button(ci, L["close"], "x")
	# its tabs: each its page's name; the open one lit in the friend's cyan
	var tabs: Array = L["tabs"]
	for i in tabs.size():
		var r: Rect2 = tabs[i]
		var on: bool = i == int(L["at"])
		_box(ci, r.position.x, r.position.y, r.size.x, r.size.y, T["accentBg"] if on else (T["hot"] if r.has_point(hp) else T["bg2"]), T["accent"] if on else T["edgeHi"])
		var name: String = L["pages"][i]["name"]
		_text(ci, name, r.position.x + floorf((r.size.x - PF.width(name, "small")) / 2.0), r.position.y + floorf((r.size.y - 5.0) / 2.0), T["accent"] if on else T["dim"], {"font": "small"})
	# the open page's words: the ones not found yet only a line
	for c in L["cells"]:
		var r: Rect2 = c[0]
		var w: String = c[1]
		if not _found(w):
			_box(ci, r.position.x, r.position.y, r.size.x, r.size.y, T["slot"], T["edge"])
			_text(ci, "? ? ?", r.position.x + floorf(r.size.x / 2.0), r.position.y + floorf((r.size.y - 5.0) / 2.0), T["faint"], {"align": "center", "font": "small"})
			continue
		var on: bool = L["open"] == w
		var wc: Color = loot.word_color(w)
		_box(ci, r.position.x, r.position.y, r.size.x, r.size.y, T["hot"] if on or r.has_point(hp) else T["bg2"], T["accent"] if on else wc)
		_icon(ci, w, r.position.x + 2.0, r.position.y + floorf((r.size.y - 12.0) / 2.0))
		var nm: String = str(preload("res://scripts/words.gd").word(w)["name"]).to_upper()
		var small := PF.width(nm) > r.size.x - 30.0
		_text(ci, nm, r.position.x + 16.0, r.position.y + floorf((r.size.y - (5.0 if small else 8.0)) / 2.0) + (0.0 if small else 1.0), wc, {"font": "small" if small else "normal"})
		# four pips: in front, behind, on gear, on a dungeon; lit when that use is known
		var k: Dictionary = loot._know(w)
		var kn := [k.get("front", false), k.get("behind", false), k.get("gear", false), k.get("dungeon", false)]
		for j in 4:
			_rect(ci, r.end.x - 4.0, r.position.y + 2.0 + j * 3.0, 2, 2, wc if kn[j] else T["faint"])
	# the page of the word that is open
	var open: String = L["open"]
	if open != "":
		_word_page(ci, open, L["pageX"], L["pageY"], L["pageW"], L["pageH"], not L["narrow"])
	elif not (L["found"] as Array).is_empty():
		_text(ci, "No word of this page found yet.", L["pageX"], L["pageY"] + 2.0, T["dim"])
	else:
		var y: float = L["pageY"] + 2.0
		for row in PF.wrap("No word found yet. The first lies in a satchel, half way through the first dungeon.", L["pageW"]):
			_text(ci, row, L["pageX"], y, T["dim"])
			y += 9.0
	# the strip: words kept in the book between heroes
	if float(L["stripH"]) > 0.0:
		var sy: float = L["stripY"]
		_rect(ci, L["pageX"], sy, L["pageW"], 1, T["edge"])
		_text(ci, "KEPT FOR YOUR NEXT CHARACTER", L["pageX"], sy + 2.0, T["dim"], {"font": "small"})
		for c in L["chips"]:
			var r: Rect2 = c[0]
			var w: String = c[1]
			_box(ci, r.position.x, r.position.y, r.size.x, r.size.y, T["slot"], loot.word_color(w))
			_icon(ci, w, r.position.x + 2.0, r.position.y + floorf((r.size.y - 12.0) / 2.0))
			_text(ci, "x%d" % int(loot.lexicon[w]), r.position.x + 16.0, r.position.y + floorf((r.size.y - 5.0) / 2.0), T["text"], {"font": "small"})


## A word's page (ui/lexicon.ts wordPage, drawWordPage), in a column `pw` wide from (x, y0), no further down than `ph` below it:
## its name (twice the size, `big`) and what it grows with; what it is; ON AN ATTACK, in front and behind; ON GEAR, slot by slot
## (and, a melded or ranked word, what it is there); ON A DUNGEON. Each part written whole or not at all.
func _word_page(ci: CanvasItem, w: String, x: float, y0: float, pw: float, ph: float, big: bool) -> void:
	var Words := preload("res://scripts/words.gd")
	var wd: Dictionary = Words.word(w)
	var k: Dictionary = main.loot._know(w)
	var page: Dictionary = Words.data()["page"].get(w, {"gear": [], "note": ""})
	var unknown := "Undiscovered."
	var head := func(s: String) -> Array: return [s, T["accent"], true, 0.0]
	var line := func(s: String, known: bool) -> Array: return [s, T["text"] if known else T["faint"], true, 4.0]
	var meld := str(wd.get("kind", "")) in ["meld", "rank"]
	var gear_rows: Array = [head.call("ON GEAR")]
	if not k.get("gear", false):
		gear_rows.append(line.call(unknown, false))
	else:
		for g in (page["gearMana"] if main.loot.limit == "mana" and page.has("gearMana") else page["gear"]):
			gear_rows.append(line.call(str(g), true))
		if meld and str(page.get("note", "")) != "":
			gear_rows.append(line.call(str(page["note"]), true))
	var dungeon: bool = k.get("dungeon", false)
	var mt := str(wd.get("monsterText", ""))
	var dun_text := ("Every monster in it: %s%s Richer loot, and words are likelier." % [mt.substr(0, 1).to_lower(), mt.substr(1)]) if dungeon and not meld else unknown
	var parts: Array = [
		[0.0, [[str(wd["about"]), P["white"], false, 0.0]]],
		[4.0, [head.call("ON AN ATTACK"),
			line.call("In front (%s ...): %s" % [str(wd["front"]).to_upper(), wd["frontText"]] if k.get("front", false) else "In front: " + unknown, k.get("front", false)),
			line.call("Behind (... %s): %s" % [str(wd["behind"]).replace("of ", "OF ").to_upper(), wd["behindText"]] if k.get("behind", false) else "Behind: " + unknown, k.get("behind", false))]],
		[2.0, gear_rows],
		[2.0, [head.call("ON A DUNGEON"), line.call(dun_text, dungeon and not meld)]],
	]
	var end := y0 + ph
	var y := y0
	var wc: Color = main.loot.word_color(w)
	var nw := _text(ci, str(wd["name"]).to_upper(), x, y, wc, {"shadow": P["ink"], "scale": 2 if big else 1})
	var grows: String = str(H["words"].get(w, {}).get("grows", ""))
	_text(ci, grows, x + nw + 8.0, y + (9.0 if big else 2.0), T["dim"], {"font": "small"})
	y += 20.0 if big else 11.0
	for part in parts:
		var rows: Array = []
		for r in part[1]:
			for l in PF.wrap(r[0], pw - r[3], "small" if r[2] else "normal"):
				rows.append([l, r[1], r[2], r[3]])
		var h := 0.0
		for r in rows:
			h += 6.0 if r[2] else 9.0
		if y + part[0] + h - 1.0 > end:
			return
		y += part[0]
		for r in rows:
			_text(ci, r[0], x + r[3], y, r[1], {"font": "small" if r[2] else "normal"})
			y += 6.0 if r[2] else 9.0
