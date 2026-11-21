## THE TINKERER'S GOLEM AND HER EFFECTS AS THE GAME DRAWS THEM (render/render.ts drawTinkerers, the shadows; render/tinkerer_fx.ts,
## made of the art chat's own pieces; each painted once, kept here as pictures: assets/heroes/golem-0.png, tinkerer_fx-0.png,
## tools/godot_tinkerer.ts):
##   HER GOLEM stands among the figures, from in front or truly from behind by the way it faces, turned over as the game turns it:
##     standing; ITS RUN by the floor it covers (its fist and feet gripping); its uppercut, its pound (its combo's slam), its winding
##     down, by its own time; dropping in 40 game pixels as it is whistled out; ITS ROCKET JUMP frame by frame, lifted up its arc,
##     its stacks' fire and steam laid just behind it and just over it; its pool of cyan light behind it; its soft shadow under it,
##     growing as it drops in and shrinking as it flies.
##   vial           her vial lobbed high from her hand, tumbling, to where it comes down
##   vialBurst      glass flying, her brew splashed and fizzing, its vapour rising
##   golemArrive    a great burst of steam and a ring of dust as it drops in; its rocket jump landing: its crater on the floor,
##                  its dust and stone standing among the figures
##   bombsAway      its rocket jump blasting off: its scorch and glowing cracks on the floor, its flash, fire, dust, stone and its
##                  after-image standing there; its trail of smoke puffs hanging where it passed; the light of its stacks' fire
##                  on the floor under it while it crouches
##   golemPunch     cyan shards bursting where its fist meets
##   golemPound     the floor cracked in a star round its fist, its heart's cyan in the cracks, a ring of steam and dust racing
##                  out; steam bursting up
##   golemDown      sparks and gears as it winds down
##   blastJump      her bomb going off: its flash and fireball, chips flung, a scorch left glowing and cooling; puffs of its smoke
##                  along the way she flew
##   blastLand      a thud of dust where she comes down
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const Glow := preload("res://scripts/figure_glow.gd")
const MageLook := preload("res://scripts/heroes/mage_look.gd")

var kit
var loot
var air: Node2D
var _t := 0.0
var _gsheet: Texture2D
var _gpics := {}
var _fsheet: Texture2D
var _fpics := {}
var _clips := {}
var _aura := {}
var _trail := {}
var RK := {}
var _stride := 1.0
var BREW: Array = []

var lobs: Array = []
var bursts: Array = []
var thuds: Array = []
var blasts: Array = []
var scorches: Array = []
var pounds: Array = []
var arrives: Array = []
var impacts: Array = []
var sparks: Array = []
var trails: Array = []
var launches: Array = []
var lands: Array = []
## (her tree's: The Big One's rings of her cyan; her puddles of tar ({x, y, r, t, life}), each painted once at its size)
var rings: Array = []
var tars: Array = []
var _tar_pics := {}

## How long each lasts (seconds: tinkerer_fx.ts LIFE).
const LIFE := {"burst": 18.0 / 30.0, "thud": 14.0 / 30.0, "blast": 24.0 / 30.0, "scorch": 40.0 / 30.0 * 2.0, "pound": 24.0 / 30.0, "arrive": 18.0 / 30.0, "impact": 10.0 / 30.0, "sparks": 16.0 / 30.0, "trail": 0.9}
const SCORCH_N := 40
## (render.ts) The Golem's shadow, tiles round; a figure's shadow's strength.
const GOLEM_SHADOW := 0.6
const SHADOW := 0.7
const GRUN_ROUND := 16

## (each Golem's own node, standing among the figures; and those of its take-offs and landings that stand)
var _golem_nodes := {}
var _stands: Array = []


class _Air extends Node2D:
	var look

	func _draw() -> void:
		look.draw_air(self)


## A Golem standing among the figures: its picture drawn by the look, its pool of light behind it.
class _Golem extends Node2D:
	var look
	var g: Dictionary
	var aura: Sprite2D

	func _draw() -> void:
		look.draw_golem(self, g)


## A piece of a take-off or a landing that stands among the figures (tinkerer_fx.ts rocketStands).
class _Stand extends Node2D:
	var look
	var key := ""
	var flip := false
	var dy := 0.0
	var lift := 0.0

	func _draw() -> void:
		if key != "":
			look.gpiece(self, key, 0.0, -dy - lift, flip)


