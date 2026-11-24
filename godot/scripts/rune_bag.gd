## THE RUNE BAG: every rune he holds, on a half of the screen of its own (inventory.gd), as the owner saw it and said yes.
## His words, 23 Nov 2026 (evening, Eastern): “I have a UI issue.  I'm getting to the point where I have too many word runes for
## just a bag that pops out of the side of the inventory screen.  It needs groups, searchability, intuitive design for
## navigating to the exact rune you are looking for.  And probably info about each word if you press and hold on the rune.
## Eventually there will be over 300 runes.” Shown the mock-up (docs/mockups/rune_bag), he picked “Build both in the game
## (Recommended)”. This follows the mock-up's mock.ts (drawLib, drawTile, drawCard, libFilter) line for line.
##   - Over the game's half, where the LEXICON panel was (RUNES under the gear screen's gold and level opens it); at the
##     wordsmith, while he melds, on the gear screen's own half, beside his melding stone (meld_stone.gd).
##   - A RAIL OF GROUPS down its left: ALL, the Lexicon's five pages (DAMAGE, STRIKE, TIME, CONTROL, SPOILS: words.json
##     lexPages, his pick of 9 Nov 2026), MELDS; each with how many. A Rank II or level 2 rune sits in its rune's group, after it.
##   - A SEARCH: a rune found by its name, by a rune it is made of ("frost": Frost, then every meld MADE WITH FROST), and by
##     what it does. SORT: GROUP, A-Z, MOST (most held first), NEW (newest first). Over the melds, MADE WITH: the base runes,
##     one pressed shows only the melds made with it, a second narrows to the meld of the two.
##   - Every rune a tile: its stone at twice its size, its name under it, how many, II on a ranked one, a cyan spark on one
##     come by since. A scroll bar to be held and drawn down through the whole bag, with a bubble saying where.
##   - PRESSED: in hand, to be set in a move's slot or dropped on gear (as the line of words over the bag); at the wordsmith,
##     laid in his next hollow. CARRIED SIDEWAYS: dragged out to a slot or a hollow. PRESSED AND HELD: a ring of cyan fills
##     round it, then its CARD: the stone large in its light, its name, what kind, what it grows with, how many, what it is
##     made of (each part pressed opens that part's card), and what it does in front of a move, behind one and on a monster.
extends RefCounted

const PF := preload("res://scripts/pixel_font.gd")
const Words := preload("res://scripts/words.gd")

const K := 2.0
const PANEL := Color("#0e0c24")
const BOX := Color("#1a1648")
const BG2 := Color("#2a2466")
const EDGE_HI := Color("#7a74c8")
const EDGE := Color("#3a3478")
const PICK := Color("#7af8f0")
const PICK_LO := Color("#22a8c0")
const PICK_BG := Color("#12506a")
const PRESS := Color("#e0287a")
const PRESS_HI := Color("#ff7aa8")
const DIM := Color("#9c96dc")
const FAINT := Color("#5a54b0")
const TEXT := Color("#f0e8ff")
const FOE := Color("#ff7aa8")
const INK := Color("#0e0c24")
const SHADE := Color(0.027, 0.02, 0.04, 1.0)

const GROUPS := ["ALL", "DAMAGE", "STRIKE", "TIME", "CONTROL", "SPOILS", "MELDS"]
const GROUP_ICON := {"DAMAGE": "power", "STRIKE": "twin", "TIME": "swift", "CONTROL": "binding", "SPOILS": "leech", "MELDS": "eruption"}
const SORTS := ["GROUP", "A-Z", "MOST", "NEW"]
const ATTR := {"str": "STRENGTH", "dex": "DEXTERITY", "int": "INTELLIGENCE"}
## (the bag's measures, game pixels from its half's left: the mock-up's)
const HEAD_Y := 21.0
const RAIL_X := 2.0
const RAIL_W := 29.0
const GRID_X := 35.0
const TILE_H := 38.0
const HEAD_H := 12.0
const HOLD := 0.42
## (a long name broken where a word inside it begins: the pairs of letters that start one)
const STARTS := ["FR", "ST", "BR", "TR", "SH", "CH", "TH", "GL", "PL", "CR", "SL", "SP", "SN", "DR", "GR", "BL", "CL", "FL", "KN", "WH", "QU", "SW", "SC", "SK", "SM", "WR"]

var inv  # inventory.gd
var group := "ALL"
var sort := "GROUP"
var q := ""
var scroll := 0.0
var vel := 0.0
var card := ""
var card_t := 0.0
var card_scroll := 0.0
var made: Array = []
var chip_scroll := 0.0
var open_t := -9.0
var flash_id := ""
var flash_t := -9.0
var bubble_t := -9.0
## Runes come by since they were last looked at (a cyan spark), and when each was last come by (NEW).
var fresh := {}
var _got := {}
var _stamp := 0
var _last := {}
var _now := 0.0
## Where it was drawn last: its half, in the panel's lay (screen pixels); and whether that is at the wordsmith.
var rect := Rect2()
var at_smith := false
var _items: Array = []
var _heads: Array = []
var _h := 0.0
var _dirty := true
var _cols := 5
var _tile_w := 39.6
var _grid_r := 233.0
var _hh := 270.0
## The pointer pressed on it: {at, t0, kind, arg, mode, start, last_y, last_t, vel}; {} for none.
var ptr := {}
## Its own things to press: [Rect2 (the panel's lay), kind, arg], the top-most last.
var hits: Array = []
## The search's own box (a LineEdit, see-through, over the drawn one: the phone's keyboard comes up for it).
var search: LineEdit
var _base: Array = []


func _init(owner) -> void:
	inv = owner
	_base = Words.ids()
	search = LineEdit.new()
	search.modulate = Color(1, 1, 1, 0)
	search.visible = false
	search.max_length = 18
	search.context_menu_enabled = false
	search.caret_blink = false
	search.select_all_on_focus = false
	search.text_changed.connect(_typed)
	search.text_submitted.connect(func(_t): search.release_focus())
	inv.add_child(search)


