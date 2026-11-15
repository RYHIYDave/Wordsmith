## FLOORS 6 TO 10'S WORDS AT WORK, AS THE FIGHT SHOWS THEM: fx.gd hands on to this where the game's effects draw them.
##   From render/fx.ts (its makers and its `handle`):
##   TWIN, the mirror's teal: a phantom of the hero beside him makes the second cut or brings down the second blast; "of Echoes",
##     a phantom stays where he stood, a ring closes on it, and then it acts (`echo`), letting go in a flash (fx.gd _cast).
##   LEECH, blood: red flies off the blade and the hit; red wisps of life curve from every enemy struck into him, and the life
##     comes as one number now and then (`siphon`, `wisps`, `heal_sum`); "of Leeching", what it strikes is marked for the
##     harvest (`mark`), and a kill's life orb is torn out in a red column (`orb`).
##   VOLATILE, violet: the air pops with sparks that will not hold still (`crackle`); over an area violet arcs jump about in it
##     (`unstable`); on one target it pops (`pop`); what it kills goes off in a violet blast (`ruin`); "of Ruin", the rune is
##     written on the floor (`draw_patch` 'rune': render.ts), beats faster and whiter as its time runs out, and goes off in a
##     violet blast with a column of light (`beams`).
##   From render/words3.ts (events3, tick3, floor3, air3):
##   PRECISE: a needle of white light through the point, a small star with long thin rays where it struck (`pins`); "of the Mark",
##     a sight closes on the enemy it marks and snaps shut as the certain critical bursts (`sights`).
##   FRENZIED: a ring beats out from his feet with each stack and sparks are thrown back off them; the ring of five at his feet
##     lights one more (`frenzy`, drawn on the floor); "of Frenzy", a spark of it leaps from the fallen to him (`flights`).
##   GUARDING: his shield, a shell of the word's emerald round him, lit from the upper left, flaring on the side a blow strikes
##     (`guard`); "of Warding", the ward circle on the floor with a shield at each quarter, motes rising in it (`draw_patch`
##     'ward', and its motes in the air).
## What the frenzy and the shield are is read off the hero each frame (hero.gd frenzy, frenzy_t, shield_t), as events3 does.
## (LASTING's, FLEETING's and VAST's own looks, render/words10.ts, are fx_words10.gd's.)
## LEFT OUT: the frenzy's copies of the hero (render.ts heroCopies3); the sound each makes.
extends RefCounted

const L := preload("res://scripts/fx_looks.gd")
const Words := preload("res://scripts/words.gd")

var fx
## Life drawn to the hero (fx.ts Wisp): {sx, sy, t, dur, bend, lift}; columns of light (Beam): {x, y, w, t, dur, colors}.
var wisps: Array = []
var beams: Array = []
## Life leeched, shown as one number every so often (fx.ts healSum, healWait); and when he last pulsed with it.
var heal_sum := 0.0
var heal_wait := 0.0
var pulse_wait := 0.0
## Precise's pins (words3.ts Pin): {x, y, dx, dy, t, dur, crit}; its sights, by the marked monster's instance id: {m, aim,
## aim0, shut}; Frenzied's sparks flying to him (Flight): {x0, y0, t, dur, bend}.
var pins: Array = []
var sights := {}
var flights: Array = []
## (W3.frenzy, W3.guard: the hero's frenzy and his shield as they are drawn)
var frenzy := {"n": 0, "t": 0.0, "since": 9.0}
var guard := {"t": 0.0, "dur": 0.0, "struck": 9.0, "fx": 0.0, "fy": 0.0}

static var RAMP := {}
static var GLYPH: Array = []
static var WARD_DARK := Color.BLACK
static var SIGHT_DARK := Color.BLACK


static func ready_up() -> void:
	if not RAMP.is_empty():
		return
	var looks: Dictionary = Words.data()["looks"]
	for w in looks["ramp"]:
		var cs := PackedColorArray()
		for h in looks["ramp"][w]:
			cs.append(Color(h))
		RAMP[w] = cs
	GLYPH = looks["guardGlyph"]
	WARD_DARK = Color(looks["wardDark"])
	SIGHT_DARK = Color(looks["sightDark"])


func _init() -> void:
	ready_up()


func clear() -> void:
	wisps = []
	beams = []
	heal_sum = 0.0
	pins = []
	sights = {}
	flights = []
	frenzy = {"n": 0, "t": 0.0, "since": 9.0}
	guard = {"t": 0.0, "dur": 0.0, "struck": 9.0, "fx": 0.0, "fy": 0.0}


func alive() -> bool:
	return not (wisps.is_empty() and beams.is_empty() and pins.is_empty() and sights.is_empty() and flights.is_empty()) or int(frenzy["n"]) > 0 or float(guard["t"]) > 0.0


static func _c(cs: PackedColorArray, picks: Array) -> PackedColorArray:
	var out := PackedColorArray()
	for k in picks:
		out.append(cs[k])
	return out


# --- VOLATILE (fx.ts crackle, unstable, pop, ruin) ---

