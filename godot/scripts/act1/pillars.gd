## THE PILLARS IN THE FEN (game/quests610.ts PILLARS, Pillar, lightPillars, pillarsBurning, siegeBroken, piecesInHand; game.ts
## pillarsLightAt, pillarNear, setPillarPiece, pillarsStruck, pillarOut, and the boss "Shielded" while one burns; render/pillars.ts
## drawPillars): THE CULT'S THREE OBELISKS on the Swamp Colossus's stone (game/act1_rules/colossus.ts EYE3.pillars: where they stand,
## tools/godot_holds.ts writes them, in the order his fight lights them). With COLOSSUS on, the game's own pillars' rules are these,
## whatever PILLARS' own switch says (game.ts pillarNear: PILLARS.on || COLOSSUS.on).
##   AS HIS THIRD PHASE BEGINS, his fight calls `light_at` (A HOOK FOR THE SWAMP COLOSSUS'S FIGHT, act1/colossus*.gd: the game's
##     colossus.ts tick, `if (f.ph === 3 && f.mode === 'fight' && !g.level.pillars) g.pillarsLightAt(...)`): the three blaze, the
##     siege's lightning thrown up at each, and the line: "The cult's three obelisks blaze with the siege. While one burns, the
##     Drowned Eye cannot be hurt." (and "Strike them down." when he has no piece in hand).
##   WHILE ONE BURNS, `shields()`: a blow at him does nothing ("Shielded"); his fight asks it (game.ts damageMonster).
##   BESIDE A BURNING ONE (1.8 tiles of its foot), with a piece of the ward-stone in hand: E, "Obelisk: set a ward-stone piece";
##     the piece is set, it goes out, the friend's cyan at its foot, the chime ("The ward-stone piece flares, and the obelisk goes
##     dark. 2 still burn.").
##   A BLOW AT ITS FOOT (hero.gd _break_props: within the blow's reach and 0.8 more), no more than one counted each 0.3 s: after
##     12 it cracks and goes dark, toppling ("The obelisk cracks and goes dark."). A slow way, with no piece left to set.
##   THE LAST OUT: "THE SIEGE IS BROKEN. The Drowned Eye can be hurt." and "Siege broken" over him; `siege_broken()`.
##   DRAWN as the game draws them on the floor (render/pillars.ts, the stand-in drawn under his fight's own pillars' fire and lines,
##     which are his fight's: render/act1_fx/colossus_fx.ts drawColossusP3): BURNING, a ring of the siege's pink pulsing round its
##     foot over a glow, a crack of light round the ring for each blow it has taken; PUT OUT WITH A PIECE, the friend's cyan, soft;
##     BROKEN BY BLOWS, a dark scorch.
extends Node2D

const PINK := Color("#ff4f60")
const PINK_RING := Color("#ff4fa0")
const PINK_HOT := Color("#ffc1e0")
const CYAN := Color("#7fe8ff")
const SCORCH := Color("#120c10")
const MSG_QUEST := Color("#7af8f0")

var q  # quest610.gd
var main
## (the obelisks' feet, world)
var at: Array = []
## (each as it stands: {x, y, lit, by ("" / "piece" / "blows"), hits, last, out_at, from})
var pillars: Array = []
var _time := 0.0
var _add: CanvasItemMaterial


var _glows: Node2D


func _ready() -> void:
	_add = CanvasItemMaterial.new()
	_add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	# (the glows are added over the stones, 'lighter': a layer of their own, under the rings)
	_glows = _Glows.new()
	_glows.P = self
	_glows.material = _add
	_glows.show_behind_parent = true
	add_child(_glows)


func _process(dt: float) -> void:
	_time += dt
	if not pillars.is_empty():
		queue_redraw()
		_glows.queue_redraw()


