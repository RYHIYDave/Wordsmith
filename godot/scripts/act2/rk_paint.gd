## THE RAT KING'S PAINTERS, as the art paints what of his aims any way (art/ratking_action_fx.ts paintWedge, paintWordLine, paintWord,
## paintSwarm9 and paintRat, paintRollLane), line for line, a frame at a time as the game paints them (render/act1_fx/ratking.ts
## floorPicture); and his cistern's sluices drawn with the canvas's own lines as the game draws them (drawSluice). What aims no way
## (the ring of rats bursting out, his words' bursts) is the game's films (tools/godot_fx.ts rk_ring, rk_wb_<word>).
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const Canvas := preload("res://scripts/act2/canvas.gd")
const RK := preload("res://scripts/act2/ratking.gd")

## (art/mkit.ts FLAME; ratking_action_fx.ts PINK, INK; rat_king.ts FUR, BELLY, SKIN)
const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
const PINK: Array[Color] = [Color("#7a1058"), Color("#e0287a"), Color("#ff7aa8")]
const INK := Color("#0e0c24")
const FUR: Array[Color] = [Color("#141217"), Color("#242026"), Color("#37302f"), Color("#4c433e"), Color("#655a52")]
const BELLY: Array[Color] = [Color("#2e2828"), Color("#463e3c"), Color("#605652"), Color("#7a6e66"), Color("#94877c")]
const SKIN: Array[Color] = [Color("#2e2226"), Color("#4a3638"), Color("#664c4c"), Color("#806460"), Color("#987a72")]
const HOT := Color("#fff0f4")
## (render/act1_fx/ratking.ts WATER, FOAM, PINKS)
const WATER: Array[Color] = [Color("#070b0a"), Color("#0d1512"), Color("#14201b"), Color("#1d2c24"), Color("#2b3c32"), Color("#4a5a50")]
const FOAM: Array[Color] = [Color("#7e877c"), Color("#aab2a4"), Color("#d2d6c8"), Color("#eef0e4")]
const PINKS: Array[Color] = [Color("#e0287a"), Color("#ff7aa8"), Color("#7a1058")]


static func _c01(v: float) -> float:
	return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


static func _sm(v: float) -> float:
	var c := _c01(v)
	return c * c * (3.0 - 2.0 * c)


## beat: a beat that quickens as `m` nears `to` (on or off).
static func _beat(m: float, from: float, to: float) -> bool:
	var k := _c01((m - from) / (to - from))
	return sin(TAU * (2.0 + 7.0 * k) * (m - from)) > -0.2


## floorPicture's canvas: `R` tiles round its floor point, `up` picture pixels more above.
static func canvas(R: float, up := 0.0) -> Object:
	var w := ceili(64.0 * (R + 1.0)) + 8
	var h := ceili(32.0 * (R + 1.0)) + 8 + int(up)
	return Canvas.new(w, h, w / 2.0, h / 2.0 + up)


## The canvas's `at`: a floor point (tiles) `z` picture pixels up, its floor point at `c`.
static func _at(px, c: Vector2, x: float, y: float, z := 0.0) -> Vector2:
	return px.tile(x - c.x, y - c.y) - Vector2(0.0, z)


