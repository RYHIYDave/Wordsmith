## THE CLASS CARDS: CHOOSE A CLASS (ui/panels.ts drawTitle, its page of class cards, CARDS3 on: “Can I get the character select
## screen to have a confirm? Button when you select a character”, and “And can it be 3 across 2 rows for portraits”; main.ts
## pickClass, enter): a new game, with no hero saved, begins here.
##   Over the start screen's picture (art/title_ring.ts, the ring on the hill: assets/title/ring.png, its still, tools/godot_title.mjs)
## put back into the dark, the name of the game and "Choose a class"; under them the six heroes' cards, three across in two rows,
## each on its side: the hero on its left, down and to the right (art/sides.ts CARD_FACING), standing, in town dress (the cards
## bake, assets/heroes/cards.json); beside them the name in the colour of the class's attribute, its words, its three moves as the
## buttons carry them, and its numbers. A card under the pointer, or chosen, is lit and its hero runs on the spot; chosen, a second
## line of white inside its edge. Left standing, each in turn does a thing of their own (the first a second and a half after the
## cards come up, each next 2.6 s later, then every 4.2 s: render/figure.ts reset, standingFrame). At the foot: the MODE (Normal
## or Hardcore, game/modes.ts, kept for life; what it means under the cards) and CONFIRM, lit once a card is chosen. A number
## chooses a card, Enter confirms.
##   CONFIRMED: the hero picked MAKES READY on their card (their art's `ready`: draws their weapon and stands as they fight), the
## other five stand back in the dark; then they come apart in slices and fade (render/figure.ts drawPhased, ENTER_OUT), the warp
## heard as they begin to go; a press lets them go at once. The run begins, and they warp in where it begins (main.gd). A hero with
## no such picture (the Tinkerer, the Brawler) begins at once.
##   Each hero's scarf, feather or braids moves on their card (tails.gd), and the pool of light behind them (figure_glow.gd).
##   BACK, at the foot's left, goes back to the start screen's menu (title.gd), as Escape does; Escape while a hero makes ready
## stands them down, the cards as they were. Laid over the start screen (title.gd, `over_pic`) the picture behind is the start
## screen's own, alive (title_ring.gd), put back into the dark; a check of the cards alone has its still. A hero saved, CONFIRM
## asks first (`gate`, main.ts pickClass: "Press CONFIRM again to start over. Your saved <class> will be lost.", `note`, said
## above the foot in the colour of what is lost, in place of what the mode means).
##   THE HEROES FOR SALE (shop.gd, PAID_HEROES): a hero for sale and not bought has a padlock and the price in its card's top
## left corner (the padlock alone where the card is too narrow, held upright); chosen, CONFIRM is BUY and the price, and a line over the foot says what it is (in place of what the mode means).
## BUY brings up Google Play's own purchase sheet; bought, the padlock goes, UNLOCKED shines on the card a moment, and CONFIRM
## comes back.
extends Control

signal picked(cls: String, mode: String)
signal back

const PF := preload("res://scripts/pixel_font.gd")
const BakedHero := preload("res://scripts/baked_hero.gd")
const Tails := preload("res://scripts/tails.gd")
const Glow := preload("res://scripts/figure_glow.gd")

var main  # main.gd
var sfx  # sfx.gd
## NORMAL OR HARDCORE (game/modes.ts): the mode the next hero is made in, remembered by the cards (main.ts meta.mode)
var mode := "normal"
## (in shot mode, where the pointer is taken to be, game pixels; null: the mouse)
var pointer = null

