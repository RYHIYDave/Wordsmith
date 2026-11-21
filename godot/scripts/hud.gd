## THE SCREEN OVER THE GAME, drawn as the game's ui/hud.ts drawHud draws it, in its own letters (pixel_font.gd), colours and
## pictures (assets/hud: tools/godot_hud.ts), in game pixels (two picture pixels to one):
##   the LIFE GLOBE bottom left, the FLASK beside it with the level over it; the LUNGE's button bottom right with SPACE over
##   it; between them THE TWO ATTACKS written out on their plates as they read, each with its key over it and how soon it is
##   ready; his experience along the foot;
##   LEVEL UP and what E would do here, as buttons over the plates;
##   top left the place's name, his gold, the INVENTORY button (pink while a word waits for a place) with the rune of the
##   first word he holds and how many he holds beside it, the Master Rune-stone while he carries it; the BOSS'S BAR at the
##   top once he fights; the guide's PROMPT in its panel at the top; what has just happened, over the flask; and the boss's
##   name across the screen (ui/cards.ts).
##   THE MOVES AS THEY READ (hud.ts phrase, drawPhrase; the words set in them: loadout.gd): the words in front, the move's
##   name, the words behind after a small "of" and "and": FLAME STRIKE of POWER. Each word is written in its own colour
##   (art/icons.ts WORD_COLOR), or, where the two plates would not fit, drawn as its rune stone (the words behind first, then
##   all); every empty slot is a dark notch with a plus, glowing while a word he holds could go into it. A move whose words
##   have given it an element has its picture rimmed in that element's colour. THE LUNGE, a button, shows its words as pips
##   in their colours, those in front along its top and those behind along its foot, and its name with its words in the
##   small letters over it. (A move has the slots the hero's level and the lit ring give it: none before the ring; the
##   Whirlwind's from level 2 and the Lunge's from 5, when the game opens those moves. Here all three moves are shown from
##   the first, since the port lets him make them from the first.)
##   A MOVE'S CARD: under the pointer, a plate or the Lunge's button shows what the move does, words included: its name with
##   its words, and its lines (words.gd resolve). A press on one, out of a fight, opens the gear screen at that move.
##   WORD FOUND (hud.ts drawToast): the word just come by on its tile at the top of the screen for a moment, in the
##   prompt's place; a new player's first, large, with what a word is for.
## The small map and the pause button top right, the large map and the pause panel: minimap.gd.
## Not yet: the fight's own prompt lines.
extends Control

const PF := preload("res://scripts/pixel_font.gd")
const Words := preload("res://scripts/words.gd")
const DIR := "res://assets/hud/"

var main  # main.gd
var hero  # hero.gd
## (hud.ts HUSHED.color: the dark his words are written in while the Hush is on him)
const HUSHED := Color("#4a4658")
var loot  # loot.gd (may be null)
var words := ""
var words_frame := 0
## THE BOSS'S NAME ACROSS THE SCREEN (ui/cards.ts drawBossCard): {name, t, secs}, empty when none.
var card := {}
## THE FLOOR'S NAME ACROSS THE SCREEN (ui/cards.ts drawFloorCard): {name, level, t, secs}, empty when none.
var floor_card := {}

var _data := {}
var _tex: Texture2D
var T := {}  # ui/ui.ts THEME, as colours
var P := {}  # art/palette.ts P
var _t := 0.0
var _banner_key := ""
var _banner_at := -9.0
## (where the two attacks' plates, the Lunge's button and the INVENTORY button were last drawn, in game pixels: a press on
## one of them; and, in shot mode, where the pointer is taken to be, null for the mouse itself)
var _plates: Array = []
var _lunge := Rect2()
var _inv_button := Rect2()
## (THE SKILL TREES: NEW TALENT, while a point waits to be spent: hud.ts; pressed, the gear screen on TALENTS)
var _talent_button := Rect2()
const Talents := preload("res://scripts/talents.gd")
var pointer = null


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	process_mode = Node.PROCESS_MODE_ALWAYS
	_data = JSON.parse_string(FileAccess.get_file_as_string(DIR + "hud.json"))
	_tex = load(DIR + "hud.png")
	for k in _data["theme"]:
		T[k] = Color(_data["theme"][k])
	for k in _data["palette"]:
		var v = _data["palette"][k]
		if v is String and v.begins_with("#"):
			P[k] = Color(v)


func _process(dt: float) -> void:
	_t += dt
	if not card.is_empty():
		if not get_tree().paused:
			card["t"] += dt
		if card["t"] > card["secs"]:
			card = {}
	if not floor_card.is_empty():
		if not get_tree().paused:
			floor_card["t"] += dt
		if floor_card["t"] > floor_card["secs"]:
			floor_card = {}
	if words != "" and Engine.get_process_frames() > words_frame and not get_tree().paused and (Input.is_action_just_pressed("interact") or Input.is_action_just_pressed("attack")):
		words = ""
	queue_redraw()


## A press on the INVENTORY button opens the gear screen; a press on an attack's plate or the Lunge's button, out of a
## fight, opens it at that move's line of word slots (hud.ts: "Pressing one opens the Words screen"; in a fight a press
## there is an attack). The game is held from then, so the press is not a blow as well.
func _input(e: InputEvent) -> void:
	if not (e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT):
		return
	if main == null or hero == null or not hero.alive or get_tree().paused or main._inv == null:
		return
	var p: Vector2 = e.position / 2.0
	if _inv_button.has_point(p):
		main._inv.toggle()
		get_viewport().set_input_as_handled()
		return
	if _talent_button.has_point(p):
		main._inv.open_talents()
		get_viewport().set_input_as_handled()
		return
	if main._in_fight():
		return
	for s in _plates.size():
		if _plates[s].has_point(p):
			main._inv.open_on(s)
			get_viewport().set_input_as_handled()
			return
	if _lunge.has_point(p):
		main._inv.open_on(2)
		get_viewport().set_input_as_handled()


# --- the game's drawing kit (ui/ui.ts, ui/hud.ts), in game pixels ---

func _rect(x: float, y: float, w: float, h: float, c: Color) -> void:
	if w > 0.0 and h > 0.0:
		draw_rect(Rect2(x, y, w, h), c)


## ui.ts block: a block with its corners cut by half a game pixel.
func _block(x: float, y: float, w: float, h: float, c: Color) -> void:
	if w < 4 or h < 4:
		_rect(x, y, w, h, c)
		return
	_rect(x + 1, y, w - 2, h, c)
	_rect(x, y + 1, w, h - 2, c)
	_rect(x + 0.5, y + 0.5, w - 1, h - 1, c)


