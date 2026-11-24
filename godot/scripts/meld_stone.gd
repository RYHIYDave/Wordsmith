## THE MELDING STONE: the wordsmith's half while he melds (inventory.gd, its page MELDING), as the owner saw it and said yes.
## His words, 23 Nov 2026 (evening, Eastern): “In that same vein, the wordsmith UI is pretty empty.  I want some pizazz to his
## inventory.  Especially during the melding process.  Two runes go in, one comes out, you know?  They melt into cyan light
## pour down two tracks to a single empty slot where the new rune forms.” Shown the first mock-up, he picked “Change the
## melding”, then “The stone looks off, Too slow, Layout” and “Straight down”; shown the second, “Build both in the game
## (Recommended)”. The mock-up: docs/mockups/rune_bag (its mock.ts drawSmith is what this follows, line for line).
##   - THE STONE: one block of the slate his standing stones in town are cut from, chipped, lit from above, his runes cut into
##     its border's corners and beside its channels; two hollows side by side at its top, a channel straight down from each,
##     turning in at their feet into the hollow beneath, the six standing stones of his ring round that. Its picture is
##     assets/ui/meld_stone.png, and where its things lie assets/ui/meld_stone.json, both taken from the mock-up's own drawing.
##   - THE MELD (about 1.8 s to the new rune): the two rise, tremble and crack with light; melt into cyan light pooling in their
##     hollows; the light runs down the two channels, the carved runes flaring as it passes; the two streams wheel round the
##     hollow beneath, the standing stones waking; the whole stone flashes, a ring is thrown out, sparks; the new rune's pixels
##     gather out of the light into their places; its name. Pressed, it flies across into the bag.
## The rules are the game's as before (loot.gd meld_words, at MELD): this file only shows them.
extends RefCounted

const PF := preload("res://scripts/pixel_font.gd")
const Words := preload("res://scripts/words.gd")

const K := 2.0
const PICK := Color("#7af8f0")
const PICK_LO := Color("#22a8c0")
const PANEL := Color("#0e0c24")
const BOX := Color("#1a1648")
const EDGE := Color("#3a3478")
const PRESS := Color("#e0287a")
const PRESS_HI := Color("#ff7aa8")
const FAINT := Color("#5a54b0")
const DIM := Color("#9c96dc")
const TEXT := Color("#f0e8ff")
const BAD := Color("#ff6e80")
const INK := Color("#0e0c24")
const WASH := Color("#dffffc")
const CY := [Color("#7af8f0"), Color("#bffcf8"), Color("#22a8c0"), Color("#ffffff")]
const PLATE := Color(0.03, 0.047, 0.063, 0.8)

var inv  # inventory.gd
var tex: Texture2D
var G := {}
var glow_tex: Texture2D
## (the times of a meld, seconds from MELD pressed: the mock-up's, meld_stone.json `times`)
var M_CHARGE := 0.2
var M_MELT := 0.5
var M_POUR := 0.92
var M_SWIRL := 1.25
var M_FLASH := 1.36
var M_GATHER := 0.3
var M_FORM := 1.78
var M_NAME := 1.9
## The meld being shown: {a, b, res, first, t, burst, pix, from, taken}; {} for none.
var anim := {}
var parts: Array = []
var _mote := 0.0
var _now := 0.0
var _sil := {}
var _img: Image
## (where the half was drawn last, game pixels from the panel's origin: for the flight into the bag)
var _origin := Vector2.ZERO


func _init(owner) -> void:
	inv = owner
	tex = load("res://assets/ui/meld_stone.png")
	G = JSON.parse_string(FileAccess.get_file_as_string("res://assets/ui/meld_stone.json"))
	var tm: Dictionary = G["times"]
	M_CHARGE = float(tm["M_CHARGE"])
	M_MELT = float(tm["M_MELT"])
	M_POUR = float(tm["M_POUR"])
	M_SWIRL = float(tm["M_SWIRL"])
	M_FLASH = float(tm["M_FLASH"])
	M_GATHER = float(tm["M_GATHER"])
	M_FORM = float(tm["M_FORM"])
	M_NAME = float(tm["M_NAME"])
	var gr := Gradient.new()
	gr.set_color(0, Color(1, 1, 1, 1))
	gr.set_color(1, Color(1, 1, 1, 0))
	gr.add_point(0.35, Color(1, 1, 1, 0.45))
	var gt := GradientTexture2D.new()
	gt.gradient = gr
	gt.fill = GradientTexture2D.FILL_RADIAL
	gt.fill_from = Vector2(0.5, 0.5)
	gt.fill_to = Vector2(1.0, 0.5)
	gt.width = 64
	gt.height = 64
	glow_tex = gt