func _typed(t: String) -> void:
	q = t
	card = ""
	reset()


func reset() -> void:
	scroll = 0.0
	vel = 0.0
	_dirty = true


func typing() -> bool:
	return search != null and search.visible and search.has_focus()


## Opened (it slides in).
func opened() -> void:
	open_t = _now
	card = ""
	_dirty = true


func closed() -> void:
	card = ""
	ptr = {}
	if search != null:
		search.release_focus()
		search.visible = false


func step(dt: float) -> void:
	_now += dt
	# the pointer held still long enough on a rune opens its card
	if not ptr.is_empty() and ptr["mode"] == "pending" and ptr["kind"] == "tile" and _now - float(ptr["t0"]) >= HOLD:
		ptr["mode"] = "held"
		open_card(str(ptr["arg"]))
	# a scroll let go coasts to a stop
	if (ptr.is_empty() or ptr["mode"] != "scroll") and absf(vel) > 0.5:
		scroll = clampf(scroll + vel * dt, 0.0, _max())
		vel *= pow(0.04, dt)
		if scroll <= 0.0 or scroll >= _max():
			vel = 0.0


# ---- what it holds ------------------------------------------------------------------------------------------------------

## How many of a rune it shows: a rune being made at the wordsmith is not there until it is formed.
func count(w: String) -> int:
	var n := int(inv.loot.words.get(w, 0))
	if inv._ms != null and inv._ms.busy() and str(inv._ms.anim.get("res", "")) == w:
		n -= 1
	return n


func held_ids() -> Array:
	var out: Array = []
	for w in inv.loot.held():
		if count(w) > 0:
			out.append(w)
	return out


func name_of(w: String) -> String:
	return str(Words.word(w)["name"])


## The group a rune is in: its page of the Lexicon (a ranked rune its rune's), or MELDS.
func group_of(w: String) -> String:
	if Words.is_meld(w):
		return "MELDS"
	var base := w
	if Words.is_rank(w):
		base = str(Words.data()["melds"]["rankOf"][w]["word"])
	for p in Words.data()["lexPages"]:
		if p["words"].has(base):
			return str(p["name"])
	return "STRIKE"


func parts(w: String) -> Array:
	if Words.is_meld(w) or Words.is_rank(w):
		return Words.parts_of(w)
	return []


## Notes what has been come by since last looked: a rune whose count went up has a spark, and is the newest.
func track() -> void:
	var first := _last.is_empty()
	for w in inv.loot.words:
		var n := int(inv.loot.words[w])
		if not first and n > int(_last.get(w, 0)):
			fresh[w] = true
			_stamp += 1
			_got[w] = _stamp
			_dirty = true
		elif n != int(_last.get(w, 0)):
			_dirty = true
		_last[w] = n


func _sections() -> Array:
	var ids := held_ids()
	if group != "ALL":
		ids = ids.filter(func(w): return group_of(w) == group)
	if group == "MELDS" and not made.is_empty() and q == "":
		ids = ids.filter(func(w): return made.all(func(m): return parts(w).has(m)))
	var by_name := func(a, b): return name_of(a) < name_of(b)
	var qq := q.strip_edges().to_lower()
	if qq != "":
		var named: Array = []
		var with: Array = []
		var does: Array = []
		var with_name := ""
		for w in ids:
			var wd: Dictionary = Words.word(w)
			if (str(wd["name"]) + " " + str(wd.get("front", "")) + " " + w).to_lower().contains(qq):
				named.append(w)
				continue
			var hit := ""
			for p in parts(w):
				var pd: Dictionary = Words.word(p)
				if (str(pd["name"]) + " " + str(pd.get("front", "")) + " " + str(p)).to_lower().contains(qq):
					hit = str(pd["name"]).to_upper()
					break
			if hit != "":
				with.append(w)
				if with_name == "":
					with_name = hit
				continue
			var text := "%s %s %s %s" % [wd.get("about", ""), wd.get("frontText", ""), wd.get("behindText", ""), wd.get("monsterText", "")]
			if text.to_lower().contains(qq):
				does.append(w)
		var out: Array = []
		if not named.is_empty():
			named.sort_custom(by_name)
			out.append({"title": "NAMED", "ids": named})
		if not with.is_empty():
			with.sort_custom(by_name)
			out.append({"title": "MADE WITH " + with_name, "ids": with})
		if not does.is_empty():
			does.sort_custom(by_name)
			out.append({"title": "WHAT THEY DO", "ids": does})
		return out
	if sort == "A-Z" or (sort == "GROUP" and group == "MELDS"):
		ids.sort_custom(by_name)
		var title := "A TO Z"
		if group == "MELDS":
			title = "MELDS, A TO Z"
			if not made.is_empty():
				title = "MADE WITH " + " AND ".join(PackedStringArray(made.map(func(m): return name_of(m).to_upper())))
		return [{"title": title, "ids": ids}]
	if sort == "MOST":
		ids.sort_custom(func(a, b): return count(a) > count(b) or (count(a) == count(b) and name_of(a) < name_of(b)))
		return [{"title": "MOST HELD FIRST", "ids": ids}]
	if sort == "NEW":
		var order: Array = inv.loot.held()
		ids.sort_custom(func(a, b): return int(_got.get(a, 0)) > int(_got.get(b, 0)) or (int(_got.get(a, 0)) == int(_got.get(b, 0)) and order.find(a) < order.find(b)))
		return [{"title": "NEWEST FIRST", "ids": ids}]
	# GROUP: a section to each group, its runes in the game's order (each rank after its rune); the melds A to Z
	var out: Array = []
	var game_order: Array = inv.loot.held()
	for grp in GROUPS.slice(1):
		var in_: Array = ids.filter(func(w): return group_of(w) == grp)
		if in_.is_empty():
			continue
		if grp == "MELDS":
			in_.sort_custom(by_name)
		else:
			in_.sort_custom(func(a, b): return _base_key(a, game_order) < _base_key(b, game_order))
		out.append({"title": grp, "ids": in_})
	return out


