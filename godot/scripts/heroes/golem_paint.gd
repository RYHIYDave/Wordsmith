## THE GOLEM'S SHOTS THAT RUN ANY WAY, PAINTED AS THEY COME as the game paints them, line for line (each is painted for where it flies,
## so it cannot be painted once and kept): art/golem_shots_fx.ts (shellFlightPiece, beamPiece, along, goesLeft), dev/
## golem_charge_fx.ts (shellFlightFx, shellAt, shellSprite, beamFx, beamWidth, beamReach, line, disc), dev/golem_gun_fx.ts (bolt,
## jag, along, crackle, line, disc), dev/warlock_fx.ts (Light), dev/sculpt_warlock.ts (noise2), render/tinkerer_fx.ts (zapFrames):
##   THE SHELL IN FLIGHT   the huge iron shell banded in the friend's cyan, its nose lit, after-images smeared back along its way and
##                         a trail of cyan behind those, out of its mouth to where it lands, dropping as it goes; the trail thinning
##                         and gone a few frames after it lands. Frame k of n, anchored at the Golem's floor point as it fired.
##   THE BEAM              white-hot at its heart, cyan round it, its edge writhing, arcs coiling along it, a flare at its root and a
##                         splash where it ends; thinning, it frays to threads. Frame k from the shot, anchored at the Golem's floor
##                         point that frame (it skids back as the beam pours).
##   A TESLA COIL'S ZAP    a forked jag of lightning from the coil on the Golem's back to each it leaps to in turn, what it strikes
##                         crackling. Four frames, anchored at the Golem's foot.
## Each is {img: Image, ax, ay} in picture pixels (two to a game pixel), its anchor where the game lays it.
extends RefCounted

const GUN_GLOW := [Color("#0c6a80"), Color("#22d0e0"), Color("#b8fff8"), Color("#e8ffff")]
const IRON := [Color("#1c1a24"), Color("#4a4858"), Color("#7a7890"), Color("#c8c6dc")]
## (art/skeleton.ts GRID, the floor seen as the game sees it: sqrt(2 / 3), worked out as the game works it out, to the last bit;
## a tile UNITS_PER_TILE of the figures' measure)
static var GRID := sqrt(2.0 / 3.0)
static var T := 32.0 / GRID
const FX_GRAIN := 2.0
## (render/tinkerer_fx.ts) Where the coil sits on the Golem's back, and where the spark strikes what it hits (game pixels up).
const COIL_UP := 40.0
const STRUCK_UP := 14.0
const ZAP_N := 4
const SHELL_PAD := 30.0
const BEAM_PAD := 56.0

## (assets/heroes/golem.json `charge`: the art's frames and the shot's numbers, where its gun's mouth is)
var CH := {}


func _init(charge: Dictionary) -> void:
	CH = charge


## Pixels of light gathered before they are laid on: the hottest wins at each; none is left alone (dev/warlock_fx.ts Light). Kept
## on the picture's own grid, `w` by `h`: what falls off it is never laid, nor counted beside what is (the game's lays only what is
## two pixels in from its edge, and counts only such beside it).
class Light:
	var w := 0
	var h := 0
	## (each pixel's light, one more than its brightness; none, 0) and the pixels lit, in the order lit
	var lv := PackedByteArray()
	var lit := PackedInt32Array()

	func _init(cw: int, chh: int) -> void:
		w = cw
		h = chh
		lv.resize(w * h)

	func put(x: float, y: float, k: int) -> void:
		put_i(floori(x + 0.5), floori(y + 0.5), k)

	func put_i(x: int, y: int, k: int) -> void:
		if x < 0 or y < 0 or x >= w or y >= h:
			return
		var i := y * w + x
		var c := lv[i]
		if c == 0:
			lit.append(i)
			lv[i] = k + 1
		elif c < k + 1:
			lv[i] = k + 1

	## Laid on `data` (RGBA, of the same size) in `pal`: kept two pixels in from the edge; none left alone.
	func lay(data: PackedByteArray, pal: Array) -> void:
		var cols: Array = pal.map(func(c: Color): return [c.r8, c.g8, c.b8])
		for i in lit:
			var x := i % w
			var y := i / w
			if x < 2 or y < 2 or x > w - 3 or y > h - 3:
				continue
			if not ((x > 2 and lv[i - 1] != 0) or (x < w - 3 and lv[i + 1] != 0) or (y > 2 and lv[i - w] != 0) or (y < h - 3 and lv[i + w] != 0)):
				continue
			var c: Array = cols[lv[i] - 1]
			var o := i * 4
			data[o] = c[0]
			data[o + 1] = c[1]
			data[o + 2] = c[2]
			data[o + 3] = 255