var D := {}  # assets/heroes/clips.json
var K := {}  # its `cards`
var H := {}  # assets/hud/hud.json
var T := {}
var P := {}
var _hud: Texture2D
var _ring: Texture2D
var _art := {}  # cls -> BakedHero of the cards bake
var _fig := {}  # cls -> the figure's state (render/figure.ts Figure, what a card's hero needs of it)
var _layers := {}  # cls -> {clip, root, aura, body, lights}
var chosen := ""
## the hero picked making ready: {cls, t, long, heard}, empty when none
var entering := {}
var t := 0.0
var _seen := -10.0
var _press = null
var _back: Control
var _front: Control
var _clip_rects := {}
## (laid over the start screen, whose living picture is behind: title.gd)
var over_pic := false
## (a line of warning over the foot, or ""; a hero saved: title.gd)
var note := ""
## (asked before a hero picked makes ready: false, not yet: title.gd, a saved hero's warning)
var gate := Callable()
## (a test hero's cards, the level select's: no mode, a test hero is Normal; main.ts `mode: ... !titleUi.practice`)
var no_mode := false
## (a hero just bought: class -> seconds since, for UNLOCKED on its card)
var _unlocked := {}


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	process_mode = Node.PROCESS_MODE_ALWAYS
	D = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/clips.json"))
	K = D["cards"]
	H = JSON.parse_string(FileAccess.get_file_as_string("res://assets/hud/hud.json"))
	for k in H["theme"]:
		T[k] = Color(H["theme"][k])
	for k in H["palette"]:
		var v = H["palette"][k]
		if v is String and v.begins_with("#"):
			P[k] = Color(v)
	_hud = load("res://assets/hud/hud.png")
	_ring = load("res://assets/title/ring.png")
	_back = Control.new()
	_back.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_back.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_back.draw.connect(_draw_back)
	add_child(_back)
	for c in K["order"]:
		_art[c] = BakedHero.new("res://assets/heroes", "cards", "card", c)
		_fig[c] = _new_fig()
		var clip := Control.new()
		clip.clip_contents = true
		clip.mouse_filter = Control.MOUSE_FILTER_IGNORE
		add_child(clip)
		var root := Node2D.new()
		root.scale = Vector2(2, 2)
		clip.add_child(root)
		var L := {"clip": clip, "root": root}
		for part in ["aura", "body", "lights"]:
			var n := Node2D.new()
			if part != "body":
				n.material = Glow.added()
			n.draw.connect(_draw_fig.bind(c, part, n))
			root.add_child(n)
			L[part] = n
		_layers[c] = L
	_front = Control.new()
	_front.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_front.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_front.draw.connect(_draw_front)
	add_child(_front)
	var sh = _shop()
	if sh != null:
		sh.bought.connect(_on_bought)


## The heroes for sale (shop.gd), or null.
func _shop():
	return main.get("shop") if main != null else null


## Whether a class is for sale and not yet bought.
func _locked(cls: String) -> bool:
	var sh = _shop()
	return sh != null and sh.locked(cls)


## BUY and the price ("BUY $0.99").
func _buy_label(cls: String) -> String:
	var sh = _shop()
	if sh != null and sh.busy == cls:
		return "WAIT..."
	return "BUY %s" % (sh.price(cls) if sh != null else "")


func _on_bought(cls: String) -> void:
	_unlocked[cls] = 0.0
	if sfx != null:
		sfx.play("rare")


## render/figure.ts Figure, as much of it as a card's hero uses: standing, running on the spot, coming to a stand out of the run,
## the things done left standing, and the tails.
func _new_fig() -> Dictionary:
	return {"stood": 0.0, "wait": 4.0, "turn": 0, "gap": 0.0, "doing": 0, "doingT": 0.0, "loopFrom": 0.0, "runAt": -1.0, "sinceStop": -1.0,
		"stopOf": 0, "tails": Tails.new(D["tails"]), "shown": {}, "gone": 0.0}


## figure.ts reset: a card that has just come on screen. `wait` before the first thing done; `turn`, which of the two first; `gap`
## between one and the next.
func _reset(F: Dictionary, wait: float, turn: int, gap: float) -> void:
	F["stood"] = 0.0
	F["wait"] = wait
	F["turn"] = turn
	F["gap"] = gap
	F["doing"] = 0
	F["doingT"] = 0.0
	F["loopFrom"] = 0.0
	F["runAt"] = -1.0
	F["sinceStop"] = -1.0
	F["tails"].reset()


static func _frame_of(c: Dictionary, secs: float) -> int:
	var n := int(c["n"])
	return clampi(int(floorf(secs * float(c["fps"]) + 1e-6)), 0, n - 1)


