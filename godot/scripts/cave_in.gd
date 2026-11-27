## THE STAIRS CAVE IN behind him as he comes down into the prison. His words, 26 Nov 2026, 22:06: “id like the stairs to cave in
## when you go down into the first level, then change the wordstone quest to have it say "push deeper into the prison"”; his picks,
## asked: the first time only (“First time only (Recommended)”: after that floor 1 begins with the rubble already there), and the
## town's stairs still lead down (“Yes, still lead down (Recommended)”), so a hero who falls there can always go back for the stone.
## Shown its first film, his word the same evening: “Eh I feel like you can do better.”: so a harder fall, real masonry, a mound
## out over the floor, a burst of dust along it, the daylight put out, and he turns to look.
##
## Floor 1's stairwell up, in its arch behind him where he comes in (the look's "gate up arch" strips along world x 22, y 130.625 to
## 134.125; this node at the middle of the arch's foot):
##   the film (FILM s): the ground groaning, grit pouring from the arch's crown, the screen trembling, and he turns to look; the
##   stairwell's roof gives way (ledge_crumble, slam, a hard kick of the screen): three great blocks of it crash down first, then
##   a cascade of broken masonry and rubble, the lowest first, filling the arch nearly to its crown, a mound of it spilling out
##   past the arch over the floor (each piece standing in the depth's order with the arch's piers and with him); the daylight
##   from the town above going out, in the arch and on the floor before it; a burst of dust along the floor and up out of the
##   arch, rolling into the room and clearing, motes hanging after it. Then "The stairs cave in behind you."
##   settled: the heap, its mound, the dark behind it (main.gd shuts the doorway and the mound's tiles, and his walk up).
## Drawn in the art's own grain (two picture pixels to a game pixel): blocks of the stairwell's cut stone seen as the floor is seen,
## each with its lit top and its two sides, and rough stones lit from the top left, in its greens and greys, each with its dark edge.
extends Node2D

signal fell     # the roof gives way: main.gd says the line
signal settled  # the film over

const Iso := preload("res://scripts/iso.gd")

const FILM := 5.0
const TURN := 0.2          # he turns to look
const GIVE := 1.0          # the roof gives way
const BIG_LAND := 1.2      # the three great blocks land
const LAND_FROM := 1.3     # the rest land from here...
const LAND_TO := 2.55      # ...to here, the lowest first
const DARK_TO := 2.2       # the daylight gone by here
const G := 1800.0          # how fast they fall (picture pixels a second, a second)

# (the stairwell's own stone, its daylight gone: from the torch-lit top of a stone to its deepest shadow, and its moss)
const LIGHT := Color("#8f9372")
const LIT := Color("#73775c")
const MID := Color("#5a5e48")
const DARK := Color("#3f4334")
const DEEP := Color("#2c2f24")
const EDGE := Color("#171a12")
const MOSS := Color("#4a5a33")
const DUST := Color("#8e8b70")
const HOLE := Color("#0d0f0a")
const NIGHT := Color("#06080a")    # the floor's dark (looks/floor1.json `dark`)

## The arch's opening, in picture pixels from this node: its foot from the lower left (FOOT_L) to the upper right (FOOT_R); over it
## the opening stands SIDE high at its piers and rises in the arch to CROWN, a little left of its middle (CROWN_AT).
const FOOT_L := Vector2(-56.0, 28.0)
const FOOT_R := Vector2(56.0, -28.0)
const SIDE := 38.0
const CROWN := 96.0
const CROWN_AT := 0.45
const FULL := 0.82
## The stairwell's daylight (looks/floor1.json: its hole in the dark, r 84, strength 0.95, at x -1758.4, y 1234.8 game pixels),
## from this node, in picture pixels; the floor's dark 0.5.
const LIGHT_AT := Vector2(15.2, -0.4)
const LIGHT_R := 168.0
const DARK_A := 0.5

var sfx                     # sfx.gd
var shaker                  # hero.gd: the screen's kick (kick)
var hero                    # hero.gd: he turns to look
var stands: Node2D = null   # the depth-sorted layer: the mound's pieces stand in it
var film := true            # false: come in when it has already fallen
var delay := 0.0            # the film waits this long (the floor's name going)
var t := 0.0
## The mound's world points (for main.gd to shut their tiles): set as it is laid.
var mound_tiles: Array = []

