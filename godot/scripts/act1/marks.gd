## WHAT THE COMMON MONSTERS OF FLOORS 6 TO 8 LAY ON THE FLOOR AND SEND OVER IT: perils.gd's marks of kind "a1", each named as the
## game names it (`a1`: "qgolem:boulder"), stepped as its kind's rules step it (game/act1_rules/<kind>.ts `peril`; game/bosses.ts
## stepPerils: its clock run on first, gone at its `dur`) and drawn as render/act1_fx/<kind>.ts draws it, in the game's own
## pictures: films made by tools/godot_fx.ts with the art's own painters, the figures' own baked pictures of what they throw (the
## boulder rolling, the glob), and the two painters that aim any way brought over line for line (the boulder's lane and the
## chanter's lightning: art/action_f6_golem.ts lanePainted; art/action_f6_cult.ts chainBoltPainted, layChainBolt; art/
## action_f6_fx.ts boltWay, layBolt, layStrike, blob, pen), a frame of each painted as the game paints it. Called from perils.gd
## (its block at its foot): `step`, `stands`, `draw` (on the floor), `air` (over what stands), `spots` (their lights in the dark).
##   qgolem:quake    the floor its hammer's fists crack (drawn only).
##   qgolem:boulder  held up, then bowled down its lane: see qgolem.gd. `fx`, `fy` the lane's way, `d` its length; once it
##                   has smashed, `b`, `c` where, and `hit` when.
##   firepot:pot     the pot in flight, its burst, the floor burning: see firepot.gd. `a`, `b` where it left the sling, `c`
##                   its height there, `d` its arc.
##   chanter:chain   the ring where its lightning will strike, the lightning, the static: see chanter.gd. Once struck, `a`,
##                   `b` where its pages were, `c` their height; `d` 1 if it struck him.
##   chanter:ward    its ward under each of the cult it shields, while it lives and is awake.
##   vulture:line    the line it will stoop along, from its warning to its strike.
##   crawler:leap    the ring where its leap will come down; the scrape of the hero it drags.
##   devil:twister   the sand swirling in under its twister, and its lightning on the floor.
##   scorpion:glob   the glob in flight, its splash and the pool of acid: see scorpion.gd. `a`, `b` where it left the sting,
##                   `c` its height there, `d` its arc.
##   unfinished:*, queen:*  floors 6 and 7's bosses': unfinished_marks.gd, queen_marks.gd.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const FmPaint := preload("res://scripts/fm_paint.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const QG := preload("res://scripts/act1/qgolem.gd")
const FP := preload("res://scripts/act1/firepot.gd")
const CH := preload("res://scripts/act1/chanter.gd")
const DV := preload("res://scripts/act1/devil.gd")
const SC := preload("res://scripts/act1/scorpion.gd")
const VU := preload("res://scripts/act1/vulture.gd")
const CR := preload("res://scripts/act1/crawler.gd")
## (floors 9 and 10's, and floor 9's two side bosses': their own marks, act1/marks9.gd, each by its name)
const M9 := preload("res://scripts/act1/marks9.gd")
## (floor 10's boss, the Swamp Colossus: his whole fight drawn from one mark, "eye:fight": act1/colossus_draw.gd; its step colossus.gd)
const C10 := preload("res://scripts/act1/colossus_draw.gd")
const C10R := preload("res://scripts/act1/colossus.gd")

## (the enemy's pinks of the boulder's lane; the lightning's white heart, its pale violet, violet, deep violet, and the
## enemy's pink and rose about it: art/action_f6_fx.ts BOLT)
const LANE: Array[Color] = [Color("#ff7aa8"), Color("#e0287a"), Color("#7a1058")]
const BOLT := {"white": Color("#fff6ff"), "pale": Color("#e6c8ff"), "violet": Color("#b070ff"), "deep": Color("#6a2cc0"), "pink": Color("#ff4f8a"), "rose": Color("#ff7aa8")}


