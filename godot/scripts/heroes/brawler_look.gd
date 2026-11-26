## THE BRAWLER (THE VETERAN) AS THE GAME DRAWS HIM (render/veteran_fx.ts; his frames and his action lines the art chat's, baked with
## the rest of his pictures: art/veteran_art.ts, art/veteran_fx_art.ts; his effects' pieces painted once, assets/heroes/
## veteran_fx-0.png, tools/godot_veteran.ts):
##   HIS ACTION LINES: each move's three layers (on the floor, behind him at height, over everything), laid from where he stood as
##     it began, at its frame, and on after it ends for its dust and its force to die away (16 frames).
##   HIS AFTER-IMAGES along a strike: where he was a whole frame and half a frame ago, every solid pixel of him in his blow's colours
##     (green a punch's, hot orange a kick's), its rim one colour and the rest another; just behind him.
##   A BURST on each one his blow strikes, a little toward the blow; a SHOCKWAVE RING along the floor under a heavy blow; STARS round
##     the head of one his uppercut has launched, while it is stunned. The screen shaken on his heavy blows' frames.
##   HIS GLOBES over his head (dev/veteran_globes.ts, painted pixel by pixel as the game paints them): three, empty until filled,
##     green a punch, hot orange a kick, white the jump, filling as they come in; locked, the rims white and a bar joining them;
##     green or orange fire for a swipe's flying blow; a combo that is over draining away. Never pink, never gold.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const BakedHero := preload("res://scripts/baked_hero.gd")

var kit
var loot
var air: Node2D
const B2 := preload("res://scripts/heroes/brawler2.gd")
var V := {}
var _sheet: Texture2D
var _pics := {}
var _clock := 0.0
## (each move being played or playing out its lines after it: {n, id, x0, y0, fx, fy, f, rate, live, struck})
var plays: Array = []
var bursts: Array = []
var launched := {}
var slots: Array = []
var drain := {}
var _behind: Node2D
var _ghosts: Array = []
var _globe_img: Image
var _globe_tex: ImageTexture
var _ghost_shader: Shader

const FACING := ["front", "toward", "frontL", "sideL", "backL", "away", "back", "side"]
const AFTER := 16
const FILL := {"punch": 4.0, "kick": 9.0, "jump": 3.0}
const GHOST := """
shader_type canvas_item;
uniform vec4 fill_c : source_color;
uniform vec4 edge_c : source_color;
uniform vec4 region;
bool solid(sampler2D t, vec2 q) {
	if (q.x < region.x || q.y < region.y || q.x > region.x + region.z || q.y > region.y + region.w) return false;
	return texture(t, q).a > 0.996;
}
void fragment() {
	if (!solid(TEXTURE, UV)) discard;
	vec2 p = TEXTURE_PIXEL_SIZE;
	bool edge = !solid(TEXTURE, UV + vec2(p.x, 0.0)) || !solid(TEXTURE, UV - vec2(p.x, 0.0)) || !solid(TEXTURE, UV + vec2(0.0, p.y)) || !solid(TEXTURE, UV - vec2(0.0, p.y));
	COLOR = edge ? edge_c : fill_c;
}
"""


class _Air extends Node2D:
	var look

	func _draw() -> void:
		look.draw_air(self)


## What is behind him at height and his after-images, drawn just before his picture (a child of his, first among them).
class _Behind extends Node2D:
	var look

	func _draw() -> void:
		look.draw_behind(self)


func _ready() -> void:
	V = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/veteran.json"))
	# (the two flying moves of the Brawler remade: their stand-in frames, heroes/brawler2.gd)
	B2.alias(V)
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/veteran_fx.json"))
	_pics = d["pics"]
	_sheet = load("res://assets/heroes/veteran_fx-0.png")
	_ghost_shader = Shader.new()
	_ghost_shader.code = GHOST
	air = _Air.new()
	air.look = self
	air.z_index = 40
	add_child(air)


func _exit_tree() -> void:
	if _behind != null and is_instance_valid(_behind):
		_behind.queue_free()
	_behind = null


func on_event(_e: Dictionary, _fx) -> void:
	pass


static func js_num(v: float) -> String:
	return "%d" % int(v) if v == floorf(v) else str(v)


func _side_of(fx: float, fy: float) -> int:
	var k := posmod(roundi(rad_to_deg(atan2(fy, fx)) / 45.0), 8)
	return BakedHero.SIDES.find(FACING[k])


