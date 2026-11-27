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
##   golemShot      ITS SMALL SHOT: its cannon's flash, the shot streaking in the friend's cyan from its muzzle, its hit bursting
##   golemCharged   ITS BIG SHOT: the shell out of its mouth, its trail, and its blast where it lands (its scorch on the floor);
##                  the tesla coil's beam, the Golem skidding back as it pours (heroes/golem_paint.gd paints these as they come);
##                  while it braces and charges, the ring and grit round it and the steam and light at it, frame by frame
##   teslaZap       her tree's TESLA COIL: a jag of her cyan lightning from the coil on its back to the nearest, and on
##   HER TREE'S CONTRAPTION stands among the figures, loaded with her pick (bombs or energy), from in front or from behind by the way
##     it faces, turned over as the game turns it: thrown, tumbling through the air and bouncing; springing open; set up, a ring of
##     the friend's cyan round its foot (render.ts CON_SEEN); its mortar kicked by each shot; falling apart.
##   contraption       a thud of dust where it comes down; its lamp's ring as it is lit
##   vial (its own)    a puff of her brew's flash at its mouth; ITS LITTLE BOMB lobbed, tumbling, its fuse spitting, landed, a hop,
##                     sitting till it goes off
##   vialBurst (bomb)  her bomb going off where it sat, its scorch on the floor
##   contraptionBolt   ITS ENERGY BOLT from its ball to what it strikes, crackling there (golem_paint.gd, painted as it comes)
##   contraptionEnd    yellow sparks off its brass as it falls apart
##   blastJump      her bomb going off: its flash and fireball, chips flung, a scorch left glowing and cooling; puffs of its smoke
##                  along the way she flew
##   blastLand      a thud of dust where she comes down
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const Glow := preload("res://scripts/figure_glow.gd")
const MageLook := preload("res://scripts/heroes/mage_look.gd")
const Paint := preload("res://scripts/heroes/golem_paint.gd")
const L := preload("res://scripts/fx_looks.gd")

var kit
var loot
var air: Node2D
var _t := 0.0
var _gsheets: Array = []
var _gpics := {}
## (its big shot: the art's frames and numbers; the painter of what runs any way)
var CH := {}
var paint
var GUN: Array = []
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
## (ITS SHOTS: the small shot's streak {x0, y0, x1, y1, t, flight, way} and flash {x, y, t, way}; the shell in flight and the beam,
## each {x, y, t, ..., kept: frames painted}; the shell's blasts {x, y, r, t}; the coil's zaps {x, y, t, frames}; what comes later
## [at, Callable])
var shots: Array = []
var flashes: Array = []
var flights: Array = []
var beams: Array = []
var big_blasts: Array = []
var zaps: Array = []
var _later: Array = []
## (HER TREE'S CONTRAPTION: its mouth's puffs {x, y, t}; its lamps {x, y, t}; its bolts, painted as they come; its sparks)
var puffs: Array = []
var lamps: Array = []
var con_bolts: Array = []
var con_sparks: Array = []
var CON := {}
var _con_nodes := {}
## (what runs any way is painted ahead off the screen's own thread, a frame at a time, as the game paints it: each shot's `done`
## frames under this lock; the tasks, waited for once done)
var _mx := Mutex.new()
var _tasks: Array = []
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
## (its run's frames to a round, the old look's; the wheel's own its json's `runN`)
var GRUN_ROUND := 16
## THE GOLEM THAT ONLY SHOOTS IN ITS NEW LOOK (tools/godot_golem_wheel.ts: one great wheel in place of its legs, its big gun at
## its side in place of its giant fist; his picks of 21 Nov 2026, “fist to a big gun, but id like him to have 1 wheel instead of
## legs” and “At its side”). ON: shown all its moves, in pictures and in the game, his “Yes, switch it on (Recommended)”, 21 Nov
## 2026. Off, the old look with legs and its cannon arm (assets/heroes/golem*).
const WHEEL_LOOK := true
## (a check's hand on the switch: the new look shown in a check's pictures, the switch left as it is)
static var wheel_look_now := false

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
	var look_name := "golem_wheel" if WHEEL_LOOK or wheel_look_now else "golem"
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/%s.json" % look_name))
	GRUN_ROUND = int(d.get("runN", 16))
	_gpics = d["pics"]
	_clips = d["clips"]
	_aura = d["aura"]
	_trail = d["trail"]
	RK = d["rocket"]
	_stride = float(d["runStride"])
	var most := 0
	for k in _gpics:
		var q: Array = _gpics[k]
		if q.size() > 6:
			most = maxi(most, int(q[6]))
	for n in most + 1:
		_gsheets.append(load("res://assets/heroes/%s-%d.png" % [look_name, n]))
	CH = d["charge"]
	paint = Paint.new(CH)
	var f: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/tinkerer_fx.json"))
	_fpics = f["pics"]
	for c in f["brew"]:
		BREW.append(Color(c))
	for c in f["gunGlow"]:
		GUN.append(Color(c))
	CON = f["con"]
	paint.set_con(CON, BREW)
	_fsheet = load("res://assets/heroes/tinkerer_fx-0.png")
	air = _Air.new()
	air.look = self
	air.z_index = 40
	add_child(air)