## The air pops with violet sparks that will not hold still.
func crackle(x: float, y: float, r: float, n: int) -> void:
	for i in n:
		var a := randf() * TAU
		var d := sqrt(randf()) * r
		var px := x + cos(a) * d
		var py := y + sin(a) * d
		fx.add(px, py, L.rnd(6, 16), L.rnd(-1.5, 1.5), L.rnd(-1.5, 1.5), L.rnd(-10, 30), L.rnd(0.14, 0.32), L.P["pu5"], 3.0, 0.0, L.VIOLET)
		fx.streaks(px, py, 3, L.VIOLET, 4.5, 3.0, {"life": 0.16, "z": 10.0})


## Volatile over an area: violet arcs jump about inside it, it pops all over, and goes on popping a moment after.
func unstable(x: float, y: float, r: float) -> void:
	var arcs := mini(7, int(floorf(3.0 + r * 1.5 + 0.5)))
	for i in arcs:
		var a := randf() * TAU
		var b := a + L.rnd(1.6, 3.4)
		fx.ground_bolt(x + cos(a) * r * L.rnd(0.3, 0.95), y + sin(a) * r * L.rnd(0.3, 0.95), x + cos(b) * r * L.rnd(0.3, 0.95), y + sin(b) * r * L.rnd(0.3, 0.95), L.VIOLET)
	crackle(x, y, r * 0.9, mini(9, int(floorf(3.0 + r * 2.0 + 0.5))))
	for k in range(1, 4):
		fx.after(0.09 * k + L.rnd(0, 0.05), func() -> void:
			var a := randf() * TAU
			var d := sqrt(randf()) * r * 0.9
			crackle(x + cos(a) * d, y + sin(a) * d, 0.25, 2)
			fx.flash(x + cos(a) * d, y + sin(a) * d, 8.0, 0.22, 0.07, L.VIOLET))


## Volatile on one target: it pops violet, a little arc jumps off it, and it pops again a moment later.
func pop(x: float, y: float) -> void:
	fx.flash(x, y, 12.0, 0.34, 0.08, L.VIOLET)
	crackle(x, y, 0.4, 3)
	var a := randf() * TAU
	fx.ground_bolt(x, y, x + cos(a) * 0.9, y + sin(a) * 0.9, L.VIOLET)
	fx.after(L.rnd(0.1, 0.16), func() -> void:
		var b := randf() * TAU
		crackle(x + cos(b) * 0.3, y + sin(b) * 0.3, 0.25, 2)
		fx.flash(x + cos(b) * 0.3, y + sin(b) * 0.3, 10.0, 0.2, 0.07, L.VIOLET))


## Something Volatile goes off: a violet blast with debris. `big`: a rune; otherwise a monster bursting.
func ruin(x: float, y: float, r: float, big: bool) -> void:
	fx.flash(x, y, 8.0, minf(1.7, r * (0.6 if big else 0.45)), 0.13, L.VIOLET)
	fx.ring(x, y, r * 1.08, 0.3, L.VIOLET, false, {"heavy": big, "delay": 0.05})
	for i in (26 if big else 14):
		var a := randf() * TAU
		var s := L.rnd(1.5, 6.0 if big else 4.5)
		fx.add(x + cos(a) * 0.2, y + sin(a) * 0.2, L.rnd(2, 10), cos(a) * s, sin(a) * s, L.rnd(60, 190 if big else 140), L.rnd(0.35, 0.75), L.P["pu4"], 3.0 if randf() < 0.4 else 2.0, 420.0, L.VIOLET)
	crackle(x, y, r * 0.8, 7 if big else 4)
	if big:
		beams.append({"x": x, "y": y, "w": 9.0, "t": 0.0, "dur": 0.2, "colors": L.VIOLET})
	fx.kick(4.0 if big else 2.4)
	fx.glow(x, y, 34.0 + r * 20.0, 0.25)


# --- LEECH (fx.ts siphon, and its tellings) ---

## Life drawn out of (x, y): red wisps that curve their way to the hero.
func siphon(x: float, y: float, n: int) -> void:
	if wisps.size() > 40:
		return
	for i in n:
		wisps.append({"sx": x + L.rnd(-0.2, 0.2), "sy": y + L.rnd(-0.2, 0.2), "t": -i * 0.04, "dur": L.rnd(0.34, 0.5), "bend": L.rnd(0.5, 1.3) * (1.0 if i % 2 == 0 else -1.0), "lift": L.rnd(8, 20)})
	fx.flash(x, y, 12.0, 0.3, 0.1, PackedColorArray([L.P["bl5"], L.P["bl4"], L.P["bl3"]]))
	fx.streaks(x, y, 4, L.BLOOD, 2.2, 2.0, {"up": 50.0, "grav": 260.0, "life": 0.3, "z": 12.0})


# --- the tellings (fx.ts handle; words3.ts events3) ---