func _base_key(w: String, order: Array) -> int:
	if Words.is_rank(w):
		var b := str(Words.data()["melds"]["rankOf"][w]["word"])
		return _base.find(b) * 10 + Words.rank_of(w)
	var i := _base.find(w)
	return (i if i >= 0 else 900 + order.find(w)) * 10 + 1


func _lay() -> void:
	_items = []
	_heads = []
	var y := 0.0
	for s in _sections():
		_items.append({"head": s["title"], "count": s["ids"].size(), "y": y})
		_heads.append({"y": y, "title": s["title"]})
		y += HEAD_H
		for i in s["ids"].size():
			_items.append({"id": s["ids"][i], "x": GRID_X + (i % _cols) * _tile_w, "y": y + floorf(float(i) / _cols) * TILE_H})
		y += ceilf(float(s["ids"].size()) / _cols) * TILE_H + 2.0
	_h = y
	_dirty = false


func _top() -> float:
	return 58.0 if group == "MELDS" and q == "" else 40.0


func _bottom() -> float:
	return _hh - 3.0


func _max() -> float:
	return maxf(0.0, _h - (_bottom() - _top()))


## Where a rune's tile is on the screen just now (its stone's top left, in the panel's lay), or (-1, -1).
func tile_at(w: String) -> Vector2:
	for it in _items:
		if it.has("id") and it["id"] == w:
			var y: float = _top() + float(it["y"]) - scroll + 3.0
			return rect.position + Vector2(float(it["x"]) + (_tile_w - 24.0) / 2.0, y) * K
	return Vector2(-1, -1)


## A rune just made: the bag shows it (its group or ALL, no search), scrolled to.
func show_word(w: String) -> void:
	q = ""
	if search != null:
		search.text = ""
	card = ""
	if group != "ALL" and group != group_of(w):
		group = "ALL"
		made = []
	_lay()
	for it in _items:
		if it.has("id") and it["id"] == w:
			scroll = clampf(float(it["y"]) - 60.0, 0.0, _max())


func flash(w: String) -> void:
	flash_id = w
	flash_t = _now


func open_card(w: String) -> void:
	card = w
	card_t = _now
	card_scroll = 0.0
	Input.vibrate_handheld(12)


# ---- drawing helpers (game pixels from the half's top left) ---------------------------------------------------------------

func _rect(x: float, y: float, w: float, h: float, c: Color) -> void:
	inv.draw_rect(Rect2(x, y, w, h), c)


## A box with its corners cut, a game pixel's rim (the mock-up's).
func _box(x: float, y: float, w: float, h: float, fill, edge, a := 1.0) -> void:
	if fill != null:
		var f: Color = fill
		_rect(x + 1, y + 1, w - 2, h - 2, Color(f.r, f.g, f.b, f.a * a))
	if edge != null:
		var e: Color = edge
		var c := Color(e.r, e.g, e.b, e.a * a)
		_rect(x + 1, y, w - 2, 1, c)
		_rect(x + 1, y + h - 1, w - 2, 1, c)
		_rect(x, y + 1, 1, h - 2, c)
		_rect(x + w - 1, y + 1, 1, h - 2, c)


func _t(s: String, x: float, y: float, c: Color, font := "normal", scale := 1, align := "left", shadow = null) -> float:
	return PF.draw(inv, s, x, y, c, {"font": font, "scale": scale, "align": align, "shadow": shadow})


func _w(s: String, font := "normal", scale := 1) -> float:
	return PF.width(s, font, scale)


func _stone(w: String, x: float, y: float, size: float, a := 1.0) -> void:
	inv.draw_texture_rect_region(inv.loot.sheet, Rect2(roundf(x), roundf(y), size, size), inv.loot.pics["word:" + w]["rect"], Color(1, 1, 1, a))


func _glow(x: float, y: float, r: float, c: Color, a: float) -> void:
	if a > 0.005 and inv._ms != null:
		inv.draw_texture_rect(inv._ms.glow_tex, Rect2(x - r, y - r, 2.0 * r, 2.0 * r), false, Color(c.r, c.g, c.b, clampf(a, 0.0, 1.0) * 0.8))


func _spark(x: float, y: float, n: float, c: Color, a: float) -> void:
	var cc := Color(c.r, c.g, c.b, a)
	_rect(x - 0.5, y - n, 1, n * 2 + 1, cc)
	_rect(x - n, y - 0.5, n * 2 + 1, 1, cc)


func _hit(r: Rect2, kind: String, arg = null) -> void:
	hits.append([Rect2(rect.position + r.position * K, r.size * K), kind, arg])


static func _ease(t: float) -> float:
	return 1.0 - pow(1.0 - clampf(t, 0.0, 1.0), 3.0)


## The name under a stone: on one line, or broken in two where a word inside it begins.
func tile_name(nm: String) -> Array:
	var s := nm.to_upper()
	if _w(s, "small") <= 37.0:
		return [s]
	var sp := s.find(" ")
	if sp > 0:
		return [s.substr(0, sp), s.substr(sp + 1)]
	var vow := "AEIOUY"
	var best := int(ceil(s.length() / 2.0))
	var score := -99.0
	for k in range(3, s.length() - 2):
		var a := s[k - 1]
		var b := s[k]
		var v := 3.0 if a == b else (2.0 if not vow.contains(a) and not vow.contains(b) else (1.0 if vow.contains(a) and not vow.contains(b) else 0.0))
		if STARTS.has(s.substr(k, 2)):
			v += 1.5
		if STARTS.has(a + b):
			v -= 2.0
		# (nor so that the second part begins with two letters no word begins with)
		var nx := s.substr(k, 2)
		if nx.length() == 2 and not vow.contains(nx[0]) and not vow.contains(nx[1]) and not STARTS.has(nx):
			v -= 1.0
		v -= absf(k - s.length() / 2.0) * 0.3
		if _w(s.substr(0, k) + "-", "small") > 38.0 or _w(s.substr(k), "small") > 38.0:
			v -= 9.0
		if v > score:
			score = v
			best = k
	return [s.substr(0, best) + "-", s.substr(best)]