## paintWedge: THE WEDGE before him (`aim` his way on the floor; `B` his floor point), `m` seconds into the bite: marked while held;
## torn where the jaws snap.
static func wedge(px, m: float, B: Vector2, aim: float) -> void:
	var W: Dictionary = RK.BITE9
	var half := deg_to_rad(float(W["arc"]) / 2.0)
	var reach: float = W["reach"]
	var near: float = W["near"]
	var P := func(r: float, a: float) -> Vector2: return _at(px, B, B.x + cos(aim + a) * r, B.y + sin(aim + a) * r)
	if m > float(W["mark"]) and m < float(W["hit"]):
		var k := _sm((m - float(W["mark"])) / 0.2)
		var on := _beat(m, W["mark"], W["hit"])
		for i in 201:
			if i % 6 >= 4:
				continue
			var a := -half + (2.0 * half * i) / 200.0
			if absf(a) > half * k:
				continue
			for r in [reach, near]:
				var q: Vector2 = P.call(r, a)
				px.pen(q.x, q.y, PINK[2] if on else PINK[1])
				px.pen(q.x + 1.0, q.y, PINK[1])
				px.pen(q.x, q.y + 1.0, PINK[0])
		for sd in [-1.0, 1.0]:
			var r := near
			while r <= reach:
				if not (GP.rnd(r * 20.0) % 6 >= 4 or k < 0.98):
					var q: Vector2 = P.call(r, sd * half)
					px.pen(q.x, q.y, PINK[2] if on else PINK[1])
					px.pen(q.x, q.y + 1.0, PINK[0])
				r += 0.05
		for i in ceili(320.0 * k):
			if i >= 320.0 * k:
				break
			var a := (GP.hash(i, 1, 7151) - 0.5) * 2.0 * half * k
			var r := near + 0.1 + (reach - near - 0.2) * sqrt(GP.hash(i, 2, 7151))
			var q: Vector2 = P.call(r, a)
			if (GP.rnd(q.x) + GP.rnd(q.y)) % 2 != 0:
				continue
			px.pen(q.x, q.y, PINK[1] if on else PINK[0])
	# THE SNAP: the wedge flashes; where each jaw struck, the floor scored, dust thrown
	var s := m - float(W["hit"])
	if s >= 0.0 and s < 0.8:
		if s < 0.1:
			for i in 500:
				var a := (GP.hash(i, 3, 7152) - 0.5) * 2.0 * half
				var r := near + (reach - near) * sqrt(GP.hash(i, 4, 7152))
				var q: Vector2 = P.call(r, a)
				px.pen(q.x, q.y, HOT if GP.hash(i, 5, 7152) > 0.6 else PINK[2])
		for a in [-50, 0, 50]:
			var ar := deg_to_rad(a)
			for t in 3:
				var r := reach - 0.55
				while r <= reach - 0.05:
					var q: Vector2 = P.call(r, ar + (t - 1) * 0.06)
					if s < 0.6 or (GP.rnd(r * 33.0) + t) % 2 != 0:
						px.pen(q.x, q.y, FLAME[3] if s < 0.25 else Color("#3a2a26"))
					r += 0.03
			for j in 14:
				var q := _c01(s / 0.4)
				if q >= 1.0:
					continue
				var da := (GP.hash(j, a, 7153) - 0.5) * 1.2
				var d := reach - 0.2 + q * 0.6
				var p := _at(px, B, B.x + cos(aim + ar + da * 0.3) * d, B.y + sin(aim + ar + da * 0.3) * d, 14.0 * sin(PI * q) * GP.hash(j, 1, 7153))
				px.pen(p.x, p.y, Color("#8a7a68"))


## paintWordLine: THE WORD'S LINE on the floor from `a` along to `b`, `m` seconds into the move: following him (dashed), then
## LOCKED (solid, bright, its end ringed where it bursts).
static func word_line(px, a: Vector2, b: Vector2, m: float) -> void:
	var W: Dictionary = RK.WORDS9
	if m < float(W["aim"]) or m >= float(W["hit"]):
		return
	var len := maxf(a.distance_to(b), 1e-9)
	if a.distance_to(b) == 0.0:
		len = 1.0
	var f := (b - a) / len
	var k := _sm((m - float(W["aim"])) / 0.25)
	var locked := m >= float(W["lock"])
	var on := _beat(m, W["aim"], W["hit"])
	var run := fmod(m * 4.0, 1.0)
	var d := 0.3
	while d <= len * k:
		var i := GP.rnd(d * 33.0)
		for sd in [-1.0, 1.0]:
			if not locked and (i + floori(run * 8.0)) % 8 >= 5:
				continue
			var q := _at(px, a, a.x + f.x * d - f.y * sd * 0.3, a.y + f.y * d + f.x * sd * 0.3)
			px.pen(q.x, q.y, (HOT if on else PINK[2]) if locked else (PINK[2] if on else PINK[1]))
			px.pen(q.x + 1.0, q.y, PINK[2] if locked else PINK[1])
			px.pen(q.x, q.y + 1.0, PINK[1])
			px.pen(q.x + 1.0, q.y + 1.0, PINK[0])
		if i % 3 == 0:
			var s0 := (GP.hash(i, 1, 7163) - 0.5) * 0.5
			var q := _at(px, a, a.x + f.x * d - f.y * s0, a.y + f.y * d + f.x * s0)
			px.pen(q.x, q.y, PINK[1] if locked else PINK[0])
		if locked:
			var q := _at(px, a, a.x + f.x * d, a.y + f.y * d)
			px.pen(q.x, q.y, PINK[2] if on else PINK[1])
		d += 0.03
	if locked:
		var t := 0.0
		while t < TAU:
			if GP.rnd(t * 30.0) % 5 < 3:
				var q := _at(px, a, b.x + cos(t) * float(W["burst"]), b.y + sin(t) * float(W["burst"]))
				px.pen(q.x, q.y, PINK[2] if on else PINK[1])
				px.pen(q.x, q.y + 1.0, PINK[0])
			t += 0.03


