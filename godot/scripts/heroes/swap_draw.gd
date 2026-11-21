## THE MAGE'S AND THE RANGER'S MOVES TO LEARN, THEIR LOOKS (render/swap_fx.ts, line for line; render/fx.ts drawRay, holdBeam), drawn at
## the game's grain (a tile 32 by 16 of its pixels; two screen pixels to one of its) in the spell tones her magic is drawn in
## (art/spells.ts SPELL_TONES), his in rope and the friend's cyan:
##   BALL     a comet: a small dense head, white at its heart, a long ragged tail of her colour, sparks shed behind; where it strikes, a
##            SPLASH: a flash, a ring of its light across the floor, drops flung up and falling;
##   SPEAR    a crystal lance: a long cut crystal of her magic, its lit face pale and the other deep, a white ridge, a glint running
##            along it, shards trailing;
##   BEAM     held, a line of her light from the wand to the first wall, coming in thin to full, held, thinning away when let go;
##   SNARE    a loop of rope flying out spinning to where it lands, then lying open, its twist, knot and peg, a glint of cyan while set;
##   SNIPE    while he draws: a ring on the floor filling like a clock in three steps, each a pulse; his aim along the floor; light
##            rising off him; streaks drawn in to the arrowhead; at full a glint, then a twinkle; loosed, a whoosh off the bow and the
##            arrow drawn in light, longer and broader, its streak thicker, the fuller the draw;
##   RALLY    rings of cyan going out from him as he calls, his call's light bursting round him.
## One of these is made by a look (heroes/mage_look.gd, ranger_look.gd) with the canvas it draws on and the effects' camera.
extends RefCounted

const Talents := preload("res://scripts/talents.gd")

var c: CanvasItem
var fx
const ROPE := [Color("#4a2c1a"), Color("#7e4f2c"), Color("#b67e4a")]
var C: Array = []
var _a := 1.0


func _init(canvas: CanvasItem, effects) -> void:
	c = canvas
	fx = effects
	Talents.ready_up()
	var cy: Array = Talents.D["cyan"]
	C = [Color(cy[0]), Color(cy[2]), Color(cy[3]), Color.WHITE]


func tones(el: String) -> Array:
	var st: Dictionary = Talents.D["spellTones"]
	return (st.get(el, st["phys"]) as Array).map(func(x): return Color(x))


func gx(x: float, y: float) -> float:
	return fx.gx(x, y) if fx != null and is_instance_valid(fx) else (x - y) * 16.0


func gy(x: float, y: float) -> float:
	return fx.gy(x, y) if fx != null and is_instance_valid(fx) else (x + y) * 8.0


func alpha(a: float) -> void:
	_a = clampf(a, 0.0, 1.0)


func dot(x: float, y: float, col: Color, w := 1.0, h := 1.0) -> void:
	if _a <= 0.0:
		return
	c.draw_rect(Rect2(roundf(x) * 2.0, roundf(y) * 2.0, w * 2.0, h * 2.0), Color(col, col.a * _a))


## A filled disc of `r` game pixels, rows of pixels.
func disc(cx: float, cy: float, r: float, col: Color) -> void:
	var n := ceili(r)
	for dy in range(-n, n + 1):
		var s := r * r - dy * dy
		if s < 0.0:
			continue
		var w := floorf(sqrt(s))
		c.draw_rect(Rect2((roundf(cx) - w) * 2.0, (roundf(cy) + dy) * 2.0, (2.0 * w + 1.0) * 2.0, 2.0), Color(col, col.a * _a))


## A soft glow: discs laid onto what is under them, fading outward (the game adds them; here they are laid over).
func glow(cx: float, cy: float, r: float, col: Color, strength := 0.22) -> void:
	var was := _a
	for ka in [[1.0, 0.35], [0.7, 0.6], [0.45, 1.0]]:
		_a = strength * float(ka[1])
		disc(cx, cy, r * float(ka[0]), col)
	_a = was


## A ring on the floor of `r` tiles about (x, y), every `gap`th pixel of it, turned by `turn`.
func floor_ring(x: float, y: float, r: float, col: Color, gap: int, turn: float, lift := 0.0) -> void:
	var n := maxi(24, roundi(r * 64.0))
	for k in n:
		if gap > 1 and k % gap != 0:
			continue
		var a := float(k) / n * TAU + turn
		dot(gx(x + cos(a) * r, y + sin(a) * r), gy(x + cos(a) * r, y + sin(a) * r) - lift, col)