func _exit_tree() -> void:
	for n in _con_nodes.values():
		if is_instance_valid(n):
			n.queue_free()
	_con_nodes.clear()
	for id in _tasks:
		WorkerThreadPool.wait_for_task_completion(id)
	_tasks.clear()
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
			var lob := {"x0": e["x0"], "y0": e["y0"], "x1": e["x1"], "y1": e["y1"], "t": 0.0, "flight": e["flight"], "hand": int(e.get("id", -1)) < 0,
				"little": e.get("little", false), "big": e.get("big", false)}
			# (her tree's CONTRAPTION, its pick BOMBS: a little bomb, going off a moment after it lands)
			if e.has("bomb"):
				lob["fuse"] = float(e["bomb"])
			lobs.append(lob)
			# (out of a Contraption's mortar: a little puff of her brew's flash at its mouth)
			if int(e.get("id", -1)) >= 0:
				puffs.append({"x": e["x0"], "y": e["y0"], "t": 0.0})
		"contraption":
			var cx: float = e["x"]
			var cy: float = e["y"]
			_later.append([_t + 12.0 / 30.0, func() -> void: thuds.append({"x": cx, "y": cy, "t": 0.0})])
			_later.append([_t + 38.0 / 30.0, func() -> void: lamps.append({"x": cx, "y": cy, "t": 0.0})])
		"contraptionEnd":
			con_sparks.append({"x": e["x"], "y": e["y"], "t": 0.0})
		"contraptionBolt":
			# (with the switch on, her Contraption's bolt is Lightning's own, as every bolt from one to the next is, whatever its
			# source: fx_looks.gd same; her machine keeps her cyan)
			var fxo = kit.h.fx if kit != null else null
			if L.same() and fxo != null and is_instance_valid(fxo):
				fxo.ground_bolt(float(e["x0"]), float(e["y0"]), float(e["x1"]), float(e["y1"]))
				return
			var bdx := float(e["x1"]) - float(e["x0"])
			var bdy := float(e["y1"]) - float(e["y0"])
			var bf := _facing(bdx, bdy)
			var cb := {"x": e["x0"], "y": e["y0"], "t": 0.0, "view": bf[0], "flip": bf[1], "dx": bdx, "dy": bdy, "kept": {}, "done": {}}
			cb["n"] = paint.con_bolt_long(cb["view"], cb["flip"], bdx, bdy)
			var pt = paint
			_ahead(cb, int(cb["n"]), func(k: int) -> Dictionary: return pt.con_bolt(cb["view"], cb["flip"], cb["dx"], cb["dy"], k))
			con_bolts.append(cb)
		"vialBurst":
			# (her tree's CONTRAPTION, its pick BOMBS: her bomb going off, as her blast jump's does)
			if e.get("bomb", false):
				big_blasts.append({"x": e["x"], "y": e["y"], "t": 0.0, "r": "", "kind": "bomb", "k": float(e.get("k", 1.0))})
				# (THE TINKERER'S BUILDS: a bomb with Mad Mixture's brew in it, its colours over the blast)
				if str(e.get("brew", "")) != "":
					bursts.append({"x": e["x"], "y": e["y"], "t": 0.0, "k": float(e.get("k", 1.0)), "brew": str(e["brew"])})
				return
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
					"dx": float(r["x1"]) - float(r["x0"]), "dy": float(r["y1"]) - float(r["y0"]), "flight": float(r["flight"]), "t": 0.0,
					"gun": "tesla:" if str(r.get("gun", "cannon")) == "tesla" else ""})
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
		# (her tree's GROWTH SERUM: steam and dust as it grows, its picture grown: tinkerer_fx.ts, render.ts drawTinkerers)
		"golemGrow":
			arrives.append({"x": e["x"], "y": e["y"], "t": 0.0})
		"golemPound":
			pounds.append({"x": e["x"], "y": e["y"], "t": 0.0})
		"golemDown":
			sparks.append({"x": e["x"], "y": e["y"], "t": 0.0})
		# (ITS SMALL SHOT: its cannon's flash, the shot streaking, its hit bursting as it lands)
		"golemShot":
			var way := 1 if (float(e["x1"]) - float(e["y1"])) - (float(e["x0"]) - float(e["y0"])) >= 0.0 else -1
			shots.append({"x0": e["x0"], "y0": e["y0"], "x1": e["x1"], "y1": e["y1"], "t": 0.0, "flight": maxf(0.05, float(e["flight"])), "way": way})
			flashes.append({"x": e["x0"], "y": e["y0"], "t": 0.0, "way": way})
			var hx: float = e["x1"]
			var hy: float = e["y1"]
			_later.append([_t + float(e["flight"]), func() -> void: impacts.append({"x": hx, "y": hy, "t": 0.0, "k": 1.4})])
		# (ITS BIG SHOT: the shell out of its mouth and its trail, its blast where it lands as it lands; or the beam from the coil's
		# ball, laid with the Golem as it is pushed back while it pours)
		"golemCharged":
			var dx := float(e["x1"]) - float(e["x0"])
			var dy := float(e["y1"]) - float(e["y0"])
			var face := _facing(dx, dy)
			if str(e["kind"]) == "shell":
				var fl := {"x": e["x0"], "y": e["y0"], "t": 0.0, "view": face[0], "flip": face[1], "dx": dx, "dy": dy, "n": Paint.shell_n(float(e["flight"])), "kept": {}, "done": {}}
				var pt = paint
				_ahead(fl, int(fl["n"]) + 4, func(k: int) -> Dictionary: return pt.shell_flight(fl["view"], fl["flip"], fl["dx"], fl["dy"], k, fl["n"]))
				flights.append(fl)
				var bx: float = e["x1"]
				var by: float = e["y1"]
				var key := _radius_key(float(e["r"]))
				_later.append([_t + float(e["flight"]), func() -> void: big_blasts.append({"x": bx, "y": by, "t": 0.0, "r": key})])
			else:
				var len := Vector2(dx, dy).length()
				if len == 0.0:
					len = 1.0
				var bm := {"x": e["x0"], "y": e["y0"], "t": 0.0, "view": face[0], "flip": face[1], "dx": dx, "dy": dy, "ux": dx / len, "uy": dy / len, "kept": {}, "done": {}}
				var pt = paint
				_ahead(bm, int(CH["beamFrames"]), func(k: int) -> Dictionary: return pt.beam(bm["view"], bm["flip"], bm["dx"], bm["dy"], k))
				beams.append(bm)
		# (her tree's TESLA COIL: its zap, painted as it comes, laid at the Golem's foot)
		"teslaZap":
			# (with the switch on, the coil's zap leaping from one to the next is Lightning's own: fx_looks.gd same)
			var fxz = kit.h.fx if kit != null else null
			if L.same() and fxz != null and is_instance_valid(fxz):
				var from := Vector2(float(e["x"]), float(e["y"]))
				for o in e["to"]:
					fxz.ground_bolt(from.x, from.y, float(o["x"]), float(o["y"]))
					from = Vector2(float(o["x"]), float(o["y"]))
				return
			var zp := {"x": e["x"], "y": e["y"], "t": 0.0, "kept": {}, "done": {}}
			var zx: float = e["x"]
			var zy: float = e["y"]
			var up: float = Paint.COIL_UP * (2.0 if e.get("grown", false) else 1.0)
			var to: Array = e["to"]
			_ahead(zp, 1, func(_k: int) -> Dictionary: return {"all": Paint.zap(zx, zy, up, to)})
			zaps.append(zp)
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
		if float(lobs[i]["t"]) >= float(lobs[i]["flight"]) + float(lobs[i].get("fuse", 0.0)):
			lobs.remove_at(i)
	for pair in [[puffs, 6.0 / 30.0], [lamps, 5.0 / 30.0], [con_sparks, 16.0 / 30.0]]:
		var list: Array = pair[0]
		for i in range(list.size() - 1, -1, -1):
			list[i]["t"] = float(list[i]["t"]) + dt
			if float(list[i]["t"]) >= float(pair[1]):
				list.remove_at(i)
	for i in range(con_bolts.size() - 1, -1, -1):
		con_bolts[i]["t"] = float(con_bolts[i]["t"]) + dt
		if floori(float(con_bolts[i]["t"]) * 30.0) >= int(con_bolts[i]["n"]):
			con_bolts.remove_at(i)
	var launch_life := maxi(int(RK["launchN"]), ceili(float(RK["flight"])) + int(RK["puffLife"]) + 1)
	for i in range(launches.size() - 1, -1, -1):
		launches[i]["t"] = float(launches[i]["t"]) + dt
		if floori(float(launches[i]["t"]) * 30.0) >= launch_life:
			launches.remove_at(i)
	for i in range(lands.size() - 1, -1, -1):
		lands[i]["t"] = float(lands[i]["t"]) + dt
		if floori(float(lands[i]["t"]) * 30.0) >= int(RK["landN"]):
			lands.remove_at(i)
	# (ITS SHOTS: the small shot's streak while it flies; its flash; the shell in flight and the beam by their frames; the blasts; the
	# zaps; what was to come, as it comes)
	for i in range(shots.size() - 1, -1, -1):
		shots[i]["t"] = float(shots[i]["t"]) + dt
		if float(shots[i]["t"]) >= float(shots[i]["flight"]):
			shots.remove_at(i)
	for pair in [[flashes, 6.0 / 30.0], [zaps, Paint.ZAP_N / 30.0]]:
		var list: Array = pair[0]
		for i in range(list.size() - 1, -1, -1):
			list[i]["t"] = float(list[i]["t"]) + dt
			if float(list[i]["t"]) >= float(pair[1]):
				list.remove_at(i)
	for i in range(flights.size() - 1, -1, -1):
		flights[i]["t"] = float(flights[i]["t"]) + dt
		if floori(float(flights[i]["t"]) * 30.0) >= int(flights[i]["n"]) + 4:
			flights.remove_at(i)
	for i in range(beams.size() - 1, -1, -1):
		beams[i]["t"] = float(beams[i]["t"]) + dt
		if floori(float(beams[i]["t"]) * 30.0) >= int(CH["beamFrames"]):
			beams.remove_at(i)
	for i in range(big_blasts.size() - 1, -1, -1):
		big_blasts[i]["t"] = float(big_blasts[i]["t"]) + dt
		var long: int = int(CON["BOMB_FX"]["long"]) if big_blasts[i].get("kind", "") == "bomb" else int(CH["shellFx"]["long"])
		if floori(float(big_blasts[i]["t"]) * 30.0) >= long:
			big_blasts.remove_at(i)
	for id in _tasks.duplicate():
		if WorkerThreadPool.is_task_completed(id):
			WorkerThreadPool.wait_for_task_completion(id)
			_tasks.erase(id)
	var due := _later.filter(func(q): return _t >= float(q[0]))
	_later = _later.filter(func(q): return _t < float(q[0]))
	for q in due:
		q[1].call()
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
	var sheet: Texture2D = _gsheets[int(p[6]) if (p as Array).size() > 6 else 0]
	if flip:
		# (mirrored about its anchor, as flipSprite turns a picture over)
		c.draw_set_transform(Vector2(x, y), 0.0, Vector2(-1, 1))
		c.draw_texture_rect_region(sheet, Rect2(-float(p[4]), -float(p[5]), p[2], p[3]), src, Color(1, 1, 1, a))
		c.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	else:
		c.draw_texture_rect_region(sheet, Rect2(x - float(p[4]), y - float(p[5]), p[2], p[3]), src, Color(1, 1, 1, a))


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
		# (a hair nearer than a figure on its spot: render.ts, its depth x + y + 0.02; her tree's GROWTH SERUM, drawn grown)
		n.position = Iso.to_screen(x, y) + Vector2(0, 0.32)
		n.scale = Vector2.ONE * kit.golem_grow(g)
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
	_place_cons(holder)
	# (its take-offs' flash, fire, dust and stone and its after-image, a hair behind the Golem there from in front and a hair before it
	# from behind; its landings' dust and stone a hair before it)
	var want: Array = []
	for l in launches:
		var k := floori(float(l["t"]) * 30.0)
		if k < int(RK["launchN"]):
			want.append([l, "%s%s:launchAir:%d" % [l.get("gun", ""), "back" if l["back"] else "front", k], 0.02 + (0.005 if l["back"] else -0.005)])
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
	# (her tree's GUN ARM: the Golem with the tesla coil in its cannon's place)
	var gun: String = kit.arm_of()
	var tag := "tesla:" if gun == "tesla" else ""
	var key := "%s%s:idle:0" % [tag, view]
	var rocket := act == "jump"
	var rf := _rf(g)
	if act == "walk":
		# (ITS RUN, the art chat's gallop, by the floor it covers: RUN_STRIDE tiles a round, so that its fist and feet grip)
		key = "%s%s:run:%d" % [tag, view, floori(float(g["walked"]) / _stride * GRUN_ROUND) % GRUN_ROUND]
	elif rocket:
		key = "%s%s:rocket:%d" % [tag, view, rf]
	elif act == "cannon":
		# (ITS SMALL SHOT: its cannon brought down and fired)
		key = "%s:shot:%d" % [view, _clip_frame("shot", t)]
	elif act == "charge":
		# (ITS BIG SHOT: the wind-up, the loop round and round while she holds, then on from the shot)
		key = "%s:%s:charge:%d" % [gun, view, mini(charge_at(g), int(CH["frames"][gun]) - 1)]
	elif act == "down":
		key = "%s%s:down:%d" % [tag, view, _clip_frame("down", t)]
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
		var r: float = GOLEM_SHADOW * float(rk["r"]) * kit.golem_grow(g)
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
	# (the ring and grit round a charging Golem; the shell's scorch and cracks where it burst)
	for g in kit.golems:
		if g["act"] != "charge":
			continue
		var f := charge_at(g)
		var gun: String = kit.arm_of()
		if f >= 0 and f <= int(CH["fxLast"][gun]):
			var view := "back" if float(g["fx"]) + float(g["fy"]) < -0.2 else "front"
			gpiece(self, "%s:%s:chFloor:%d" % [gun, view, f], roundf(_gx(g["x"], g["y"])) * 2.0, roundf(_gy(g["x"], g["y"])) * 2.0, float(g["fx"]) - float(g["fy"]) < 0.0)
	for b in big_blasts:
		_piece(self, "%sF:%d" % [_blast_key(b), floori(float(b["t"]) * 30.0)], _gx(b["x"], b["y"]), _gy(b["x"], b["y"]), 1.0, float(b.get("k", 1.0)))
	# (her tree's CONTRAPTION: a ring of the friend's cyan round each set up: render.ts CON_SEEN; its lamp's ring as it is lit)
	if kit != null:
		for c in kit.contraptions:
			if float(c["broke"]) >= 0.0 or float(c["t"]) < 22.0 / 30.0:
				continue
			var k := minf(1.0, (float(c["t"]) - 22.0 / 30.0) / 0.2)
			var cx := roundf(_gx(c["x"], c["y"]))
			var cy := roundf(_gy(c["x"], c["y"]))
			draw_set_transform(Vector2(cx, cy) * 2.0, 0.0, Vector2(0.5 * 22.6, 0.5 * 11.3) * 2.0)
			draw_circle(Vector2.ZERO, 1.0, Color(0.133, 0.816, 0.878, 0.14 * k))
			draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
			var n := maxi(16, roundi(0.46 * 44.0))
			for j in n:
				var a := float(j) / n * TAU
				draw_rect(Rect2(roundf(cx + (cos(a) - sin(a)) * 16.0 * 0.46) * 2.0, roundf(cy + (cos(a) + sin(a)) * 8.0 * 0.46) * 2.0, 2.0, 2.0), Color(0.478, 0.957, 1.0, k))
	# (where its rocket jumps took off, scorched and cracked, glowing; where they came down, cracked open; under a Golem crouched to
	# take off, the light of its stacks' fire and grit hopping)
	for l in launches:
		var k := floori(float(l["t"]) * 30.0)
		if k < int(RK["launchN"]):
			gpiece(self, "%s%s:launchFloor:%d" % [l.get("gun", ""), "back" if l["back"] else "front", k], roundf(_gx(l["x"], l["y"])) * 2.0, roundf(_gy(l["x"], l["y"])) * 2.0, l["flip"])
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
## (THE TINKERER'S BUILDS, Coin Toss) Her coins in flight: little gold discs turning over as they go.
func _draw_coins(c: CanvasItem) -> void:
	if kit == null:
		return
	for s in kit.shots:
		if s.get("look", "") != "coin":
			continue
		var x := roundf(_gx(s["x"], s["y"]))
		var y := roundf(_gy(s["x"], s["y"])) - 12.0
		var turn := absf(sin(float(s["age"]) * 22.0 + float(s.get("n", 0))))
		var w := maxf(1.0, 4.0 * turn)
		c.draw_rect(Rect2((x - w) * 2.0, (y - 4.0) * 2.0, w * 4.0, 16.0), Color("#8a5a12"))
		c.draw_rect(Rect2((x - w + 1.0) * 2.0, (y - 3.0) * 2.0, maxf(2.0, w * 4.0 - 4.0), 12.0), Color("#ffd448"))
		if turn > 0.5:
			c.draw_rect(Rect2((x - 1.0) * 2.0, (y - 3.0) * 2.0, 4.0, 4.0), Color("#fff6c0"))