# ---- THE PAINTERS' OWN SMALL HELPERS -------------------------------------------------------------------------------------

static func _frac(v: float) -> float:
	return v - floorf(v)


## (dev/golem_gun_fx.ts hash)
static func hash_gun(i: float) -> float:
	return _frac(sin(i * 91.3 + 17.1) * 43758.5453)


## (dev/golem_charge_fx.ts hash)
static func hash_charge(i: float) -> float:
	return _frac(sin(i * 57.31 + 23.7) * 43758.5453)


## (dev/sculpt_warlock.ts noise2) A smooth noise in [0, 1].
static func noise2(x: float, y: float) -> float:
	var i := floorf(x)
	var j := floorf(y)
	var fx := x - i
	var fy := y - j
	var sx := fx * fx * (3.0 - 2.0 * fx)
	var sy := fy * fy * (3.0 - 2.0 * fy)
	var h00 := _frac(sin(i * 127.1 + j * 311.7) * 43758.5453)
	var h10 := _frac(sin((i + 1.0) * 127.1 + j * 311.7) * 43758.5453)
	var h01 := _frac(sin(i * 127.1 + (j + 1.0) * 311.7) * 43758.5453)
	var h11 := _frac(sin((i + 1.0) * 127.1 + (j + 1.0) * 311.7) * 43758.5453)
	var a := h00 + (h10 - h00) * sx
	var b := h01 + (h11 - h01) * sx
	return a + (b - a) * sy


## (Math.hypot) How long a step of (a, b) is, in full precision (Godot's vectors are single: the game's sizes come to the last bit).
static func _hyp(a: float, b: float) -> float:
	return sqrt(a * a + b * b)


## A line of light from (x0, y0) to (x1, y1), `k` bright, `w` across (the same in both painters). (A square of `w` laid at each
## step; a step that rounds to where the last did lays nothing new.)
static func line(l: Light, x0: float, y0: float, x1: float, y1: float, k: int, w := 1) -> void:
	if w <= 0:
		return
	var n := maxi(1, ceili(_hyp(x1 - x0, y1 - y0)))
	var c := w >> 1
	var lx := 1 << 30
	var ly := 1 << 30
	for i in n + 1:
		var rx := floori(x0 + (x1 - x0) * i / n + 0.5)
		var ry := floori(y0 + (y1 - y0) * i / n + 0.5)
		if rx == lx and ry == ly:
			continue
		lx = rx
		ly = ry
		for a in w:
			for b in w:
				l.put_i(rx + a - c, ry + b - c, k)


## (dev/golem_charge_fx.ts disc) A round of light at (x, y), `r` across, `top` at its heart, fading to its edge.
static func disc_charge(l: Light, x: float, y: float, r: float, top := 3, squash := 1.0) -> void:
	var rx := floori(x + 0.5)
	var ry := floori(y + 0.5)
	for yy in range(floori(-r * squash), ceili(r * squash) + 1):
		for xx in range(floori(-r), ceili(r) + 1):
			var d := _hyp(xx, yy / squash) / maxf(0.5, r)
			if d > 1.0:
				continue
			l.put_i(rx + xx, ry + yy, clampi(floori(top - d * top * 0.9 + 0.5), 0, top))