## The screen's way for a way in the world, made one long.
static func screen_way(vx: float, vy: float) -> Vector2:
	var s := Vector2((vx - vy) * 16.0, (vx + vy) * 8.0)
	return s / s.length() if s.length() > 0.0 else Vector2(1, 0)


# --- THE MAGE'S BALL, A COMET ---

func ball(x: float, y: float, vx: float, vy: float, el: String, t: float, flown := 9.0) -> void:
	var T := tones(el)
	var LIFT := 13.0
	var u := screen_way(vx, vy)
	var px := -u.y
	var py := u.x
	var sx := gx(x, y)
	var sy := gy(x, y)
	var hx := sx
	var hy := sy - LIFT
	alpha(0.35)
	for i in range(0, 16, 2):
		c.draw_rect(Rect2((roundf(sx - u.x * i) - 2.0) * 2.0, roundf(sy - u.y * i * 0.5) * 2.0, 10.0, 2.0), Color(0, 0, 0, 0.35))
	alpha(1.0)
	var STRANDS := [-3.0, -2.0, -1.5, -1.0, 0.0, 1.0, 1.5, 2.0, 3.0]
	for s in STRANDS.size():
		var off: float = STRANDS[s]
		var long := (20.0 + 22.0 * (1.0 - absf(off) / 3.4) + 7.0 * sin(t * 23.0 + s * 2.1)) * minf(1.0, 0.25 + flown * 0.6)
		var i := 3
		while i < long:
			var k := i / long
			var fan := off * (1.0 + k * 1.6) + sin(t * 31.0 + i * 0.45 + s) * k * 1.4
			var col: Color = T[3] if k < 0.22 else (T[2] if k < 0.5 else (T[1] if k < 0.78 else T[0]))
			alpha(1.0 if k < 0.6 else 1.0 - (k - 0.6) * 1.8)
			dot(hx - u.x * i + px * fan, hy - u.y * i + py * fan, col)
			i += 1
	alpha(1.0)
	for k in 6:
		var ph := fmod(t * 3.2 + k * 0.173, 1.0)
		var back := 10.0 + ph * 34.0
		var side := sin(k * 7.3 + floorf(t * 3.2 + k * 0.173) * 3.1) * 6.0
		alpha(1.0 - ph)
		dot(hx - u.x * back + px * side, hy - u.y * back + py * side + ph * 6.0, T[3] if ph < 0.4 else T[2], 2, 1)
	alpha(1.0)
	glow(hx, hy, 15, T[2], 0.34)
	disc(hx, hy, 4.4, T[1])
	disc(hx + u.x * 0.6, hy + u.y * 0.6, 3.4, T[2])
	disc(hx + u.x * 0.8, hy + u.y * 0.8, 2.2, T[3])
	dot(hx + u.x * 1.2 - 0.5, hy + u.y * 1.2 - 0.5, Color.WHITE, 2, 2)
	glow(hx, hy, 6, T[3], 0.35)


## The comet's splash where it burst, `age` seconds after (DUR 0.55): a flash, a ring of her light thrown across the floor as far as
## its burst reaches, drops flung up and falling.
func splash(s: Dictionary, age: float) -> void:
	var DUR := 0.55
	var k := age / DUR
	var T := tones(str(s["el"]))
	var x: float = s["x"]
	var y: float = s["y"]
	var r: float = s["r"]
	var sx := gx(x, y)
	var sy := gy(x, y)
	if k < 0.3:
		glow(sx, sy - 10.0, 22.0 * (1.0 - k), T[3], 0.5 * (1.0 - k / 0.3))
		disc(sx, sy - 10.0, 7.0 * (1.0 - k / 0.3), Color.WHITE)
	alpha(1.0 - k)
	floor_ring(x, y, r * (0.25 + 0.75 * sqrt(k)), T[3] if k < 0.4 else T[2], 1 if k < 0.5 else 2, k * 2.0)
	floor_ring(x, y, r * (0.15 + 0.6 * sqrt(k)), T[1], 3, -k * 3.0)
	for i in 14:
		var a := float(i) / 14.0 * TAU + (i % 3) * 0.4
		var out := r * (0.4 + 0.5 * float((i * 37) % 10) / 10.0) * minf(1.0, k * 1.6)
		var up := 26.0 * (0.6 + float((i * 53) % 7) / 10.0) * (k * 1.6 - k * k * 2.2)
		var dx := gx(x + cos(a) * out, y + sin(a) * out)
		var dy := gy(x + cos(a) * out, y + sin(a) * out) - maxf(0.0, up)
		dot(dx, dy, T[3] if i % 3 == 0 else T[2], 2, 2)
		dot(dx, dy + 2.0, T[1], 1, 2)
	alpha(1.0)