func draw_air(c: CanvasItem) -> void:
	_draw_coins(c)
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
		if l.has("fuse"):
			# (a little bomb: lobbed, then landed, a hop, and sitting till it goes off, its fuse spitting)
			var bu := minf(1.0, float(l["t"]) / float(l["flight"]))
			var bx := float(l["x0"]) + (float(l["x1"]) - float(l["x0"])) * bu
			var by := float(l["y0"]) + (float(l["y1"]) - float(l["y0"])) * bu
			var after := float(l["t"]) - float(l["flight"])
			var hop_t := float(CON["BOMB_FX"]["hop"]) / 30.0
			var bup := 10.0 * (1.0 - bu) + 4.0 * 30.0 * bu * (1.0 - bu) if after < 0.0 else (6.0 * sin(after / hop_t * PI) if after < hop_t else 0.0)
			var fr := floori(float(l["t"]) * 18.0) % 8 if after < 0.0 else floori(float(l["t"]) * 10.0) % 2
			# (THE TINKERER'S BUILDS: her own bomb, from her hand, bigger than her Contraption's little ones; The Big One's bigger still)
			var bk := 1.0 if not l["hand"] else (0.9 if l.get("little", false) else (2.6 if l.get("big", false) else 1.7))
			_piece(c, "bomb:%d" % fr, _gx(bx, by), _gy(bx, by) - bup, 1.0, bk)
			continue
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
	for p in con_sparks:
		_piece(c, "sparks0:%d" % _at(16, float(p["t"]) / LIFE["sparks"]), _gx(p["x"], p["y"]), _gy(p["x"], p["y"]))
	for p in lamps:
		_piece(c, "lamp:%d" % _at(5, float(p["t"]) / (5.0 / 30.0)), _gx(p["x"], p["y"]), _gy(p["x"], p["y"]) - 8.0)
	# (a Contraption's mouth: a little puff of her brew's flash)
	for p in puffs:
		var k := float(p["t"]) / (6.0 / 30.0)
		var col: Color = BREW[3 if k < 0.4 else 1]
		col.a = 1.0 - k
		var px := roundf(_gx(p["x"], p["y"]))
		var py := roundf(_gy(p["x"], p["y"]) - 12.0)
		c.draw_rect(Rect2((px - 1.0) * 2.0, (py - 1.0 - roundf(k * 4.0)) * 2.0, 6.0, 6.0), col)
	_draw_shots(c)


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


