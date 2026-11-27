## THE SKILL TREES' PAGE (ui/talents.ts): the inventory's TALENTS page, beside GEAR and ATTACKS: the hero's class's tree in its
## own shape, read from left to right, the points to spend over it. A talent pressed is read on a card over the game's half,
## against the panel; TAKE spends a point on it; taken, in town, UNDO gives it back for gold.
##   - a talent taken is lit: the friend's cyan round it, its rune in its path's colour on a ground of that colour, and the line
##     that led to it lit too;
##   - one that can be taken now has its path's colour round it and a ring that pulses;
##   - one whose way is open but with no point to spend, a quiet rim;
##   - one whose way is not open yet, dark, its rune faint.
## A BIG talent (a big change to how something works) is the larger stone, with a second rim. Behind each tree its faint picture
## (the Warrior's three weapons and their joins, the Ranger's arrow, the Warlock's claw, the Tinkerer's gear, the Veteran's three
## globes), so that its shape reads.
## All in the game's pixels (two of the screen's to one), as the game lays it (layTalents); the letters are the inventory's plain
## ones. (In this port, a talent whose rules are not brought over yet says so on its card and cannot be taken: talents.gd.)
extends RefCounted

const Talents := preload("res://scripts/talents.gd")

## (ui/talents.ts STONE, BIG_STONE, CARD)
const STONE := 11
const BIG_STONE := 15
const CARD := 136.0
## (the Warrior's weapons' plates at the feet of their shapes: their height, game pixels, and their widest, tree units)
const PLATE_H := 12.0
const PLATE_W := 1.7
const PRE_BOTTOM := 5.05

# ---- the runes on the stones (ui/talents.ts): 'X' the colour, 'o' the glow --------------------------------------------------
const ARROW := ["....X..", ".....X.", "XXXXXXo", ".....X.", "....X.."]
const JAWS := ["X.X.X.X", "XXXXXXX", "X.....X", ".X.o.X.", "..XXX.."]
const SPLIT := [".....X", "....X.", "XXXo..", "....X.", ".....X"]
const BLADE := [".X.....", ".X.....", "XXXXXXo", ".X.....", ".X....."]
const SIGIL := ["..XXX..", ".X...X.", "X..o..X", ".X...X.", "..XXX.."]
const HORNS := ["X.....X", "XX...XX", ".XXXXX.", ".XoXoX.", "..XXX.."]
const CLAW := ["X.X.X..", "X.X.X..", "XXXXX.X", ".XXXXo.", "..XXX.."]
const VIAL := ["..XXX..", "...X...", "..XoX..", ".XoooX.", ".XXXXX."]
const GOLEM := [".XXXXX.", "XoX.XoX", "XXXXXXX", "X.XXX.X", "X.X.X.X"]
const GEAR := [".X.X.X.", "XXXXXXX", ".XXoXX.", "XXXXXXX", ".X.X.X."]
const COIN := ["..XXX..", ".XoooX.", ".XoXoX.", ".XoooX.", "..XXX.."]
const QUICK := ["X..X...", ".X..X..", "..X..Xo", ".X..X..", "X..X..."]
const AXEHEAD := ["....XX.", "....XXX", "XXXXXoX", "....XXX", "....XX."]
const MAUL := ["....XXX", "....XXX", "XXXXXoX", "....XXX", "....XXX"]
const JOIN_STAR := ["...X...", "..XXX..", "XXXoXXX", "..XXX..", "...X..."]
const IMPACT := ["X..X..X", ".X.X.X.", "..XoX..", ".X.X.X.", "X..X..X"]
const KNUCKLE := ["..X....", ".XX....", "XXXXXXo", ".XX...X", "..X..X."]
const PAW := ["..X.X..", "X.....X", "..XXX..", ".XXoXX.", "..XXX.."]
const FIST := [".XXXXX.", "XoXoXoX", "XXXXXXX", "XXXXXX.", ".XXXX.."]
const KICK := ["X......", ".X.....", "..X....", "..XXXXo", "..XXXX."]
const LEAP := ["...X...", "..XoX..", ".X.X.X.", "...X...", "X.X.X.X"]
const FLAME := ["...X...", "..XX.X.", ".XXoXX.", ".XoooX.", "..XXX.."]
const RING := ["..XXX..", ".X...X.", "X..o..X", ".X...X.", "..XXX.."]
const MOVE_RUNE := {
	"ball": ["..XXX..", ".XXoXX.", ".XoooX.", ".XXoXX.", "..XXX.."],
	"beam": [".......", "X......", "XooXXXX", "X......", "......."],
	"spear": [".......", ".....X.", "XXXXXoX", ".....X.", "......."],
	"snare": ["..XXX..", ".X...X.", ".X...X.", "..X.X..", "...o..."],
	"snipe": ["...X...", ".X.X.X.", "XXXoXXX", ".X.X.X.", "...X..."],
	"rally": ["X......", "XX...X.", "XXXXXo.", "XX...X.", "X......"],
}
## (each path's rune: a word's where a word is the thing, else its own, in the path's colour with white's glow)
const PATH_WORD := {"fire": "fire", "lightning": "lightning", "frost": "frost", "wind": "swift", "eye": "precise", "iron": "guarding", "cross": "heavy"}
const PATH_ROWS := {"shaft": ARROW, "traps": JAWS, "arrows": SPLIT, "technique": BLADE, "gsword": BLADE, "axe": AXEHEAD, "hammer": MAUL,
	"join": JOIN_STAR, "man": SIGIL, "demon": HORNS, "pact": CLAW, "vials": VIAL, "golem": GOLEM, "works": GEAR, "gold": COIN,
	"speed": QUICK, "power": IMPACT, "counter": KNUCKLE, "punch": FIST, "kick": KICK, "jump": LEAP, "aura": RING}

