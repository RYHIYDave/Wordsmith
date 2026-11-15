## THE CARRION QUEEN, FLOOR 7'S BOSS (the Ledge Road, "The Queen's Eyrie"), as the game fights her as it starts: her moves done the
## action way (game/act1_rules/queen.ts RULES, QN, QUEEN_ROAM, QN2_ACTS, actingNew, stepPeril; art/carrion_queen_action.ts QA_RAKE,
## QA_GUST, QA_DIVE, QA_ECLIPSE; art/carrion_queen_action_fx.ts rakeStrikes, gustStrikes, gustShove, diveStrikes, poolsAt, inPool;
## QUEEN_ACTION on: game/enemy_moves.ts). His doc: "A huge cult-bound vulture nesting on an outcrop over the drop".
##   HER SPOT: her perch on the eyrie's edge, the drop behind her (assets/floor7/boss.json `perch`); jostled off it by no more than
##     0.4 she is back on it at once; further, she hops back (her walk, her one gait: 1.5 tiles a second, a hop 0.6 s round).
##   SHE ROAMS HER EYRIE (QUEEN_ROAM): when she has stood 2 to 3.5 s, and after one of her moves in two, she hops to another spot
##     1.4 to 3.2 tiles from the hero, 1.6 to 3 from where she was, clear round her and in his sight. Her life cannot be brought
##     below a hundredth of it until she is home for good: brought there, she flies home (her dive, `queen:home`: up out of sight
##     she is set down over her perch, turned as it faces, and stoops onto it), and stays; the next blow kills her.
##   HER TALON RAKE, her blow (within 3.4 tiles; 1.87 s): the wedge she rakes marked on the rock; at 1.07 s a hero 0.2 to 3.4
##     before her and within 0.65 (and a quarter of a tile more for every tile out) to either side is struck, x1, and knocked back
##     half a step; the gouges of fire torn along its three lanes.
##   HER WING GUST (within 6 tiles; 2.0 s, every 8 s, the first 3 s in): its cone marked in rays straight out from her; at her clap
##     (1.07 s) a hero before her, as far as 7 tiles and within 1.6 (and 0.6 more a tile out) to either side, is struck, x0.5, and
##     shoved straight away from her 4 tiles at her feet, less further out (1.5 at least), over 0.4 s: never nearer the drop than
##     he was ("Yes, no drop-pushes").
##   HER DIVE (2 to 5.5 tiles; 2.8 s, every 7 s, the first 4 s in): she leaves the rock at 0.33 s and is up out of sight and out of
##     reach from 0.47 s to 1.53 s, her line and the ring where she will strike marked on the rock; at 1.6 s her talons strike 4
##     tiles along it: a hero within 3.2 of there, or on her line from 1 tile out, within 0.9 to either side, is struck, x1.6, and
##     knocked back a step; the rock bursts there (the crater, the dirt and dust: 'queen:burst'), the screen kicked 8.
##   HER CALL (1.7 s, every 18 s, the first 5 s in; only while two of her flock or fewer live): "The Carrion Queen calls her flock";
##     at 0.8 s her flock comes down out of the sky round her, 1.5 to 5 tiles from her and 2.5 from the hero, as many as make four
##     of it alive, three at most: the Ledge Road's vultures, called in (vulture.gd).
##   THE ECLIPSE (3 s, every 30 s, the first 12 s in): from her wings' sweep the ledge goes dark for 8 s but for three pools of light
##     drifting over it round where she stood; while the hero is outside every pool, a vulture of her flock dives at him every 1.4 s
##     (its line marked 0.7 s first, from 4.5 tiles off to where he stood: struck within 0.9 of there and along the last 1.6 of its
##     line, 0.45 to either side, x0.9). In the dark she keeps to her rake.
##   SHE GOES OVER THE EDGE: her death painted falling backward, shown the way round of her picture whose back is to the drop, where
##     she went over ('queen:fall'): from in front, what of her has gone below the edge is under the eyrie's near rock.
## Her marks: queen_marks.gd.
extends "res://scripts/act1/act1.gd"