## The way a side faces on the floor, and his left (from all eight sides never a mirror: render/veteran_fx.ts vetView).
func _view(fx: float, fy: float) -> Array:
	var k := posmod(roundi(rad_to_deg(atan2(fy, fx)) / 45.0), 8)
	var f := Vector2(cos(k * PI / 4.0), sin(k * PI / 4.0))
	return [f, Vector2(f.y, -f.x)]


## (veteran_fx.ts screenOf) A point of a move's scene (his measure, along his forward and left), from a floor point: game pixels.
func _screen_of(v: Array, a: float, b: float) -> Vector2:
	var t: float = V["tile"]
	var X: float = (a * v[0].x + b * v[1].x) / t
	var Y: float = (a * v[0].y + b * v[1].y) / t
	return Vector2((X - Y) * 16.0, (X + Y) * 8.0)


func _gx(x: float, y: float) -> float:
	var fx = kit.h.fx if kit != null else null
	return fx.gx(x, y) if fx != null and is_instance_valid(fx) else (x - y) * 16.0


func _gy(x: float, y: float) -> float:
	var fx = kit.h.fx if kit != null else null
	return fx.gy(x, y) if fx != null and is_instance_valid(fx) else (x + y) * 8.0


func _process(dt: float) -> void:
	if kit == null:
		return
	_clock += dt
	_step(dt)
	queue_redraw()
	air.queue_redraw()
	# (his behind-layer, a child of his drawn first: made, and made again in a new place)
	var h = kit.h
	if _behind == null or not is_instance_valid(_behind) or _behind.get_parent() != h:
		_behind = _Behind.new()
		_behind.look = self
		h.add_child(_behind)
		h.move_child(_behind, 0)
		_ghosts.clear()
		for i in 2:
			var s := Sprite2D.new()
			s.centered = false
			s.material = ShaderMaterial.new()
			s.material.shader = _ghost_shader
			s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
			s.visible = false
			_behind.add_child(s)
			_ghosts.append(s)
	_behind.queue_redraw()
	_place_ghosts()


## (veteran_fx.ts step) Which move he is playing, how far through it; the blows seen landing; the screen shaken on his heavy blows;
## the globes coming in and draining away.
func _step(dt: float) -> void:
	var mv: Dictionary = kit.mv
	for p in plays:
		if not mv.is_empty() and p["n"] == mv["n"] and p["live"]:
			if dt > 0.0 and float(mv["f"]) > float(p["f"]):
				p["rate"] = clampf((float(mv["f"]) - float(p["f"])) / dt, 10.0, 120.0)
			p["f"] = mv["f"]
			p["x0"] = float(mv["x0"]) + float(mv["wx"])
			p["y0"] = float(mv["y0"]) + float(mv["wy"])
		else:
			p["live"] = false
			p["f"] = float(p["f"]) + float(p["rate"]) * dt
	if not mv.is_empty() and not plays.any(func(q): return q["live"] and q["n"] == mv["n"]):
		plays.append({"n": mv["n"], "id": mv["id"], "x0": mv["x0"], "y0": mv["y0"], "fx": mv["fx"], "fy": mv["fy"], "f": mv["f"], "rate": 30.0, "live": true, "struck": []})
	var live = null
	for p in plays:
		if p["live"]:
			live = p
	if live != null and not mv.is_empty():
		var ss: Array = V["moves"][live["id"]]["strikes"]
		for o in mv["hit"]:
			if (live["struck"] as Array).has(o):
				continue
			live["struck"].append(o)
			if not is_instance_valid(o) or ss.is_empty():
				continue
			_burst_on(live, ss[0], o.world, (live["struck"] as Array).size() - 1)
			if live["id"] == "uppercut" or live["id"] == "hammerfist":
				launched[o] = _clock
	plays = plays.filter(func(p): return p["live"] or float(p["f"]) < float(V["moves"][p["id"]]["long"]) + AFTER)
	bursts = bursts.filter(func(b): return plays.has(b["play"]) and float(b["play"]["f"]) - float(b["born"]) < 10.0)
	for o in launched.keys():
		if not is_instance_valid(o) or o.dead or (o.stun_t <= 0.0 and _clock - float(launched[o]) > 0.5):
			launched.erase(o)
	# THE SCREEN SHAKEN on his heavy blows, as the art's film shakes it
	if live != null:
		var F := floori(float(live["f"]))
		for r in V["moves"][live["id"]]["shake"]:
			if F >= int(r[0]) and F <= int(r[1]) and kit.h.fx != null:
				kit.h.fx.kick(2.0)
	# THE GLOBES: each its kind and when it came in; a combo that is over drains away
	var now: Array = kit.globes
	if now.is_empty() and not slots.is_empty() and drain.is_empty():
		drain = {"slots": slots, "t0": _clock}
	if not now.is_empty():
		drain = {}
	var next: Array = []
	for i in now.size():
		next.append(slots[i] if i < slots.size() and slots[i]["kind"] == now[i] else {"kind": now[i], "t0": _clock})
	slots = next
	if not drain.is_empty() and _clock - float(drain["t0"]) > 8.0 / 30.0:
		drain = {}