## A telling of these words' own: true if it was one.
func handle(e: Dictionary) -> bool:
	var P: Dictionary = L.P
	match str(e.get("t", "")):
		"echo":
			# Twin behind: a phantom stays where the hero stood, a ring closes on it, and then it acts (a step to one side, so it
			# shows even if he has not moved)
			var gx: float = float(e["x"]) + float(e["dy"]) * 0.85
			var gy: float = float(e["y"]) - float(e["dx"]) * 0.85
			var delay: float = e.get("delay", 0.8)
			fx.figures.phantom(gx, gy, e["dx"], e["dy"], P["tl4"], delay + 0.25, 0.04, 0.75)
			fx.ring(gx, gy, 1.2, delay, PackedColorArray([P["tl3"], P["tl4"], P["tl5"], P["white"]]), false, {"closing": true, "heavy": true})
			fx.spray(gx, gy, 8, L.MIRROR, 1.6, 60.0, 6.0)
			fx.after(delay, func() -> void: fx.flash(gx, gy, 14.0, 0.5, 0.12, L.MIRROR))
		"mark":
			# "of Leeching" on something still alive: it is marked for the harvest
			fx.ring(e["x"], e["y"], 0.6, 0.24, L.BLOOD, false, {"closing": true})
			fx.streaks(e["x"], e["y"], 3, L.BLOOD, 1.2, 2.0, {"up": 80.0, "grav": 300.0, "life": 0.4, "z": 14.0})
			fx.flash(e["x"], e["y"], 22.0, 0.16, 0.12, PackedColorArray([P["white"], P["bl5"], P["bl4"]]))
		"leech":
			siphon(e["x"], e["y"], maxi(3, mini(6, int(floorf(2.0 + float(e.get("n", 1.0)) / 2.0 + 0.5)))))
			heal_sum += float(e.get("n", 0.0))
		"orb":
			# the life is torn out of it: a red column, and the orb is left
			for i in 12:
				fx.add(float(e["x"]) + L.rnd(-0.15, 0.15), float(e["y"]) + L.rnd(-0.15, 0.15), L.rnd(4, 14), L.rnd(-0.3, 0.3), L.rnd(-0.3, 0.3), L.rnd(70, 150), L.rnd(0.3, 0.5), L.pick(L.BLOOD), 2.0 if i % 3 == 0 else 1.0, 120.0)
			fx.ring(e["x"], e["y"], 0.8, 0.3, L.BLOOD, false, {"closing": true})
			fx.flash(e["x"], e["y"], 10.0, 0.35, 0.1, PackedColorArray([P["white"], P["bl5"], P["bl4"]]))
		"markOn":
			var m = fx._monster_of(e)
			if m != null:
				sights[m.get_instance_id()] = {"m": m, "aim": float(e.get("secs", 5.0)), "aim0": 0.0, "shut": 0.0}
		"markSpent":
			_spent = Vector2(e["x"], e["y"])
			_spent_frame = Engine.get_process_frames()
			var m = fx._monster_of(e)
			if m != null:
				_precise_crit(m, float(e.get("dx", 1.0)), float(e.get("dy", 0.0)))
		"frenzy":
			_frenzy_hit(e["x"], e["y"], e["dx"], e["dy"])
		"frenzyFed":
			flights.append({"x0": e["x"], "y0": e["y"], "t": 0.0, "dur": 0.38, "bend": -0.8 if randf() < 0.5 else 0.8})
		"shield":
			# GUARDING, on use: a brief shield on him; it snaps on with a ring at his feet
			var C: PackedColorArray = RAMP["guarding"]
			guard["t"] = float(e.get("secs", 2.2))
			guard["dur"] = guard["t"]
			fx.ring(e["x"], e["y"], 0.8, 0.22, _c(C, [5, 4, 3]), false, {"heavy": true})
		"guarded", "blocked":
			# a blow turned by the shield, or softened by a ward: the side it struck flares, and sparks fly off
			var C: PackedColorArray = RAMP["guarding"]
			var dx: float = float(e.get("fromX", e["x"])) - float(e["x"])
			var dy: float = float(e.get("fromY", e["y"])) - float(e["y"])
			var l := maxf(0.0001, sqrt(dx * dx + dy * dy)) if dx != 0.0 or dy != 0.0 else 1.0
			guard["struck"] = 0.0
			guard["fx"] = dx / l
			guard["fy"] = dy / l
			fx.streaks(float(e["x"]) + dx / l * 0.35, float(e["y"]) + dy / l * 0.35, 9, _c(C, [4, 5, 3]), 3.0, 3.0, {"dx": dx / l, "dy": dy / l, "spread": 1.1, "z": 14.0, "life": 0.2})
		_:
			return false
	return true


## (where a mark was last spent, and in which frame: the hit told with it shows the critical, not the plain Precise hit)
var _spent := Vector2.INF
var _spent_frame := -1


func spent_here(x: float, y: float) -> bool:
	return _spent_frame == Engine.get_process_frames() and _spent.distance_to(Vector2(x, y)) < 0.001


## PRECISE, on the hit at (x, y) from the way (dx, dy): narrow and exact (words3.ts preciseHit). A hit that spends a mark shows
## the critical instead.
func precise_hit(x: float, y: float, dx: float, dy: float) -> void:
	var C: PackedColorArray = RAMP["precise"]
	var l := maxf(0.0001, sqrt(dx * dx + dy * dy))
	pins.append({"x": x, "y": y, "dx": dx / l, "dy": dy / l, "t": 0.0, "dur": 0.16, "crit": false})
	fx.ring(x, y, 0.32, 0.14, _c(C, [5, 3, 2]), false)
	fx.streaks(x, y, 4, _c(C, [4, 3]), 2.2, 2.0, {"dx": dx / l, "dy": dy / l, "spread": 0.25, "z": 11.0, "life": 0.12})