# ---- the half ------------------------------------------------------------------------------------------------------------

## The bag over a half: `r` that half in the panel's lay (screen pixels); `smith`, beside the wordsmith's melding stone.
func draw(r: Rect2, smith: bool) -> void:
	track()
	at_smith = smith
	hits = []
	var slide := _ease((_now - open_t) / 0.22) if not smith else 1.0
	var off := -(1.0 - slide) * r.size.x if r.position.x >= inv._hw() else (1.0 - slide) * r.size.x
	rect = Rect2(r.position + Vector2(off, 0), r.size)
	var W := floorf(r.size.x / K)
	_hh = floorf(r.size.y / K)
	var grid_w := W - 7.0 - GRID_X
	_cols = maxi(3, int(floorf(grid_w / 38.0)))
	if absf(grid_w / _cols - _tile_w) > 0.01 or absf(W - 7.0 - _grid_r) > 0.01:
		_dirty = true
	_tile_w = grid_w / _cols
	_grid_r = W - 7.0
	if _dirty:
		_lay()
	scroll = clampf(scroll, 0.0, _max())
	inv.draw_set_transform(inv._xf + rect.position, 0.0, Vector2(K, K))
	# the panel
	_rect(0, 0, W, _hh, PANEL)
	_box(0, 0, W, _hh, null, EDGE)
	_rect(2, 1, W - 4, 0.5, PICK_LO)
	# the grid
	var top := _top()
	var bot := _bottom()
	var vh := bot - top
	if _items.is_empty():
		_t("NO RUNE OF YOURS MATCHES" if q != "" else "NONE HELD", GRID_X + (_grid_r - GRID_X) / 2.0, top + 30, FAINT, "small", 1, "center")
	var partner = null
	if smith and inv._ms != null and inv._ms.anim.is_empty():
		if inv.meld_in[0] != null and inv.meld_in[1] == null:
			partner = inv.meld_in[0]
		elif inv.meld_in[0] == null and inv.meld_in[1] != null:
			partner = inv.meld_in[1]
	for it in _items:
		var y: float = top + float(it["y"]) - scroll
		if y > bot or y + TILE_H < top:
			continue
		if it.has("head"):
			if y < top - 1.0 or y + 9.0 > bot:
				continue
			var hw := _w(it["head"], "small")
			_t(it["head"], GRID_X + 1, y + 3, DIM, "small")
			var cs := str(it["count"])
			_t(cs, GRID_X + hw + 5, y + 3, FAINT, "small")
			var lx := GRID_X + hw + 10.0 + _w(cs, "small")
			_rect(lx, y + 5, _grid_r - lx, 1, EDGE)
			continue
		var w: String = it["id"]
		_tile(w, float(it["x"]), y, top, bot, partner)
		var ty := maxf(top, y)
		var th := minf(bot, y + TILE_H) - ty
		if th > 4.0:
			_hit(Rect2(float(it["x"]), ty, _tile_w, th), "tile", w)
	# (the rows run on past the grid's top and foot; the head and the foot are laid over them)
	_rect(GRID_X - 1.0, 1.0, W - GRID_X, top - 1.0, PANEL)
	_rect(GRID_X - 1.0, bot, W - GRID_X, _hh - bot - 1.0, PANEL)
	_box(0, 0, W, _hh, null, EDGE)
	_rect(2, 1, W - 4, 0.5, PICK_LO)
	# its head: RUNES, how many, the sort, and DONE beside the wordsmith or a cross to put it away
	_t("RUNES", 5, 6, PICK)
	_t("%d HELD" % held_ids().size(), 5 + _w("RUNES") + 5, 8, DIM, "small")
	var rx := W - 4.0
	if smith:
		rx -= 37.0
		var dr := Rect2(rx, 3, 37, 15)
		_box(dr.position.x, dr.position.y, dr.size.x, dr.size.y, PRESS, PRESS_HI)
		_t("DONE", dr.position.x + dr.size.x / 2.0, 7, Color.WHITE, "normal", 1, "center")
		_hit(dr, "done")
		rx -= 3.0
	else:
		rx -= 15.0
		var cr := Rect2(rx, 3, 15, 14)
		_box(cr.position.x, cr.position.y, cr.size.x, cr.size.y, BOX, EDGE)
		for i in 5:
			_rect(cr.position.x + 5 + i, cr.position.y + 4 + i, 1, 1, TEXT)
			_rect(cr.position.x + 9 - i, cr.position.y + 4 + i, 1, 1, TEXT)
		_hit(cr, "close")
		rx -= 3.0
	var sl: String = "SORT " + sort
	var sw := _w(sl, "small") + 10.0
	rx -= sw
	_box(rx, 3, sw, 14, BOX, EDGE_HI)
	_t(sl, rx + 5, 8, TEXT, "small")
	_hit(Rect2(rx, 3, sw, 14), "sort")
	# the search: its box drawn here, the see-through LineEdit laid over it to take the letters
	var sr := Rect2(GRID_X, HEAD_Y, _grid_r - GRID_X + 3.0, 15)
	var typing_now := typing()
	_box(sr.position.x, sr.position.y, sr.size.x, sr.size.y, INK, PICK if typing_now else EDGE_HI)
	var mc := PICK if q != "" else DIM
	var mx := sr.position.x + 5.0
	var my := sr.position.y + 4.0
	_rect(mx + 1, my, 3, 1, mc)
	_rect(mx + 1, my + 4, 3, 1, mc)
	_rect(mx, my + 1, 1, 3, mc)
	_rect(mx + 4, my + 1, 1, 3, mc)
	_rect(mx + 5, my + 5, 1, 1, mc)
	_rect(mx + 6, my + 6, 1, 1, mc)
	var caret := typing_now and int(_now * 2.0) % 2 == 0
	var box_w := sr.size.x
	if q != "":
		_t(q.to_upper(), sr.position.x + 15, sr.position.y + 4, TEXT)
		if caret:
			_rect(sr.position.x + 16 + _w(q.to_upper()), sr.position.y + 3, 1, 9, PICK)
		var n := 0
		for it in _items:
			if it.has("id"):
				n += 1
		var cx := sr.position.x + sr.size.x - 13.0
		_t("%d FOUND" % n, cx - 4, sr.position.y + 5, DIM, "small", 1, "right")
		_box(cx, sr.position.y + 2, 11, 11, BG2, null)
		for i in 5:
			_rect(cx + 3 + i, sr.position.y + 5 + i, 1, 1, TEXT)
			_rect(cx + 7 - i, sr.position.y + 5 + i, 1, 1, TEXT)
		_hit(Rect2(cx - 2, sr.position.y, 15, sr.size.y), "clear")
		box_w = sr.size.x - 16.0
	else:
		if not typing_now:
			_t("SEARCH A NAME, A RUNE IN IT, WHAT IT DOES", sr.position.x + 15, sr.position.y + 5, FAINT, "small")
		elif caret:
			_rect(sr.position.x + 15, sr.position.y + 3, 1, 9, PICK)
	_hit(Rect2(sr.position.x, sr.position.y, box_w, sr.size.y), "search")
	_place_search(Rect2(sr.position.x, sr.position.y, box_w, sr.size.y))
	# the rail of groups, with how many in each (how many found, while searching)
	var counts := {"ALL": 0}
	if q.strip_edges() != "":
		var keep := group
		group = "ALL"
		for s in _sections():
			for w in s["ids"]:
				counts["ALL"] += 1
				counts[group_of(w)] = int(counts.get(group_of(w), 0)) + 1
		group = keep
	else:
		for w in held_ids():
			counts["ALL"] += 1
			counts[group_of(w)] = int(counts.get(group_of(w), 0)) + 1
	var rail_h := minf(34.0, floorf((_hh - HEAD_Y - 3.0) / GROUPS.size() - 1.4))
	for i in GROUPS.size():
		var grp: String = GROUPS[i]
		var rr := Rect2(RAIL_X, HEAD_Y + i * (rail_h + 1.4), RAIL_W, rail_h)
		var on: bool = group == grp
		var c: int = counts.get(grp, 0)
		_box(rr.position.x, rr.position.y, rr.size.x, rr.size.y, PICK_BG if on else BOX, PICK if on else EDGE)
		if on:
			_rect(rr.position.x + rr.size.x - 1, rr.position.y + 3, 1, rr.size.y - 6, PICK)
		var icx := rr.position.x + roundf((rr.size.x - 12.0) / 2.0)
		if grp == "ALL":
			# a little book: every rune
			var bc := PICK if on else DIM
			_rect(icx + 1, rr.position.y + 4, 4, 9, bc)
			_rect(icx + 7, rr.position.y + 4, 4, 9, bc)
			var pc := PICK_BG if on else BOX
			for yy in [6, 8]:
				_rect(icx + 2, rr.position.y + yy, 2, 1, pc)
				_rect(icx + 8, rr.position.y + yy, 2, 1, pc)
			_rect(icx + 5, rr.position.y + 5, 2, 9, PICK_LO if on else FAINT)
		else:
			_stone(GROUP_ICON[grp], icx, rr.position.y + 3, 12, 1.0 if c > 0 else 0.35)
		_t(grp, rr.position.x + rr.size.x / 2.0, rr.position.y + 18, PICK if on else (TEXT if c > 0 else FAINT), "small", 1, "center")
		if rail_h >= 30.0:
			_t(str(c), rr.position.x + rr.size.x / 2.0, rr.position.y + 25, PICK if on else DIM, "small", 1, "center")
		_hit(rr, "group", grp)
	# MADE WITH, over the melds: the runes they are made of
	if group == "MELDS" and q == "":
		var y0 := 40.0
		_t("MADE WITH", GRID_X, y0 + 1, DIM, "small")
		if not made.is_empty():
			_t("CLEAR", _grid_r + 2, y0 + 1, PICK, "small", 1, "right")
			_hit(Rect2(_grid_r - _w("CLEAR", "small") - 4.0, y0 - 2, _w("CLEAR", "small") + 6.0, 9), "unmade")
		else:
			_t("PICK ONE OR TWO", _grid_r + 2, y0 + 1, FAINT, "small", 1, "right")
		var cy := y0 + 7.0
		var vw := _grid_r + 3.0 - GRID_X
		var full := _base.size() * 14.0
		chip_scroll = clampf(chip_scroll, 0.0, maxf(0.0, full - vw))
		for i in _base.size():
			var b: String = _base[i]
			var x := GRID_X + i * 14.0 - chip_scroll
			if x < GRID_X - 1.0 or x + 11.0 > GRID_X + vw + 1.0:
				continue
			var on: bool = made.has(b)
			if on:
				_box(x - 1, cy - 1, 13, 12, PICK_BG, PICK)
			_stone(b, x, cy - 0.5, 11, 1.0 if on or made.size() < 2 else 0.4)
		_hit(Rect2(GRID_X, cy - 2, vw, 13), "chips")
		if chip_scroll > 0.0:
			_rect(GRID_X - 2, cy + 2, 1, 5, PICK)
		if chip_scroll < full - vw - 1.0:
			_rect(GRID_X + vw + 1, cy + 2, 1, 5, PICK)
	# the scroll bar: held and drawn down, it runs through the whole bag at once
	var mx_ := _max()
	if mx_ > 0.0:
		var bx := _grid_r + 4.0
		var tbh := maxf(18.0, vh * vh / maxf(1.0, _h))
		var tby := top + (vh - tbh) * (scroll / mx_)
		_rect(bx, top, 3, vh, INK)
		var active: bool = not ptr.is_empty() and ptr["mode"] == "thumb"
		_box(bx - 0.5, tby, 4, tbh, PICK if active else EDGE_HI, null)
		_hit(Rect2(bx - 6, top, 12, vh), "thumb")
		if active or _now - bubble_t < 0.6:
			var title := ""
			for h in _heads:
				if float(h["y"]) <= scroll + 4.0 or title == "":
					title = h["title"]
			if _heads.size() == 1 or (sort == "GROUP" and title == "MELDS"):
				for it in _items:
					if it.has("id") and float(it["y"]) + TILE_H > scroll + 4.0:
						var fw: String = it["id"]
						title = ("x%d" % count(fw)) if sort == "MOST" else ("NEWER" if sort == "NEW" else name_of(fw).substr(0, 1).to_upper())
						break
			var bw := maxf(22.0, _w(title) + 12.0)
			var by := roundf(tby + tbh / 2.0 - 9.0)
			_box(bx - 8 - bw, by, bw, 18, PICK_BG, PICK)
			_rect(bx - 8, by + 7, 4, 4, PICK)
			_t(title, bx - 8 - bw / 2.0, by + 5, TEXT, "normal", 1, "center")
	if card != "":
		_card(W)
	inv.draw_set_transform(inv._xf)


