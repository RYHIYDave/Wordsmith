## THE HEADSMAN'S VAULT, AS THE GAME DRAWS IT (art/headsman2_shots.ts drawVaultMark, drawVaultSlam, drawVaultSlamOver; render/bossfx.ts
## 'h2:vault' and the 'slam' peril), line for line, in the game's own pixels: given where a point of the floor is on the screen
## (`at`, game pixels), each pixel laid as two of the world's.
##   THE MARK while he gathers: a ring burning on the floor as wide as the slam will be (H2_SLAM.reach), a second running in toward
##     the spot, and the cracks of the slam to come glowing faintly in the stone, more as it nears.
##   THE SLAM, under him: a flash of the enemy's fire where the blade bit and rays of it out across the stone; a shock ring of fire
##     racing out to the slam's edge, a wave of dust thrown up close behind it; the floor split open in wide cracks out to the edge,
##     burning and then dark; a crater of broken stone where it struck, its rim heaped up.
##   OVER HIM: a column of fire bursting up out of the crater and flames up out of the cracks; chunks of the floor flung up and out,
##     falling and bouncing; sparks; dust rolling out. Its light in the dark: render/bossfx.ts spots.
## Its colours are the enemy's, pink and gold (art/mkit.ts FLAME).
extends RefCounted

const Perils := preload("res://scripts/perils.gd")