func _ready() -> void:
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/golem.json"))
	_gpics = d["pics"]
	_clips = d["clips"]
	_aura = d["aura"]
	_trail = d["trail"]
	RK = d["rocket"]
	_stride = float(d["runStride"])
	_gsheet = load("res://assets/heroes/golem-0.png")
	var f: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/tinkerer_fx.json"))
	_fpics = f["pics"]
	for c in f["brew"]:
		BREW.append(Color(c))
	_fsheet = load("res://assets/heroes/tinkerer_fx-0.png")
	air = _Air.new()
	air.look = self
	air.z_index = 40
	add_child(air)


func _exit_tree() -> void:
	for n in _golem_nodes.values():
		if is_instance_valid(n):
			n.queue_free()
	_golem_nodes.clear()
	for n in _stands:
		if is_instance_valid(n):
			n.queue_free()
	_stands.clear()


func on_event(e: Dictionary, _fx) -> void:
	match str(e.get("t", "")):
		"vial":
			lobs.append({"x0": e["x0"], "y0": e["y0"], "x1": e["x1"], "y1": e["y1"], "t": 0.0, "flight": e["flight"], "hand": int(e.get("id", -1)) < 0,
				"little": e.get("little", false), "big": e.get("big", false)})
		"vialBurst":
			# (her tree's: little ones small; The Big One's twice the size, a ring of her cyan racing out and a thud of dust; Mad
			# Mixture's in its brew's colours)
			bursts.append({"x": e["x"], "y": e["y"], "t": 0.0, "k": 0.6 if e.get("little", false) else (2.0 if e.get("big", false) else 1.0), "brew": str(e.get("brew", ""))})
			if e.get("big", false):
				rings.append({"x": e["x"], "y": e["y"], "t": 0.0, "r": float(e["r"])})
				thuds.append({"x": e["x"], "y": e["y"], "t": 0.0})
		"tar":
			tars.append({"x": e["x"], "y": e["y"], "t": 0.0, "r": float(e["r"]), "life": float(e["secs"])})
		"decoyStruck":
			# (an enemy's blow on the Golem, a lightning rod: shards off its iron)
			if e.get("golem", false):
				impacts.append({"x": e["x"], "y": e["y"], "t": 0.0, "k": 0.8})
		"shrapnel":
			impacts.append({"x": e["x"], "y": e["y"], "t": 0.0, "k": 2.2})
			thuds.append({"x": e["x"], "y": e["y"], "t": 0.0})
		"bombsAway":
			var r = e.get("rocket")
			if r != null:
				launches.append({"x": e["x"], "y": e["y"], "back": float(r["fx"]) + float(r["fy"]) < -0.2, "flip": float(r["fx"]) - float(r["fy"]) < 0.0,
					"dx": float(r["x1"]) - float(r["x0"]), "dy": float(r["y1"]) - float(r["y0"]), "flight": float(r["flight"]), "t": 0.0})
			else:
				blasts.append({"x": e["x"], "y": e["y"], "t": 0.0})
				scorches.append({"x": e["x"], "y": e["y"], "t": 0.0})
		"golemArrive":
			var r = e.get("rocket")
			if r != null:
				lands.append({"x": e["x"], "y": e["y"], "back": float(r["fx"]) + float(r["fy"]) < -0.2, "flip": float(r["fx"]) - float(r["fy"]) < 0.0, "t": 0.0})
			else:
				arrives.append({"x": e["x"], "y": e["y"], "t": 0.0})
		"golemPunch":
			impacts.append({"x": e["x"], "y": e["y"], "t": 0.0})
		"golemPound":
			pounds.append({"x": e["x"], "y": e["y"], "t": 0.0})
		"golemDown":
			sparks.append({"x": e["x"], "y": e["y"], "t": 0.0})
		"blastJump":
			blasts.append({"x": e["x0"], "y": e["y0"], "t": 0.0})
			scorches.append({"x": e["x0"], "y": e["y0"], "t": 0.0})
			trails.append({"x0": e["x0"], "y0": e["y0"], "x1": e["x1"], "y1": e["y1"], "t": 0.0})
		"blastLand":
			thuds.append({"x": e["x"], "y": e["y"], "t": 0.0})