## The marked enemy is struck: the sight snaps shut on it and a critical star bursts (words3.ts preciseCrit).
func _precise_crit(m, dx: float, dy: float) -> void:
	var C: PackedColorArray = RAMP["precise"]
	var id: int = m.get_instance_id()
	var k: Dictionary = sights.get(id, {"m": m, "aim": 0.0, "aim0": 0.0, "shut": 0.0})
	k["aim"] = 0.0
	k["shut"] = 0.2
	sights[id] = k
	var l := maxf(0.0001, sqrt(dx * dx + dy * dy))
	var at: Vector2 = m.world
	pins.append({"x": at.x, "y": at.y, "dx": dx / l, "dy": dy / l, "t": 0.0, "dur": 0.26, "crit": true})
	fx.flash(at.x, at.y, 13.0, 0.55, 0.12, _c(C, [5, 4, 3]))
	fx.ring(at.x, at.y, 0.7, 0.2, _c(C, [5, 4, 3]), false, {"heavy": true})
	fx.streaks(at.x, at.y, 10, _c(C, [4, 5]), 3.5, 3.0, {"z": 13.0, "life": 0.16})
	fx.glow(at.x, at.y, 36.0, 0.2)


## FRENZIED, on each use: the frenzy grows by one, up to five; a ring beats out from his feet and sparks are thrown back off
## them (words3.ts frenzyHit).
func _frenzy_hit(hx: float, hy: float, dx: float, dy: float) -> void:
	var C: PackedColorArray = RAMP["frenzied"]
	frenzy["n"] = mini(5, int(frenzy["n"]) + 1)
	frenzy["t"] = 4.0
	frenzy["since"] = 0.0
	var n: int = frenzy["n"]
	fx.ring(hx, hy, 0.75 + n * 0.05, 0.2, _c(C, [4, 3, 2]), n >= 5, {"heavy": n >= 3})
	fx.streaks(hx, hy, 4 + n * 2, _c(C, [3, 4, 5]), 3.2, 4.0, {"dx": -dx, "dy": -dy, "spread": 0.9, "z": 10.0, "life": 0.2, "r": 0.3})


# --- time passes (fx.ts update; words3.ts tick3) ---

func update(dt: float) -> void:
	var h: Vector2 = fx.hero_at()
	for i in range(wisps.size() - 1, -1, -1):
		var w: Dictionary = wisps[i]
		w["t"] += dt
		if w["t"] >= w["dur"]:
			wisps.remove_at(i)
			# the life arrives: he pulses (not for every single wisp)
			if pulse_wait <= 0.0:
				pulse_wait = 0.22
				fx.ring(h.x, h.y, 0.6, 0.2, PackedColorArray([L.P["white"], L.P["bl5"], L.P["bl4"]]), true)
	for i in range(beams.size() - 1, -1, -1):
		beams[i]["t"] += dt
		if beams[i]["t"] >= beams[i]["dur"]:
			beams.remove_at(i)
	# life leeched is shown as one number every so often, not one per hit
	heal_wait -= dt
	if heal_sum >= 1.0 and heal_wait <= 0.0:
		fx.float_text(h.x, h.y, "+%d" % int(floorf(heal_sum + 0.5)), L.P["bl5"], false, 30.0)
		heal_sum = 0.0
		heal_wait = 0.7
	pulse_wait -= dt
	for i in range(pins.size() - 1, -1, -1):
		pins[i]["t"] += dt
		if pins[i]["t"] >= pins[i]["dur"]:
			pins.remove_at(i)
	for id in sights.keys():
		var k: Dictionary = sights[id]
		if k["aim"] > 0.0:
			k["aim"] -= dt
			k["aim0"] += dt
		if k["shut"] > 0.0:
			k["shut"] -= dt
		if (k["aim"] <= 0.0 and k["shut"] <= 0.0) or not is_instance_valid(k["m"]) or k["m"].dead:
			sights.erase(id)
	for i in range(flights.size() - 1, -1, -1):
		var f: Dictionary = flights[i]
		f["t"] += dt
		if f["t"] >= f["dur"]:
			flights.remove_at(i)
			# it arrives: the frenzy is kept going
			frenzy["t"] = 4.0
			frenzy["since"] = 0.0
			fx.ring(h.x, h.y, 0.8, 0.22, _c(RAMP["frenzied"], [4, 3, 2]), true)
	frenzy["since"] += dt
	if frenzy["t"] > 0.0:
		frenzy["t"] -= dt
		if frenzy["t"] <= 0.0:
			frenzy["n"] = 0
	if guard["t"] > 0.0:
		guard["t"] = maxf(0.0, guard["t"] - dt)
	guard["struck"] += dt
	# (the frenzy and the shield are shown as he has them: events3)
	var hero = fx.hero()
	if hero != null and hero.get("frenzy") != null:
		frenzy["n"] = int(hero.frenzy)
		frenzy["t"] = float(hero.frenzy_t)
		guard["t"] = float(hero.shield_t)
	# (in a full frenzy, heat comes off him: air3)
	if int(frenzy["n"]) >= 5 and randf() < 30.0 * dt * fx.room():
		var C: PackedColorArray = RAMP["frenzied"]
		fx.add(h.x + L.rnd(-0.35, 0.35), h.y + L.rnd(-0.35, 0.35), L.rnd(4, 20), 0.0, 0.0, L.rnd(30, 55), L.rnd(0.15, 0.3), C[3] if randf() < 0.5 else C[4], 1.0, 0.0, null, 3.0)