## (THE BOSSES OF FLOORS 6 TO 9: their marks are stepped and drawn by scripts of their own, by the first word of the mark's
## name: act1/unfinished_marks.gd, queen_marks.gd, cantor_marks.gd, stag_marks.gd)
const OWN := {"unfinished": preload("res://scripts/act1/unfinished_marks.gd"), "queen": preload("res://scripts/act1/queen_marks.gd"),
	"cantor": preload("res://scripts/act1/cantor_marks.gd"), "stag": preload("res://scripts/act1/stag_marks.gd"),
	# (THE CITY'S, floors 11 to 15: act2/marks11.gd and on)
	"scribe": preload("res://scripts/act2/marks11.gd"), "watch": preload("res://scripts/act2/marks11.gd"),
	"crier": preload("res://scripts/act2/crier_marks.gd"), "dredger": preload("res://scripts/act2/marks12.gd"),
	"ratking": preload("res://scripts/act2/rk_marks.gd"), "fieldhand": preload("res://scripts/act2/marks13.gd"),
	"carter": preload("res://scripts/act2/marks13.gd"), "scraper": preload("res://scripts/act2/pair_marks.gd"),
	"quill": preload("res://scripts/act2/pair_marks.gd"), "patient": preload("res://scripts/act2/marks14.gd"),
	"orderly": preload("res://scripts/act2/marks14.gd")}


static func _own(p: Dictionary):
	var n := str(p["a1"])
	var k := n.find(":")
	return OWN.get(n.substr(0, k)) if k > 0 else null


## One taken away before its time (the hero fallen and come back: perils.gd clear): what it did to the floor undone (a hurled
## block's tile floor again).
static func gone(P, p: Dictionary) -> void:
	if _own(p) != null:
		_own(p).gone(P, p)