var inv  # the inventory (inventory.gd): it draws, and its letters
var T := {}  # ui/ui.ts THEME
var WHITE := Color.WHITE
## The talent being read; its card as last drawn ({r, take, undo, picks: [[Rect2, id]]}); one just taken, flaring ({id, t}).
var sel := ""
var card := {}
var flash := {}
var lay := {}
## (while the faint pictures are drawn: kept to the page, as the game clips them; empty: nothing kept)
var _clip := Rect2()


func _init(inventory, theme: Dictionary, palette: Dictionary) -> void:
	inv = inventory
	for k in theme:
		T[k] = Color(theme[k])
	if palette.has("white"):
		WHITE = Color(palette["white"])


# ---- where everything goes (layTalents), in game pixels --------------------------------------------------------------------

func lay_out(cls: String, r: Rect2) -> Dictionary:
	var tree := Talents.tree(cls)
	var pts: Array = []
	for t in tree["talents"]:
		pts.append(t["at"])
	if tree["root"] != null:
		pts.append(tree["root"])
	var b: Array = tree["room"] if tree["room"] != null else [_least(pts, 0), _least(pts, 1), _most(pts, 0), _most(pts, 1)]
	# (THE WARRIOR'S WEAPON, A PRE-POINT: no rune below his weapons' plates, so his tree comes down to just under them)
	if Talents.pre_point(cls) and tree["room"] != null:
		b = [b[0], b[1], b[2], minf(float(b[3]), PRE_BOTTOM)]
	var minx: float = b[0]
	var miny: float = b[1]
	var maxx: float = b[2]
	var maxy: float = b[3]
	var head_y := r.position.y + 1.0
	# (THE WARRIOR'S WEAPON, A PRE-POINT: a row of its own under the tree, before any branch: talents.gd)
	var pre := Talents.pre_point(cls)
	var area := Rect2(r.position.x + 9.0, r.position.y + 19.0, r.size.x - 18.0, r.size.y - 29.0)
	var sx := area.size.x / maxf(0.01, maxx - minx)
	var sy := area.size.y / maxf(0.01, maxy - miny)
	var ox := 0.0
	var oy := 0.0
	if tree["square"]:
		var s := minf(sx, sy)
		ox = (area.size.x - s * (maxx - minx)) / 2.0
		oy = (area.size.y - s * (maxy - miny)) / 2.0
		sx = s
		sy = s
	var to := func(x: float, y: float) -> Vector2:
		return Vector2(roundf(area.position.x + ox + (x - minx) * sx), roundf(area.position.y + oy + (y - miny) * sy))
	var nodes: Array = []
	var at := {}
	var weapons: Array = []
	for d in tree["talents"]:
		if pre and Talents.is_weapon(cls, d["id"]):
			weapons.append(d)
			continue
		var c: Vector2 = to.call(float(d["at"][0]), float(d["at"][1]))
		var s := BIG_STONE if d["big"] else STONE
		var n := {"def": d, "r": Rect2(c.x - floorf(s / 2.0), c.y - floorf(s / 2.0), s, s), "c": c}
		nodes.append(n)
		at[d["id"]] = n
	# (each weapon's plate at the foot of its own shape, where its stone stood: its name, lit when it is his)
	var pre_r := Rect2()
	if pre:
		for d in weapons:
			var c: Vector2 = to.call(float(d["at"][0]), float(d["at"][1]))
			var bw := floorf(minf(PLATE_W * sx, _w(str(d["name"]).to_upper(), true) + 12.0))
			var br := Rect2(roundf(c.x - bw / 2.0), roundf(c.y - PLATE_H / 2.0), bw, PLATE_H)
			var n := {"def": d, "r": br, "c": br.get_center(), "weapon": true}
			nodes.append(n)
			at[d["id"]] = n
			pre_r = br if pre_r.size.x <= 0.0 else pre_r.merge(br)
	# (THE WARRIOR'S WEAPON, A PRE-POINT: no rune where the tree begins, no lines up from it: each branch begins at its own first
	# talents, and his weapon is picked on a plate at the foot of its own shape)
	var root = to.call(float(tree["root"][0]), float(tree["root"][1])) if tree["root"] != null and not pre else null
	# (each path's name beside one of its talents, in the small letters)
	var labels: Array = []
	for p in tree["paths"]:
		if str(p["name"]) == "":
			continue
		var n = at.get(p["label"]["node"])
		# (a weapon's path named on its button in the weapons' row, not in the tree)
		if n != null and n.get("weapon", false):
			continue
		var w := _w(p["name"], true)
		var x := r.position.x
		var y := r.position.y + 10.0
		if n != null:
			var half := ceilf(n["r"].size.x / 2.0) + (2.0 if n["def"]["big"] else 0.0)
			match str(p["label"]["side"]):
				"right":
					x = n["c"].x + half + 3.0
					y = n["c"].y - 3.0
				"left":
					x = n["c"].x - half - 3.0 - w
					y = n["c"].y - 3.0
				"above":
					x = n["c"].x - floorf(w / 2.0)
					y = n["c"].y - half - 8.0
				_:
					x = n["c"].x - floorf(w / 2.0)
					y = n["c"].y + half + 2.0
		labels.append({"text": p["name"], "x": maxf(r.position.x, minf(r.position.x + r.size.x - w, x)), "y": maxf(r.position.y + 10.0, minf(r.position.y + r.size.y - 6.0, y)), "color": Color(p["color"])})
	lay = {"cls": cls, "tree": tree, "nodes": nodes, "at": at, "root": root, "labels": labels, "head_y": head_y, "unit": minf(sx, sy), "to": to, "r": r, "pre": pre_r}
	return lay