func _v(p) -> Vector2:
	return Vector2(float(p["x"]), float(p["y"]))


## MELD pressed and done by the rules: the two that went in, what came out, and whether it was found for the first time.
func start(a: String, b: String, res: String, first: bool) -> void:
	var pix := _pixels(res)
	var from: Array = []
	for i in pix.size():
		var ang := randf() * TAU
		var rr := 14.0 + randf() * 22.0
		from.append([cos(ang) * rr, sin(ang) * rr * 0.8, randf() * 0.14])
	anim = {"a": a, "b": b, "res": res, "first": first, "t": 0.0, "burst": false, "pix": pix, "from": from, "taken": -1.0}


## Is a meld being played out (the new rune not yet formed)?
func busy() -> bool:
	return not anim.is_empty() and float(anim["t"]) < M_FORM


## The new rune, formed and waiting in the hollow beneath ("" if none).
func waiting() -> String:
	return str(anim["res"]) if not anim.is_empty() and float(anim["t"]) >= M_FORM and float(anim["taken"]) < 0.0 else ""


## Pressed: the new rune flies across into the bag (done at once with `quick`, as when another rune is laid in).
func take(quick := false) -> void:
	if waiting() == "":
		if quick:
			anim = {}
		return
	anim["taken"] = _now
	if inv._rb != null:
		inv._rb.show_word(str(anim["res"]))
	if quick:
		_landed()


## Anything pressed mid-meld (a rune laid in, MELD again) does not wait on it: it is done at once, the new rune in the bag.
func finish_now() -> void:
	if anim.is_empty():
		return
	if inv._rb != null and float(anim["taken"]) < 0.0:
		inv._rb.show_word(str(anim["res"]))
	_landed()


func _landed() -> void:
	if inv._rb != null and not anim.is_empty():
		inv._rb.flash(str(anim["res"]))
	anim = {}


func step(dt: float) -> void:
	_now += dt
	if not anim.is_empty():
		anim["t"] = float(anim["t"]) + dt
	for i in range(parts.size() - 1, -1, -1):
		var p: Dictionary = parts[i]
		p["life"] += dt
		if p["life"] >= p["max"]:
			parts.remove_at(i)
			continue
		p["vy"] += p["grav"] * dt
		p["x"] += p["vx"] * dt
		p["y"] += p["vy"] * dt
	# motes rising off the hollow beneath, always
	if inv.wsmith == "meld":
		_mote += dt
		var O := _v(G["OUT"])
		while _mote > 0.18:
			_mote -= 0.18
			_part(O.x + (randf() - 0.5) * 24.0, O.y + 4.0, (randf() - 0.5) * 3.0, -8.0 - randf() * 8.0, 1.6 + randf(), Color.WHITE if randf() < 0.2 else PICK, 0.0)


func _part(x: float, y: float, vx: float, vy: float, mx: float, c: Color, grav: float, s := 1.0) -> void:
	if parts.size() < 600:
		parts.append({"x": x, "y": y, "vx": vx, "vy": vy, "life": 0.0, "max": mx, "c": c, "grav": grav, "s": s})


# ---- drawing helpers, in game pixels from the half's top left ------------------------------------------------------------

func _rect(x: float, y: float, w: float, h: float, c: Color) -> void:
	inv.draw_rect(Rect2(x, y, w, h), c)


func _glow(x: float, y: float, r: float, c: Color, a: float) -> void:
	if a <= 0.005:
		return
	inv.draw_texture_rect(glow_tex, Rect2(x - r, y - r, 2.0 * r, 2.0 * r), false, Color(c.r, c.g, c.b, clampf(a, 0.0, 1.0) * 0.8))


func _t(s: String, x: float, y: float, c: Color, font := "normal", scale := 1, align := "left", shadow = null) -> void:
	PF.draw(inv, s, x, y, c, {"font": font, "scale": scale, "align": align, "shadow": shadow})


func _src(w: String) -> Rect2:
	return inv.loot.pics["word:" + w]["rect"]


func _stone(w: String, x: float, y: float, size: float, a := 1.0) -> void:
	inv.draw_texture_rect_region(inv.loot.sheet, Rect2(roundf(x * 2.0) / 2.0, roundf(y * 2.0) / 2.0, size, size), _src(w), Color(1, 1, 1, a))