## THE PILLARS BLAZE (game.ts pillarsLightAt): at these feet, or the obelisks' own where none are given. The Swamp Colossus's fight
## calls it as his third phase begins.
func light_at(points: Array = []) -> void:
	if not pillars.is_empty():
		return
	var feet: Array = points if not points.is_empty() else at
	for p in feet:
		var v := Vector2(p["x"], p["y"]) if p is Dictionary else Vector2(p)
		pillars.append({"x": v.x, "y": v.y, "lit": true, "by": "", "hits": 0, "last": -99.0, "out_at": -1.0, "from": Vector2.ZERO})
		main.fx.spray(v.x, v.y, 14, main.fx._ramp("lightning"), 2.4, 60.0, 10.0)
	# (the Swamp Colossus's kindle is heard in his slide's own sound; without him, thunder)
	if not bool(q.Q["switches"]["colossus"]):
		main.sfx.play("thunder", linear_to_db(0.6))
	main.loot.say(str(q.T["pillarsLit"]) if in_hand() > 0 else str(q.T["pillarsLitNoPiece"]), MSG_QUEST)


func burning() -> int:
	var n := 0
	for p in pillars:
		if p["lit"]:
			n += 1
	return n


## While one burns, the boss cannot be hurt (game.ts: "Shielded").
func shields() -> bool:
	return burning() > 0


func siege_broken() -> bool:
	return not pillars.is_empty() and burning() == 0


## The pieces of the ward-stone he has in hand: taken, less those set into a pillar here (quests610.ts piecesInHand).
func in_hand() -> int:
	var set := 0
	for p in pillars:
		if p["by"] == "piece":
			set += 1
	return maxi(0, q.taken() - set)


## The burning one he stands beside with a piece in hand (game.ts pillarNear), or -1.
func near() -> int:
	if pillars.is_empty() or in_hand() <= 0:
		return -1
	var h: Vector2 = main.hero.world
	var best := -1
	var bd: float = float(q.Q["pillars"]["near"])
	for i in pillars.size():
		var p: Dictionary = pillars[i]
		if not p["lit"]:
			continue
		var d := Vector2(p["x"], p["y"]).distance_to(h)
		if d <= bd:
			bd = d
			best = i
	return best


## A piece of the ward-stone set into burning pillar `i` (game.ts setPillarPiece): it goes out.
func set_piece(i: int) -> void:
	if i < 0 or i >= pillars.size() or not pillars[i]["lit"] or in_hand() <= 0:
		return
	var p: Dictionary = pillars[i]
	p["lit"] = false
	p["by"] = "piece"
	p["out_at"] = _time
	p["from"] = main.hero.world
	main.fx.spray(p["x"], p["y"], 18, main.fx._ramp("frost"), 2.4, 60.0, 10.0)
	main.sfx.play("colossus_pillar_set" if bool(q.Q["switches"]["colossus"]) else "power", 0.0 if bool(q.Q["switches"]["colossus"]) else linear_to_db(0.8))
	_out(q.T["pillarSet"][mini(2, burning())])


## A blow landing at `at`, `rad` round (game.ts pillarsStruck; hero.gd _break_props): each burning pillar whose foot it reaches takes
## one, no more than one each PILLARS.gap; the last of PILLARS.blows breaks it.
func struck(at: Vector2, rad: float) -> void:
	var P: Dictionary = q.Q["pillars"]
	for p in pillars:
		if not p["lit"] or Vector2(p["x"], p["y"]).distance_to(at) > rad + float(P["reach"]):
			continue
		if _time - float(p["last"]) < float(P["gap"]):
			continue
		p["last"] = _time
		p["hits"] = int(p["hits"]) + 1
		main.fx.spray(p["x"], p["y"], 6, main.fx._ramp("phys"), 2.4, 60.0, 10.0)
		if int(p["hits"]) < int(P["blows"]):
			continue
		p["lit"] = false
		p["by"] = "blows"
		p["out_at"] = _time
		main.fx.spray(p["x"], p["y"], 16, main.fx._ramp("phys"), 2.4, 60.0, 10.0)
		main.sfx.play("colossus_pillar_topple" if bool(q.Q["switches"]["colossus"]) else "hit", 0.0 if bool(q.Q["switches"]["colossus"]) else linear_to_db(0.8))
		_out(q.T["pillarBroken"][mini(2, burning())])


