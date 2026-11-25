## WHAT THE MAGE SENDS AND SETS DOWN, AS THE GAME DRAWS IT (render/render.ts, her waves and her orbs; render/wild.ts drawWildWave):
##   HER WAVE IN FLIGHT flows along the ground (big and wild: a crest of force stood up tall on a wall of its own light, its white edge
##     boiling a pixel or two up and down from moment to moment; behind it the body of the wave lying flat and streaming back, darker
##     and thinner the further back, with gaps that run along it so that it is seen to flow; two faint ripples left on the floor
##     behind it), swelling out of the staff in its first moments and thinning away over the end of its flight; in her element's
##     tones (art/spells.ts SPELL_TONES), the mirror's teal for the second of a Twin pair, Leeching's red; Volatile shaking it.
##   HER ORB, a large ball hanging over the floor, turning (art/spells.ts: its pictures, assets/heroes/spells.png), bobbing: it comes
##     in at a pop, swells as its next wave gathers, gutters in its last half second (shrinks, and blinks in its last moments); tinted
##     by the words on it (render.ts wordTint); its shadow under it; motes of its colours rising off it; it stands among the
##     figures, nearer or further as they are.
##   THE LIGHT THEY CAST IN THE DARK (render.ts spot): a wave 52 game pixels round, an orb 44.
## And each frame it tells her effects (fx_wild_mage.gd) where her crystal is and how hot it burns (her frame's `charge`), where her
## waves and orbs are, and where the monsters are.
extends Node2D

const L := preload("res://scripts/fx_looks.gd")
const Iso := preload("res://scripts/iso.gd")
const Figures := preload("res://scripts/fx_figures.gd")

var kit
var loot
var _t := 0.0
var _sheet: Texture2D
var _pics := {}
var _tones := {}
var _frames := 8
## (each orb's own nodes, standing among the figures: {id: {node, shadow, ball, tint}})
var _orbs := {}
var _sil: ShaderMaterial
static var _blot: Texture2D = null


func _ready() -> void:
	L.ready_up()
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/spells.json"))
	_pics = d["pics"]
	_frames = int(d["orbFrames"])
	for k in d["tones"]:
		var t: Array = []
		for c in d["tones"][k]:
			t.append(Color(c))
		_tones[k] = t
	_sheet = load("res://assets/heroes/spells.png")
	_sil = ShaderMaterial.new()
	_sil.shader = Shader.new()
	_sil.shader.code = Figures.SILHOUETTE
	_sd = SwapDraw.new(self, kit.h.fx if kit != null else null)
	air = _Air.new()
	air.look = self
	air.z_index = 40
	add_child(air)


func _exit_tree() -> void:
	for id in _orbs:
		var o: Dictionary = _orbs[id]
		if is_instance_valid(o["node"]):
			o["node"].queue_free()
	_orbs.clear()


## (the game's events for her are fx.gd's and fx_wild_mage.gd's; HER MOVES TO LEARN's, render/fx.ts: the comet's splash, a phantom's
## beam (an echo), a bite of the beam held: light where it leaves the wand as it begins, sparks where it ends)
func on_event(e: Dictionary, fx) -> void:
	match str(e.get("t", "")):
		"burst":
			if e.get("comet", false) and splashes.size() < 12:
				splashes.append({"x": e["x"], "y": e["y"], "el": e["el"], "r": e["r"], "t": 0.0})
		"beam":
			var w = e.get("words")
			var heavy := RangerLook._has(w, "power")
			var colors: Array = RangerLook.beam_colors(str(e["el"]), w, int(e["n"]), bool(e.get("echo", false)))
			rays.append({"x0": e["x0"], "y0": e["y0"], "x1": e["x1"], "y1": e["y1"], "t": 0.0, "dur": 0.16 if RangerLook._has(w, "swift") else (0.28 if heavy else 0.22),
				"colors": colors, "heavy": heavy, "jag": e["el"] == "lightning", "flicker": RangerLook._has(w, "volatile"), "faint": e.get("echo", false), "seed": randi() % 1000})
			if fx != null:
				fx.spray(float(e["x1"]), float(e["y1"]), 3 if e.get("echo", false) else 7, PackedColorArray(colors), 2.4, 50.0, 10.0)
		"beamBite":
			if fx != null:
				var w = e.get("words")
				var colors: Array = RangerLook.beam_colors(str(e["el"]), w, int(e["n"]), false)
				var d := Vector2(float(e["x1"]) - float(e["x0"]), float(e["y1"]) - float(e["y0"]))
				var u := d / d.length() if d.length() > 0.01 else Vector2(1, 0)
				fx.spray(float(e["x1"]), float(e["y1"]), 3, PackedColorArray(colors), 2.2, 50.0, 10.0)
				if e.get("first", false):
					fx.flash(float(e["x0"]) + u.x * 0.4, float(e["y0"]) + u.y * 0.4, 12.0, 0.4 if RangerLook._has(w, "power") else 0.26, 0.1, PackedColorArray(colors))
					if RangerLook._has(w, "power"):
						fx.kick(1.4)