# --- drawn (fx.ts drawAir; words3.ts floor3, air3; render.ts the rune) ---

## A ring of single pixels round a point of the screen, `r` tiles on the floor (words3.ts ringOf).
static func _ring_of(c: CanvasItem, cx: float, cy: float, r: float, col: Color, gap := 1, from := 0.0, sweep := TAU) -> void:
	var n := maxi(16, int(floorf(r * 44.0 + 0.5)))
	var i := 0
	while i < n:
		var a := from + float(i) / n * sweep
		c.draw_rect(Rect2(floorf(cx + (cos(a) - sin(a)) * 16.0 * r + 0.5) * 2.0, floorf(cy + (cos(a) + sin(a)) * 8.0 * r + 0.5) * 2.0, 2.0, 2.0), col)
		i += gap


## render.ts ringDots: a ring of dots on the floor, every `gap`-th of them.
static func _ring_dots(c: CanvasItem, cx: float, cy: float, r: float, col: Color, gap := 1) -> void:
	var n := maxi(12, int(floorf(r * 40.0 + 0.5)))
	var i := 0
	while i < n:
		var a := float(i) / n * TAU
		c.draw_rect(Rect2(floorf(cx + cos(a) * r * 22.6 + 0.5) * 2.0, floorf(cy + sin(a) * r * 11.3 + 0.5) * 2.0, 2.0, 2.0), col)
		i += gap


## On the floor, under what stands: the ring of the frenzy at his feet (words3.ts floor3, drawFrenzyRing).
func draw_floor(c: CanvasItem) -> void:
	if int(frenzy["n"]) <= 0:
		return
	var h: Vector2 = fx.hero_at()
	var C: PackedColorArray = RAMP["frenzied"]
	var t: float = fx.clock
	var n_lit: int = frenzy["n"]
	var cx: float = fx.gx(h.x, h.y)
	var cy: float = fx.gy(h.x, h.y)
	var R := 0.56
	var fading: bool = frenzy["t"] < 1.0 and int(floorf(t * 12.0)) % 2 == 0
	var turn := t * (1.2 + n_lit * 0.7)
	var n := maxi(20, int(floorf(R * 60.0 + 0.5)))
	# (under it, a faint heat on the floor that grows with the frenzy)
	fx.floor_oval(c, cx, cy, R * 0.95, C[2], (0.05 + n_lit * 0.035) * (0.5 if fading else 1.0))
	for i in n:
		var a := turn + float(i) / n * TAU
		var into := fmod(float(i) / n * 5.0, 1.0)
		var which := int(floorf(float(i) / n * 5.0))
		if into < 0.1 or into > 0.9:
			continue
		var lit := which < n_lit
		if not lit and i % 2 == 1:
			continue
		var fresh: bool = which == n_lit - 1 and frenzy["since"] < 0.14
		var col: Color = C[1] if not lit else (C[5] if fresh else (C[4] if into > 0.7 else C[3]))
		if fading and lit:
			continue
		var px := floorf(cx + (cos(a) - sin(a)) * 16.0 * R + 0.5)
		var py := floorf(cy + (cos(a) + sin(a)) * 8.0 * R + 0.5)
		c.draw_rect(Rect2(px * 2.0, py * 2.0, 4.0 if lit else 2.0, 2.0), col)