func _process(dt: float) -> void:
	_t += dt
	for i in range(tars.size() - 1, -1, -1):
		tars[i]["t"] = float(tars[i]["t"]) + dt
		if float(tars[i]["t"]) >= float(tars[i]["life"]):
			tars.remove_at(i)
	for pair in [[bursts, LIFE["burst"]], [thuds, LIFE["thud"]], [blasts, LIFE["blast"]], [scorches, LIFE["scorch"]], [pounds, LIFE["pound"]],
			[arrives, LIFE["arrive"]], [impacts, LIFE["impact"]], [sparks, LIFE["sparks"]], [trails, LIFE["trail"]], [rings, 0.3]]:
		var list: Array = pair[0]
		for i in range(list.size() - 1, -1, -1):
			list[i]["t"] = float(list[i]["t"]) + dt
			if float(list[i]["t"]) >= float(pair[1]):
				list.remove_at(i)
	for i in range(lobs.size() - 1, -1, -1):
		lobs[i]["t"] = float(lobs[i]["t"]) + dt
		if float(lobs[i]["t"]) >= float(lobs[i]["flight"]):
			lobs.remove_at(i)
	var launch_life := maxi(int(RK["launchN"]), ceili(float(RK["flight"])) + int(RK["puffLife"]) + 1)
	for i in range(launches.size() - 1, -1, -1):
		launches[i]["t"] = float(launches[i]["t"]) + dt
		if floori(float(launches[i]["t"]) * 30.0) >= launch_life:
			launches.remove_at(i)
	for i in range(lands.size() - 1, -1, -1):
		lands[i]["t"] = float(lands[i]["t"]) + dt
		if floori(float(lands[i]["t"]) * 30.0) >= int(RK["landN"]):
			lands.remove_at(i)
	if kit != null and kit.h != null and not kit.h.alive:
		kit.fallen(dt)
	_place()
	queue_redraw()
	air.queue_redraw()


func _gx(x: float, y: float) -> float:
	var fx = kit.h.fx if kit != null else null
	return fx.gx(x, y) if fx != null and is_instance_valid(fx) else (x - y) * 16.0


func _gy(x: float, y: float) -> float:
	var fx = kit.h.fx if kit != null else null
	return fx.gy(x, y) if fx != null and is_instance_valid(fx) else (x + y) * 8.0


func _lift(x: float, y: float) -> float:
	return kit.h.map.lift_at(x, y) if kit != null and kit.h.map != null else 0.0


## One of her effects' pieces, its anchor at (x, y) game pixels of the screen, on `c`, `a` faint, `k` times its size.
func _piece(c: CanvasItem, key: String, x: float, y: float, a := 1.0, k := 1.0) -> void:
	var p = _fpics.get(key)
	if p == null or (p as Array).is_empty():
		return
	var X := roundf(x) * 2.0
	var Y := roundf(y) * 2.0
	c.draw_texture_rect_region(_fsheet, Rect2(X - float(p[4]) * k, Y - float(p[5]) * k, float(p[2]) * k, float(p[3]) * k), Rect2(p[0], p[1], p[2], p[3]), Color(1, 1, 1, a))


## One of the Golem's pieces, its anchor at (x, y) picture pixels on `c`, turned over about its anchor (flipSprite).
func gpiece(c: CanvasItem, key: String, x: float, y: float, flip := false, a := 1.0) -> void:
	var p = _gpics.get(key)
	if p == null or (p as Array).is_empty():
		return
	var src := Rect2(p[0], p[1], p[2], p[3])
	if flip:
		# (mirrored about its anchor, as flipSprite turns a picture over)
		c.draw_set_transform(Vector2(x, y), 0.0, Vector2(-1, 1))
		c.draw_texture_rect_region(_gsheet, Rect2(-float(p[4]), -float(p[5]), p[2], p[3]), src, Color(1, 1, 1, a))
		c.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	else:
		c.draw_texture_rect_region(_gsheet, Rect2(x - float(p[4]), y - float(p[5]), p[2], p[3]), src, Color(1, 1, 1, a))


func _at(n: int, k: float) -> int:
	return clampi(floori(k * n), 0, n - 1)