# --- THE MAGE'S SPEAR, A CRYSTAL LANCE ---

func spear(x: float, y: float, vx: float, vy: float, el: String, t: float, flown := 9.0) -> void:
	var T := tones(el)
	var LIFT := 12.0
	var u := screen_way(vx, vy)
	var px := -u.y
	var py := u.x
	var tx := gx(x, y)
	var ty := gy(x, y) - LIFT
	var LONG := roundi(minf(44.0, 12.0 + flown * 26.0))
	var WIDE := roundi(LONG * 0.3)
	var half := func(i: int) -> float: return (i * 5.6) / WIDE if i < WIDE else 5.6 * (1.0 - float(i - WIDE) / (LONG - WIDE))
	var lit := func(k: int) -> bool: return py * k < 0.0 if absf(py) > 0.2 else px * k < 0.0
	alpha(0.3)
	for i in range(0, LONG, 2):
		dot(tx - u.x * i, ty + LIFT - u.y * i * 0.5, Color.BLACK, 2, 1)
	alpha(1.0)
	for s in 5:
		var ph := fmod(t * 2.6 + s * 0.2, 1.0)
		var back := LONG + 2.0 + ph * 30.0
		var side := sin(s * 5.1 + floorf(t * 2.6 + s * 0.2) * 2.3) * 4.0
		var cx := tx - u.x * back + px * side
		var cy := ty - u.y * back + py * side + ph * 4.0
		alpha(1.0 - ph)
		var spin := int(fmod(t * 12.0 + s, 2.0))
		dot(cx, cy - 1.0, T[3])
		dot(cx - 1.0 + spin, cy, T[2], 2 - spin, 1)
		dot(cx, cy + 1.0, T[1])
	alpha(1.0)
	for i in range(0, LONG, 7):
		glow(tx - u.x * i, ty - u.y * i, 8, T[2], 0.15)
	for i in range(-1, LONG + 2):
		var W := roundi(half.call(clampi(i, 0, LONG))) + 1
		for k in range(-W, W + 1):
			dot(tx - u.x * i + px * k, ty - u.y * i + py * k, Color("#140a24"))
	var glint := fmod(t * 70.0, LONG + 20.0)
	for i in LONG + 1:
		var W := roundi(half.call(i))
		for k in range(-W, W + 1):
			var col: Color
			if W > 0 and absi(k) == W:
				col = T[2] if lit.call(k) else T[0]
			elif k == 0:
				col = Color.WHITE if absf(i - glint) < 3.0 else T[3]
			elif absf(i - WIDE) < 1.0:
				col = T[3]
			else:
				col = (T[3] if absi(k) == 1 else T[2]) if lit.call(k) else (T[1] if absi(k) == 1 else T[0])
			dot(tx - u.x * i + px * k, ty - u.y * i + py * k, col)
	glow(tx, ty, 6, T[3], 0.32)
	dot(tx - 0.5, ty - 0.5, Color.WHITE, 2, 2)


# --- A BEAM (render/fx.ts drawRay): {x0, y0, x1, y1, t, dur, colors, heavy, jag, flicker, faint, seed} ---