## blob: a blob of whole pixels.
static func _blob(px, x: float, y: float, rx: float, ry: float, cin: Color, cout: Color, hi = null) -> void:
	for j in range(-ceili(ry), ceili(ry) + 1):
		for i in range(-ceili(rx), ceili(rx) + 1):
			var e := pow(i / rx, 2.0) + pow(j / ry, 2.0)
			if e > 1.0:
				continue
			px.pen(x + i, y + j, hi if (hi != null and i + j < -(rx + ry) * 0.35) else (cout if e > 0.55 else cin))


## paintWord: THE WORD IN FLIGHT, `t` seconds after it leaves his mouth at `a` `rise` picture pixels up, toward `b`; false once it
## is there. Fire a teardrop streaming embers; frost spinning shards; lightning a forked bolt; poison a swollen gob dripping.
static func word(px, kind: String, a: Vector2, rise: float, b: Vector2, t: float) -> bool:
	var len := a.distance_to(b)
	if len == 0.0:
		len = 1.0
	var long := len / float(RK.WORDS9["speed"])
	if t < 0.0 or t >= long:
		return false
	var u := t / long
	var P := func(q: float) -> Vector2: return _at(px, a, a.x + (b.x - a.x) * q, a.y + (b.y - a.y) * q, rise * (1.0 - q) + 8.0 * q)
	var s: Vector2 = P.call(u)
	var bk: Vector2 = P.call(maxf(0.0, u - 0.06))
	var dir := atan2(s.y - bk.y, s.x - bk.x)
	var cx := cos(dir)
	var cy := sin(dir)
	for i in range(1, 26):
		var q := u - (i / 25.0) * minf(u, 0.16)
		var p: Vector2 = P.call(q)
		if i > 14 and i % 2 != 0:
			continue
		px.pen(p.x, p.y, FLAME[3] if i < 6 else (FLAME[2] if i < 14 else FLAME[1]))
		if i < 10:
			px.pen(p.x, p.y + 1.0, FLAME[1])
	var f2 := _at(px, a, a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u)
	for i in range(-7, 8):
		px.pen(f2.x + i, f2.y + (0.0 if absi(i) > 5 else 1.0), INK)
	match kind:
		"fire":
			for i in range(12, -1, -1):
				var r := 7.0 - i * 0.5
				_blob(px, s.x - cx * i * 2.6, s.y - cy * i * 2.6 + sin(t * 40.0 + i) * 0.8, maxf(1.0, r), maxf(1.0, r * 0.75),
					FLAME[4] if i < 2 else (FLAME[3] if i < 5 else (FLAME[2] if i < 9 else FLAME[1])), FLAME[2] if i < 5 else FLAME[1])
			for i in 10:
				px.pen(s.x - cx * (22 + i * 5) + (GP.hash(i, floori(t * 20.0), 7161) - 0.5) * 10.0, s.y - cy * (22 + i * 5) + (GP.hash(i, 1, 7161) - 0.5) * 10.0, FLAME[2 if i % 2 != 0 else 3])
		"frost":
			for i in 6:
				var an := t * 14.0 + (i / 6.0) * TAU
				var ox := cos(an) * 8.0
				var oy := sin(an) * 4.0
				for k in range(-6, 7):
					var c: Color = FLAME[3] if absi(k) == 6 else (FLAME[4] if absi(k) < 2 else FLAME[2])
					px.pen(s.x + ox + cx * k, s.y + oy + cy * k, c)
					if absi(k) < 4:
						px.pen(s.x + ox + cx * k, s.y + oy + cy * k + 1.0, FLAME[1])
			_blob(px, s.x, s.y, 3.0, 2.5, FLAME[4], FLAME[3])
		"lightning":
			var lx := s.x
			var ly := s.y
			for i in 9:
				var nx := lx - cx * 7.0 + (GP.hash(i, floori(t * 30.0), 7162) - 0.5) * 11.0
				var ny := ly - cy * 7.0 + (GP.hash(i, floori(t * 30.0) + 7, 7162) - 0.5) * 11.0
				for k in 8:
					var x := lx + (nx - lx) * k / 7.0
					var y := ly + (ny - ly) * k / 7.0
					px.pen(x, y, FLAME[4] if i < 3 else FLAME[3])
					px.pen(x + 1.0, y, FLAME[3] if i < 3 else FLAME[2])
				if i == 2 or i == 5:
					for k in 9:
						px.pen(nx + k * 1.6, ny + k * (1.0 if i == 2 else -1.0), FLAME[2])
				lx = nx
				ly = ny
			_blob(px, s.x, s.y, 4.0, 3.5, FLAME[4], FLAME[3])
		_:
			_blob(px, s.x, s.y, 9.0, 7.0, FLAME[2], FLAME[1], FLAME[3])
			_blob(px, s.x - 3.0, s.y - 3.0, 3.0, 2.0, FLAME[4], FLAME[3])
			for i in range(1, 9):
				_blob(px, s.x - cx * i * 6.0, s.y - cy * i * 6.0 + i * 1.8, 2.0, 2.0, FLAME[1 if i % 2 != 0 else 2], FLAME[1])
	return true