## ui.ts box: a block of `fill` with a rim of `edge` half a game pixel wide.
func _box(x: float, y: float, w: float, h: float, fill: Color, edge: Color) -> void:
	_block(x, y, w, h, edge)
	if w < 4 or h < 4:
		_rect(x + 0.5, y + 0.5, w - 1, h - 1, fill)
		return
	_rect(x + 1, y + 0.5, w - 2, h - 1, fill)
	_rect(x + 0.5, y + 1, w - 1, h - 2, fill)


## A picture from the HUD's sheet, its top left at (x, y), at its size in game pixels (or stretched to w by h).
func _pic(key: String, x: float, y: float, w := -1.0, h := -1.0, mod := Color.WHITE) -> void:
	var p: Array = _data["pics"].get(key, [])
	if p.is_empty():
		return
	var src := Rect2(p[0], p[1], p[2], p[3])
	draw_texture_rect_region(_tex, Rect2(x, y, w if w > 0 else p[2] / 2.0, h if h > 0 else p[3] / 2.0), src, mod)


func _pic_size(key: String) -> Vector2:
	var p: Array = _data["pics"].get(key, [0, 0, 0, 0, 0, 0])
	return Vector2(p[2], p[3]) / 2.0


## ui.ts slot: a dark square, its icon in the middle at its own size, a coloured rim.
func _slot(x: float, y: float, size: float, icon: String, edge: Color, lit := false) -> void:
	_box(x, y, size, size, T["bg2"] if lit else T["slot"], edge)
	if icon != "":
		var s := _pic_size(icon)
		_pic(icon, x + floorf((size - s.x) / 2.0), y + floorf((size - s.y) / 2.0))


## ui.ts drawButton: a pink block for the one thing to press (lit: brighter), else a plain one; its label in the middle.
func _button(x: float, y: float, w: float, h: float, label: String, small := false, primary := false, lit := false) -> void:
	if primary:
		_box(x, y, w, h, T["callHi"] if lit else T["call"], T["callHi"])
	else:
		_box(x, y, w, h, T["hot"] if lit else T["bg2"], T["edgeHi"])
	var th := 5.0 if small else 8.0
	_text(label, x + floorf(w / 2.0), y + floorf((h - th) / 2.0) + (0.0 if small else 1.0), P["white"] if primary else T["text"], {"align": "center", "font": "small" if small else "normal"})


func _text(s: String, x: float, y: float, c: Color, opts := {}) -> float:
	return PF.draw(self, s, x, y, c, opts)


func _width(s: String, font := "normal") -> float:
	return PF.width(s, font)


## hud.ts disc: a filled circle drawn in rows half a game pixel tall; only the rows from `top` down to `bottom`.
func _disc(cx: float, cy: float, r: float, c: Color, top := -1e9, bottom := 1e9) -> void:
	var y := ceilf((cy - r) * 2.0) / 2.0
	while y < cy + r:
		if y >= top and y < bottom:
			var m := y + 0.25 - cy
			var half := roundf(sqrt(maxf(0.0, r * r - m * m)) * 2.0) / 2.0
			if half > 0.0:
				_rect(cx - half, y, half * 2.0, 0.5, c)
		y += 0.5


## hud.ts globe: a flat disc of deep indigo, the liquid in one flat colour with a line of light along its surface, a thin rim.
func _globe(cx: float, cy: float, r: float, frac: float, fill: Color, light: Color, rim: Color) -> void:
	var mx := cx + 0.5
	var my := cy + 0.5
	var R := r + 0.5
	_disc(mx, my, R + 1.0, rim)
	_disc(mx, my, R, T["ink"])
	var f := clampf(frac, 0.0, 1.0)
	if f <= 0.0:
		return
	var level := roundf((my + R - f * 2.0 * R) * 2.0) / 2.0
	_disc(mx, my, R, fill, level)
	if f < 1.0:
		_disc(mx, my, R, light, level, level + 1.0)


## ui/words.ts arrow: pointing down at (x, y), bobbing, with its shadow.
func _arrow(x: float, y: float, c: Color) -> void:
	var bob := roundf(absf(sin(_t * 5.0)) * 3.0)
	var rows := [[0, 0], [-1, 1], [-2, 2], [-3, 3], [-1, 1], [-1, 1], [-1, 1]]
	for pass_ in [[1.0, 1.0, P["ink"]], [0.0, 0.0, c]]:
		for i in rows.size():
			var k: float = i + 1 + bob
			_rect(x + rows[i][0] + pass_[0], y - k + pass_[1], rows[i][1] - rows[i][0] + 1, 1, pass_[2])


## hud.ts tickBox: a small box, ticked or empty.
func _tick_box(x: float, y: float, done: bool) -> void:
	_rect(x, y, 7, 7, T["good"] if done else T["edgeHi"])
	_rect(x + 1, y + 1, 5, 5, T["goodBg"] if done else T["slot"])
	if done:
		for q in [[1, 3], [2, 4], [3, 3], [4, 2], [5, 1]]:
			_rect(x + q[0], y + q[1], 1, 1, T["good"])


# --- the screen ---