## (art/golem_rocket_fx.ts rocketUp) How high it is `k` frames after it leaves the floor (game pixels): up fast, down like a stone.
func rocket_up(k: float) -> float:
	var u := k / float(RK["flight"])
	if u <= 0.0 or u >= 1.0:
		return 0.0
	var top: float = RK["top"]
	var high: float = RK["high"]
	if u < top:
		return high * (1.0 - pow(1.0 - u / top, 3.0))
	return high * (1.0 - pow((u - top) / (1.0 - top), 2.0))


func _rf(g: Dictionary) -> int:
	return clampi(floori(float(g["act_t"]) * 30.0 + 1e-6), 0, int(RK["end"]))


## (render.ts drawTinkerers) The frame of a clip of its `t` seconds in.
func _clip_frame(name: String, t: float) -> int:
	var c: Dictionary = _clips[name]
	return clampi(floori(t * float(c["fps"]) + 1e-6), 0, int(c["n"]) - 1)


## Each Golem's node among the figures, and those of its take-offs and landings that stand (render.ts drawTinkerers, rocketStands).
func _place() -> void:
	if kit == null:
		return
	var holder = kit.h.get_parent()
	if holder == null:
		return
	var seen := {}
	for g in kit.golems:
		var id: int = g["id"]
		seen[id] = true
		var n = _golem_nodes.get(id)
		if n == null or not is_instance_valid(n):
			n = _Golem.new()
			n.look = self
			n.g = g
			var au := Sprite2D.new()
			au.texture = Glow.tex()
			au.material = Glow.added()
			au.show_behind_parent = true
			n.add_child(au)
			n.aura = au
			holder.add_child(n)
			_golem_nodes[id] = n
		n.g = g
		var x: float = g["x"]
		var y: float = g["y"]
		# (a hair nearer than a figure on its spot: render.ts, its depth x + y + 0.02)
		n.position = Iso.to_screen(x, y) + Vector2(0, 0.32)
		var drop := _drop(g)
		var flip: bool = float(g["fx"]) - float(g["fy"]) < 0.0
		n.aura.visible = not _aura.is_empty()
		if n.aura.visible:
			n.aura.position = Vector2(float(_aura["x"]) * 2.0 * (-1.0 if flip else 1.0), float(_aura["y"]) * 2.0 - drop * 2.0 - _lift(x, y))
			n.aura.scale = Vector2.ONE * float(_aura["r"]) * 4.0 / 64.0
			n.aura.modulate = Glow.tint(_aura)
		n.queue_redraw()
	for id in _golem_nodes.keys():
		if not seen.has(id):
			if is_instance_valid(_golem_nodes[id]):
				_golem_nodes[id].queue_free()
			_golem_nodes.erase(id)
	# (its take-offs' flash, fire, dust and stone and its after-image, a hair behind the Golem there from in front and a hair before it
	# from behind; its landings' dust and stone a hair before it)
	var want: Array = []
	for l in launches:
		var k := floori(float(l["t"]) * 30.0)
		if k < int(RK["launchN"]):
			want.append([l, "%s:launchAir:%d" % ["back" if l["back"] else "front", k], 0.02 + (0.005 if l["back"] else -0.005)])
	for l in lands:
		var k := floori(float(l["t"]) * 30.0)
		if k < int(RK["landN"]):
			want.append([l, "%s:landAir:%d" % ["back" if l["back"] else "front", k], 0.025])
	_stands = _stands.filter(func(q): return is_instance_valid(q))
	while _stands.size() < want.size():
		var s := _Stand.new()
		s.look = self
		holder.add_child(s)
		_stands.append(s)
	for i in _stands.size():
		var s = _stands[i]
		if s.get_parent() != holder:
			s.get_parent().remove_child(s)
			holder.add_child(s)
		if i < want.size():
			var l: Dictionary = want[i][0]
			s.key = want[i][1]
			s.flip = l["flip"]
			s.dy = float(want[i][2]) * 16.0
			s.position = Iso.to_screen(float(l["x"]), float(l["y"])) + Vector2(0, s.dy)
			s.lift = _lift(float(l["x"]), float(l["y"]))
			s.visible = true
		else:
			s.key = ""
			s.visible = false
		s.queue_redraw()


## How far over the floor it is drawn (game pixels): dropping in as it is whistled out; up its rocket jump's arc.
func _drop(g: Dictionary) -> float:
	if g["act"] == "arrive":
		return maxf(0.0, 1.0 - float(g["act_t"]) / 0.25) * 40.0
	if g["act"] == "jump":
		return rocket_up(_rf(g) - float(RK["blast"]))
	return 0.0