## paintRat: a little rat at a picture point, `ang` its way on the picture, `size`, tumbling belly up when `belly`; its eye pink.
static func rat(px, X: float, Y: float, ang: float, size: float, belly: bool, seed: int, wet := false, rim := INK) -> void:
	var c := cos(ang)
	var s := sin(ang)
	var L := 5.2 * size
	var Wd := 2.6 * size
	var fur: Array = [Color("#1a1418"), Color("#3a302e"), Color("#5a4e48"), Color("#7e7066")] if wet else [FUR[0], FUR[3], FUR[4], Color("#7e7066")]
	for i in 11:
		var q := i / 10.0
		var bx := -L - q * 7.0 * size
		var by := sin(q * 3.0 + seed) * 2.5 * size * q
		px.pen(X + c * bx - s * by, Y + s * bx * 0.6 + c * by * 0.6, SKIN[2] if q < 0.5 else SKIN[1])
	for j in range(-ceili(Wd) - 1, ceili(Wd) + 2):
		for i in range(-ceili(L) - 1, ceili(L) + 2):
			var e := pow(i / L, 2.0) + pow(j / Wd, 2.0)
			if e > 1.25:
				continue
			var x := X + c * i - s * j
			var y := Y + (s * i + c * j) * 0.6
			if e > 1.0:
				px.pen(x, y, rim)
			elif belly:
				px.pen(x, y, BELLY[3] if j < -Wd * 0.3 else (BELLY[1] if e > 0.6 else BELLY[2]))
			else:
				px.pen(x, y, fur[3] if (j < -Wd * 0.35 and e < 0.7) else (fur[1] if e > 0.65 else fur[2]))
	var hx := X + c * (L + 2.0 * size)
	var hy := Y + s * (L + 2.0 * size) * 0.6
	for j in range(-2, 3):
		for i in range(-2, 4):
			if pow(i / 3.0, 2.0) + pow(j / 2.0, 2.0) <= 1.1:
				px.pen(hx + c * i * size - s * j * size, hy + (s * i * size + c * j * size) * 0.6, BELLY[2] if belly else fur[2])
	px.pen(hx + c * 4.0 * size, hy + s * 4.0 * size * 0.6, SKIN[3])
	px.pen(hx - s * 2.0 * size - c * size, hy + c * 2.0 * size * 0.6 - 1.0, SKIN[2])
	px.pen(hx - s * 1.2 * size + c * size, hy + c * 1.2 * size * 0.6 - 1.0, FLAME[2])
	if size > 1.4:
		px.pen(hx - s * 1.2 * size + c * size + 1.0, hy + c * 1.2 * size * 0.6 - 1.0, FLAME[3])
	if belly:
		for k in [-1.0, 1.0]:
			for f in [-0.5, 0.5]:
				px.pen(X + c * f * L - s * k * (Wd + 1.5), Y + (s * f * L + c * k * (Wd + 1.5)) * 0.6 - 1.0, SKIN[3])