## A step of one (its clock has run on already); false: it is gone.
static func step(P, p: Dictionary, _dt: float) -> bool:
	if C10.mine(p):
		return C10R.step_mark(P, p, _dt)
	if M9.mine(p):
		return M9.step(P, p, _dt)
	var own = _own(p)
	if own != null:
		return own.step(P, p, _dt)
	var hero = P.hero
	var h: Vector2 = hero.world
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var src = p.get("src")
	var here: bool = src != null and is_instance_valid(src) and not src.dead
	match str(p["a1"]):
		"qgolem:boulder":
			if t < 0.0:
				# (held up, not yet bowled: gone if the golem falls or is stopped first)
				if not here or src.state != "act":
					p["dur"] = t
			elif float(p["hit"]) >= 1e9:
				var f := Vector2(p["fx"], p["fy"])
				var rel := h - at
				var along := rel.dot(f)
				var across := -rel.x * f.y + rel.y * f.x
				var down := QG.down(t)
				var meets: bool = hero._act != "lunge" and absf(across) <= float(QG.BOULDER["half"]) and absf(along - down) <= QG.BOULDER_R + 0.3
				if meets or down >= float(p["d"]):
					# (it smashes: on him, or at its lane's end)
					var spot := at + f * minf(down, float(p["d"]))
					p["b"] = spot.x
					p["c"] = spot.y
					p["hit"] = t
					p["dur"] = t + float(QG.BOULDER["rubble"])
					if meets or h.distance_to(spot) <= float(QG.BOULDER["r"]):
						p["done"] = 1
						P._hurt(p, p["dmg"], spot)
						if hero._act != "lunge" and hero._invuln <= 0.0:
							A1.knock(hero, spot, 0.8)
					hero.kick(5.0)
					P.sfx.play("slam", linear_to_db(0.9))
		"firepot:pot":
			if t >= float(p["hit"]):
				if int(p["done"]) == 0:
					# (it comes down, and bursts in the cult's fire)
					p["done"] = 1
					if h.distance_to(at) <= float(FP.BURST["r"]):
						P._hurt(p, p["dmg"], at, "fire")
					hero.kick(1.0)
					P.sfx.play("fire", linear_to_db(0.7))
				else:
					# (and the floor burns: whoever stands in it is burned, tick by tick)
					var next := float(p["hit"]) + float(FP.BURST["long"]) + float(FP.FIRE["tick"]) * (int(p["done"]) - 1)
					if t >= next and t < float(p["dur"]) - float(FP.FIRE["fade"]):
						p["done"] = int(p["done"]) + 1
						if h.distance_to(at) <= float(FP.FIRE["r"]) + A1.HERO_R * 0.5:
							P._hurt(p, float(p["dmg"]) * float(FP.FIRE["dmg"]), at, "fire")
		"chanter:chain":
			if int(p["done"]) == 0:
				if t < 0.0:
					# (aimed, not yet struck: gone if the chanter falls or is stopped first)
					if not here or src.state != "act":
						p["dur"] = t
				else:
					p["done"] = 1
					var pages := Vector3(at.x, at.y, 16.0)
					if src != null and is_instance_valid(src):
						pages = src.h2.pages(src)
					p["a"] = pages.x
					p["b"] = pages.y
					p["c"] = pages.z
					if h.distance_to(at) <= float(CH.CHAIN["r"]) and A1.open_to(hero):
						P._hurt(p, p["dmg"], at, "lightning")
						p["d"] = 1
					P.sfx.play("thunder", linear_to_db(0.5))
					hero.kick(1.5)
		"chanter:ward":
			if not here or src.state == "sleep":
				return false
		"vulture:line":
			if not here or src.state != "act" or src.h2.act == null or float(src.h2.act["t"]) >= float(VU.DIVE["hit"]):
				return false
		"crawler:leap", "devil:twister":
			var want := "crawler:leap" if p["a1"] == "crawler:leap" else "devil:twister"
			if not here or src.state != "act" or src.h2.act == null or src.h2.acts()[src.h2.act["i"]]["id"] != want:
				return false
		"scorpion:glob":
			if t >= float(p["hit"]):
				var near := h.distance_to(at)
				if int(p["done"]) == 0:
					# (it splashes: struck and poisoned within its splash; the pool spreads)
					p["done"] = 1
					if near <= float(SC.SPIT["splash"]) and hero._act != "lunge":
						var before: float = hero.life
						P._hurt(p, p["dmg"], at)
						if src != null and is_instance_valid(src):
							SC.poison(src, hero, before - hero.life, SC.POISON_SHARE)
					P.sfx.play("fire", linear_to_db(0.4))
				else:
					# (the pool burns whoever stands in it, tick by tick, until it shrinks away)
					var next := float(p["hit"]) + float(SC.POOL["tick"]) * int(p["done"])
					if t >= next and t < float(p["dur"]) - float(SC.SPIT["fade"]):
						p["done"] = int(p["done"]) + 1
						if near <= float(SC.SPIT["pool"]):
							P._hurt(p, float(p["dmg"]) * float(SC.POOL["share"]), at)
	return float(p["t"]) < float(p["dur"])


# --- among the figures ---

## What of one stands among the figures (in its own depth), each frame it is there.
static func stands(P, p: Dictionary) -> void:
	if C10.mine(p):
		return
	if M9.mine(p):
		M9.stands(P, p)
		return
	var own = _own(p)
	if own != null:
		own.stands(P, p)
		return
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	match str(p["a1"]):
		"qgolem:quake":
			if P.has_film("qg_quake"):
				P._film_stands(p, "qg_quake", t, at)
		"qgolem:boulder":
			if float(p["hit"]) < 1e9:
				_hide(p, "fx_stand")
				if P.has_film("qg_smash"):
					P._film_stands(p, "qg_smash", t - float(p["hit"]), Vector2(p["b"], p["c"]))
			elif t >= 0.0:
				# (rolling down its lane, hopping; seen from behind when it rolls up the screen, turned over when it rolls to the left)
				var down := QG.down(t)
				var f := Vector2(p["fx"], p["fy"])
				var fig = p["fig"]
				var n: int = fig.count(0, "rolling") if fig != null and fig.has("rolling") else 0
				if n > 0:
					_fig(P, p, "fx_stand", fig, "rolling", floori(t / QG.ROLL_ROUND * n) % n, at + f * down, QG.hop(down - float(QG.BOULDER["from"])), f)
		"firepot:pot":
			if t < float(p["hit"]):
				if P.has_film("fp_pot_front"):
					# (in flight, tumbling; from behind when it flies away up the screen, turned over when it flies to the left)
					var w := FP.pot_at(p)
					var f := Vector2(p["fx"], p["fy"])
					var pi: int = P._still("fp_pot_back" if f.x + f.y < -0.2 else "fp_pot_front", "stand", floori(t * 8.0 * FP.SPIN))
					P._film_one(p, "fx_stand", pi, Vector2(w.x, w.y), w.x + w.y, f.x - f.y < 0.0, w.z)
			else:
				_hide(p, "fx_stand")
				if P.has_film("fp_blaze"):
					P._film_stands(p, "fp_blaze", t - float(p["hit"]), at)
		"scorpion:glob":
			if t < float(p["hit"]):
				var w := SC.glob_at(p)
				var fig = p["fig"]
				if fig != null and fig.has("glob"):
					var n: int = fig.count(0, "glob")
					_fig(P, p, "fx_air", fig, "glob", floori(t * 18.0) % n, Vector2(w.x, w.y), w.z, Vector2(0.7071, 0.7071))
			else:
				_hide(p, "fx_air")
				if P.has_film("sc_pool"):
					P._film_stands(p, "sc_pool", t - float(p["hit"]), at)


