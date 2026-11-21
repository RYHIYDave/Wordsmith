## SCARVES AND FEATHERS THAT REALLY MOVE (engine/tails.ts Tails, line for line): what flies from a hero (the Warrior's scarf, the
## feather in the Ranger's cap, the Mage's braids) is not in his frames: each frame only says where such a thing is fixed (the
## bake's part `tails`: {id, x, y, over}, in game pixels from the picture's top left), and this hangs a little chain of points from
## that spot and moves it every frame, 120 small steps a second: it trails behind him when he runs, swings on past him when he
## stops, whips round when he turns or strikes, ripples in the wind when he stands, and never repeats. Its kinds, assets/heroes/
## clips.json `tails` (art/heroes.ts HERO_TAILS).
##   A chain lives in the world as it is laid out on the screen (game pixels), so it has real momentum. It is painted the way the
## game's kit paints cloth (paint: flat tones, light along its upper-left edge, shade along its lower-right, the dark seam round
## it) into a patch of picture pixels PW x PH whose pixel (HW, UP) is his feet: `behind` and `over`, each a texture, drawn with
## the figure (hero.gd; the class cards, class_cards.gd).
extends RefCounted

const SUB := 1.0 / 120.0
const INK := [14, 12, 36]
const HW := 96
const UP := 112
const DOWN := 40
const PW := HW * 2
const PH := UP + DOWN

var defs: Dictionary = {}
## id -> {p, q (PackedFloat32Array, x, y pairs, world pixels: now and one step ago), over, def, rx, ry (where its fixed end was)}
var chains: Dictionary = {}
var clock := 0.0
var left := 0.0
var ox := 0.0
var oy := 0.0
var placed := false
var mask := PackedByteArray()
## (the two patches as last painted: their pictures, and the box of each that was painted, or an empty Rect2i)
var tex := {false: null, true: null}
var box := {false: Rect2i(), true: Rect2i()}
## (the patch painted into, RGBA, PW x PH: paint() writes it, refresh() takes each pass's picture from it, as the game's one buffer)
var work := PackedByteArray()


func _init(d: Dictionary) -> void:
	defs = d
	mask.resize(PW * PH)
	work.resize(PW * PH * 4)


## Forget where everything was (a new figure).
func reset() -> void:
	chains.clear()
	placed = false


func _seed(c: Dictionary, rx: float, ry: float, facing: float) -> void:
	var d: Dictionary = c["def"]
	var p: PackedFloat32Array = c["p"]
	var q: PackedFloat32Array = c["q"]
	var x := rx
	var y := ry
	for i in int(d["n"]) + 1:
		if i > 0:
			var s := _rest_step(d, i, facing)
			x += s[0]
			y += s[1]
		p[i * 2] = x
		q[i * 2] = x
		p[i * 2 + 1] = y
		q[i * 2 + 1] = y
	c["p"] = p
	c["q"] = q


## The i-th step of a tail's shape in still air (cloth with no shape of its own hangs back and down).
func _rest_step(d: Dictionary, i: int, facing: float) -> Array:
	var rest: Array = d.get("rest", [])
	var rx := -0.8
	var ry := 0.6
	if not rest.is_empty():
		var r: Array = rest[mini(i - 1, rest.size() - 1)]
		rx = float(r[0])
		ry = float(r[1])
	var len := sqrt(rx * rx + ry * ry)
	if len == 0.0:
		len = 1.0
	var seg := float(d["seg"])
	# (a pair of doubles, not a Vector2, which is single-precision: the game works its chains in doubles, kept in Float32Arrays)
	return [rx / len * seg * facing, ry / len * seg]