## A patch of these words' on the floor (wakes.gd's list, by fx_wakes.gd): "of Ruin"'s rune (render.ts), "of Warding"'s ward
## circle (words3.ts drawWard). True if it was one of them.
func draw_patch(c: CanvasItem, p: Dictionary) -> bool:
	var kind := str(p.get("kind", ""))
	if kind != "rune" and kind != "ward":
		return false
	var P: Dictionary = L.P
	var x: float = p["x"]
	var y: float = p["y"]
	var zr: float = p["r"]
	var zt: float = p["t"]
	var t: float = fx.clock
	var cx: float = fx.gx(x, y)
	var cy: float = fx.gy(x, y)
	if kind == "rune":
		# Volatile behind: a sigil written on the floor. It beats faster and whiter as its time runs out, and a ring closes in
		# from the edge of the blast to come.
		var k: float = clampf(zt / maxf(0.01, float(p["dur"])), 0.0, 1.0)
		var beat := sin(zt * (10.0 + k * 34.0)) > 0.0
		var col: Color = (P["white"] if beat else P["pu5"]) if k > 0.72 else (P["pu5"] if beat else P["pu4"])
		_ring_dots(c, cx, cy, zr, P["pu2"], 3)
		fx.floor_oval(c, cx, cy, 0.95, P["pu3"], 0.3 + 0.3 * k)
		_ring_dots(c, cx, cy, 0.95, col)
		_ring_dots(c, cx, cy, 0.5, col, 2)
		var turn := t * 1.4
		for i in 3:
			var a0 := turn + i / 3.0 * TAU
			var a1 := turn + (i + 1) / 3.0 * TAU
			fx.pline(c, fx.gx(x + cos(a0) * 0.9, y + sin(a0) * 0.9), fx.gy(x + cos(a0) * 0.9, y + sin(a0) * 0.9), fx.gx(x + cos(a1) * 0.9, y + sin(a1) * 0.9), fx.gy(x + cos(a1) * 0.9, y + sin(a1) * 0.9), col)
		_ring_dots(c, cx, cy, maxf(0.95, zr * (1.0 - 0.75 * k)), P["white"] if k > 0.72 else P["pu5"], 1)
		var el: PackedColorArray = L.EL.get(str(p.get("element", "phys")), L.EL["phys"])
		fx.rect(c, floorf(cx + 0.5) - 1.0, floorf(cy + 0.5) - 1.0, 3.0, 2.0, el[mini(3, el.size() - 1)])
		if randf() < 0.3 + k * 0.6:
			fx.mote(x, y, PackedColorArray([P["pu5"], P["pu4"], P["white"]]))
		return true
	# Guarding behind: the ward circle, drawn round from the top as it is laid, a shield at each quarter on its ring
	var C: PackedColorArray = RAMP["guarding"]
	var fade := minf(1.0, minf(zt / 0.18, (float(p["dur"]) - zt) / 0.5))
	var drawn := minf(1.0, zt / 0.3)
	var h: Vector2 = fx.hero_at()
	var in_it := h.distance_to(Vector2(x, y)) < zr
	fx.floor_oval(c, cx, cy, zr, C[1], (0.24 if in_it else 0.16) * fade)
	_ring_of(c, cx, cy, zr, Color(C[4] if in_it else C[3], fade), 1, -PI / 2.0, TAU * drawn)
	_ring_of(c, cx, cy, zr * 0.96, Color(C[2], fade), 1, -PI / 2.0, TAU * drawn)
	_ring_of(c, cx, cy, zr * 0.7, Color(C[2], fade), 3, -PI / 2.0, TAU * drawn)
	for q in 4:
		var a := q / 4.0 * TAU + PI / 4.0
		if q / 4.0 > drawn:
			continue
		var px := floorf(cx + (cos(a) - sin(a)) * 16.0 * zr + 0.5) - 3.0
		var py := floorf(cy + (cos(a) + sin(a)) * 8.0 * zr + 0.5) - 3.0
		for r in GLYPH.size():
			var row: String = GLYPH[r]
			for col in row.length():
				if row[col] != ".":
					fx.rect(c, px + col, py + r + 1, 1, 1, Color(WARD_DARK, fade))
		for r in GLYPH.size():
			var row: String = GLYPH[r]
			for col in row.length():
				var ch := row[col]
				if ch == ".":
					continue
				var hue: Color = ((C[5] if in_it and sin(t * 4.0 + q) > 0.0 else C[4]) if ch == "o" else (C[4] if r == 0 else C[3]))
				fx.rect(c, px + col, py + r, 1, 1, Color(hue, fade))
	return true