func _draw() -> void:
	if hero == null:
		return
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	var W := floorf(size.x / 2.0)
	var H := floorf(size.y / 2.0)
	var pulse := int(floorf(_t * 3.0)) % 2 == 0
	var ink: Color = P["ink"]

	# ---- the life globe ----
	var gy := H - 19
	var life_x := 19.0
	_globe(life_x, gy, 14, hero.life / hero.max_life, T["life"], T["lifeHi"], T["edgeHi"])
	_text("%d" % ceili(hero.life), life_x, gy - 3, P["white"], {"align": "center", "font": "small", "shadow": ink})

	# ---- the flask (Q) ----
	var ps := 20.0
	var px := 37.0
	var py := H - ps - 1
	var potions: int = loot.potions if loot != null else 0
	_slot(px, py, ps, "potion", T["edgeHi"] if potions > 0 else T["edge"])
	if potions <= 0:
		_rect(px + 1, py + 1, ps - 2, ps - 2, Color(P["black"], 0.65))
	_text("%d" % potions, px + ps - 2, py + ps - 7, P["white"], {"align": "right", "font": "small", "shadow": ink})
	_text("Q", px + 2, py + 2, T["dim"], {"font": "small", "shadow": ink})
	_text("LV %d" % (loot.level if loot != null else 1), px, py - 7, T["accent"], {"font": "small", "shadow": ink})

	# ---- the Lunge: beside where the mana would be, as the flask is beside the life ----
	var ready: Dictionary = hero.readiness()
	var skills: Array = _skills()
	var ex := W - ps - 5
	# (what the prompt points at, an attack's plate or the Lunge's button, and which of them is under the pointer)
	var point: int = int(main.guide.point) if main != null else -1
	var mouse: Vector2 = pointer if pointer != null else get_viewport().get_mouse_position() / 2.0
	var hover_skill := -1
	_lunge = Rect2(ex, py, ps, ps)
	if _lunge.has_point(mouse):
		hover_skill = 2
	_slot(ex, py, ps, "ability:" + skills[2]["icon"], T["edgeHi"])
	# (its words: a pip for each in its colour, those in front along the top of the button and those behind along the bottom)
	var fi := 0
	for w in hero.loadout.fronts(2):
		_rect(ex + 1 + fi * 5, py + 1, 5, 5, ink)
		_rect(ex + 2 + fi * 5, py + 2, 3, 3, Color(_data["word_color"][w]))
		fi += 1
	var bi := 0
	for w in hero.loadout.behinds(2):
		_rect(ex + 1 + bi * 5, py + ps - 6, 5, 5, ink)
		_rect(ex + 2 + bi * 5, py + ps - 5, 3, 3, Color(_data["word_color"][w]))
		bi += 1
	var lunge_cover := clampf(1.0 - float(ready["lunge"]), 0.0, 1.0)
	if lunge_cover > 0.0:
		_rect(ex + 1, py + 1, ps - 2, ceilf((ps - 2) * lunge_cover), Color(P["black"], 0.72))
	if ready.has("max") and int(ready["max"][2]) > 1:
		_text(str(int(ready["have"][2])), ex + ps - 2, py + ps - 7, P["white"], {"align": "right", "font": "small", "shadow": ink})
	_text("SPACE", ex + floorf(ps / 2.0), py - 7, T["accent"] if point == 2 else T["dim"], {"align": "center", "font": "small", "shadow": ink})
	# (its name with its words, in the small letters over its button, once it has any)
	var lunge_named: bool = not hero.loadout.fronts(2).is_empty() or not hero.loadout.behinds(2).is_empty()
	if lunge_named:
		var parts := _name_parts(2)
		var nw := 0.0
		for i in parts.size():
			nw += _width(parts[i][0], "small") + (3.0 if i > 0 else 0.0)
		var nx := W - 3 - nw
		for p in parts:
			nx += _text(p[0], nx, py - 14, p[1], {"font": "small", "shadow": ink}) + 3
	if point == 2:
		if pulse:
			_rect(ex, py, ps, 1, T["accent"])
			_rect(ex, py + ps - 1, ps, 1, T["accent"])
			_rect(ex, py, 1, ps, T["accent"])
			_rect(ex + ps - 1, py, 1, ps, T["accent"])
		_arrow(ex + floorf(ps / 2.0), py - (17 if lunge_named else 9), T["accent"])

	# ---- the two attacks, written out with their word sockets ----
	var PH := 20.0
	var PAD := 4.0
	var avail_l := px + ps + 5
	var avail_r := ex - 5
	var tight := 0
	var pieces := [_phrase(0, 0), _phrase(1, 0)]
	while _plate_w(pieces[0]) + _plate_w(pieces[1]) + 5 > avail_r - avail_l and tight < 2:
		tight += 1
		pieces = [_phrase(0, tight), _phrase(1, tight)]
	var w0 := _plate_w(pieces[0])
	var w1 := _plate_w(pieces[1])
	var x0 := roundf((avail_l + avail_r - w0 - w1 - 5) / 2.0)
	var plates := [Rect2(x0, H - PH - 4, w0, PH), Rect2(x0 + w0 + 5, H - PH - 4, w1, PH)]
	_plates = plates
	var keys := [str(skills[0].get("key", "LEFT CLICK")), str(skills[1].get("key", "HOLD RIGHT CLICK"))]
	# (a plate is a button out of a fight: under the pointer it lights, and a press on it opens the gear screen at its move)
	var button: bool = main != null and not main._in_fight()
	for s in 2:
		var r: Rect2 = plates[s]
		var asked: bool = point == s
		var hot: bool = (button or asked) and r.has_point(mouse)
		if hot:
			hover_skill = s
		_box(r.position.x, r.position.y, r.size.x, r.size.y, T["hot"] if hot or (asked and pulse) else T["bg2"], ((T["accent"] if pulse else T["accentLo"]) if asked else (T["accent"] if hot else T["edge"])))
		var iy := r.position.y + floorf((PH - 20) / 2.0)
		# (a move whose words have given it an element: its picture rimmed in that element's colour)
		var el: String = hero.loadout.r(s)["element"]
		_slot(r.position.x, iy, 20, "ability:" + skills[s]["icon"], Color(_data["element_ramp"][el][2]) if el != "phys" else T["edgeHi"])
		if s == 1:
			var cover := clampf(1.0 - float(ready["whirl"]), 0.0, 1.0)
			var going: bool = hero._act == "whirl" and hero._spun >= 0.0
			if cover > 0.0 and not going:
				_rect(r.position.x + 1, iy + 1, 18, ceilf(18 * cover), Color(P["black"], 0.72))
			if going:
				# (one that is being held: how much of its length is left, as a bar that runs down)
				var left := clampf(1.0 - hero._spun / float(skills[1]["channel"]), 0.0, 1.0)
				_rect(r.position.x + 1, iy + 15, 18, 4, ink)
				_rect(r.position.x + 2, iy + 16, roundf(16 * left), 2, T["accent"])
		# (a move that holds more than one charge: how many it has now, small, in its picture's corner: hud.ts maxCharges)
		if ready.has("max") and int(ready["max"][s]) > 1:
			_text(str(int(ready["have"][s])), r.position.x + 18, iy + 13, P["white"], {"align": "right", "font": "small", "shadow": ink})
		_draw_phrase(pieces[s], r.position.x + 20 + PAD, r.position.y, PH, pulse)
		_text(keys[s], r.position.x + 1, r.position.y - 6, T["dim"], {"font": "small", "shadow": ink})
		if asked:
			_arrow(r.position.x + floorf(r.size.x / 2.0), r.position.y - 8, T["accent"])
	var bar_top: float = plates[0].position.y
	if hover_skill >= 0 and not get_tree().paused:
		# what the move under the pointer does, words included
		var move: Dictionary = hero.loadout.r(hover_skill)
		var card: Array = []
		for l in move["lines"]:
			card.append_array(PF.wrap(l, 170, "small"))
		if hover_skill < 2:
			card.append("Click to change its words.")
		var cw := 178.0
		var ch := 14.0 + card.size() * 6.0
		var tx := clampf(floorf(W / 2.0 - cw / 2.0), 2.0, W - cw - 2.0)
		var ty := bar_top - ch - 10.0
		_box(tx, ty, cw, ch, T["bg"], T["edgeHi"])
		_text(move["name"], tx + 4, ty + 3, T["accent"])
		for k in card.size():
			_text(card[k], tx + 4, ty + 13 + k * 6, T["dim"] if k == card.size() - 1 and hover_skill < 2 else T["text"], {"font": "small"})
	# experience
	var xw := avail_r - avail_l
	_rect(avail_l, H - 3, xw, 2, T["ink"])
	if loot != null:
		_rect(avail_l, H - 3, roundf(xw * loot.xp / loot.xp_to_next(loot.level)), 2, T["accentLo"])

	# ---- level-up and interact prompts ----
	var pbh := 13.0
	var prompt_y := bar_top - 22
	_talent_button = Rect2()
	if loot != null and loot.points > 0:
		# (in the game L opens the level's choice; here it is made on the gear screen)
		var label := "LEVEL UP (I)"
		var w := 78.0
		_button(floorf(W / 2.0 - w / 2.0), prompt_y, w, pbh, label, false, true, pulse)
		prompt_y -= pbh + 3
	elif loot != null and hero != null and Talents.points(loot.level) > hero.talents.size():
		# THE SKILL TREES: a talent point is waiting (after the level's attribute, where both come at once)
		var label := "NEW TALENT"
		var w := _width(label) + 12
		_talent_button = Rect2(floorf(W / 2.0 - w / 2.0), prompt_y, w, pbh)
		_button(_talent_button.position.x, prompt_y, w, pbh, label, false, true, pulse)
		prompt_y -= pbh + 3
	if main != null:
		var p: Array = main.prompt()
		if p[0] != "":
			var hint: String = p[0].trim_prefix("E: ")
			var label2: String = hint + " (E)" if p[1] != "" else hint
			var w2 := _width(label2) + 12
			_button(floorf(W / 2.0 - w2 / 2.0), prompt_y, w2, pbh, label2, false, false, p[1] != "")

	# ---- top left: where we are, gold, and the inventory ----
	var spare: int = loot.spare() if loot != null else 0
	var lx := 4.0
	var btn_y := 24.0
	var btn_h := 13.0
	var place: String = _data["places"].get(main.place if main != null else "", main.place_title() if main != null else "")
	_text(place, 4, 3, T["text"], {"shadow": ink})
	_pic("gold", 4, 14)
	_text("%d" % (loot.gold if loot != null else 0), 4 + _pic_size("gold").x + 2, 14, T["gold"], {"font": "small", "shadow": ink})
	var inv_label := "INVENTORY (I)"
	var iw := _width(inv_label, "small") + 10
	_button(lx, btn_y, iw, btn_h, inv_label, true, spare > 0, spare > 0 and int(floorf(_t * 2.0)) % 2 == 0)
	_inv_button = Rect2(lx, btn_y, iw, btn_h)
	lx += iw + 3
	if spare > 0:
		# (spare words waiting for a place: the rune of the first of them, and how many he holds in all)
		var held: String = loot.first_spare()
		var wy := btn_y + floorf((btn_h - 12) / 2.0)
		_pic("word:" + held, lx, wy)
		_text("%d" % spare, lx + 14, wy + 4, Color(_data["word_color"][held]), {"font": "small", "shadow": ink})
	if loot != null and loot.quest != "":
		# (the Master Rune-stone while it is carried: art/quest3.ts)
		var st := _pic_size("stone")
		var sp: Array = _data["pics"]["stone"]
		var cx := lx + (26.0 if spare > 0 else 0.0) + 7
		var cy := btn_y + btn_h / 2.0
		_pic("stone", roundf(cx - sp[4] / 2.0), roundf(cy - sp[5] / 2.0), st.x, st.y)
	if loot != null and loot.meld == "stone":
		# (the Meldstone while it is carried, art/meld_drops.ts: from the moment it has dived into him (0.8 s after it was taken),
		# popping in a little bigger: ui/hud.ts)
		var g: float = float(loot._taken["g"]) if not loot._taken.is_empty() else 9.0
		if g >= 0.8:
			var since := g - 0.8
			var pop := 1.5 - since / 0.6 if since < 0.3 else 1.0
			var mp: Array = _data["pics"]["meldstone"]
			var ms := _pic_size("meldstone")
			var cx := lx + (26.0 if spare > 0 else 0.0) + (16.0 if loot.quest != "" else 0.0) + 7
			var cy := btn_y + btn_h / 2.0
			_pic("meldstone", roundf(cx - mp[4] / 2.0 * pop), roundf(cy - mp[5] / 2.0 * pop), ms.x * pop, ms.y * pop)

	# ---- the boss's bar ----
	var boss = _boss()
	var boss_up: bool = boss != null and not boss.dead and boss.state != "sleep" and not boss.waits
	# (and not before his own rules say he can be hit: the Swamp Colossus's as his first tentacles stand; game.ts bossShown, `hittable`)
	if boss_up and boss.h2 != null and boss.h2.has_method("hittable"):
		boss_up = boss.h2.hittable(boss)
	# (FLOOR 13'S DOUBLE BOSS: while both stand, a bar each, the Scraper's first, between the place's name and the small map: side
	# by side where both bars and both names fit there, else one under the other, each named in full where that fits, else by
	# its own kind's name: hud.ts boss bar)
	var shown: Array = []
	if boss_up:
		var pair = _partner(boss)
		shown = ([boss, pair] if boss.kind == "scraper" else [pair, boss]) if pair != null and pair.state != "sleep" else [boss]
	var two := shown.size() > 1
	var col_l := _width(place) + 10.0 if two else 0.0
	var mw := minf(66.0, floorf(W * 0.2))
	var col_r := W - mw - 10.0 if two else W
	var room := col_r - col_l
	var named := 0.0
	for b2 in shown:
		named = maxf(named, _width(b2.title))
	var side := two and room >= 2.0 * maxf(70.0, named) + 10.0
	var column := two and not side and room >= 70.0
	for i in shown.size():
		var b2 = shown[i]
		var bw := minf(maxf(110.0, named), floorf((room - 10.0) / 2.0)) if side else (minf(150.0, room) if column else minf(150.0, W - 160.0))
		var row := 0 if side else i
		var bx := col_l + floorf((room - (2.0 * bw + 10.0)) / 2.0) + i * (bw + 10.0) if side else (col_l + floorf((room - bw) / 2.0) if column else floorf(W / 2.0 - bw / 2.0))
		var by := 4.0 + row * 20.0
		var label: String = b2.title
		if two and not side and _width(b2.title) > (room if column else W - 160.0):
			label = str(b2.def.get("name", b2.title))
		_text(label, bx + floorf(bw / 2.0), by, P["fr4"], {"align": "center", "shadow": ink})
		_rect(bx - 1, by + 10, bw + 2, 6, T["ink"])
		_rect(bx, by + 11, bw, 4, T["lifeLo"])
		_rect(bx, by + 11, roundf(bw * maxf(0.0, b2.life) / b2.max_life), 4, T["life"])

	# ---- THE BELLS' CLOCK, under the boss's bar where that is up (act2/bells.gd clock) ----
	var rows := 0
	for i in shown.size():
		rows = maxi(rows, 1 + (0 if side else i))
	var bells_up: bool = main != null and main.bells != null and main.bells.on() and main.bells.clock(self, W, 4.0 + 20.0 * rows if boss_up else 4.0, ink, T["ink"])

	# ---- the prompt, and the word just found ----
	# (a word found is the bigger news: for its moment it takes the prompt's place, under the boss's bar where that is up; it
	# is not shown while the game is held)
	var toast_up: bool = loot != null and not loot.toast.is_empty() and not get_tree().paused
	var b: Dictionary = main.guide.banner(not boss_up and not toast_up) if main != null else {}
	if toast_up:
		_toast(loot.toast["word"], loot.toast["t"], 4.0 + (20.0 * rows if boss_up else 0.0) + (22.0 if bells_up else 0.0), loot.toast["big"], W)
	elif not b.is_empty() and not boss_up and not bells_up:
		_banner(b, W)

	# ---- what has just happened: above the flask, the newest lowest ----
	if loot != null:
		var msg_w := maxf(120.0, floorf(W / 2.0) - 62)
		var my := H - ps - 26
		for i in range(loot.msgs.size() - 1, maxi(-1, loot.msgs.size() - 5), -1):
			var m: Dictionary = loot.msgs[i]
			var parts: Array = PF.wrap(m["text"], msg_w)
			# (it goes over its last second)
			var a := clampf(float(m["life"]) - float(m["t"]), 0.0, 1.0)
			for k in range(parts.size() - 1, -1, -1):
				_text(parts[k], 4, my, Color(m["color"], a), {"shadow": Color(ink, a)})
				my -= 9

	# ---- what is said to him ----
	if words != "":
		var lines: Array = PF.wrap(words, 260)
		var bh := 10.0 + lines.size() * 9.0 + 12.0
		var bw2 := 276.0
		var bx2 := floorf((W - bw2) / 2.0)
		var by2 := floorf(H * 0.5)
		_box(bx2, by2, bw2, bh, T["bg"], T["edgeHi"])
		for i in lines.size():
			_text(lines[i], bx2 + 8, by2 + 6 + i * 9, T["text"], {"shadow": ink})
		_text("E: ON", bx2 + bw2 - 6, by2 + bh - 9, T["callHi"], {"align": "right", "font": "small"})

	if not card.is_empty():
		_boss_card(W, H)
	elif not floor_card.is_empty():
		_floor_card(W, H)


