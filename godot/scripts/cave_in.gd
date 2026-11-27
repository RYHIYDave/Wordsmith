## THE STAIRS CAVE IN behind him as he comes down into the prison. His words, 26 Nov 2026, 22:06: “id like the stairs to cave in
## when you go down into the first level, then change the wordstone quest to have it say "push deeper into the prison"”; his picks,
## asked: the first time only (“First time only (Recommended)”: after that floor 1 begins with the rubble already there), and the
## town's stairs still lead down (“Yes, still lead down (Recommended)”), so a hero who falls there can always go back for the stone.
##
## Floor 1's stairwell up, in its arch behind him where he comes in (main.gd _gate: the gate's line at x 21, rows 131 to 133):
##   the film (FILM s): a rumble, grit trickling from the arch (f1_stone), the screen shaking; the roof of the stairwell gives way
##   (ledge_crumble, slam, a hard kick), stones falling into the arch, the lowest first, each landing where the heap will lie and
##   the heap growing up to the top of the arch, a few spilling forward onto the floor; the light from the town above going out
##   behind them; a cloud of dust rolling out of the arch into the room and settling. Then "The stairs cave in behind you."
##   settled: the heap and the dark behind it, the way up gone (main.gd blocks the gate's tiles and its walk up).
## Drawn in the art's own grain (two picture pixels to a game pixel), each stone a little picture of its own: lit from the top
## left, its edge dark, in the stairwell's own greens and greys; the dust in the same grain, thinned by a dither as it clears.
## Laid in `flats` (under all that stands, so the arch's piers and the wall over it stand in front of it); its dust over everything.
extends Node2D

signal fell     # the roof gives way: main.gd says the line, and the banner turns
signal settled  # the film over

const FILM := 4.2
const RUMBLE := 0.0        # grit and shaking from here
const GIVE := 0.95         # the roof gives way
const LAND_FROM := 1.0     # the stones land from here...
const LAND_TO := 2.35      # ...to here, the lowest first
const DARK_TO := 2.2       # the stairwell's light gone by here
const G := 1500.0          # how fast they fall (picture pixels a second, a second)

# (the stairwell's own stone, its daylight gone: from the torch-lit top of a stone to its deepest shadow, and its moss)
const LIGHT := Color("#868a6b")
const LIT := Color("#6d7157")
const MID := Color("#555944")
const DARK := Color("#3d4132")
const EDGE := Color("#1a1d15")
const MOSS := Color("#4a5a33")
const DUST := Color("#8a876b")
const HOLE := Color("#0d0f0a")

var sfx                     # sfx.gd
var shaker                  # main.gd: the screen's kick (kick)
var film := true            # false: come in when it has already fallen
var delay := 0.0            # the film waits this long (the curtain lifting)
var t := 0.0

var _stones: Array = []     # {tex, size, at, from, land, sound}
var _dust: Node2D = null
var _puffs: Array = []      # {at, vel, r0, r1, born, life}
var _grit: Array = []       # {x, y0, born, speed}
var _fell_said := false
var _done := false
var _heard := {}


func _ready() -> void:
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_lay_heap()
	if not film:
		t = FILM
		_fell_said = true
		_done = true
	queue_redraw()


## The dust's own layer, over everything (main.gd adds it to the place after all that stands).
func dust_layer() -> Node2D:
	if _dust == null:
		_dust = Dust.new()
		_dust.cave = self
		_dust.col = DUST
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
	if t >= GIVE and not _fell_said:
		_fell_said = true
		fell.emit()
	if t >= FILM:
		_done = true
		_puffs.clear()
		_grit.clear()
		settled.emit()
	queue_redraw()
	if _dust != null:
		_dust.queue_redraw()


func _sounds() -> void:
	_once("rumble", RUMBLE + 0.02, "f1_stone", -2.0)
	_once("give", GIVE, "ledge_crumble", 0.0)
	_once("slam", GIVE + 0.08, "slam", -1.0)
	_once("settle", LAND_TO - 0.5, "stone_death", -3.0)
	var i := 0
	for s in _stones:
		if s["sound"] and t >= s["land"]:
			_once("land%d" % i, s["land"], "step_stone", -8.0)
		i += 1


func _once(key: String, at: float, name: String, db: float) -> void:
	if _heard.has(key) or t < at or sfx == null:
		return
	_heard[key] = true
	sfx.play(name, db)


func _shake() -> void:
	if shaker == null or not shaker.has_method("kick"):
		return
	if t >= RUMBLE and t < GIVE:
		shaker.kick(1.2 + 1.2 * (t - RUMBLE) / (GIVE - RUMBLE))
	elif t >= GIVE and t < GIVE + 0.12:
		shaker.kick(7.0)
	elif t < LAND_TO:
		shaker.kick(2.2)


# --- the heap --------------------------------------------------------------------------------------------------------------