# =====================================================================================================================
# ITS SHOTS (render/tinkerer_fx.ts drawAir, its gun's; render.ts chargeAt)

## (render/tinkerer_fx.ts facing) Which way a shot runs on the picture: from behind or in front, and whether turned over.
func _facing(dx: float, dy: float) -> Array:
	var len := Vector2(dx, dy).length()
	if len == 0.0:
		len = 1.0
	return ["back" if (dx + dy) / len < -0.2 else "front", (dx - dy) / len < 0.0]


## (art/golem_shots_fx.ts radiusOf) The shell's blast as it is painted: to the half tile, as approved at the most; its pictures' name.
func _radius_key(r: float) -> String:
	var rr := maxf(0.5, minf(float(CH["shellFx"]["blast"]), floorf(r * 2.0 + 0.5) / 2.0))
	var best: float = CH["shellRadii"][0]
	for q in CH["shellRadii"]:
		if absf(float(q) - rr) < absf(best - rr):
			best = float(q)
	return ("%d" % int(best)) if best == floorf(best) else ("%.1f" % best)


## (dev/golem_moves.ts chargeFrame, render.ts chargeAt) The frame of its big shot a Golem shows: the wind-up, the loop round and
## round while she holds, then on from the shot.
func charge_at(g: Dictionary) -> int:
	var C: Dictionary = CH["C"]
	var held := 1e9 if float(g["held"]) < 0.0 else maxf(float(kit.GT["charge"]["build"]), float(g["held"])) * 30.0
	var t := floori(float(g["act_t"]) * 30.0)
	var hh := maxf(float(C["loop"]), roundf(held))
	if t < int(C["loop"]):
		return t
	if t < hh:
		return int(C["loop"]) + (t - int(C["loop"])) % int(C["round"])
	return int(C["fire"]) + int(t - hh)