const RangerLook := preload("res://scripts/heroes/ranger_look.gd")
const SwapDraw := preload("res://scripts/heroes/swap_draw.gd")
## (the comet's splashes, a phantom's beams, the beams held now: render/swap_fx.ts SPLASHES, render/fx.ts rays and held)
var splashes: Array = []
var rays: Array = []
var held: Array = []
var air: Node2D
var _sd
var _sda


class _Air extends Node2D:
	var look

	func _draw() -> void:
		look.draw_air(self)


## (render/fx.ts holdBeam: the beam held runs, this frame, from the wand to the first wall; a Twin pair both, side by side)
func _hold_beams(dt: float) -> void:
	var ch: Dictionary = kit.channel
	var id: String = kit.h.loadout.id(int(ch["skill"])) if not ch.is_empty() else ""
	if id == "beam":
		var h = kit.h
		var i: int = ch["skill"]
		var r: Dictionary = h.loadout.r(i)
		var def: Dictionary = kit._def(i)
		var half: float = float(def["radius"]) * float(r["size"])
		var w: Array = h.loadout.wfronts(i)
		for n in int(r["count"]):
			var off: float = 0.0 if int(r["count"]) == 1 else (n - (int(r["count"]) - 1) / 2.0) * (half * 2.0 + 0.3)
			var o := Vector2(h.world.x - h.face.y * off, h.world.y + h.face.x * off)
			if off != 0.0 and not kit._open(o):
				o = h.world
			var end: Vector2 = kit._beam_end(o, h.face, float(def["range"]))
			var q := {}
			for x in held:
				if int(x["n"]) == n and float(x["t"]) < 0.45:
					q = x
			if q.is_empty():
				q = {"n": n, "fresh": true, "t": 0.0, "dur": 1.0, "seed": randi() % 1000}
				held.append(q)
			q["fresh"] = true
			q["x0"] = o.x + h.face.x * 0.45
			q["y0"] = o.y + h.face.y * 0.45
			q["x1"] = end.x
			q["y1"] = end.y
			q["colors"] = RangerLook.beam_colors(str(r["element"]), w, n, false)
			q["heavy"] = w.has("power")
			q["jag"] = r["element"] == "lightning"
			q["flicker"] = w.has("volatile")
			q["faint"] = false
	# (render/fx.ts update: one held comes in over its first moments and stays at full while it is said to run; left unsaid, it thins
	# away)
	for k in range(held.size() - 1, -1, -1):
		var q: Dictionary = held[k]
		if q["fresh"]:
			q["fresh"] = false
			q["t"] = minf(0.3, float(q["t"]) + dt * (0.2 / 0.07))
		else:
			q["t"] = maxf(float(q["t"]), 0.45) + dt * (0.55 / 0.14)
			if float(q["t"]) >= 1.0:
				held.remove_at(k)
	for k in range(rays.size() - 1, -1, -1):
		rays[k]["t"] = float(rays[k]["t"]) + dt
		if float(rays[k]["t"]) >= float(rays[k]["dur"]):
			rays.remove_at(k)
	for k in range(splashes.size() - 1, -1, -1):
		splashes[k]["t"] = float(splashes[k]["t"]) + dt
		if float(splashes[k]["t"]) > 0.55:
			splashes.remove_at(k)