var _heap: Array = []       # in the arch: {tex, size, at, from, land, sound}
var _mound: Array = []      # out over the floor: {node, start, foot, end, land, slide}
var _dust: Node2D = null
var _done := false
var _fell_said := false
var _heard := {}
var _light_tex: ImageTexture = null
var _puff_texs: Array = []


func _ready() -> void:
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_lay()
	if not film:
		t = FILM
		_fell_said = true
		_done = true
		for m in _mound:
			m["node"].position = m["end"]
			m["node"].visible = true
	queue_redraw()


## The dust's own layer, over everything (main.gd adds it to the place after all that stands).
func dust_layer() -> Node2D:
	if _dust == null:
		_dust = Dust.new()
		_dust.cave = self
		_dust.position = position
	return _dust


func _process(dt: float) -> void:
	if _done:
		return
	if delay > 0.0:
		delay -= dt
		return
	t += dt
	_sounds()
	_shake()
	if hero != null and t >= TURN and not _heard.has("turned"):
		_heard["turned"] = true
		# (he turns to look back at the arch)
		if hero.get("face") != null:
			hero.face = Vector2(-1, 0)
	if t >= GIVE and not _fell_said:
		_fell_said = true
		fell.emit()
	for m in _mound:
		m["node"].position = _mound_at(m)
	if t >= FILM:
		t = FILM + 0.001
		_done = true
		settled.emit()
	queue_redraw()
	if _dust != null:
		_dust.queue_redraw()


func _sounds() -> void:
	_once("rumble", 0.02, "f1_stone", 0.0)
	_once("give", GIVE, "ledge_crumble", 2.0)
	_once("slam", BIG_LAND, "slam", 2.0)
	_once("slam2", BIG_LAND + 0.06, "colossus_tentacle_slam", -2.0)
	_once("settle", LAND_TO - 0.55, "stone_death", -1.0)
	var i := 0
	for s in _heap:
		if s["sound"] and t >= s["land"]:
			_once("land%d" % i, s["land"], "step_stone", -6.0)
		i += 1


func _once(key: String, at: float, name: String, db: float) -> void:
	if _heard.has(key) or t < at or sfx == null:
		return
	_heard[key] = true
	sfx.play(name, db)


func _shake() -> void:
	if shaker == null or not shaker.has_method("kick"):
		return
	if t < GIVE:
		shaker.kick(1.0 + 2.0 * t / GIVE)
	elif t < GIVE + 0.1:
		shaker.kick(5.0)
	elif t >= BIG_LAND and t < BIG_LAND + 0.14:
		shaker.kick(12.0)
	elif t < LAND_TO:
		shaker.kick(3.0)


# --- the opening -------------------------------------------------------------------------------------------------------------

func _foot(u: float) -> Vector2:
	return FOOT_L.lerp(FOOT_R, u)


## How high the opening is over its foot at `u` (0 its left pier, 1 its right).
func _high(u: float) -> float:
	var k := (u - CROWN_AT) / (CROWN_AT if u < CROWN_AT else 1.0 - CROWN_AT)
	return SIDE + (CROWN - SIDE) * sqrt(maxf(0.0, 1.0 - k * k))


func _opening() -> PackedVector2Array:
	var pts := PackedVector2Array([_foot(0.0), _foot(1.0)])
	for i in range(16, -1, -1):
		var u := float(i) / 16.0
		pts.append(_foot(u) + Vector2(0, -_high(u)))
	return pts


# --- the heap and the mound --------------------------------------------------------------------------------------------------