## A piece painted as it came ({tex, ax, ay}), its anchor at (x, y) game pixels of the screen.
func _painted(c: CanvasItem, q: Dictionary, x: float, y: float) -> void:
	if q.is_empty():
		return
	c.draw_texture(q["tex"], Vector2(roundf(x) * 2.0 - roundf(float(q["ax"])), roundf(y) * 2.0 - roundf(float(q["ay"]))))


## A shot's `n` frames painted ahead, in order, off the screen's own thread, by `make` (frame -> {img, ax, ay} or {}).
func _ahead(s: Dictionary, n: int, make: Callable) -> void:
	var mx := _mx
	var done: Dictionary = s["done"]
	_tasks.append(WorkerThreadPool.add_task(func() -> void:
		for k in n:
			var p: Dictionary = make.call(k)
			mx.lock()
			done[k] = p
			mx.unlock()))


## Frame `k` of a shot running any way as it is drawn: painted ahead (heroes/golem_paint.gd), made a picture the first time it is
## drawn and kept; not yet painted, the last one that is (or none).
func _frame(s: Dictionary, k: int) -> Dictionary:
	var kept: Dictionary = s["kept"]
	if kept.has(k):
		return kept[k]
	_mx.lock()
	var p = s["done"].get(k)
	_mx.unlock()
	if p == null:
		for j in range(k - 1, -1, -1):
			if kept.has(j):
				return kept[j]
		return {}
	kept[k] = {} if (p as Dictionary).is_empty() else {"tex": ImageTexture.create_from_image(p["img"]), "ax": p["ax"], "ay": p["ay"]}
	return kept[k]


