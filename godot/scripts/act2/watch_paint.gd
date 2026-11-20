## THE FLOOR THE WATCHMAN'S CHOP SPLITS, painted as the art paints it (art/action_f11_watch.ts bitePainted), line for line, a frame
## at a time: it runs on along the way he faced, any way, so it is painted here and not ahead (tools/godot_fx.ts has the rest of
## his: the lantern and its oil, which aim no way).
##   floor  the floor split from under the blade on along that way to CHOP.split tiles before him, jagged, gaping and black, its
##          lips the enemy's pink as it opens; a ring of dust and grit out to CHOP.r round the bite; cracks fading by CHOP.seen
##   air    the flash and sparks off the blade; stones and grit thrown up all along the split as it runs, falling; dust (by halves:
##          'behind', before a figure there, 'before', after it)
extends RefCounted

const GP := preload("res://scripts/act2/gp.gd")
const Canvas := preload("res://scripts/act2/canvas.gd")
const WA := preload("res://scripts/act2/watch.gd")

## (BITE_CANVAS)
const W := 380
const H := 260
const AX := 140.0
const AY := 120.0
## (OIL, PINK, STONE of the art)
const OIL: Array[Color] = [Color("#2a0e06"), Color("#5c1e0a"), Color("#a03a10"), Color("#e0661c"), Color("#ffa040"), Color("#ffd890"), Color("#fff4d0")]
const PINK: Array[Color] = [Color("#e0287a"), Color("#ff7aa8"), Color("#7a1058")]
const STONE: Array[Color] = [Color("#26222c"), Color("#3e3842"), Color("#5c5560"), Color("#7c7478"), Color("#a09890")]
const GAP := Color("#0c0a10")
const WHITE := Color("#fff6e8")


static func _c01(v: float) -> float:
	return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


static func _smooth(k: float) -> float:
	var v := _c01(k)
	return v * v * (3.0 - 2.0 * v)