## The other of floor 13's pair, alive (pair.ts partnerOf): the Quill for the Scraper, the Scraper for the Quill.
func _partner(m):
	var want := "quill" if m.kind == "scraper" else ("scraper" if m.kind == "quill" else "")
	if want == "":
		return null
	for o in main._monsters.list:
		if is_instance_valid(o) and not o.dead and o.kind == want and o.pack_id == m.pack_id:
			return o
	return null


func _boss():
	if main == null or main._monsters == null:
		return null
	# (the floor's boss: the first that stands, floor 13's pair the one left when the other has fallen: game.ts kill, this.boss)
	var any = null
	for m in main._monsters.list:
		if is_instance_valid(m) and m.boss:
			if not m.dead:
				return m
			if any == null:
				any = m
	return any


# --- the attacks as they read: the words in front, the name, the words behind (hud.ts phrase, drawPhrase) ---

## The pieces of attack `s` as it reads: {kind: word | rune | empty | name | link, text, color, w, word, glow}: the words in
## its slots in front, its name, the words in its slots behind (loadout.gd: a slot not yet open is not there). `tight` 0
## writes every word out; 1 shows the words behind as their rune stones; 2 all of them (four long words do not fit).
func _phrase(s: int, tight: int) -> Array:
	var out: Array = []
	var front: Array = hero.loadout.front[s]
	var behind: Array = hero.loadout.behind[s]
	# (an empty socket glows while a word he holds could go into it right now: words.ts socketProblem)
	var glow_f := _fits(front)
	var glow_b := _fits(behind)
	for w in front:
		out.append(_word_piece(w, "front", tight >= 2) if w != null else _empty(glow_f))
	var name: String = String(_skills()[s]["name"]).to_upper()
	out.append({"kind": "name", "text": name, "color": P["white"], "w": _width(name)})
	var first := true
	for w in behind:
		if w == null:
			out.append(_empty(glow_b))
			continue
		var link := "of" if first else "and"
		out.append({"kind": "link", "text": link, "color": T["dim"], "w": _width(link, "small")})
		out.append(_word_piece(w, "behind", tight >= 1))
		first = false
	return out