## paintSwarm9: THE SWARM: its rats running from `a` to `b`, `tau` seconds since they burst away, each its own path and pace; their
## pink eyes; dust behind them. (Its floor point `a`.)
static func swarm(px, a: Vector2, b: Vector2, tau: float) -> void:
	var S: Dictionary = RK.SWARM9
	if tau < 0.0 or tau >= float(S["for"]):
		return
	var dx := b.x - a.x
	var dy := b.y - a.y
	var d := Vector2(dx, dy).length()
	if d == 0.0:
		d = 1.0
	var nx := -dy / d
	var ny := dx / d
	var A := _at(px, a, a.x, a.y)
	var Bp := _at(px, a, b.x, b.y)
	var ang := atan2((Bp.y - A.y) / 0.6, Bp.x - A.x)
	for i in int(S["rats"]):
		var delay := GP.hash(i, 0, 7191) * float(S["late"])
		var pace := 0.75 + 0.25 * GP.hash(i, 1, 7191)
		var q := _c01((tau - delay) / ((float(S["for"]) - float(S["late"])) * pace))
		if q <= 0.0 or q >= 1.0:
			continue
		var side := (GP.hash(i, 2, 7191) - 0.5) * 2.0 * float(S["half"]) * sin(minf(1.0, q * 1.4) * PI * 0.5 + ((q - 0.7) * 3.0 if q > 0.7 else 0.0)) * ((1.0 - q) * 4.0 if q > 0.75 else 1.0)
		var wig := sin(q * 34.0 + i) * 0.1
		var p := _at(px, a, a.x + dx * q + nx * (side + wig), a.y + dy * q + ny * (side + wig))
		for k in range(1, 4):
			px.pen(p.x - cos(ang) * (10 + k * 4), p.y - sin(ang) * 0.6 * (10 + k * 4) + (GP.hash(i, k, 7192) - 0.5) * 3.0, Color("#5e5248"))
		rat(px, p.x, p.y, ang + sin(q * 20.0 + i) * 0.25, 1.75, false, i, false, PINK[0])


## roll9AtAlong: when the ball came by a point `d` tiles along its lane, after it was off the line.
static func _roll_at(d: float, far: float) -> float:
	var lo: float = RK.ROLL9["strike"][0]
	var hi: float = RK.ROLL9["stop"]
	if d >= far:
		return hi
	for _i in 30:
		var mid := (lo + hi) / 2.0
		if RK.roll9_along(mid) < d:
			lo = mid
		else:
			hi = mid
	return hi


