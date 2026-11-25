## FLOOR 19'S BOSS: THE KING (the Throne Hall), as the game fights him (game/act1_rules/gking.ts; art/king.ts, king_moves.ts,
## king_fx.ts; render/act1_fx/gking.ts). His pick for how he moves, “Slow and heavy, huge reach (Recommended)”, and “Yes, that's the
## King (Recommended)”; his word of 31 Oct 2026 on the fight: the charge, “The crown's weight”, and of the Hush at his side, “Grab and
## drag (Recommended),Shields the King,Grey fog”. His doc: "the king is dying. The Hush sits on his chest wearing his crown, holding
## his sword, and the faces of everything he ever did look out at him from the bed curtains (as Death does in "The Nightingale"). His
## clockwork songbird lies broken on the floor."
##   HE WALKS a tile a second, slow and heavy, his sword dragged. Every blow but the charge is laid square to the way his picture faces.
##   THE CHARGE (his basic, 2.7 s, within 10): the lane he will run marked (to 0.8 s); he runs it at 12 tiles a second for 0.75 s, his
##     full 9 tiles (only a wall stops him): whoever he runs into struck, once. His blade cuts A LINE OF SPARKS 1.75 tiles behind him
##     the whole way; 0.6 s after he stops its sparks shoot off it, and as they pop (0.28 to 0.4 s on) whoever is within 2.6 tiles of
##     the line is struck, once (x0.7).
##   THE DECREE (every 15 s, the first after 8; the sword driven in at 1.33 s): three lines of his knights rise at the wall behind him
##     and march across the hall at 2.4 tiles a second, a knight every 1.25 tiles across it, two gaps in each line; a knight who walks
##     into him strikes him (x0.8, once a second at most).
##   THE CROWN'S WEIGHT (every 11 s, the first after 4; 5.6 s): his crown sent up at 1.1 s, flown out over him, following him at 3.2
##     tiles a second for 2.4 s, stopped and trembling (0.53 s), slammed down: whoever is within 1.7 of it struck, x1.4; it lies a
##     moment and flies home.
##   THE CURTAINS (every 13 s, the first after 11; from 3 tiles to 16): the faces of his deeds stream out of three hangings behind him
##     at where the hero stood as his hand was flung, 11 tiles a second; a face through him strikes him (x0.3, no oftener than 0.3 s,
##     four at most).
##   HIS LAST PHASE, at a third of his life: the Hush climbs off him (2.6 s; nothing hurts him the while), and stands at his side, with
##     three moves of its own, one at a time, a breath between: GRAB AND DRAG (its arms shoot out 8 tiles; caught, he is dragged back
##     before the King, x0.3), SHIELD (wrapped round the King: nothing hurts him, its six blows strike it off, six seconds at most),
##     GREY FOG (three patches on and either side of him: in one he goes at a little over half his pace; they lie seven seconds).
##     His waits are shorter each phase (x0.85, x0.7).
##   HIS DEATH: the Hush unwinds into nothing; the clockwork songbird before his throne winds itself up and sings.
## What his blows leave and send, and the Hush and the bird: act3/gk_marks.gd.
extends "res://scripts/act3/hc.gd"