## (veteran_fx.ts burstOn) A burst on one struck (and, under a heavy blow, a ring along the floor), a little toward the blow.
func _burst_on(p: Dictionary, s: Dictionary, at: Vector2, n: int) -> void:
	var o := Vector2(p["x0"], p["y0"])
	var z := 26.0
	if s["o"] != null:
		var v := _view(p["fx"], p["fy"])
		var g: Array = s["o"]
		var t: float = V["tile"]
		o += (v[0] * float(g[0]) + v[1] * float(g[1])) / t
		z = clampf(float(g[2]), 24.0, 48.0)
	var d := o - at
	var dd := d.length() if d.length() > 0.0 else 1.0
	var b: Vector2 = at + d / dd * (7.0 / float(V["tile"]))
	bursts.append({"play": p, "born": floorf(float(p["f"])), "x": b.x, "y": b.y, "z": z, "kind": s["kind"], "heavy": s["heavy"], "big": s["big"],
		"late": 1 if s["under"] else 0, "ring": s["ring"], "seed": 101 + (n % 4) * 17})


## One of his effects' pieces, its anchor at (x, y) game pixels, on `c`.
func _piece(c: CanvasItem, key: String, x: float, y: float) -> void:
	var p = _pics.get(key)
	if p == null or (p as Array).is_empty():
		return
	c.draw_texture_rect_region(_sheet, Rect2(roundf(x) * 2.0 - float(p[4]), roundf(y) * 2.0 - float(p[5]), p[2], p[3]), Rect2(p[0], p[1], p[2], p[3]))


## A layer of a play's action lines at its frame (0 the floor's, 1 behind him, 2 over everything), at where he stood (`at`, picture
## pixels on `c`).
func _layer(c: CanvasItem, p: Dictionary, layer: int, at: Vector2) -> void:
	var art = kit.h.art
	var F := floori(float(p["f"]))
	var list: int = 80 + (V["lists"] as Array).find(B2.art_of(p["id"])) * 3 + layer
	var side := _side_of(p["fx"], p["fy"])
	if F < 0 or F >= art.count(side, list):
		return
	var f: Dictionary = art.frame(side, list, F)
	var tex: Texture2D = f["tex"]
	if tex.get_width() <= 2 and tex.get_height() <= 2:
		return
	var sc: float = f["scale"]
	c.draw_texture_rect(tex, Rect2(at + (f["offset"] as Vector2) * sc, tex.get_size() * sc), false)


## WHAT LIES ON THE FLOOR: his action lines' floor layer; the rings under his heavy blows.
func _draw() -> void:
	if kit == null:
		return
	for p in plays:
		_layer(self, p, 0, Vector2(roundf(_gx(p["x0"], p["y0"])), roundf(_gy(p["x0"], p["y0"]))) * 2.0)
	for b in bursts:
		var age := floori(float(b["play"]["f"]) - float(b["born"]))
		if float(b["ring"]) <= 0.0 or age < 0 or age > 9:
			continue
		_piece(self, "ring|%s|%s|%d" % [b["kind"], js_num(b["ring"]), age], _gx(b["x"], b["y"]), _gy(b["x"], b["y"]))


## WHAT IS BEHIND HIM AT HEIGHT (on his own canvas, drawn first): his action lines' behind layer.
func draw_behind(c: CanvasItem) -> void:
	var h = kit.h
	for p in plays:
		var at: Vector2 = Vector2(roundf(_gx(p["x0"], p["y0"])), roundf(_gy(p["x0"], p["y0"]))) * 2.0 - h.position
		_layer(c, p, 1, at)