func ray(r: Dictionary, clock: float) -> void:
	var k: float = float(r["t"]) / float(r["dur"])
	var in_k := minf(1.0, k / 0.2)
	var out_k := 1.0 if k < 0.45 else maxf(0.0, 1.0 - (k - 0.45) / 0.55)
	var x0 := gx(r["x0"], r["y0"])
	var y0 := gy(r["x0"], r["y0"]) - 12.0
	var x1 := gx(r["x1"], r["y1"])
	var y1 := gy(r["x1"], r["y1"]) - 12.0
	if r["flicker"]:
		var j := roundf(randf_range(-1.0, 1.0))
		y0 += j
		y1 -= j
	var flat := absf(x1 - x0) >= absf(y1 - y0)
	var sx := 0.0 if flat else 1.0
	var sy := 1.0 if flat else 0.0
	var half := maxi(0, roundi((5.0 if r["heavy"] else 3.0) * in_k * out_k))
	var cs: Array = r["colors"]
	var last := cs.size() - 1
	alpha((0.55 if r["faint"] else 1.0) * (0.4 + 0.6 * out_k))
	for o in range(half, 0, -1):
		var col: Color = cs[mini(last, 3 if o > half * 0.6 else (2 if o > half * 0.3 else 1))]
		_pline(x0 + sx * o, y0 + sy * o, x1 + sx * o, y1 + sy * o, col)
		_pline(x0 - sx * o, y0 - sy * o, x1 - sx * o, y1 - sy * o, col)
	var heart: Color = cs[mini(last, 1)] if r["flicker"] and floori(clock * 24.0) % 2 == 0 else (cs[0] if k < 0.6 else cs[mini(last, 1)])
	if r["jag"]:
		var steps := maxi(2, roundi(Vector2(x1 - x0, y1 - y0).length() / 14.0))
		var p := Vector2(x0, y0)
		for i in range(1, steps + 1):
			var f := float(i) / steps
			var off := 0.0 if i == steps else (_hash(int(r["seed"]) + i, floori(clock * 20.0)) - 0.5) * (half + 2) * 2.0
			var q := Vector2(x0 + (x1 - x0) * f + sx * off, y0 + (y1 - y0) * f + sy * off)
			_pline(p.x, p.y, q.x, q.y, heart)
			p = q
	elif half > 0 or in_k < 1.0:
		_pline(x0, y0, x1, y1, heart)
	alpha(1.0)


## A line a pixel wide from one point to another, pixel by pixel (engine/px.ts pline).
func _pline(x0: float, y0: float, x1: float, y1: float, col: Color) -> void:
	var n := maxi(1, roundi(maxf(absf(x1 - x0), absf(y1 - y0))))
	for i in n + 1:
		var f := float(i) / n
		dot(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, col)


static func _hash(a: int, b: int) -> float:
	var h := (a * 374761393 + b * 668265263) & 0x7fffffff
	h = ((h ^ (h >> 13)) * 1274126177) & 0x7fffffff
	return float(h % 10000) / 10000.0


# --- THE RANGER'S SNARE ---

const SNARE_FLIES := 0.22