## figure.ts frame, for a card: [list, frame] of the front's lists (art/heroes3.ts bakeLists: 0 standing, 2 the run, 6 to 13 the
## stops, 113 and 114 the things done standing).
func _fig_frame(F: Dictionary, cls: String, anim: String, anim_t: float, dt: float, gestures: bool) -> Array:
	var C: Dictionary = D[cls]["card"]
	var standing := anim == "idle"
	if not standing or not gestures:
		F["doing"] = 0
		F["stood"] = 0.0
		F["loopFrom"] = 0.0
	var ran_at: float = F["runAt"]
	F["runAt"] = -1.0
	var s: Array
	if anim == "walk":
		# (a card's hero runs on the spot, by the clock)
		var n := int(C["walk"])
		var i := posmod(int(floorf(anim_t * float(C["walkFps"]))), n)
		s = [2, i]
		F["runAt"] = float(i) / n
		F["sinceStop"] = -1.0
	else:
		# COMING TO A STAND OUT OF THE RUN (AnimSet.stops): the stop from the moment of the run nearest where it was
		var stops: Array = C["stops"]
		if ran_at >= 0.0 and not stops.is_empty():
			F["sinceStop"] = 0.0
			F["stopOf"] = roundi(ran_at * stops.size()) % stops.size()
		elif F["sinceStop"] >= 0.0:
			F["sinceStop"] += dt
		var stop = stops[F["stopOf"]] if F["sinceStop"] >= 0.0 and not stops.is_empty() else null
		if stop != null and F["sinceStop"] < (float(stop["n"]) - 1.0) / float(stop["fps"]):
			s = [6 + int(F["stopOf"]), _frame_of(stop, F["sinceStop"])]
			F["loopFrom"] = anim_t
			F["stood"] = 0.0
		else:
			F["sinceStop"] = -1.0
			s = _standing(F, C, anim_t, dt, standing and gestures)
	if anim == "walk":
		F["sinceStop"] = -1.0
	return s


## figure.ts standingFrame: the standing loop, or the thing done in place of it (idleA, idleB, by turns), begun as the loop comes
## round to its first frame.
func _standing(F: Dictionary, C: Dictionary, anim_t: float, dt: float, free: bool) -> Array:
	var fps := float(C["idleFps"])
	var n := int(C["idle"])
	var a = C["idleA"]
	var b = C["idleB"]
	if F["doing"] != 0:
		var c = a if F["doing"] == 1 else b
		F["doingT"] += dt
		if c != null and F["doingT"] < (float(c["n"]) - 1.0) / float(c["fps"]):
			return [113 if F["doing"] == 1 else 114, _frame_of(c, F["doingT"])]
		F["doing"] = 0
		F["stood"] = 0.0
		F["wait"] = F["gap"] if F["gap"] > 0.0 else 5.0 + randf() * 4.0
		F["loopFrom"] = anim_t
	var at := int(floorf(maxf(0.0, anim_t - F["loopFrom"]) * fps))
	var i := posmod(at, n)
	if free and (a != null or b != null):
		F["stood"] += dt
		if F["stood"] >= F["wait"] and i == 0 and dt > 0.0:
			var pick_b: bool = (F["turn"] % 2 == 1 and b != null) or a == null
			F["doing"] = 2 if pick_b else 1
			F["turn"] += 1
			F["doingT"] = 0.0
			return [114 if pick_b else 113, 0]
	return [0, i]


# --- where everything is (drawTitle, the class page) -----------------------------------------------------------------------

func _W() -> float:
	return floorf(size.x / 2.0)


func _H() -> float:
	return floorf(size.y / 2.0)


func _big() -> int:
	return 3 if _W() >= 380 else 2


func _layout() -> Dictionary:
	var W := _W()
	var Hh := _H()
	var ids: Array = K["order"]
	var across := mini(3, ids.size())
	var rows := ceili(float(ids.size()) / across)
	var gap := 4.0
	var y0 := 6.0 + 9.0 * _big() + 11.0
	var cw := minf(168.0, floorf((W - 12.0 - gap * (across - 1)) / across))
	var ch := minf(96.0, floorf((Hh - 22.0 - 12.0 - y0 - gap * (rows - 1)) / rows))
	var total := cw * across + gap * (across - 1)
	var x0 := floorf((W - total) / 2.0)
	var cards: Array = []
	for i in ids.size():
		cards.append(Rect2(x0 + (i % across) * (cw + gap), y0 + floorf(float(i) / across) * (ch + gap), cw, ch))
	var back_w := _width("BACK") + 20.0
	var back := Rect2(4, Hh - 22, back_w, 18)
	var mode_w := maxf(_width("MODE: HARDCORE"), _width("MODE: NORMAL")) + 16.0
	var confirm_w := _width("CONFIRM") + 28.0
	for c in ids:
		if _locked(c):
			confirm_w = maxf(confirm_w, _width(_buy_label(c)) + 28.0)
	var voice_x := W - 4.0  # (VOICE_TOGGLE off: no voice button; its place the screen's edge)
	var beside := back_w + mode_w + 0.0 + 24.0 + confirm_w + 12.0 <= W
	var mode_r := Rect2(back.position.x + back_w + 6.0, Hh - 22, mode_w, 18) if beside else Rect2(floorf((W - mode_w) / 2.0), Hh - 44, mode_w, 18)
	var lo := mode_r.end.x + 6.0 if beside and not no_mode else back.position.x + back_w + 6.0
	var hi := voice_x - 6.0
	var cx := maxf(lo, minf(hi - confirm_w, floorf((W - confirm_w) / 2.0)))
	return {"cards": cards, "cw": cw, "ch": ch, "rows": rows, "gap": gap, "y0": y0, "end": y0 + rows * ch + gap * (rows - 1), "mode": mode_r, "confirm": Rect2(cx, Hh - 22, confirm_w, 18), "back": back}