## Move every tail on by `dt` seconds. `roots` is where the frame being shown fixes them, (ax, ay) that frame's anchor, in the
## same units (game pixels); `facing` +1 for a figure facing screen-right, -1 for screen-left; (fx, fy) where his feet are in the
## world as it is laid out on the screen, in game pixels (a figure on a card passes 0, 0).
func step(dt: float, roots: Array, ax: float, ay: float, facing: float, fx: float, fy: float) -> void:
	# (a figure moved further at once than anything runs or rolls, a warp, a new level, takes its tails with it)
	if not placed or sqrt((fx - ox) * (fx - ox) + (fy - oy) * (fy - oy)) > 10.0 + 420.0 * minf(maxf(dt, 0.0), 0.1):
		var dx := fx - ox
		var dy := fy - oy
		for c in chains.values():
			c["rx"] = float(c["rx"]) + dx
			c["ry"] = float(c["ry"]) + dy
			var p: PackedFloat32Array = c["p"]
			var q: PackedFloat32Array = c["q"]
			for i in int(c["def"]["n"]) + 1:
				p[i * 2] += dx
				q[i * 2] += dx
				p[i * 2 + 1] += dy
				q[i * 2 + 1] += dy
			c["p"] = p
			c["q"] = q
		placed = true
	ox = fx
	oy = fy
	# (a tail gone from the figure is dropped; a new one starts in its still-air shape)
	for id in chains.keys():
		var kept := false
		for r in roots:
			if r["id"] == id:
				kept = true
		if not kept:
			chains.erase(id)
	for r in roots:
		var def = defs.get(r["id"])
		if def == null:
			continue
		var c = chains.get(r["id"])
		if c == null:
			var n := int(def["n"]) + 1
			var p := PackedFloat32Array()
			p.resize(n * 2)
			var q := PackedFloat32Array()
			q.resize(n * 2)
			c = {"p": p, "q": q, "over": bool(r["over"]), "def": def, "rx": fx + float(r["x"]) - ax, "ry": fy + float(r["y"]) - ay}
			_seed(c, c["rx"], c["ry"], facing)
			chains[r["id"]] = c
		c["over"] = bool(r["over"])
	left += minf(maxf(dt, 0.0), 0.1)
	var steps := int(floorf(left / SUB))
	for j in range(1, steps + 1):
		left -= SUB
		clock += SUB
		var k := 0
		for r in roots:
			var c = chains.get(r["id"])
			if c == null:
				continue
			# (the fixed end carried smoothly from where it was to where it is now: a tail jerked along once a frame is thrown about)
			var tx := fx + float(r["x"]) - ax
			var ty := fy + float(r["y"]) - ay
			var crx := float(c["rx"])
			var cry := float(c["ry"])
			_sub(c, crx + (tx - crx) * j / steps, cry + (ty - cry) * j / steps, facing, k, float(r.get("blast", 0.0)))
			k += 1
			if j == steps:
				c["rx"] = tx
				c["ry"] = ty


func _sub(c: Dictionary, rx: float, ry: float, facing: float, k: int, blast := 0.0) -> void:
	var d: Dictionary = c["def"]
	var p: PackedFloat32Array = c["p"]
	var q: PackedFloat32Array = c["q"]
	var n := int(d["n"])
	var seg := float(d["seg"])
	var keep := maxf(0.0, 1.0 - float(d["drag"]) * SUB)
	var rate := float(d["rate"])
	var flutter := float(d["flutter"])
	var wind := float(d["wind"])
	var gravity := float(d["gravity"])
	# the fixed end goes where the figure puts it
	q[0] = p[0]
	q[1] = p[1]
	p[0] = rx
	p[1] = ry
	for i in range(1, n + 1):
		var t := float(i) / n
		var x: float = p[i * 2]
		var y: float = p[i * 2 + 1]
		# what it was doing, a little less of it: the air slows it
		var nx := x + (x - q[i * 2]) * keep
		var ny := y + (y - q[i * 2 + 1]) * keep
		# the standing wind blows it back from the way the figure faces, gravity pulls it down, a ripple runs along it from the fixed
		# end to the free one (each tail in its own time); in a blast the ripple bigger and three times as fast
		var ripple := sin(clock * rate * (3.0 if blast > 0.0 else 1.0) * PI * 2.0 - t * 5.6 + k * 2.1) * flutter * (0.3 + 0.7 * t) * (1.0 + blast * 1.6)
		var gust := 1.0 + 0.25 * sin(clock * 1.7 + k) + blast * 2.4
		nx += -facing * wind * gust * SUB * SUB
		ny += (gravity + ripple) * SUB * SUB
		q[i * 2] = x
		q[i * 2 + 1] = y
		p[i * 2] = nx
		p[i * 2 + 1] = ny
	# a quill springs back toward the shape it grew in
	var stiff := float(d.get("stiff", 0.0))
	if stiff > 0.0:
		var tx := rx
		var ty := ry
		for i in range(1, n + 1):
			var s := _rest_step(d, i, facing)
			tx += s[0]
			ty += s[1]
			var pull := stiff * (1.0 - 0.6 * (float(i) / n)) * 0.2
			p[i * 2] += (tx - p[i * 2]) * pull
			p[i * 2 + 1] += (ty - p[i * 2 + 1]) * pull
	# and it does not stretch: neighbours pulled back to their distance, each giving half the way (the fixed end nothing), a few times
	for pass_ in 5:
		for i in range(1, n + 1):
			var a := (i - 1) * 2
			var b := i * 2
			var dx: float = p[b] - p[a]
			var dy: float = p[b + 1] - p[a + 1]
			var len := sqrt(dx * dx + dy * dy)
			if len == 0.0:
				len = 0.0001
			var off := (len - seg) / len
			if i == 1:
				p[b] -= dx * off
				p[b + 1] -= dy * off
			else:
				p[a] += dx * off * 0.5
				p[a + 1] += dy * off * 0.5
				p[b] -= dx * off * 0.5
				p[b + 1] -= dy * off * 0.5
	# (cloth gives a little and no more: a link a hard pull has left too long is drawn in)
	var most := seg * 1.1
	for i in range(1, n + 1):
		var a := (i - 1) * 2
		var b := i * 2
		var dx: float = p[b] - p[a]
		var dy: float = p[b + 1] - p[a + 1]
		var len := sqrt(dx * dx + dy * dy)
		if len > most:
			p[b] = p[a] + dx / len * most
			p[b + 1] = p[a + 1] + dy / len * most
	c["p"] = p
	c["q"] = q