func _lay() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 2611
	var laid: Array = []
	# THE THREE GREAT BLOCKS of the stairwell's roof, low in the arch, first down
	for k in 3:
		var u := 0.22 + 0.28 * float(k) + rng.randf_range(-0.05, 0.05)
		var tex := _block_tex(rng.randi_range(15, 19), rng.randi_range(9, 12), rng.randi_range(8, 11), rng.randi())
		var size := Vector2(tex.get_width(), tex.get_height()) * 2.0
		var at := _foot(u) + Vector2(-size.x / 2.0 + rng.randf_range(-4, 4), -size.y + rng.randf_range(2.0, 10.0))
		laid.append({"tex": tex, "size": size, "at": at.round(), "v": -0.5 + 0.01 * k, "u": u, "big": true, "shade": 0.9})
	# a jumble of broken masonry and rough stones over them, the bigger low, its top ragged, none above the arch
	for i in 86:
		var u := rng.randf_range(0.02, 0.98)
		var top := _high(u) * clampf(0.7 + 0.1 * sin(u * 9.0 + 1.3) + 0.07 * sin(u * 23.0 + 0.4), 0.5, FULL)
		var v := pow(rng.randf(), 1.1)
		var tex: ImageTexture
		if rng.randf() < 0.45:
			tex = _block_tex(rng.randi_range(7, 13) - int(v * 4.0), rng.randi_range(5, 9) - int(v * 2.0), rng.randi_range(4, 8) - int(v * 2.0), rng.randi())
		else:
			tex = _stone_tex(rng.randi_range(9, 17) - int(v * 5.0), rng.randi_range(7, 12) - int(v * 3.0), rng.randi())
		var size := Vector2(tex.get_width(), tex.get_height()) * 2.0
		var h := minf(v * top, top - size.y)
		var at := _foot(u) + Vector2(-size.x / 2.0 + rng.randf_range(-4, 4), -maxf(0.0, h) - size.y)
		# (the low front pieces lit by the room, the high ones deep in the dark stairwell)
		laid.append({"tex": tex, "size": size, "at": at.round(), "v": v, "u": u, "big": false, "shade": lerpf(0.95, 0.5, clampf((maxf(0.0, h) + size.y) / maxf(1.0, top), 0.0, 1.0))})
	laid.sort_custom(func(a, b): return a["v"] < b["v"])
	var n_rest := laid.size() - 3
	var i := 0
	for s in laid:
		var land: float = BIG_LAND if s["big"] else lerpf(LAND_FROM, LAND_TO, pow(float(i - 3) / float(n_rest - 1), 0.85))
		# (from the arch's top, where the stairwell's roof came down, to where it lies)
		var top: float = (_foot(float(s["u"])) + Vector2(0, -_high(float(s["u"])))).y
		var drop := maxf(10.0, float(s["at"].y) - top + float(s["size"].y))
		if s["big"]:
			drop += 40.0
		_heap.append({"tex": s["tex"], "size": s["size"], "at": s["at"], "from": drop, "land": land, "sound": not s["big"] and i % 6 == 0, "shade": s["shade"]})
		i += 1
	_heap.sort_custom(func(a, b): return a["at"].y + a["size"].y < b["at"].y + b["size"].y)
	_lay_mound(rng)


## THE MOUND out over the floor before the arch: pieces that come down in the arch and slide out over the floor, each a picture
## standing in the depth's order (stands.gd: its place on the screen its depth), so that the arch's piers and he stand before or
## behind them as they should. Out to about 0.9 of a tile from the arch's foot, thickest at its middle.
func _lay_mound(rng: RandomNumberGenerator) -> void:
	if stands == null:
		return
	for k in 34:
		var u := clampf(0.5 + rng.randf_range(-0.5, 0.5) * (0.4 + 0.6 * rng.randf()), 0.04, 0.96)
		# (how far out over the floor, in tiles along world x; nearer the arch the more)
		var out := pow(rng.randf(), 1.4) * (1.15 - absf(u - 0.5) * 0.8)
		var big := out < 0.35 and rng.randf() < 0.6
		var tex: ImageTexture
		if rng.randf() < 0.5:
			tex = _block_tex(rng.randi_range(9, 14) if big else rng.randi_range(5, 9), rng.randi_range(6, 9) if big else rng.randi_range(3, 6), rng.randi_range(5, 8) if big else rng.randi_range(3, 5), rng.randi())
		else:
			tex = _stone_tex(rng.randi_range(10, 16) if big else rng.randi_range(5, 10), rng.randi_range(7, 11) if big else rng.randi_range(4, 7), rng.randi())
		var s := Sprite2D.new()
		s.texture = tex
		s.centered = false
		s.scale = Vector2(2, 2)
		s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		# (its foot at its point: the sprite's place is its depth)
		s.offset = Vector2(-tex.get_width() / 2.0, -tex.get_height() + 1.0)
		var foot := _foot(u)
		var end := foot + Vector2(1.0, 0.5) * (out * 32.0) + Vector2(rng.randf_range(-3, 3), rng.randf_range(-1, 2))
		var start := foot + Vector2(0, -_high(u) * rng.randf_range(0.6, 1.0))
		var land := lerpf(LAND_FROM + 0.1, LAND_TO + 0.1, rng.randf())
		_mound.append({"node": s, "start": (position + start).round(), "foot": (position + foot).round(), "end": (position + end).round(), "land": land, "slide": 0.18 + out * 0.3,
			"start_l": start.round(), "foot_l": foot.round(), "tex": tex})
		s.position = (position + start).round()
		s.visible = false
		stands.add_child(s)
		mound_tiles.append(Iso.to_world(position + end))