## The sheet's pixels (once), for the melting and the new rune's gathering.
func _sheet_img() -> Image:
	if _img == null:
		_img = inv.loot.sheet.get_image()
		if _img.is_compressed():
			_img.decompress()
		_img.convert(Image.FORMAT_RGBA8)
	return _img


## Each inked pixel of a rune's stone: [x, y, colour], at the stone's own grain (24 x 24).
func _pixels(w: String) -> Array:
	var out: Array = []
	var r := _src(w)
	var img := _sheet_img()
	for y in int(r.size.y):
		for x in int(r.size.x):
			var c := img.get_pixel(int(r.position.x) + x, int(r.position.y) + y)
			if c.a > 0.5:
				out.append([x, y, c])
	return out


## A rune's stone as one flat white shape (washed toward the friend's cyan as it melts).
func _silhouette(w: String) -> Texture2D:
	if _sil.has(w):
		return _sil[w]
	var r := _src(w)
	var img := Image.create(int(r.size.x), int(r.size.y), false, Image.FORMAT_RGBA8)
	var src := _sheet_img()
	for y in int(r.size.y):
		for x in int(r.size.x):
			var c := src.get_pixel(int(r.position.x) + x, int(r.position.y) + y)
			img.set_pixel(x, y, Color(1, 1, 1, c.a))
	_sil[w] = ImageTexture.create_from_image(img)
	return _sil[w]


## The light along a channel up to `k` of its length, each point's brightness `age.call(i)`.
func _lit(path: Array, k: float, age: Callable) -> void:
	var n := path.size() - 1
	for i in int(floorf(n * k)) + 1:
		var a: float = age.call(i)
		if a <= 0.0:
			continue
		var p := _v(path[i])
		var c := WASH if a > 0.85 else PICK
		_rect(roundf(p.x * 2.0) / 2.0 - 1.5, roundf(p.y * 2.0) / 2.0 - 1.5, 3.0, 3.0, Color(c.r, c.g, c.b, minf(1.0, a)))


func _glyph(m: Dictionary, a: float) -> void:
	var rows: Array = G["GLYPHS"][int(m["gl"])]
	for j in rows.size():
		var row: String = rows[j]
		for i in row.length():
			if row[i] == "X" or row[i] == "o":
				_rect(float(m["x"]) + i, float(m["y"]) + j, 1.0, 1.0, Color(PICK.r, PICK.g, PICK.b, a))


static func _ease(t: float) -> float:
	return 1.0 - pow(1.0 - clampf(t, 0.0, 1.0), 3.0)


## What the two laid in come to: {s, c, ok, res}. The game's own reason where they cannot be melded.
func pair() -> Dictionary:
	var a = inv.meld_in[0]
	var b = inv.meld_in[1]
	if a == null or b == null:
		return {"s": "", "c": DIM, "ok": false, "res": ""}
	var why: String = inv._ws_why()
	var res := Words.meld_of(a, b)
	if why != "" or res == "":
		return {"s": (why if why != "" else "These do not meld").to_upper(), "c": BAD, "ok": false, "res": ""}
	if known(res):
		return {"s": "MAKES " + str(Words.word(res)["name"]).to_upper(), "c": inv.loot.word_color(res), "ok": true, "res": res}
	return {"s": "A MELD YOU HAVE NOT FOUND", "c": PICK, "ok": true, "res": res}


## Has he had this rune (found it, or holds one)?
func known(w: String) -> bool:
	return bool(inv.loot.known.get(w, {}).get("found", false)) or int(inv.loot.words.get(w, 0)) > 0


# ---- the half ------------------------------------------------------------------------------------------------------------