## Its small shots streaking from its muzzle up by its shoulder, their flashes; the coil's zaps; then, laid as the art chat's film
## lays them, the shell's first two frames, everything at a Golem charging, the shell in flight, the beam, the blasts.
func _draw_shots(c: CanvasItem) -> void:
	for s in shots:
		var u := float(s["t"]) / float(s["flight"])
		var x0 := _gx(s["x0"], s["y0"]) + float(s["way"]) * 8.0
		var y0 := _gy(s["x0"], s["y0"]) - 34.0
		var x1 := _gx(s["x1"], s["y1"])
		var y1 := _gy(s["x1"], s["y1"]) - 12.0
		var hx := roundf(x0 + (x1 - x0) * u)
		var hy := roundf(y0 + (y1 - y0) * u)
		var tx := roundf(x0 + (x1 - x0) * maxf(0.0, u - 0.25))
		var ty := roundf(y0 + (y1 - y0) * maxf(0.0, u - 0.25))
		c.draw_line(Vector2(tx, ty) * 2.0, Vector2(hx, hy) * 2.0, GUN[1], 4.0)
		c.draw_rect(Rect2((hx - 1.0) * 2.0, (hy - 1.0) * 2.0, 6.0, 6.0), GUN[3])
	for f in flashes:
		_piece(c, "flash%d:%d" % [int(f["way"]), _at(6, float(f["t"]) / (6.0 / 30.0))], _gx(f["x"], f["y"]), _gy(f["x"], f["y"]) - 34.0)
	for z in zaps:
		# (its four frames painted together, ahead)
		var kept: Dictionary = z["kept"]
		if kept.is_empty():
			_mx.lock()
			var all = z["done"].get(0)
			_mx.unlock()
			if all == null:
				continue
			for j in (all["all"] as Array).size():
				var q: Dictionary = all["all"][j]
				kept[j] = {"tex": ImageTexture.create_from_image(q["img"]), "ax": q["ax"], "ay": q["ay"]}
		_painted(c, kept[_at(Paint.ZAP_N, float(z["t"]) / (Paint.ZAP_N / 30.0))], _gx(z["x"], z["y"]), _gy(z["x"], z["y"]))
	for f in flights:
		var k := floori(float(f["t"]) * 30.0)
		if k < 2:
			_painted(c, _frame(f, k), _gx(f["x"], f["y"]), _gy(f["x"], f["y"]))
	for g in kit.golems:
		if g["act"] != "charge":
			continue
		var fr := charge_at(g)
		var gun: String = kit.arm_of()
		if fr >= 0 and fr <= int(CH["fxLast"][gun]):
			var view := "back" if float(g["fx"]) + float(g["fy"]) < -0.2 else "front"
			gpiece(c, "%s:%s:chAir:%d" % [gun, view, fr], roundf(_gx(g["x"], g["y"])) * 2.0, roundf(_gy(g["x"], g["y"])) * 2.0, float(g["fx"]) - float(g["fy"]) < 0.0)
	for f in flights:
		var k := floori(float(f["t"]) * 30.0)
		if k >= 2:
			_painted(c, _frame(f, k), _gx(f["x"], f["y"]), _gy(f["x"], f["y"]))
	for b in beams:
		var k := floori(float(b["t"]) * 30.0)
		var back: float = paint.skid("beam", mini(k, int(CH["beamFrames"])))
		var bx := float(b["x"]) - float(b["ux"]) * back
		var by := float(b["y"]) - float(b["uy"]) * back
		_painted(c, _frame(b, k), _gx(bx, by), _gy(bx, by))
	for b in big_blasts:
		_piece(c, "%sA:%d" % [_blast_key(b), floori(float(b["t"]) * 30.0)], _gx(b["x"], b["y"]), _gy(b["x"], b["y"]), 1.0, float(b.get("k", 1.0)))
	# (her Contraption's bolts of energy, painted as they come)
	for b in con_bolts:
		_painted(c, _frame(b, floori(float(b["t"]) * 30.0)), _gx(b["x"], b["y"]), _gy(b["x"], b["y"]))