## Where it lies: first its flight from his hand (`flying` seconds since it was thrown, from `from`), the loop spinning open as it
## goes in an arc to where it lands; then the loop lying open on the floor, lit in cyan while `set`.
func snare(x: float, y: float, set: bool, t: float, flying: float, from: Vector2) -> void:
	var k := flying / SNARE_FLIES
	if from != Vector2.INF and k < 1.0:
		var fxp := from.x + (x - from.x) * k
		var fyp := from.y + (y - from.y) * k
		var lift := 30.0 * (1.0 - k) + sin(k * PI) * 14.0
		var r := 0.3 + 0.32 * k
		var spin := t * 30.0
		for i in 28:
			var a := float(i) / 28.0 * TAU
			var X := gx(fxp + cos(a) * r, fyp + sin(a) * r)
			var Y := gy(fxp + cos(a) * r, fyp + sin(a) * r) - lift
			dot(X - 1.0, Y - 1.0, ROPE[0] if (i + roundi(spin)) % 4 == 0 else (ROPE[2] if sin(a + spin * 0.2) < 0.0 else ROPE[1]), 2, 2)
		var wa := spin * 0.4
		var WX := gx(fxp + cos(wa) * r, fyp + sin(wa) * r)
		var WY := gy(fxp + cos(wa) * r, fyp + sin(wa) * r) - lift
		glow(WX, WY, 5, C[2], 0.3)
		dot(WX - 1.0, WY - 1.0, C[3], 2, 2)
		alpha(0.3)
		dot(gx(fxp, fyp) - 5.0, gy(fxp, fyp), Color.BLACK, 11, 2)
		alpha(1.0)
		return
	var R := 0.62
	var n := 44
	if set:
		alpha(0.45 + 0.35 * sin(t * 6.0))
		floor_ring(x, y, R * 0.7, C[1], 2, t)
		alpha(1.0)
	for q in n:
		var a := float(q) / n * TAU
		var X := gx(x + cos(a) * R, y + sin(a) * R)
		var Y := gy(x + cos(a) * R, y + sin(a) * R)
		var far := sin(a + PI / 4.0) < 0.0
		dot(X - 1.0, Y - 1.0, ROPE[0] if q % 3 == 0 else (ROPE[2] if far else ROPE[1]), 3, 2)
	var kx := gx(x + R * 0.7, y + R * 0.7)
	var ky := gy(x + R * 0.7, y + R * 0.7)
	dot(kx - 2.0, ky - 2.0, ROPE[0], 5, 4)
	dot(kx - 1.0, ky - 2.0, ROPE[1], 3, 3)
	dot(kx - 1.0, ky - 2.0, ROPE[2], 2, 1)
	for i in range(2, 11):
		dot(kx + i, ky + i * 0.5, ROPE[1] if i % 2 else ROPE[0], 2, 2)
	dot(kx + 11.0, ky + 1.0, Color("#5a5f76"), 2, 7)
	dot(kx + 9.0, ky, Color("#c4cbe0"), 6, 2)
	if set:
		var a := t * 3.0
		var X := roundf(gx(x + cos(a) * R, y + sin(a) * R))
		var Y := roundf(gy(x + cos(a) * R, y + sin(a) * R)) - 1.0
		glow(X, Y, 6, C[2], 0.35)
		dot(X - 3.0, Y, C[2], 7, 1)
		dot(X, Y - 3.0, C[2], 1, 7)
		dot(X - 1.0, Y - 1.0, C[3], 3, 3)


# --- THE RANGER'S SNIPE ---

## An arrow drawn in light, its point at (x, y), going `u` on the screen: its shaft `long` back, its head `head` to either side, its
## vanes `vane` long, dark-edged; its light at `a`.
func light_arrow(x: float, y: float, u: Vector2, long: int, head: float, vane: float, a := 1.0) -> void:
	var px := -u.y
	var py := u.x
	var H := maxi(1, roundi(head))
	var HL := roundi(H * 2.4)
	var thick := 1 if head >= 3.0 else 0
	var at := func(along: float, across: float) -> Vector2: return Vector2(x - u.x * along + px * across, y - u.y * along + py * across)
	alpha(a)
	var edge := Color("#0a2030")
	for i in range(-1, long + 2):
		for w in range(-thick - 1, thick + 2):
			var p: Vector2 = at.call(i, w)
			dot(p.x, p.y, edge)
	for i in range(-1, HL + 2):
		var hw := roundi(float(mini(i, HL)) / HL * H) + 1
		for w in range(-hw, hw + 1):
			var p: Vector2 = at.call(i, w)
			dot(p.x, p.y, edge)
	for i in long + 1:
		for w in range(-thick, thick + 1):
			var p: Vector2 = at.call(i, w)
			dot(p.x, p.y, Color.WHITE if w == 0 else C[3])
	if vane > 0.0:
		var V := roundi(vane)
		for i in V:
			for side in [1, -1]:
				var p: Vector2 = at.call(long - V + i + 1, side * (1 + i * 0.7))
				dot(p.x, p.y, C[1] if i == V - 1 else C[2])
				var p2: Vector2 = at.call(long - V + i + 2, side * (1 + i * 0.7))
				dot(p2.x, p2.y, C[1])
	for i in HL + 1:
		var hw := roundi(float(i) / HL * H)
		for w in range(-hw, hw + 1):
			var p: Vector2 = at.call(i, w)
			dot(p.x, p.y, Color.WHITE if w == 0 else (C[2] if absi(w) == hw else C[3]))
	alpha(1.0)