const TILE3 := 39.191835884530846
## (KING_TUNE.charge: its warning, how long he runs and how fast, how far; how near he must pass; the line of sparks: how far
## behind him, how long after he stops it bursts, when after that its pops strike and how near the line, its share of his blow)
const CHARGE := {"warn": 0.8, "run": 0.75, "pace": 12.0, "most": 9.0, "hit": 1.1, "tail": 1.75, "burst": 0.6, "pop": [0.28, 0.4], "line": 2.6, "sparks": 0.7, "long": 2.7, "fx_long": 1.0}
const DECREE := {"fwd": 0.55, "side": 0.85, "dmg": 0.8}
## (DECREE_FX: how many lines, how far apart, a knight every, their pace, rising, fading, where they rise and fade at most, the march)
const DECREE_FX := {"lines": 3, "apart": 3.2, "every": 1.25, "pace": 2.4, "rise": 0.5, "fade": 0.5, "from": -9.0, "to": 10.0, "frames": 12, "fps": 20.0, "half": 9.5}
const DECREE_GAPS := [[-5.0, 3.75], [-1.25, 6.25], [-7.5, 1.25]]
## (KG_WEIGHT; WEIGHT_FX, its moments from its sending)
const WEIGHT := {"send": 1.1, "long": 5.6, "pace": 3.2, "r": 1.7}
const WEIGHT_FX := {"fly": 0.45, "hold": 2.4, "drop": [2.933333333333333, 2.9999999999999996], "home": [3.4, 4.1], "long": 4.1}
## (KING_TUNE.faces; CURTAINS_FX)
const FACES := {"hit": 0.6, "dmg": 0.3, "gap": 0.3, "most": 4}
const CURTAINS_FX := {"every": 0.09, "long": 1.5, "pace": 11.0, "z": 28.0, "from": [[-8.0, -6.5], [-9.0, 0.0], [-8.0, 6.5]], "reach": 13.0}
const FACES_LONG := 1.5 + (13.0 * 1.6) / 11.0 + 0.3
const CLIMB_AT := 1.0 / 3.0
const CD := [1.0, 0.85, 0.7]
## (KING_TUNE.hush: where it stands at his side, its lengths behind him and to his left; its moves)
const HUSH := {"fwd": -8.0 / 39.191835884530846, "left": 50.0 / 39.191835884530846, "breath": 1.5}
const GRAB := {"warn": 0.6, "reach": 8.0, "pace": 16.0, "catch": 0.9, "drag": 9.0, "dmg": 0.3, "back": 0.4, "cd": 7.0, "near": 3.5}
const SHIELD := {"wrap": 0.5, "most": 6.0, "hits": 6, "dazed": 1.5, "cd": 14.0}
const FOG := {"warn": 0.8, "apart": 2.5, "r": 1.7, "lies": 7.0, "slow": 0.45, "cd": 9.0}
## (HUSH_MOVE: the Hush's moves, as its mark has them, `b`)
const STAND := 0
const GRABS := 1
const SHIELDS := 2
const FOGS := 3
## (BIRD: winding itself up, then each round of its song)
const BIRD := {"wind": 1.8, "song": 1.2}

const GAIT := {"pace": 1.0, "cycle": 18.0 / 10.0 / 2.0, "setOff": 0.0, "halt": 0.0, "stopAt": 2.6, "slack": 0.6, "trueBack": true}
const ACTS := [
	{"id": "gking:charge", "clip": "attack", "long": 2.7, "hit": 0.8, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.9, "near": 0.0, "far": 10.0},
	{"id": "gking:decree", "clip": "decree", "long": 2.8, "hit": 1.3333333333333333, "dmg": 0.8, "cooldown": 15.0, "first": 8.0, "after": 0.5, "near": 0.0, "far": 30.0},
	{"id": "gking:weight", "clip": "weight", "long": 5.6, "hit": 1.1, "dmg": 1.4, "cooldown": 11.0, "first": 4.0, "after": 0.5, "near": 0.0, "far": 14.0},
	{"id": "gking:curtains", "clip": "curtains", "long": 2.5, "hit": 1.1, "dmg": 0.3, "cooldown": 13.0, "first": 11.0, "after": 0.5, "near": 3.0, "far": 16.0},
	{"id": "gking:climb", "clip": "climbOff", "long": 2.6, "hit": 2.1, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 999.0, "forced": true},
]
const CLIMB_I := 4


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func _id() -> String:
	return str(ACTS[act["i"]]["id"]) if act != null else ""


## His phase: 0 above two thirds of his life, 1 above a third, 2 below.
static func phase_of(m) -> int:
	var f: float = m.life / maxf(1.0, m.max_life)
	return 0 if f > 2.0 / 3.0 else (1 if f > 1.0 / 3.0 else 2)


## squareOf: the way the floor runs that his picture faces now (one of the four).
static func square_of(f: Vector2) -> Vector2:
	var back := f.x + f.y < -0.2
	var flip := f.x - f.y < 0.0
	if back:
		return Vector2(-1, 0) if flip else Vector2(0, -1)
	return Vector2(0, 1) if flip else Vector2(1, 0)