# =====================================================================================================================
# HER TREE'S CONTRAPTION (render.ts drawTinkerers)

## A Contraption standing among the figures: its picture drawn by the look.
class _Con extends Node2D:
	var look
	var c: Dictionary

	func _draw() -> void:
		look.draw_con(self, c)


## (art/golem_shots_fx.ts radiusOf) Which of the big blasts' pictures: the shell's at its radius, or her bomb's.
func _blast_key(b: Dictionary) -> String:
	return "bomb" if b.get("kind", "") == "bomb" else "shell%s" % b["r"]


func _place_cons(holder) -> void:
	var seen := {}
	for c in kit.contraptions:
		var id: int = c["id"]
		seen[id] = true
		var n = _con_nodes.get(id)
		if n == null or not is_instance_valid(n):
			n = _Con.new()
			n.look = self
			holder.add_child(n)
			_con_nodes[id] = n
		n.c = c
		var at := _con_at(c)
		# (a hair nearer than a figure on its spot: render.ts, its depth x + y + 0.01)
		n.position = Iso.to_screen(at.x, at.y) + Vector2(0, 0.16)
		n.queue_redraw()
	for id in _con_nodes.keys():
		if not seen.has(id):
			if is_instance_valid(_con_nodes[id]):
				_con_nodes[id].queue_free()
			_con_nodes.erase(id)