## (art/headsman2_shots.ts H2_SLAM)
const REACH := 2.5
const FOR := 1.8
const OVER_FOR := 1.4
## (art/mkit.ts FLAME; art/palette.ts P.black, ink, st4, st5, st6)
const FLAME := [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
const BLACK := Color("#07050a")
const INK := Color("#120d18")
const ST4 := Color("#4d4252")
const ST5 := Color("#655868")
const ST6 := Color("#857888")


static func _c01(v: float) -> float:
	return clampf(v, 0.0, 1.0)


static func _ease_out(k: float) -> float:
	return 1.0 - pow(1.0 - _c01(k), 3.0)


static func _h(x: int, y: int, k: int) -> float:
	return Perils._hash(x, y, k)


## (dotAt) A block of game pixels, rounded, in a colour.
static func _dot(c: CanvasItem, x: float, y: float, col: Color, a: float, w := 1.0, h := 1.0) -> void:
	if a <= 0.0:
		return
	c.draw_rect(Rect2(roundf(x) * 2.0, roundf(y) * 2.0, w * 2.0, h * 2.0), Color(col, col.a * minf(1.0, a)))


## (crack) A crack across the floor from (x, y) out along (dx, dy) for `long` tiles, jagged by `seed`, drawn `k` of the way out:
## its screen pixels, each with how far along it is.
static func _crack(at: Callable, x: float, y: float, dx: float, dy: float, long: float, seed: int, k: float, each: Callable) -> void:
	var sx0 := -dy
	var sy0 := dx
	var n := maxi(2, roundi(long * 5.0))
	var last = null
	for i in n + 1:
		var f := float(i) / n
		if f > k:
			break
		var d := f * long
		var off := 0.0 if i == 0 else (_h(i, seed, 97) - 0.5) * 0.16 * (0.5 + f)
		var p: Vector2 = at.call(x + dx * d + sx0 * off, y + dy * d + sy0 * off)
		if last != null:
			var steps := maxi(1, ceili(p.distance_to(last)))
			for j in steps:
				each.call(last.x + (p.x - last.x) * j / steps, last.y + (p.y - last.y) * j / steps, f)
		last = p


## (ring) A ring on the floor round (x, y), `r` tiles: each of its points with how far round it is.
static func _ring(at: Callable, x: float, y: float, r: float, each: Callable) -> void:
	var n := maxi(40, roundi(r * 46.0))
	for i in n:
		var a := float(i) / n * TAU
		var p: Vector2 = at.call(x + cos(a) * r, y + sin(a) * r)
		each.call(p.x, p.y, a)


## (drawVaultMark) The vault's warning at the spot, `k` from 0 as he plants the haft to 1 as the blade comes down; `t` the clock.
static func mark(c: CanvasItem, at: Callable, x: float, y: float, k: float, t: float) -> void:
	if k <= 0.0:
		return
	var run := fmod(t * 1.3, 1.0)
	_ring(at, x, y, REACH, func(sx, sy, a):
		var lead := 1.0 - fposmod(a / TAU - run, 1.0)
		var hot := (lead - 0.86) / 0.14 if lead > 0.86 else 0.0
		var al := minf(1.0, 0.3 + 0.6 * k + 0.4 * hot)
		_dot(c, sx, sy, FLAME[3] if hot > 0.5 else FLAME[2], al, 2, 1)
		_dot(c, sx, sy + 1, FLAME[0], al, 2, 1))
	# (a ring running in from the edge toward the spot, again and again)
	var inward := REACH * (1.0 - fmod(t * 1.8, 1.0))
	_ring(at, x, y, inward, func(sx, sy, a):
		if int(floorf(a / TAU * 60.0)) % 2 == 0:
			_dot(c, sx, sy, FLAME[1], 0.55 * k))
	# (the cracks to come, glowing faintly in the stone)
	for i in 10:
		var a := float(i) / 10.0 * TAU + _h(i, 3, 89) * 0.5
		_crack(at, x, y, cos(a), sin(a), REACH * (0.55 + 0.35 * _h(i, 4, 89)), 60 + i, 0.35 + 0.65 * k, func(sx, sy, f):
			_dot(c, sx, sy, FLAME[1], k * 0.45 * (1.0 - f * 0.6)))
	# (the spot itself)
	var p: Vector2 = at.call(x, y)
	_dot(c, p.x - 3, p.y - 1, FLAME[2], 0.5 + 0.5 * k, 7, 3)
	_dot(c, p.x - 1, p.y, FLAME[3], 0.5 + 0.5 * k, 3, 1)


## (drawVaultSlam) The slam at the spot, `t` seconds after the blade comes down: the floor's own, under him.
static func slam(c: CanvasItem, at: Callable, x: float, y: float, t: float) -> void:
	if t < 0.0 or t >= FOR:
		return
	var fade := 1.0 if t < FOR * 0.6 else 1.0 - (t - FOR * 0.6) / (FOR * 0.4)
	var hot := _c01(1.0 - t / 0.9)
	var mid: Vector2 = at.call(x, y)
	# the cracks: out every way to the edge, racing out in the first fifth of a second, split wide and burning, the fire dying back
	# from their ends to the middle, then dark; and a branch off each
	var out := _ease_out(t / 0.18)
	var draw := func(sx: float, sy: float, f: float) -> void:
		var burning := f < 0.15 + 0.85 * hot
		var wide := 3.0 if f < 0.5 else (2.0 if f < 0.8 else 1.0)
		_dot(c, sx - 1, sy, BLACK, fade, wide + 1, 2)
		if burning:
			_dot(c, sx, sy, FLAME[4] if f < 0.25 and hot > 0.6 else (FLAME[3] if f < 0.55 else FLAME[2]), fade, maxf(1.0, wide - 1), 1)
	for i in 14:
		var a := float(i) / 14.0 * TAU + _h(i, 5, 93) * 0.35
		var long := REACH * (0.75 + 0.3 * _h(i, 6, 93))
		_crack(at, x, y, cos(a), sin(a), long, 70 + i, out, draw)
		for side in [-1, 1]:
			if _h(i, side + 10, 93) < 0.35:
				continue
			var b: float = a + side * (0.6 + 0.4 * _h(i, side + 12, 93))
			var from := 0.3 + 0.35 * _h(i, side + 14, 93)
			_crack(at, x + cos(a) * long * from, y + sin(a) * long * from, cos(b), sin(b), long * 0.38, 90 + i * 3 + side, _c01((out - from) / (1.0 - from)), func(sx, sy, f): draw.call(sx, sy, minf(1.0, from + f * 0.5)))
	# the crater: broken stone sunk where it struck, glowing at first, its rim of rubble heaped up
	for i in 64:
		var a := float(i) / 64.0 * TAU
		var rr := 0.62 * (0.82 + 0.36 * _h(i, 9, 95))
		for j in 7:
			var p: Vector2 = at.call(x + cos(a) * rr * (j / 6.0), y + sin(a) * rr * (j / 6.0))
			var col: Color
			if j == 6:
				col = ST6 if _h(i, 10, 95) < 0.5 else ST5
			elif j == 5:
				col = ST4
			elif hot > 0.4 and j < 3:
				col = FLAME[3] if j == 0 else FLAME[1]
			else:
				col = BLACK
			_dot(c, p.x, p.y, col, fade, 2 if j >= 5 else 1, 2 if j >= 5 else 1)
	# the shock ring of fire, racing out to the edge, and the wave of dust close behind it, thrown up
	if t < 0.55:
		var k := _ease_out(t / 0.34)
		var r := 0.4 + (REACH - 0.4) * k
		var fire := _c01(1.0 - t / 0.5)
		_ring(at, x, y, r, func(sx, sy, a):
			_dot(c, sx - 1, sy - 2, FLAME[4], fire, 3, 1)
			_dot(c, sx - 1, sy - 1, FLAME[3], fire, 3, 2)
			_dot(c, sx - 1, sy + 1, FLAME[1], fire, 3, 1)
			var n := roundi(a * 24.0)
			if _h(n, 1, 99) < 0.45:
				_dot(c, sx, sy - 3 - 7 * _h(n, 2, 99) * fire, FLAME[3] if _h(n, 5, 99) < 0.5 else FLAME[2], fire, 2, 2))
		var rd := maxf(0.3, r - 0.4)
		_ring(at, x, y, rd, func(sx, sy, a):
			var n := roundi(a * 30.0)
			var hh := 2.0 + 9.0 * _h(n, 3, 99) * sin(PI * _c01(t / 0.55))
			_dot(c, sx - 1, sy - hh, ST6 if _h(n, 4, 99) < 0.5 else ST4, 0.85 * _c01(1.0 - t / 0.55), 3, 3))
	# the flash where the blade bit, and its rays out across the stone
	if t < 0.14:
		var f := 1.0 - t / 0.14
		_dot(c, mid.x - 14, mid.y - 6, FLAME[3], f, 29, 13)
		_dot(c, mid.x - 8, mid.y - 3, FLAME[4], f, 17, 7)
		for i in 18:
			var a := float(i) / 18.0 * TAU + 0.2
			_crack(at, x, y, cos(a), sin(a), REACH * 0.8 * (0.6 + 0.4 * _h(i, 11, 93)), 120 + i, 1.0, func(sx, sy, k2):
				if k2 <= f:
					_dot(c, sx, sy, FLAME[4] if k2 < 0.4 else FLAME[3], f * (1.0 - k2 * 0.7), 2, 2))


## (drawVaultSlamOver) What flies from the slam and burns up out of the floor, over everything, `t` seconds after the blow.
static func over(c: CanvasItem, at: Callable, x: float, y: float, t: float) -> void:
	if t < 0.0 or t >= OVER_FOR:
		return
	# fire bursting up out of the crater, a column of it, and up out of the cracks as they split, dying down
	if t < 0.5:
		var k := _c01(1.0 - t / 0.5)
		for i in 14:
			var a := float(i) / 14.0 * TAU + _h(i, 1, 105)
			var rr := 0.45 * _h(i, 2, 105)
			var p: Vector2 = at.call(x + cos(a) * rr, y + sin(a) * rr)
			var tall := (36.0 + 46.0 * _h(i, 3, 105)) * k * (0.7 + 0.3 * sin(t * 40.0 + i))
			var j := 0.0
			while j < tall:
				var f := j / maxf(1.0, tall)
				var col: Color = FLAME[4] if f < 0.3 else (FLAME[3] if f < 0.6 else (FLAME[2] if f < 0.85 else FLAME[1]))
				_dot(c, p.x - 1 + sin(j * 0.3 + i + t * 30.0) * f * 2.0, p.y - j, col, minf(1.0, k * 1.4) * (1.0 - f * 0.5), 3 if f < 0.6 else 2, 2)
				j += 2.0
		for i in 14:
			var a := float(i) / 14.0 * TAU + _h(i, 5, 93) * 0.35
			var along := REACH * (0.75 + 0.3 * _h(i, 6, 93)) * (0.25 + 0.6 * _h(i, 4, 105)) * _ease_out(t / 0.18)
			var p: Vector2 = at.call(x + cos(a) * along, y + sin(a) * along)
			var tall := (14.0 + 20.0 * _h(i, 6, 105)) * k
			var j := 0.0
			while j < tall:
				var f := j / maxf(1.0, tall)
				_dot(c, p.x, p.y - j, FLAME[3] if f < 0.4 else FLAME[2], k * (1.0 - f * 0.6), 2, 2)
				j += 2.0
	# chunks of the floor: each out along its own way, up and down again, a bounce, and lying; stone lit on top and dark under
	for i in 40:
		var a := float(i) / 40.0 * TAU + _h(i, 1, 101) * 0.3
		var far := REACH * (0.3 + 0.85 * _h(i, 2, 101))
		var T := 0.5 + 0.3 * _h(i, 3, 101)
		var k := _c01(t / T)
		var d := far * (1.0 - pow(1.0 - k, 1.6))
		var up := 46.0 + 60.0 * _h(i, 4, 101)
		var hh := up * 4.0 * k * (1.0 - k)
		if t > T and t < T + 0.2:
			hh = 7.0 * sin(PI * (t - T) / 0.2) * _h(i, 5, 101)
		var p: Vector2 = at.call(x + cos(a) * d, y + sin(a) * d)
		var big := 4.0 if _h(i, 6, 101) < 0.4 else 3.0
		var al := _c01((OVER_FOR - t) / 0.4)
		if hh > 2.0:
			_dot(c, p.x, p.y + 1, BLACK, al * 0.4, big, 1)
		_dot(c, p.x, p.y - hh + big - 1, INK, al, big, 1)
		_dot(c, p.x, p.y - hh, ST6 if i % 3 == 0 else ST5, al, big, big - 1)
		_dot(c, p.x, p.y - hh, ST6, al, big - 1, 1)
	# sparks of the enemy's fire, flung out fast, falling and going out
	if t < 0.7:
		for i in 30:
			var a := float(i) / 30.0 * TAU + _h(i, 7, 103)
			var v := REACH * (0.8 + 0.9 * _h(i, 8, 103))
			var d := v * _ease_out(t / 0.7)
			var hh := (28.0 + 44.0 * _h(i, 9, 103)) * sin(PI * _c01(t / 0.7))
			var p: Vector2 = at.call(x + cos(a) * d, y + sin(a) * d)
			_dot(c, p.x, p.y - hh, FLAME[4] if t < 0.25 else FLAME[3], _c01(1.0 - t / 0.7), 2, 2)
	# dust rolling out over the floor after the ring, low and slow, thinning
	if t > 0.12:
		var k := _c01((t - 0.12) / 1.2)
		for i in 44:
			var a := float(i) / 44.0 * TAU + _h(i, 11, 107) * 0.2
			var d := REACH * (0.5 + 0.6 * _h(i, 12, 107)) * _ease_out(k)
			var p: Vector2 = at.call(x + cos(a) * d, y + sin(a) * d)
			var hh := 3.0 + 10.0 * _h(i, 13, 107) * k
			_dot(c, p.x - 2, p.y - hh, ST5 if _h(i, 14, 107) < 0.5 else ST4, 0.6 * (1.0 - k), 4 + roundi(3 * _h(i, 15, 107)), 3)