## HIS AFTER-IMAGES along the strike: where he was a whole frame and half a frame ago (the two ghost sprites, just behind him).
func _place_ghosts() -> void:
	for g in _ghosts:
		g.visible = false
	var h = kit.h
	var mv: Dictionary = kit.mv
	if mv.is_empty():
		return
	var live = null
	for p in plays:
		if p["live"]:
			live = p
	if live == null:
		return
	var M: Dictionary = V["moves"][live["id"]]
	var side := _side_of(live["fx"], live["fy"])
	var idx: int = (V["lists"] as Array).find(B2.art_of(live["id"]))
	var list := 58 + idx
	var halves_list := 69 + idx
	var halves = M["halves"]
	var v := _view(live["fx"], live["fy"])
	var F := floori(float(live["f"]))
	var at: Array = M["at"]
	var o: Array = at[mini(at.size() - 1, F * 2)]
	var used := 0
	for s in M["strikes"]:
		if not (F > int(s["from"]) and F <= int(s["last"]) + 1):
			continue
		var cols: Array = V["cols"][s["kind"]]
		for pick in [[1.0, 1, 2], [0.5, 2, 3]]:
			var gf := maxf(float(s["from"]), F - float(pick[0]))
			if gf >= F or used >= _ghosts.size():
				continue
			var fr: Dictionary
			if gf == floorf(gf):
				if int(gf) >= h.art.count(side, list):
					continue
				fr = h.art.frame(side, list, int(gf))
			else:
				if halves == null:
					continue
				var k := roundi(gf - float(halves[0]))
				if k < 0 or k >= h.art.count(side, halves_list):
					continue
				fr = h.art.frame(side, halves_list, k)
			var q: Array = at[mini(at.size() - 1, roundi(gf * 2.0))]
			var d := _screen_of(v, float(q[0]) - float(o[0]), float(q[1]) - float(o[1]))
			var g: Sprite2D = _ghosts[used]
			used += 1
			var tex: AtlasTexture = fr["tex"]
			g.texture = tex
			g.offset = fr["offset"]
			g.scale = Vector2.ONE * float(fr["scale"])
			g.position = Vector2(d.x * 2.0, d.y * 2.0 - h._lift)
			var size := tex.atlas.get_size()
			var r := tex.region
			g.material.set_shader_parameter("region", Vector4(r.position.x / size.x, r.position.y / size.y, r.size.x / size.x, r.size.y / size.y))
			g.material.set_shader_parameter("fill_c", Color(cols[pick[1]]))
			g.material.set_shader_parameter("edge_c", Color(cols[pick[2]]))
			g.visible = true


## WHAT IS OVER EVERYTHING: his action lines' top layer; the bursts of his blows; stars; his globes.
func draw_air(c: CanvasItem) -> void:
	if kit == null:
		return
	for p in plays:
		_layer(c, p, 2, Vector2(roundf(_gx(p["x0"], p["y0"])), roundf(_gy(p["x0"], p["y0"]))) * 2.0)
	for b in bursts:
		var age := floori(float(b["play"]["f"]) - float(b["born"])) - int(b["late"])
		if age < 0 or age > 6:
			continue
		_piece(c, "burst|%s|%s|%s|%d|%d" % [b["kind"], str(b["heavy"]), js_num(b["big"]), int(b["seed"]), age], _gx(b["x"], b["y"]), _gy(b["x"], b["y"]) - float(b["z"]) / 2.0)
	for o in launched.keys():
		if not is_instance_valid(o) or o.dead or _clock - float(launched[o]) < 10.0 / 30.0:
			continue
		var k := roundi(fmod(_clock * 30.0 * 0.32, TAU) / TAU * 40.0) % 40
		_piece(c, "stars|%d" % k, _gx(o.world.x, o.world.y), _gy(o.world.x, o.world.y) - o._head() - 4.0 - o.pop)
	_draw_globes(c)


# =====================================================================================================================
# HIS GLOBES (dev/veteran_globes.ts paintGlobes, render/veteran_fx.ts drawGlobes)