## The arch's opening, in picture pixels from this node (the middle of its foot, world x 22, y 132.375: the look's "gate up arch"
## strips run along x 22 from y 130.625 to 134.125): its foot runs from the lower left (FOOT_L) to the upper right (FOOT_R); over
## it the opening stands SIDE high at its piers and rises in the arch to CROWN, a little left of its middle (CROWN_AT), as the
## look draws it. The heap fills it nearly to the arch; the dark behind it fills it whole.
const FOOT_L := Vector2(-56.0, 28.0)
const FOOT_R := Vector2(56.0, -28.0)
const SIDE := 38.0
const CROWN := 96.0
const CROWN_AT := 0.45
const FULL := 0.9           # how near the arch the heap comes
const SPILL := 5            # stones spilled forward onto the floor


func _foot(u: float) -> Vector2:
	return FOOT_L.lerp(FOOT_R, u)


## How high the opening is over its foot at `u` (0 its left pier, 1 its right).
func _high(u: float) -> float:
	var k := (u - CROWN_AT) / (CROWN_AT if u < CROWN_AT else 1.0 - CROWN_AT)
	return SIDE + (CROWN - SIDE) * sqrt(maxf(0.0, 1.0 - k * k))


## The opening, its foot and its arch, as a polygon.
func _opening() -> PackedVector2Array:
	var pts := PackedVector2Array([_foot(0.0), _foot(1.0)])
	for i in range(16, -1, -1):
		var u := float(i) / 16.0
		pts.append(_foot(u) + Vector2(0, -_high(u)))
	return pts


func _lay_heap() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 2611
	var laid: Array = []
	# a jumble of stones under the arch, the big ones low, its top ragged (dark showing between the topmost), none above the arch
	for i in 104:
		var u := rng.randf_range(0.02, 0.98)
		var top := _high(u) * clampf(0.8 + 0.1 * sin(u * 9.0 + 1.3) + 0.06 * sin(u * 23.0 + 0.4), 0.62, FULL)
		var v := pow(rng.randf(), 1.1)
		var w := rng.randi_range(9, 17) - int(v * 5.0)
		var ht := rng.randi_range(7, 12) - int(v * 3.0)
		var h := minf(v * top, top - float(ht) * 2.0)
		var at := _foot(u) + Vector2(-float(w) + rng.randf_range(-4, 4), -maxf(0.0, h) - float(ht) * 2.0)
		laid.append({"w": w, "h": ht, "at": at.round(), "v": v, "seed": rng.randi(), "u": u})
	# stones spilled forward, past the arch's foot, onto the floor: more of them near its middle
	for k in 11:
		var u := clampf(0.5 + rng.randf_range(-0.45, 0.45) * rng.randf(), 0.05, 0.95)
		var fwd := Vector2(rng.randf_range(4.0, 30.0), 0.0)
		fwd.y = fwd.x * 0.5 + rng.randf_range(-3.0, 5.0)
		var w := rng.randi_range(5, 11) - int(fwd.x / 12.0)
		var ht := rng.randi_range(3, 7) - int(fwd.x / 16.0)
		laid.append({"w": w, "h": ht, "at": (_foot(u) + fwd - Vector2(float(w), float(ht) * 2.0)).round(), "v": -0.1 + fwd.x / 400.0, "seed": rng.randi(), "u": u})
	# the order they land: the lowest first (the spilled ones with the first), each a moment after the last
	laid.sort_custom(func(a, b): return a["v"] < b["v"])
	var n_all := laid.size()
	for i in n_all:
		var s: Dictionary = laid[i]
		var tex := _stone_tex(int(s["w"]), int(s["h"]), int(s["seed"]))
		var land := lerpf(LAND_FROM, LAND_TO, pow(float(i) / float(n_all - 1), 0.85))
		# (it falls from the arch's top, where the stairwell's roof came down, to where it lies)
		var top: float = (_foot(float(s["u"])) + Vector2(0, -_high(float(s["u"])))).y
		var drop := maxf(8.0, float(s["at"].y) - top + float(s["h"]) * 2.0)
		_stones.append({"tex": tex, "size": Vector2(s["w"], s["h"]) * 2.0, "at": s["at"], "from": drop, "land": land, "sound": i % 5 == 0})
	# drawn from the far (high on the screen) to the near
	_stones.sort_custom(func(a, b): return a["at"].y + a["size"].y < b["at"].y + b["size"].y)


## One stone, a little picture `w` x `h` game pixels: a rough outline (eight points round it, each pushed in or out), lit from
## the top left, its lower right in shadow, a crack or a fleck of moss, its edge dark.
func _stone_tex(w: int, h: int, seed: int) -> ImageTexture:
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
	var moss := rng.randf() < 0.35
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
				col = LIGHT if lit > 0.55 else LIT if lit > 0.1 else MID if lit > -0.45 else DARK
				if moss and y <= c.y - 1 and rng.randf() < 0.18:
					col = MOSS
			img.set_pixel(x, y, col)
	# (a crack across it)
	if w >= 9 and rng.randf() < 0.6:
		var x0 := rng.randi_range(2, w - 4)
		var y0 := rng.randi_range(1, 2)
		for s in 3:
			if inside.call(x0 + s, y0 + s) and img.get_pixel(x0 + s, y0 + s) != EDGE:
				img.set_pixel(x0 + s, y0 + s, DARK)
	return ImageTexture.create_from_image(img)