## While he draws (`d`: kit snipe_draw): on the floor under him, the ring filling like a clock in three steps, each with its pulse,
## and his aim along the floor.
func snipe_floor(hp: Vector2, d: Dictionary) -> void:
	var dx: float = float(d["tx"]) - hp.x
	var dy: float = float(d["ty"]) - hp.y
	var l := Vector2(dx, dy).length()
	if l <= 0.0:
		l = 1.0
	var P: float = d["power"]
	var full := P >= 1.0
	var FULL: float = float(d["held"]) - float(d["since_full"])
	var RR := 0.8
	var N := 72
	for k in N:
		var f := float(k) / N
		var a := -PI * 0.75 + f * TAU
		var X := gx(hp.x + cos(a) * RR, hp.y + sin(a) * RR)
		var Y := gy(hp.x + cos(a) * RR, hp.y + sin(a) * RR)
		if f <= P:
			var edge := not full and P - f < 0.03
			dot(X - 1.0, Y - 1.0, Color.WHITE if edge else (Color.WHITE if full and float(d["since_full"]) < 0.3 else C[2]), 2, 2)
		else:
			alpha(0.3)
			dot(X, Y, C[1], 1, 1)
			alpha(1.0)
		if k % (N / 3) == 0:
			dot(X - 1.0, Y - 2.0, Color.WHITE if f <= P else C[1], 2, 3)
	for s in range(1, 4):
		var age: float = float(d["held"]) - FULL * s / 3.0
		if age < 0.0 or age > 0.35:
			continue
		var k := age / 0.35
		alpha(1.0 - k)
		floor_ring(hp.x, hp.y, RR + k * (0.6 + 0.4 * s), Color.WHITE if s == 3 else C[3], 1, 0.0)
		alpha(1.0)
	var reach := minf(l, 14.0) * (0.3 + 0.7 * P)
	var n := roundi(reach * 4.0)
	for k in range(3, n):
		var X := gx(hp.x + dx / l * (k / 4.0), hp.y + dy / l * (k / 4.0))
		var Y := gy(hp.x + dx / l * (k / 4.0), hp.y + dy / l * (k / 4.0))
		alpha(0.35 + 0.65 * P * (1.0 - float(k) / (n + 4)))
		dot(X, Y, C[3] if full else C[2], 2, 2 if full else 1)
	alpha(1.0)


## (the same) Over him: light rising off him, streaks drawn in to the arrowhead, at full the glint and then its twinkle.
func snipe_air(hp: Vector2, d: Dictionary, t: float) -> void:
	var dx: float = float(d["tx"]) - hp.x
	var dy: float = float(d["ty"]) - hp.y
	var P: float = d["power"]
	var full := P >= 1.0
	var hx := gx(hp.x, hp.y)
	var hy := gy(hp.x, hp.y)
	var wisps := roundi(3.0 + 11.0 * P)
	for k in wisps:
		var ph := fmod(t * (0.9 + 0.8 * P) + k * 0.137, 1.0)
		var a := k * 2.39996
		var r := 0.25 + 0.25 * float((k * 7) % 5) / 5.0
		var X := gx(hp.x + cos(a) * r, hp.y + sin(a) * r)
		var Y := gy(hp.x + cos(a) * r, hp.y + sin(a) * r) - ph * 34.0
		alpha(sin(ph * PI) * (0.35 + 0.65 * P))
		dot(X, Y, C[3] if full else C[2], 1, 2 + roundi(3.0 * P))
	alpha(1.0)
	var u := screen_way(dx, dy)
	var bx := hx + u.x * 8.0
	var by := hy - 17.0 + u.y * 4.0
	var streaks := roundi(3.0 + 5.0 * P)
	for k in streaks:
		var ph := fmod(t * (1.2 + 1.6 * P) + float(k) / streaks, 1.0)
		var a := k * 2.39996 + floorf(t * (1.2 + 1.6 * P) + float(k) / streaks) * 1.3
		var r := (1.0 - ph) * (18.0 + 16.0 * P) + 3.0
		var cx := cos(a)
		var cy := sin(a) * 0.75
		alpha(minf(1.0, ph * 3.0) * (0.5 + 0.5 * P))
		for i in 3:
			dot(bx + cx * (r + i * 1.5), by + cy * (r + i * 1.5), C[3] if i == 0 else C[1])
	alpha(1.0)
	var s: float = d["since_full"]
	if s >= 0.0 and s < 0.32:
		var k := s / 0.32
		var big := roundi(14.0 * (k / 0.25 if k < 0.25 else 1.0 - (k - 0.25) / 0.75))
		dot(bx - big, by, Color.WHITE, 2 * big + 1, 1)
		dot(bx, by - big, Color.WHITE, 1, 2 * big + 1)
		var dg := roundi(big * 0.4)
		for i in range(1, dg + 1):
			dot(bx + i, by + i, C[3])
			dot(bx - i, by - i, C[3])
			dot(bx + i, by - i, C[3])
			dot(bx - i, by + i, C[3])
	elif s >= 0.32 and fmod(s, 0.6) < 0.08:
		dot(bx - 4.0, by, Color.WHITE, 9, 1)
		dot(bx, by - 4.0, Color.WHITE, 1, 9)


