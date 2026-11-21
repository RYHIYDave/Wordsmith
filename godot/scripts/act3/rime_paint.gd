## THE RIME SHADE'S LINE, PAINTED AS THE GAME PAINTS IT (art/rime_shade_fx.ts markPainted, linePainted; render/act1_fx/rshade.ts): its
## mark, its crust of rime and its creeping front, and its crystals, each on the part of the art's canvas the line covers (lineBox),
## painted afresh fifteen times a second as its clock runs. The line can run any way at all (straight at where he stood), so it is
## painted here, not taken from pictures made before.
extends RefCounted

const GP := preload("res://scripts/act2/gp.gd")

const TILE3 := 39.191835884530846
const G := 0.816496580927726
## (FX_CANVAS: its anchor the Rime Shade's floor point)
const CW := 640
const CH := 400
const CAX := 320
const CAY := 200
## (RIME_LINE: where it begins, how long, how far either side, its pace; how long each stretch lies, melting over the last)
const FROM := 0.45
const LONG := 6.0
const HALF := 0.5
const PACE := 3.5
const LIES := 3.0
const MELT := 0.8
const MARK_IN := 0.15
## (RS_BREATH: the mark laid out from, its breath out at, the warning's end)
const MARK := 0.25
const HIT := 25.0 / 30.0
const WARN_END := 0.733
const GONE := LONG / PACE + LIES
## (FROZEN.hold: how long he is held)
const FROZEN_HOLD := 0.8
## (RS_FROST, RS_ICE, FX_PINK)
const FROST := ["#40444e", "#686e7c", "#9ca6b8", "#cdd4de", "#eef2f6"]
const ICE := ["#50555f", "#7f8796", "#b2bac8", "#dce2ea", "#f6f8fb"]
const PINK := ["#e0287a", "#ff7aa8", "#7a1058"]

static var _crystals: Array = []
static var _rgb := {}


static func _c01(v: float) -> float:
	return clampf(v, 0.0, 1.0)


static func _smooth(k: float) -> float:
	var v := _c01(k)
	return v * v * (3.0 - 2.0 * v)


static func line_front(t: float) -> float:
	return -1.0 if t < 0.0 else FROM + minf(LONG, PACE * t)


static func reaches_at(d: float) -> float:
	if d < FROM - 1e-9 or d > FROM + LONG + 1e-9:
		return -1.0
	return (d - FROM) / PACE


static func rime_left(age: float) -> float:
	if age < 0.0:
		return 0.0
	return 1.0 - _smooth((age - (LIES - MELT)) / MELT)


## lineView: seen from in front where its left lies toward the screen's right, truly from behind where it lies toward the left; and
## how far it is turned to its left off the way its picture faces: [back, turn].
static func line_view(f: Vector2) -> Array:
	if f.x + f.y >= 0.0:
		return [false, atan2(-f.y, f.x)]
	return [true, atan2(-f.x, -f.y)]


## fxAt: a point of the floor (`fwd` tiles before it, `side` to its left, `up` picture pixels over the floor) on the canvas.
static func fx_at(back: bool, fwd: float, side: float, up: float, turn: float) -> Vector2:
	var c := cos(turn)
	var s := sin(turn)
	var f := (fwd * c - side * s) * TILE3
	var l := (fwd * s + side * c) * TILE3
	if not back:
		return Vector2(CAX + G * (f + l), CAY + G * 0.5 * (f - l) - up)
	return Vector2(CAX + G * (f - l), CAY + G * 0.5 * (-f - l) - up)


## lineBox: the part of the canvas one line covers (with a margin, on whole game pixels): Rect2i.
static func line_box(back: bool, turn: float) -> Rect2i:
	var x0 := INF
	var y0 := INF
	var x1 := -INF
	var y1 := -INF
	for a in [FROM - 0.3, FROM + LONG + 0.4]:
		for s in [-HALF * 1.4, HALF * 1.4]:
			for up in [0.0, 36.0]:
				var p := fx_at(back, a, s, up, turn)
				x0 = minf(x0, p.x)
				y0 = minf(y0, p.y)
				x1 = maxf(x1, p.x)
				y1 = maxf(y1, p.y)
	var m := 12.0
	var x := maxi(0, floori((x0 - m) / 2.0) * 2)
	var y := maxi(0, floori((y0 - m) / 2.0) * 2)
	var hx := mini(CW, ceili((x1 + m) / 2.0) * 2)
	var hy := mini(CH, ceili((y1 + m) / 2.0) * 2)
	return Rect2i(x, y, hx - x, hy - y)


## A picture's pixels, its box's size: RGBA, all clear.
static func blank(b: Rect2i) -> PackedByteArray:
	var d := PackedByteArray()
	d.resize(b.size.x * b.size.y * 4)
	return d


static func _col(c: String) -> PackedByteArray:
	if not _rgb.has(c):
		var k := Color(c)
		_rgb[c] = PackedByteArray([k.r8, k.g8, k.b8])
	return _rgb[c]