## Where each tail's light is now (a glowing feather), in game pixels from the figure's feet: [{x, y, r, color, a}].
func lights() -> Array:
	var out: Array = []
	for c in chains.values():
		var g = c["def"].get("glow")
		if g == null:
			continue
		var n := int(c["def"]["n"])
		var p: PackedFloat32Array = c["p"]
		var at := float(g.get("at", 0.6)) * n
		var i := mini(n - 1, int(floorf(at)))
		var u := at - i
		out.append({"x": p[i * 2] + (p[i * 2 + 2] - p[i * 2]) * u - ox, "y": p[i * 2 + 1] + (p[i * 2 + 3] - p[i * 2 + 1]) * u - oy, "r": float(g["r"]), "color": g["color"], "a": float(g["a"])})
	return out


static func _rgb(hex: String) -> Array:
	return [hex.substr(1, 2).hex_to_int(), hex.substr(3, 2).hex_to_int(), hex.substr(5, 2).hex_to_int()]


## Paint the tails behind the figure (`over` false) or in front of it (true) into `work` (RGBA, PW x PH, pixel (HW, UP) his feet).
## Returns the box painted, or an empty Rect2i if there was nothing to paint.
func paint(over: bool) -> Rect2i:
	var x0 := PW
	var y0 := PH
	var x1 := -1
	var y1 := -1
	var tones: Array = []
	var tips: Array = []
	var k := 0
	for c in chains.values():
		if bool(c["over"]) != over:
			continue
		if k == 0:
			mask.fill(0)
		k += 1
		var d: Dictionary = c["def"]
		tones.append(_rgb(d["dark"]))
		tones.append(_rgb(d["mid"]))
		tones.append(_rgb(d["light"]))
		tips.append(_rgb(d["tip"]) if d.has("tip") else null)
		var n := int(d["n"])
		var w0 := float(d["w0"])
		var w1 := float(d["w1"])
		var belly := float(d.get("belly", 0.0))
		var tipped_k := 100 + k if d.has("tip") else k
		var p: PackedFloat32Array = c["p"]
		# discs strung along the chain, half a picture pixel apart
		for i in n:
			var ax := (p[i * 2] - ox) * 2.0 + HW
			var ay := (p[i * 2 + 1] - oy) * 2.0 + UP
			var bx := (p[i * 2 + 2] - ox) * 2.0 + HW
			var by := (p[i * 2 + 3] - oy) * 2.0 + UP
			var steps := maxi(1, int(ceilf(sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay)) * 2.0)))
			for s in steps + 1:
				var u := float(s) / steps
				var t := (i + u) / n
				var r := (w0 + (w1 - w0) * t + belly * sin(PI * t)) / 2.0
				var cx := ax + (bx - ax) * u
				var cy := ay + (by - ay) * u
				for py in range(int(floorf(cy - r)), int(ceilf(cy + r)) + 1):
					if py < 2 or py >= PH - 2:
						continue
					for px in range(int(floorf(cx - r)), int(ceilf(cx + r)) + 1):
						if px < 2 or px >= PW - 2:
							continue
						var ex := px + 0.5 - cx
						var ey := py + 0.5 - cy
						if ex * ex + ey * ey > r * r:
							continue
						# (the last stretch of a fringed tail marked apart: 100 + its number)
						mask[py * PW + px] = tipped_k if t > 0.9 else k
						if px < x0:
							x0 = px
						if px > x1:
							x1 = px
						if py < y0:
							y0 = py
						if py > y1:
							y1 = py
	if k == 0 or x1 < 0:
		return Rect2i()
	x0 -= 1
	y0 -= 1
	x1 += 1
	y1 += 1
	for py in range(y0, y1 + 1):
		for px in range(x0, x1 + 1):
			var i := py * PW + px
			var o := i * 4
			var m: int = mask[i]
			if m == 0:
				# the seam: an empty pixel beside a filled one
				if mask[i - 1] != 0 or mask[i + 1] != 0 or mask[i - PW] != 0 or mask[i + PW] != 0:
					work[o] = INK[0]
					work[o + 1] = INK[1]
					work[o + 2] = INK[2]
					work[o + 3] = 255
				else:
					work[o + 3] = 0
				continue
			var tipped := m > 100
			var id := m - 100 if tipped else m
			var tip = tips[id - 1]
			if tipped and tip != null and (px + py) % 2 == 0:
				work[o] = tip[0]
				work[o + 1] = tip[1]
				work[o + 2] = tip[2]
				work[o + 3] = 255
				continue
			# lit from the upper left as the kit lights cloth: how many diagonal steps to the edge on the lit side and on the shaded side
			# decide the tone (two pixels of each, when it is thick enough)
			var a := 1 if (mask[i - PW - 1] == 0 or (mask[i - 1] == 0 and mask[i - PW] == 0)) else (2 if (mask[i - 2 * PW - 2] == 0 or (mask[i - PW - 2] == 0 and mask[i - 2 * PW - 1] == 0)) else 3)
			var b := 1 if (mask[i + PW + 1] == 0 or (mask[i + 1] == 0 and mask[i + PW] == 0)) else (2 if (mask[i + 2 * PW + 2] == 0 or (mask[i + PW + 2] == 0 and mask[i + 2 * PW + 1] == 0)) else 3)
			var tone := 0 if (b <= 1 and a > 1) else (2 if a <= 1 else (0 if (b <= 2 and a > 2) else (2 if (a <= 2 and b > 2) else 1)))
			var col: Array = tones[(id - 1) * 3 + tone]
			work[o] = col[0]
			work[o + 1] = col[1]
			work[o + 2] = col[2]
			work[o + 3] = 255
	return Rect2i(x0, y0, x1 - x0 + 1, y1 - y0 + 1)