## (render.ts drawTinkerers) The Golem's picture for what it is doing, with what is at it in its rocket jump.
func draw_golem(c: CanvasItem, g: Dictionary) -> void:
	var view := "back" if float(g["fx"]) + float(g["fy"]) < -0.2 else "front"
	var flip: bool = float(g["fx"]) - float(g["fy"]) < 0.0
	var act: String = g["act"]
	var t: float = g["act_t"]
	var key := "%s:idle:0" % view
	var rocket := act == "jump"
	var rf := _rf(g)
	if act == "walk":
		# (ITS RUN, the art chat's gallop, by the floor it covers: RUN_STRIDE tiles a round, so that its fist and feet grip)
		key = "%s:run:%d" % [view, floori(float(g["walked"]) / _stride * GRUN_ROUND) % GRUN_ROUND]
	elif rocket:
		key = "%s:rocket:%d" % [view, rf]
	elif act == "punch":
		key = "%s:punch:%d" % [view, _clip_frame("punch", t)]
	elif act == "pound" and t >= 0.0:
		key = "%s:pound:%d" % [view, _clip_frame("pound", t)]
	elif act == "down":
		key = "%s:down:%d" % [view, _clip_frame("down", t)]
	var y := -_drop(g) * 2.0 - _lift(float(g["x"]), float(g["y"])) - 0.32
	if rocket:
		gpiece(c, "%s:atBehind:%d" % [view, rf], 0.0, y, flip)
	gpiece(c, key, 0.0, y, flip)
	if rocket:
		gpiece(c, "%s:atOver:%d" % [view, rf], 0.0, y, flip)


## What lies on the floor (tinkerer_fx.ts drawGround), and the Golem's shadow (render.ts, the shadows).
func _draw() -> void:
	if kit == null:
		return
	# (its soft shadow, growing as it drops in, shrinking and fading as it flies twice as high)
	for g in kit.golems:
		var x: float = g["x"]
		var y: float = g["y"]
		var rk := {"r": 1.0, "a": 1.0}
		if g["act"] == "arrive":
			var come := minf(1.0, float(g["act_t"]) / 0.25)
			rk = {"r": 0.6 + 0.4 * come, "a": come}
		elif g["act"] == "jump":
			var come := 1.0 - 0.6 * (rocket_up(_rf(g) - float(RK["blast"])) / float(RK["high"]))
			rk = {"r": 0.6 + 0.4 * come, "a": come}
		var r: float = GOLEM_SHADOW * float(rk["r"])
		var w := r * 22.6 * 1.5 * 2.0
		var hh := r * 11.3 * 1.5 * 2.0
		var cx := _gx(x, y) * 2.0
		var cy := _gy(x, y) * 2.0
		draw_texture_rect(MageLook.blot(), Rect2(cx - w, cy - hh, w * 2.0, hh * 2.0), false, Color(1, 1, 1, clampf(minf(1.0, SHADOW * 1.2) * float(rk["a"]), 0.0, 1.0)))
	# (her tree's TAR: its puddles, coming in a moment and drying up over the last half second)
	for p in tars:
		var ta := clampf(minf(float(p["t"]) / 0.12, (float(p["life"]) - float(p["t"])) / 0.5), 0.0, 1.0) * 0.92
		var tex: Texture2D = _tar_pic(float(p["r"]))
		var sz := tex.get_size()
		draw_texture(tex, Vector2(roundf(_gx(p["x"], p["y"])) * 2.0 - floorf(sz.x / 2.0), roundf(_gy(p["x"], p["y"])) * 2.0 - floorf(sz.y / 2.0)), Color(1, 1, 1, ta))
	# (THE BIG ONE: a ring of her cyan racing out to its burst's edge)
	for p in rings:
		var k := float(p["t"]) / 0.3
		var u := 1.0 - pow(1.0 - k, 2.0)
		var col := Color(BREW[2] if k < 0.4 else BREW[1]) if BREW.size() > 2 else Color("#7af4ff")
		col.a = maxf(0.0, 1.0 - k)
		var cx := roundf(_gx(p["x"], p["y"])) * 2.0
		var cy := roundf(_gy(p["x"], p["y"])) * 2.0
		var pts := PackedVector2Array()
		for j in 49:
			var a := j / 48.0 * TAU
			pts.append(Vector2(cx + cos(a) * maxf(1.0, float(p["r"]) * 22.6 * u) * 2.0, cy + sin(a) * maxf(1.0, float(p["r"]) * 11.3 * u) * 2.0))
		draw_polyline(pts, col, 4.0)
	for s in scorches:
		var a := maxf(0.0, minf(1.0, 1.5 - (float(s["t"]) / LIFE["scorch"]) * 1.5))
		_piece(self, "scorch:%d" % _at(8, minf(0.99, float(s["t"]) / (SCORCH_N / 30.0))), _gx(s["x"], s["y"]), _gy(s["x"], s["y"]), a)
	for p in pounds:
		_piece(self, "poundF:%d" % _at(24, float(p["t"]) / LIFE["pound"]), _gx(p["x"], p["y"]), _gy(p["x"], p["y"]))
	for p in thuds:
		_piece(self, "thud:%d" % _at(14, float(p["t"]) / LIFE["thud"]), _gx(p["x"], p["y"]), _gy(p["x"], p["y"]))
	# (where its rocket jumps took off, scorched and cracked, glowing; where they came down, cracked open; under a Golem crouched to
	# take off, the light of its stacks' fire and grit hopping)
	for l in launches:
		var k := floori(float(l["t"]) * 30.0)
		if k < int(RK["launchN"]):
			gpiece(self, "%s:launchFloor:%d" % ["back" if l["back"] else "front", k], roundf(_gx(l["x"], l["y"])) * 2.0, roundf(_gy(l["x"], l["y"])) * 2.0, l["flip"])
	for l in lands:
		var k := floori(float(l["t"]) * 30.0)
		if k < int(RK["landN"]):
			gpiece(self, "%s:landFloor:%d" % ["back" if l["back"] else "front", k], roundf(_gx(l["x"], l["y"])) * 2.0, roundf(_gy(l["x"], l["y"])) * 2.0, l["flip"])
	for g in kit.golems:
		if g["act"] != "jump":
			continue
		var view := "back" if float(g["fx"]) + float(g["fy"]) < -0.2 else "front"
		gpiece(self, "%s:atFloor:%d" % [view, _rf(g)], roundf(_gx(g["x"], g["y"])) * 2.0, roundf(_gy(g["x"], g["y"])) * 2.0, float(g["fx"]) - float(g["fy"]) < 0.0)