## One out: said; the last, the siege broken (game.ts pillarOut).
func _out(said: String) -> void:
	main.loot.say(said, MSG_QUEST)
	if burning() > 0:
		return
	main.loot.say(str(q.T["siegeBroken"]), MSG_QUEST)
	for m in main._monsters.list:
		if is_instance_valid(m) and m.boss and not m.dead:
			main.fx.float_text(m.world.x, m.world.y, "Siege broken", CYAN)
			break


## render/pillars.ts drawPillars, in game pixels.
func _draw() -> void:
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	for p in pillars:
		var c := (Vector2((p["x"] - p["y"]) * 16.0, (p["x"] + p["y"]) * 8.0)).round()
		if p["lit"]:
			var beat := 0.5 + 0.5 * sin(_time * 5.0 + float(p["x"]))
			# its ring, pulsing (its glow over the stones: _Glows)
			_ring(c, 26.0 + beat * 4.0, 13.0 + beat * 2.0, Color(PINK_RING, 0.6 + 0.3 * beat))
			# the blows it has taken: cracks of light round the ring
			for k in int(p["hits"]):
				var a := float(k) / 12.0 * TAU + 0.4
				draw_rect(Rect2(roundf(c.x + cos(a) * 22.0) - 1.0, roundf(c.y + sin(a) * 11.0) - 1.0, 2, 2), Color(PINK_HOT, 0.9))
		elif p["by"] == "piece":
			pass
		else:
			_ellipse(c, 24.0, 12.0, Color(SCORCH, 0.5))
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


func _ellipse(c: Vector2, rx: float, ry: float, col: Color) -> void:
	var pts := PackedVector2Array()
	for i in 40:
		var a := float(i) / 40.0 * TAU
		pts.append(c + Vector2(cos(a) * rx, sin(a) * ry))
	draw_colored_polygon(pts, col)


func _ring(c: Vector2, rx: float, ry: float, col: Color) -> void:
	var pts := PackedVector2Array()
	for i in 41:
		var a := float(i) / 40.0 * TAU
		pts.append(c + Vector2(cos(a) * rx, sin(a) * ry))
	draw_polyline(pts, col, 2.0)


## The pillars' glows, added over the stones: a burning one's (PINK_HOT at its middle, the siege's pink at 0.35, nothing at its edge,
## 46 by 23, beating), one put out with a piece the friend's cyan (30 by 15).
class _Glows extends Node2D:
	var P

	func _draw() -> void:
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		for p in P.pillars:
			var c := (Vector2((p["x"] - p["y"]) * 16.0, (p["x"] + p["y"]) * 8.0)).round()
			if p["lit"]:
				var beat := 0.5 + 0.5 * sin(P._time * 5.0 + float(p["x"]))
				_glow(c, 46.0, 23.0, [PINK_HOT, PINK_RING], 0.28 + 0.14 * beat, 0.35)
			elif p["by"] == "piece":
				_glow(c, 30.0, 15.0, [Color("#e8fbff"), CYAN], 0.45, 0.4)
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

	## A radial gradient in an ellipse rx by ry, `a` strong: its middle colour, its second at `mid` of the way, nothing at its edge;
	## as thin rings of it, each its share.
	func _glow(c: Vector2, rx: float, ry: float, cols: Array, a: float, mid: float) -> void:
		var steps := 16
		for i in steps:
			var k0 := float(i) / steps
			var k1 := float(i + 1) / steps
			var k := (k0 + k1) / 2.0
			var col: Color = cols[0].lerp(cols[1], k / mid) if k < mid else cols[1]
			var al := a * (1.0 if k < mid else 1.0 - (k - mid) / (1.0 - mid))
			var pts := PackedVector2Array()
			for j in 33:
				var t := float(j) / 32.0 * TAU
				pts.append(c + Vector2(cos(t) * rx * k1, sin(t) * ry * k1))
			for j in range(32, -1, -1):
				var t := float(j) / 32.0 * TAU
				pts.append(c + Vector2(cos(t) * rx * k0, sin(t) * ry * k0))
			draw_colored_polygon(pts, Color(col, al))