## Where it is on the floor: flying from her hand to where it comes down, as it is thrown.
func _con_at(c: Dictionary) -> Vector2:
	var t: float = c["t"]
	if float(c["broke"]) < 0.0 and t < 12.0 / 30.0:
		var u := t / (12.0 / 30.0)
		return Vector2(float(c["x0"]) + (float(c["x"]) - float(c["x0"])) * u, float(c["y0"]) + (float(c["y"]) - float(c["y0"])) * u)
	return Vector2(c["x"], c["y"])


## (render.ts drawTinkerers) A Contraption's picture for what it is doing: broken, falling apart; thrown, tumbling high and coming
## down, a bounce; shut; springing open; its mortar kicked by a shot; set up.
func draw_con(node: CanvasItem, c: Dictionary) -> void:
	var view := "back" if float(c["fx"]) + float(c["fy"]) < -0.2 else "front"
	var pre := "con:%s:%s:" % [kit.ammo(), view]
	var clips: Dictionary = CON["clips"]
	var t: float = c["t"]
	var lift := 0.0
	var key := ""
	var LAND := 12.0 / 30.0
	var SETTLE := 22.0 / 30.0
	var OPEN0 := 24.0 / 30.0
	var tumble: int = clips["tumble"]["n"]
	var clip := func(name: String, s: float) -> String:
		var cl: Dictionary = clips[name]
		return "%s%s:%d" % [pre, name, clampi(floori(s * float(cl["fps"]) + 1e-6), 0, int(cl["n"]) - 1)]
	if float(c["broke"]) >= 0.0:
		key = clip.call("broke", float(c["broke"]))
	elif t < LAND:
		var u := t / LAND
		lift = 14.0 + 26.0 * 4.0 * u * (1.0 - u) - 14.0 * u
		key = "%stumble:%d" % [pre, floori(t * 24.0) % tumble]
	elif t < SETTLE:
		var u := (t - LAND) / (SETTLE - LAND)
		lift = 9.0 * 4.0 * u * (1.0 - u)
		key = "%stumble:%d" % [pre, (floori(t * 18.0) % 2) * 4]
	elif t < OPEN0:
		key = "%stumble:0" % pre
	elif t < float(kit._C()["set"]):
		key = clip.call("open", t - OPEN0)
	elif float(c["shot_age"]) < float(clips["shot"]["n"]) / float(clips["shot"]["fps"]):
		key = clip.call("shot", float(c["shot_age"]))
	else:
		key = "%sstand:0" % pre
	var at := _con_at(c)
	fpiece(node, key, 0.0, -lift * 2.0 - _lift(at.x, at.y) - 0.16, float(c["fx"]) - float(c["fy"]) < 0.0)


## One of her effects' pieces, its anchor at (x, y) picture pixels on `c`, turned over about its anchor (flipSprite).
func fpiece(c: CanvasItem, key: String, x: float, y: float, flip := false) -> void:
	var p = _fpics.get(key)
	if p == null or (p as Array).is_empty():
		return
	var src := Rect2(p[0], p[1], p[2], p[3])
	if flip:
		c.draw_set_transform(Vector2(x, y), 0.0, Vector2(-1, 1))
		c.draw_texture_rect_region(_fsheet, Rect2(-float(p[4]), -float(p[5]), p[2], p[3]), src)
		c.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	else:
		c.draw_texture_rect_region(_fsheet, Rect2(x - float(p[4]), y - float(p[5]), p[2], p[3]), src)