func _place_search(r: Rect2) -> void:
	if search == null:
		return
	var at: Vector2 = inv._to_screen(rect.position + r.position * K)
	search.visible = card == ""
	search.position = at
	search.size = r.size * K
	if search.text != q:
		search.text = q


func _tile(w: String, x: float, y: float, top: float, bot: float, partner) -> void:
	var n := count(w)
	var sel: bool = inv._word == w and not at_smith
	var lift := 1.0 if sel else 0.0
	var yy := y - lift
	var c: Color = inv.loot.word_color(w)
	var tw := _tile_w
	_box(x + 1, yy + 1, tw - 2, TILE_H - 2, PICK_BG if sel else BOX, PICK if sel else null)
	if not sel:
		_box(x + 1, yy + 1, tw - 2, TILE_H - 2, null, c, 0.45)
	_rect(x + 2, yy + 2, tw - 4, 1, Color(1, 1, 1, 0.06))
	if flash_id == w and _now - flash_t < 1.6:
		_glow(x + tw / 2.0, yy + 14, 26, PICK, (1.0 - (_now - flash_t) / 1.6) * 0.9)
	_stone(w, x + (tw - 24.0) / 2.0, yy + 3, 24)
	# at the wordsmith, with one rune laid in: which of these meld with it (lit; ? for a meld not found; dimmed, none)
	var none := false
	if partner != null:
		var res := ""
		if inv._ws_problem(w) == "" and Words.meld_problem(partner, w) == "":
			res = Words.meld_of(partner, w)
		if res == "":
			none = true
		elif not inv._ms.known(res):
			var b := 0.5 + 0.5 * sin(_now * 4.0)
			_t("?", x + tw - 10, yy + 3, PICK if b > 0.5 else Color.WHITE, "normal", 1, "left", INK)
		else:
			_box(x + 1, yy + 1, tw - 2, TILE_H - 2, null, PICK_LO)
	if n > 1:
		_t(str(n), x + tw - 5, yy + 20, Color.WHITE, "small", 1, "right", INK)
	if Words.is_rank(w):
		_t("II", x + 6, yy + 3, Color.WHITE, "small", 1, "left", INK)
	var base_name := name_of(w)
	if Words.is_rank(w):
		base_name = name_of(str(Words.data()["melds"]["rankOf"][w]["word"]))
	var lines := tile_name(base_name)
	var ny := yy + (26.0 if lines.size() > 1 else 29.0)
	for i in lines.size():
		_t(lines[i], roundf(x + tw / 2.0), ny + i * 5.5, PICK if sel else c, "small", 1, "center")
	if none:
		_rect(x + 1, yy + 1, tw - 2, TILE_H - 2, Color(PANEL.r, PANEL.g, PANEL.b, 0.7))
	if fresh.has(w):
		var tw_ := 0.5 + 0.5 * sin(_now * 5.0 + float(w.hash() % 97))
		_spark(x + 6, yy + 6, 1.0 + roundf(tw_ * 2.0), PICK, 0.6 + 0.4 * tw_)
	# the hold filling round the tile
	if not ptr.is_empty() and ptr["mode"] == "pending" and ptr["kind"] == "tile" and ptr["arg"] == w:
		var k := clampf((_now - float(ptr["t0"]) - 0.08) / (HOLD - 0.08), 0.0, 1.0)
		if k > 0.0:
			_ring(x + 1, yy + 1, tw - 2, TILE_H - 2, k)