## Over the figures: her comets and spears in flight, her beams (render.ts, render/fx.ts drawRay). A beam held away up the screen
## leaves the wand behind her, so she stands in front of its first stretch: such a one is drawn under her instead (_draw).
func draw_air(c: CanvasItem) -> void:
	if kit == null:
		return
	if _sda == null:
		_sda = SwapDraw.new(c, kit.h.fx)
	for p in kit.shots:
		var look := str(p.get("look", ""))
		if look == "ball":
			_sda.ball(float(p["x"]), float(p["y"]), float(p["vx"]), float(p["vy"]), str(p["element"]), _t, float(p["flown"]))
		elif look == "mspear":
			_sda.spear(float(p["x"]), float(p["y"]), float(p["vx"]), float(p["vy"]), str(p["element"]), _t, float(p["flown"]))
	for r in rays:
		_sda.ray(r, _t)
	for r in held:
		if not _away(r):
			_sda.ray(r, _t)


func _away(r: Dictionary) -> bool:
	return _gy(r["x1"], r["y1"]) < _gy(r["x0"], r["y0"]) - 1.0


## (render.ts shadow's blot: black, full at its middle, 0.85 at 0.4 of its reach, nothing at its edge)
static func blot() -> Texture2D:
	if _blot == null:
		var img := Image.create(64, 64, false, Image.FORMAT_RGBA8)
		for y in 64:
			for x in 64:
				var d := Vector2(x + 0.5 - 32.0, y + 0.5 - 32.0).length() / 32.0
				var a := 1.0 - 0.15 * d / 0.4 if d < 0.4 else (0.85 * (1.0 - (d - 0.4) / 0.6) if d < 1.0 else 0.0)
				img.set_pixel(x, y, Color(0, 0, 0, a))
		_blot = ImageTexture.create_from_image(img)
	return _blot


func _process(dt: float) -> void:
	_t += dt
	if kit == null:
		return
	var h = kit.h
	var fx = h.fx if h != null else null
	if fx != null and is_instance_valid(fx):
		var wm = fx.wild_mage
		wm.orbs = kit.orbs
		var mobs: Array = []
		if h.monsters != null:
			for m in h.monsters.list:
				if is_instance_valid(m) and not m.dead:
					mobs.append(m.world)
		wm.mobs = mobs
		wm.follow(kit.shots, dt * 60.0 * fx.room())
		fx.follow_shots(kit.shots, dt * 60.0)
		# (where her crystal burns in the frame she is shown in, and how hot: render.ts, fig.charge(); not while she comes together)
		var f: Dictionary = h._shown
		if not f.is_empty() and h._coming <= 0.0 and h.alive:
			var p: Dictionary = f["part"]
			var ch = p.get("charge")
			if ch != null:
				var dx := float(ch["x"]) - float(p["ax"])
				var dy := float(ch["y"]) - float(p["ay"])
				wm.charge(h.world.x + dx / 32.0, h.world.y - dx / 32.0, -dy, float(ch["heat"]), h.face.x, h.face.y)
		# (motes of its colours rising off each orb)
		for o in kit.orbs:
			if randf() < 0.35 * dt * 60.0:
				var cs: Array = _tones.get(str(o["element"]), _tones["phys"])
				fx.mote(float(o["x"]) + randf_range(-0.35, 0.35), float(o["y"]) + randf_range(-0.35, 0.35), PackedColorArray(cs.slice(1)))
	_place_orbs()
	_hold_beams(dt)
	queue_redraw()
	if air != null:
		air.queue_redraw()