## A jag of lightning from (x0, y0) to (x1, y1), its path broken up anew with each `seed`: its points [x, y] (dev/golem_gun_fx.ts jag).
static func jag(x0: float, y0: float, x1: float, y1: float, seed: float, rough: float) -> Array:
	var pts: Array = [[x0, y0], [x1, y1]]
	var r := rough * _hyp(x1 - x0, y1 - y0)
	for ps in 5:
		var out: Array = [pts[0]]
		for i in range(1, pts.size()):
			var ax: float = pts[i - 1][0]
			var ay: float = pts[i - 1][1]
			var bx: float = pts[i][0]
			var by: float = pts[i][1]
			var len := _hyp(bx - ax, by - ay)
			if len == 0.0:
				len = 1.0
			var off := (hash_gun(seed * 13.0 + ps * 101.0 + i * 7.0) - 0.5) * 2.0 * r
			out.append([(ax + bx) / 2.0 + (-(by - ay) / len) * off, (ay + by) / 2.0 + ((bx - ax) / len) * off])
			out.append(pts[i])
		pts = out
		r *= 0.55
	return pts


## A path of light along points: a white core `core` wide, cyan round it.
static func along(l: Light, pts: Array, core: int, glow: bool) -> void:
	for i in range(1, pts.size()):
		var a: Array = pts[i - 1]
		var b: Array = pts[i]
		if glow:
			line(l, a[0], a[1], b[0], b[1], 1, core + 2)
		line(l, a[0], a[1], b[0], b[1], 2, core + 1)
		line(l, a[0], a[1], b[0], b[1], 3, core)


## THE BOLT from (x0, y0) to (x1, y1): a forked jag of lightning, white-hot at its core, cyan round it, forks spitting off it that
## die out; `k` its frame (0 the brightest).
static func bolt(l: Light, x0: float, y0: float, x1: float, y1: float, seed: float, k := 0) -> void:
	var pts := jag(x0, y0, x1, y1, seed, 0.16)
	along(l, pts, 2 if k == 0 else 1, k < 2)
	var forks := 4 if k == 0 else 2
	for i in forks:
		var at: Array = pts[floori((0.2 + 0.6 * hash_gun(seed * 3.0 + i)) * (pts.size() - 1))]
		var a := atan2(y1 - y0, x1 - x0) + (1.0 if hash_gun(seed * 5.0 + i) < 0.5 else -1.0) * (0.5 + 0.6 * hash_gun(seed * 7.0 + i))
		var len := 8.0 + 12.0 * hash_gun(seed * 9.0 + i)
		var fp := jag(at[0], at[1], at[0] + cos(a) * len, at[1] + sin(a) * len, seed * 17.0 + i, 0.3)
		for j in range(1, fp.size()):
			line(l, fp[j - 1][0], fp[j - 1][1], fp[j][0], fp[j][1], 2 if j < fp.size() * 0.5 else 1, 1)


## CRACKLING round (x, y), `r` out: little arcs leaping about it, `n` of them.
static func crackle(l: Light, x: float, y: float, r: float, n: int, seed: float) -> void:
	for i in n:
		var a := hash_gun(seed * 3.0 + i) * PI * 2.0
		var a2 := a + (hash_gun(seed * 5.0 + i) - 0.5) * 1.6
		var r0 := r * (0.25 + 0.3 * hash_gun(seed * 7.0 + i))
		var r1 := r * (0.75 + 0.35 * hash_gun(seed * 11.0 + i))
		var pts := jag(x + cos(a) * r0, y + sin(a) * r0, x + cos(a2) * r1, y + sin(a2) * r1, seed * 19.0 + i, 0.35)
		for j in range(1, pts.size()):
			line(l, pts[j - 1][0], pts[j - 1][1], pts[j][0], pts[j][1], 2 if j < pts.size() / 2.0 else 1, 1)


# ---- THE FLOOR AS THE GAME SEES IT (points kept as [x, y, z] of full-precision numbers) ----------------------------------

