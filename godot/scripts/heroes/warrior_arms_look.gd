## THE WARRIOR'S BATTLE AXE AND WARHAMMER AS THE GAME DRAWS THEM (render/render.ts, his thrown axe; render/warrior_fx.ts, the glint
## and the quaking ground), the art chat's pictures, each painted once and kept here as pictures (assets/heroes/warrior_fx-0.png,
## quake_<stone>-0.png; tools/godot_warrior_fx.ts):
##   HIS THROWN AXE spinning flat, a turn in AXE_FLIGHT.turn seconds, its anchor the floor under it (among what flies, over everyone).
##   axeGlint    his thrown axe come back to hands that hold one, gone into it: a cyan glint at his hands, a fifth of a second, over him.
##   quake       the Earthquake's ground heaving in the floor's own stone in place of the slam ring (fx.gd claims_slam), Tremors'
##               second and third each its own: what heaves under everyone, and the cracks for the way he struck, kept 2.4 s and
##               faded over the last four tenths, on the ground; what stands up into the air over everyone.
## THE FLOOR'S STONE (main.ts placeFrame, art/floors.ts floorLook): floors 1 to 3 the Crypt's own, floor 4 and every floor below it
## but the fifth the Crypt's fourth, the fifth the lair's; his town and anywhere else the vault's.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const DIR := "res://assets/heroes"

var kit
var loot
var air: Node2D
var _sheet: Texture2D
var _pics := {}
var _qsheet: Texture2D
var _qpics := {}
var D := {}
var _sides: Array = []
var glints: Array = []
var quakes: Array = []


class _Air extends Node2D:
	var look

	func _draw() -> void:
		look.draw_air(self)


func _ready() -> void:
	D = JSON.parse_string(FileAccess.get_file_as_string(DIR + "/warrior_fx.json"))
	_pics = D["pics"]
	_sheet = load(DIR + "/warrior_fx-0.png")
	_sides = D["sides"]
	var stone := _stone()
	_qpics = D["stonePics"][stone]
	_qsheet = load("%s/quake_%s-0.png" % [DIR, stone])
	air = _Air.new()
	air.look = self
	air.z_index = 40
	add_child(air)
	# (the Earthquake's ground drawn in place of the slam ring of a quake just begun: fx.ts, warrior.claims)
	var fx = kit.h.fx if kit != null else null
	if fx != null and is_instance_valid(fx):
		fx.claims_slam = claims


## The floor's stone, by the name the bake gives it (art/floors.ts floorLook, lookGround).
func _stone() -> String:
	var h = kit.h if kit != null else null
	if h == null or h.in_town or h.map == null:
		return "vault"
	var d := floori(float(h.map.depth))
	if d <= 0:
		return "vault"
	if d == 5:
		return "lair"
	return "crypt%d" % mini(4, d)


func on_event(e: Dictionary, _fx) -> void:
	match str(e.get("t", "")):
		"axeGlint":
			glints.append({"x": e["x"], "y": e["y"], "t": 0.0})
		"quake":
			quakes.append({"x": e["x"], "y": e["y"], "q": int(e["q"]), "side": _facing(float(e["fx"]), float(e["fy"])), "t": 0.0})


## (art/warrior_up_art.ts wuFacing) Which of his eight sides a way on the floor is.
func _facing(fx: float, fy: float) -> String:
	var a := rad_to_deg(atan2(fy, fx))
	var k := posmod(roundi(a / 45.0), 8)
	return ["front", "toward", "frontL", "sideL", "backL", "away", "back", "side"][k]


## A slam ring at (x, y) that is a quake of his just begun: its ground is drawn here in its place.
func claims(x: float, y: float) -> bool:
	for p in quakes:
		if float(p["t"]) == 0.0 and absf(float(p["x"]) - x) < 1e-6 and absf(float(p["y"]) - y) < 1e-6:
			return true
	return false


func _process(dt: float) -> void:
	var glint_secs: float = float(D["glintN"]) / 30.0
	var last: float = D["cracksLast"]["seconds"]
	for p in glints:
		p["t"] = float(p["t"]) + dt
	for p in quakes:
		p["t"] = float(p["t"]) + dt
	glints = glints.filter(func(p): return float(p["t"]) < glint_secs)
	quakes = quakes.filter(func(p): return float(p["t"]) < last)
	queue_redraw()
	air.queue_redraw()


func _at(x: float, y: float) -> Vector2:
	return Iso.to_screen(x, y) / 2.0


## One picture, its anchor at (x, y) game pixels of the screen, on `c`, `a` faint.
func _piece(c: CanvasItem, sheet: Texture2D, pics: Dictionary, key: String, at: Vector2, a := 1.0) -> void:
	var p = pics.get(key)
	if p == null or (p as Array).is_empty():
		return
	var X := roundf(at.x) * 2.0
	var Y := roundf(at.y) * 2.0
	c.draw_texture_rect_region(sheet, Rect2(X - float(p[4]), Y - float(p[5]), p[2], p[3]), Rect2(p[0], p[1], p[2], p[3]), Color(1, 1, 1, a))


## Under everyone: the heave's floor and its cracks.
func _draw() -> void:
	var L: Dictionary = D["cracksLast"]
	var cn: int = D["crackN"]
	var qn: int = D["quakeN"]
	for p in quakes:
		var at := _at(p["x"], p["y"])
		var t: float = p["t"]
		var grown := mini(cn - 1, floori(t / 0.15 * cn))
		var a := clampf((float(L["seconds"]) - t) / float(L["fade"]), 0.0, 1.0)
		_piece(self, _qsheet, _qpics, "%d:cracks:%s:%d" % [p["q"], p["side"], grown], at, a)
		if t < qn / 30.0:
			_piece(self, _qsheet, _qpics, "%d:under:%d" % [p["q"], mini(qn - 1, floori(t * 30.0))], at)


## Over the floor: his thrown axe, what the heave throws up, and the glint over him.
func draw_air(c: CanvasItem) -> void:
	if kit == null:
		return
	var turn: float = D["flight"]["turn"]
	var fly_n: int = D["flyN"]
	for p in kit.shots:
		if p.get("look", "") != "axe":
			continue
		var k := floori(float(p["age"]) / turn * fly_n) % fly_n
		_piece(c, _sheet, _pics, "fly:%d" % k, _at(p["x"], p["y"]))
	var qn: int = D["quakeN"]
	for p in quakes:
		var t: float = p["t"]
		if t >= qn / 30.0:
			continue
		_piece(c, _qsheet, _qpics, "%d:over:%d" % [p["q"], mini(qn - 1, floori(t * 30.0))], _at(p["x"], p["y"]))
	var gn: int = D["glintN"]
	for p in glints:
		var k := mini(gn - 1, floori(float(p["t"]) / (gn / 30.0) * gn))
		_piece(c, _sheet, _pics, "glint:%d" % k, _at(p["x"], p["y"]))