static func smooth_in(a: float, b: float, t: float) -> float:
	var u := clampf((t - a) / (b - a), 0.0, 1.0)
	return u * u * (3.0 - 2.0 * u)


## armsOut: how far out the Hush's arms are, `t` seconds into its grab.
static func arms_out(t: float) -> float:
	if t < float(GRAB["warn"]):
		return 0.0
	return minf(float(GRAB["reach"]), (t - float(GRAB["warn"])) * float(GRAB["pace"]))


## offLine: how far `p` is from the segment a to b (tiles).
static func off_line(a: Vector2, b: Vector2, p: Vector2) -> float:
	var d := b - a
	var L2 := d.length_squared()
	var u := clampf((p - a).dot(d) / L2, 0.0, 1.0) if L2 > 1e-9 else 0.0
	return (a + d * u).distance_to(p)


## openFor: how far the floor runs from `at` along `f` before a wall, at most `most`.
static func open_for(m, at: Vector2, f: Vector2, most: float) -> float:
	var d := 0.5
	while d < most:
		if not is_open(m, at + f * d):
			break
		d += 0.25
	return minf(most, d)


## stepOver: from `p` toward `to` by at most `step` over open floor: [where it got to, whether a wall stopped it].
static func step_over(m, p: Vector2, to: Vector2, step: float) -> Array:
	var d := p.distance_to(to)
	if d < 1e-6 or step <= 0.0:
		return [p, false]
	var go := minf(step, d)
	var n := maxi(1, ceili(go / 0.1))
	var u := (to - p) / d
	var c := p
	for i in range(1, n + 1):
		var q := p + u * (go * i / n)
		if not is_open(m, q):
			return [c, true]
		c = q
	return [c, false]


## decreeKnights: the knights of his Decree `t` seconds after his blow, each line rising at `from` and fading at `to` (tiles before
## him), `half` either side: where each is (tiles forward and to his left), how risen, how whole, its march's step.
static func decree_knights(t: float, from: float, to: float, half: float = DECREE_FX["half"]) -> Array:
	var out: Array = []
	var pace: float = DECREE_FX["pace"]
	var every: float = DECREE_FX["every"]
	for l in int(DECREE_FX["lines"]):
		var tt := t - l * (float(DECREE_FX["apart"]) / pace)
		if tt < 0.0:
			continue
		var x := from + pace * maxf(0.0, tt - float(DECREE_FX["rise"]) * 0.5)
		var long := (to - from) / pace
		if tt > long + float(DECREE_FX["fade"]):
			continue
		var up := smooth_in(0.0, DECREE_FX["rise"], tt)
		var whole := 1.0 - smooth_in(long, long + float(DECREE_FX["fade"]), tt)
		var y := -half
		while y <= half + 1e-6:
			var gap := false
			for g in DECREE_GAPS[l % DECREE_GAPS.size()]:
				if absf(y - float(g)) < every * 0.9:
					gap = true
			if not gap:
				out.append({"x": x, "y": y, "up": up, "whole": whole, "step": tt * float(DECREE_FX["fps"]) + fmod(y * 3.1, 1.0)})
			y += every
	return out


## How long the Decree's lines last (seconds from his blow).
static func decree_long(from: float, to: float) -> float:
	return (int(DECREE_FX["lines"]) - 1) * (float(DECREE_FX["apart"]) / float(DECREE_FX["pace"])) + (to - from) / float(DECREE_FX["pace"]) + float(DECREE_FX["fade"]) + 0.2