## Could one of the words he holds go into that side's slots now?
func _fits(group: Array) -> bool:
	if loot == null or group.is_empty():
		return false
	for w in loot.held():
		if Words.socket_problem(group, w) == "":
			return true
	return false


## The pieces of move `s`'s whole name, each with its colour (ui/words.ts nameParts): [text, colour].
func _name_parts(s: int) -> Array:
	var parts: Array = []
	for w in hero.loadout.fronts(s):
		parts.append([_data["words"][w]["front"], Color(_data["word_color"][w])])
	parts.append([String(_skills()[s]["name"]).to_upper(), P["white"]])
	var first := true
	for w in hero.loadout.behinds(s):
		parts.append(["of" if first else "and", T["dim"]])
		parts.append([_data["words"][w]["behind"], Color(_data["word_color"][w])])
		first = false
	return parts


func _word_piece(w: String, form: String, rune: bool) -> Dictionary:
	var text: String = _data["words"][w][form]
	# (ACT 2, THE HUSH on him: his words written dark, hud.ts HUSHED)
	var c := HUSHED if hero.hush_t > 0.0 else Color(_data["word_color"][w])
	if rune:
		return {"kind": "rune", "text": text, "color": c, "w": 12.0, "word": w}
	return {"kind": "word", "text": text, "color": c, "w": _width(text), "word": w}


func _empty(glow: bool) -> Dictionary:
	return {"kind": "empty", "w": float(_data["sizes"]["slot_w"]), "glow": glow}


func _plate_w(ps: Array) -> float:
	var n := 0.0
	for p in ps:
		n += float(p["w"])
	return 20.0 + 4.0 + n + maxf(0.0, ps.size() - 1) * float(_data["sizes"]["piece_gap"]) + 4.0