## One of a figure's own baked pictures (the boulder rolling, the glob) standing among the figures for a mark, kept with it under
## `key` and gone with it: list `list`'s `i`th, seen as one facing `way` is, `high` game pixels over `at`.
static func _fig(P, p: Dictionary, key: String, fig, list: String, i: int, at: Vector2, high: float, way: Vector2) -> void:
	if P.stands == null:
		return
	var s = p.get(key)
	if s == null or not is_instance_valid(s):
		s = Sprite2D.new()
		s.centered = false
		P.stands.add_child(s)
		p[key] = s
	var f: Dictionary = fig.frame(way.x, way.y, list, i)
	s.visible = true
	s.texture = f["tex"]
	s.flip_h = f["flip"]
	s.scale = Vector2.ONE * float(f["scale"])
	s.position = Iso.to_screen(at.x, at.y)
	s.offset = f["offset"] - Vector2(0.0, 2.0 * high / float(f["scale"]))


static func _hide(p: Dictionary, key: String) -> void:
	var s = p.get(key)
	if s != null and is_instance_valid(s):
		s.visible = false


# --- on the floor (in perils.gd _draw) ---

static func draw(P, p: Dictionary) -> void:
	if C10.mine(p):
		C10.draw(P, p)
		return
	if M9.mine(p):
		M9.draw(P, p)
		return
	var own = _own(p)
	if own != null:
		own.draw(P, p)
		return
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var src = p.get("src")
	match str(p["a1"]):
		"qgolem:quake":
			if P.has_film("qg_quake"):
				P._film_floor("qg_quake", t, at)
		"qgolem:boulder":
			if float(p["hit"]) < 1e9:
				if P.has_film("qg_smash"):
					P._film_floor("qg_smash", t - float(p["hit"]), Vector2(p["b"], p["c"]))
				return
			# (its lane, laid out from the golem as it is marked, broken up behind the boulder)
			var lead := QG.ROLL_HIT - float(QG.BOULDER["aim"])
			var k := minf(1.0, (t + lead) / 0.3)
			_dots(P, at, _lane(Vector2(p["fx"], p["fy"]), k, QG.down(t) if t > 0.0 else 0.0, p["d"], QG.BOULDER["half"]))
		"firepot:pot":
			if t < float(p["hit"]):
				# (the reach of its burst marked where it will come down, filling as it comes; its shadow under it)
				var k := A1.clamp01(t / float(p["hit"]))
				if P.has_film("fp_mark"):
					P._film_pic(P, "fp_mark", "floor", floori(k * 24.0), Iso.to_screen(at.x, at.y))
					var w := FP.pot_at(p)
					P._film_pic(P, "fp_shadow", "floor", roundi(k * 24.0), Iso.to_screen(w.x, w.y))
			elif P.has_film("fp_blaze"):
				P._film_floor("fp_blaze", t - float(p["hit"]), at)
		"chanter:chain":
			if t <= 0.6 and P.has_film("ch_ring"):
				P._film_floor("ch_ring", t, at)
		"chanter:ward":
			if not P.has_film("ch_ward") or src == null or not is_instance_valid(src):
				return
			# (at the feet of each it shields; drawn once under each, however many chanters shield it)
			var i := floori(P._clock * 8.0) % 4
			for o in src.mgr.list:
				if is_instance_valid(o) and o.seen and _ward_on(src, o) and _first_ward(src, o):
					P._film_pic(P, "ch_ward", "floor", i, Iso.to_screen(o.world.x, o.world.y))
		"vulture:line":
			if src != null and is_instance_valid(src) and src.h2.act != null:
				var a: Dictionary = src.h2.act
				# (from as it climbs to the strike: brighter through its warning's hold, gold as it stoops)
				var k := A1.clamp01((float(a["t"]) - 0.05) / (float(VU.DIVE["stoop"]) - 0.05))
				P._aim_line(Vector2(src.h2.a1["sx"], src.h2.a1["sy"]), Vector2(a["x"], a["y"]), k, P._clock)
		"crawler:leap":
			if src != null and is_instance_valid(src) and src.h2.act != null:
				var a: Dictionary = src.h2.act
				if float(a["t"]) < float(CR.LEAP["hit"]):
					var q := A1.beside(src.world, src.face, a["hand"], CR.LEAP["at"], 0.0)
					P._sweep_ring(q.x, q.y, CR.LEAP["r"], float(a["t"]) / float(CR.LEAP["hit"]), P._clock)
				if int(src.h2.a1.get("grab", 0)) != 0:
					P._scrape(P.hero.world, Vector2(src.h2.a1["ox"], src.h2.a1["oy"]), 1.0)
		"devil:twister":
			if src != null and is_instance_valid(src) and src.h2.act != null and P.has_film("dv_swirl"):
				P._film_floor("dv_swirl", src.h2.act["t"], src.world)
		"scorpion:glob":
			if P.has_film("sc_pool"):
				P._film_floor("sc_pool", t - float(p["hit"]), at)
				if t < float(p["hit"]):
					var w := SC.glob_at(p)
					P._film_pic(P, "sc_shadow", "floor", roundi(minf(1.0, t / float(p["hit"])) * 20.0), Iso.to_screen(w.x, w.y))