## A point of the world (figure units: x and y along the floor, z up) to the picture, its floor point at (ax, ay): [x, y].
static func S(p: Array, ax := 0.0, ay := 0.0) -> Array:
	var a: float = p[0]
	var b: float = p[1]
	return [ax + GRID * (a + b), ay + GRID * 0.5 * (a - b) - float(p[2])]


static func from_tiles(dx: float, dy: float, z := 0.0) -> Array:
	return [dx * T, -dy * T, z]


## A point seen in the mirror the game turns a picture over in: the picture's x the other way.
static func mirror(p: Array) -> Array:
	return [-float(p[1]), -float(p[0]), float(p[2])]


static func _mix(a: Array, b: Array, u: float) -> Array:
	return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]


static func _even(v: float) -> int:
	return 2 * floori(v / 2.0 + 0.5)


## Whether the line from `a` to `b` runs to the left of the picture (straight up or down it: whether the picture is turned over).
static func goes_left(a: Array, b: Array, flip: bool) -> bool:
	var d: float = S(b)[0] - S(a)[0]
	return d < -1e-6 or (d <= 1e-6 and flip)


## The gun's mouth (baked in the figures' own measure) in the world, turned over as the picture is.
func _mouth(gun: String, view: String, k: int, flip: bool) -> Array:
	var list: Array = CH["muzzle"]["%s:%s" % [gun, view]]
	var m: Array = list[clampi(k, 0, list.size() - 1)]
	var p: Array = [float(m[0]), float(m[1]), float(m[2])]
	return mirror(p) if flip else p


## (art/golem_shots_fx.ts along) A canvas round the points (its floor point the anchor), `pad` all round, painted by `paint`
## (iron and light); run to the left, painted as it runs to the right and the picture turned over.
func _along(pts: Array, pad: float, left: bool, paint: Callable) -> Dictionary:
	var use: Array = pts.map(func(p): return mirror(p)) if left else pts
	var xs: Array = []
	var ys: Array = []
	for p in use:
		for q in [S(p), S([p[0], p[1], 0.0])]:
			xs.append(q[0])
			ys.append(q[1])
	var x0 := _even(floorf(xs.min()) - pad - 1.0)
	var y0 := _even(floorf(ys.min()) - pad - 1.0)
	var x1 := ceili(xs.max()) + int(pad)
	var y1 := ceili(ys.max()) + int(pad)
	var w := _even(x1 - x0 + 2)
	var h := _even(y1 - y0 + 2)
	var ax := -x0
	var ay := -y0
	var iron := Light.new(w, h)
	var l := Light.new(w, h)
	paint.call(iron, l, float(ax), float(ay), use)
	var data := PackedByteArray()
	data.resize(w * h * 4)
	iron.lay(data, IRON)
	l.lay(data, GUN_GLOW)
	var img := Image.create_from_data(w, h, false, Image.FORMAT_RGBA8, data)
	if left:
		img.flip_x()
		ax = w - 1 - ax
	return {"img": img, "ax": ax, "ay": ay}


# ---- THE CANNON'S SHELL --------------------------------------------------------------------------------------------------

## Where the shell is `u` of its flight: straight out of the level barrel, dropping as it goes.
static func shell_at(fired: Array, aim: Array, u: float) -> Array:
	var p := _mix(fired, aim, u)
	return [p[0], p[1], float(fired[2]) * (1.0 - u * u) + float(aim[2]) * u * u]