## paintRollLane: HIS ROLL'S LANE, he setting off from `B` along `aim`, `m` seconds into his roll: marked while he curls and holds
## (its edges dashed, chevrons marching down it, the floor in it hatched, its end a ring where he bursts open, beating faster); once
## he is off, the lane before him still marked until he stops, scored behind him where the ball ground along; the ring flashing.
static func roll_lane(px, m: float, B: Vector2, aim: float) -> void:
	var R9: Dictionary = RK.ROLL9
	var c := cos(aim)
	var s := sin(aim)
	var P := func(a: float, side: float) -> Vector2: return _at(px, B, B.x + c * a - s * side, B.y + s * a + c * side)
	var H: float = R9["half"]
	var R: float = R9["endR"]
	var far := RK.roll9_along(R9["stop"])
	var into := far - sqrt(R * R - H * H)
	var mark := func(x: float, y: float, on: bool, hot := false) -> void:
		px.pen(x, y, HOT if hot else (PINK[2] if on else PINK[1]))
		px.pen(x + 1.0, y, PINK[2] if on else PINK[1])
		px.pen(x, y + 1.0, PINK[1])
		px.pen(x + 1.0, y + 1.0, PINK[0])
	var ring := func(r: float, on: bool, gap: int, hot := false) -> void:
		var a := 0.0
		while a < TAU:
			if GP.rnd(a * 50.0) % gap < gap - 2:
				var q := _at(px, B, B.x + c * far + cos(a) * r, B.y + s * far + sin(a) * r)
				mark.call(q.x, q.y, on, hot)
			a += 0.02
	if m >= float(R9["mark"]) and m < float(R9["hit"]):
		var k := _sm((m - float(R9["mark"])) / 0.3)
		var on := _beat(m, R9["mark"], R9["hit"])
		var d := -0.6
		while d <= -0.6 + (into + 0.6) * k:
			if GP.rnd(d * 25.0) % 5 < 3:
				for sd in [-1.0, 1.0]:
					var q: Vector2 = P.call(d, sd * H)
					mark.call(q.x, q.y, on)
			d += 0.04
		if k > 0.6:
			ring.call(R * (1.0 + 0.1 * (1.0 - k)), on, 6)
		var run := fmod(m * 2.5, 1.0)
		for qi in ceili(far / 1.2):
			var d0 := 0.6 + (qi + run) * 1.2
			if d0 > (into + 0.6) * k - 0.6:
				continue
			var w := -H * 0.8
			while w <= H * 0.8:
				var q: Vector2 = P.call(d0 - absf(w) * 0.55, w)
				mark.call(q.x, q.y, on)
				w += 0.03
		for j in ceili(900.0 * k):
			if j >= 900.0 * k:
				break
			var dd := -0.4 + GP.hash(j, 1, 7401) * (far + R - 0.2)
			var w := (GP.hash(j, 2, 7401) - 0.5) * 2.0
			var in_ring := Vector2(dd - far, w * R).length() < R
			var side := w * R if in_ring else w * H
			if not in_ring and dd > into + 0.2:
				continue
			if dd > far + R * 0.95:
				continue
			var q: Vector2 = P.call(dd, side)
			if (GP.rnd(q.x) + GP.rnd(q.y)) % 2 != 0:
				continue
			px.pen(q.x, q.y, PINK[1] if on else PINK[0])
		return
	if m - float(R9["hit"]) < 0.0:
		return
	var now := RK.roll9_along(m)
	if m < float(R9["stop"]):
		var d := maxf(now + 0.8, 0.0)
		while d <= into:
			if GP.rnd(d * 25.0) % 5 < 4:
				for sd in [-1.0, 1.0]:
					var q: Vector2 = P.call(d, sd * H)
					mark.call(q.x, q.y, true)
			d += 0.04
		ring.call(R, true, 6)
	var o := m - float(R9["stop"])
	if o >= 0.0 and o < 0.45:
		for r in [R * (0.3 + 0.7 * sqrt(minf(1.0, o / 0.15))), R]:
			ring.call(r, o < 0.2, 4, o < 0.1)
	var d := -0.5
	while d <= minf(now, far):
		var age := m - _roll_at(d, far)
		if age >= 0.0 and age <= 1.2 and GP.hash(GP.rnd(d * 33.0), 1, 7402) >= age / 1.2:
			for sd in [-0.18, 0.18]:
				var q: Vector2 = P.call(d, sd)
				px.pen(q.x, q.y, Color("#8a7a68") if age < 0.2 else Color("#2a2220"))
				px.pen(q.x + 1.0, q.y, Color("#3a3028"))
		d += 0.03


# --- THE SLUICES (render/act1_fx/ratking.ts drawSluice): with the canvas's own lines, its pixels the game's (two of the picture's) ---

static func _poly(c: CanvasItem, pts: Array, col: Color, a: float) -> void:
	var pk := PackedVector2Array(pts)
	if absf((pk[1] - pk[0]).cross(pk[2] - pk[0])) < 0.01 and absf((pk[2] - pk[0]).cross(pk[3] - pk[0])) < 0.01:
		return
	c.draw_colored_polygon(pk, Color(col, a))


static func _ln(c: CanvasItem, a: Vector2, b: Vector2, col: Color, w: float, al: float) -> void:
	c.draw_line(a, b, Color(col, al), w * 2.0)