func _draw_phrase(ps: Array, x0: float, y: float, h: float, pulse: bool) -> void:
	var x := x0
	var ty := y + floorf((h - 8) / 2.0)
	var sw := float(_data["sizes"]["slot_w"])
	var sh := float(_data["sizes"]["slot_h"])
	for p in ps:
		match p["kind"]:
			"word", "name":
				_text(p["text"], x, ty, p["color"], {"shadow": P["ink"]})
			"link":
				_text(p["text"], x, ty + 3, p["color"], {"font": "small"})
			"rune":
				var k: String = "word:" + p["word"]
				_pic(k, x, y + floorf((h - _pic_size(k).y) / 2.0))
			_:
				# an empty socket: a dark notch with a plus in it, glowing while a spare word could go in
				var sy := y + floorf((h - sh) / 2.0)
				var glow: bool = p["glow"]
				_rect(x, sy, sw, sh, (T["accent"] if pulse else T["accentLo"]) if glow else T["edge"])
				_rect(x + 1, sy + 1, sw - 2, sh - 2, (T["accentBg"] if pulse else T["accentBg2"]) if glow else T["slot"])
				var plus: Color = T["accent"] if glow else T["edge"]
				_rect(x + 3, sy + 6, 5, 1, plus)
				_rect(x + 5, sy + 4, 1, 5, plus)
		x += float(p["w"]) + float(_data["sizes"]["piece_gap"])


# --- WORD FOUND (hud.ts drawToast): the word just come by, at the top of the screen for a moment ---

## `big`: a new player's first word, the moment the game is about: its rune stone and its name large, with a line saying
## what a word is for (3 s and 0.5 to go); any other, the word on its tile (2.3 s and 0.5 to go). It drops into place.
func _toast(word: String, age: float, top: float, big: bool, W: float) -> void:
	var hue := Color(_data["word_color"][word])
	var name: String = String(_data["words"][word]["name"]).to_upper()
	var icon := "word:" + word
	var isz := _pic_size(icon)
	if big:
		var scale := 3 if W >= 380 else 2
		var nw := _width(name) * scale
		var line := "A power word. Words change your attacks."
		var small := _width(line) > W - 24
		var bw := minf(W - 8, maxf(nw + 12 * 2 + 12 + 24, _width(line, "small" if small else "normal") + 20))
		var bh := 14.0 + 9 * scale + 16
		var bx := floorf((W - bw) / 2.0)
		var by := top - roundf((1.0 - minf(1.0, age / 0.18)) * 10.0)
		var fade := maxf(0.0, 1.0 - (age - 3.0) / 0.5) if age > 3.0 else 1.0
		_box(bx, by, bw, bh, Color(P["white"] if age < 0.1 else T["bg"], 0.92 * fade), Color(hue, 0.92 * fade))
		_rect(bx + 2, by, bw - 4, 1.5, Color(hue, fade))
		_rect(bx + 2, by + bh - 1.5, bw - 4, 1.5, Color(hue, fade))
		_text("WORD FOUND", floorf(W / 2.0), by + 5, Color(T["accent"], fade), {"align": "center", "font": "small"})
		# the rune stone, twice its size, and the word beside it
		var tw := isz.x * 2 + 8 + nw
		var x := floorf((W - tw) / 2.0)
		var lit := age < 0.6 and int(floorf(age * 12.0)) % 2 == 0
		_pic(icon, x, by + 13 + floorf((9 * scale - isz.y * 2) / 2.0), isz.x * 2, isz.y * 2, Color(1, 1, 1, fade))
		_text(name, x + isz.x * 2 + 8, by + 13, Color(P["white"] if lit else hue, fade), {"scale": scale, "shadow": Color(P["ink"], fade)})
		_text(line, floorf(W / 2.0), by + 15 + 9 * scale, Color(T["text"], fade), {"align": "center", "font": "small" if small else "normal", "shadow": Color(P["ink"], fade)})
		return
	var tw2 := 16.0 + _width(name) + 5.0
	var bw2 := maxf(tw2, _width("WORD FOUND", "small")) + 14
	var bx2 := floorf((W - bw2) / 2.0)
	var by2 := top - roundf((1.0 - minf(1.0, age / 0.14)) * 8.0)
	var fade2 := maxf(0.0, 1.0 - (age - 2.3) / 0.5) if age > 2.3 else 1.0
	_box(bx2, by2, bw2, 32, Color(T["bg"], 0.9 * fade2), Color(hue, 0.9 * fade2))
	_text("WORD FOUND", floorf(W / 2.0), by2 + 3, Color(T["accent"], fade2), {"align": "center", "font": "small"})
	# (the word on its tile: ui/words.ts drawWordTile)
	var tx := floorf((W - tw2) / 2.0)
	var ty := by2 + 10
	_box(tx, ty, tw2, 18, Color(T["hot"] if age < 0.4 else T["bg2"], fade2), Color(hue, fade2))
	_rect(tx + 1, ty + 1, tw2 - 2, 1, Color(T["edgeHi"] if age < 0.4 else T["edge"], fade2))
	_pic(icon, tx + 2, ty + floorf((18 - isz.y) / 2.0), -1.0, -1.0, Color(1, 1, 1, fade2))
	_text(name, tx + 16, ty + floorf((18 - 8) / 2.0) + 1, Color(hue, fade2))


# --- the prompt at the top (hud.ts drawBanner): one large line and a smaller one under it ---

func _banner(b: Dictionary, W: float) -> void:
	# (QUESTS610, F9_LAIRS: a line for each thing to do, the ward-stone's hunt's DEFEAT each boss: _banner_lines)
	if b.has("lines"):
		_banner_lines(b, W)
		return
	var key: String = b["text"]
	if key != _banner_key:
		_banner_key = key
		_banner_at = _t
	var age := _t - _banner_at
	var max_w := W - 156 - 16
	var cap: String = b["caption"]
	var cap_color: Color = T["callHi"] if cap == "WORDSMITHING" else T["accent"]
	var cx := floorf(W / 2.0)
	var rows: Array = []  # [height, width, text, scale, font, kind]
	var scale := 2
	var parts: Array = PF.wrap(b["text"], floorf(max_w / 2.0))
	if parts.size() > 1:
		scale = 1
		parts = PF.wrap(b["text"], max_w)
	for r in parts:
		rows.append([9.0 * scale, _width(r) * scale, r, scale, "normal", "text"])
	var sub: String = b.get("sub", "")
	if sub != "":
		var font := "normal" if PF.wrap(sub, max_w).size() <= 2 else "small"
		var i := 0
		for r in PF.wrap(sub, max_w, font):
			rows.append([PF.line(font) + (1.0 if i == 0 else 0.0), _width(r, font), r, 1, font, "sub" if i > 0 else "sub0"])
			i += 1
	var cw := _width(cap, "small")
	var bh := 4.0 + 8.0 + 3.0
	for r in rows:
		cw = maxf(cw, r[1])
		bh += r[0]
	var bw := cw + 16
	var bx := floorf((W - bw) / 2.0)
	# (it drops into place when the prompt changes; a panel like any other, the game showing through it a little)
	var by := 3.0 - roundf((1.0 - minf(1.0, age / 0.16)) * 6.0)
	_box(bx, by, bw, bh, Color(T["bg"], 0.9), Color(cap_color if age < 0.55 else T["edgeHi"], 0.9))
	_text(cap, cx, by + 4, cap_color, {"align": "center", "font": "small"})
	var y := by + 12
	var fresh := age < 0.55 and int(floorf(age * 10.0)) % 2 == 0
	for r in rows:
		if r[5] == "text":
			_text(r[2], cx, y, P["white"] if fresh else T["accent"], {"align": "center", "scale": r[3], "shadow": P["ink"]})
		else:
			_text(r[2], cx, y + (1.0 if r[5] == "sub0" else 0.0), T["text"], {"align": "center", "font": r[4], "shadow": P["ink"]})
		y += r[0]