## THE HUGE SHELL at (x, y) flying the way (dx, dy) on the picture: iron, long, banded in the friend's cyan, its nose lit.
static func shell_sprite(l: Light, iron: Light, x: float, y: float, dx: float, dy: float) -> void:
	var len := 13.0
	var r := 7.2
	var rx := floori(x + 0.5)
	var ry := floori(y + 0.5)
	for yy in range(-20, 21):
		for xx in range(-20, 21):
			var al := xx * dx + yy * dy
			var across := -xx * dy + yy * dx
			var t := maxf(-len, minf(len * 0.5, al))
			var d := _hyp(al - t, across)
			var nose := _hyp((al - len * 0.5) * 1.15, across) if al > len * 0.5 else d
			if maxf(d, nose) > r or al < -len - 0.5:
				continue
			if absf(al + 2.0) < 1.6 or absf(al + 8.0) < 1.1:
				l.put_i(rx + xx, ry + yy, 3 if across < -1.5 else 2)
				continue
			iron.put_i(rx + xx, ry + yy, 3 if across < -4.0 else (2 if across < 0.5 else (1 if across < 4.5 else 0)))
	disc_charge(l, x + dx * (len * 0.5 + 5.0), y + dy * (len * 0.5 + 5.0), 2.2, 3)


## (art/golem_shots_fx.ts golemShellFlightFx) How many frames its flight is painted over: the game's own flight.
static func shell_n(flight: float) -> int:
	return maxi(2, roundi(maxf(1.0, roundf(flight * 30.0))))


## THE SHELL IN FLIGHT, `k` frames after it fired (its flight `n` frames), for a Golem drawn in `view` (turned over if `flip`), the
## landing (dx, dy) tiles from its floor point: {img, ax, ay}, or {} for nothing.
func shell_flight(view: String, flip: bool, dx: float, dy: float, k: int, n: int) -> Dictionary:
	if k < 0 or k > n + 3:
		return {}
	var a := _mouth("cannon", view, 0, flip)
	var b := from_tiles(dx, dy, 0.0)
	return _along([a, b], SHELL_PAD, goes_left(a, b, flip), func(iron: Light, l: Light, ax: float, ay: float, use: Array) -> void:
		var fired: Array = use[0]
		var aim: Array = use[1]
		var u := minf(1.0, (k + 1.0) / n)
		var now := S(shell_at(fired, aim, u), ax, ay)
		var ahead := S(shell_at(fired, aim, minf(1.0, u + 0.02)), ax, ay)
		var back := S(shell_at(fired, aim, maxf(0.0, u - 0.02)), ax, ay)
		var ddx: float = ahead[0] - back[0]
		var ddy: float = ahead[1] - back[1]
		var dn := _hyp(ddx, ddy)
		if dn == 0.0:
			dn = 1.0
		ddx /= dn
		ddy /= dn
		# (its trail: bright behind it, thinning)
		var tail := maxf(0.0, u - 0.7)
		var fade := (k - n + 1.0) / 4.0 if k >= n else 0.0
		var steps := 24
		for i in steps:
			var pa := S(shell_at(fired, aim, tail + (u - tail) * i / steps), ax, ay)
			var pb := S(shell_at(fired, aim, tail + (u - tail) * (i + 1) / steps), ax, ay)
			var near := float(i) / steps
			if near < fade:
				continue
			var w := 9 if near > 0.75 else (7 if near > 0.45 else (5 if near > 0.2 else 3))
			line(l, pa[0], pa[1], pb[0], pb[1], 1, w)
			if near > 0.25 and fade < 0.5:
				line(l, pa[0], pa[1], pb[0], pb[1], 2, w - 3)
			if near > 0.6 and fade < 0.5:
				line(l, pa[0], pa[1], pb[0], pb[1], 3, 2)
		if k >= n:
			return
		# (THE SMEAR: after-images of it back along its way, the furthest dimmest)
		for gl in [[0.2, 1], [0.13, 1], [0.07, 2]]:
			var p := S(shell_at(fired, aim, maxf(0.0, u - float(gl[0]))), ax, ay)
			disc_charge(l, p[0], p[1], 7.5, int(gl[1]))
		shell_sprite(l, iron, now[0], now[1], ddx, ddy))


# ---- THE TESLA COIL'S BEAM -----------------------------------------------------------------------------------------------