static func _least(pts: Array, k: int) -> float:
	var v := INF
	for p in pts:
		v = minf(v, float(p[k]))
	return v


static func _most(pts: Array, k: int) -> float:
	var v := -INF
	for p in pts:
		v = maxf(v, float(p[k]))
	return v


# ---- drawing, in game pixels ------------------------------------------------------------------------------------------------

func _w(s: String, small := false) -> float:
	return inv._width(s, inv.SMALL if small else inv.NORMAL) / inv.K


func _text(x: float, y: float, s: String, c: Color, small := false, right := false) -> void:
	var px: int = inv.SMALL if small else inv.NORMAL
	var at: Vector2 = Vector2(x, y) * float(inv.K)
	if right:
		at.x -= inv._width(s, px)
	inv._top(at, s, px, c)


func _rect(x: float, y: float, w: float, h: float, c: Color) -> void:
	var r := Rect2(x, y, w, h)
	if _clip.has_area():
		r = r.intersection(_clip)
		if not r.has_area():
			return
	inv.draw_rect(Rect2(r.position * inv.K, r.size * inv.K), c)


## (ui.ts box) A box with its corners cut: its edge, then its ground inside.
func _box(x: float, y: float, w: float, h: float, fill: Color, edge: Color) -> void:
	_rect(x + 1, y, w - 2, h, edge)
	_rect(x, y + 1, w, h - 2, edge)
	_rect(x + 1, y + 0.5, w - 2, h - 1, fill)
	_rect(x + 0.5, y + 1, w - 1, h - 2, fill)


## (ui/talents.ts line) A line one game pixel thick, pixel by pixel.
func _line(x0: float, y0: float, x1: float, y1: float, c: Color, alpha := 1.0) -> void:
	var col := Color(c, c.a * alpha)
	var x := roundi(x0)
	var y := roundi(y0)
	var X := roundi(x1)
	var Y := roundi(y1)
	var dx := absi(X - x)
	var dy := -absi(Y - y)
	var sx := 1 if x < X else -1
	var sy := 1 if y < Y else -1
	var err := dx + dy
	for n in 2000:
		_rect(x, y, 1, 1, col)
		if x == X and y == Y:
			break
		var e2 := 2 * err
		if e2 >= dy:
			err += dy
			x += sx
		if e2 <= dx:
			err += dx
			y += sy


## A shape filled, faint (the figures behind the trees); one that cannot be cut into triangles is left unfilled.
func _fill(pts: PackedVector2Array, c: Color, alpha: float) -> void:
	var p := PackedVector2Array()
	for q in pts:
		p.append(q + Vector2(0.5, 0.5))
	var parts: Array = [p]
	if _clip.has_area():
		var box := PackedVector2Array([_clip.position, Vector2(_clip.end.x, _clip.position.y), _clip.end, Vector2(_clip.position.x, _clip.end.y)])
		parts = Geometry2D.intersect_polygons(p, box)
	var col := Color(c, alpha)
	for part in parts:
		var sp := PackedVector2Array()
		for q in part:
			sp.append(q * inv.K)
		var tri := Geometry2D.triangulate_polygon(sp)
		for i in range(0, tri.size(), 3):
			inv.draw_colored_polygon(PackedVector2Array([sp[tri[i]], sp[tri[i + 1]], sp[tri[i + 2]]]), col)


func _rune_of(tree: Dictionary, t: Dictionary) -> Dictionary:
	var word = t["word"]
	if word != null:
		return _word_rune(str(word))
	var color: Color = T["text"]
	for p in tree["paths"]:
		if p["id"] == t["path"]:
			color = Color(p["color"])
	# (THE BRAWLER'S BUILDS: a stance's stone shows its element's rune)
	if t.has("rune"):
		return _word_rune(str(t["rune"]))
	if MOVE_RUNE.has(t["id"]):
		return {"rows": MOVE_RUNE[t["id"]], "color": T["text"], "glow": WHITE}
	if t["id"] == "huntcompanion" or t["id"] == "wildcompanion":
		return {"rows": PAW, "color": color, "glow": WHITE}
	for f in tree["figures"]:
		if f["kind"] == "globe" and f.get("fire") == t["id"]:
			return {"rows": FLAME, "color": color, "glow": WHITE}
	if PATH_WORD.has(t["path"]):
		return _word_rune(PATH_WORD[t["path"]])
	return {"rows": PATH_ROWS.get(t["path"], ARROW), "color": color, "glow": WHITE}


func _word_rune(w: String) -> Dictionary:
	var d: Dictionary = Talents.D["words"].get(w, {})
	if d.is_empty():
		return {"rows": ARROW, "color": T["text"], "glow": WHITE}
	return {"rows": d["rows"], "color": Color(d["color"]), "glow": Color(d["glow"])}