const BG := preload("res://scripts/act1/boss_ground.gd")

## (QN_GAIT: her hop, 12 frames at 20 a second, painted for 1.5 tiles a second)
const GAIT := {"pace": 1.5, "cycle": 0.6, "setOff": 0.0, "halt": 0.0, "stopAt": 2.0, "slack": 0.5, "trueBack": false}
## (QN: her death's edge and fall; how far she is jostled before she hops back; her call)
const QN := {"edge": 1.715, "fall": 2.05, "hold": 0.4, "call": {"screech": 0.36, "at": 0.8, "n": 3, "most": 4}}
const ROAM := {"every": [2.0, 3.5], "near": 1.4, "far": 3.2, "apart": 1.6, "hop": 3.0, "after": 0.5, "last": 0.01}
## (art/carrion_queen_action.ts, on the game's frames, 30 a second)
const RAKE := {"long": 56.0 / 30.0, "up": 18.0 / 30.0, "hit": 32.0 / 30.0, "from": 0.2, "to": 3.4, "half": 0.65, "spread": 0.25, "lanes": [-24.0, 0.0, 24.0]}
const GUST := {"long": 60.0 / 30.0, "hold": 14.0 / 30.0, "hit": 32.0 / 30.0, "far": 7.0, "wide": 1.6, "spread": 0.6, "push": 4.0, "least": 1.5, "pushFor": 0.4, "rays": 9}
const DIVE := {"long": 84.0 / 30.0, "launch": 10.0 / 30.0, "up": [14.0 / 30.0, 46.0 / 30.0], "hold": 29.0 / 30.0, "hit": 48.0 / 30.0, "at": 4.0, "r": 3.2, "line": 1.0, "half": 0.9, "dust": 2.3, "crater": 2.0, "shake": 8.0}
const ECLIPSE := {"long": 90.0 / 30.0, "hold": 24.0 / 30.0, "hit": 52.0 / 30.0, "fall": 0.2, "dark": 8.0, "back": 0.3, "dim": 0.82, "pools": 3, "r": 1.7, "drift": 0.4,
	"every": 1.4, "first": 0.8, "warn": 0.7, "from": 4.5, "hitR": 0.9, "tail": 1.6, "half": 0.45}