## What is over everything (tinkerer_fx.ts drawAir): its rocket trail, her bomb's smoke along the way she flew, her bomb going off,
## her vials in the air and bursting, the pound's steam, its dropping in, its fist landing, its sparks and gears.
func draw_air(c: CanvasItem) -> void:
	# (its rocket trail, its puffs born out of its stacks' fire where it passed, hanging there)
	for l in launches:
		var k := floori(float(l["t"]) * 30.0)
		var flight: float = l["flight"]
		var births: Array = _trail["%s:%d" % ["back" if l["back"] else "front", 1 if l["flip"] else 0]]
		for b in range(1, mini(k, int(flight)) + 1):
			var age := k - b
			if age >= int(RK["puffLife"]):
				continue
			var u := clampf(b / flight, 0.0, 1.0)
			for p in births[b]:
				var x := float(l["x"]) + float(l["dx"]) * u + float(p[0])
				var y := float(l["y"]) + float(l["dy"]) * u + float(p[1])
				gpiece(c, "puff%d:%d" % [int(p[3]), age], roundf(_gx(x, y)) * 2.0, roundf(_gy(x, y) - float(p[2])) * 2.0)
	# (the puffs of her bomb's smoke along the way she flew, thinning)
	for p in trails:
		var k := float(p["t"]) / LIFE["trail"]
		var len := Vector2(float(p["x1"]) - float(p["x0"]), float(p["y1"]) - float(p["y0"])).length()
		var n := maxi(2, roundi(len * 1.6))
		var a := maxf(0.0, 1.0 - k)
		for i in n + 1:
			var u := float(i) / n
			# (only where she has been: the trail grows behind her as she flies)
			if u > minf(1.0, float(p["t"]) / 0.6):
				break
			var lift := sin(PI * u) * 34.0 + 8.0 + k * 10.0
			var x := float(p["x0"]) + (float(p["x1"]) - float(p["x0"])) * u
			var y := float(p["y0"]) + (float(p["y1"]) - float(p["y0"])) * u
			_piece(c, "puff:%d" % ((i + floori(_t * 8.0)) % 6), _gx(x, y), _gy(x, y) - lift, a)
	for p in blasts:
		_piece(c, "blast:%d" % _at(24, float(p["t"]) / LIFE["blast"]), _gx(p["x"], p["y"]), _gy(p["x"], p["y"]))
	# (her vials, lobbed high, tumbling)
	for l in lobs:
		var u := float(l["t"]) / float(l["flight"])
		var x := float(l["x0"]) + (float(l["x1"]) - float(l["x0"])) * u
		var y := float(l["y0"]) + (float(l["y1"]) - float(l["y0"])) * u
		var little: bool = l.get("little", false)
		var up := (4.0 + 4.0 * 14.0 * u * (1.0 - u)) if little else (30.0 if l["hand"] else 10.0) * (1.0 - u) + 4.0 * 30.0 * u * (1.0 - u)
		_piece(c, "vial:%d" % (floori(float(l["t"]) * 18.0) % 8), _gx(x, y), _gy(x, y) - up, 1.0, 0.6 if little else (1.8 if l.get("big", false) else 1.0))
	for p in bursts:
		var bk: String = "burst-%s" % p["brew"] if str(p.get("brew", "")) != "" else "burst"
		_piece(c, "%s:%d" % [bk, _at(18, float(p["t"]) / LIFE["burst"])], _gx(p["x"], p["y"]), _gy(p["x"], p["y"]), 1.0, float(p.get("k", 1.0)))
	for p in pounds:
		_piece(c, "poundA:%d" % _at(24, float(p["t"]) / LIFE["pound"]), _gx(p["x"], p["y"]), _gy(p["x"], p["y"]))
	for p in arrives:
		_piece(c, "arrive:%d" % _at(18, float(p["t"]) / LIFE["arrive"]), _gx(p["x"], p["y"]), _gy(p["x"], p["y"]))
	for p in impacts:
		_piece(c, "impact:%d" % _at(10, float(p["t"]) / LIFE["impact"]), _gx(p["x"], p["y"]), _gy(p["x"], p["y"]) - 12.0, 1.0, float(p.get("k", 1.0)))
	for p in sparks:
		_piece(c, "sparks:%d" % _at(16, float(p["t"]) / LIFE["sparks"]), _gx(p["x"], p["y"]), _gy(p["x"], p["y"]))