func _draw_globes(c: CanvasItem) -> void:
	var h = kit.h
	if h.in_town or not h.alive:
		return
	var level := func(s: Dictionary) -> float:
		if s["kind"] == "punchFire" or s["kind"] == "kickFire":
			return 1.0
		return minf(1.0, ((_clock - float(s["t0"])) * 30.0 + 1.0) / float(FILL[s["kind"]]))
	var globe_of := func(s, drain_k: float) -> Dictionary:
		if s == null:
			return {"kind": "empty"}
		if s["kind"] == "punchFire" or s["kind"] == "kickFire":
			var of: String = "punch" if s["kind"] == "punchFire" else "kick"
			return {"kind": "fire", "of": of} if drain_k > 0.5 else {"kind": of, "level": drain_k * 2.0}
		return {"kind": s["kind"], "level": minf(level.call(s), drain_k)}
	var row: Array = []
	var locked := false
	if not drain.is_empty():
		var k := maxf(0.0, 1.0 - ((_clock - float(drain["t0"])) * 30.0) / 8.0)
		var ss: Array = drain["slots"]
		for i in kit.most():
			row.append(globe_of.call(ss[i] if i < ss.size() else null, k))
		locked = ss.size() >= kit.most() and k >= 0.6
	else:
		for i in kit.most():
			row.append(globe_of.call(slots[i] if i < slots.size() else null, 1.0))
		locked = slots.size() >= kit.most() and row.all(func(r): return r["kind"] == "fire" or (r["kind"] != "empty" and float(r["level"]) >= 1.0))
	var img := _paint_globes(row, locked, floori(_clock * 30.0))
	if _globe_tex == null or _globe_tex.get_size() != Vector2(img.get_size()):
		_globe_tex = ImageTexture.create_from_image(img)
	else:
		_globe_tex.update(img)
	# (over his head, ten of his measure over it, following him through his moves; never down over the bar of his life)
	var mv: Dictionary = kit.mv
	var head: Array = V["standHead"]
	if not mv.is_empty():
		var hs: Array = V["moves"][mv["id"]]["head"]
		head = hs[clampi(floori(float(mv["f"])), 0, hs.size() - 1)]
	var v := _view(float(mv["fx"]) if not mv.is_empty() else h.face.x, float(mv["fy"]) if not mv.is_empty() else h.face.y)
	var d := _screen_of(v, float(head[0]), float(head[1]))
	var hx := roundf(_gx(h.world.x, h.world.y))
	var hy := roundf(_gy(h.world.x, h.world.y))
	var W := float(img.get_width())
	var GH := float(img.get_height())
	var tx := hx + d.x
	var ty := hy + d.y - (float(head[2]) + 10.0) / 2.0
	var bar_y := hy - 52.0 - 1.0
	var bx := roundf(tx - W / 4.0)
	var by := roundf(minf(ty - (GH + 2.0) / 2.0, bar_y - 1.0 - GH / 2.0))
	c.draw_texture(_globe_tex, Vector2(bx, by) * 2.0)


## (veteran_globes.ts paintGlobes) The globes in a row, painted at the game's size, pixel by pixel.
func _paint_globes(row: Array, locked: bool, flick: int) -> Image:
	var GL: Dictionary = V["globe"]
	var r: int = GL["r"]
	var gap: int = GL["gap"]
	var fire: int = GL["fire"]
	var pad: int = GL["pad"]
	var n := row.size()
	var W := pad * 2 + n * (r * 2 + 1) + (n - 1) * gap
	var H: int = GL["h"]
	if _globe_img == null or _globe_img.get_width() != W:
		_globe_img = Image.create(W, H, false, Image.FORMAT_RGBA8)
	var img := _globe_img
	img.fill(Color(0, 0, 0, 0))
	var INK := Color(GL["ink"])
	var WHITE: Array = GL["white"]
	var GLASS: Array = GL["glass"]
	var ramp_of := func(k: String) -> Array:
		return GL["green"] if k == "punch" or k == "punchFire" else (GL["orange"] if k == "kick" or k == "kickFire" else WHITE)
	var put := func(x: int, y: int, col) -> void:
		if x >= 0 and y >= 0 and x < W and y < H:
			img.set_pixel(x, y, Color(col))
	var cy := pad + fire + r
	var centres: Array = []
	for i in n:
		centres.append(pad + r + i * (2 * r + 1 + gap))
	if locked:
		var y := cy + r - 1
		for x in range(centres[0], centres[n - 1] + 1):
			put.call(x, y, INK)
			put.call(x, y + 1, WHITE[3])
			put.call(x, y + 2, INK)
	for i in n:
		var g: Dictionary = row[i]
		var cx: int = centres[i]
		var fire_of = g["of"] if g["kind"] == "fire" else null
		var fill: float = 1.0 if g["kind"] == "fire" else (0.0 if g["kind"] == "empty" else float(g["level"]))
		var liquid = ramp_of.call(g["of"]) if g["kind"] == "fire" else (null if g["kind"] == "empty" else ramp_of.call(g["kind"]))
		if fire_of != null:
			_paint_fire(img, ramp_of.call(fire_of), fire_of, cx, cy, r, fire, flick, INK, W, H)
		var lvl := cy + r - roundi(fill * (2 * r))
		for dy in range(-r - 1, r + 2):
			for dx in range(-r - 1, r + 2):
				var dist := sqrt(float(dx * dx + dy * dy))
				var x := cx + dx
				var y := cy + dy
				if dist > r + 0.5:
					continue
				if dist > r - 0.5:
					put.call(x, y, WHITE[4] if locked else INK)
					continue
				var lit := -dx * 0.5 - dy * 0.7
				if liquid != null and y > lvl:
					var k := 4 if y == lvl + 1 else (3 if lit > 1.5 else (2 if lit > -2.0 else 1))
					put.call(x, y, liquid[k])
				elif liquid != null and y == lvl:
					put.call(x, y, liquid[4])
				else:
					var k := (4 if lit > 1.0 else 3) if dist > r - 1.5 else (2 if lit > 2.0 else (1 if lit > -1.0 else 0))
					put.call(x, y, GLASS[k])
		put.call(cx - 2, cy - 3, "#ffffff")
		put.call(cx - 3, cy - 2, "#ffffff")
		if locked:
			put.call(cx - 2, cy - 2, WHITE[3])
	return img