func _rune(rune: Dictionary, cx: float, cy: float, alpha: float) -> void:
	var rows: Array = rune["rows"]
	var h := rows.size()
	var w := str(rows[0]).length()
	var x0 := roundf(cx - w / 2.0)
	var y0 := roundf(cy - h / 2.0)
	for y in h:
		var row := str(rows[y])
		for x in w:
			var ch := row[x]
			if ch == ".":
				continue
			var c: Color = rune["glow"] if ch == "o" else rune["color"]
			_rect(x0 + x, y0 + y, 1, 1, Color(c, alpha))


## The page: the line over the tree, the faint picture behind it, the lines, the captions and the stones (drawTalents).
func draw(h, level: int, t: float, dt: float) -> void:
	var tree: Dictionary = lay["tree"]
	var r: Rect2 = lay["r"]
	var taken: Array = h.talents
	var left := maxi(0, Talents.points(level) - Talents.spent(h.cls, taken))
	var pulse := 0.5 + 0.5 * sin(t * 6.0)
	if not flash.is_empty():
		flash["t"] += dt
		if flash["t"] > 0.8:
			flash = {}
	if sel != "" and not lay["at"].has(sel):
		sel = ""
	# the line over the tree: what it is, and the points
	var nx := Talents.next_point(h.cls, level, taken)
	var pts := ("%d %s TO SPEND" % [left, "POINT" if left == 1 else "POINTS"]) if left > 0 else ("NEXT POINT AT LEVEL %d" % nx if nx >= 0 else "ALL TEN SPENT")
	var what := "TALENTS: %s" % str(tree["shape"]).to_upper()
	var pts_w := _w(pts, left <= 0)
	_text(r.position.x, lay["head_y"] + 2.0, what if _w(what, true) + 8.0 + pts_w <= r.size.x else "TALENTS", T["dim"], true)
	_text(r.position.x + r.size.x, lay["head_y"], pts, T["accent"] if left > 0 else T["dim"], left <= 0, true)
	var at: Dictionary = lay["at"]
	# the faint pictures behind the tree, so that its shape reads; the new classes' (a claw's talons, a gear, a fist, the
	# globes, the weapons) kept to the page
	for f in tree["figures"]:
		if str(f["kind"]) in ["talon", "gear", "round", "globe", "outline"]:
			_clip = Rect2(r.position.x - 4.0, r.position.y + 10.0, r.size.x + 8.0, r.size.y - 10.0)
	# (THE WARRIOR'S WEAPON, A PRE-POINT: the shapes of the two weapons he does not hold drawn fainter)
	var held_path := ""
	if Talents.pre_point(h.cls):
		var wpn := Talents.warrior_weapon(taken)
		for p in Talents.D["weapons"]["paths"]:
			if Talents.D["weapons"]["paths"][p] == wpn:
				held_path = p
	for f in tree["figures"]:
		var color: Color = T["dim"]
		for p in tree["paths"]:
			if p["id"] == f["path"]:
				color = Color(p["color"])
		if held_path != "" and Talents.D["weapons"]["paths"].has(f["path"]) and f["path"] != held_path:
			color = Color(color, 0.45)
		match str(f["kind"]):
			"fill":
				var ps := PackedVector2Array()
				for id in f["ids"]:
					if at.has(id):
						ps.append(at[id]["c"])
				if ps.size() >= 3:
					_fill(ps, color, 0.09)
			"talon":
				var ns: Array = []
				for id in f["ids"]:
					if at.has(id):
						ns.append(at[id])
				_talon(ns, float(f["width"]), float(f["hook"]), color)
			"gear":
				var ring: Array = []
				for id in f["ring"]:
					if at.has(id):
						ring.append(at[id])
				if at.has(f["hub"]) and ring.size() >= 3:
					_gear(at[f["hub"]], ring, int(f["spokes"]), color)
			"globe":
				var ns: Array = []
				for id in f["ids"]:
					if at.has(id):
						ns.append(at[id])
				if ns.size() >= 3:
					_globe(ns, at.get(f.get("fire", ""), null) if f.get("fire") != null else null, color)
			"outline":
				var ps := PackedVector2Array()
				for q in f["pts"]:
					ps.append(lay["to"].call(float(q[0]), float(q[1])))
				if ps.size() >= 3:
					_fill(ps, color, 0.1)
					for i in ps.size():
						var a := ps[i]
						var b := ps[(i + 1) % ps.size()]
						_line(a.x, a.y, b.x, b.y, color, 0.3)
	_clip = Rect2()
	# the lines: between each talent and the ones that lead to it; and from the mage's rune
	if lay["root"] != null:
		for n in lay["nodes"]:
			if n.get("weapon", false):
				continue
			# (THE WARRIOR'S WEAPON, A PRE-POINT: a weapon's path begins at its own first talents, from where the tree begins)
			var from_weapon: bool = (n["def"]["from"] as Array).any(func(f): return at.has(f) and at[f].get("weapon", false))
			if not (n["def"]["from"] as Array).is_empty() and not from_weapon:
				continue
			var lit: bool = taken.has(n["def"]["id"])
			_line(lay["root"].x, lay["root"].y, n["c"].x, n["c"].y, T["accent"] if lit else T["edgeHi"], 1.0 if lit else 0.7)
	for n in lay["nodes"]:
		if n.get("weapon", false):
			continue
		for fr in n["def"]["from"]:
			if not at.has(fr) or at[fr].get("weapon", false):
				continue
			var m: Dictionary = at[fr]
			var lit: bool = taken.has(n["def"]["id"]) and taken.has(fr)
			_line(m["c"].x, m["c"].y, n["c"].x, n["c"].y, T["accent"] if lit else T["edgeHi"], 1.0 if lit else 0.55)
	# the mage's rune, where her three paths begin
	if lay["root"] != null:
		var rt: Vector2 = lay["root"]
		_box(rt.x - 7, rt.y - 7, 15, 15, T["bg2"], T["accentLo"])
		_rune({"rows": ["..X..", ".XoX.", "XoooX", ".XoX.", "..X.."], "color": T["accentLo"], "glow": T["accent"]}, rt.x + 0.5, rt.y + 0.5, 1.0)
	# the captions of the paths
	for l in lay["labels"]:
		_text(l["x"], l["y"], l["text"], l["color"], true)
	# the stones
	for n in lay["nodes"]:
		var d: Dictionary = n["def"]
		var took: bool = taken.has(d["id"])
		if n.get("weapon", false):
			var br: Rect2 = n["r"]
			var wc: Color = T["text"]
			for p in tree["paths"]:
				if p["id"] == d["path"]:
					wc = Color(p["color"])
			_box(br.position.x, br.position.y, br.size.x, br.size.y, T["hot"] if took else T["bg2"], T["accent"] if took else T["edgeHi"])
			var nm := str(d["name"]).to_upper()
			_text(br.position.x + floorf((br.size.x - _w(nm, true)) / 2.0), br.position.y + floorf((br.size.y - 6.0) / 2.0) + 1.0, nm, WHITE if took else wc, true)
			if sel == d["id"]:
				_rect(br.position.x - 2, br.position.y - 2, br.size.x + 4, 1, T["accent"])
				_rect(br.position.x - 2, br.position.y + br.size.y + 1, br.size.x + 4, 1, T["accent"])
				_rect(br.position.x - 2, br.position.y - 2, 1, br.size.y + 4, T["accent"])
				_rect(br.position.x + br.size.x + 1, br.position.y - 2, 1, br.size.y + 4, T["accent"])
			continue
		var opened: bool = not took and Talents.open(h.cls, taken, d["id"])
		var can: bool = opened and left > 0 and Talents.ported(h.cls, d["id"])
		var rune := _rune_of(tree, d)
		var pc: Color = T["text"]
		for p in tree["paths"]:
			if p["id"] == d["path"]:
				pc = Color(p["color"])
		var sr: Rect2 = n["r"]
		var x := sr.position.x
		var y := sr.position.y
		var w := sr.size.x
		if d["big"]:
			_box(x - 2, y - 2, w + 4, w + 4, T["ink"], T["accent"] if took else (pc if can else T["edge"]))
		if took:
			_box(x, y, w, w, T["hot"], T["accent"])
			_rect(x + 1, y + 1, w - 2, w - 2, Color(pc, 0.35))
		elif can:
			_box(x, y, w, w, T["bg2"], pc)
		elif opened:
			_box(x, y, w, w, T["bg2"], T["edgeHi"])
		else:
			_box(x, y, w, w, T["slot"], T["edge"])
		_rune(rune, n["c"].x + 0.5, n["c"].y + 0.5, 1.0 if took or can else (0.75 if opened else 0.35))
		# (one that can be taken now: a ring that pulses round it)
		if can:
			var o := 4.0 if d["big"] else 2.0
			var col := Color(T["accent"], 0.25 + 0.5 * pulse)
			inv.draw_rect(Rect2(Vector2(x - o + 0.25, y - o + 0.25) * inv.K, Vector2(w + 2 * o - 0.5, w + 2 * o - 0.5) * inv.K), col, false, 1.0)
		# (the one being read)
		if sel == d["id"]:
			var o := 4.0 if d["big"] else 3.0
			_rect(x - o, y - o, w + 2 * o, 1, T["accent"])
			_rect(x - o, y + w + o - 1, w + 2 * o, 1, T["accent"])
			_rect(x - o, y - o, 1, w + 2 * o, T["accent"])
			_rect(x + w + o - 1, y - o, 1, w + 2 * o, T["accent"])
		# (just taken: it flares)
		if not flash.is_empty() and flash["id"] == d["id"]:
			var k: float = flash["t"] / 0.8
			var o := roundf(2.0 + k * 8.0)
			inv.draw_rect(Rect2(Vector2(x - o + 0.5, y - o + 0.5) * inv.K, Vector2(w + 2 * o - 1, w + 2 * o - 1) * inv.K), Color(WHITE, 1.0 - k), false, 2.0)