## (chanter.ts wardOf) Whether chanter `by`'s ward is on `o` now.
static func _ward_on(by, o) -> bool:
	if by.dead or by == o or by.state == "sleep" or o.dead or not A1.WARD["kinds"].has(o.kind):
		return false
	return o.world.distance_to(by.world) <= float(A1.WARD["r"])


## (render/act1_fx/chanter.ts firstWard) Whether `m` is the first in the floor's list of those whose ward is on `o`.
static func _first_ward(m, o) -> bool:
	for q in m.mgr.list:
		if is_instance_valid(q) and q.kind == "chanter" and _ward_on(q, o):
			return q == m
	return false


# --- over what stands (in perils.gd _draw_air) ---

static func air(P, c: CanvasItem, p: Dictionary) -> void:
	if C10.mine(p):
		C10.air(P, c, p)
		return
	if M9.mine(p):
		M9.air(P, c, p)
		return
	if _own(p) != null:
		_own(p).air(P, c, p)
		return
	if p["a1"] != "chanter:chain" or int(p["done"]) == 0:
		return
	var t: float = p["t"]
	# (the lightning from its pages to the ring; the static round him if it struck him)
	if t <= float(CH.CHAIN["seen"]) + 0.3:
		var from := Vector2(p["a"], p["b"])
		var d := Vector2(p["x"], p["y"]) - from
		var seed := floori(float(p["a"]) * 7.0 + float(p["b"]) * 13.0)
		var px := {}
		var e := _tile(d)
		_chain_bolt(px, 0.0, -float(p["c"]) * 2.0, e.x, e.y, t, seed)
		_dots(P, from, px, c)
	if int(p["d"]) == 1 and t < float(CH.CHAIN["crackle"]) and P.has_film("ch_static"):
		var h: Vector2 = P.hero.world
		P._film_pic(c, "ch_static", "air", P._film_frame("ch_static", t), Iso.to_screen(h.x, h.y))