## In the air, over the dark: columns of light, wisps of life, Precise's pins and sights, Frenzied's sparks flying to him,
## the motes in a ward, his shield (fx.ts drawAir; words3.ts air3).
func draw_air(c: CanvasItem, patches: Array) -> void:
	var P: Dictionary = L.P
	var t: float = fx.clock
	for b: Dictionary in beams:
		# a column of light: wide and white at first, thin and coloured as it goes
		var k: float = b["t"] / b["dur"]
		var cx := floorf(fx.gx(b["x"], b["y"]) + 0.5)
		var cy := floorf(fx.gy(b["x"], b["y"]) + 0.5)
		var w := maxf(1.0, floorf(b["w"] * (1.0 - k) + 0.5))
		var al := 0.85 * (1.0 - k * 0.6)
		var cs: PackedColorArray = b["colors"]
		fx.rect(c, cx - w, cy - 150.0, w * 2.0 + 1.0, 150.0, Color(cs[mini(cs.size() - 1, int(k * cs.size()) + 1)], al))
		fx.rect(c, cx - floorf(w / 2.0), cy - 150.0, maxf(1.0, w), 150.0, Color(P["white"], al))
	var h: Vector2 = fx.hero_at()
	for w: Dictionary in wisps:
		if w["t"] < 0.0:
			continue
		# a bead of light with a red tail, along a curve to the hero
		var at := func(k: float) -> Vector2:
			var e := k * k * (3.0 - 2.0 * k)
			var dx: float = h.x - float(w["sx"])
			var dy: float = h.y - float(w["sy"])
			var side: float = sin(PI * k) * float(w["bend"]) * 0.5
			var x: float = float(w["sx"]) + dx * e - dy * side
			var y: float = float(w["sy"]) + dy * e + dx * side
			return Vector2(fx.gx(x, y), fx.gy(x, y) - 10.0 - sin(PI * k) * float(w["lift"]))
		var k1: float = w["t"] / w["dur"]
		var p: Vector2 = at.call(k1)
		for tail in range(1, 6):
			var k := k1 - tail * 0.07
			if k < 0.0:
				break
			var q: Vector2 = at.call(k)
			fx.pline(c, p.x, p.y, q.x, q.y, P["bl5"] if tail < 2 else (P["bl4"] if tail < 4 else P["bl3"]))
			p = q
		var head: Vector2 = at.call(k1)
		fx.rect(c, floorf(head.x + 0.5) - 1.0, floorf(head.y + 0.5) - 1.0, 3, 3, P["bl5"])
		fx.rect(c, floorf(head.x + 0.5), floorf(head.y + 0.5), 1, 1, P["white"])
	# the spark of a frenzy fed by a kill, leaping to him
	var CF: PackedColorArray = RAMP["frenzied"]
	for f: Dictionary in flights:
		var at := func(q: float) -> Vector2:
			var e := q * q * (3.0 - 2.0 * q)
			var dx: float = h.x - float(f["x0"])
			var dy: float = h.y - float(f["y0"])
			var side: float = sin(PI * q) * float(f["bend"]) * 0.5
			var x: float = float(f["x0"]) + dx * e - dy * side
			var y: float = float(f["y0"]) + dy * e + dx * side
			return Vector2(fx.gx(x, y), fx.gy(x, y) - 12.0 - sin(PI * q) * 14.0)
		var q1: float = f["t"] / f["dur"]
		var p: Vector2 = at.call(q1)
		for tail in range(1, 6):
			var q := q1 - tail * 0.06
			if q < 0.0:
				break
			var o: Vector2 = at.call(q)
			fx.pline(c, p.x, p.y, o.x, o.y, CF[4] if tail < 2 else (CF[3] if tail < 4 else CF[2]))
			p = o
		var head: Vector2 = at.call(q1)
		fx.rect(c, floorf(head.x + 0.5) - 1.0, floorf(head.y + 0.5) - 1.0, 3, 3, CF[3])
		fx.rect(c, floorf(head.x + 0.5), floorf(head.y + 0.5), 1, 1, CF[5])
	# Precise's pins: a needle of light through the point, and a star with long thin rays where it struck
	var CP: PackedColorArray = RAMP["precise"]
	for q: Dictionary in pins:
		var k: float = q["t"] / q["dur"]
		var x := floorf(fx.gx(q["x"], q["y"]) + 0.5)
		var y := floorf(fx.gy(q["x"], q["y"]) + 0.5) - 12.0
		if not q["crit"] and k < 0.6:
			var bx: float = fx.gx(q["x"] - q["dx"] * 1.1, q["y"] - q["dy"] * 1.1)
			var by: float = fx.gy(q["x"] - q["dx"] * 1.1, q["y"] - q["dy"] * 1.1) - 12.0
			var ex: float = fx.gx(q["x"] + q["dx"] * 0.7, q["y"] + q["dy"] * 0.7)
			var ey: float = fx.gy(q["x"] + q["dx"] * 0.7, q["y"] + q["dy"] * 0.7) - 12.0
			fx.pline(c, bx, by, ex, ey, Color(CP[5] if k < 0.25 else CP[3], 1.0 - k / 0.6))
		var grow := 1.0 if q["crit"] else 1.0 - k
		var hh := floorf((18.0 if q["crit"] else 11.0) * grow + 0.5)
		var v := floorf((11.0 if q["crit"] else 6.0) * grow + 0.5)
		if hh <= 0.0:
			continue
		fx.rect(c, x - hh, y, hh * 2.0 + 1.0, 1, CP[2])
		fx.rect(c, x, y - v, 1, v * 2.0 + 1.0, CP[2])
		fx.rect(c, x - floorf(hh * 0.6 + 0.5), y, floorf(hh * 1.2 + 0.5) + 1.0, 1, CP[4])
		fx.rect(c, x, y - floorf(v * 0.6 + 0.5), 1, floorf(v * 1.2 + 0.5) + 1.0, CP[4])
		if q["crit"]:
			var d := floorf(6.0 * (1.0 - k * 0.5) + 0.5)
			for i in range(1, int(d) + 1):
				var col: Color = CP[4] if i < d * 0.6 else CP[2]
				fx.rect(c, x - i, y - i, 1, 1, col)
				fx.rect(c, x + i, y - i, 1, 1, col)
				fx.rect(c, x - i, y + i, 1, 1, col)
				fx.rect(c, x + i, y + i, 1, 1, col)
		fx.rect(c, x - 1.0, y - 1.0, 3, 3, CP[5])
	# "of the Mark": a sight closing on the marked enemy, snapping shut on the critical
	for id in sights:
		var k: Dictionary = sights[id]
		var m = k["m"]
		if not is_instance_valid(m) or m.dead or not m.seen:
			continue
		var sx := floorf(fx.gx(m.world.x, m.world.y) + 0.5)
		var sy := floorf(fx.gy(m.world.x, m.world.y) + 0.5)
		var size = L.FIGURE_SIZE.get(m.art.name if m.art != null else m.kind, L.FIGURE_SIZE.get(m.kind))
		var top: float = float(size["top"]) if size != null else 30.0
		var half: float = float(size["half"]) if size != null and size.has("half") else 10.0
		var shut: bool = k["shut"] > 0.0
		var close := -2.0 if shut else floorf(9.0 * maxf(0.0, 1.0 - k["aim0"] / 0.25) + 0.5) + (1.0 if sin(t * 7.0) > 0.0 else 0.0)
		var going: float = minf(1.0, k["shut"] / 0.12) if shut else minf(1.0, k["aim"] / 0.25)
		_sight(c, sx - half - 2.0 - close, sy - top - 3.0 - close, sx + half + 2.0 + close, sy + 2.0 + close, CP[5] if shut else CP[3], going)
	# the motes rising in a ward
	var CG: PackedColorArray = RAMP["guarding"]
	for p: Dictionary in patches:
		if p.get("kind", "") != "ward":
			continue
		var fade := minf(1.0, minf(float(p["t"]) / 0.18, (float(p["dur"]) - float(p["t"])) / 0.5))
		var in_it := h.distance_to(Vector2(p["x"], p["y"])) < float(p["r"])
		var seed := int(floorf(float(p["x"]) * 7.0 + float(p["y"]) * 13.0))
		for i in (12 if in_it else 6):
			var q := fmod(t * 0.6 + _hash(seed, i, 51), 1.0)
			var a := _hash(seed, i, 52) * TAU
			var d := sqrt(_hash(seed, i, 53)) * float(p["r"]) * 0.9
			var al := fade * (q / 0.2 if q < 0.2 else 1.0 - (q - 0.2) / 0.8)
			var mx: float = float(p["x"]) + cos(a) * d
			var my: float = float(p["y"]) + sin(a) * d
			fx.rect(c, floorf(fx.gx(mx, my) + 0.5), floorf(fx.gy(mx, my) + 0.5) - floorf(2.0 + q * 22.0 + 0.5), 1, 1, Color(CG[5] if i % 3 == 0 else CG[4], al))
	if guard["t"] > 0.0:
		_shell(c, t)