## (QN2_ACTS)
const ACTS := [
	{"id": "queen:rake", "clip": "attack", "long": 56.0 / 30.0, "hit": 32.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.35, "near": 0.0, "far": 3.4},
	{"id": "queen:gust", "clip": "gust", "long": 60.0 / 30.0, "hit": 32.0 / 30.0, "dmg": 0.5, "cooldown": 8.0, "first": 3.0, "after": 0.4, "near": 0.0, "far": 6.0},
	{"id": "queen:dive", "clip": "dive", "long": 84.0 / 30.0, "hit": 48.0 / 30.0, "dmg": 1.6, "cooldown": 7.0, "first": 4.0, "after": 0.5, "near": 2.0, "far": 5.5},
	{"id": "queen:call", "clip": "call", "long": 1.7, "hit": 0.8, "dmg": 0.0, "cooldown": 18.0, "first": 5.0, "after": 0.5, "near": 0.0, "far": 16.0},
	{"id": "queen:eclipse", "clip": "eclipse", "long": 90.0 / 30.0, "hit": 52.0 / 30.0, "dmg": 0.9, "cooldown": 30.0, "first": 12.0, "after": 0.5, "near": 0.0, "far": 16.0},
	{"id": "queen:home", "clip": "dive", "long": 84.0 / 30.0, "hit": 48.0 / 30.0, "dmg": 1.6, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": 99.0, "forced": true},
]
const HOME := 5
## (QN_VIEWS: her picture's four ways round, by the floor's way each faces)
const VIEWS := [Vector2(1, 0), Vector2(0, 1), Vector2(-1, 0), Vector2(0, -1)]
const FOE := Color("#ff8a3a")


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## viewIndex: which of her four ways round shows one facing `f`.
static func view_index(f: Vector2) -> int:
	var back := f.x + f.y < -0.2
	var flip := f.x - f.y < 0.0
	return (2 if flip else 3) if back else (1 if flip else 0)


## (spawned: on her spot on her eyrie, the ways round with the drop at her back there; anywhere else, her spot is where she is)
func spawned(m) -> void:
	var p = _perch(m)
	var on: bool = p != null and m.world.distance_to(Vector2(p["x"], p["y"])) < 0.2
	a1 = {"hx": m.world.x, "hy": m.world.y, "views": int(p["views"]) if on else 0, "gx": 0.0, "gy": 0.0}
	if on:
		m.face = Vector2(p["fx"], p["fy"])


func _perch(m):
	return BG.of(m.mgr.map.depth if m.mgr != null and m.mgr.map != null else 0).get("perch")


func _spot() -> Vector2:
	return Vector2(a1["hx"], a1["hy"])


## (QUEEN_ROAM) Is she on her perch over the drop, for good?
func home_for_good() -> bool:
	return int(a1.get("home", 0)) == 1


## (QUEEN_ROAM) The least her life can be brought to before she is home for good: a hundredth of it.
static func last_of(m) -> float:
	return maxf(1.0, ceilf(m.max_life * float(ROAM["last"])))


## (lifeFloor: monster.gd holds her life up to it)
func life_floor(m) -> float:
	return 0.0 if home_for_good() else last_of(m)


func tick(m, dt: float, dist: float, hero) -> bool:
	if not a1.has("flock"):
		_keep_flock(m)
	# (she holds her ground: what jostles her moves her no more than a little, and she is back on her spot at once)
	var jolt: float = m.world.distance_to(_spot())
	if jolt > 0.0 and jolt <= float(QN["hold"]) and mode != "walk":
		m.world = _spot()
	if m.state == "act":
		return false
	if cds.size() != ACTS.size():
		cds = []
		for a in ACTS:
			cds.append(float(a["first"]) * randf_range(0.7, 1.2))
	for k in cds.size():
		cds[k] -= dt
	m.state = "chase"
	# OFF HER SPOT: she hops back onto it (her round ends as she stands: she stops as it comes round, there)
	var off: float = m.world.distance_to(_spot())
	if off > 0.0 or mode == "walk":
		var sp: float = m.speed
		if mode != "walk":
			_to("walk")
		if off > 0.01:
			var step := minf(off, sp * dt)
			var u: Vector2 = (_spot() - m.world) / off
			m.face = u
			slide(m, u * step)
			# (where nothing lets her by, her spot is where she has come to)
			if m.world.distance_to(_spot()) > off - step * 0.5 and step > 1e-4:
				a1["hx"] = m.world.x
				a1["hy"] = m.world.y
		var before := gt
		gt += dt * sp / float(GAIT["pace"])
		if m.world.distance_to(_spot()) <= 0.05 and floori(gt / float(GAIT["cycle"])) > floori(before / float(GAIT["cycle"])):
			_to("stand")
		return true
	# (QUEEN_ROAM: home to her perch at the last of her life; and, stood her while, off to another spot)
	if not home_for_good():
		if m.life <= last_of(m):
			return false
		a1["roamT"] = float(a1.get("roamT", ROAM["every"][0])) - dt
		if float(a1["roamT"]) <= 0.0:
			a1["roamT"] = randf_range(ROAM["every"][0], ROAM["every"][1])
			var to = _roam_spot(m, hero)
			if to != null:
				a1["hx"] = to.x
				a1["hy"] = to.y
				return true
	# ON IT: an act, when one is to be made (the runner makes it, turning her to the hero); else she stands, turned to him
	if _any_ready(m, dist, hero):
		# (the runner counts her moves down itself)
		for k in cds.size():
			cds[k] += dt
		return false
	if mode != "stand":
		_to("stand")
	gt += dt
	if dist > 0.01:
		m.face = (hero.world - m.world) / dist
	return true


## Would she make an act now (as BossRules.pickAct would choose one)? Not her flight home: that only when it must be (`forced`).
func _any_ready(m, dist: float, hero) -> bool:
	if m._cd > 0.0 or not hero.alive:
		return false
	if not (dist < 16.0 and m.mgr.sees(m.world, hero.world)):
		return false
	for i in ACTS.size():
		var a: Dictionary = ACTS[i]
		if not a.get("forced", false) and cds[i] <= 0.0 and dist >= float(a["near"]) and dist <= float(a["far"]) and can(m, a, dist, true):
			return true
	return false


func can(m, a: Dictionary, _dist: float, _los: bool) -> bool:
	# (in her Eclipse's dark, her rake alone; and never two Eclipses at once)
	if eclipse_now(m.mgr.perils) != null and a["id"] != "queen:rake" and not a.get("forced", false):
		return false
	if a["id"] == "queen:call":
		return _flock_alive(m) <= int(QN["call"]["most"]) - 2
	return true


func forced(m) -> int:
	if home_for_good() or m.life > last_of(m):
		return -1
	# (at the last of her life: home, unless she is on her perch already)
	var p = _perch(m)
	if p == null or m.world.distance_to(Vector2(p["x"], p["y"])) < 0.2:
		a1["home"] = 1
		return -1
	return HOME


func start(m, a: Dictionary, _hero) -> void:
	# (her attack, her family's: the vulture's; game.ts atkSound, a boss's at 0.9)
	m.mgr.voice("atkVulture", 0.25, linear_to_db(0.9))
	if a["id"] in ["queen:dive", "queen:gust", "queen:home", "queen:eclipse"]:
		sound(m, "boss_roar", 0.4)
	# (what she will strike marked on the rock, while she acts: queen_marks.gd)
	if a["id"] in ["queen:rake", "queen:gust", "queen:dive", "queen:home"]:
		peril(m, "queen:marks", m.world, {"dur": 1e9, "act": act})


func end(_m, a: Dictionary, _hero) -> void:
	# (QUEEN_ROAM: a move made, she is soon off to another spot; home, she stays)
	if a["id"] == "queen:home":
		a1["home"] = 1
	elif not home_for_good() and randf() < float(ROAM["after"]):
		a1["roamT"] = minf(float(a1.get("roamT", 0.3)), 0.3)


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	match str(a["id"]):
		"queen:rake":
			if not crossed(t0, t1, a["hit"]):
				return
			var r := rel(m, hero)
			if rake_strikes(r.x, r.y):
				blow(m, hero, a["dmg"])
				knock(hero, m.world, 0.5)
			hero.kick(3.0)
			sound(m, "swing", 0.8)
		"queen:gust":
			if crossed(t0, t1, a["hit"]):
				sound(m, "gust", 1.0)
				hero.kick(3.0)
				var r := rel(m, hero)
				if gust_strikes(r.x, r.y):
					blow(m, hero, a["dmg"])
					if open_to(hero):
						# (shoved straight away from her: harder the nearer she is)
						act["b"] = 1
						act["a"] = gust_shove(maxf(0.0, r.x))
						var d: Vector2 = hero.world - m.world
						var u := d / d.length() if d.length() > 0.0 else Vector2(1, 0)
						a1["gx"] = u.x
						a1["gy"] = u.y
			var G := GUST
			if int(act.get("b", 0)) == 1 and t1 > float(a["hit"]) and t0 < float(a["hit"]) + float(G["pushFor"]) and hero.alive:
				var span := minf(t1, float(a["hit"]) + float(G["pushFor"])) - maxf(t0, float(a["hit"]))
				var step := float(act["a"]) * span / float(G["pushFor"])
				# (never nearer the drop than he was: his “Yes, no drop-pushes (Recommended)”, 31 Oct)
				var x0: Vector2 = hero.world
				var was := from_drop(m, x0)
				hero._slide(Vector2(a1["gx"], a1["gy"]) * step)
				if was < 4.0 and from_drop(m, hero.world) < was - 1e-6:
					hero.world = x0
					act["b"] = 0
		"queen:dive", "queen:home":
			# (her flight home: up out of sight, set down over her perch, turned as it faces, then the dive)
			if a["id"] == "queen:home" and crossed(t0, t1, (float(DIVE["up"][0]) + float(DIVE["up"][1])) / 2.0):
				var p = _perch(m)
				if p != null:
					m.world = Vector2(p["x"], p["y"])
					m.face = Vector2(p["fx"], p["fy"])
					a1["hx"] = m.world.x
					a1["hy"] = m.world.y
					a1["views"] = int(p["views"])
				a1["homing"] = 1
			if not crossed(t0, t1, a["hit"]):
				return
			var r := rel(m, hero)
			if dive_strikes(r.x, r.y):
				blow(m, hero, a["dmg"])
				knock(hero, m.world + m.face * float(DIVE["at"]), 1.0)
			# (the rock bursts where she strikes: its own, the floor's, while she rips free and beats home)
			peril(m, "queen:burst", m.world, {"dur": maxf(DIVE["dust"], DIVE["crater"]) + 0.2, "b": atan2(m.face.y, m.face.x)})
			hero.kick(DIVE["shake"])
			sound(m, "slam", 1.0)
		"queen:eclipse":
			# (her Eclipse, from her first scream: the dark round where she stands)
			if crossed(t0, t1, 1e-4):
				var E := ECLIPSE
				peril(m, "queen:eclipse", m.world, {"dur": float(E["hit"]) + float(E["dark"]) + float(E["back"]), "b": randi_range(0, 999), "c": float(E["hit"]) + float(E["first"]), "dmg": m._roll() * float(a["dmg"]), "a": m.id})
			if crossed(t0, t1, a["hit"]):
				sound(m, "boss_roar", 0.9)
				hero.kick(3.0)
		"queen:call":
			var C: Dictionary = QN["call"]
			if crossed(t0, t1, C["screech"]):
				sound(m, "boss_roar", 0.8)
				if m.mgr.loot != null:
					m.mgr.loot.say("%s calls her flock" % m.title, FOE)
			if crossed(t0, t1, C["at"]):
				_call(m, hero)


## SHE GOES OVER THE EDGE: her death is painted falling backward, so it is shown the way round of her picture whose back is to the
## drop (the one she is shown already if it is; else the nearest of those to it: she turns her back to the drop as she dies).
func died(m) -> void:
	var views := int(a1.get("views", 0))
	var cur := view_index(m.face)
	if views != 0 and (views & (1 << cur)) == 0:
		var ang := atan2(m.face.y, m.face.x)
		var best := cur
		var bd := INF
		for i in 4:
			if (views & (1 << i)) == 0:
				continue
			var d := fmod(absf(atan2(VIEWS[i].y, VIEWS[i].x) - ang), TAU)
			if d > PI:
				d = TAU - d
			if d < bd:
				bd = d
				best = i
		m.face = VIEWS[best]
	# (her fall, where she went over: queen_marks.gd plays her death there)
	var v: Vector2 = VIEWS[view_index(m.face)]
	peril(m, "queen:fall", m.world, {"fx": v.x, "fy": v.y, "dur": QN["fall"]})


## (reachable: up out of sight in her dive, nothing reaches her; nor in her dive home)
func reachable(_m) -> bool:
	if act == null:
		return true
	var id: String = ACTS[act["i"]]["id"]
	var t: float = act["t"]
	return not ((id == "queen:dive" or id == "queen:home") and t >= float(DIVE["up"][0]) and t < float(DIVE["up"][1]))


## Her death is her fall (queen_marks.gd): nothing of her lies on the eyrie after, for she has gone down the drop.
func shown(m) -> Dictionary:
	return {"hide": true} if m.dead else {}


# --- her sums (art/carrion_queen_action_fx.ts) ---

static func rake_half(fwd: float) -> float:
	return float(RAKE["half"]) + float(RAKE["spread"]) * fwd


static func rake_strikes(fwd: float, left: float) -> bool:
	return fwd >= float(RAKE["from"]) and fwd <= float(RAKE["to"]) and absf(left) <= rake_half(fwd)


static func gust_strikes(fwd: float, left: float) -> bool:
	return fwd > -0.3 and fwd <= float(GUST["far"]) and absf(left) <= float(GUST["wide"]) + float(GUST["spread"]) * maxf(0.0, fwd)


static func gust_shove(fwd: float) -> float:
	return maxf(float(GUST["least"]), float(GUST["push"]) * (1.0 - maxf(0.0, fwd) / (float(GUST["far"]) + 2.0)))


static func dive_strikes(fwd: float, left: float) -> bool:
	return Vector2(fwd - float(DIVE["at"]), left).length() <= float(DIVE["r"]) or (fwd >= float(DIVE["line"]) and fwd <= float(DIVE["at"]) and absf(left) <= float(DIVE["half"]))


## fromDrop: how far a floor point is from the eyrie's open ground's edge (tiles, as far as `far`: further counts as `far`).
static func from_drop(m, at: Vector2, far := 4.0) -> float:
	var d := 0.25
	while d <= far:
		for k in 16:
			var ang := float(k) / 16.0 * TAU
			if not is_open(m, at + Vector2(cos(ang), sin(ang)) * d):
				return d
		d += 0.25
	return far


## eclipseNow: her Eclipse now on her floor, if one is.
static func eclipse_now(P):
	if P == null:
		return null
	for p in P.list:
		if p["kind"] == "a1" and p["a1"] == "queen:eclipse":
			return p
	return null


## The pools of her Eclipse round where she stood, `p.t` seconds into it (poolsAt(t, 8.5, 10, seed), moved to where she stood):
## gaps in her flock, each drifting across her eyrie along its own long loop; opening as the dark falls, closing as the light comes.
static func pools_of(p: Dictionary) -> Array:
	var E := ECLIPSE
	var t: float = p["t"]
	var rx := 8.5
	var ry := 10.0
	if t < float(E["hit"]) + float(E["fall"]) * 0.5 or t > float(E["hit"]) + float(E["dark"]):
		return []
	var s := t - float(E["hit"])
	var open := clamp01((s - float(E["fall"]) * 0.5) / 0.3) * (1.0 - clamp01((s - float(E["dark"]) + 0.25) / 0.25))
	var out: Array = []
	for i in int(E["pools"]):
		var ph := float(i) / float(E["pools"]) * TAU + float(p["b"])
		var ang := ph + s * float(E["drift"]) / (0.55 * (rx + ry) * 0.5)
		out.append({"x": float(p["x"]) + cos(ang) * rx * 0.55, "y": float(p["y"]) + sin(ang) * ry * 0.55, "r": float(E["r"]) * (0.85 + 0.15 * open), "k": open})
	return out


## inPool: whether a floor point is in a pool of light.
static func in_pool(pools: Array, at: Vector2, give := 0.0) -> bool:
	for q in pools:
		if float(q["k"]) > 0.5 and at.distance_to(Vector2(q["x"], q["y"])) <= float(q["r"]) - give:
			return true
	return false


## eclipseDark: how dark the ledge is `t` seconds into her Eclipse (0: as lit as ever; 1: the dark).
static func eclipse_dark(t: float) -> float:
	var E := ECLIPSE
	var h0: float = E["hold"]
	var hit: float = E["hit"]
	if t < h0:
		return 0.0
	if t < hit:
		return (1.0 - float(E["dim"])) * clamp01((t - h0) / (hit - h0))
	if t < hit + float(E["fall"]):
		return maxf(1.0 - float(E["dim"]), clamp01((t - hit) / float(E["fall"])))
	if t < hit + float(E["dark"]):
		return 1.0
	return 1.0 - clamp01((t - hit - float(E["dark"])) / float(E["back"]))


# --- her flock ---

## Her flock's own numbers, as a plain one of the Ledge Road's vultures has them (game.ts spawn, at this depth): kept from the first
## of them she finds on her floor.
func _keep_flock(m) -> void:
	for o in m.mgr.list:
		if is_instance_valid(o) and o.kind == "vulture" and o.words.is_empty() and o.rarity == "" and not o.elite and not o.boss:
			a1["flock"] = {"r": o.r, "life": o.max_life, "dmgMin": o.dmg_min, "dmgMax": o.dmg_max, "speed": o.speed}
			return
	var d: Dictionary = m.mgr._defs.get("vulture", {})
	a1["flock"] = {"r": float(d.get("radius", 0.3)), "life": float(d.get("life", 12)), "dmgMin": float(d.get("dmgMin", 5)), "dmgMax": float(d.get("dmgMax", 8)), "speed": float(d.get("speed", 3))}


## How many of her flock she has called that are alive.
func _flock_alive(m) -> int:
	var n := 0
	for o in m.mgr.list:
		if is_instance_valid(o) and not o.dead and o != m and o.pack_id == m.pack_id and o.kind == "vulture":
			n += 1
	return n


## HER CALL: her flock comes down round her, out of the sky, never more than a few of it alive; spread round her, each as far from
## the others, and from the hero, as may be (game.ts spotsRound, spawn).
func _call(m, hero) -> void:
	var C: Dictionary = QN["call"]
	var n := maxi(0, mini(int(C["n"]), int(C["most"]) - _flock_alive(m)))
	if n == 0:
		return
	var h: Vector2 = hero.world
	var spots: Array = []
	for s in _spots_round(m, m.world, 40):
		var dm: float = s.distance_to(m.world)
		if dm >= 1.5 and dm <= 5.0 and s.distance_to(h) >= 2.5:
			spots.append(s)
	var put: Array = []
	var F: Dictionary = a1["flock"] if a1.has("flock") else {}
	if F.is_empty():
		_keep_flock(m)
		F = a1["flock"]
	var mgr = m.mgr
	for i in n:
		if spots.is_empty():
			break
		var bi := 0
		var bd := -1.0
		for j in spots.size():
			var d: float = spots[j].distance_to(h) * 0.5
			for q in put:
				d = minf(d, spots[j].distance_to(q))
			if d > bd:
				bd = d
				bi = j
		var s: Vector2 = spots[bi]
		spots.remove_at(bi)
		put.append(s)
		var to: Vector2 = h - s
		var u := to / to.length() if to.length() > 0.0 else Vector2(1, 0)
		# (monster.gd is loaded here, not preloaded: it preloads the scripts of floors 6 to 8)
		var b = load("res://scripts/monster.gd").new()
		b.mgr = mgr
		var fig = mgr._figures.get("vulture")
		if fig == null:
			fig = load("res://scripts/baked_figure.gd").new(mgr._figures_dir, "vulture", mgr._info)
			mgr._figures["vulture"] = fig
		b.setup({"kind": "vulture", "x": s.x, "y": s.y, "fx": u.x, "fy": u.y, "r": F["r"], "life": F["life"], "maxLife": F["life"], "dmgMin": F["dmgMin"],
			"dmgMax": F["dmgMax"], "speed": F["speed"], "packId": m.pack_id, "boss": false, "champion": false, "xp": 0, "words": [], "half": [], "carries": []}, mgr._defs["vulture"], fig)
		b.state = "chase"
		b._cd = 0.6 + 0.2 * i
		mgr.stands.add_child(b)
		mgr.list.append(b)


## spotsRound (game/nav.ts scatter): `n` floor tiles' middles round a point, the nearest first and the rest a random choice of
## those nearest it, flooded out over the walk grid by side steps.
static func _spots_round(m, at: Vector2, n: int) -> Array:
	var map = m.mgr.map
	var W: int = map.w
	var cx := clampi(floori(at.x), 0, W - 1)
	var cy := clampi(floori(at.y), 0, int(map.h) - 1)
	var pool := n + ceili(n * 0.6) + 2
	var cap := pool * 2 + 8
	var queue: Array = [cy * W + cx]
	var seen := {queue[0]: true}
	var head := 0
	while head < queue.size() and queue.size() < cap:
		var i: int = queue[head]
		head += 1
		var ix: int = i % W
		var iy: int = i / W
		for q in [[ix - 1, iy], [ix + 1, iy], [ix, iy - 1], [ix, iy + 1]]:
			if map.walkable(q[0], q[1]) and not seen.has(q[1] * W + q[0]):
				seen[q[1] * W + q[0]] = true
				queue.append(q[1] * W + q[0])
	var d2 := func(i: int) -> float: return Vector2(i % W + 0.5, i / W + 0.5).distance_squared_to(at)
	queue.sort_custom(func(a, b): return d2.call(a) < d2.call(b) or (d2.call(a) == d2.call(b) and a < b))
	if queue.size() > pool:
		queue.resize(pool)
	if queue.is_empty():
		return []
	var rest: Array = queue.slice(1)
	rest.shuffle()
	var chosen: Array = [queue[0]] + rest.slice(0, n - 1)
	chosen.sort_custom(func(a, b): return d2.call(a) < d2.call(b) or (d2.call(a) == d2.call(b) and a < b))
	var out: Array = []
	for i in chosen:
		out.append(Vector2(i % W + 0.5, i / W + 0.5))
	return out


## (QUEEN_ROAM) Another spot of her eyrie to hop to: `near` to `far` from the hero, `apart` to `hop` from where she is, clear round
## her, in sight of him; null: none.
func _roam_spot(m, hero):
	var g := BG.of(m.mgr.map.depth)
	if not g.has("area"):
		return null
	var A: Dictionary = g["area"]
	var RR := maxf(float(A["rx"]), float(A["ry"])) * 1.2 + 2.0
	var h: Vector2 = hero.world
	var options: Array = []
	var y := float(A["y"]) - RR
	while y <= float(A["y"]) + RR:
		var x := float(A["x"]) - RR
		while x <= float(A["x"]) + RR:
			var p := Vector2(x, y)
			var dh := p.distance_to(h)
			var dm: float = p.distance_to(m.world)
			if dh >= float(ROAM["near"]) and dh <= float(ROAM["far"]) and dm >= float(ROAM["apart"]) and dm <= float(ROAM["hop"]) and _clear_round(m, p, 0.8) and m.mgr.sees(p, h):
				options.append(p)
			x += 0.5
		y += 0.5
	return null if options.is_empty() else options[randi() % options.size()]


static func _clear_round(m, p: Vector2, r: float) -> bool:
	for o in [Vector2(0, 0), Vector2(r, 0), Vector2(-r, 0), Vector2(0, r), Vector2(0, -r), Vector2(r * 0.7, r * 0.7), Vector2(-r * 0.7, r * 0.7), Vector2(r * 0.7, -r * 0.7), Vector2(-r * 0.7, -r * 0.7)]:
		if not m.mgr.map.walkable(floori(p.x + o.x), floori(p.y + o.y)):
			return false
	return true