## curtainFaces: each face let go `t` seconds after his hand is flung at `at` (his own lengths' tiles: forward, to his left): where it
## is (his lengths), which face, how far through its flight.
static func curtain_faces(t: float, at: Vector2) -> Array:
	var out: Array = []
	var T := TILE3
	var pace: float = CURTAINS_FX["pace"]
	var z: float = CURTAINS_FX["z"]
	var si := 0
	for fr in CURTAINS_FX["from"]:
		var a := Vector3(float(fr[0]) * T, float(fr[1]) * T, z + 14.0)
		var b := Vector3(at.x * T, at.y * T, z)
		var dir := (b - a).normalized()
		var flight := (float(CURTAINS_FX["reach"]) * T + Vector2(b.x - a.x, b.y - a.y).length() * 0.6) / (pace * T)
		var side := Vector3(-dir.y, dir.x, 0.0)
		side = side.normalized() if side.length() > 1e-9 else Vector3(0, 1, 0)
		var i := 0
		while i * float(CURTAINS_FX["every"]) < float(CURTAINS_FX["long"]):
			var tt := t - i * float(CURTAINS_FX["every"]) - si * 0.04
			if tt >= 0.0 and tt <= flight:
				var d := pace * T * tt
				var weave := sin(tt * 9.0 + i * 1.3 + si) * 6.0
				var p := a + dir * d + side * weave + Vector3(0, 0, -minf(14.0, d * 0.12) + sin(tt * 7.0 + i) * 2.0)
				out.append({"p": p, "kind": (i * 3 + si) % 4, "k": tt / flight})
			i += 1
		si += 1
	return out


## The faces of the Curtains now, on the floor: where each is, its height (his lengths), which, how far through its flight.
static func faces_now(p: Dictionary) -> Array:
	var out: Array = []
	var at := Vector2(p["x"], p["y"])
	var f := Vector2(p["fx"], p["fy"])
	for q in curtain_faces(p["t"], Vector2(p["a"], p["b"])):
		var v: Vector3 = q["p"]
		out.append({"w": beside(at, f, int(p["hand"]), v.x / TILE3, v.y / TILE3), "z": v.z, "kind": q["kind"], "k": q["k"]})
	return out


## Where the Hush stands at his side.
static func hush_spot(m) -> Vector2:
	return beside(m.world, m.face, hand_of(true, m.face), HUSH["fwd"], HUSH["left"])


## His charge's line of sparks: from behind where he set off to behind where he is or stopped, along the way he ran.
static func sparks_line(p: Dictionary) -> Array:
	var f := Vector2(p["fx"], p["fy"])
	var t: float = CHARGE["tail"]
	return [Vector2(p["x"], p["y"]) - f * t, Vector2(p["a"], p["b"]) - f * t]


## He has stopped (or his charge is cut short): its sparks shoot off 0.6 s on, and the picture lies a second after.
static func stop_sparks(p: Dictionary) -> void:
	p["d"] = maxf(1e-3, float(p["t"]))
	p["dur"] = float(p["d"]) + float(CHARGE["burst"]) + float(CHARGE["fx_long"]) + 0.1


## One of his marks of this name (made by him), or an empty one.
static func mark_of(m, name: String) -> Dictionary:
	if m.mgr == null or m.mgr.perils == null:
		return {}
	for p in m.mgr.perils.list:
		if str(p.get("a1", "")) == name and p.get("src") == m:
			return p
	return {}


## Whether the Hush is wrapped round him now, shielding him (blows on him land on it).
func shielding(m) -> bool:
	var p := mark_of(m, "gking:hush")
	return not p.is_empty() and float(p["c"]) == 0.0 and int(p["b"]) == SHIELDS and float(p["d"]) >= float(SHIELD["wrap"])


# --- his rules ---

## (nothing hurts him while the Hush climbs off him: monster.gd "Invulnerable")
func invulnerable(_m) -> bool:
	return _id() == "gking:climb"


## (the Hush wrapped round him takes the blow: struck off at the sixth; monster.gd "Shielded")
func absorbs(m) -> bool:
	if not shielding(m):
		return false
	a1["hits"] = int(a1.get("hits", 0)) + 1
	return true


func forced(m) -> int:
	# (his last phase: the Hush climbs off him)
	if int(m.form) == 0 and m.life <= m.max_life * CLIMB_AT:
		return CLIMB_I
	return -1


func tick(m, dt: float, _dist: float, hero) -> bool:
	# (the Hush at his side: where it stands, and its moves)
	var p := mark_of(m, "gking:hush")
	if not p.is_empty() and float(p["c"]) == 0.0:
		_hush_step(m, p, dt, hero)
	return false