## (render/tinkerer_fx.ts tarPuddle) A puddle of her tar `r` tiles across its middle, painted once: black and glossy, its edge uneven
## as a splash runs, its rim a little lighter, its gloss a thin crescent of light toward the top left (picture pixels).
const TAR := ["#08060a", "#120d18", "#1e1626", "#3a3448"]


func _tar_pic(r: float) -> Texture2D:
	var key := roundi(r * 10.0)
	if _tar_pics.has(key):
		return _tar_pics[key]
	var rr := key / 10.0
	var rx := rr * 45.0
	var ry := rr * 22.6
	var w := ceili(rx * 2.4) + 6
	var hh := ceili(ry * 2.4) + 6
	var img := Image.create(w, hh, false, Image.FORMAT_RGBA8)
	for yy in range(-ceili(ry * 1.2), ceili(ry * 1.2) + 1):
		for xx in range(-ceili(rx * 1.2), ceili(rx * 1.2) + 1):
			var a := atan2(yy / ry, xx / rx)
			var d := Vector2(xx / rx, yy / ry).length() / (1.0 + 0.1 * sin(a * 3.0 + rr * 7.0) + 0.07 * sin(a * 5.0 + 1.3))
			if d > 1.0:
				continue
			var sheen := Vector2(xx / rx + 0.28, yy / ry + 0.32).length()
			var k := 3 if sheen > 0.42 and sheen < 0.5 and xx < 0 and yy < 0 else (2 if d > 0.9 else (1 if d > 0.6 else 0))
			var px := roundi(w / 2.0 + xx)
			var py := roundi(hh / 2.0 + yy)
			if px >= 0 and py >= 0 and px < w and py < hh:
				img.set_pixel(px, py, Color(TAR[k]))
	var tex := ImageTexture.create_from_image(img)
	_tar_pics[key] = tex
	return tex