## How thick the beam is at frame `f` (0 to 1 of its full): out at once as it fires, held, thinning to nothing.
func beam_width(f: int) -> float:
	var C: Dictionary = CH["C"]
	var B: Dictionary = CH["beam"]
	var k := f - int(C["fire"])
	if k < 0 or f >= int(B["gone"]):
		return 0.0
	if k == 0:
		return 0.75
	if f <= int(B["held"]):
		return 1.0 + 0.08 * sin(k * 2.2)
	var u := float(f - int(B["held"])) / float(int(B["gone"]) - int(B["held"]))
	return maxf(0.0, pow(1.0 - u, 1.6))


## How far out the beam reaches at frame `f`: two-thirds out as it fires, all of it the frame after.
func beam_reach(f: int) -> float:
	var k := f - int(CH["C"]["fire"])
	return 0.0 if k < 0 else (0.62 if k == 0 else 1.0)


## (dev/golem_charge_fx.ts beamFx) THE BEAM from (x0, y0) to (x1, y1) on the picture, `w` pixels thick, at frame `f`.
static func beam_fx(l: Light, x0: float, y0: float, x1: float, y1: float, w: float, f: int, thinning: bool) -> void:
	var len := _hyp(x1 - x0, y1 - y0)
	if len == 0.0:
		len = 1.0
	var ux := (x1 - x0) / len
	var uy := (y1 - y0) / len
	var nx := -uy
	var ny := ux
	if w >= 3.0:
		var s := 0.0
		while s <= len:
			var root := minf(1.0, 0.55 + s / 30.0)
			var wob := noise2(s * 0.09 - f * 1.7, f * 0.31) - 0.5
			var half := (w / 2.0) * root * (1.0 + wob * 0.35)
			var cx := x0 + ux * s
			var cy := y0 + uy * s
			var hm := maxf(0.5, half)
			var a := -half - 1.0
			# (across it a half pixel at a time; the same pixel at the same brightness twice in a row is laid once)
			var lx := 1 << 30
			var ly := 1 << 30
			var lk := -1
			while a <= half + 1.0:
				var q := absf(a) / hm
				if q <= 1.05:
					var px := floori(cx + nx * a + 0.5)
					var py := floori(cy + ny * a + 0.5)
					var k := 3 if q < 0.32 else (2 if q < 0.62 else 1)
					if px != lx or py != ly or k != lk:
						l.put_i(px, py, k)
						lx = px
						ly = py
						lk = k
				a += 0.5
			s += 0.5
	# (arcs coiling along it, and off it, broken anew each frame)
	var arcs := 3 if thinning else 5
	for i in arcs:
		var s0 := fposmod(float(i) / arcs + f * 0.07, 1.0) * len
		var s1 := minf(len, s0 + 24.0 + 16.0 * hash_charge(f * 3.0 + i))
		var side := 1.0 if (i + f) % 2 != 0 else -1.0
		var off := (w / 2.0 + 2.0) * side
		var off2 := (w / 2.0 + 2.0) * -side
		bolt(l, x0 + ux * s0 + nx * off, y0 + uy * s0 + ny * off, x0 + ux * s1 + nx * off2, y0 + uy * s1 + ny * off2, 3000.0 + f * 7.0 + i, 1 if thinning else 0)
	if thinning:
		# (frayed to threads: two jags of lightning down its length)
		for i in 2:
			bolt(l, x0, y0, x1 + nx * (4.0 if i else -4.0), y1 + ny * (4.0 if i else -4.0), 5000.0 + f * 11.0 + i, 0 if w > 4.0 else 1)
	# (its root's flare and the splash where it ends)
	disc_charge(l, x0, y0, maxf(3.0, w * 0.75), 3)
	if not thinning or w > 4.0:
		disc_charge(l, x1, y1, maxf(3.0, w * 0.6), 3)
		for i in 7:
			var a := atan2(uy, ux) + (hash_charge(f * 5.0 + i) - 0.5) * 2.6
			var r := w * 0.6 + 6.0 + 8.0 * hash_charge(f * 7.0 + i)
			line(l, x1, y1, x1 + cos(a) * r, y1 + sin(a) * r, 2, 1)