## The fire behind and round a globe: three tongues licking up from it, the outer flame dark, lighter in toward the globe; inked round.
func _paint_fire(img: Image, F: Array, of: String, cx: int, cy: int, r: int, fire: int, flick: int, INK: Color, W: int, H: int) -> void:
	var flip := -1.0 if of == "kick" else 1.0
	var fl := func(k: int) -> float: return float(roundi(2.2 * sin(flick * 1.9 + k * 2.3)))
	var tongues := [[-3.0 * flip, fire - 2 + fl.call(0)], [0.0, fire + 1 + fl.call(1)], [3.0 * flip, fire - 3 + fl.call(2)], [-5.0 * flip, 3 + fl.call(3) * 0.5], [5.0 * flip, 4 + fl.call(4) * 0.5]]
	var W0 := 2 * r + 7
	var H0 := r * 2 + fire + 4
	var ox := cx - r - 3
	var oy := cy - r - fire - 2
	var mask := PackedFloat32Array()
	mask.resize(W0 * H0)
	mask.fill(-1.0)
	for yy in H0:
		for xx in W0:
			var dx := float(ox + xx - cx)
			var dy := float(oy + yy - cy)
			var d := sqrt(dx * dx + dy * dy)
			var reach := 1.4 - maxf(0.0, dy) * 0.2
			for t in tongues:
				var lean := (-dy - r) * 0.18 * flip
				var w := maxf(0.0, 1.0 - absf(dx - float(t[0]) - lean) / 2.2)
				reach = maxf(reach, w * float(t[1]) * (1.0 if dy < 0.0 else 0.35))
			var above := d - r
			if above > 0.0 and above < reach and dy < r - 1:
				mask[yy * W0 + xx] = above / reach
	var at := func(a: int, b: int) -> float: return -1.0 if a < 0 or b < 0 or a >= W0 or b >= H0 else mask[b * W0 + a]
	for yy in H0:
		for xx in W0:
			var m: float = mask[yy * W0 + xx]
			if m < 0.0:
				continue
			var rim: bool = at.call(xx - 1, yy) < 0.0 or at.call(xx + 1, yy) < 0.0 or at.call(xx, yy - 1) < 0.0
			var col: String = F[1] if rim else (F[2] if m > 0.62 else (F[3] if m > 0.3 else F[4]))
			var x := ox + xx
			var y := oy + yy
			if x >= 0 and y >= 0 and x < W and y < H:
				img.set_pixel(x, y, Color(col))
	for yy in H0:
		for xx in W0:
			if mask[yy * W0 + xx] >= 0.0:
				continue
			var dx := float(ox + xx - cx)
			var dy := float(oy + yy - cy)
			if sqrt(dx * dx + dy * dy) <= r + 0.5:
				continue
			if at.call(xx - 1, yy) >= 0.0 or at.call(xx + 1, yy) >= 0.0 or at.call(xx, yy - 1) >= 0.0 or at.call(xx, yy + 1) >= 0.0:
				var x := ox + xx
				var y := oy + yy
				if x >= 0 and y >= 0 and x < W and y < H:
					img.set_pixel(x, y, INK)