func _width(s: String, font := "normal") -> float:
	return PF.width(s, font)


func _pointer() -> Vector2:
	if pointer != null:
		return pointer
	return get_local_mouse_position() / 2.0


# --- what is pressed ---------------------------------------------------------------------------------------------------------

func _gui_input(e: InputEvent) -> void:
	if e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
		_press = e.position / 2.0
		accept_event()


## A press at (x, y), game pixels (shot mode presses through this).
func press_at(p: Vector2) -> void:
	_press = p


func _unhandled_key_input(e: InputEvent) -> void:
	if not (e is InputEventKey and e.pressed and not e.echo):
		return
	var k: int = e.keycode
	if k == KEY_ESCAPE:
		# (Escape: a hero making ready stands down, the cards as they were; else back to the start screen's menu)
		if not entering.is_empty():
			entering = {}
		else:
			_click()
			back.emit()
		get_viewport().set_input_as_handled()
		return
	if not entering.is_empty():
		return
	var ids: Array = K["order"]
	if k >= KEY_1 and k < KEY_1 + ids.size():
		chosen = ids[k - KEY_1]
		_click()
		get_viewport().set_input_as_handled()
	elif (k == KEY_ENTER or k == KEY_KP_ENTER) and chosen != "":
		_pick(chosen)
		get_viewport().set_input_as_handled()


func _click() -> void:
	if sfx != null:
		sfx.play("click")


## main.ts pickClass: the warp, where the art has a picture of the hero making ready; else the run begins at once.
func _pick(cls: String) -> void:
	# (a hero for sale and not bought: BUY, Google Play's purchase sheet)
	if _locked(cls):
		var sh = _shop()
		if sh.busy == "":
			_click()
			sh.buy(cls)
		return
	if gate.is_valid() and not gate.call(cls):
		return
	_click()
	var ready = D[cls]["card"]["ready"]
	if ready != null:
		entering = {"cls": cls, "t": 0.0, "long": (float(ready["n"]) - 1.0) / float(ready["fps"]) + float(K["enterOut"]), "heard": false}
		return
	picked.emit(cls, mode)


