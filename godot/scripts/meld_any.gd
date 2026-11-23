## EVERY TWO LEVEL 1 RUNES MELD (his words, 22 Nov 2026, 20:09 Eastern: “For feature complete we need the rest of the music, the
## rest of the voices, the new chained mechanic, and all level 1 runes able to meld with all other lvl1 runes”; asked whether to
## start on it, 21:23: “Yes and yes”). The game melds 23 pairs (the ten of two damage words, Volatile's five, the eight across the
## groups); here ANY TWO DIFFERENT words of the 28 meld at the wordsmith, for runedust, into one word that does the work of both:
##   THE RULES, as the game's melded words have them (words.gd resolve): it takes its side's one damage-word place, as every melded
##     word does (Implode, two words of no damage, does now); a damage word in it is MELD_PART (three quarters) of its own figure,
##     as in any melded word (MELD_RANK2); a word of any other kind in it whole, as Forking's Twin and Siphon's Leech are. Each grows
##     with its own attribute. It has no twist of its own: the 23 named ones keep theirs, and two words that make one of them still
##     make it.
##   ITS NAME, the two words' in the game's order of words joined: "Swift-Heavy"; in front "Swift-Heavy Strike", behind "Strike of
##     Swiftness and Quakes"; its page, both words' lines.
##   ON GEAR, as a melded word: one property of each of its words, each three quarters of what that word gives alone (items.ts
##     imbueOptions, MELD_GEAR_STRENGTH), made from the two words' own options (loot.gd imbue_options).
##   ON A DUNGEON'S ALTAR: as two words (it counts as two, as a melded word does), and the monsters carry its two words.
##   ITS STONE (pictures first: `stones`): the two words' stones broken down the middle and fused, the first word's left half beside
##     the second's right half, a seam between them, and both words' colours along its foot as a melded word's stone has them.
## ON: whether the wordsmith makes them (the bench, words.gd meld_of and meld_problem); the words themselves, their names and
## their stones are always known, so a save that holds one always reads.
extends RefCounted

## (OFF until his yes to the pictures: docs/mockups/melds_any/)
static var ON := false
## (a damage word's own figure in one, words.gd MELD_PART; on gear, items.ts MELD_GEAR_STRENGTH)
const GEAR := 0.75

## (the face of a word's stone and the groove's shadow, in the stones' sheet: art/icons.ts runeSprite, P.st5 and P.st3)
const FACE := Color8(101, 88, 104)
const GROOVE := Color8(58, 48, 64)


## The base words in the game's order (words.json `ids`).
static func base(D: Dictionary) -> Array:
	return D["ids"]


## Is it one of these (an id of two words joined by "+")?
static func is_any(w) -> bool:
	return w is String and (w as String).contains("+")


## The id two words make, in the game's order of words ("swift+heavy").
static func id_of(D: Dictionary, a: String, b: String) -> String:
	var ids: Array = base(D)
	return (a + "+" + b) if ids.find(a) < ids.find(b) else (b + "+" + a)


## Every pair of two different base words that no named meld is made of.
static func pairs(D: Dictionary) -> Array:
	var ids: Array = base(D)
	var named := {}
	for m in D["melds"]["of"]:
		var of: Array = D["melds"]["of"][m]
		named[id_of(D, of[0], of[1])] = true
	var out: Array = []
	for i in ids.size():
		for j in range(i + 1, ids.size()):
			if not named.has(ids[i] + "+" + ids[j]):
				out.append([ids[i], ids[j]])
	return out


static func _attr_name(a: String) -> String:
	return {"str": "Strength", "dex": "Dexterity", "int": "Intelligence"}.get(a, "")


## Into the words' tables (words.json): each one as a melded word, its two words, its attribute (its first word's: each of its
## words grows with its own, words.gd grows_by), its element (its element word's), its page.
static func add_to(D: Dictionary) -> void:
	var W: Dictionary = D["words"]
	var M: Dictionary = D["melds"]
	var any: Array = []
	for p in pairs(D):
		var a: Dictionary = W[p[0]]
		var b: Dictionary = W[p[1]]
		var id: String = p[0] + "+" + p[1]
		any.append(id)
		var el = a["element"] if a["element"] != null else b["element"]
		var damage := ""
		for w in [a, b]:
			if str(w["kind"]) == "damage":
				damage = str(w["name"])
		W[id] = {
			"id": id, "kind": "meld", "of": [p[0], p[1]], "any": true,
			"name": "%s-%s" % [a["name"], b["name"]],
			"front": "%s-%s" % [a["front"], b["front"]],
			"behind": "%s and %s" % [a["behind"], str(b["behind"]).trim_prefix("of ")],
			"attr": a["attr"], "element": el,
			"about": "%s and %s, melded.%s" % [a["name"], b["name"], (" %s three quarters as strong." % damage) if damage != "" else ""],
			"frontText": "%s %s" % [a["frontText"], b["frontText"]],
			"behindText": "%s %s" % [a["behindText"], b["behindText"]],
			"monsterText": "%s %s" % [a["monsterText"], b["monsterText"]],
		}
		M["of"][id] = [p[0], p[1]]
		M["attr"][id] = a["attr"]
		if D.has("page"):
			D["page"][id] = {"gear": ["One property as %s gives and one as %s gives, in one place." % [a["name"], b["name"]]],
				"note": "Both at once, each a little weaker than its word alone."}
	M["any"] = any