# --- over the dark (perils.gd _draw_glow): floors 9 and 10's alone have any ---

static func glow(P, c: CanvasItem, p: Dictionary) -> void:
	if M9.mine(p):
		M9.glow(P, c, p)


# --- their lights in the dark (the game's c.spot; perils.gd _spots_of) ---

static func spots(P, p: Dictionary) -> void:
	if C10.mine(p):
		C10.spots(P, p)
		return
	if M9.mine(p):
		M9.spots(P, p)
		return
	if _own(p) != null:
		_own(p).spots(P, p)
		return
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	match str(p["a1"]):
		"firepot:pot":
			if t < float(p["hit"]):
				var w := FP.pot_at(p)
				P.look.spot(P._px(Vector2(w.x, w.y)) + Vector2(0, -w.z), 12.0, 0.5)
			else:
				var since := t - float(p["hit"])
				P.look.spot(P._px(at) + Vector2(0, -4), 40.0, 0.6)
				if since <= float(FP.BURST["long"]):
					P.look.spot(P._px(at) + Vector2(0, -20), 70.0, 0.8 * (1.0 - since / float(FP.BURST["long"])))
		"chanter:chain":
			if t < 0.0:
				P.look.spot(P._px(at), 30.0, 0.3)
			elif int(p["done"]) != 0:
				if t <= float(CH.CHAIN["seen"]) + 0.3:
					P.look.spot(P._px(Vector2(p["a"], p["b"])) + Vector2(0, -float(p["c"])), 50.0, 0.6)
				if int(p["d"]) == 1 and t < float(CH.CHAIN["crackle"]):
					P.look.spot(P._px(P.hero.world) + Vector2(0, -14), 24.0, 0.5 * (1.0 - t / float(CH.CHAIN["crackle"])))


# --- the painters that aim any way, brought over (their pixels: {Vector2i: Color}, picture pixels from a floor point) ---

## Their pixels drawn, from the floor point `at` (on the floor under the figures, or on `c`).
static func _dots(P, at: Vector2, px: Dictionary, c: CanvasItem = null) -> void:
	var on: CanvasItem = c if c != null else P
	var base := Iso.to_screen(at.x, at.y).round()
	for q in px:
		on.draw_rect(Rect2(base.x + q.x, base.y + q.y, 1.0, 1.0), px[q])


## (JS Math.round: halves up)
static func _rnd(v: float) -> int:
	return floori(v + 0.5)


## tileAt(0, 0, ...): where a floor point `v` tiles from the anchor is, picture pixels (action_f1_fx.ts floorPx).
static func _tile(v: Vector2) -> Vector2:
	return Vector2(32.0 * (v.x - v.y), 16.0 * (v.x + v.y))


## pen: a whole pixel laid where asked; `under`: only where nothing is.
static func _pen(px: Dictionary, x: float, y: float, c: Color, under := false) -> void:
	var k := Vector2i(_rnd(x), _rnd(y))
	if under and px.has(k):
		return
	px[k] = c