## Four corners of a sight round (x0, y0) to (x1, y1), with a dark pixel outside each (words3.ts drawSight).
func _sight(c: CanvasItem, x0: float, y0: float, x1: float, y1: float, color: Color, alpha: float) -> void:
	var n := 4.0
	for q in [[x0, y0, 1.0, 1.0], [x1, y0, -1.0, 1.0], [x0, y1, 1.0, -1.0], [x1, y1, -1.0, -1.0]]:
		var cx: float = q[0]
		var cy: float = q[1]
		var sx: float = q[2]
		var sy: float = q[3]
		fx.rect(c, minf(cx - sx, cx - sx + sx * n), cy - sy, n + 1.0, 1, Color(SIGHT_DARK, alpha))
		fx.rect(c, cx - sx, minf(cy - sy, cy - sy + sy * n), 1, n + 1.0, Color(SIGHT_DARK, alpha))
		fx.rect(c, minf(cx, cx + sx * (n - 1.0)), cy, n, 1, Color(color, alpha))
		fx.rect(c, cx, minf(cy, cy + sy * (n - 1.0)), 1, n, Color(color, alpha))


## His shield: a shell of emerald points round him, lit at the upper left; it flares on the side a blow strikes (words3.ts
## drawShell).
func _shell(c: CanvasItem, t: float) -> void:
	var C: PackedColorArray = RAMP["guarding"]
	var h: Vector2 = fx.hero_at()
	var cx: float = fx.gx(h.x, h.y)
	var top: float = fx.figures.headroom()
	if top <= 0.0:
		top = 32.0
	var cy: float = fx.gy(h.x, h.y) - top * 0.52
	var rx := 13.0
	var ry := floorf(top * 0.62 + 0.5)
	var age: float = guard["dur"] - guard["t"]
	var fade: float = minf(1.0, guard["t"] / 0.4) * (0.5 if guard["t"] < 0.4 and int(floorf(t * 14.0)) % 2 == 0 else 1.0)
	var snap := age < 0.12
	var struck: bool = guard["struck"] < 0.25
	var bx: float = (guard["fx"] - guard["fy"]) * 16.0
	var by: float = (guard["fx"] + guard["fy"]) * 8.0
	var bl := maxf(0.0001, sqrt(bx * bx + by * by))
	fx.oval(c, cx, cy, rx, ry, Color(C[3], 0.14 * fade))
	var n := 52
	var run := int(floorf(t * 30.0)) % n
	for i in n:
		var a := float(i) / n * TAU
		var ex := cos(a)
		var ey := sin(a)
		var lit := ex < -0.15 and ey < -0.15
		var hit := struck and (ex * bx + ey * by) / bl > 0.55
		var col: Color = C[5] if hit or snap or i == run or i == (run + n / 2) % n else (C[4] if lit else C[3])
		var push := 1.0 if hit else 0.0
		fx.rect(c, floorf(cx + ex * (rx + push) + 0.5), floorf(cy + ey * (ry + push) + 0.5), 2.0 if hit or lit else 1.0, 1, Color(col, fade * (1.0 if hit or snap or lit else 0.8)))


## engine/rng.ts hash2: a steady number from 0 to 1 for (a, b, c), in 32-bit arithmetic as the game's Math.imul does it.
static func _hash(a: int, b: int, c: int) -> float:
	var h := (_imul(a, 374761393) + _imul(b, 668265263) + _imul(c, 2246822519)) & 0xffffffff
	h = _imul(h ^ (h >> 13), 1274126177) & 0xffffffff
	h = h ^ (h >> 16)
	return float(h & 0xffffffff) / 4294967296.0


static func _imul(a: int, b: int) -> int:
	return ((a & 0xffffffff) * (b & 0xffffffff)) & 0xffffffff


## Where these light the dark a moment (words3.ts lights3: a critical's flare; fx.ts glow is asked as each is made).
func lights() -> void:
	pass