## A TALON along talents `ns`: wide at the first, narrowing to a point past the last, hooking down by `hook` (drawTalon).
func _talon(ns: Array, width: float, hook: float, color: Color) -> void:
	if ns.size() < 2:
		return
	var pts: Array = []
	for n in ns:
		pts.append(n["c"])
	var a: Vector2 = pts[pts.size() - 2]
	var b: Vector2 = pts[pts.size() - 1]
	var ang := atan2(b.y - a.y, b.x - a.x)
	var step := a.distance_to(b) * 0.12
	var p := b
	for i in 4:
		ang += hook / 4.0
		p += Vector2(cos(ang), sin(ang)) * step
		pts.append(p)
	var along: Array = [0.0]
	for i in range(1, pts.size()):
		along.append(float(along[i - 1]) + (pts[i] as Vector2).distance_to(pts[i - 1]))
	var total: float = along[along.size() - 1] if float(along[along.size() - 1]) != 0.0 else 1.0
	var left: Array = []
	var right: Array = []
	for i in pts.size():
		var q0: Vector2 = pts[maxi(0, i - 1)]
		var q1: Vector2 = pts[mini(pts.size() - 1, i + 1)]
		var l := q0.distance_to(q1)
		if l == 0.0:
			l = 1.0
		var nrm := Vector2(-(q1.y - q0.y) / l, (q1.x - q0.x) / l)
		var w := width * pow(1.0 - float(along[i]) / total, 0.8)
		left.append(pts[i] + nrm * w)
		right.append(pts[i] - nrm * w)
	var shape := PackedVector2Array(left)
	var back := right.duplicate()
	back.reverse()
	shape.append_array(PackedVector2Array(back))
	_fill(shape, color, 0.1)
	for side in [left, right]:
		for i in range(1, side.size()):
			_line(side[i - 1].x, side[i - 1].y, side[i].x, side[i].y, color, 0.3)