func _draw() -> void:
	# the stairwell's light going out behind the stones: dark from the foot of the arch up past its crown
	var dark := clampf((t - GIVE) / (DARK_TO - GIVE), 0.0, 1.0)
	if dark > 0.0:
		draw_colored_polygon(_opening(), Color(HOLE, 0.94 * dark))
	# grit trickling from the arch's crown before it gives
	for g in _grit_now():
		draw_rect(Rect2(g, Vector2(2, 2)), DUST)
	# the stones, each falling to its place by its moment, or lying there
	for s in _stones:
		var land: float = s["land"]
		if t < land - sqrt(2.0 * float(s["from"]) / G):
			continue
		var at: Vector2 = s["at"]
		if t < land:
			var left := land - t
			at.y -= 0.5 * G * left * left
		else:
			# (a little jolt as it lands)
			var since := t - land
			if since < 0.08:
				at.y -= roundf(2.0 * (1.0 - since / 0.08))
		draw_texture_rect(s["tex"], Rect2((at / 2.0).floor() * 2.0, s["size"]), false)


## The grit falling from the crown while the roof groans (2 x 2 grains, each falling from the crown to the foot).
func _grit_now() -> Array:
	var out: Array = []
	if t < RUMBLE or t > GIVE + 0.3:
		return out
	var rng := RandomNumberGenerator.new()
	rng.seed = 77
	for i in 26:
		var born := RUMBLE + rng.randf_range(0.0, GIVE + 0.2 - RUMBLE)
		var u := rng.randf_range(0.2, 0.8)
		var top := _foot(u) + Vector2(rng.randf_range(-4, 4), -_high(u))
		var age := t - born
		if age < 0.0 or age > 0.6:
			continue
		var y := top.y + 0.5 * 900.0 * age * age
		if y > _foot(u).y:
			continue
		out.append((Vector2(top.x, y) / 2.0).floor() * 2.0)
	return out


# --- the dust --------------------------------------------------------------------------------------------------------------

## The cloud rolling out of the arch as the roof comes down: puffs born along the arch's opening, drifting out into the room (to
## the screen's lower right) and up, swelling and clearing. Each puff a little picture of the art's grain (a soft round dithered
## thinner toward its edge), made once, drawn larger as it swells and fainter as it clears.
const PUFF_R := 24          # a puff's picture: this many game pixels across its middle
var _puff_tex: ImageTexture = null


func _puff() -> ImageTexture:
	if _puff_tex != null:
		return _puff_tex
	var n := PUFF_R * 2
	var img := Image.create(n, n, false, Image.FORMAT_RGBA8)
	img.fill(Color(0, 0, 0, 0))
	var c := float(PUFF_R) - 0.5
	for y in n:
		for x in n:
			var d := Vector2(x - c, y - c).length() / float(PUFF_R)
			if d > 1.0:
				continue
			var keep := 1.0 - d * d
			var dither := float(((x * 7 + y * 13) % 16 + 16) % 16) / 16.0
			if keep * 1.1 > dither:
				img.set_pixel(x, y, Color(DUST, 0.35 + 0.45 * keep))
	_puff_tex = ImageTexture.create_from_image(img)
	return _puff_tex


func puffs_now() -> Array:
	var out: Array = []
	if t < GIVE or t > FILM:
		return out
	var rng := RandomNumberGenerator.new()
	rng.seed = 5150
	for i in 7:
		var born := GIVE + rng.randf_range(0.0, 0.7)
		var life := rng.randf_range(1.1, 1.7)
		var age := t - born
		var u := rng.randf_range(0.1, 0.9)
		var lift := rng.randf_range(8.0, 60.0)
		var drift := Vector2(rng.randf_range(16.0, 40.0), rng.randf_range(4.0, 16.0))
		var grow := rng.randf_range(1.0, 1.45)
		if age < 0.0 or age > life:
			continue
		var k := age / life
		var ease := 1.0 - pow(1.0 - k, 2.0)
		out.append({"at": _foot(u) + Vector2(0, -lift) + drift * ease + Vector2(0, -14.0 * ease), "scale": lerpf(0.6, grow, ease), "alpha": 0.7 * (1.0 - k) * minf(1.0, age / 0.12)})
	return out


class Dust extends Node2D:
	var cave
	var col := Color.WHITE

	func _ready() -> void:
		texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST

	func _draw() -> void:
		if cave == null:
			return
		var tex: ImageTexture = cave._puff()
		for p in cave.puffs_now():
			var size := Vector2(tex.get_width(), tex.get_height()) * 2.0 * float(p["scale"])
			var at: Vector2 = (p["at"] - size / 2.0)
			draw_texture_rect(tex, Rect2((at / 2.0).floor() * 2.0, (size / 2.0).floor() * 2.0), false, Color(1, 1, 1, float(p["alpha"])))