## An arrow it loosed (its draw `power`, `age` seconds out): the whoosh off the bow, its streak, and the arrow drawn in light.
func snipe_streak(x: float, y: float, vx: float, vy: float, power: float, age: float) -> void:
	var P := clampf(power, 0.0, 1.0)
	var u := screen_way(vx, vy)
	var px := -u.y
	var py := u.x
	var tx := gx(x, y)
	var ty := gy(x, y) - 9.0
	if age < 0.22:
		var k := age / 0.22
		var lx := gx(x - vx * age, y - vy * age)
		var ly := gy(x - vx * age, y - vy * age) - 9.0
		alpha((1.0 - k) * (0.6 + 0.4 * P))
		var R := (3.0 + 6.0 * P) * (0.5 + 0.5 * k)
		for side in [1, -1]:
			for line in 3:
				var off := R + line * (2.0 + 2.0 * P)
				var len := roundi((6.0 + 10.0 * P) * (1.0 - line * 0.25))
				for i in len:
					var sweep := i * (0.9 + 0.4 * line)
					dot(lx + px * side * (off + i * 0.35) - u.x * sweep, ly + py * side * (off + i * 0.35) - u.y * sweep, C[3] if line == 0 else C[2])
		alpha(1.0)
	var LONG := minf(44.0 + 56.0 * P, 6.0 + age * Vector2(vx, vy).length() * 20.0)
	var W := roundi(1.0 + 3.0 * P)
	var i := 4
	while i < LONG:
		var a := maxf(0.0, 1.0 - i / LONG)
		alpha(a)
		dot(tx - u.x * i, ty - u.y * i, Color.WHITE if i < LONG * 0.4 else C[2])
		alpha(a * 0.7)
		for w in range(1, W + 1):
			dot(tx - u.x * i + px * w, ty - u.y * i + py * w, C[1] if w == W else C[2])
			dot(tx - u.x * i - px * w, ty - u.y * i - py * w, C[1] if w == W else C[2])
		i += 1
	alpha(1.0)
	light_arrow(tx, ty, u, roundi(14.0 + 16.0 * P), 2.0 + 3.4 * P, 3.0 + 3.5 * P)


# --- THE RANGER'S RALLY ---

## As he calls (`r`: kit rally_now, at `hp`): rings of cyan going out from him, and his call's light bursting round him.
func rally(hp: Vector2, r: Dictionary) -> void:
	var since: float = r["since"]
	if since < 0.9:
		for lc in [[0.0, C[3]], [0.12, C[2]], [0.24, C[1]]]:
			var k := (since - float(lc[0])) / 0.66
			if k < 0.0 or k > 1.0:
				continue
			alpha(1.0 - k)
			floor_ring(hp.x, hp.y, 0.6 + k * 5.4, lc[1], 1, 0.0)
			floor_ring(hp.x, hp.y, 0.55 + k * 5.4, lc[1], 1, 0.0)
		alpha(1.0)
	if since < 0.4:
		var k := since / 0.4
		var sx := gx(hp.x, hp.y)
		var sy := gy(hp.x, hp.y) - 16.0
		glow(sx, sy, 18.0 * (1.0 - k * 0.5), C[2], 0.5 * (1.0 - k))
		alpha(1.0 - k)
		for i in 8:
			var a := float(i) / 8.0 * TAU
			var j := 8.0 + k * 10.0
			while j < 14.0 + k * 14.0:
				dot(sx + cos(a) * j, sy + sin(a) * j * 0.6, C[2], 2, 1)
				j += 1.0
		alpha(1.0)