## A GEAR: its ring through the talents `ring` round the hub talent, a tooth out at each, `spokes` spokes, the hub's boss (drawGear).
func _gear(hub: Dictionary, ring: Array, spokes: int, color: Color) -> void:
	var hc: Vector2 = hub["c"]
	var r := 0.0
	for n in ring:
		r += hc.distance_to(n["c"])
	r /= ring.size()
	var band := maxf(4.0, roundf(r * 0.13))
	# (the ring: a band either side of the talents' circle)
	var outer := PackedVector2Array()
	var inner := PackedVector2Array()
	for i in 49:
		var a := i / 48.0 * TAU
		outer.append(hc + Vector2(cos(a), sin(a)) * (r + band))
		inner.append(hc + Vector2(cos(a), sin(a)) * (r - band))
	for i in 48:
		_fill(PackedVector2Array([outer[i], outer[i + 1], inner[i + 1], inner[i]]), color, 0.09)
	# (a tooth out at each talent of the ring)
	for n in ring:
		var a := atan2(n["c"].y - hc.y, n["c"].x - hc.x)
		var u := Vector2(cos(a), sin(a))
		var v := Vector2(-u.y, u.x)
		var half := band * 0.9
		var r0 := r + band
		var r1 := r + band * 2.1
		_fill(PackedVector2Array([hc + u * r0 + v * half * 1.2, hc + u * r1 + v * half * 0.8, hc + u * r1 - v * half * 0.8, hc + u * r0 - v * half * 1.2]), color, 0.09)
	# (the boss round the hub)
	var boss := PackedVector2Array()
	for i in 32:
		var a := i / 32.0 * TAU
		boss.append(hc + Vector2(cos(a), sin(a)) * band * 1.8)
	_fill(boss, color, 0.09)
	# (its edges, and the spokes)
	for rad in [[r + band, 0.3], [r - band, 0.22]]:
		var p := hc + Vector2(rad[0], 0)
		for i in range(1, 65):
			var a := i / 64.0 * TAU
			var q := hc + Vector2(cos(a), sin(a)) * float(rad[0])
			_line(p.x, p.y, q.x, q.y, color, rad[1])
			p = q
	for i in spokes:
		var a := float(i) / spokes * TAU
		for o in [-1.5, 1.5]:
			var nv := Vector2(-sin(a) * o, cos(a) * o)
			var s0 := hc + Vector2(cos(a), sin(a)) * band * 1.8 + nv
			var s1 := hc + Vector2(cos(a), sin(a)) * (r - band) + nv
			_line(s0.x, s0.y, s1.x, s1.y, color, 0.22)


## THE VETERAN'S GLOBE: a ball of glass through the talents round its rim, faintly filled, its rim, a glint; and with `fire`,
## three tongues of flame over it (drawGlobe).
func _globe(ns: Array, fire, color: Color) -> void:
	var c := Vector2.ZERO
	for n in ns:
		c += n["c"]
	c /= ns.size()
	var rad := 0.0
	for n in ns:
		rad += c.distance_to(n["c"])
	rad /= ns.size()
	var disc := PackedVector2Array()
	for i in 48:
		var a := i / 48.0 * TAU
		disc.append(c + Vector2(cos(a), sin(a)) * rad - Vector2(0.5, 0.5))
	_fill(disc, color, 0.08)
	var seg := func(rr: float, a0: float, a1: float, alpha: float, steps: int) -> void:
		for i in steps:
			var a := a0 + (a1 - a0) * i / steps
			var b := a0 + (a1 - a0) * (i + 1) / steps
			_line(c.x + cos(a) * rr, c.y + sin(a) * rr, c.x + cos(b) * rr, c.y + sin(b) * rr, color, alpha)
	seg.call(rad, 0.0, TAU, 0.4, 48)
	seg.call(rad - 2.0, 0.0, TAU, 0.15, 48)
	seg.call(rad * 0.72, PI * 1.08, PI * 1.38, 0.5, 6)
	seg.call(rad * 0.6, PI * 1.12, PI * 1.26, 0.35, 3)
	if fire == null:
		return
	var fx: float = fire["c"].x
	var crown: Dictionary = ns[0]
	for n in ns:
		if n["c"].y < crown["c"].y:
			crown = n
	var base: float = crown["r"].position.y - 2.0
	var top: float = fire["r"].position.y - 9.0
	for dk in [[-0.62, 0.62], [0.0, 1.0], [0.62, 0.7]]:
		var dx: float = dk[0]
		var x0 := fx + dx * rad * 0.55
		var y1 := base - (base - top) * float(dk[1])
		var w := rad * 0.2
		var tip := Vector2(x0 + dx * w * 0.6, y1)
		var flame := PackedVector2Array([Vector2(x0 - w, base)])
		for i in range(1, 6):
			var k := i / 6.0
			flame.append(_quad(Vector2(x0 - w, base), Vector2(x0 - w * 1.1, (base + y1) / 2.0), tip, k))
		flame.append(tip)
		for i in range(1, 6):
			var k := i / 6.0
			flame.append(_quad(tip, Vector2(x0 + w * 1.1, (base + y1) / 2.0), Vector2(x0 + w, base), k))
		flame.append(Vector2(x0 + w, base))
		var shifted := PackedVector2Array()
		for q in flame:
			shifted.append(q - Vector2(0.5, 0.5))
		_fill(shifted, color, 0.14)
		_line(x0 - w, base, tip.x, tip.y, color, 0.35)
		_line(x0 + w, base, tip.x, tip.y, color, 0.35)