## (hud.ts drawBanner, its lines: QUESTS610's hunt, ui/guide.ts huntBanner) A line for each thing to do: to do, a tick box, what
## to do in the accent's colour (white as it flashes in) and what to do it to in white, large while every one of them fits; just
## done, flashing green; done half a second, a small ticked line in green.
var _ticked := {}


func _banner_lines(b: Dictionary, W: float) -> void:
	var lines: Array = b["lines"]
	var key := "fight:" + ",".join(lines.map(func(l): return str(l["id"])))
	if key != _banner_key:
		_banner_key = key
		_banner_at = _t
	var age := _t - _banner_at
	var max_w := W - 156 - 16
	var cap: String = b["caption"]
	var cap_color: Color = T["callHi"] if cap == "WORDSMITHING" else T["accent"]
	var cx := floorf(W / 2.0)
	var big := true
	for l in lines:
		if _width("%s %s" % [l["how"], l["what"]]) * 2.0 + 12.0 > max_w:
			big = false
	var rows: Array = []  # [height, width, line, scale, since]
	for l in lines:
		var id := "%s:%s" % [l["id"], l["how"]]
		if l["done"] and not _ticked.has(id):
			_ticked[id] = _t
		if not l["done"]:
			_ticked.erase(id)
		var since: float = _t - float(_ticked.get(id, _t)) if l["done"] else -1.0
		var text := "%s %s" % [l["how"], l["what"]]
		if l["done"] and since > 0.5:
			rows.append([8.0, 10.0 + _width(text, "small"), l, 0, since])
			continue
		var scale := 2 if big else 1
		rows.append([9.0 * scale + 1.0, 12.0 + _width(l["how"]) * scale + 4.0 * scale + _width(l["what"]) * scale, l, scale, since])
	var cw := _width(cap, "small")
	var bh := 4.0 + 8.0 + 3.0
	for r in rows:
		cw = maxf(cw, r[1])
		bh += r[0]
	var bw := cw + 16
	var bx := floorf((W - bw) / 2.0)
	var by := 3.0 - roundf((1.0 - minf(1.0, age / 0.16)) * 6.0)
	_box(bx, by, bw, bh, Color(T["bg"], 0.9), Color(cap_color if age < 0.55 else T["edgeHi"], 0.9))
	_text(cap, cx, by + 4, cap_color, {"align": "center", "font": "small"})
	var y := by + 12
	for r in rows:
		var l: Dictionary = r[2]
		var x := cx - floorf(r[1] / 2.0)
		var text := "%s %s" % [l["how"], l["what"]]
		if int(r[3]) == 0:
			_tick_box(x, y, true)
			_text(text, x + 10, y + 1, T["good"], {"font": "small", "shadow": P["ink"]})
		else:
			var scale: int = r[3]
			var hw := _width(l["how"]) * scale
			var since: float = r[4]
			var flash: bool = (int(floorf(since * 12.0)) % 2 == 0) if l["done"] else (age < 0.5 and int(floorf(age * 10.0)) % 2 == 0)
			_tick_box(x, y + (4.0 if scale == 2 else 1.0), l["done"])
			_text(l["how"], x + 12, y, T["good"] if l["done"] else (P["white"] if flash else T["accent"]), {"scale": scale, "shadow": P["ink"]})
			_text(l["what"], x + 12 + hw + 4 * scale, y, T["good"] if l["done"] else P["white"], {"scale": scale, "shadow": P["ink"]})
		y += r[0]


# --- THE BOSS'S NAME ACROSS THE SCREEN (ui/cards.ts drawBossCard) ---
## In the enemy's colours (pink and gold), large, dropped in with a flash from 1 s into his line, a rule running out to
## either side with a diamond at its end, a band of dark behind it; gone as he begins to fight.
const ENEMY_EDGE := Color("#ff4f8a")
const ENEMY_DEEP := Color("#7a1058")
const ENEMY_GOLD := Color("#ffd27a")
const ENEMY_LIGHT := Color("#fff0a0")
const ENEMY_INK := Color("#0d0716")
const NAME_AT := 1.0


func _boss_card(W: float, H: float) -> void:
	var n: String = card["name"]
	var name := n.to_upper() if n.to_lower().begins_with("the ") else "THE " + n.to_upper()
	var scale := 3
	while scale > 1 and _width(name) * scale > W - 40:
		scale -= 1
	var w := _width(name) * scale
	var h := 9.0 * scale
	var t: float = card["t"] - NAME_AT
	var left: float = card["secs"] - card["t"]
	if t < 0.0:
		return
	var a := clampf(t / 0.12, 0.0, 1.0) if left > 0.5 else clampf(left / 0.5, 0.0, 1.0)
	if a <= 0.0:
		return
	var ease := func(v: float) -> float: return 1.0 - (1.0 - v) * (1.0 - v)
	var cx := roundf(W / 2.0)
	var drop := roundf((1.0 - ease.call(clampf(t / 0.15, 0.0, 1.0))) * -8.0)
	var y := roundf(H * 0.62) + drop
	# a band of dark behind it, so that it reads over anything
	_rect(0, y - roundf(h * 0.45), W, roundf(h + h * 0.9), Color(ENEMY_INK, a * 0.55))
	# the rules run out to either side from the name's ends
	var out: float = ease.call(clampf((t - 0.08) / 0.45, 0.0, 1.0)) * minf(70.0, (W - w) / 2.0 - 12.0)
	var ry := y + roundf(h / 2.0)
	_rule(cx - w / 2.0 - 6, cx - w / 2.0 - 6 - out, ry, Color(ENEMY_EDGE, a), Color(ENEMY_GOLD, a))
	_rule(cx + w / 2.0 + 6, cx + w / 2.0 + 6 + out, ry, Color(ENEMY_EDGE, a), Color(ENEMY_GOLD, a))
	# (a flash as it lands: the letters white for a moment; after it, the lower half of the letters gold, a light from above)
	var flash := t < 0.2
	var k := maxi(1, scale / 2)
	_text(name, cx + k, y + 2 * k, Color(ENEMY_DEEP, a), {"align": "center", "scale": scale})
	for d in [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]:
		_text(name, cx + d[0] * k, y + d[1] * k, Color(ENEMY_EDGE, a), {"align": "center", "scale": scale})
	_text(name, cx, y, Color(Color.WHITE if flash else ENEMY_LIGHT, a), {"align": "center", "scale": scale})
	if not flash:
		PF.draw(self, name, cx, y, Color(ENEMY_GOLD, a), {"align": "center", "scale": scale, "from": roundf(h * 0.55)})