func _process(dt: float) -> void:
	t += dt
	for c in _unlocked.keys():
		_unlocked[c] += dt
		if _unlocked[c] > 2.0:
			_unlocked.erase(c)
	var L := _layout()
	var ids: Array = K["order"]
	# (the cards just come on screen: none chosen yet, each hero's figure from the start)
	var fresh := t - _seen > 0.5 or t < _seen
	if fresh:
		chosen = ""
		for i in ids.size():
			_reset(_fig[ids[i]], 1.5 + i * 2.6, i, 4.2)
	var fdt := 0.0 if fresh else t - _seen
	_seen = t
	# (the hero picked making ready: the warp heard as they begin to go; gone, the run begins; a press lets them go at once)
	if not entering.is_empty():
		entering["t"] += dt
		if not entering["heard"] and entering["t"] >= entering["long"] - float(K["enterOut"]):
			entering["heard"] = true
			if sfx != null:
				sfx.play("dodge")
		if entering["t"] >= entering["long"] or (_press != null and entering["t"] > 0.15):
			_press = null
			var c: String = entering["cls"]
			entering = {}
			picked.emit(c, mode)
			return
	var p = _press
	_press = null
	if p != null and entering.is_empty():
		for i in ids.size():
			if L["cards"][i].has_point(p):
				if chosen != ids[i]:
					chosen = ids[i]
					_click()
				p = null
				break
	if p != null and entering.is_empty() and not no_mode and L["mode"].has_point(p):
		mode = "normal" if mode == "hardcore" else "hardcore"
		_click()
		p = null
	if p != null and entering.is_empty() and chosen != "" and L["confirm"].has_point(p):
		_pick(chosen)
		p = null
	if p != null and entering.is_empty() and L["back"].has_point(p):
		_click()
		back.emit()
	# each card's hero
	var hp := _pointer()
	for i in ids.size():
		var c: String = ids[i]
		var r: Rect2 = L["cards"][i]
		var F: Dictionary = _fig[c]
		var mine: bool = not entering.is_empty() and entering["cls"] == c
		var hot: bool = entering.is_empty() and r.has_point(hp)
		var talks: bool = mine or chosen == c
		var shown: Dictionary
		F["gone"] = 0.0
		if mine and D[c]["card"]["ready"] != null:
			var ready: Dictionary = D[c]["card"]["ready"]
			var long := (float(ready["n"]) - 1.0) / float(ready["fps"])
			var k := clampi(int(floorf(minf(entering["t"], long) * float(ready["fps"]) + 1e-6)), 0, int(ready["n"]) - 1)
			shown = _art[c].frame(0, 115, k)
			F["gone"] = minf(1.0, (entering["t"] - long) / float(K["enterOut"])) if entering["t"] > long else 0.0
		else:
			var lf := _fig_frame(F, c, "walk" if (hot or talks) and not mine else "idle", t, fdt, entering.is_empty())
			var art: BakedHero = _art[c]
			if art.count(0, lf[0]) == 0:
				lf = [0, 0]
			shown = art.frame(0, lf[0], mini(lf[1], art.count(0, lf[0]) - 1))
		F["shown"] = shown
		var part: Dictionary = shown["part"]
		F["tails"].step(fdt, part.get("tails", []), float(part["ax"]), float(part["ay"]), 1.0, 0.0, 0.0)
		F["tails"].refresh()
		# (the figure stands on the foot of its card, at the left; the Warlock, wider, a little further in; the whole card its room)
		var port_w := minf(70.0, floorf(r.size.x * 0.42))
		var fx := r.position.x + floorf(port_w / 2.0) + (8.0 if c == "warlock" else 0.0)
		var fy := r.position.y + r.size.y - 4.0
		var Ly: Dictionary = _layers[c]
		Ly["clip"].position = (r.position + Vector2(1, 1)) * 2.0
		Ly["clip"].size = (r.size - Vector2(2, 2)) * 2.0
		Ly["root"].position = (Vector2(fx, fy) - r.position - Vector2(1, 1)) * 2.0
		Ly["root"].scale = Vector2(1, 1)
		for part_ in ["aura", "body", "lights"]:
			Ly[part_].queue_redraw()
	_back.queue_redraw()
	_front.queue_redraw()


# --- drawing -----------------------------------------------------------------------------------------------------------------

func _rect(ci: CanvasItem, x: float, y: float, w: float, h: float, c: Color) -> void:
	if w > 0.0 and h > 0.0:
		ci.draw_rect(Rect2(x, y, w, h), c)


## ui.ts box: a block of `fill` rimmed in `edge`, its corners cut by half a game pixel.
func _box(ci: CanvasItem, x: float, y: float, w: float, h: float, fill: Color, edge: Color) -> void:
	_rect(ci, x + 1, y, w - 2, h, edge)
	_rect(ci, x, y + 1, w, h - 2, edge)
	_rect(ci, x + 0.5, y + 0.5, w - 1, h - 1, edge)
	_rect(ci, x + 1, y + 0.5, w - 2, h - 1, fill)
	_rect(ci, x + 0.5, y + 1, w - 1, h - 2, fill)


func _text(ci: CanvasItem, s: String, x: float, y: float, c: Color, opts := {}) -> void:
	PF.draw(ci, s, x, y, c, opts)