## Paint both patches into their pictures (call once a frame, after step): `tex[over]` and `box[over]` for whoever draws them.
func refresh() -> void:
	for over in [false, true]:
		var any := false
		for c in chains.values():
			if bool(c["over"]) == over:
				any = true
		if not any:
			box[over] = Rect2i()
			continue
		var r := paint(over)
		box[over] = r
		if r.size.x <= 0:
			continue
		var img := Image.create_from_data(PW, PH, false, Image.FORMAT_RGBA8, work)
		if tex[over] == null:
			tex[over] = ImageTexture.create_from_image(img)
		else:
			tex[over].update(img)


## Draw a patch (`over` false: the tails behind the figure; true: in front) on `ci`, the figure's feet at (x, y), `scale` units to
## a game pixel (hero.gd: 2, its world being in picture pixels; a class card: 2 game pixels, so 2 also, drawn in game pixels).
func draw_on(ci: CanvasItem, x: float, y: float, over: bool, scale: float, mod := Color.WHITE) -> void:
	var r: Rect2i = box[over]
	if r.size.x <= 0 or tex[over] == null:
		return
	ci.draw_texture_rect_region(tex[over], Rect2(x + (r.position.x - HW) / 2.0 * scale, y + (r.position.y - UP) / 2.0 * scale, r.size.x / 2.0 * scale, r.size.y / 2.0 * scale), Rect2(r.position, r.size), mod)
