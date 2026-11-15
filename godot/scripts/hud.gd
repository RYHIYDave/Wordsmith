## THE SCREEN OVER THE GAME, drawn as the game's ui/hud.ts drawHud draws it, in its own letters (pixel_font.gd), colours and
## pictures (assets/hud: tools/godot_hud.ts), in game pixels (two picture pixels to one):
##   the LIFE GLOBE bottom left, the FLASK beside it with the level over it; the LUNGE's button bottom right with SPACE over
##   it; between them THE TWO ATTACKS written out on their plates with their word sockets ("[+] STRIKE", "POWER STRIKE of
##   POWER"), each with its key over it and how soon it is ready; his experience along the foot;
##   LEVEL UP and what E would do here, as buttons over the plates;
##   top left the place's name, his gold, the INVENTORY button (pink while a word waits for a place), the Master Rune-stone
##   while he carries it; the BOSS'S BAR at the top once he fights; the guide's PROMPT in its panel at the top; what has just
##   happened, over the flask; and the boss's name across the screen (ui/cards.ts).
## The small map and the pause button top right, the large map and the pause panel: minimap.gd.
## Not yet: a skill's card under the pointer, the fight's own prompt lines.
extends Control

const PF := preload("res://scripts/pixel_font.gd")
const DIR := "res://assets/hud/"

var main  # main.gd
var hero  # hero.gd
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
	var skills: Array = _data["skills"]
	var ex := W - ps - 5
	_slot(ex, py, ps, "ability:" + skills[2]["icon"], T["edgeHi"])
	var lunge_cover := clampf(1.0 - float(ready["lunge"]), 0.0, 1.0)
	if lunge_cover > 0.0:
		_rect(ex + 1, py + 1, ps - 2, ceilf((ps - 2) * lunge_cover), Color(P["black"], 0.72))
	_text("SPACE", ex + floorf(ps / 2.0), py - 7, T["dim"], {"align": "center", "font": "small", "shadow": ink})

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
	var keys := ["LEFT CLICK", "HOLD RIGHT CLICK"]
	for s in 2:
		var r: Rect2 = plates[s]
		_box(r.position.x, r.position.y, r.size.x, r.size.y, T["bg2"], T["edge"])
		var iy := r.position.y + floorf((PH - 20) / 2.0)
		_slot(r.position.x, iy, 20, "ability:" + skills[s]["icon"], T["edgeHi"])
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
		_draw_phrase(pieces[s], r.position.x + 20 + PAD, r.position.y, PH, pulse)
		_text(keys[s], r.position.x + 1, r.position.y - 6, T["dim"], {"font": "small", "shadow": ink})
	var bar_top: float = plates[0].position.y
	# experience
	var xw := avail_r - avail_l
	_rect(avail_l, H - 3, xw, 2, T["ink"])
	if loot != null:
		_rect(avail_l, H - 3, roundf(xw * loot.xp / loot.xp_to_next(loot.level)), 2, T["accentLo"])

	# ---- level-up and interact prompts ----
	var pbh := 13.0
	var prompt_y := bar_top - 22
	if loot != null and loot.points > 0:
		# (in the game L opens the level's choice; here it is made on the gear screen)
		var label := "LEVEL UP (I)"
		var w := 78.0
		_button(floorf(W / 2.0 - w / 2.0), prompt_y, w, pbh, label, false, true, pulse)
		prompt_y -= pbh + 3
	if main != null:
		var p: Array = main.prompt()
		if p[0] != "":
			var hint: String = p[0].trim_prefix("E: ")
			var label2: String = hint + " (E)" if p[1] != "" else hint
			var w2 := _width(label2) + 12
			_button(floorf(W / 2.0 - w2 / 2.0), prompt_y, w2, pbh, label2, false, false, p[1] != "")

	# ---- top left: where we are, gold, and the inventory ----
	var spare: int = loot.words.get("power", 0) if loot != null else 0
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
	lx += iw + 3
	if spare > 0:
		var wy := btn_y + floorf((btn_h - 12) / 2.0)
		_pic("word:power", lx, wy)
		_text("%d" % spare, lx + 14, wy + 4, Color(_data["word_color"]["power"]), {"font": "small", "shadow": ink})
	if loot != null and loot.quest != "":
		# (the Master Rune-stone while it is carried: art/quest3.ts)
		var st := _pic_size("stone")
		var sp: Array = _data["pics"]["stone"]
		var cx := lx + (26.0 if spare > 0 else 0.0) + 7
		var cy := btn_y + btn_h / 2.0
		_pic("stone", roundf(cx - sp[4] / 2.0), roundf(cy - sp[5] / 2.0), st.x, st.y)

	# ---- the boss's bar ----
	var boss = _boss()
	var boss_up: bool = boss != null and not boss.dead and boss.state != "sleep" and not boss.waits
	if boss_up:
		var bw := minf(150.0, W - 160.0)
		var bx := floorf(W / 2.0 - bw / 2.0)
		_text(boss.title, bx + floorf(bw / 2.0), 4, P["fr4"], {"align": "center", "shadow": ink})
		_rect(bx - 1, 14, bw + 2, 6, T["ink"])
		_rect(bx, 15, bw, 4, T["lifeLo"])
		_rect(bx, 15, roundf(bw * maxf(0.0, boss.life) / boss.max_life), 4, T["life"])

	# ---- the prompt ----
	if main != null and not boss_up:
		var b: Dictionary = main.guide.banner()
		if not b.is_empty():
			_banner(b, W)

	# ---- what has just happened: above the flask, the newest lowest ----
	if loot != null:
		var msg_w := maxf(120.0, floorf(W / 2.0) - 62)
		var my := H - ps - 26
		for i in range(loot.msgs.size() - 1, maxi(-1, loot.msgs.size() - 5), -1):
			var m: Dictionary = loot.msgs[i]
			var parts: Array = PF.wrap(m["text"], msg_w)
			var a := clampf(3.5 - m["t"], 0.0, 1.0)
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


