## THE STORM CLOUDS, MADE AGAIN (his words, 23 Nov 2026: “I've never liked those clouds so if you want to change them do it”).
## The game's thunderclouds were a heap of flat ovals (fx_wakes.gd draw_air, fx_melds3.gd _cloud, fx_m52p_vast.gd _cloud): his Art
## Rulebook says an effect is "shaped as the thing it is, never a plain ball, box or ring" (How art is made 9). Here a cloud is one
## mass: billows heaped on a flat, ragged base, each billow lit from the upper left (Pixels 4) with a silver edge where the light
## catches its top, darker where one billow sits in front of another, a dark belly; the lightning glows INSIDE one billow and its
## neighbours, and the underside catches it; rain hangs under it. Pixel by pixel on the game's grain, nothing smoothed (Pixels 1).
## Behind the switch ON, off until his yes to its pictures (pictures first). `--clouds2=1` films it on.
extends RefCounted

static var ON := false

## (what was drawn last, a few frames' worth: a cloud is worked out at most fifteen times a second)
static var _cache := {}


static func _h(a: int, b: int, c: int) -> float:
	var x := (a * 374761393 + b * 668265263 + c * 2147483647) & 0x7fffffff
	x = ((x ^ (x >> 13)) * 1274126177) & 0x7fffffff
	return float(x % 100000) / 100000.0


## Draws one cloud. `rect` is the painter's own pixel brush: rect(x, y, w, h, colour, alpha), in game pixels. (cx, cy) is the
## cloud's middle on the screen; `wide` its half-width; `born` 0 to 1 as it forms, `going` 1 to 0 as it thins; `al` its strength.
## C: its greys, darkest first: deep, belly, mid, top, edge. L: the lightning's glow, light and core, or [] for none; `struck` which
## part of the cloud the lightning is in now, 0 to 1, or -1. `rain` how far its rain falls, 0 for none.
static func draw(rect: Callable, cx: float, cy: float, wide: float, t: float, seed: int, born: float, going: float, al: float,
		C: Array, L: Array, struck: float, rain: float) -> void:
	if al <= 0.01 or wide < 2.0:
		return
	var frame := floori(t * 15.0)
	var key := "%d:%d:%d:%d:%d:%d" % [seed, frame, roundi(cx), roundi(cy), roundi(wide * 4.0), roundi(struck * 100.0)]
	var runs: Array = _cache.get(key, [])
	if runs.is_empty():
		runs = _runs(cx, cy, wide, float(frame) / 15.0, seed, born, going, C, L, struck)
		if _cache.size() > 96:
			_cache.clear()
		_cache[key] = runs
	for r: Array in runs:
		rect.call(r[0], r[1], r[2], 1.0, r[3], al)
	# (rain: thin slanting streaks falling from its base, always moving)
	if rain > 0.0:
		var base := cy + wide * 0.12 + 3.0
		var n := clampi(int(wide * 0.8), 4, 18)
		for i in n:
			var v := fmod(t * 1.7 + _h(seed, i, 7), 1.0)
			var x := cx + (_h(seed, i, 8) - 0.5) * wide * 1.6 - v * 6.0
			var y := base + 2.0 + v * rain
			var a := al * 0.55 * (1.0 - v * 0.6)
			rect.call(floorf(x + 0.5), floorf(y + 0.5), 1.0, 3.0, C[3], a)
			rect.call(floorf(x + 0.5) - 1.0, floorf(y + 0.5) + 3.0, 1.0, 1.0, C[2], a)