static func _quad(a: Vector2, b: Vector2, c: Vector2, k: float) -> Vector2:
	return a.lerp(b, k).lerp(b.lerp(c, k), k)


# ---- the card of the talent being read (drawTalentCard) ---------------------------------------------------------------------

## What the card says, line by line (cardLines).
func _lines(t: Dictionary, tree: Dictionary, cls: String) -> Array:
	var path := {}
	for p in tree["paths"]:
		if p["id"] == t["path"]:
			path = p
	var out: Array = []
	out.append({"text": str(t["name"]).to_upper(), "color": WHITE, "small": false})
	if Talents.is_weapon(cls, t["id"]):
		out.append({"text": "WEAPON: FREE TO SWAP", "color": Color(path["color"]) if not path.is_empty() else T["dim"], "small": true})
	else:
		out.append({"text": "%s%sTALENT" % ["BIG " if t["big"] else "", (str(path["name"]) + " ") if not path.is_empty() and str(path["name"]) != "" else ""], "color": Color(path["color"]) if not path.is_empty() else T["dim"], "small": true})
	# (THE RANGER'S COMPANIONS, taken: in place of its words, the one at his side and what it does; he picks another below)
	var C = _pets()
	var group: String = _pet_group(t["id"]) if C != null else ""
	var pet: String = C.picked_in(group) if group != "" and inv.hero.talents.has(t["id"]) else ""
	if pet == "":
		for l in _wrap(str(t["text"]), CARD - 10.0):
			out.append({"text": l, "color": T["text"], "small": false})
	if t["word"] != null:
		var wd: Dictionary = Talents.D["words"].get(str(t["word"]), {})
		var name: String = inv._hud["words"].get(str(t["word"]), {}).get("name", str(t["word"]))
		out.append({"text": "WORKS WITH %s" % name.to_upper(), "color": Color(wd.get("color", "#ffffff")), "small": true})
	if pet != "":
		var info: Dictionary = C.D["info"][pet]
		for l in _wrap("%s: %s" % [str(info["name"]).to_upper(), info["short"]], CARD - 10.0):
			out.append({"text": l, "color": T["accent"], "small": false})
	return out


## (the Ranger's companions: companions.gd)
func _pets():
	return inv.main.get("_companions") if inv.main != null else null


## (companions.ts groupOfTalent) The group a companion talent brings, or "".
func _pet_group(id: String) -> String:
	return "hunt" if id == "huntcompanion" else ("wild" if id == "wildcompanion" else "")


func _wrap(s: String, w: float) -> Array:
	return inv._wrap(s, w * inv.K, inv.NORMAL)