## THE BEAM, `k` frames after it fires, to (dx, dy) tiles from the Golem's floor point, its end `up` game pixels high: {} for none.
func beam(view: String, flip: bool, dx: float, dy: float, k: int, up := -1.0) -> Dictionary:
	if up < 0.0:
		up = float(CH["beamEndUp"])
	var f := int(CH["C"]["fire"]) + k
	var w := beam_width(f)
	if k < 0 or w <= 0.0:
		return {}
	var a := _mouth("tesla", view, k, flip)
	var b := from_tiles(dx, dy, up * FX_GRAIN)
	var held: int = CH["beam"]["held"]
	var drawn: float = CH["beamFx"]["drawn"]
	return _along([a, b], BEAM_PAD, goes_left(a, b, flip), func(_iron: Light, l: Light, ax: float, ay: float, use: Array) -> void:
		var ma: Array = use[0]
		var mb: Array = use[1]
		var reach := beam_reach(f)
		var m := S(ma, ax, ay)
		var e := S([ma[0] + (mb[0] - ma[0]) * reach, ma[1] + (mb[1] - ma[1]) * reach, ma[2] + (mb[2] - ma[2]) * reach], ax, ay)
		beam_fx(l, m[0], m[1], e[0], e[1], maxf(1.5, drawn * T * w), f, f > held))


## (dev/golem_moves.ts chargeSkid) How far back its shot has thrown it `k` frames after (tiles).
func skid(kind: String, k: int) -> float:
	if k <= 0:
		return 0.0
	var C: Dictionary = CH["C"]
	var long: int = (int(CH["shell"]["skidded"]) if kind == "shell" else int(CH["beam"]["gone"])) - int(C["fire"])
	var u := minf(1.0, float(k) / long)
	var e := 1.0 - pow(1.0 - u, 3.0) if kind == "shell" else 1.0 - pow(1.0 - u, 2.0)
	return float(CH["skid"][kind]) * e


# ---- A TESLA COIL'S ZAP --------------------------------------------------------------------------------------------------

## (render/tinkerer_fx.ts zapFrames) Its four frames: a bolt from the coil on the back of the Golem at (x, y) (`up` high) to each it
## leaps to in turn, what it strikes crackling. Anchored at the Golem's foot.
static func zap(x: float, y: float, up: float, to: Array) -> Array:
	var at := func(px: float, py: float, z: float) -> Array:
		return [((px - py) - (x - y)) * 16.0 * FX_GRAIN, (((px + py) - (x + y)) * 8.0 - z) * FX_GRAIN]
	var pts: Array = [at.call(x, y, up)]
	for p in to:
		pts.append(at.call(float(p["x"]), float(p["y"]), STRUCK_UP))
	var pad := 40.0
	var xs: Array = pts.map(func(p): return p[0])
	var ys: Array = pts.map(func(p): return p[1])
	var x0: float = xs.min() - pad
	var y0: float = ys.min() - pad
	var w := ceili(xs.max() + pad - x0)
	var h := ceili(ys.max() + pad - y0)
	var seed := floorf(absf(x * 7.0 + y * 13.0) * 10.0)
	var out: Array = []
	for k in ZAP_N:
		var l := Light.new(w, h)
		for i in range(1, pts.size()):
			if k < 3:
				bolt(l, pts[i - 1][0] - x0, pts[i - 1][1] - y0, pts[i][0] - x0, pts[i][1] - y0, seed + k * 31.0 + i, k)
			crackle(l, pts[i][0] - x0, pts[i][1] - y0, 12.0, 5 if k < 2 else 3, seed + k * 17.0 + i * 5.0)
		crackle(l, pts[0][0] - x0, pts[0][1] - y0, 8.0, 3, seed + k * 23.0)
		var data := PackedByteArray()
		data.resize(w * h * 4)
		l.lay(data, GUN_GLOW)
		out.append({"img": Image.create_from_data(w, h, false, Image.FORMAT_RGBA8, data), "ax": -x0, "ay": -y0})
	return out