## ui.ts drawButton (no pointer over it in the way: the cards' own hover only)
func _button(ci: CanvasItem, r: Rect2, label: String, opts := {}) -> void:
	var hot: bool = not opts.get("disabled", false) and r.has_point(_pointer())
	if opts.get("disabled", false):
		_box(ci, r.position.x, r.position.y, r.size.x, r.size.y, T["bg"], T["edge"])
	elif opts.get("primary", false):
		_box(ci, r.position.x, r.position.y, r.size.x, r.size.y, T["callHi"] if hot or opts.get("lit", false) else T["call"], P["white"] if hot else T["callHi"])
	else:
		_box(ci, r.position.x, r.position.y, r.size.x, r.size.y, T["hot"] if hot or opts.get("lit", false) else T["bg2"], T["accent"] if hot else T["edgeHi"])
	var col: Color = T["faint"] if opts.get("disabled", false) else (P["white"] if opts.get("primary", false) else opts.get("color", T["text"]))
	_text(ci, label, r.position.x + floorf(r.size.x / 2.0), r.position.y + floorf((r.size.y - 8.0) / 2.0) + 1.0, col, {"align": "center"})


func _draw_back() -> void:
	var ci := _back
	ci.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	var W := _W()
	var Hh := _H()
	var night := Color(K["smithNight"])
	if not over_pic:
		_rect(ci, 0, 0, W, Hh, night)
		# the start screen's picture where its layout puts it (smithLayout: the row under the ring's front stones `lift` above the
		# foot)
		var R: Dictionary = K["ring"]
		var wide := W >= 400.0 or W >= Hh * 1.3
		var head_room := float(R["lip"]) - float(R["headTop"]) + 9.0 * 2.0 + 6.0
		var lift := maxf(float(R["least"]), minf(float(R["lift"]), Hh - head_room))
		if not wide:
			lift = maxf(float(R["least"]), minf(float(R["under"]) + float(R["most"]) * 24.0 + (float(R["most"]) - 1.0) * 4.0 + 6.0, Hh - head_room))
		var oy := Hh - lift - float(R["lip"])
		ci.draw_texture(_ring, Vector2(floorf((W - float(R["w"])) / 2.0), oy))
	# (the picture put back into the dark for the cards)
	var veil := night
	veil.a = 0.74
	_rect(ci, 0, 0, W, Hh, veil)
	var L := _layout()
	var ids: Array = K["order"]
	var hp := _pointer()
	for i in ids.size():
		var c: String = ids[i]
		var r: Rect2 = L["cards"][i]
		var mine: bool = not entering.is_empty() and entering["cls"] == c
		var hot: bool = entering.is_empty() and r.has_point(hp)
		var is_chosen := chosen == c
		var talks := mine or is_chosen
		var col := Color(K["attrColor"][K["classes"][c]["primary"]])
		_box(ci, r.position.x, r.position.y, r.size.x, r.size.y, T["hot"] if hot or talks else T["bg"], P["white"] if talks else (T["accent"] if hot else col))
		if is_chosen and entering.is_empty():
			# (chosen: a second line of white inside its edge)
			ci.draw_rect(Rect2(r.position.x + 1.5, r.position.y + 1.5, r.size.x - 3.0, r.size.y - 3.0), P["white"], false, 1.0)