## lanePainted: THE LANE from the golem's front down the way `d` (a unit way), `k` of its length laid out as it is marked,
## broken up where the boulder has been (`gone`), `long` tiles, `half` its half width: its edges dashed in the enemy's pink, its
## chevrons pointing down it every tile.
static func _lane(d: Vector2, k: float, gone: float, long: float, half: float) -> Dictionary:
	var px := {}
	var nrm := Vector2(-d.y, d.x)
	var start := 0.8
	var up_to := start + (long - start) * A1.clamp01(k)
	var a := start
	while a <= up_to:
		var passed := a < gone
		var i := _rnd(a / 0.06)
		if i % 5 < 3 and not (passed and i % 2 == 1):
			for sd in [1.0, -1.0]:
				var q := _tile(d * a + nrm * (sd * half))
				_pen(px, q.x, q.y, LANE[0], true)
				_pen(px, q.x + 1.0, q.y, LANE[1], true)
				_pen(px, q.x, q.y + 1.0, LANE[1], true)
				_pen(px, q.x + 1.0, q.y + 1.0, LANE[2], true)
		a += 0.06
	a = start + 0.6
	while a <= up_to - 0.2:
		if a >= gone:
			var s := -1.0
			while s <= 1.0:
				var q := _tile(d * (a - absf(s) * 0.35) + nrm * (s * half * 0.6))
				_pen(px, q.x, q.y, LANE[0], true)
				_pen(px, q.x + 1.0, q.y, LANE[1], true)
				_pen(px, q.x, q.y + 1.0, LANE[1], true)
				s += 0.08
		a += 1.0
	return px


## layChainBolt: the chanter's lightning from (x0, y0) to (x1, y1), `t` seconds after it struck: crackling a new way each frame,
## fading by CHAIN.seen; where it strikes, a flash and sparks.
static func _chain_bolt(px: Dictionary, x0: float, y0: float, x1: float, y1: float, t: float, seed: int) -> void:
	var seen: float = CH.CHAIN["seen"]
	if t < 0.0 or t > seen + 0.3:
		return
	var flick := floori(t * 30.0 + 1e-6) + seed * 13
	var k := 1.0 - A1.clamp01(t / seen)
	if t <= seen:
		_bolt(px, x0, y0, x1, y1, seed, flick, maxf(0.35, k), 2, 3)
	_strike(px, x1, y1, t, 977 + seed)


## boltWay: its jagged way, its kinks thrown out to either side, new every `flick`, the middle kinks furthest out.
static func _way(x0: float, y0: float, x1: float, y1: float, seed: int, flick: int, jag := 0.22) -> Array:
	var L := Vector2(x1 - x0, y1 - y0).length()
	var n := maxi(3, _rnd(L / 7.0))
	var div := L if L != 0.0 else 1.0
	var nx := -(y1 - y0) / div
	var ny := (x1 - x0) / div
	var out := []
	for i in n + 1:
		var u := float(i) / n
		var off := 0.0 if i == 0 or i == n else (FmPaint.hash3(i, flick * 7 + seed, 913) - 0.5) * 2.0 * jag * minf(L, 90.0) * pow(sin(PI * u), 0.6)
		out.append(Vector2(x0 + (x1 - x0) * u + nx * off, y0 + (y1 - y0) * u + ny * off))
	return out


## layBolt: its way, its heart white (`thick` 2: two pixels), pale violet beside it, violet and deep violet outside that, flecks
## of the enemy's pink thrown off its kinks, a branch or two forking off it; `k` how strong it is (fading, it thins and breaks).
static func _bolt(px: Dictionary, x0: float, y0: float, x1: float, y1: float, seed: int, flick: int, k := 1.0, thick := 2, branches := 2) -> void:
	var way := _way(x0, y0, x1, y1, seed, flick)
	_line(px, way, thick, k, seed, flick)
	# (forks off its kinks, short, thinner, crooked)
	for b in branches:
		var i := 1 + floori(FmPaint.hash3(b, flick + seed, 917) * (way.size() - 2))
		var bp: Vector2 = way[i]
		var L := Vector2(x1 - x0, y1 - y0).length()
		var ang := atan2(y1 - y0, x1 - x0) + (1.0 if FmPaint.hash3(b, flick + seed, 919) < 0.5 else -1.0) * (0.5 + 0.6 * FmPaint.hash3(b, flick + seed, 921))
		var long := minf(40.0, 10.0 + L * 0.25 * FmPaint.hash3(b, flick + seed, 923))
		_line(px, _way(bp.x, bp.y, bp.x + cos(ang) * long, bp.y + sin(ang) * long, seed + 5 + b, flick, 0.35), 1, k * 0.85, seed + 31, flick)
	# (sparks of the enemy's pink thrown off its kinks)
	for i in range(1, way.size() - 1):
		if FmPaint.hash3(i, flick + seed, 927) > 0.45 * k:
			continue
		var q: Vector2 = way[i]
		var a := FmPaint.hash3(i, flick + seed, 929) * TAU
		var r := 2.0 + 4.0 * FmPaint.hash3(i, flick + seed, 931)
		_pen(px, q.x + cos(a) * r, q.y + sin(a) * r, BOLT["pink"] if i % 2 == 1 else BOLT["rose"])