## The art's pen: a whole pixel of the canvas (only where nothing is yet, if `under`), in the box's picture.
static func _pen(d: PackedByteArray, b: Rect2i, x: float, y: float, c: String, under := false) -> void:
	var X := GP.rnd(x)
	var Y := GP.rnd(y)
	if X < 1 or Y < 1 or X >= CW - 1 or Y >= CH - 1:
		return
	var bx := X - b.position.x
	var by := Y - b.position.y
	if bx < 0 or by < 0 or bx >= b.size.x or by >= b.size.y:
		return
	var i := (by * b.size.x + bx) * 4
	if under and d[i + 3] != 0:
		return
	var k := _col(c)
	d[i] = k[0]
	d[i + 1] = k[1]
	d[i + 2] = k[2]
	d[i + 3] = 255


## markPainted: THE MARK, `t` seconds into its breath: laid out toward him, its edges dashed in the enemy's pink, a chevron down it
## every tile; brighter as it is about to come; gone under the rime where it has crept over it.
static func paint_mark(d: PackedByteArray, b: Rect2i, t: float, back: bool, turn: float) -> void:
	var since := t - MARK
	if since < 0.0:
		return
	var after := t - HIT
	if after > LONG / PACE + 0.1:
		return
	var up_to := FROM + LONG * _smooth(since / MARK_IN)
	var front := line_front(after)
	var hot := t > WARN_END - 0.2 and t < HIT and floori(t * 15.0) % 2 == 0
	var a := FROM
	while a <= up_to:
		if a >= front + 0.15:
			var i := GP.rnd(a / 0.05)
			if i % 5 < 3:
				for sd in [1.0, -1.0]:
					var p := fx_at(back, a, sd * HALF, 0.0, turn)
					_pen(d, b, p.x, p.y, PINK[1] if hot else PINK[0], true)
					_pen(d, b, p.x + 1, p.y, PINK[0], true)
					_pen(d, b, p.x, p.y + 1, PINK[2], true)
					_pen(d, b, p.x + 1, p.y + 1, PINK[2], true)
		a += 0.05
	# its end, across it
	if up_to >= FROM + LONG - 0.01:
		var s := -HALF
		while s <= HALF:
			var p := fx_at(back, FROM + LONG, s, 0.0, turn)
			_pen(d, b, p.x, p.y, PINK[0], true)
			_pen(d, b, p.x + 1, p.y, PINK[2], true)
			s += 0.06
	# its chevrons, pointing down it, every tile
	a = FROM + 0.7
	while a <= up_to - 0.2:
		if a >= front + 0.3:
			var s := -1.0
			while s <= 1.0:
				var p := fx_at(back, a - absf(s) * 0.3, s * HALF * 0.62, 0.0, turn)
				_pen(d, b, p.x, p.y, PINK[1] if hot else PINK[0], true)
				_pen(d, b, p.x + 1, p.y, PINK[0], true)
				_pen(d, b, p.x, p.y + 1, PINK[2], true)
				s += 0.07
		a += 1.0


## linePainted 'floor': THE CRUST of rime, feathered, its edges flecked with the enemy's pink; a bright edge at its creeping front,
## frost-smoke rising off it.
static func paint_floor(d: PackedByteArray, b: Rect2i, t: float, back: bool, turn: float) -> void:
	var front := line_front(t)
	if front < 0.0 or t > GONE + 0.05:
		return
	var fr := floori(t * 30.0 + 1e-6)
	var a := FROM
	while a <= front:
		var age := t - maxf(0.0, reaches_at(a))
		var left := rime_left(age)
		if left > 0.02:
			var k := GP.rnd(a / 0.035)
			var edge := HALF * (0.78 + 0.22 * GP.hash(k, 1, 9111)) * (0.35 + 0.65 * left)
			var s := -edge
			while s <= edge:
				var j := GP.rnd(s / 0.05)
				var hh := GP.hash(k, j, 9113)
				if hh <= 0.5 + 0.5 * left:
					var p := fx_at(back, a, s, 0.0, turn)
					var mid := 1.0 - absf(s) / maxf(0.05, edge)
					_pen(d, b, p.x, p.y, FROST[4] if hh < 0.22 else (FROST[3] if mid > 0.35 else (FROST[2] if hh < 0.55 else FROST[1])), true)
					_pen(d, b, p.x + 1, p.y, FROST[3] if mid > 0.3 else FROST[2], true)
					_pen(d, b, p.x, p.y + 1, FROST[2] if mid > 0.5 else FROST[1], true)
				s += 0.05
			# (its edge flecked with the enemy's pink while it lies whole)
			if left > 0.6 and k % 3 == 0:
				for sd in [1.0, -1.0]:
					var p := fx_at(back, a, sd * edge * 1.02, 0.0, turn)
					_pen(d, b, p.x, p.y, PINK[0] if k % 6 == 0 else PINK[2])
			# (feathers: branching lines of frost out across it, every so often)
			if k % 9 == 0 and left > 0.3:
				for sd in [1.0, -1.0]:
					for q in 10:
						var u := q / 10.0
						var p := fx_at(back, a + u * 0.18, sd * u * edge * 0.95, 0.0, turn)
						_pen(d, b, p.x, p.y, FROST[4])
		a += 0.035
	# the creeping front: a bright edge of new frost across it, spreading, while it creeps
	if front < FROM + LONG - 1e-6 or t < LONG / PACE + 0.1:
		var s := -HALF * 1.05
		while s <= HALF * 1.05:
			var wob := 0.06 * sin(s * 19.0 + fr * 1.7)
			var dd := 0.0
			while dd < 0.12:
				var p := fx_at(back, front + wob - dd, s, 0.0, turn)
				_pen(d, b, p.x, p.y, "#ffffff" if dd < 0.03 else FROST[4])
				dd += 0.03
			s += 0.03
		# (frost-smoke rising off the front)
		for i in 14:
			var life := fposmod(t * 2.4 + i / 14.0, 1.0)
			var s2 := (GP.hash(i, 7, 9115) - 0.5) * 2.0 * HALF
			var p := fx_at(back, front - 0.2 * life, s2, 4.0 + 18.0 * life, turn)
			if life < 0.7:
				_pen(d, b, p.x, p.y, FROST[4] if life < 0.3 else FROST[3])