func _boss():
	if main == null or main._monsters == null:
		return null
	for m in main._monsters.list:
		if is_instance_valid(m) and m.boss:
			return m
	return null


# --- the attacks as they read: the words in front, the name, the words behind (hud.ts phrase, drawPhrase) ---

## The pieces of attack `s`: {kind: word | rune | empty | name | link, text, color, w, word, glow}. `tight` 1 shows the words
## behind as their rune stones, 2 all of them.
func _phrase(s: int, tight: int) -> Array:
	var out: Array = []
	var level: int = loot.level if loot != null else 1
	# (the sockets as they open: one in front from the first level, one behind from the fourth; only STRIKE takes a word here)
	var front: Array = [hero.strike_words["front"] if s == 0 else ""]
	var behind: Array = [hero.strike_words["behind"] if s == 0 else ""] if level >= 4 else []
	var spare: bool = loot != null and loot.words.get("power", 0) > 0 and s == 0
	for w in front:
		out.append(_word_piece(w, "front", tight >= 2) if w != "" else _empty(spare))
	var name: String = String(_data["skills"][s]["name"]).to_upper()
	out.append({"kind": "name", "text": name, "color": P["white"], "w": _width(name)})
	var first := true
	for w in behind:
		if w == "":
			out.append(_empty(spare))
			continue
		var link := "of" if first else "and"
		out.append({"kind": "link", "text": link, "color": T["dim"], "w": _width(link, "small")})
		out.append(_word_piece(w, "behind", tight >= 1))
		first = false
	return out


func _word_piece(w: String, form: String, rune: bool) -> Dictionary:
	var text: String = _data["words"][w][form]
	var c := Color(_data["word_color"][w])
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


# --- the prompt at the top (hud.ts drawBanner): one large line and a smaller one under it ---

func _banner(b: Dictionary, W: float) -> void:
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