func start(m, a: Dictionary, _hero) -> void:
	var id := str(a["id"])
	# (his blows square to the way his picture faces; his charge goes straight at the hero)
	if id != "gking:climb" and id != "gking:charge":
		m.face = square_of(m.face)
	if id == "gking:charge":
		# (the lane he will run: from him through where the hero stands, his full length on; only a wall stops him)
		act["a"] = maxf(0.5, minf(CHARGE["most"], open_for(m, m.world, m.face, float(CHARGE["most"]) + 0.5) - 0.4))
		act["b"] = 0.0
		a1["struck"] = 0
		a1["stopped"] = 0
		sound(m, "slam", 0.25)
		warn(m, "gking:charge", 0.0, CHARGE["warn"], [[0.4, maxf(0.6, float(act["a"])), -0.65, 0.65]], [])
	elif id == "gking:decree":
		sound(m, "slam", 0.25)


func end(m, a: Dictionary, _hero) -> void:
	var id := str(a["id"])
	if id == "gking:climb":
		# (his last phase: the King alone, the Hush standing at his side)
		m.form = 1
		m.mgr.look_to(m, "gking_1")
		peril(m, "gking:hush", hush_spot(m), {"dur": 1e9, "b": STAND, "hfig": m.mgr.figure_of("gking_2")})
		a1["hNext"] = 2.0
		return
	if id == "gking:charge":
		# (cut short: the line of sparks still bursts)
		var sp := _sparks_running(m)
		if not sp.is_empty():
			stop_sparks(sp)
	# (his waits shorter each phase)
	var i := ACTS.find(a)
	if float(a["cooldown"]) > 0.0 and i >= 0 and i < cds.size():
		cds[i] = float(cds[i]) * float(CD[phase_of(m)])


func _sparks_running(m) -> Dictionary:
	for p in m.mgr.perils.list:
		if str(p.get("a1", "")) == "gking:sparks" and p.get("src") == m and float(p["d"]) == 0.0:
			return p
	return {}