## The floor's name card for place `where` (hud.json floor_cards), up for FLOOR_NAMES.secs; a boss's card puts it away.
func floor_card_for(where: String) -> void:
	var c = _data.get("floor_cards", {}).get(where)
	# (a floor the table has not: its names as its layout has them, defs.ts floorTitle)
	if c == null and main != null and main.map != null and main.map.title.has("name"):
		c = main.map.title
	if c == null:
		return
	floor_card = {"name": c["name"], "level": c["level"], "t": 0.0, "secs": float(_data.get("floor_card_secs", 3.4))}
	card = {}


# --- THE FLOOR'S NAME ACROSS THE SCREEN (ui/cards.ts drawFloorCard) ---
## In the stone's pale violet, large, with its level under it in the small letters, spaced out, between two short rules; it
## fades in (0.5 s, dropping 4 pixels) and out (the last 0.8 s).
const STONE_EDGE := Color("#2a2466")
const STONE_FACE := Color("#ece8ff")
const STONE_UNDER := Color("#b0a4e0")
const STONE_SMALL := Color("#a3abd8")
const STONE_INK := Color("#07050a")


func _floor_card(W: float, H: float) -> void:
	var name: String = str(floor_card["name"]).to_upper()
	var scale := 2
	while scale > 1 and _width(name) * scale > W - 32:
		scale -= 1
	var h := 9.0 * scale
	var t: float = floor_card["t"]
	var secs: float = floor_card["secs"]
	var a := clampf(t / 0.5, 0.0, 1.0) if t < secs - 0.8 else clampf((secs - t) / 0.8, 0.0, 1.0)
	if a <= 0.0:
		return
	var e := 1.0 - (1.0 - clampf(t / 0.5, 0.0, 1.0)) * (1.0 - clampf(t / 0.5, 0.0, 1.0))
	var cx := roundf(W / 2.0)
	var y := roundf(H * 0.2) + roundf((1.0 - e) * 4.0)
	var k := maxi(1, scale / 2)
	_text(name, cx + k, y + 2 * k, Color(STONE_INK, a), {"align": "center", "scale": scale})
	for d in [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]:
		_text(name, cx + d[0] * k, y + d[1] * k, Color(STONE_EDGE, a), {"align": "center", "scale": scale})
	_text(name, cx, y, Color(STONE_FACE, a), {"align": "center", "scale": scale})
	PF.draw(self, name, cx, y, Color(STONE_UNDER, a), {"align": "center", "scale": scale, "from": roundf(h * 0.55)})
	# the level under it, its letters spaced out, between two short rules
	var level: String = str(floor_card["level"]).to_upper()
	var gap := 2.0
	var widths: Array = []
	var lw := 0.0
	for i in level.length():
		var ch := level[i]
		var cw := 3.0 if ch == " " else PF.width(ch, "small")
		widths.append(cw)
		lw += cw
	lw += gap * (level.length() - 1)
	var x := cx - roundf(lw / 2.0)
	var ly := y + h + 5.0
	for i in level.length():
		var ch := level[i]
		if ch != " ":
			PF.draw(self, ch, x + 1, ly + 1, Color(STONE_INK, a), {"font": "small"})
			PF.draw(self, ch, x, ly, Color(STONE_SMALL, a), {"font": "small"})
		x += widths[i] + gap
	var ry := ly + 2.0
	_rule(cx - lw / 2.0 - 5, cx - lw / 2.0 - 5 - 18, ry, Color(STONE_UNDER, a), Color(STONE_FACE, a))
	_rule(cx + lw / 2.0 + 5, cx + lw / 2.0 + 5 + 18, ry, Color(STONE_UNDER, a), Color(STONE_FACE, a))


func _rule(x0: float, x1: float, y: float, c: Color, tip: Color) -> void:
	var a := minf(x0, x1)
	var b := maxf(x0, x1)
	if b - a < 2:
		return
	_rect(roundf(a), roundf(y), roundf(b - a), 1, c)
	var tx := roundf(x1)
	var ty := roundf(y)
	_rect(tx - 1, ty - 1, 3, 3, tip)
	_rect(tx, ty - 2, 1, 5, tip)
	_rect(tx - 2, ty, 5, 1, tip)


## His three moves as the bar shows them: his class's own (hud.json skillsOf; tools/godot_hud.ts), the Warrior's where there is none.
func _skills() -> Array:
	var of: Dictionary = _data.get("skillsOf", {})
	# (THE WARLOCK AS THE DEMON: its three on his buttons)
	if hero != null and hero.kit != null and hero.kit.get("form") == "demon" and of.has(hero.cls + ":demon"):
		return of[hero.cls + ":demon"]
	# (THE WARRIOR'S BATTLE AXE AND WARHAMMER: their three on his buttons once his tree picks one: hero.gd arm)
	if hero != null and hero.cls == "warrior" and of.has("warrior:" + str(hero.weapon)):
		return of["warrior:" + str(hero.weapon)]
	# (THE MAGE'S AND THE RANGER'S MOVES TO LEARN: whatever is in each place now, its own name and icon: hud.json `skillInfo`)
	var info: Dictionary = _data.get("skillInfo", {})
	if hero != null and not hero.loadout.form_moves.is_empty() and of.has(hero.cls) and hero.cls in ["mage", "ranger"]:
		var out: Array = []
		for i in 3:
			var id: String = hero.loadout.id(i)
			var base: Dictionary = of[hero.cls][i]
			if info.has(id) and id != base["id"]:
				var d: Dictionary = (info[id] as Dictionary).duplicate()
				d["key"] = "LEFT CLICK" if i == 0 else ("HOLD RIGHT CLICK" if float(d["channel"]) > 0.0 else "RIGHT CLICK")
				out.append(d)
			else:
				out.append(base)
		return out
	if hero != null and of.has(hero.cls):
		return of[hero.cls]
	return _data["skills"]