## The stone over the wordsmith's half: `x0` its left edge in the panel's lay (screen pixels), `w` and `h` its size. Its own
## things pressed are put among the inventory's (`hits`, in the panel's lay): the hollows, the new rune, MELD.
func draw(x0: float, w: float, h: float, hits: Array) -> void:
	# (laid out at the mock-up's size, 240 by 270 game pixels, in the middle of the half; a smaller half shows its middle)
	var ox := x0 + floorf((w - 480.0) / 4.0) * 2.0
	var oy := minf(0.0, floorf((h - 540.0) / 4.0) * 2.0)
	_origin = Vector2(ox, oy)
	var t: float = float(anim["t"]) if not anim.is_empty() else -1.0
	var going := not anim.is_empty() and float(anim["taken"]) < 0.0 and t < M_FORM
	var sh := 0.0
	if going and t > M_POUR and t < M_FLASH + 0.08:
		sh = (randf() - 0.5) * 2.0 * clampf((t - M_POUR) / (M_SWIRL - M_POUR), 0.0, 1.0)
	# the stone itself, in the panel's ground
	inv.draw_set_transform(inv._xf)
	inv.draw_rect(Rect2(x0, 0, w, h), PANEL)
	inv.draw_set_transform(inv._xf + Vector2(ox, oy) + Vector2(roundf(sh) * K, roundf(-sh / 2.0) * K))
	inv.draw_texture_rect(tex, Rect2(0, 0, 480, 540), false)
	inv.draw_set_transform(inv._xf + Vector2(ox, oy) + Vector2(roundf(sh) * K, roundf(-sh / 2.0) * K), 0.0, Vector2(K, K))
	var HA := _v(G["HA"])
	var HB := _v(G["HB"])
	var O := _v(G["OUT"])
	var HS: float = G["HS"]
	var OS: float = G["OS"]
	var RS: float = G["RS"]
	var NS: float = G["NS"]
	var SL: Dictionary = G["SLAB"]
	var idle := 0.5 + 0.5 * sin(_now * 2.0)
	var pt := pair()
	# the runes cut in its border's corners: lit, breathing
	for i in 4:
		var m: Dictionary = G["CORNERS"][i]
		var a := 0.35 + 0.2 * sin(_now * 1.4 + i * 1.6)
		if going and t > M_SWIRL and t < M_FLASH + 0.4:
			a = 1.0
		_glow(m["x"] + 3.5, m["y"] + 3.5, 9.0, PICK, a * 0.35)
		_glyph({"x": m["x"], "y": m["y"], "gl": (i + 2) % G["GLYPHS"].size()}, a)
	# the light in the channels: a shimmer when two are laid in that will meld, running while it melds, glowing after
	var pa: Array = G["pathA"]
	var pb: Array = G["pathB"]
	var n := pa.size() - 1
	if anim.is_empty():
		if pt["ok"]:
			for path in [pa, pb]:
				for i in n + 1:
					var wv := 0.5 + 0.5 * sin(i * 0.3 - _now * 7.0)
					if wv < 0.75:
						continue
					var p := _v(path[i])
					_rect(roundf(p.x * 2.0) / 2.0 - 1.0, roundf(p.y * 2.0) / 2.0 - 1.0, 2.0, 2.0, Color(PICK.r, PICK.g, PICK.b, (wv - 0.75) * 1.6))
	elif going and t > M_MELT - 0.04:
		var k := clampf((t - (M_MELT - 0.04)) / (M_POUR - M_MELT), 0.0, 1.0)
		var kk := k * k * (3.0 - 2.0 * k)
		var fade := clampf((t - M_SWIRL) / 0.35, 0.0, 1.0) * 0.6
		var age := func(i: int) -> float: return 1.15 - (kk - float(i) / n) * 1.1 - fade
		_lit(pa, kk, age)
		_lit(pb, kk, age)
		if k < 1.0:
			for path in [pa, pb]:
				var p := _v(path[int(roundf(kk * n))])
				_glow(p.x, p.y, 15.0, PICK, 0.95)
				_rect(p.x - 2.0, p.y - 2.0, 4.0, 4.0, Color.WHITE)
				for j in 2:
					_part(p.x, p.y, (randf() - 0.5) * 50.0, -10.0 - randf() * 35.0, 0.3 + randf() * 0.25, CY[randi() % 3], 140.0)
	elif waiting() != "":
		var calm := func(i: int) -> float: return 0.3 + 0.18 * sin(i * 0.25 - _now * 4.0)
		_lit(pa, 1.0, calm)
		_lit(pb, 1.0, calm)
	# the carved runes by the channels catch the light as it passes
	for m in G["MARKS"]:
		var a := 0.14 + 0.1 * sin(_now * 1.5 + float(m["gl"]))
		if going:
			var k := clampf((t - (M_MELT - 0.04)) / (M_POUR - M_MELT), 0.0, 1.0)
			var d: float = k * k * (3.0 - 2.0 * k) - float(m["t"])
			if d > 0.0:
				a = maxf(a, 1.0 - d * 1.6)
		elif waiting() != "":
			a = 0.55
		elif pt["ok"]:
			a = 0.35 + 0.15 * idle
		if a > 0.5:
			_glow(m["x"] + 3.5, m["y"] + 3.5, 10.0, PICK, (a - 0.5) * 0.9)
		_glyph(m, a)
	# the two hollows above
	for i in 2:
		var hc: Vector2 = HA if i == 0 else HB
		var wd = inv.meld_in[i]
		var want: bool = wd == null and anim.is_empty()
		var rim := 0.2 + 0.15 * idle if want else 0.12
		if going and t < M_MELT:
			rim = 0.3 + 0.7 * clampf(t / M_CHARGE, 0.0, 1.0)
		_glow(hc.x, hc.y, 30.0, PICK, rim * 0.6)
		if want:
			var a := 0.35 + 0.35 * idle
			_rect(hc.x - 5.0, hc.y, 11.0, 1.0, Color(PICK.r, PICK.g, PICK.b, a))
			_rect(hc.x, hc.y - 5.0, 1.0, 11.0, Color(PICK.r, PICK.g, PICK.b, a))
		hits.append([Rect2(ox + (hc.x - HS / 2.0) * K, oy + (hc.y - HS / 2.0) * K, HS * K, HS * K), "ws_hollow", i, null])
		var melting: String = ""
		if going and t < M_POUR:
			melting = str(anim["a"] if i == 0 else anim["b"])
		if wd != null and melting == "":
			# laid in: it drops into the hollow and settles
			var dt: float = _now - float(inv._ms_drop[i])
			var fall := (1.0 - _ease(dt / 0.18)) * -14.0 if dt < 0.18 else 0.0
			var bob := roundf(sin(_now * 2.0 + i)) / 2.0
			if dt < 0.45:
				_glow(hc.x, hc.y, 26.0, inv.loot.word_color(wd), (1.0 - dt / 0.45) * 0.7)
			_stone(wd, hc.x - RS / 2.0, hc.y - RS / 2.0 + fall + bob, RS)
			continue
		if melting == "":
			continue
		# MELD: it rises, trembles and cracks with light; then melts into light that drains into its channel
		var k3 := RS / 24.0
		if t < M_MELT:
			var c := clampf(t / M_CHARGE, 0.0, 1.0)
			var shake := (randf() - 0.5) * 2.0 * c if t < M_CHARGE else 0.0
			var rise := -3.0 * _ease(c)
			var melt := clampf((t - M_CHARGE) / (M_MELT - M_CHARGE), 0.0, 1.0)
			var sx := hc.x - RS / 2.0 + shake
			var sy := hc.y - RS / 2.0 + rise
			var cut := floorf(melt * 24.0)
			var src := _src(melting)
			var dst := Rect2(roundf(sx), roundf(sy + cut * k3), RS, (24.0 - cut) * k3)
			if dst.size.y > 0.0:
				inv.draw_texture_rect_region(inv.loot.sheet, dst, Rect2(src.position.x, src.position.y + cut, 24.0, 24.0 - cut))
				var wash := minf(1.0, c * 0.55 + melt * 0.6)
				var wc := WASH if wash > 0.75 else PICK
				inv.draw_texture_rect_region(_silhouette(melting), dst, Rect2(0, cut, 24.0, 24.0 - cut), Color(wc.r, wc.g, wc.b, wash))
			if c > 0.2 and melt < 0.6:
				var ca := c * (1.0 - melt / 0.6)
				for seg in [[12, 2, 10, 8], [10, 8, 13, 14], [13, 14, 9, 21], [10, 8, 4, 11], [13, 14, 19, 17]]:
					for s2 in 11:
						var px: float = seg[0] + (seg[2] - seg[0]) * s2 / 10.0
						var py: float = seg[1] + (seg[3] - seg[1]) * s2 / 10.0
						if py >= cut:
							_rect(roundf((sx + px * k3) * 2.0) / 2.0, roundf((sy + py * k3) * 2.0) / 2.0, 1.5, 1.5, Color(1, 1, 1, ca))
			_glow(hc.x, hc.y + rise, 24.0, PICK, 0.3 + 0.6 * c)
			if melt > 0.0 and melt < 1.0:
				for j in 7:
					_part(sx + 4.0 + randf() * (RS - 8.0), sy + cut * k3, (randf() - 0.5) * 8.0, 15.0 + randf() * 30.0, 0.28, Color.WHITE if randf() < 0.3 else CY[randi() % 3], 110.0)
			if melt > 0.0:
				_rect(hc.x - RS / 2.0, hc.y + RS / 2.0 - melt * 11.0, RS, melt * 11.0, Color(PICK.r, PICK.g, PICK.b, 0.5 * melt))
				_glow(hc.x, hc.y + 10.0, 22.0, PICK, melt * 0.85)
		else:
			var k := clampf((t - M_MELT) / 0.3, 0.0, 1.0)
			_rect(hc.x - RS / 2.0, hc.y + 7.0 + k * 11.0, RS, 11.0 * (1.0 - k), Color(PICK.r, PICK.g, PICK.b, 0.5 * (1.0 - k)))
			_glow(hc.x, hc.y + 12.0, 20.0, PICK, 0.85 * (1.0 - k))
	# the standing stones round the hollow beneath: each wakes as the light comes round
	var order := [0, 1, 2, 2, 1, 0]
	for i in G["STANDING"].size():
		var st := _v(G["STANDING"][i])
		var a := 0.18 + 0.1 * sin(_now * 1.3 + i)
		if going and t > M_POUR:
			var sw := clampf((t - M_POUR) / (M_SWIRL - M_POUR), 0.0, 1.0)
			if sw * 7.0 >= order[i] * 2 or sw > 0.7:
				a = 1.0
		elif waiting() != "":
			a = 0.6 + 0.3 * sin(_now * 3.0 + i)
		elif pt["ok"]:
			a = 0.35 + 0.15 * idle
		_rect(roundf(st.x) - 1.0, roundf(st.y) - 2.0, 2.0, 4.0, Color(PICK.r, PICK.g, PICK.b, a))
		if a > 0.6:
			_glow(st.x, st.y, 10.0, PICK, (a - 0.6) * 1.2)
	# the hollow beneath
	if anim.is_empty():
		_glow(O.x, O.y, 34.0, PICK, 0.12 + 0.06 * idle)
		if pt["ok"]:
			var res: String = pt["res"]
			if known(res):
				_stone(res, O.x - NS / 2.0, O.y - NS / 2.0, NS, 0.22 + 0.12 * idle)
			else:
				_glow(O.x, O.y, 18.0, PICK, 0.3 + 0.2 * idle)
				_t("?", O.x, O.y - 7.0 + roundf(sin(_now * 3.0)), PICK, "normal", 2, "center")
	else:
		# the two streams come in and wheel round the hollow, closing on its middle
		if going and t > M_POUR - 0.04 and t < M_FLASH:
			var sw := clampf((t - (M_POUR - 0.04)) / (M_SWIRL - M_POUR + 0.04), 0.0, 1.0)
			var rad := 20.0 * (1.0 - _ease(sw)) + 2.0
			for side in 2:
				var base := -PI / 3.0 if side == 1 else -2.0 * PI / 3.0
				var dir := 1.0 if side == 1 else -1.0
				for tr in 14:
					var ang := base + dir * (sw * PI * 3.0 - tr * 0.14)
					var rr := rad + tr * 0.35
					var px := O.x + cos(ang) * rr
					var py := O.y + sin(ang) * rr * 0.85
					var sz := 3.0 if tr < 2 else 2.0
					var cc := Color.WHITE if tr < 2 else PICK
					_rect(roundf(px * 2.0) / 2.0 - 1.0, roundf(py * 2.0) / 2.0 - 1.0, sz, sz, Color(cc.r, cc.g, cc.b, 1.0 - tr / 14.0))
			_glow(O.x, O.y, 12.0 + 26.0 * sw, PICK, 0.4 + 0.6 * sw)
			_glow(O.x, O.y, 8.0 + 10.0 * sw, Color.WHITE, 0.55 * sw)
		# the flash: the whole stone whitened a moment, a ring thrown out, sparks
		if t >= M_SWIRL and t < M_FLASH + 0.45:
			var f := clampf((t - M_SWIRL) / (M_FLASH + 0.45 - M_SWIRL), 0.0, 1.0)
			var rr := 8.0 + _ease(f) * 84.0
			var rc := Color.WHITE if f < 0.3 else PICK
			for i in 96:
				var a := i / 96.0 * TAU
				_rect(roundf((O.x + cos(a) * rr) * 2.0) / 2.0, roundf((O.y + sin(a) * rr * 0.8) * 2.0) / 2.0, 1.5, 1.5, Color(rc.r, rc.g, rc.b, (1.0 - f) * 0.9))
			if not anim["burst"] and t >= M_FLASH - 0.05:
				anim["burst"] = true
				# (the chime the game plays as a meld is made, as the new rune flashes into being: loot.gd meld_words)
				if inv.loot.sfx != null:
					inv.loot.sfx.play("rare")
				for i in 40:
					var a := randf() * TAU
					var sp := 50.0 + randf() * 100.0
					_part(O.x, O.y, cos(a) * sp, sin(a) * sp * 0.8 - 20.0, 0.4 + randf() * 0.45, CY[randi() % 4], 80.0, 1.5 if randf() < 0.3 else 1.0)
		if t >= M_SWIRL + 0.05 and t < M_SWIRL + 0.3:
			var f := (t - M_SWIRL - 0.05) / 0.25
			_rect(SL["x"], SL["y"], SL["w"], SL["h"], Color(0.84, 1.0, 0.98, 0.45 * (1.0 - f)))
		# the new rune forms: its pixels gather out of the light into their places
		var res: String = anim["res"]
		if t >= M_FLASH - 0.06 and float(anim["taken"]) < 0.0:
			var ft := t - (M_FLASH - 0.06)
			var k4 := NS / 24.0
			if ft < M_GATHER + 0.16:
				var pix: Array = anim["pix"]
				var from: Array = anim["from"]
				for i in pix.size():
					var fr: Array = from[i]
					var k := _ease((ft - fr[2]) / M_GATHER)
					if k <= 0.0:
						continue
					var x: float = O.x - NS / 2.0 + pix[i][0] * k4 + fr[0] * (1.0 - k)
					var y: float = O.y - NS / 2.0 + pix[i][1] * k4 + fr[1] * (1.0 - k)
					var col: Color = PICK if k < 0.85 else pix[i][2]
					_rect(roundf(x * 2.0) / 2.0, roundf(y * 2.0) / 2.0, k4, k4, Color(col.r, col.g, col.b, minf(1.0, k * 1.6)))
				_glow(O.x, O.y, 26.0, PICK, 0.65)
			else:
				var age := t - M_FORM
				var pulse := 0.5 + 0.5 * sin(_now * 3.0)
				var size := 60.0 if age < 0.1 else NS
				_glow(O.x, O.y, 34.0 + 6.0 * pulse, inv.loot.word_color(res), 0.55 + 0.2 * pulse)
				if age < 0.25:
					_glow(O.x, O.y, 18.0, Color.WHITE, 0.8 * (1.0 - age / 0.25))
				for b in 6:
					var a := _now * 0.6 + b * PI / 3.0
					for s2 in range(14, 36):
						_rect(roundf(O.x + cos(a) * s2), roundf(O.y + sin(a) * s2 * 0.85), 1.0, 1.0, Color(PICK.r, PICK.g, PICK.b, 0.18 * (1.0 - s2 / 36.0)))
				var bob := roundf(sin(_now * 2.2) * 2.0) / 2.0
				_stone(res, O.x - size / 2.0, O.y - size / 2.0 + bob, size)
				if randf() < 0.25:
					_part(O.x + (randf() - 0.5) * 34.0, O.y + 10.0, 0.0, -12.0 - randf() * 10.0, 1.2, PICK, 0.0)
				hits.append([Rect2(ox + (O.x - OS / 2.0) * K, oy + (O.y - OS / 2.0) * K, OS * K, OS * K), "ms_take", null, null])
	# the specks of light
	for p in parts:
		var c: Color = p["c"]
		_rect(roundf(p["x"] * 2.0) / 2.0, roundf(p["y"] * 2.0) / 2.0, p["s"], p["s"], Color(c.r, c.g, c.b, 1.0 - p["life"] / p["max"]))
	# taken: the rune flies to its place in the bag (drawn over everything, in the screen's own lay)
	if not anim.is_empty() and float(anim["taken"]) >= 0.0:
		var k := clampf((_now - float(anim["taken"])) / 0.45, 0.0, 1.0)
		var res: String = anim["res"]
		# (from the hollow beneath, on this half, to its tile in the bag, on the other: both in the screen's own lay)
		var to: Vector2 = inv._rb.tile_at(res) if inv._rb != null else Vector2(-1, -1)
		var start: Vector2 = inv._to_screen(Vector2(ox, oy) + (O - Vector2(NS, NS) / 2.0) * K) / K
		var end: Vector2 = inv._to_screen(to) / K if to.x >= 0.0 else start + Vector2(120, 0)
		var e := _ease(k)
		var size := roundf((NS - (NS - 24.0) * e) / 12.0) * 12.0
		var at := start.lerp(end, e) - Vector2(0, sin(k * PI) * 40.0)
		inv.draw_set_transform(Vector2.ZERO, 0.0, Vector2(K, K))
		_glow(at.x + size / 2.0, at.y + size / 2.0, 18.0, PICK, 0.7)
		_stone(res, at.x, at.y, size)
		if k >= 1.0:
			_landed()
		inv.draw_set_transform(inv._xf + Vector2(ox, oy), 0.0, Vector2(K, K))
	# under the hollow beneath: what will come out, or what came out, on a dark plate across the stone's foot
	inv.draw_set_transform(inv._xf + Vector2(ox, oy), 0.0, Vector2(K, K))
	var ny := 213.0
	var mid := 120.0
	var made := waiting()
	if made != "":
		var age: float = t - M_NAME + 0.15
		var k := _ease(age / 0.25)
		var nm := str(Words.word(made)["name"]).to_upper()
		var sc := 2 if PF.width(nm, "normal", 2) < float(SL["w"]) - 16.0 else 1
		var head: String = "A NEW RUNE, FOUND!" if anim["first"] else ("RANKED UP" if Words.is_rank(made) or made.ends_with("2") else "MELDED")
		var pw := maxf(PF.width(nm, "normal", sc), PF.width(head, "small")) + 20.0
		_rect(mid - pw / 2.0, ny - 5.0, pw, 26.0 if sc == 2 else 20.0, Color(PLATE.r, PLATE.g, PLATE.b, PLATE.a * k))
		var hc := (PICK if int(_now * 3.0) % 2 == 1 else Color.WHITE) if anim["first"] else DIM
		_t(head, mid, ny - 2.0 - (1.0 - k) * 4.0, Color(hc.r, hc.g, hc.b, k), "small", 1, "center", Color(INK.r, INK.g, INK.b, k))
		var nc: Color = inv.loot.word_color(made)
		_t(nm, mid, ny + 5.0 - (1.0 - k) * 4.0, Color(nc.r, nc.g, nc.b, k), "normal", sc, "center", Color(INK.r, INK.g, INK.b, k))
		if age > 0.6:
			_t("PRESS IT TO TAKE IT", mid, 235.0, PICK if int(_now * 2.0) % 2 == 1 else FAINT, "small", 1, "center")
	elif anim.is_empty():
		if pt["s"] != "":
			var pw := PF.width(pt["s"]) + 14.0
			_rect(mid - pw / 2.0, ny + 2.0, pw, 13.0, PLATE)
			_t(pt["s"], mid, ny + 5.0, pt["c"], "normal", 1, "center")
		elif inv.meld_in[0] == null and inv.meld_in[1] == null:
			_t("TWO RUNES IN, ONE OUT. PRESS TWO OF YOURS.", mid, 235.0, FAINT, "small", 1, "center")
		else:
			var one = inv.meld_in[0] if inv.meld_in[0] != null else inv.meld_in[1]
			_t("THE RUNES THAT MELD WITH %s ARE LIT" % str(Words.word(one)["name"]).to_upper(), mid, 235.0, PICK_LO, "small", 1, "center")
	# MELD
	var can: bool = anim.is_empty() and pt["ok"]
	var label := "MELD: %d RUNEDUST" % inv.loot.meld_cost()
	var bw := PF.width(label) + 24.0
	var br := Rect2(roundf(mid - bw / 2.0), 246.0, bw, 18.0)
	var blink := 0.5 + 0.5 * sin(_now * 5.0)
	if can:
		_glow(br.get_center().x, br.get_center().y, 40.0, PRESS, 0.15 + 0.1 * blink)
	inv.draw_set_transform(inv._xf)
	var sbr := Rect2(ox + br.position.x * K, oy + br.position.y * K, br.size.x * K, br.size.y * K)
	inv._gbox(sbr, (PRESS_HI if blink > 0.5 else PRESS) if can else BOX, PRESS_HI if can else EDGE)
	inv.draw_set_transform(inv._xf + Vector2(ox, oy), 0.0, Vector2(K, K))
	_t(label, br.get_center().x, br.position.y + 5.5, Color.WHITE if can else FAINT, "normal", 1, "center")
	hits.append([sbr, "ws_meld", null, null])
	# the runedust he carries, beside the trade's tab
	var dc := Color(str(Words.data()["melds"]["dust"]))
	var dx := 140.0
	for i in 12:
		var pp: Array = [[1, 5], [2, 4], [3, 5], [4, 3], [5, 4], [6, 5], [3, 2], [5, 2], [7, 4], [4, 5], [2, 5], [6, 3]][i]
		var tw := 0.5 + 0.5 * sin(_now * 4.0 + i * 1.7)
		var cc := Color.WHITE if tw > 0.8 else dc
		_rect(dx + pp[0], 5.0 + pp[1], 1.0, 1.0, Color(cc.r, cc.g, cc.b, 0.6 + 0.4 * tw))
	_t("%d RUNEDUST" % inv.loot.dust(), dx + 11.0, 8.0, dc, "small")
	inv.draw_set_transform(inv._xf)