## bitePainted: the bite `t` seconds after it, the way he faced `d` (a unit way on the floor), its layer and its side.
static func bite(t: float, layer: String, d: Vector2, side := "all") -> Dictionary:
	var C: Dictionary = WA.CHOP
	if t < 0.0 or t > float(C["seen"]):
		return {}
	var px := Canvas.new(W, H, AX, AY)
	var dx := d.x
	var dy := d.y
	var nx := -dy
	var ny := dx
	var bx: float = WA.BITE.x
	var run: float = float(C["split"]) - bx
	var at := func(a: float, b: float) -> Vector2:
		return px.tile(dx * a + nx * b, dy * a + ny * b)
	var fade := 1.0 - _smooth((t - (float(C["seen"]) - 0.5)) / 0.5)
	var ran := run * _c01(t / 0.16)
	var on_side := func(y: float) -> bool:
		return side == "all" or ((y > AY) == (side == "before"))
	if layer == "floor":
		# the split: a jagged gaping line on along his way, widest near the bite
		var a := -0.25
		while a <= ran:
			var w := (0.1 * (1.0 - a / (run + 0.3)) + 0.035) * (0.6 + 0.4 * fade)
			var wob := 0.09 * sin(a * 9.3 + 0.4) + 0.05 * sin(a * 23.0 + 1.1) + 0.03 * (GP.hash(GP.rnd(a * 40.0), 1, 1111) - 0.5)
			var b := -w
			while b <= w:
				var q: Vector2 = at.call(a, wob + b)
				px.pen(q.x, q.y, STONE[1] if absf(b) > w * 0.6 else GAP)
				b += 0.012
			# (its lips lit pink as it opens)
			if GP.hash(GP.rnd(a * 60.0), 2, 1113) < 0.75 * fade:
				for sd in [-1.0, 1.0]:
					var q: Vector2 = at.call(a, wob + sd * (w + 0.02))
					px.pen(q.x, q.y, PINK[1] if t < 0.4 else PINK[0], true)
					px.pen(q.x, q.y + 1.0, STONE[3], true)
			# (forks off it)
			if GP.rnd(a / 0.012) % 37 == 5:
				var sd := -1.0 if GP.hash(GP.rnd(a * 10.0), 3, 1115) < 0.5 else 1.0
				var k := 0.0
				while k < 0.4 * fade:
					var q: Vector2 = at.call(a + k * 0.6, wob + sd * (w + k))
					px.pen(q.x, q.y, GAP)
					k += 0.012
			a += 0.012
		# cracks starring out of the bite
		for i in 9:
			var a0 := (float(i) / 9.0) * TAU + GP.hash(i, 1, 1117)
			var L := float(C["r"]) * (0.4 + 0.5 * GP.hash(i, 2, 1117)) * _c01(t / 0.1)
			var u := 0.05
			while u < L:
				var a2 := a0 + 0.25 * sin(u * 7.0 + i)
				var q: Vector2 = at.call(cos(a2) * u, sin(a2) * u)
				if GP.hash(GP.rnd(q.x), GP.rnd(q.y), 1119) >= 1.0 - fade:
					px.pen(q.x, q.y, GAP if u < L * 0.5 else STONE[0])
				u += 0.012
		# the ring of dust and grit going out to its reach, its leading edge pink
		if t < 0.45:
			var k := 1.0 - pow(1.0 - _c01(t / 0.2), 2.0)
			px.mark_ring(float(C["r"]) * k, 1.0, PINK, 0.3)
			for i in 160:
				var a2 := GP.hash(i, 1, 1121) * TAU
				var dd := float(C["r"]) * k * (0.6 + 0.4 * sqrt(GP.hash(i, 2, 1121)))
				var q: Vector2 = at.call(cos(a2) * dd, sin(a2) * dd)
				if GP.hash(i, 3, 1121) < t / 0.45:
					continue
				px.pen(q.x, q.y, STONE[3] if i % 3 != 0 else STONE[2], true)
		return px.cut()
	# --- the air ---
	if t < 0.07 and side != "behind":
		px.blob(AX, AY - 3.0, 4.0 + 4.0 * (1.0 - t / 0.07), WHITE)
		for i in 14:
			var a := -PI * (0.1 + 0.8 * GP.hash(i, 1, 1123))
			var L := 8.0 + 18.0 * GP.hash(i, 2, 1123)
			var s := 2
			while s < L:
				px.pen(AX + cos(a) * s, AY - 3.0 + sin(a) * s, WHITE if s < L * 0.4 else (OIL[5] if i % 3 != 0 else PINK[1]))
				s += 1
	# stones and grit thrown up all along the split as it runs, falling
	for i in 70:
		var a := GP.hash(i, 1, 1125) * run
		var t0 := (a / maxf(0.01, run)) * 0.16
		var s := t - t0
		if s < 0.0 or s > 0.55:
			continue
		var b := (GP.hash(i, 2, 1125) - 0.5) * 0.5
		var q: Vector2 = at.call(a + b * 0.3, b)
		if not on_side.call(q.y):
			continue
		var up := (60.0 + 80.0 * GP.hash(i, 3, 1125)) * s - 260.0 * s * s
		if up < 0.0:
			continue
		var sz := 2 if i % 4 == 0 else 1
		var col: Color = PINK[1] if i % 5 == 0 else (STONE[4] if i % 2 != 0 else STONE[3])
		for n in sz * sz:
			px.pen(q.x + (n % sz) + b * 20.0 * s, q.y - up + floorf(float(n) / sz), col)
	# dust rising off it
	if t < 0.8:
		for i in 40:
			var a := GP.hash(i, 1, 1127) * run * _c01(t / 0.16)
			var q: Vector2 = at.call(a, (GP.hash(i, 2, 1127) - 0.5) * 0.5)
			if not on_side.call(q.y):
				continue
			var u := t / 0.8
			if GP.hash(i, 3, 1127) < u:
				continue
			px.blob(q.x + (GP.hash(i, 4, 1127) - 0.5) * 8.0 * u, q.y - 4.0 - 16.0 * u * GP.hash(i, 5, 1127), 1.5 + 2.0 * u, STONE[2] if i % 2 != 0 else STONE[3], 0.4, 1129, true)
	return px.cut()