## Her orbs, each among the figures where it hangs (render.ts: stood at its depth, a hair nearer than a figure on its spot).
func _place_orbs() -> void:
	var holder = kit.h.get_parent()
	var seen := {}
	for o in kit.orbs:
		var id: int = o["id"]
		seen[id] = true
		var n: Dictionary = _orbs.get(id, {})
		if n.is_empty() or not is_instance_valid(n["node"]):
			var node := Node2D.new()
			var shadow := Sprite2D.new()
			shadow.texture = blot()
			node.add_child(shadow)
			var ball := Sprite2D.new()
			ball.centered = false
			ball.texture = AtlasTexture.new()
			ball.texture.atlas = _sheet
			node.add_child(ball)
			var tint := Sprite2D.new()
			tint.centered = false
			tint.texture = AtlasTexture.new()
			tint.texture.atlas = _sheet
			tint.material = _sil
			node.add_child(tint)
			holder.add_child(node)
			n = {"node": node, "shadow": shadow, "ball": ball, "tint": tint}
			_orbs[id] = n
		var x: float = o["x"]
		var y: float = o["y"]
		var lift: float = kit.h.map.lift_at(x, y) if kit.h.map != null else 0.0
		n["node"].position = Iso.to_screen(x, y) + Vector2(0, 0.16)
		var el := str(o["element"])
		var key := "orb:%s:%d" % [el if _pics.has("orb:%s:0" % el) else "phys", (floori(_t * 11.0 + id * 3)) % _frames]
		var pic: Array = _pics[key]
		var born := minf(1.0, float(o["t"]) / 0.12)
		var gather := 1.0 - clampf(float(o["next"]) / float(kit.T["tune"]["orbEvery"]), 0.0, 1.0)
		var left := float(o["life"]) - float(o["t"])
		var dying := maxf(0.0, left / 0.5) if left < 0.5 else 1.0
		var scale := (0.5 + 0.5 * born) * (0.9 + 0.18 * gather * gather) * (0.65 + 0.35 * dying)
		var bob := sin(_t * 2.6 + id) * 1.5
		# (it does not flicker out of sight as it goes: it shrinks, and blinks in its last moments)
		var shown := not (dying < 0.5 and floori(_t * 24.0) % 2 == 0)
		var region := Rect2(pic[0], pic[1], pic[2], pic[3])
		var at := Vector2(0, (-13.0 + bob) * 2.0 - lift)
		for s in [n["ball"], n["tint"]]:
			s.texture.region = region
			s.position = at
			s.offset = -Vector2(pic[4], pic[5])
			s.scale = Vector2(scale, scale)
		n["ball"].visible = shown
		var wt := _word_tint(int(o["skill"]))
		n["tint"].visible = shown and wt.a > 0.0
		n["tint"].modulate = wt
		# (its shadow under it: render.ts shadow, 0.42 tiles, 0.85 of a figure's)
		var w := 0.42 * 22.6 * 1.5 * 2.0
		var hh := 0.42 * 11.3 * 1.5 * 2.0
		n["shadow"].position = Vector2(0, -lift)
		n["shadow"].scale = Vector2(w * 2.0 / 64.0, hh * 2.0 / 64.0)
		n["shadow"].modulate = Color(1, 1, 1, 0.7 * 0.85)
	for id in _orbs.keys():
		if not seen.has(id):
			if is_instance_valid(_orbs[id]["node"]):
				_orbs[id]["node"].queue_free()
			_orbs.erase(id)


## (render.ts wordTint) What a thing she made is tinted by the words in front of the move: Leeching's red, Volatile's flicker, Swift's
## green, Poison's, Power's; nothing for the rest.
func _word_tint(i: int) -> Color:
	var P: Dictionary = L.P
	var words: Array = kit.h.loadout.wfronts(i)
	if words.has("leech"):
		return Color(P["bl4"], 0.55)
	if words.has("volatile"):
		return Color(P["white"] if floori(_t * 20.0) % 2 == 0 else P["pu5"], 0.5)
	if words.has("swift"):
		return Color(P["gn5"], 0.3)
	if words.has("poison"):
		return Color(P["vn4"], 0.4)
	if words.has("power"):
		return Color(P["fr6"], 0.35)
	return Color(0, 0, 0, 0)