func _ring(x: float, y: float, w: float, h: float, k: float) -> void:
	var left := 2.0 * (w + h) * k
	var segs := [[x + w / 2.0, y, 1, 0, w / 2.0], [x + w - 1, y, 0, 1, h], [x + w, y + h - 1, -1, 0, w], [x, y + h, 0, -1, h], [x, y, 1, 0, w / 2.0]]
	for s in segs:
		var l := minf(left, float(s[4]))
		if l <= 0.0:
			break
		if int(s[2]) != 0:
			_rect(float(s[0]) if int(s[2]) > 0 else float(s[0]) - l, float(s[1]), l, 1, PICK)
		else:
			_rect(float(s[0]), float(s[1]) if int(s[3]) > 0 else float(s[1]) - l, 1, l, PICK)
		left -= l
	_glow(x + w / 2.0, y + h / 2.0, 22, PICK, k * 0.35)


# ---- a rune's card --------------------------------------------------------------------------------------------------------

func _card_lines(w: String, width: float) -> Array:
	var wd: Dictionary = Words.word(w)
	var out: Array = []
	if not parts(w).is_empty():
		out.append(["of", ""])
	if str(wd.get("about", "")) != "":
		for l in PF.wrap(str(wd["about"]), width):
			out.append(["dim", l])
	for sec in [["IN FRONT OF A MOVE", "frontText", PICK, "text"], ["BEHIND A MOVE", "behindText", PICK, "text"], ["ON A MONSTER", "monsterText", FOE, "dim"]]:
		var tx := str(wd.get(sec[1], ""))
		if tx == "":
			continue
		out.append(["gap", ""])
		out.append(["cap", sec[0], sec[2]])
		for l in PF.wrap(tx, width):
			out.append([sec[3], l])
	return out