func died(m) -> void:
	var hero = m.mgr.hero
	# (the Hush unwinds into nothing; nothing of it holds him now)
	var h := mark_of(m, "gking:hush")
	if not h.is_empty():
		h["c"] = 1.0
		h["t"] = 0.0
		h["dur"] = 3.2
		h["b"] = STAND
		if int(h["done"]) != 0 and hero != null:
			hero.held = 0.0
	# (his crown, if it hangs over the hero still, falls away harmless; the Hush's fog lifts)
	for p in m.mgr.perils.list:
		var n := str(p.get("a1", ""))
		if n == "gking:weight" or n == "gking:fog":
			p["dur"] = p["t"]
	if hero != null:
		hero._slow_t = 0.0
	# (the clockwork songbird before his throne winds itself up and sings: the broken one gone from the floor)
	var main = m.mgr.main
	var land = main.map.land if main != null and main.map != null else null
	var keep = land.get("keep") if land != null else null
	if keep != null and keep.get("bird") != null:
		var b: Dictionary = keep["bird"]
		if main.look != null and main.look.data.get("variants", {}).has("bird"):
			main.look.show_variant("bird", 1.0)
		peril(m, "gking:bird", Vector2(b["x"], b["y"]), {"dur": 1e9, "fx": 1.0, "fy": 0.0})
		# (THE FLOORS' SCENE SOUNDS: its song, as it has wound itself up and begins to sing, running down)
		# (held by a weak hold: the King gone, and the floor with him, before it sings, nothing is asked of what is gone: the bug hunt's
		# third round found a script error so, leaving floor 19 as he fell)
		var mw: WeakRef = weakref(m.mgr)
		m.mgr.get_tree().create_timer(float(BIRD["wind"])).timeout.connect(func() -> void:
			var g = mw.get_ref()
			if g != null and is_instance_valid(g):
				g.sfx.play("songbird", 0.0))


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var id := str(a["id"])
	if id == "gking:charge":
		var r0: float = CHARGE["warn"]
		var r1: float = float(CHARGE["warn"]) + float(CHARGE["run"])
		if crossed(t0, t1, r0):
			# (he sets off: the line of sparks begins under him)
			sound(m, "swing", 0.9)
			peril(m, "gking:sparks", m.world, {"dur": 99.0, "a": m.world.x, "b": m.world.y, "c": 0.0, "d": 0.0, "dmg": m._roll() * float(CHARGE["sparks"])})
		if t1 > r0 and t0 < r1 and float(act["b"]) < float(act["a"]):
			# (running: as far as his lane, at his pace; whoever he runs into is struck, once)
			var step := minf(float(act["a"]) - float(act["b"]), float(CHARGE["pace"]) * (minf(t1, r1) - maxf(t0, r0)))
			var was: Vector2 = m.world
			var q := step_over(m, m.world, m.world + m.face * step, step)
			act["b"] = float(act["b"]) + (float(act["a"]) if q[1] else was.distance_to(q[0]))
			m.world = q[0]
			var sp := _sparks_running(m)
			if not sp.is_empty():
				sp["a"] = m.world.x
				sp["b"] = m.world.y
			# (checked along the way he came this step: he is fast)
			if int(a1.get("struck", 0)) == 0 and off_line(was, m.world, hero.world) <= float(CHARGE["hit"]) and open_to(hero):
				a1["struck"] = 1
				blow(m, hero, float(a["dmg"]))
		if int(a1.get("stopped", 0)) == 0 and (crossed(t0, t1, r1) or (t1 > r0 and float(act["b"]) >= float(act["a"]))):
			# (he stops: the line bursts a moment after)
			a1["stopped"] = 1
			var sp := _sparks_running(m)
			if not sp.is_empty():
				stop_sparks(sp)
		return
	if id == "gking:decree":
		if not crossed(t0, t1, a["hit"]):
			return
		sound(m, "slam", 0.9)
		hero.kick(4.0)
		# (laid to the hall: they rise at the wall behind him and fade at the wall before him)
		var from := -maxf(2.0, open_for(m, m.world, -m.face, -float(DECREE_FX["from"])) - 0.5)
		var to := maxf(3.0, open_for(m, m.world, m.face, DECREE_FX["to"]) - 0.5)
		peril(m, "gking:decree", m.world, {"a": from, "b": to, "c": -9.0, "dmg": m._roll() * float(a["dmg"]), "dur": decree_long(from, to)})
		return
	if id == "gking:weight":
		if not crossed(t0, t1, a["hit"]):
			return
		# (his crown goes up, and hangs over the hero: from his head, where he stood, out over him)
		sound(m, "echo", 0.6)
		peril(m, "gking:weight", m.world, {"dur": WEIGHT_FX["long"], "a": m.world.x, "b": m.world.y, "c": 0.0, "d": 0.0, "dmg": m._roll() * float(a["dmg"])})
		return
	if id == "gking:curtains":
		if not crossed(t0, t1, a["hit"]):
			return
		sound(m, "echo", 0.7)
		# (at where the hero stands as the hand is flung: in his own lengths, before him and to his left)
		var r := from_figure(m.world, m.face, act["hand"], hero.world)
		peril(m, "gking:faces", m.world, {"dur": FACES_LONG, "a": r.x, "b": r.y, "c": -9.0, "d": 0.0, "dmg": m._roll() * float(a["dmg"])})
		return
	if id == "gking:climb" and crossed(t0, t1, 0.4):
		sound(m, "echo", 0.5)


# --- the Hush at his side ---