## Where a piece of the mound is at this moment: falling in the arch, then sliding out over the floor and coming to rest.
func _mound_at(m: Dictionary) -> Vector2:
	var land: float = m["land"]
	# (while it falls it is drawn in the arch, out of the stairwell's dark (_draw); the picture standing on the floor takes it from
	# the foot of the arch as it lands)
	if t < land:
		m["node"].visible = false
		return m["foot"]
	m["node"].visible = true
	var s := clampf((t - land) / float(m["slide"]), 0.0, 1.0)
	var e := 1.0 - pow(1.0 - s, 3.0)
	return m["foot"].lerp(m["end"], e).round()


## One rough stone, a little picture `w` x `h` game pixels: a rough outline, lit from the top left, its lower right in shadow, a
## crack or a fleck of moss, its edge dark.
func _stone_tex(w: int, h: int, seed: int) -> ImageTexture:
	w = maxi(w, 3)
	h = maxi(h, 3)
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var img := Image.create(w, h, false, Image.FORMAT_RGBA8)
	img.fill(Color(0, 0, 0, 0))
	var c := Vector2(w, h) / 2.0 - Vector2(0.5, 0.5)
	var pts := PackedVector2Array()
	for i in 8:
		var a := TAU * float(i) / 8.0 + rng.randf_range(-0.25, 0.25)
		var k := rng.randf_range(0.78, 1.0)
		pts.append(c + Vector2(cos(a) * (w / 2.0 - 0.2) * k, sin(a) * (h / 2.0 - 0.2) * k))
	var inside := func(x: int, y: int) -> bool:
		return x >= 0 and y >= 0 and x < w and y < h and Geometry2D.is_point_in_polygon(Vector2(x, y), pts)
	var moss := rng.randf() < 0.3
	for y in h:
		for x in w:
			if not inside.call(x, y):
				continue
			var edge: bool = not inside.call(x - 1, y) or not inside.call(x + 1, y) or not inside.call(x, y - 1) or not inside.call(x, y + 1)
			var col := MID
			if edge:
				col = EDGE
			else:
				var d := (Vector2(x, y) - c) / Vector2(w / 2.0, h / 2.0)
				var lit := -(d.x * 0.55 + d.y * 0.85)
				col = LIGHT if lit > 0.6 else LIT if lit > 0.15 else MID if lit > -0.35 else DARK if lit > -0.75 else DEEP
				if moss and y <= c.y - 1 and rng.randf() < 0.18:
					col = MOSS
			img.set_pixel(x, y, col)
	if w >= 9 and rng.randf() < 0.6:
		var x0 := rng.randi_range(2, w - 4)
		var y0 := rng.randi_range(1, 2)
		for s in 3:
			if inside.call(x0 + s, y0 + s) and img.get_pixel(x0 + s, y0 + s) != EDGE:
				img.set_pixel(x0 + s, y0 + s, DEEP)
	return ImageTexture.create_from_image(img)