## drawSluice: each lane's marks (its edges dashed in his pink, chevrons down it, beating faster as the burst comes); its gate in the
## wall, grinding up, water spurting under it; the flood down the lane: black water, its flow streaked, its front a churning wall of
## foam, rats tumbling in it.
static func sluice(c: CanvasItem, p: Dictionary) -> void:
	var C := RK.cistern_of_peril(p)
	var lanes := RK.lanes_for(C["across"])
	var m: float = p["t"]
	var half: float = C["half"]
	var len := 2.0 * half
	var S: Dictionary = RK.SLUICES
	var F: Dictionary = RK.FLOOD
	var pt := func(u: float, v: float) -> Vector2:
		var w := RK.from_cistern(C, u, v)
		return Iso.to_screen(w.x, w.y)
	for i in lanes.size():
		var L: Dictionary = lanes[i]
		var y0: float = float(L["y"]) - float(L["half"])
		var y1: float = float(L["y"]) + float(L["half"])
		if m < float(S["burst"]) + 0.2:
			var k := minf(1.0, (m - float(S["mark"])) / 0.4)
			var beat := 0.55 + 0.45 * sin(m * (6.0 + 14.0 * minf(1.0, m / float(S["burst"]))))
			var run := fmod(m * 2.5, 1.0)
			var u := -half
			while u < -half + len * k:
				if floori((u + half) * 2.0) % 3 != 2:
					for v in [y0, y1]:
						_ln(c, pt.call(u, v), pt.call(minf(u + 0.35, half), v), PINKS[0], 2.0, 0.8 * beat)
				u += 0.5
			u = -half + 1.0 + run * 2.0
			while u < -half + len * k - 0.5:
				_ln(c, pt.call(u - 0.5, y0 + 0.4), pt.call(u, L["y"]), PINKS[1], 2.0, 0.7 * beat)
				_ln(c, pt.call(u - 0.5, y1 - 0.4), pt.call(u, L["y"]), PINKS[1], 2.0, 0.7 * beat)
				u += 2.0
		var up := RK.gate_up(m, i)
		var gx := -half
		_poly(c, [pt.call(gx, y0), pt.call(gx, y1), pt.call(gx + 0.25, y1), pt.call(gx + 0.25, y0)], Color("#1a1418"), 0.9)
		if up > 0.02 and m < float(S["burst"]):
			var v := y0 + 0.2
			while v < y1:
				_ln(c, pt.call(gx + 0.2, v), pt.call(gx + 0.5 + 0.3 * sin(m * 30.0 + v * 5.0), v), FOAM[3], 2.0, 0.8)
				v += 0.35
		var sp := RK.flood_span(m, i, len)
		if sp.y <= sp.x:
			continue
		var a := -half + sp.x
		var b := -half + sp.y
		_poly(c, [pt.call(a, y0), pt.call(b, y0), pt.call(b, y1), pt.call(a, y1)], WATER[2], 0.88)
		var v := y0 + 0.25
		while v < y1:
			var off := fmod(m * float(F["flow"]) + v * 3.1, 1.6)
			var uu := a + off
			while uu < b - 0.3:
				_ln(c, pt.call(uu, v), pt.call(uu + 0.6, v), WATER[4], 2.0, 0.6)
				uu += 1.6
			v += 0.5
		if sp.y < len:
			v = y0
			while v <= y1:
				var w := 0.25 + 0.15 * sin(v * 9.0 + m * 25.0)
				_ln(c, pt.call(b - w, v), pt.call(b + 0.1, v), FOAM[floori(absf(sin(v * 13.0 + m * 7.0)) * 4.0) % 4], 3.0, 0.95)
				v += 0.18
		for r in 6:
			var hh := sin(r * 12.9898 + i * 78.233) * 43758.5453
			var f := hh - floorf(hh)
			var u := a + fmod(f * len + m * float(F["rats"]), maxf(0.5, b - a))
			var vv := y0 + 0.4 + (float(L["half"]) * 2.0 - 0.8) * fmod(f * 7.3, 1.0)
			if u > b - 0.2:
				continue
			var q: Vector2 = pt.call(u, vv) / 2.0
			c.draw_rect(Rect2((GP.rnd(q.x) - 3) * 2.0, (GP.rnd(q.y) - 2) * 2.0, 12.0, 6.0), Color("#2a1e1c"))
			c.draw_rect(Rect2((GP.rnd(q.x) + (2 if sin(m * 9.0 + r) > 0.0 else -3)) * 2.0, (GP.rnd(q.y) - 2) * 2.0, 2.0, 2.0), PINKS[1])