## A step of the Hush at his side: where it stands, and its three moves.
func _hush_step(m, p: Dictionary, dt: float, hero) -> void:
	for w in ["cdGrab", "cdShield", "cdFog", "hNext", "dazed"]:
		a1[w] = maxf(0.0, float(a1.get(w, 0.0)) - dt)
	var home := hush_spot(m)
	p["fx"] = m.face.x
	p["fy"] = m.face.y
	var b := int(p["b"])
	if b == STAND:
		p["x"] = home.x
		p["y"] = home.y
		if float(a1["hNext"]) > 0.0 or float(a1["dazed"]) > 0.0 or _id() == "gking:climb":
			return
		var d: float = hero.world.distance_to(m.world)
		var pick := STAND
		if float(a1["cdShield"]) <= 0.0 and m.life < m.max_life:
			pick = SHIELDS
		elif float(a1["cdGrab"]) <= 0.0 and d >= float(GRAB["near"]) and d <= float(GRAB["reach"]) + 1.0:
			pick = GRABS
		elif float(a1["cdFog"]) <= 0.0:
			pick = FOGS
		if pick == STAND:
			return
		p["b"] = pick
		p["d"] = 0.0
		p["done"] = 0
		a1["hits"] = 0
		if pick == GRABS:
			# (its arms rear back at where the hero stands now: that is the line they shoot along)
			p["a"] = atan2(hero.world.y - float(p["y"]), hero.world.x - float(p["x"]))
			sound(m, "gust", 0.4)
		elif pick == FOGS:
			# (where its three patches will fall, marked as it breathes in: on the hero, and either side of him; each lies from the
			# moment it breathes out, its clock below 0 until then)
			p["a"] = atan2(hero.world.y - float(p["y"]), hero.world.x - float(p["x"]))
			var across := Vector2(cos(float(p["a"]) + PI / 2.0), sin(float(p["a"]) + PI / 2.0))
			for s in [0, -1, 1]:
				var at: Vector2 = hero.world + across * float(FOG["apart"]) * s
				if not is_open(m, at):
					continue
				peril(m, "gking:fog", at, {"dur": FOG["lies"], "t": -float(FOG["warn"])})
			sound(m, "gust", 0.3)
		return
	var was: float = p["d"]
	p["d"] = was + dt
	var now: float = p["d"]
	if b == GRABS:
		p["x"] = home.x
		p["y"] = home.y
		var way := Vector2(cos(float(p["a"])), sin(float(p["a"])))
		if int(p["done"]) == 0:
			var out := arms_out(now)
			var at := Vector2(p["x"], p["y"])
			if now >= float(GRAB["warn"]) and off_line(at, at + way * out, hero.world) <= float(GRAB["catch"]) and hero._act != "lunge" and hero.alive:
				# (caught: held, and dragged back to stand before him)
				p["done"] = 1
				a1["caughtAt"] = now
				blow(m, hero, GRAB["dmg"])
				sound(m, "hit", 0.6)
			elif out >= float(GRAB["reach"]) and now >= float(GRAB["warn"]) + float(GRAB["reach"]) / float(GRAB["pace"]) + float(GRAB["back"]):
				_hush_done(p, "cdGrab", GRAB["cd"])
			return
		# (dragging him: before the King, a tile and a half out)
		var to: Vector2 = m.world + m.face * 1.6
		var q := step_over(m, hero.world, to, float(GRAB["drag"]) * dt)
		hero.world = q[0]
		hero.held = maxf(hero.held, 0.1)
		if to.distance_to(hero.world) < 0.15 or q[1] or now - float(a1.get("caughtAt", 0.0)) > 2.0:
			hero.held = 0.0
			_hush_done(p, "cdGrab", GRAB["cd"])
		return
	if b == SHIELDS:
		# (it goes to him, and wraps itself round him)
		var u := clampf(now / float(SHIELD["wrap"]), 0.0, 1.0)
		p["x"] = home.x + (m.world.x - home.x) * u
		p["y"] = home.y + (m.world.y - home.y) * u
		if crossed(was, now, SHIELD["wrap"]):
			sound(m, "gust", 0.5)
		if int(a1.get("hits", 0)) >= int(SHIELD["hits"]):
			# (struck off: back to his side, dazed)
			m._tell({"t": "text", "x": m.world.x, "y": m.world.y, "text": "Struck off", "color": "#ffd27a"})
			sound(m, "hit", 0.8)
			a1["dazed"] = SHIELD["dazed"]
			_hush_done(p, "cdShield", SHIELD["cd"])
			return
		if now >= float(SHIELD["wrap"]) + float(SHIELD["most"]):
			_hush_done(p, "cdShield", SHIELD["cd"])
		return
	if b == FOGS:
		p["x"] = home.x
		p["y"] = home.y
		if crossed(was, now, FOG["warn"]):
			# (it breathes out: its three patches lie)
			sound(m, "gust", 0.6)
			_hush_done(p, "cdFog", FOG["cd"])


func _hush_done(p: Dictionary, cd: String, wait: float) -> void:
	p["b"] = STAND
	p["d"] = 0.0
	p["done"] = 0
	a1[cd] = wait
	a1["hNext"] = HUSH["breath"]