## The light her waves and orbs cast in the dark (render.ts spot): `spot` takes a place on the screen (game pixels), a reach, a strength.
func lights(spot: Callable, fx) -> void:
	for p in kit.shots:
		if p.get("look", "") == "wave":
			spot.call(fx.gx(p["x"], p["y"]), fx.gy(p["x"], p["y"]) - 10.0, 52.0, 0.8)
	for o in kit.orbs:
		spot.call(fx.gx(o["x"], o["y"]), fx.gy(o["x"], o["y"]) - 12.0, 44.0, 0.85)


func _gx(x: float, y: float) -> float:
	var fx = kit.h.fx
	return fx.gx(x, y) if fx != null and is_instance_valid(fx) else (x - y) * 16.0


func _gy(x: float, y: float) -> float:
	var fx = kit.h.fx
	return fx.gy(x, y) if fx != null and is_instance_valid(fx) else (x + y) * 8.0


func _draw() -> void:
	if kit == null:
		return
	# (HER TREE'S AURA, on the floor round her while it is on: render/swap_fx.ts drawAura)
	if kit.has_method("aura_now"):
		_aura(kit.aura_now())
	# (the comet's splashes on the floor; a beam held away up the screen, behind her)
	for s in splashes:
		_sd.splash(s, float(s["t"]))
	for r in held:
		if _away(r):
			_sd.ray(r, _t)
	var P: Dictionary = L.P
	for p in kit.shots:
		if p.get("look", "") != "wave":
			continue
		var words: Array = p["words"]
		var twin := int(p["n"]) > 0
		var tones: Array = [P["tl2"], P["tl4"], P["tl5"], P["white"]] if twin else ([P["bl2"], P["bl4"], P["bl5"], P["white"]] if words.has("leech") else _tones.get(str(p["element"]), _tones["phys"]))
		var volatile := words.has("volatile")
		var jx := roundf((randf() - 0.5) * 2.0) if volatile else 0.0
		var jy := roundf((randf() - 0.5) * 2.0) if volatile else 0.0
		_wild_wave(p, tones, jx, jy)


## A WAVE IN FLIGHT, BIG AND WILD (render/wild.ts drawWildWave), point by point along its front, in the world, so that it lies right
## whichever way it goes.
func _wild_wave(p: Dictionary, tones: Array, jx: float, jy: float) -> void:
	var C: PackedColorArray = L.CRACKLE
	var v := Vector2(p["vx"], p["vy"]).length()
	if v <= 0.0:
		v = 1.0
	var fwx: float = float(p["vx"]) / v
	var fwy: float = float(p["vy"]) / v
	var span := 1.0
	var r := float(p["r"]) * 1.1
	var R := r / sin(span)
	var born := minf(1.0, float(p["age"]) / 0.09)
	var fade := clampf(float(p["dist"]) / 1.8, 0.0, 1.0)
	var layers := 10
	var run := floori(_t * 24.0)
	var px0: float = p["x"]
	var py0: float = p["y"]
	for j in range(layers + 2, -1, -1):
		var ripple := j > layers
		var back := layers + (j - layers) * 4 if ripple else j
		var rj := R - back * 0.08
		var sj := span * maxf(0.2, 1.0 - back * (0.04 if ripple else 0.07)) * (0.45 + 0.55 * born)
		var steps := maxi(8, ceili(sj * rj * 2.0 * 22.0))
		for k in steps + 1:
			if back >= 3 and posmod(k + run * (1 if j % 2 == 0 else -1) + j * 3, 3 if ripple else 5) == 0:
				continue
			var a := -sj + (2.0 * sj * k) / steps
			var ca := cos(a) * rj - R
			var sa := sin(a) * rj
			var qx := px0 + fwx * ca - fwy * sa
			var qy := py0 + fwy * ca + fwx * sa
			var mid := 1.0 - absf(a) / sj
			var sx := roundf(_gx(qx, qy)) + jx
			var sy := roundf(_gy(qx, qy)) + jy
			if back == 0:
				# THE CREST: stood up on a wall of its own light, its white edge boiling
				var up := 3 + roundi(9.0 * mid * born) + (1 if randf() < 0.35 else 0) + (2 if mid > 0.4 and randf() < 0.18 else 0)
				for hh in up:
					var col: Color = tones[0] if hh < up * 0.35 else (tones[1] if hh < up * 0.7 else tones[2])
					draw_rect(Rect2(sx * 2.0, (sy - hh) * 2.0, 4.0, 2.0), Color(col, fade * 0.55))
				draw_rect(Rect2(sx * 2.0, (sy - up) * 2.0, 4.0, (2.0 + roundf(mid)) * 2.0), Color(tones[3], fade))
				draw_rect(Rect2(sx * 2.0, (sy - up - 1) * 2.0, 4.0, 2.0), Color(C[1] if randf() < 0.5 else C[0], fade))
				continue
			var col: Color = tones[1] if ripple else (tones[2] if back <= 2 else (tones[1] if back <= 5 else tones[0]))
			var al := 0.32 * fade * born if ripple else fade * (1.0 if back < 3 else (0.85 if back < 6 else 0.55))
			var up := (2 + roundi(5.0 * mid * born)) if back == 1 else ((1 + roundi(2.0 * mid * born)) if back == 2 else (1 if back == 3 else 0))
			draw_rect(Rect2(sx * 2.0, (sy - up) * 2.0, 4.0, 4.0 if back <= 2 else 2.0), Color(col, al))