func _card(W: float) -> void:
	var w := card
	var wd: Dictionary = Words.word(w)
	var c: Color = inv.loot.word_color(w)
	var k := _ease((_now - card_t) / 0.16)
	# the shade over the bag behind it; pressed, it puts the card away
	_rect(1, 1, W - 2, _hh - 2, Color(SHADE.r, SHADE.g, SHADE.b, 0.55 * k))
	hits.append([Rect2(rect.position, rect.size), "card_away", null])
	var cx := GRID_X - 2.0
	var cw := _grid_r - GRID_X + 9.0
	var cy := HEAD_Y - 1.0 + roundf((1.0 - k) * 8.0)
	var ch := _hh - HEAD_Y - 1.0
	_rect(cx + 3, cy + 3, cw, ch, Color(SHADE.r, SHADE.g, SHADE.b, 0.6 * k))
	_box(cx, cy, cw, ch, BOX, c, k)
	_box(cx + 1, cy + 1, cw - 2, ch - 2, null, PANEL, 0.6 * k)
	_hit(Rect2(cx, cy, cw, ch), "card")
	# its stone, large, in its light
	var pulse := 0.5 + 0.5 * sin(_now * 3.0)
	_glow(cx + 24, cy + 24, 30, c, (0.25 + 0.15 * pulse) * k)
	_box(cx + 5, cy + 5, 40, 40, INK, c, 0.9 * k)
	_stone(w, cx + 7, cy + 7, 36, k)
	# its name and what it is
	var nm := str(wd["name"]).to_upper()
	var big := _w(nm, "normal", 2) <= cw - 56.0
	_t(nm, cx + 50, cy + (7.0 if big else 10.0), c, "normal", 2 if big else 1, "left", INK)
	var what := ""
	if Words.is_rank(w):
		what = "RANK %s OF %s" % ["II" if Words.rank_of(w) == 2 else str(Words.rank_of(w)), name_of(str(Words.data()["melds"]["rankOf"][w]["word"])).to_upper()]
	elif Words.is_meld(w):
		what = "MELDED RUNE"
	else:
		what = group_of(w) + " RUNE"
	_t(what, cx + 50, cy + 26, DIM, "small")
	var at := Words.word_attr(w)
	if ATTR.has(at):
		_t("GROWS WITH " + ATTR[at], cx + 50, cy + 33, FAINT, "small")
	var have := "YOU HAVE %d" % int(inv.loot.words.get(w, 0))
	_t(have, cx + 50, cy + 40, TEXT, "small")
	if fresh.has(w):
		_t("NEW", cx + 50 + _w(have, "small") + 6, cy + 40, PICK, "small")
	# its page, which runs on under the buttons when it is long (drawn up and down)
	var bw := cw - 12.0
	var lines := _card_lines(w, bw)
	var top := cy + 50.0
	var bottom := cy + ch - 20.0
	var hs: Array = []
	var total := 0.0
	for l in lines:
		var hh: float = 3.0 if l[0] == "gap" else (7.0 if l[0] == "cap" else (15.0 if l[0] == "of" else 9.0))
		hs.append(hh)
		total += hh
	var max_s := maxf(0.0, total - (bottom - top))
	card_scroll = clampf(card_scroll, 0.0, max_s)
	var y := 0.0
	for i in lines.size():
		var l: Array = lines[i]
		var ly := top + y - card_scroll
		y += hs[i]
		if ly < top - 0.5 or ly + hs[i] > bottom + 0.5:
			continue
		match l[0]:
			"cap":
				_t(l[1], cx + 6, ly + 1, l[2], "small")
			"text":
				_t(l[1], cx + 6, ly, TEXT)
			"dim":
				_t(l[1], cx + 6, ly, DIM)
			"of":
				var ps := parts(w)
				if ps.size() == 1:
					ps = [ps[0], ps[0]]
				var label := "MADE OF" if Words.is_meld(w) else "TWO OF"
				var x := cx + 6.0
				_t(label, x, ly + 4, DIM, "small")
				x += _w(label, "small") + 5.0
				for j in ps.size():
					var p: String = ps[j]
					if j == 1:
						_t("+", x, ly + 2, DIM)
						x += 9.0
					var pn := name_of(p).to_upper()
					var pw := 16.0 + _w(pn)
					var pc: Color = inv.loot.word_color(p)
					_box(x - 2, ly, pw + 4, 14, BG2, pc, 0.9)
					_stone(p, x, ly + 1, 12)
					_t(pn, x + 15, ly + 3, pc)
					_hit(Rect2(x - 2, ly, pw + 4, 14), "part", p)
					x += pw + 8.0
	if max_s > 0.0:
		_hit(Rect2(cx, top, cw, bottom - top), "card_body")
		var th := maxf(10.0, (bottom - top) * (bottom - top) / total)
		_rect(cx + cw - 4, top + (bottom - top - th) * (card_scroll / max_s), 2, th, EDGE_HI)
	# its buttons
	var btns: Array = []
	if at_smith:
		btns.append(["TO THE MELD", "to_meld", true])
	elif not Words.is_meld(w) and not Words.is_rank(w) and held_ids().any(func(m): return parts(m).has(w) and Words.is_meld(m)):
		btns.append(["SHOW ITS MELDS", "its_melds", false])
	btns.append(["CLOSE", "card_away", false])
	var bx := cx + cw - 5.0
	for i in range(btns.size() - 1, -1, -1):
		var b: Array = btns[i]
		var bwid := _w(b[0], "small") + 12.0
		bx -= bwid
		var by := cy + ch - 17.0
		_box(bx, by, bwid, 13, PRESS if b[2] else BG2, PRESS_HI if b[2] else EDGE_HI)
		_t(b[0], bx + bwid / 2.0, by + 4, Color.WHITE, "small", 1, "center")
		_hit(Rect2(bx, by, bwid, 13), b[1])
		bx -= 4.0
	_t("HOLD A RUNE TO READ IT", cx + 6, cy + ch - 13, FAINT, "small")