## The card, over the game's half against the panel's edge, level with its stone; its TAKE, its UNDO, its pick of two. `W` the
## panel's width and `H` the screen's height, game pixels. Returns the buttons to press: [Rect2 (screen), action, arg].
func draw_card(h, level: int, gold: int, in_town: bool, W: float, H: float, price_level := -1) -> Array:
	# (the price of undoing one by his own level, whatever level his points are counted by: game.ts unlearnPrice)
	var own := level if price_level < 0 else price_level
	card = {}
	var buttons: Array = []
	if sel == "" or not lay["at"].has(sel):
		return buttons
	var n: Dictionary = lay["at"][sel]
	var d: Dictionary = n["def"]
	var tree: Dictionary = lay["tree"]
	var lines := _lines(d, tree, h.cls)
	var took: bool = h.talents.has(d["id"])
	var why := Talents.take_problem(h.cls, level, h.talents, d["id"])
	var bh := 13.0
	var text_h := 0.0
	for l in lines:
		text_h += (6.0 if l["small"] else 9.0) + (2.0 if l["small"] else 1.0)
	var pick_row := bh + 3.0 if took and d["pick"] != null else 0.0
	# (THE RANGER'S COMPANIONS, taken: a row of its three to pick from; out of town a tap says where)
	var pet_group: String = _pet_group(d["id"]) if _pets() != null and took else ""
	var pet_row := bh + 3.0 if pet_group != "" else 0.0
	var ch := 5.0 + text_h + 3.0 + pet_row + pick_row + bh + 5.0
	# (over the game's half: the panel is on the right, the card against its edge, level with the stone; laid out in the other
	# half's own lay, from W: inventory.gd _half)
	var cr := Rect2(2.0 * W - 3.0 - CARD, maxf(2.0, minf(H - ch - 2.0, n["c"].y - 12.0)), CARD, ch)
	_box(cr.position.x, cr.position.y, cr.size.x, cr.size.y, T["bg"], T["edgeHi"])
	_rect(cr.position.x + 1, cr.position.y + 1, cr.size.x - 2, 0.5, T["accentLo"])
	var ly := cr.position.y + 5.0
	for l in lines:
		_text(cr.position.x + 5.0, ly, l["text"], l["color"], l["small"])
		ly += (6.0 if l["small"] else 9.0) + (2.0 if l["small"] else 1.0)
	var by := cr.position.y + cr.size.y - 5.0 - bh
	if pick_row > 0.0:
		var now := pick_of(h, d)
		var ids: Array = d["pick"]["ids"]
		var pw := floorf((cr.size.x - 10.0 - 3.0 * (ids.size() - 1)) / ids.size())
		for k in ids.size():
			var pr := Rect2(cr.position.x + 5.0 + k * (pw + 3.0), by - pick_row, pw, bh)
			_button(pr, str(d["pick"]["names"][k]), now == ids[k], false)
			if now != ids[k]:
				buttons.append([_screen(pr), "tal_pick", ids[k]])
	if pet_group != "":
		var C = _pets()
		var kinds: Array = C.D["groups"][pet_group]["kinds"]
		var now: String = C.picked_in(pet_group)
		var pw := floorf((cr.size.x - 10.0 - 3.0 * (kinds.size() - 1)) / kinds.size())
		for k in kinds.size():
			var pr := Rect2(cr.position.x + 5.0 + k * (pw + 3.0), by - bh - 3.0 - pick_row, pw, bh)
			_button(pr, str(C.D["info"][kinds[k]]["name"]).to_upper(), now == kinds[k], now == kinds[k])
			buttons.append([_screen(pr), "tal_pet", kinds[k]])
	if took:
		var took_word := "YOURS" if Talents.is_weapon(h.cls, d["id"]) else "TAKEN"
		_text(cr.position.x + 5.0, by + floorf((bh - 8.0) / 2.0) + 1.0, took_word, T["good"])
		var tw := _w(took_word) + 10.0
		var no := Talents.unlearn_problem(h.cls, h.talents, d["id"])
		if no == "" and not in_town:
			no = "Undone in town only"
		elif no == "" and gold < Talents.unlearn_price(own):
			no = "Needs %d gold" % Talents.unlearn_price(own)
		if no == "":
			var ur := Rect2(cr.position.x + 5.0 + tw, by, cr.size.x - 10.0 - tw, bh)
			_button(ur, "UNDO  %d GOLD" % Talents.unlearn_price(own), false, false)
			buttons.append([_screen(ur), "tal_undo", d["id"]])
		else:
			_text(cr.position.x + 5.0 + tw, by + floorf((bh - 6.0) / 2.0) + 1.0, no.to_upper(), T["dim"], true)
	elif why == "":
		var tr := Rect2(cr.position.x + 5.0, by, cr.size.x - 10.0, bh)
		_button(tr, "SWAP TO IT  (NO POINT)" if Talents.is_weapon(h.cls, d["id"]) else "TAKE  (1 POINT)", false, true)
		buttons.append([_screen(tr), "tal_take", d["id"]])
	else:
		_text(cr.position.x + 5.0, by + floorf((bh - 6.0) / 2.0) + 1.0, why.to_upper(), T["dim"], true)
	card = {"r": cr}
	buttons.append([_screen(cr), "tal_card", null])
	return buttons


func _screen(r: Rect2) -> Rect2:
	return Rect2(r.position * inv.K, r.size * inv.K)


## (ui.ts drawButton) the pink one to press, or a plain one lit when it is the one picked.
func _button(r: Rect2, label: String, lit: bool, primary: bool) -> void:
	if primary:
		_box(r.position.x, r.position.y, r.size.x, r.size.y, T["call"], T["callHi"])
	else:
		_box(r.position.x, r.position.y, r.size.x, r.size.y, T["hot"] if lit else T["bg2"], T["edgeHi"])
	var c: Color = WHITE if primary else T["text"]
	var w := _w(label)
	_text(r.position.x + floorf((r.size.x - w) / 2.0), r.position.y + floorf((r.size.y - 8.0) / 2.0) + 1.0, label, c)


## The pick made on a talent with a pick of two: its first till another is picked (game.ts pickOf).
static func pick_of(h, d: Dictionary) -> String:
	if d["pick"] == null:
		return ""
	var p = h.picks.get(d["id"])
	return str(p) if p != null and (d["pick"]["ids"] as Array).has(p) else str(d["pick"]["ids"][0])


## The stone under a press (game pixels), with the game's pad of a pixel round it; "" for none.
func stone_at(at: Vector2) -> String:
	for n in lay.get("nodes", []):
		if (n["r"] as Rect2).grow(1.0).has_point(at):
			return n["def"]["id"]
	return ""