## One broken block of the stairwell's cut stone, seen as the floor is seen: `a` game pixels along the world's x, `b` along its y,
## `h` high; its top lit, its left side half lit, its right side in shadow; a corner knocked off, a crack across its top.
func _block_tex(a: int, b: int, h: int, seed: int) -> ImageTexture:
	a = maxi(a, 3)
	b = maxi(b, 3)
	h = maxi(h, 2)
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var w := a + b
	var ht := int(ceil((a + b) / 2.0)) + h + 1
	var img := Image.create(w, ht, false, Image.FORMAT_RGBA8)
	img.fill(Color(0, 0, 0, 0))
	var p0 := Vector2(b, 0)
	var p1 := Vector2(b + a, a / 2.0)
	var p2 := Vector2(a, (a + b) / 2.0)
	var p3 := Vector2(0, b / 2.0)
	var down := Vector2(0, h)
	var top := PackedVector2Array([p0, p1, p2, p3])
	var left := PackedVector2Array([p3, p2, p2 + down, p3 + down])
	var right := PackedVector2Array([p2, p1, p1 + down, p2 + down])
	# (a corner knocked off, some of the time)
	var notch := Vector2(-99, -99)
	var notch_r := 0.0
	if rng.randf() < 0.6:
		notch = p3 + down * 0.6 if rng.randf() < 0.5 else p1 + Vector2(-1, 1)
		notch_r = rng.randf_range(1.5, 3.0)
	var face := func(x: int, y: int) -> int:
		var p := Vector2(x + 0.5, y + 0.5)
		if p.distance_to(notch) < notch_r:
			return 0
		if Geometry2D.is_point_in_polygon(p, top):
			return 1
		if Geometry2D.is_point_in_polygon(p, left):
			return 2
		if Geometry2D.is_point_in_polygon(p, right):
			return 3
		return 0
	var moss := rng.randf() < 0.35
	for y in ht:
		for x in w:
			var f: int = face.call(x, y)
			if f == 0:
				continue
			var edge: bool = face.call(x - 1, y) == 0 or face.call(x + 1, y) == 0 or face.call(x, y - 1) == 0 or face.call(x, y + 1) == 0
			var col: Color
			if edge:
				col = EDGE
			elif f == 1:
				col = LIGHT if (x + y * 2) % 7 != 0 else LIT
				if moss and rng.randf() < 0.22:
					col = MOSS
			elif f == 2:
				col = MID
			else:
				col = DARK if (x + y) % 5 != 0 else DEEP
			# (where the top meets the sides: a line of shadow under its lip)
			if not edge and f != 1 and face.call(x, y - 1) == 1:
				col = DEEP
			img.set_pixel(x, y, col)
	# (a crack across its top)
	if a >= 8 and rng.randf() < 0.65:
		var x0 := b + rng.randi_range(2, a - 3)
		var y0 := int((x0 - b) * 0.5) + 1
		for s in 4:
			var px := x0 - s
			var py := y0 + int(s / 2.0) + 1
			if px >= 0 and py >= 0 and px < w and py < ht and face.call(px, py) == 1:
				img.set_pixel(px, py, DARK)
	return ImageTexture.create_from_image(img)


func _draw() -> void:
	# the stairwell's light going out behind the stones: the opening filled with the dark
	var dark := clampf((t - GIVE) / (DARK_TO - GIVE), 0.0, 1.0)
	if dark > 0.0:
		draw_colored_polygon(_opening(), Color(HOLE, 0.95 * dark))
	# the stairwell's shadow deepening from its top as the roof groans: what falls comes down out of it
	var gloom := clampf((t - (GIVE - 0.6)) / 0.6, 0.0, 1.0)
	if gloom > 0.0:
		_draw_gloom(gloom)
	# grit pouring from the arch's crown while the roof groans
	for g in _grit_now():
		draw_rect(Rect2(g, Vector2(2, 2)), DUST)
	# the heap, each piece falling to its place by its moment, or lying there
	for h in _heap:
		var land: float = h["land"]
		var fall := sqrt(2.0 * float(h["from"]) / G)
		if t < land - fall:
			continue
		var at: Vector2 = h["at"]
		var k: float = h["shade"]
		if t < land:
			var left := land - t
			at.y -= 0.5 * G * left * left
			# (dark as it comes out of the stairwell, lit by the room as it lands)
			var p := 1.0 - left / fall
			k = lerpf(0.28, k, p * p)
			_draw_in_opening(h["tex"], (at / 2.0).floor() * 2.0, h["size"], k)
			continue
		var since := t - land
		if since < 0.08:
			at.y -= roundf(2.0 * (1.0 - since / 0.08))
		draw_texture_rect(h["tex"], Rect2((at / 2.0).floor() * 2.0, h["size"]), false, Color(k, k, k))
	# the mound's pieces, falling in the arch before they spill out over the floor
	for m in _mound:
		var land: float = m["land"]
		var a: Vector2 = m["start_l"]
		var b: Vector2 = m["foot_l"]
		var fall := sqrt(2.0 * maxf(1.0, b.y - a.y) / G)
		if t < land - fall or t >= land:
			continue
		var kk := (t - (land - fall)) / fall
		var at: Vector2 = a.lerp(b, kk * kk)
		var tex: ImageTexture = m["tex"]
		var size := Vector2(tex.get_width(), tex.get_height()) * 2.0
		_draw_in_opening(tex, ((at - Vector2(size.x / 2.0, size.y - 2.0)) / 2.0).floor() * 2.0, size, lerpf(0.28, 0.9, kk * kk))