static func _line(px: Dictionary, pts: Array, heart: int, strength: float, s2: int, flick: int) -> void:
	for i in range(1, pts.size()):
		var a: Vector2 = pts[i - 1]
		var b: Vector2 = pts[i]
		var n := maxi(1, ceili(a.distance_to(b)))
		for j in n + 1:
			var x := a.x + (b.x - a.x) * j / n
			var y := a.y + (b.y - a.y) * j / n
			# (fading: broken up)
			if strength < 0.95 and FmPaint.hash3(_rnd(x), _rnd(y), s2 + flick) > strength + 0.1:
				continue
			for dy in range(-2, 3):
				for dx in range(-2, 3):
					var r := maxi(absi(dx), absi(dy))
					if r == 0 or (heart >= 2 and r == 1 and dx >= 0 and dy >= 0):
						_pen(px, x + dx, y + dy, BOLT["white"])
					elif r == 1:
						_pen(px, x + dx, y + dy, BOLT["pale"] if strength > 0.5 else BOLT["violet"], true)
					elif heart >= 2 and FmPaint.hash3(_rnd(x) + dx, _rnd(y) + dy, s2) < 0.55:
						_pen(px, x + dx, y + dy, BOLT["violet"] if strength > 0.6 else BOLT["deep"], true)


## layStrike: where a bolt strikes the floor, `t` seconds after: a flash, a star of white and violet, sparks of the enemy's
## pink flung out (gone by 0.3 s).
static func _strike(px: Dictionary, x: float, y: float, t: float, seed: int, big := 1.0) -> void:
	if t < 0.0 or t > 0.3:
		return
	var k := 1.0 - t / 0.3
	if t < 0.1:
		_blob(px, x, y, (3.0 + 3.0 * k) * big, BOLT["white"])
		_blob(px, x, y, (6.0 + 4.0 * k) * big, BOLT["pale"], 0.4, seed, true)
		for q in [Vector2(1, 0), Vector2(-1, 0), Vector2(0, -1), Vector2(0.7, -0.6), Vector2(-0.7, -0.6), Vector2(0.8, 0.4), Vector2(-0.8, 0.4)]:
			var s := 0
			while s < (10.0 + 12.0 * k) * big:
				_pen(px, x + q.x * s, y + q.y * s * 0.7, BOLT["white"] if s < 6.0 * big else (BOLT["violet"] if s < 12.0 * big else BOLT["pink"]))
				s += 1
	for i in 14:
		var a := FmPaint.hash3(i, 1, seed) * TAU
		var r := (6.0 + 18.0 * FmPaint.hash3(i, 2, seed)) * sqrt(t / 0.3) * big
		var up := 10.0 * sin(PI * A1.clamp01(t / 0.3)) * FmPaint.hash3(i, 3, seed)
		if FmPaint.hash3(i, 4, seed) < t / 0.3:
			continue
		_pen(px, x + cos(a) * r, y + sin(a) * r * 0.5 - up, BOLT["pink"] if i % 3 != 0 else BOLT["pale"])


## blob: a round speck `r` across, thinned by `thin`.
static func _blob(px: Dictionary, x: float, y: float, r: float, c: Color, thin := 0.0, seed := 0, under := false) -> void:
	for j in range(-ceili(r), ceili(r) + 1):
		for i in range(-ceili(r), ceili(r) + 1):
			if i * i + j * j > r * r + 0.3:
				continue
			if thin > 0.0 and FmPaint.hash3(_rnd(x) + i, _rnd(y) + j, seed) < thin:
				continue
			_pen(px, x + i, y + j, c, under)