## Into the HUD's tables (hud.json): each one's colour (its first word's), name, short names and what it grows with.
static func add_hud(H: Dictionary, D: Dictionary) -> void:
	for id in D["melds"]["any"]:
		var of: Array = D["melds"]["of"][id]
		var wd: Dictionary = D["words"][id]
		H["word_color"][id] = H["word_color"].get(of[0], "#ffffff")
		var g: Array = []
		for w in of:
			var n := _attr_name(str(D["words"][w]["attr"]))
			if n != "" and not g.has(n):
				g.append(n)
		H["words"][id] = {"front": str(wd["front"]).to_upper(), "behind": str(wd["behind"]).trim_prefix("of ").to_upper(),
			"name": wd["name"], "grows": "grows with " + " and ".join(PackedStringArray(g))}


# --- THE STONES ---

## A word's stone in a sheet, as game pixels (the sheet's pictures are two to a game pixel): 12 rows of 12 colours.
static func _grid(img: Image, r: Rect2) -> Array:
	var g: Array = []
	for y in 12:
		var row: Array = []
		for x in 12:
			row.append(img.get_pixel(int(r.position.x) + 2 * x, int(r.position.y) + 2 * y))
		g.append(row)
	return g


## A word's glyph on its stone: {Vector2i: colour}, the face's pixels that are neither face nor groove.
static func _glyph(g: Array) -> Dictionary:
	var m := {}
	for y in range(2, 10):
		for x in range(2, 10):
			var c: Color = g[y][x]
			if not c.is_equal_approx(FACE) and not c.is_equal_approx(GROOVE):
				m[Vector2i(x, y)] = c
	return m


## (its most used colour: the word's own, art/icons.ts WORD_COLOR)
static func _main(m: Dictionary) -> Color:
	var n := {}
	for k in m:
		var h: String = m[k].to_html()
		n[h] = int(n.get(h, 0)) + 1
	var best := ""
	for h in n:
		if best == "" or int(n[h]) > int(n[best]):
			best = h
	return Color(best) if best != "" else Color.WHITE


## The fused stone of words `a` and `b` (their stones `ga`, `gb`, as game pixels): `ga` with its face cleared; on its left, the
## first word's glyph's left three columns; a seam down the middle; on its right, the second's right three (a glyph six wide moved
## one over, so both halves are three); each carved as the game carves a glyph (the groove's walls above and left of it in shadow);
## along its foot the first word's colour under the left and the second's under the right.
static func fuse(ga: Array, gb: Array) -> Array:
	var S: Array = []
	for row in ga:
		S.append(row.duplicate())
	for y in range(2, 10):
		for x in range(2, 10):
			S[y][x] = FACE
	var A := _glyph(ga)
	var B := _glyph(gb)
	var wide_b := false
	for k in B:
		if k.x == 9:
			wide_b = true
	var m := {}
	for k in A:
		if k.x >= 3 and k.x <= 5:
			m[k] = A[k]
	for k in B:
		var x: int = k.x if wide_b else k.x + 1
		if x >= 7 and x <= 9:
			m[Vector2i(x, k.y)] = B[k]
	for k in m:
		if not m.has(Vector2i(k.x, k.y - 1)) and (S[k.y - 1][k.x] as Color).is_equal_approx(FACE):
			S[k.y - 1][k.x] = GROOVE
		if not m.has(Vector2i(k.x - 1, k.y)) and (S[k.y][k.x - 1] as Color).is_equal_approx(FACE):
			S[k.y][k.x - 1] = GROOVE
	for k in m:
		S[k.y][k.x] = m[k]
	for y in range(2, 10):
		if (S[y][6] as Color).is_equal_approx(FACE):
			S[y][6] = GROOVE
	var ca := _main(A)
	var cb := _main(B)
	for x in [2, 3, 4]:
		S[10][x] = ca
	for x in [7, 8, 9]:
		S[10][x] = cb
	return S


## THE STONES INTO A SHEET: `tex` the sheet that holds the 28 words' stones, `rect_of` a word's stone's place in it (Rect2, or
## null), `put` called with each one's id and its place in the sheet returned (Rect2). The sheet returned is `tex` with the
## stones in rows of their own under it.
static func stones(tex: Texture2D, D: Dictionary, rect_of: Callable, put: Callable) -> Texture2D:
	var any: Array = D["melds"].get("any", [])
	if any.is_empty() or tex == null:
		return tex
	var src: Image = tex.get_image()
	if src.is_compressed():
		src.decompress()
	src.convert(Image.FORMAT_RGBA8)
	var pitch := 25
	var cols := maxi(1, int(src.get_width() / pitch))
	var rows := ceili(any.size() / float(cols))
	var img := Image.create(src.get_width(), src.get_height() + 1 + rows * pitch, false, Image.FORMAT_RGBA8)
	img.blit_rect(src, Rect2i(0, 0, src.get_width(), src.get_height()), Vector2i.ZERO)
	var grids := {}
	for w in base(D):
		var r = rect_of.call(w)
		if r != null:
			grids[w] = _grid(src, r)
	var y0: int = src.get_height() + 1
	for i in any.size():
		var of: Array = D["melds"]["of"][any[i]]
		if not grids.has(of[0]) or not grids.has(of[1]):
			continue
		var S := fuse(grids[of[0]], grids[of[1]])
		var at := Vector2i((i % cols) * pitch, y0 + int(i / cols) * pitch)
		for y in 12:
			for x in 12:
				var c: Color = S[y][x]
				if c.a <= 0.0:
					continue
				img.fill_rect(Rect2i(at.x + 2 * x, at.y + 2 * y, 2, 2), c)
		put.call(any[i], Rect2(at.x, at.y, 24, 24))
	return ImageTexture.create_from_image(img)