## The top of the opening over its foot at screen x `x` (picture pixels from this node), or INF outside the opening.
func _top_at(x: float) -> float:
	var u := (x - FOOT_L.x) / (FOOT_R.x - FOOT_L.x)
	if u < 0.0 or u > 1.0:
		return INF
	return _foot(u).y - _high(u)


## A falling piece drawn only where it is within the arch's opening, column by column (two picture pixels each): what is above the
## arch's curve, still up in the stairwell, not seen.
func _draw_in_opening(tex: Texture2D, at: Vector2, size: Vector2, k: float) -> void:
	var cols := int(size.x / 2.0)
	var col := Color(k, k, k)
	for c in cols:
		var x := at.x + float(c) * 2.0
		var top := _top_at(x + 1.0)
		if top == INF:
			continue
		var y0 := maxf(at.y, ceilf(top / 2.0) * 2.0)
		var y1 := at.y + size.y
		if y1 <= y0:
			continue
		var src_y := (y0 - at.y) / 2.0
		draw_texture_rect_region(tex, Rect2(x, y0, 2.0, y1 - y0), Rect2(float(c), src_y, 1.0, (y1 - y0) / 2.0), col)


## The stairwell's shadow in the top of the opening: dark under the arch's curve, thinning down to nothing two fifths of the way down.
func _draw_gloom(a: float) -> void:
	var pts := PackedVector2Array()
	var cols := PackedColorArray()
	var n := 16
	for i in range(n + 1):
		var u := float(i) / float(n)
		pts.append(_foot(u) + Vector2(0, -_high(u)))
		cols.append(Color(HOLE, 0.92 * a))
	for i in range(n, -1, -1):
		var u := float(i) / float(n)
		pts.append(_foot(u) + Vector2(0, -_high(u) * 0.58))
		cols.append(Color(HOLE, 0.0))
	draw_polygon(pts, cols)


func _grit_now() -> Array:
	var out: Array = []
	if t > GIVE + 0.35:
		return out
	var rng := RandomNumberGenerator.new()
	rng.seed = 77
	for i in 40:
		var born := rng.randf_range(0.0, GIVE + 0.25)
		var u := rng.randf_range(0.15, 0.85)
		var top := _foot(u) + Vector2(rng.randf_range(-4, 4), -_high(u))
		var age := t - born
		if age < 0.0 or age > 0.6:
			continue
		var y := top.y + 0.5 * 900.0 * age * age
		if y > _foot(u).y:
			continue
		out.append((Vector2(top.x, y) / 2.0).floor() * 2.0)
	return out


# --- the dust, and the daylight put out ------------------------------------------------------------------------------------

## The stairwell's daylight, put out: the dark laid back over where it lit the floor and the arch (its hole's own shape, an ellipse
## 2r across and 0.62 of that high, strongest in its middle), as dark as the floor's dark.
func light_tex() -> ImageTexture:
	if _light_tex != null:
		return _light_tex
	var w := 84
	var h := 52
	var img := Image.create(w, h, false, Image.FORMAT_RGBA8)
	for y in h:
		for x in w:
			var dx := (x + 0.5 - w / 2.0) / (w / 2.0)
			var dy := (y + 0.5 - h / 2.0) / (h / 2.0)
			var k := sqrt(dx * dx + dy * dy)
			var a := 0.0 if k >= 1.0 else DARK_A * 0.95 * (1.0 - smoothstep(0.3, 1.0, k))
			img.set_pixel(x, y, Color(NIGHT, a))
	_light_tex = ImageTexture.create_from_image(img)
	return _light_tex


func light_out() -> float:
	return clampf((t - GIVE) / (DARK_TO - GIVE), 0.0, 1.0) if film else 0.0