func _draw_front() -> void:
	var ci := _front
	ci.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	var W := _W()
	var Hh := _H()
	var big := _big()
	_text(ci, str(K["title"]), floorf(W / 2.0), 6, T["text"], {"align": "center", "scale": big, "shadow": T["call"]})
	var pitch := "Choose a class"
	_text(ci, pitch, floorf(W / 2.0), 6 + 9 * big + 1, T["text"], {"align": "center", "font": "normal" if _width(pitch) <= W - 8 else "small"})
	var L := _layout()
	var ids: Array = K["order"]
	for i in ids.size():
		var c: String = ids[i]
		var cl: Dictionary = K["classes"][c]
		var r: Rect2 = L["cards"][i]
		var x := r.position.x
		var cy := r.position.y
		var cw := r.size.x
		var ch := r.size.y
		var port_w := minf(70.0, floorf(cw * 0.42))
		var tx := x + port_w + floorf((cw - port_w - 2.0) / 2.0)
		var tw := cw - port_w - 6.0
		var y := cy + 5.0
		_text(ci, str(cl["name"]), tx, y, Color(K["attrColor"][cl["primary"]]), {"align": "center"})
		y += 11.0
		for part in PF.wrap(str(cl["blurb"]), tw, "small"):
			_text(ci, part, tx, y, T["text"], {"align": "center", "font": "small"})
			y += 6.0
		# THEIR THREE MOVES, AS ICONS, on the foot of the card, with the numbers under them
		var kit: Array = H["skillsOf"][c]
		var slot := 18.0 if ch >= 135.0 else 16.0
		var attrs_y := cy + ch - 8.0
		var icons_y := attrs_y - 1.0 - slot
		var ix := tx - floorf((kit.size() * slot + (kit.size() - 1) * 4.0) / 2.0)
		for sk in kit:
			_box(ci, ix, icons_y, slot, slot, T["slot"], T["edgeHi"])
			var pic: Array = H["pics"].get("ability:" + str(sk["icon"]), [])
			if not pic.is_empty():
				var iw := float(pic[2]) / 2.0
				var ih := float(pic[3]) / 2.0
				ci.draw_texture_rect_region(_hud, Rect2(ix + floorf((slot - iw) / 2.0), icons_y + floorf((slot - ih) / 2.0), iw, ih), Rect2(pic[0], pic[1], pic[2], pic[3]))
			ix += slot + 4.0
		var A: Dictionary = cl["attrs"]
		_text(ci, "STR %d DEX %d INT %d" % [int(A["str"]), int(A["dex"]), int(A["int"])], tx, attrs_y, T["dim"], {"align": "center", "font": "small"})
		if _locked(c):
			_price_tag(ci, r, c, tx - floorf(_width(str(cl["name"])) / 2.0))
		elif _unlocked.has(c):
			# (just bought: UNLOCKED a moment where the price was, in the friend's cyan, then gone)
			var k: float = _unlocked[c]
			var a := clampf(minf(k / 0.15, (2.0 - k) / 0.5), 0.0, 1.0)
			var uw := _width("UNLOCKED", "small") + 8.0
			_box(ci, x + 3.0, cy + 3.0, uw, 12.0, Color(T["ink"], a), Color(T["accent"], a))
			_text(ci, "UNLOCKED", x + 7.0, cy + 6.0, Color(T["accent"], a), {"font": "small"})
		if not entering.is_empty() and entering["cls"] != c:
			# (they stand back in the dark while the one picked makes ready)
			_rect(ci, x, cy, cw, ch, Color(P["black"], 0.62))
	# the foot: CONFIRM, lit once a card is chosen; the MODE, and what it means under the cards
	var hy: float = L["end"] + 5.0
	_button(ci, L["back"], "BACK")
	if chosen != "" and _locked(chosen):
		_button(ci, L["confirm"], _buy_label(chosen), {"primary": true, "lit": true} if _shop().busy == "" else {"disabled": true})
	else:
		_button(ci, L["confirm"], "CONFIRM", {"primary": true, "lit": true} if chosen != "" and entering.is_empty() else {"disabled": true})
	var mr: Rect2 = L["mode"]
	if not no_mode:
		_button(ci, mr, "MODE: HARDCORE" if mode == "hardcore" else "MODE: NORMAL", {"color": T["bad"]} if mode == "hardcore" else {})
	# (a hero for sale chosen: what it is, in place of what the mode means)
	if chosen != "" and _locked(chosen) and note == "":
		var nm := str(K["classes"][chosen]["name"])
		var why: String = _shop().why
		for part in PF.wrap(why if why != "" else "Unlock the %s. Yours to keep, on every save." % nm, W - 16.0, "small"):
			if hy + 6.0 > mr.position.y - 2.0 and not no_mode:
				break
			_text(ci, part, floorf(W / 2.0), hy, T["bad"] if why != "" else T["accent"], {"align": "center", "font": "small"})
			hy += 6.0
		return
	for part in ([] if note != "" or no_mode else PF.wrap(str(K["modeLine"][mode]), W - 16.0, "small")):
		if hy + 6.0 > mr.position.y - 2.0:
			break
		_text(ci, part, floorf(W / 2.0), hy, T["bad"] if mode == "hardcore" else T["dim"], {"align": "center", "font": "small"})
		hy += 6.0
	# (a hero saved: the warning, in place of what the mode means)
	for part in (PF.wrap(note, W - 16.0, "small") if note != "" else []):
		_text(ci, part, floorf(W / 2.0), hy + 2.0, T["bad"], {"align": "center", "font": "small"})
		hy += 6.0