## The cloud's pixels as runs along each row: [x, y, w, colour].
static func _runs(cx: float, cy: float, wide: float, t: float, seed: int, born: float, going: float, C: Array, L: Array, struck: float) -> Array:
	var grow := (0.4 + 0.6 * born) * (0.5 + 0.5 * going)
	var n := clampi(int(wide / 5.0) + 2, 3, 8)
	var base := cy + wide * 0.12 + 3.0
	# its billows, heaped highest in the middle and sitting on the base, each turning and swelling a little
	var lx := PackedFloat32Array()
	var ly := PackedFloat32Array()
	var lr := PackedFloat32Array()
	for i in n:
		var v := float(i) / float(n - 1)
		var dome := sin(v * PI)
		var churn := t * (0.6 + _h(seed, i, 6) * 0.5) + i * 2.1
		var r := (wide * 0.30 + wide * 0.26 * dome) * (0.85 + 0.3 * _h(seed, i, 3)) * grow + sin(churn * 1.3) * 0.7
		r = maxf(2.0, r)
		lx.append(cx + (v - 0.5) * 2.0 * wide * (0.55 + 0.45 * born) * 0.82 + sin(churn) * 1.5 + (_h(seed, i, 1) - 0.5) * wide * 0.2)
		ly.append(base - r * 0.62 - dome * wide * 0.16 * grow + cos(churn * 0.8) * 0.8)
		lr.append(r)
	# (a second, smaller tier heaped on top, between the billows below: the cauliflower top of a thundercloud)
	for i in n - 1:
		var rs := minf(lr[i], lr[i + 1]) * (0.5 + 0.15 * _h(seed, i, 11))
		lx.append((lx[i] + lx[i + 1]) * 0.5 + (_h(seed, i, 12) - 0.5) * rs * 0.6)
		ly.append(minf(ly[i], ly[i + 1]) - rs * (0.55 + 0.2 * _h(seed, i, 13)) + sin(t * 0.9 + i) * 0.6)
		lr.append(rs)
	var m := lx.size()
	var x0 := 1e9
	var x1 := -1e9
	var y0 := 1e9
	for i in m:
		x0 = minf(x0, lx[i] - lr[i] * 1.2)
		x1 = maxf(x1, lx[i] + lr[i] * 1.2)
		y0 = minf(y0, ly[i] - lr[i] * 1.2)
	var gx0 := floori(x0) - 1
	var gy0 := floori(y0) - 1
	var gw := ceili(x1) - gx0 + 2
	var gh := ceili(base) + 2 - gy0
	if gw <= 0 or gh <= 0 or gw * gh > 20000:
		return []
	# which billow each pixel is of (the one nearest the front, lowest), 0 for none; and how deep into it
	var who := PackedInt32Array()
	who.resize(gw * gh)
	var deep := PackedFloat32Array()
	deep.resize(gw * gh)
	var bx0 := lx[0]
	var bx1 := lx[n - 1]
	for gy in gh:
		var y := float(gy0 + gy) + 0.5
		for gx in gw:
			var x := float(gx0 + gx) + 0.5
			var best := -1
			var bd := 0.0
			for i in m:
				var dx := x - lx[i]
				var dy := (y - ly[i]) * 1.12
				var d2 := dx * dx + dy * dy
				if d2 > lr[i] * lr[i] * 1.44:
					continue
				# (its edge billowing in and out, never a clean circle)
				var th := atan2(dy, dx)
				var rr := lr[i] * (1.0 + 0.11 * sin(3.0 * th + _h(seed, i, 14) * 6.0 + t * 0.7) + 0.06 * sin(7.0 * th + _h(seed, i, 15) * 6.0))
				if d2 <= rr * rr:
					if best < 0 or ly[i] > ly[best]:
						best = i
						bd = 1.0 - sqrt(d2) / rr
			# (the flat base the billows sit on, its edge ragged, breaking up as it moves)
			if best < 0 and y >= base - 3.0 and y <= base and x >= bx0 and x <= bx1:
				best = int(clampf((x - bx0) / maxf(1.0, bx1 - bx0) * (n - 1) + 0.5, 0.0, n - 1))
				bd = 0.15
			var rag := 1.0 if _h(gx0 + gx, floori(t * 3.0), seed) > 0.72 else 0.0
			if best >= 0 and y > base + rag:
				best = -1
			who[gy * gw + gx] = best + 1
			deep[gy * gw + gx] = bd
	var lit_i := int(struck * n) if struck >= 0.0 and not L.is_empty() else -9
	# (the bolt crawling through the lit billow: a jagged line across it, a new one each flicker)
	var bolt := PackedVector2Array()
	if lit_i >= 0:
		var bi := clampi(lit_i, 0, n - 1)
		var k := floori(t * 15.0)
		for j in 5:
			var v := float(j) / 4.0
			bolt.append(Vector2(lx[bi] + (v - 0.5) * lr[bi] * 1.5, ly[bi] + (_h(seed, k * 7 + j, 16) - 0.4) * lr[bi] * 0.8))
	var runs: Array = []
	for gy in gh:
		var y := gy0 + gy
		var run_x := 0
		var run_c := Color(0, 0, 0, 0)
		var run_w := 0
		for gx in gw + 1:
			var col := Color(0, 0, 0, 0)
			if gx < gw:
				var w := who[gy * gw + gx]
				if w > 0:
					var i := w - 1
					var d := deep[gy * gw + gx]
					var nx := (float(gx0 + gx) + 0.5 - lx[i]) / lr[i]
					var ny := (float(y) + 0.5 - ly[i]) / lr[i]
					var lit := -(nx * 0.6 + ny * 0.8)
					var high := clampf((base - float(y)) / maxf(1.0, base - y0), 0.0, 1.0)
					var s := lit * 0.7 + high * 0.6 + 0.05
					var up_left := gx > 0 and gy > 0 and who[(gy - 1) * gw + gx - 1] == 0
					var up := gy > 0 and who[(gy - 1) * gw + gx] == 0
					# (the silver edge two pixels deep where the light catches a billow's top)
					var up2 := gy > 1 and who[(gy - 2) * gw + gx] == 0 and lit > 0.0
					# (a seam where this billow sits in front of another)
					var seam := d < 0.14 and gy > 0 and who[(gy - 1) * gw + gx] != 0 and who[(gy - 1) * gw + gx] != w
					if float(y) >= base - 1.0:
						col = C[0] if float(y) >= base else C[1]
					elif seam:
						col = C[1]
					elif (up_left or up or up2) and s > 0.05:
						col = C[4]
					elif s > 0.45:
						col = C[3]
					elif s > 0.05:
						col = C[2]
					elif s > -0.35:
						col = C[1]
					else:
						col = C[0]
					# the lightning inside: its billow glowing from within, its neighbours a little, the bolt crawling through it
					if i == lit_i and d > 0.12:
						col = col.lerp(L[0], 0.75 + 0.25 * d)
					elif i < n and absi(i - lit_i) == 1 and d > 0.3:
						col = col.lerp(L[0], 0.45)
					if bolt.size() > 1 and i == lit_i:
						var px := Vector2(float(gx0 + gx) + 0.5, float(y) + 0.5)
						var bd2 := 99.0
						for j in bolt.size() - 1:
							bd2 = minf(bd2, Geometry2D.get_closest_point_to_segment(px, bolt[j], bolt[j + 1]).distance_to(px))
						if bd2 < 1.0:
							col = L[2]
						elif bd2 < 2.2:
							col = L[1]
					# and the underside under it catches the light
					if lit_i >= 0 and float(y) >= base - 1.0 and absf(float(gx0 + gx) - lx[clampi(lit_i, 0, n - 1)]) < lr[clampi(lit_i, 0, n - 1)] * 0.8:
						col = L[1]
			if col != run_c or gx == gw:
				if run_w > 0 and run_c.a > 0.0:
					runs.append([float(gx0 + run_x), float(y), float(run_w), run_c])
				run_x = gx
				run_c = col
				run_w = 1
			else:
				run_w += 1
	return runs