## Puff pictures of the art's grain at three sizes (a soft round thinned by a fixed dither toward its edge).
func puff_tex(across: float) -> ImageTexture:
	if _puff_texs.is_empty():
		for pr in [10, 18, 28]:
			var n: int = pr * 2
			var img := Image.create(n, n, false, Image.FORMAT_RGBA8)
			img.fill(Color(0, 0, 0, 0))
			var c := float(pr) - 0.5
			for y in n:
				for x in n:
					var d := Vector2(x - c, y - c).length() / float(pr)
					if d > 1.0:
						continue
					var keep := 1.0 - d * d
					var dither := float(((x * 7 + y * 13) % 16 + 16) % 16) / 16.0
					if keep * 1.15 > dither:
						img.set_pixel(x, y, Color(DUST, 0.4 + 0.5 * keep))
			_puff_texs.append([float(n) * 2.0, ImageTexture.create_from_image(img)])
	for p in _puff_texs:
		if across <= float(p[0]) * 1.25:
			return p[1]
	return _puff_texs[-1][1]


## The burst: puffs born along the arch's foot as the great blocks land, thrown out over the floor (to the screen's lower right
## and along the wall) and slowing, swelling, rising a little and clearing; a plume out of the arch's middle.
func puffs_now() -> Array:
	var out: Array = []
	if t < BIG_LAND or t > FILM:
		return out
	var rng := RandomNumberGenerator.new()
	rng.seed = 5150
	for i in 18:
		var plume := i >= 14
		var born := BIG_LAND + rng.randf_range(0.0, 0.25 if not plume else 0.6)
		var life := rng.randf_range(1.3, 2.2)
		var u := rng.randf_range(0.05, 0.95)
		var lift := rng.randf_range(2.0, 16.0) if not plume else rng.randf_range(40.0, 80.0)
		var dir := Vector2(1.0, 0.5).normalized() * rng.randf_range(80.0, 170.0) + Vector2(1.0, -0.5).normalized() * rng.randf_range(-70.0, 70.0)
		if plume:
			dir *= 0.4
		var r0 := rng.randf_range(10.0, 16.0)
		var r1 := rng.randf_range(34.0, 56.0) if not plume else rng.randf_range(40.0, 60.0)
		var age := t - born
		if age < 0.0 or age > life:
			continue
		var k := age / life
		# (thrown, slowing: how far it has gone)
		var gone := (1.0 - exp(-3.0 * age)) / 3.0
		out.append({"at": _foot(u) + Vector2(0, -lift) + dir * gone + Vector2(0, -20.0 * k), "r": lerpf(r0, r1, 1.0 - pow(1.0 - k, 2.0)), "alpha": 0.8 * (1.0 - k) * minf(1.0, age / 0.08)})
	return out


## Motes hanging in the air after it, drifting and going.
func motes_now() -> Array:
	var out: Array = []
	if t < BIG_LAND + 0.3 or t > FILM:
		return out
	var rng := RandomNumberGenerator.new()
	rng.seed = 909
	for i in 34:
		var born := BIG_LAND + 0.3 + rng.randf_range(0.0, 1.2)
		var life := rng.randf_range(1.6, 2.8)
		var age := t - born
		var start := _foot(rng.randf()) + Vector2(rng.randf_range(0.0, 90.0), rng.randf_range(-70.0, 20.0))
		var drift := Vector2(rng.randf_range(-6.0, 10.0), rng.randf_range(-8.0, 6.0))
		if age < 0.0 or age > life:
			continue
		out.append({"at": ((start + drift * age) / 2.0).floor() * 2.0, "alpha": 0.7 * sin(PI * age / life)})
	return out


class Dust extends Node2D:
	var cave

	func _ready() -> void:
		texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST

	func _draw() -> void:
		if cave == null:
			return
		# the daylight put out
		var lo: float = cave.light_out()
		if lo > 0.0:
			var tex: ImageTexture = cave.light_tex()
			var size := Vector2(cave.LIGHT_R * 2.0, cave.LIGHT_R * 2.0 * 0.62)
			draw_texture_rect(tex, Rect2(cave.LIGHT_AT - size / 2.0, size), false, Color(1, 1, 1, lo))
		for p in cave.puffs_now():
			var r: float = p["r"]
			var pt: ImageTexture = cave.puff_tex(r * 2.0)
			var size := Vector2(r, r) * 2.0
			var at: Vector2 = p["at"] - size / 2.0
			draw_texture_rect(pt, Rect2((at / 2.0).floor() * 2.0, (size / 2.0).floor() * 2.0), false, Color(1, 1, 1, float(p["alpha"])))
		for m in cave.motes_now():
			draw_rect(Rect2(m["at"], Vector2(2, 2)), Color(cave.DUST, float(m["alpha"])))