# --- HER AURA (render/swap_fx.ts drawAura), in game pixels ---

const TalentsData := preload("res://scripts/talents.gd")


func _dot(x: float, y: float, c: Color, w := 1.0, hh := 1.0) -> void:
	draw_rect(Rect2(roundf(x) * 2.0, roundf(y) * 2.0, w * 2.0, hh * 2.0), c)


## A ring on the floor of `r` tiles about `c`, every `gap`th pixel of it, turned by `turn`.
func _floor_ring(c: Vector2, r: float, col: Color, gap: int, turn: float) -> void:
	var n := maxi(24, roundi(r * 64.0))
	for k in n:
		if gap > 1 and k % gap != 0:
			continue
		var a := float(k) / n * TAU + turn
		var p := c + Vector2(cos(a), sin(a)) * r
		_dot(_gx(p.x, p.y), _gy(p.x, p.y), col)


static func _seed(k: float) -> float:
	return absf(fmod(sin(k * 12.9898) * 43758.5453, 1.0))


## Its floor breathing in its kind's colour, a flash going out to its edge as it comes on, its edge with its light turning round
## it and a rim of the friend's cyan just inside; FIRE's tongues of flame round its edge and embers rising, LIGHTNING's bright runs
## and crackle off its edge, FROST's shards of ice standing round it, snow drifting down and stars of frost turning on its edge.
func _aura(a: Dictionary) -> void:
	if a.is_empty():
		return
	TalentsData.ready_up()
	var hp: Vector2 = kit.h.world
	var tones: Array = TalentsData.D["spellTones"].get(a["kind"], TalentsData.D["spellTones"]["phys"])
	var T: Array = tones.map(func(c): return Color(c))
	var cy: Array = TalentsData.D["cyan"]
	var C1 := Color(cy[2])
	var t := _t
	var grow := minf(1.0, float(a["t"]) / 0.3)
	var r: float = float(a["r"]) * (0.3 + 0.7 * grow)
	var at := func(ang: float, rr: float) -> Vector2:
		var p := hp + Vector2(cos(ang), sin(ang)) * rr
		return Vector2(_gx(p.x, p.y), _gy(p.x, p.y))
	var floor_pts := PackedVector2Array()
	for k in 48:
		floor_pts.append((at.call(float(k) / 48.0 * TAU, r) as Vector2) * 2.0)
	# (over a ledge the ground's lift bends the ring across itself and the engine cannot fill it, an error each frame: then its rings
	# alone, as it already showed there: the bug hunt, 25 Nov 2026)
	if not Geometry2D.triangulate_polygon(floor_pts).is_empty():
		draw_colored_polygon(floor_pts, Color(T[1], 0.16 + 0.06 * sin(t * 4.0)))
	if float(a["t"]) < 0.35:
		_floor_ring(hp, r * 1.05, Color(T[3], 1.0 - float(a["t"]) / 0.35), 1, 0.0)
	_floor_ring(hp, r + 0.05, T[0], 1, 0.0)
	_floor_ring(hp, r, T[1], 1, 0.0)
	_floor_ring(hp, r - 0.05, T[2], 2, t * 0.8)
	_floor_ring(hp, r - 0.18, C1, 3, -t * 0.5)
	match str(a["kind"]):
		"fire":
			for k in 18:
				var p: Vector2 = at.call(float(k) / 18.0 * TAU + t * 0.4, r)
				var tall := 4 + roundi(3.0 * (0.5 + 0.5 * sin(t * 11.0 + k * 1.9)))
				for j in tall:
					var w := 1.0 if j < tall * 0.4 else 0.0
					_dot(p.x - w, p.y - j, T[1] if j < 2 else (T[2] if j < tall - 2 else T[3]), 1.0 + 2.0 * w, 1.0)
			for k in 30:
				var ph := fmod(t * 0.7 + _seed(k), 1.0)
				var p0: Vector2 = at.call(k * 2.39996, r * sqrt(_seed(k + 40)) * 0.92)
				_dot(p0.x + sin(t * 3.0 + k) * 2.0, p0.y - ph * 28.0, Color(T[3] if ph < 0.3 else (T[2] if ph < 0.7 else T[1]), 1.0 - ph * 0.6), 2.0, 2.0)
		"lightning":
			var stp := floori(t * 16.0)
			for k in 3:
				var a0 := _seed(stp * 3 + k) * TAU
				for q in 10:
					var p: Vector2 = at.call(a0 + q * 0.05, r)
					_dot(p.x, p.y - 1.0, T[3], 2.0, 2.0)
			for k in 7:
				var ang := _seed(stp * 7 + k) * TAU
				var p: Vector2 = at.call(ang, r)
				for q in 5:
					var np := Vector2(p.x + (4.0 if _seed(stp + k * 5 + q) > 0.5 else -4.0), p.y - 3.0 - _seed(stp * 3 + k + q) * 4.0)
					draw_line(p.round() * 2.0 + Vector2.ONE, np.round() * 2.0 + Vector2.ONE, T[2], 4.0)
					draw_line(p.round() * 2.0 + Vector2.ONE, np.round() * 2.0 + Vector2.ONE, T[3], 2.0)
					p = np
		_:
			for k in 16:
				var p: Vector2 = at.call(float(k) / 16.0 * TAU, r)
				var tall := 3 + (k % 3) * 2
				for j in tall:
					_dot(p.x - (1.0 if j < tall - 2 else 0.0), p.y - j, T[3] if j == tall - 1 else (T[2] if j % 2 else T[1]), 2.0 if j < tall - 2 else 1.0, 1.0)
			for k in 26:
				var ph := fmod(t * 0.35 + _seed(k), 1.0)
				var p0: Vector2 = at.call(k * 2.39996, r * sqrt(_seed(k + 40)) * 0.9)
				_dot(p0.x + sin(t * 2.0 + k) * 3.0, p0.y - (1.0 - ph) * 26.0, T[3] if ph < 0.5 else T[2], 2.0, 2.0)
			for k in 8:
				var p: Vector2 = at.call(float(k) / 8.0 * TAU + t * 0.3, r)
				var X := roundf(p.x)
				var Y := roundf(p.y) - 2.0
				_dot(X - 3.0, Y, T[2], 7.0, 1.0)
				_dot(X, Y - 3.0, T[2], 1.0, 7.0)
				_dot(X - 1.0, Y - 1.0, T[3], 3.0, 3.0)