## A hero for sale and not bought: in its card's top left corner, over the hero's head, a small dark tab, a padlock painted in it
## and the price beside (in the larger letters: the small have no "$").
func _price_tag(ci: CanvasItem, r: Rect2, cls: String, name_left: float) -> void:
	var label: String = _shop().price(cls)
	var tw := _width(label)
	var w := 4.0 + 5.0 + 3.0 + tw + 4.0
	# (a card too narrow for the price beside the name, as held upright: the padlock alone; the price is on BUY)
	if r.position.x + 3.0 + w + 3.0 > name_left:
		label = ""
		w = 4.0 + 5.0 + 4.0
	var h := 12.0
	var x := r.position.x + 3.0
	var y := r.position.y + 3.0
	_box(ci, x, y, w, h, T["ink"], T["edgeHi"])
	# (the padlock: its shackle, then its body, a keyhole in it)
	var lx := x + 4.0
	var ly := y + 2.0
	var steel: Color = P["sl3"]
	_rect(ci, lx + 1, ly, 3, 1, steel)
	_rect(ci, lx + 1, ly + 1, 1, 2, steel)
	_rect(ci, lx + 3, ly + 1, 1, 2, steel)
	_rect(ci, lx, ly + 3, 5, 5, P["sl5"])
	_rect(ci, lx, ly + 7, 5, 1, P["sl4"])
	_rect(ci, lx + 2, ly + 4, 1, 2, T["ink"])
	if label != "":
		_text(ci, label, lx + 5.0 + 3.0, y + 2.0, T["text"])


## A card's hero (render/figure.ts draw, lights, drawPhased), in its card's clip, in picture pixels (two to a game pixel of the
## figure, drawn twice its size: one to a game pixel of the screen): `aura`, the pool of light behind (added); `body`, the tails
## behind, the picture, the tails in front, or, warping away, the picture in slices pulled apart, fading; `lights`, what it gives
## off (the Mage's crystal, the Ranger's feather), added.
func _draw_fig(cls: String, part: String, n: Node2D) -> void:
	var F: Dictionary = _fig[cls]
	var f: Dictionary = F["shown"]
	if f.is_empty():
		return
	var p: Dictionary = f["part"]
	var ax := float(p["ax"])
	var ay := float(p["ay"])
	var gone: float = F["gone"]
	# (units: a figure's game pixel is 4 here; the figure is drawn at 2 game pixels to its own)
	var u := 4.0
	if part == "aura":
		var au = p.get("aura")
		if au == null or gone > 0.0:
			return
		var r := float(au["r"]) * u
		n.draw_texture_rect(Glow.tex(), Rect2((float(au["x"]) - ax) * u - r, (float(au["y"]) - ay) * u - r, r * 2.0, r * 2.0), false, Glow.tint(au))
		return
	if part == "lights":
		if gone > 0.0:
			return
		for l in p.get("lights", []):
			var r := float(l["r"]) * u
			n.draw_texture_rect(Glow.tex(), Rect2((float(l["x"]) - ax) * u - r, (float(l["y"]) - ay) * u - r, r * 2.0, r * 2.0), false, Glow.tint(l))
		for l in F["tails"].lights():
			var r := float(l["r"]) * u
			n.draw_texture_rect(Glow.tex(), Rect2(float(l["x"]) * u - r, float(l["y"]) * u - r, r * 2.0, r * 2.0), false, Glow.tint(l))
		return
	var tex: AtlasTexture = f["tex"]
	var d := float(p.get("density", 1))
	var w := float(p["w"])
	var h := float(p["h"])
	var mod := Color(1, 1, 1, clampf(1.0 - gone * gone, 0.0, 1.0))
	F["tails"].draw_on(n, 0.0, 0.0, false, u, mod)
	if gone > 0.0:
		var phase := 0.15 + gone * 0.85
		var apart := float(K["phaseApart"])
		var j := 0
		while j * 2 < h:
			var tall := minf(2.0, h - j * 2)
			var off := roundf((1.0 if j % 2 == 0 else -1.0) * phase * (apart - (j % 3) * 2.0)) * 2.0
			var src := Rect2(tex.region.position + Vector2(0, j * 2 * d), Vector2(w * d, tall * d))
			n.draw_texture_rect_region(tex.atlas, Rect2(-ax * u + off * 2.0, (j * 2.0 - ay) * u, w * u, tall * u), src, mod)
			j += 1
	else:
		n.draw_texture_rect_region(tex.atlas, Rect2(-ax * u, -ay * u, w * u, h * u), tex.region, mod)
	F["tails"].draw_on(n, 0.0, 0.0, true, u, mod)