## The crystals of the line: where each stands (tiles along, to the side), how tall at its tallest, how wide, how it leans.
static func crystals() -> Array:
	if not _crystals.is_empty():
		return _crystals
	var seed := 0
	var a := FROM + 0.05
	while a <= FROM + LONG:
		var n := 2 + (1 if GP.hash(GP.rnd(a * 50.0), 1, 9101) > 0.5 else 0)
		for j in n:
			var h := GP.hash(seed, 2, 9101)
			var s := (j - (n - 1) / 2.0) * 0.32 + (GP.hash(seed, 3, 9101) - 0.5) * 0.16
			_crystals.append({"a": a + (GP.hash(seed, 4, 9101) - 0.5) * 0.12, "s": s, "tall": 15.0 + 13.0 * h - 7.0 * absf(s),
				"w": 2 + GP.rnd(2.0 * GP.hash(seed, 5, 9101)), "lean": s * 7.0 + (GP.hash(seed, 6, 9101) - 0.5) * 3.0, "seed": seed})
			seed += 1
		a += 0.2
	return _crystals


static func crystal_up(age: float) -> float:
	if age < 0.0:
		return 0.0
	var spike := 1.0 - pow(1.0 - age / 0.06, 2.0) if age < 0.06 else 1.0
	var settle := 1.0 - 0.72 * _smooth((age - 0.12) / 0.45)
	return spike * settle * rime_left(age)


## linePainted 'air': THE CRYSTALS standing up out of it, spiking up at its front, settled behind, melting; `near` 'behind' only those
## farther from the eye than a point `at` tiles along it, 'before' only those nearer, 'all' every one.
static func paint_air(d: PackedByteArray, b: Rect2i, t: float, back: bool, turn: float, near: String, at: float) -> void:
	var front := line_front(t)
	if front < 0.0 or t > GONE + 0.05:
		return
	var fr := floori(t * 30.0 + 1e-6)
	var seen := fx_at(back, at, 0.0, 0.0, turn).y
	for c in crystals():
		if float(c["a"]) > front:
			continue
		var age := t - maxf(0.0, reaches_at(maxf(FROM, float(c["a"]))))
		var up := crystal_up(age)
		if up <= 0.03:
			continue
		var p := fx_at(back, c["a"], c["s"], 0.0, turn)
		if near == "behind" and p.y > seen:
			continue
		if near == "before" and p.y <= seen:
			continue
		var tall := maxi(2, GP.rnd(float(c["tall"]) * up))
		var lean: float = float(c["lean"]) * (-1.0 if back else 1.0)
		var big := up > 0.55
		for h in tall:
			var ww := maxi(0, GP.rnd(float(c["w"]) * (1.0 - float(h) / tall)))
			var cx := p.x + lean * h / maxf(1.0, tall)
			for x in range(-ww, ww + 1):
				_pen(d, b, cx + x, p.y - h, FROST[3] if x < 0 else (FROST[4] if x == 0 else ICE[1]))
			_pen(d, b, cx - ww - 1, p.y - h, FROST[1])
			_pen(d, b, cx + ww + 1, p.y - h, PINK[0] if h < 2 and big and int(c["seed"]) % 2 == 0 else FROST[0])
		# (a crack across it, and a glint at its point)
		if tall > 6:
			_pen(d, b, p.x + lean * 0.45, p.y - GP.rnd(tall * 0.45), FROST[1])
		if (fr + int(c["seed"])) % 7 < 2 or age < 0.1:
			_pen(d, b, p.x + lean, p.y - tall, "#ffffff")