# ---- the pointer ----------------------------------------------------------------------------------------------------------

func _hit_at(at: Vector2) -> Array:
	for i in range(hits.size() - 1, -1, -1):
		if hits[i][0].has_point(at):
			return hits[i]
	return []


## A press inside the bag (the panel's lay). True: it was the bag's.
func press(at: Vector2) -> bool:
	if not rect.has_point(at):
		return false
	var h := _hit_at(at)
	var kind: String = h[1] if not h.is_empty() else ""
	ptr = {"at": at, "t0": _now, "kind": kind, "arg": h[2] if not h.is_empty() else null, "mode": "pending", "start": 0.0, "last_y": at.y, "last_t": _now, "vel": 0.0}
	if kind == "thumb":
		ptr["mode"] = "thumb"
		vel = 0.0
		_thumb_to(at.y)
	elif kind == "tile":
		ptr["start"] = scroll
		vel = 0.0
	elif kind == "card_body":
		ptr["start"] = card_scroll
	elif kind == "chips":
		ptr["start"] = chip_scroll
	if kind != "search" and typing():
		search.release_focus()
	return true


func _thumb_to(y: float) -> void:
	var top := _top()
	var vh := _bottom() - top
	var tbh := maxf(18.0, vh * vh / maxf(1.0, _h))
	var gy := (y - rect.position.y) / K
	scroll = clampf((gy - top - tbh / 2.0) / maxf(1.0, vh - tbh) * _max(), 0.0, _max())
	bubble_t = _now


func motion(at: Vector2) -> void:
	if ptr.is_empty():
		return
	var d: Vector2 = (at - ptr["at"]) / K
	if ptr["mode"] == "thumb":
		_thumb_to(at.y)
		return
	if ptr["mode"] == "pending" and d.length() > 4.0:
		var kind: String = ptr["kind"]
		if kind == "tile" and absf(d.x) > absf(d.y) * 1.2:
			# carried sideways: dragged out of the bag, as a word is from the line over the bag
			var w: String = ptr["arg"]
			ptr = {}
			inv._word = w
			inv._pending = {}
			inv._look = null
			inv._drag = {"word": w, "from": null, "at": at, "moving": true, "was": false}
			return
		elif kind == "tile":
			ptr["mode"] = "scroll"
		elif kind == "card_body":
			ptr["mode"] = "card"
		elif kind == "chips":
			ptr["mode"] = "chips"
		else:
			ptr["mode"] = "none"
	match ptr["mode"]:
		"scroll":
			scroll = clampf(float(ptr["start"]) - d.y, 0.0, _max())
			var dtt := maxf(0.008, _now - float(ptr["last_t"]))
			ptr["vel"] = float(ptr["vel"]) * 0.6 + (-(at.y - float(ptr["last_y"])) / K / dtt) * 0.4
			ptr["last_y"] = at.y
			ptr["last_t"] = _now
		"card":
			card_scroll = float(ptr["start"]) - d.y
		"chips":
			chip_scroll = float(ptr["start"]) - d.x


func release(at: Vector2) -> void:
	if ptr.is_empty():
		return
	var p := ptr
	ptr = {}
	if p["mode"] == "scroll":
		vel = float(p["vel"])
		return
	if p["mode"] == "thumb":
		bubble_t = _now
		return
	if p["mode"] != "pending":
		return
	var arg = p["arg"]
	match str(p["kind"]):
		"tile":
			var w: String = arg
			fresh.erase(w)
			if at_smith:
				inv._ms_lay(w)
			elif inv._word == w:
				inv._word = ""
			else:
				inv._press("word", w)
		"group":
			group = arg
			made = []
			chip_scroll = 0.0
			card = ""
			reset()
		"sort":
			sort = SORTS[(SORTS.find(sort) + 1) % SORTS.size()]
			reset()
		"search":
			search.visible = true
			search.grab_focus()
			if DisplayServer.has_feature(DisplayServer.FEATURE_VIRTUAL_KEYBOARD):
				DisplayServer.virtual_keyboard_show(q)
		"clear":
			q = ""
			search.text = ""
			reset()
		"close":
			inv._press("lex", null)
		"done":
			inv._press("close", null)
		"unmade":
			made = []
			reset()
		"chips":
			var i := int(floorf(((at.x - rect.position.x) / K - GRID_X + chip_scroll) / 14.0))
			if i >= 0 and i < _base.size():
				var b: String = _base[i]
				if made.has(b):
					made.erase(b)
				else:
					made = made.slice(-1) + [b]
				reset()
		"card_away":
			card = ""
		"part":
			open_card(str(arg))
		"its_melds":
			var b := card
			group = "MELDS"
			made = [b]
			q = ""
			search.text = ""
			card = ""
			chip_scroll = maxf(0.0, _base.find(b) * 14.0 - 60.0)
			reset()
		"to_meld":
			var w := card
			card = ""
			inv._ms_lay(w)


## The wheel over the bag (or its card).
func wheel(dir: float) -> void:
	if card != "":
		card_scroll += dir * 18.0
		return
	scroll = clampf(scroll + dir * 24.0, 0.0, _max())
	bubble_t = _now
