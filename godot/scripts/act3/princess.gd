## FLOOR 16'S BOSS: THE PRINCESS (the Swan Pavilion), as the game fights her (game/act1_rules/princess.ts; render/act1_fx/princess.ts;
## her look and every move of hers the art chat's, with his yes). His doc: "She never makes a sound." Her moves, his picks: a lash of
## nettle thread; the vine snare ("Vine snare (Recommended)"); the Eleven, her swan brothers diving across the floor in lines; the
## Vow, a ring of silence round her that darkens his words; and her ultimate, the spectral steed (“It’s her ultimate ability so it
## can slot into whatever that might have been.  I want it to last a while and you have to really dodge around a bit to not get
## hit.”). What she lays on the floor and sends over it: act3/pr_marks.gd.
##   HER GAIT: she hovers and glides, four tiles a second; between her moves she darts about the hero, 3.5 to 6 tiles from him, round
##     him by turns to one side and the other, hovering a moment between darts; a hero far off, she glides at him.
##   THE LASH (1.6 s): the wedge it will sweep marked through its warning; at 24/30 s it lashes a quarter turn round her front, 7.5
##     tiles long: whoever is in that wedge is struck.
##   THE VINE SNARE (1.6 s): where the hero stands as her held hands' warning ends is marked, a ring 5 tiles across; as her hands come
##     down the floor heaves, and a tenth of a second on the thicket bursts up: whoever is inside it struck, x0.4, and HELD IN until it
##     withers (six seconds) or is broken (three blows of his, no more than one in 0.2 s).
##   THE ELEVEN (1.8 s): eleven lines 1.5 tiles apart across her arena, along the floor's way nearest the hero's from her, the middle
##     one through him, marked by falling feathers; at 29/30 s a swan dives along each at 24 tiles a second, the middle first: whoever
##     is on a line as its swan passes is struck, x0.7. In her third phase a second flight, half a gap over, a little after.
##   THE VOW (1.9 s): at 1.0 s a ring of silence bursts out round her, 10 tiles across, held 3 s, going with her: whoever is inside as
##     it bursts struck, x0.8; while it holds, his words are dark while he stands in it, and a moment after.
##   THE SPECTRAL STEED, at the start of her second phase and her third, and in her third again every 35 s: it forms under her (1.4 s),
##     then fifteen leaps of a second each, the first eight a lap of her arena, the last seven at the hero (where he stood as it
##     sprang): whoever is within 1.6 of where its forehooves come down struck; then it fades (1.4 s). While she rides her life is not
##     brought below 1: struck down to it, the steed fades first and she falls after.
##   HER PHASES, by her life (2/3, 1/3): her lash twice in a row from the second; her snare, Eleven and Vow sooner; more swans.
##   HER DEATH: her snare withers, her ring thins, her swans fly off over the wall, and she whispers her one line, “Stop the dancing.”
extends "res://scripts/act3/hc.gd"

const FloorMap := preload("res://scripts/floor_map.gd")

## HER WORDS AS SHE FALLS (his doc's)
const WHISPER := "Stop the dancing."
## (defs.ts MSG.foe)
const FOE := Color("#ff8a3a")

## (PRINCESS: her pictures' own numbers and the rules')
const PACE := 4.0
const LASH := {"long": 1.6, "warn": [0.4, 0.7], "strike": [22.0 / 30.0, 24.0 / 30.0], "hit": 24.0 / 30.0, "from": -45.0, "to": 45.0, "reach": 7.5}
const SNARE := {"long": 1.6, "warn": [0.42, 0.72], "hit": 25.0 / 30.0, "burst": [0.1, 0.1667], "sink": [6.0, 6.6], "r": 2.5, "shake": 0.14, "breaks": 0.9, "life": 3, "gap": 0.2, "inside": 0.35}
const ELEVEN := {"long": 1.8, "warn": [0.5, 0.85], "hit": 29.0 / 30.0, "n": 11, "apart": 1.5, "half": 0.45, "speed": 24.0, "stagger": 0.04, "most": 13.0, "least": 3.0}
const VOW := {"long": 1.9, "warn": [0.55, 0.9], "hit": 1.0, "r": 5.0, "hold": 3.0, "fade": 0.6, "dark": 0.3}
const RIDE := {"form": 1.4, "leap": 1.0, "spring": 0.27, "air": [0.36, 26.0 / 30.0], "hit": 26.0 / 30.0, "end": 1.4, "carry": 4.5, "laps": 8, "at_you": 7, "r": 1.6, "hoof": 0.4, "most": 14.0}
const DIES := {"long": 3.2, "sink": 0.9, "say": 3.2, "lift": 50.0}
const GROUND := {"blob": 1.08, "far": 12.0}
## (PRINCESS_FIGHT)
const FIGHT := {"at": [2.0 / 3.0, 1.0 / 3.0], "swans": [3, 4, 5], "cd": [1.0, 0.8, 0.65], "lashes": [1, 2, 2], "twice": 3, "shift": 0.75, "late": 0.55,
	"near": 3.5, "far": 6.0, "turn": [35.0, 100.0], "hover": [0.08, 0.3], "most": 1.8, "chase": 8.5, "again": 35.0}
const GAIT := {"pace": PACE, "cycle": 1.0 / 20.0, "setOff": 0.0, "halt": 0.0, "stopAt": 4.5, "slack": 1.0, "trueBack": true}
const ACTS := [
	{"id": "princess:lash", "clip": "attack", "long": 1.6, "hit": 24.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.9, "near": 0.0, "far": 6.5},
	{"id": "princess:snare", "clip": "snare", "long": 1.6, "hit": 25.0 / 30.0, "dmg": 0.4, "cooldown": 10.0, "first": 5.0, "after": 0.6, "near": 0.0, "far": 12.0},
	{"id": "princess:eleven", "clip": "eleven", "long": 1.8, "hit": 29.0 / 30.0, "dmg": 0.7, "cooldown": 13.0, "first": 8.0, "after": 0.6, "near": 0.0, "far": 14.0},
	{"id": "princess:vow", "clip": "vow", "long": 1.9, "hit": 1.0, "dmg": 0.8, "cooldown": 17.0, "first": 11.0, "after": 0.6, "near": 0.0, "far": 4.5},
	{"id": "princess:ride", "clip": "rideForm", "long": 1.4, "hit": 1.1, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true},
	{"id": "princess:leap", "clip": "rideLeap", "long": 1.0, "hit": 26.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true},
	{"id": "princess:unride", "clip": "rideEnd", "long": 1.4, "hit": 1.15, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 99.0, "forced": true},
]
const LASH_I := 0
const RIDE_I := 4
const LEAP_I := 5
const UNRIDE_I := 6


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func _id() -> String:
	return str(ACTS[act["i"]]["id"]) if act != null else ""


# --- her ground ---

## Her ground: the open area round where she stood as the floor's map-maker lays it (its blob, 1.08 in), else 12 tiles round, as
## far as it is joined to where she stood; and its middle. {mask, cx, cy, n}
func ground(m) -> Dictionary:
	if a1.has("ground"):
		return a1["ground"]
	var map = m.mgr.map
	var W: int = map.w
	var H: int = map.h
	var hx: float = a1.get("hx", m.world.x)
	var hy: float = a1.get("hy", m.world.y)
	var area = null
	if map.land != null:
		for ar in map.land.get("areas", []):
			if ar.get("role", "") == "boss" and FloorMap.blob_dist(ar["blob"], Vector2(hx, hy)) < 1.2:
				area = ar
				break
	var mask := PackedByteArray()
	mask.resize(W * H)
	var start := floori(hy) * W + floori(hx)
	if map.walk[start] != 1:
		var bd := INF
		for y in range(maxi(0, floori(hy) - 3), mini(H - 1, floori(hy) + 3) + 1):
			for x in range(maxi(0, floori(hx) - 3), mini(W - 1, floori(hx) + 3) + 1):
				var d := Vector2(x + 0.5 - hx, y + 0.5 - hy).length()
				if map.walk[y * W + x] == 1 and d < bd:
					bd = d
					start = y * W + x
	var n := 0
	var sum := Vector2.ZERO
	if map.walk[start] == 1:
		var q: Array[int] = [start]
		mask[start] = 1
		while not q.is_empty():
			var i: int = q.pop_back()
			var x := i % W
			var y := i / W
			n += 1
			sum += Vector2(x + 0.5, y + 0.5)
			for d in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
				var nx: int = x + d.x
				var ny: int = y + d.y
				if nx < 0 or ny < 0 or nx >= W or ny >= H:
					continue
				var j := ny * W + nx
				if mask[j] == 1 or map.walk[j] != 1:
					continue
				var p := Vector2(nx + 0.5, ny + 0.5)
				var inside: bool = FloorMap.blob_dist(area["blob"], p) < float(GROUND["blob"]) if area != null else p.distance_to(Vector2(hx, hy)) <= float(GROUND["far"])
				if not inside:
					continue
				mask[j] = 1
				q.append(j)
	var c := Vector2(float(area["blob"]["x"]), float(area["blob"]["y"])) if area != null else (sum / n if n > 0 else Vector2(hx, hy))
	a1["ground"] = {"mask": mask, "cx": c.x, "cy": c.y, "n": n}
	return a1["ground"]


static func _on_mask(map, mask: PackedByteArray, p: Vector2) -> bool:
	var tx := floori(p.x)
	var ty := floori(p.y)
	return tx >= 0 and ty >= 0 and tx < map.w and ty < map.h and mask[ty * map.w + tx] == 1


## clearWay: whether one `r` round may glide straight from `a` to `b`, and stand there.
static func _clear_way(m, a: Vector2, b: Vector2, r: float) -> bool:
	var d := a.distance_to(b)
	var s := 0.25
	while s < d:
		var p := a + (b - a) * (s / d)
		if not m.mgr.clear(p.x, p.y, r, false):
			return false
		s += 0.25
	return m.mgr.clear(b.x, b.y, r, false)


# --- her phases ---

## Her phase by her life (1, 2 or 3).
static func phase_of(m) -> int:
	var k: float = m.life / maxf(1.0, m.max_life)
	return 1 if k > float(FIGHT["at"][0]) else (2 if k > float(FIGHT["at"][1]) else 3)


## The phase she has come into (the steed brought at each).
func phase_in() -> int:
	return clampi(int(a1.get("ph", 1)), 1, 3)


## How many swans circle her now.
func swans() -> int:
	return int(FIGHT["swans"][phase_in() - 1])


## Is she on her steed (forming, leaping or fading)?
func riding() -> bool:
	return int(a1.get("ri", 0)) == 1


# --- her glide ---

## A spot to dart to: round the hero from where she is, `near` to `far` from him, over floor she may glide across straight.
func _dart_spot(m, hero) -> Variant:
	var h: Vector2 = hero.world
	var gr := ground(m)
	var map = m.mgr.map
	var hero_in := _on_mask(map, gr["mask"], h)
	var d: float = m.world.distance_to(h)
	var a0 := atan2(m.world.y - h.y, m.world.x - h.x)
	# (round him by turns, one side then the other, now and then the same side twice)
	var sd: int = a1.get("sd", 1)
	sd = -sd if randf() < 0.7 else sd
	a1["sd"] = sd
	var r0 := minf(m.r, 0.45)
	for k in 18:
		var a: float
		if d > float(FIGHT["chase"]) and k < 6:
			# (far off: at him, to `far` from him, a little to one side)
			a = a0 + deg_to_rad(randf_range(-25.0, 25.0))
		else:
			var side := -sd if k % 3 == 2 else sd
			a = a0 + side * deg_to_rad(randf_range(FIGHT["turn"][0], FIGHT["turn"][1]))
		var r := randf_range(FIGHT["near"], FIGHT["far"])
		var p := h + Vector2(cos(a), sin(a)) * r
		if p.distance_to(m.world) < 1.2:
			continue
		if hero_in and not _on_mask(map, gr["mask"], p):
			continue
		if not _clear_way(m, m.world, p, r0):
			continue
		return p
	return null


func _hover(m, dt: float, hero) -> bool:
	var to: Vector2 = hero.world - m.world
	if to.length() > 0.01:
		m.face = to.normalized()
	if mode != "stand":
		_to("stand")
	gt += dt
	return true


## HER GLIDE, between her moves: hovering a moment, then darting to a spot round the hero, straight, at her pace; her waits run on.
func _glide(m, dt: float, hero) -> bool:
	for k in cds.size():
		cds[k] -= dt
	m.state = "chase"
	if int(a1.get("gk", 0)) == 0:
		a1["hv"] = float(a1.get("hv", 0.0)) - dt
		if float(a1["hv"]) > 0.0:
			return _hover(m, dt, hero)
		var to = _dart_spot(m, hero)
		if to == null:
			a1["hv"] = 0.25
			return _hover(m, dt, hero)
		a1["gk"] = 1
		a1["gx"] = to.x
		a1["gy"] = to.y
		a1["gt"] = 0.0
	var g := Vector2(a1["gx"], a1["gy"])
	var d: float = m.world.distance_to(g)
	a1["gt"] = float(a1["gt"]) + dt
	if d < 0.1 or float(a1["gt"]) > float(FIGHT["most"]):
		return _stop_glide(m, dt, hero)
	var sp: float = PACE * m.slow()
	m.face = (g - m.world) / d
	var step := minf(d, sp * dt)
	var x0: Vector2 = m.world
	slide(m, m.face * step, 0.45)
	var moved: float = m.world.distance_to(x0)
	# (held up: she hovers, and darts again in a moment)
	if moved < step * 0.2:
		return _stop_glide(m, dt, hero)
	if mode != "walk":
		_to("walk")
	gt += moved / PACE
	return true


func _stop_glide(m, dt: float, hero) -> bool:
	a1["gk"] = 0
	a1["hv"] = randf_range(FIGHT["hover"][0], FIGHT["hover"][1])
	return _hover(m, dt, hero)


func _settle() -> void:
	a1["gk"] = 0
	_to("stand")


## readyAct: which of her moves she would make now (the biggest ready that the hero is in reach of and in her sight), or -1.
func _ready_act(m, dist: float, hero) -> int:
	if m._cd > 0.0 or cds.size() != ACTS.size():
		return -1
	var los: bool = dist < 16.0 and m.mgr.sees(m.world, hero.world)
	for i in range(ACTS.size() - 1, -1, -1):
		var a: Dictionary = ACTS[i]
		if a.get("forced", false) or cds[i] > 0.0 or dist < float(a["near"]) or dist > float(a["far"]) or not los:
			continue
		if not can(m, a, dist, los):
			continue
		return i
	return -1


# --- the lash, the Eleven, the steed ---

## inLash: whether a point is in the lash's wedge from her as it strikes: before her within its reach, 45 degrees to either side.
static func in_lash(at: Vector2, f: Vector2, hand: int, p: Vector2, size := HERO_R * 0.5) -> bool:
	var r := from_figure(at, f, hand, p)
	var d := r.length()
	if d > float(LASH["reach"]) + size:
		return false
	if d <= 0.7:
		return r.x > -0.3
	var bearing := rad_to_deg(atan2(r.y, r.x))
	var slack := rad_to_deg(atan2(size, d))
	return bearing >= float(LASH["from"]) - slack and bearing <= float(LASH["to"]) + slack


## elevenLines: the Eleven's lines through `o`, along `u` (from her side), `shift` across: each as far along as the floor goes to
## `most` either side, the run through the hero's own crossing (or the longest), none shorter than `least`. [{v, u0, u1, go, done}]
static func eleven_lines(map, o: Vector2, u: Vector2, shift := 0.0) -> Array:
	var v := Vector2(-u.y, u.x)
	var out: Array = []
	var n: int = ELEVEN["n"]
	var K := (n - 1) / 2.0
	var most: float = ELEVEN["most"]
	for k in n:
		var off := (k - K) * float(ELEVEN["apart"]) + shift
		var runs: Array = []
		var a := NAN
		var s := -most
		while s <= most + 1e-6:
			var p := o + u * s + v * off
			var tx := floori(p.x)
			var ty := floori(p.y)
			var on: bool = tx >= 0 and ty >= 0 and tx < map.w and ty < map.h and map.tiles[ty * map.w + tx] == FloorMap.FLOOR
			if on and is_nan(a):
				a = s
			if not on and not is_nan(a):
				runs.append([a, s - 0.25])
				a = NAN
			s += 0.25
		if not is_nan(a):
			runs.append([a, most])
		var mine = null
		for r in runs:
			if r[0] <= 0.0 and r[1] >= 0.0:
				mine = r
				break
		if mine == null:
			for r in runs:
				if mine == null or r[1] - r[0] > mine[1] - mine[0]:
					mine = r
		if mine == null or mine[1] - mine[0] < float(ELEVEN["least"]):
			continue
		out.append({"v": off, "u0": mine[0], "u1": mine[1] + 0.25, "go": float(ELEVEN["stagger"]) * absf(k - K), "done": false})
	return out


## swanAt: where the Eleven's swan of line `l` is along it at the mark's clock `t` (NAN: not yet set off, or gone).
static func swan_at(l: Dictionary, t: float) -> float:
	if t < float(l["go"]):
		return NAN
	var u := float(l["u0"]) + float(ELEVEN["speed"]) * (t - float(l["go"]))
	return NAN if u > float(l["u1"]) else u


## Where the ride's lap goes round (her arena's middle) and how far out, for leaps `carry` apart.
func _lap_of(m) -> void:
	var gr := ground(m)
	a1["cx"] = gr["cx"]
	a1["cy"] = gr["cy"]
	a1["lr"] = float(RIDE["carry"]) / (2.0 * sin(PI / float(RIDE["laps"])))
	a1["la"] = atan2(m.world.y - float(gr["cy"]), m.world.x - float(gr["cx"]))
	a1["ld"] = 1 if randf() < 0.5 else -1


## The `k`th point of her lap: round her arena's middle, pulled in toward it where the floor is not open there.
func lap_point(m, k: int) -> Vector2:
	var a: float = float(a1["la"]) + int(a1["ld"]) * k * (TAU / float(RIDE["laps"]))
	var gr := ground(m)
	var c := Vector2(a1["cx"], a1["cy"])
	var r: float = a1["lr"]
	while r >= 1.5:
		var p := c + Vector2(cos(a), sin(a)) * r
		if m.mgr.clear(p.x, p.y, 0.5, false) and (int(gr["n"]) == 0 or _on_mask(m.mgr.map, gr["mask"], p)):
			return p
		r -= 0.25
	return c


## Where a leap at the hero comes down: where he stands, no further than `most`; back along the way to floor she may stand on.
static func leap_at(m, p: Vector2) -> Vector2:
	var d: Vector2 = p - m.world
	if d.length() > float(RIDE["most"]):
		d *= float(RIDE["most"]) / d.length()
	var k := 1.0
	while k >= -1e-6:
		var q: Vector2 = m.world + d * k
		if m.mgr.clear(q.x, q.y, 0.45, false):
			return q
		k -= 0.05
	return m.world


func _face_to(m, p: Vector2) -> void:
	var d: Vector2 = p - m.world
	if d.length() < 0.05:
		return
	m.face = d.normalized()
	if act != null:
		act["hand"] = hand_of(true, m.face)


## Where a leap's forehooves come down: before her landing point.
static func hoof_at(f: Vector2, p: Vector2) -> Vector2:
	return p + f * float(RIDE["hoof"])


## Hers, of a kind, on the floor now (her snare, her Eleven, her Vow).
static func _mine(m, name: String) -> Dictionary:
	for p in m.mgr.perils.list:
		if str(p.get("a1", "")) == name and p.get("src") == m:
			return p
	return {}


## The act the rules bring now (her ultimate's next part; her phase come; her lash's row), or -1.
func _forced_idx(m) -> int:
	if a1.is_empty():
		return -1
	if riding():
		return LEAP_I if int(a1.get("rn", 0)) < int(RIDE["laps"]) + int(RIDE["at_you"]) else UNRIDE_I
	if phase_of(m) > int(a1.get("ph", 1)):
		return RIDE_I
	if phase_in() >= 3 and float(a1.get("re", 0.0)) >= float(FIGHT["again"]):
		return RIDE_I
	if int(a1.get("lq", 0)) == 1:
		var h = m.mgr.hero
		if m.world.distance_to(h.world) <= float(ACTS[0]["far"]) and m.mgr.sees(m.world, h.world):
			return LASH_I
		a1["lq"] = 0
		a1["ln"] = 0
	return -1


# --- her rules ---

func spawned(m) -> void:
	a1 = {"hx": m.world.x, "hy": m.world.y, "ph": 1, "sd": 1, "hv": 0.0, "re": 0.0}
	_swans_round(m)


## Her garden's swans circling her always, from the first (act3/pr_marks.gd princess:swans): laid as she comes into the world, and
## again whenever they are not there (the hero fallen and come back: what was on the floor is cleared).
func _swans_round(m) -> void:
	if m.dead or m.mgr == null or m.mgr.perils == null or not _mine(m, "princess:swans").is_empty():
		return
	peril(m, "princess:swans", m.world, {"dur": 1e9})


## (every frame she is shown, asleep, met or fighting: her swans round her)
func shown(m) -> Dictionary:
	_swans_round(m)
	return {}


func tick(m, dt: float, dist: float, hero) -> bool:
	if a1.is_empty():
		spawned(m)
	_swans_round(m)
	if cds.size() != ACTS.size():
		cds = []
		for a in ACTS:
			cds.append(float(a["first"]) * randf_range(0.7, 1.2))
	# STRUCK DOWN ON HER STEED: it fades first (and she falls after: `end`)
	if riding() and m.life <= 1.0 and int(a1.get("fall", 0)) == 0:
		a1["fall"] = 1
		if _id() != "princess:unride":
			a1.erase("lay")
			act = null
			# (the steed fades where it stands: she faces as she was)
			var f: Vector2 = m.face
			start_act(m, ACTS, UNRIDE_I, hero)
			m.face = f
			act["hand"] = hand_of(true, f)
			return true
	if m.state == "act":
		return false
	if riding():
		return false
	if phase_in() >= 3:
		a1["re"] = float(a1.get("re", 0.0)) + dt
	# (a move the rules bring, or one she is ready to make: she stops gliding at once, and the rules begin it)
	if _forced_idx(m) >= 0 or _ready_act(m, dist, hero) >= 0:
		if int(a1.get("gk", 0)) == 1 or mode != "stand":
			_settle()
		return false
	return _glide(m, dt, hero)


func forced(m) -> int:
	return _forced_idx(m)


func can(m, a: Dictionary, dist: float, _los: bool) -> bool:
	if riding():
		return false
	match str(a["id"]):
		"princess:snare":
			return _mine(m, "princess:snare").is_empty()
		"princess:eleven":
			return _mine(m, "princess:eleven").is_empty()
		"princess:vow":
			return dist <= float(a["far"]) and _mine(m, "princess:vow").is_empty()
	return true


func start(m, a: Dictionary, hero) -> void:
	var ph := phase_in()
	match str(a["id"]):
		"princess:lash":
			# (a row of them begun, or the next of it)
			if int(a1.get("lq", 0)) == 1:
				a1["lq"] = 0
			else:
				a1["ln"] = int(FIGHT["lashes"][ph - 1]) - 1
			sound(m, "swing", 0.25)
			peril(m, "princess:warn", m.world, {"dur": 1e9, "act": act})
		"princess:ride":
			# HER ULTIMATE: her phase come into (it is what brings it), or her third's again
			var now := phase_of(m)
			if now > int(a1.get("ph", 1)):
				a1["ph"] = now
			a1["ri"] = 1
			a1["rn"] = 0
			a1["re"] = 0.0
			a1["fall"] = 0
			_lap_of(m)
			m.mgr.loot.say("%s calls up the spectral steed" % m.title, FOE)
		"princess:leap":
			a1["sx"] = m.world.x
			a1["sy"] = m.world.y
			var k: int = a1.get("rn", 0)
			# (the first eight round her arena; the last seven at the hero: where he stands is taken as it springs)
			var to: Vector2 = lap_point(m, k + 1) if k < int(RIDE["laps"]) else leap_at(m, hero.world)
			a1["tx"] = to.x
			a1["ty"] = to.y
			act["x"] = to.x
			act["y"] = to.y
			act["a"] = 0 if k < int(RIDE["laps"]) else 1
			_face_to(m, to)
			peril(m, "princess:warn", m.world, {"dur": 1e9, "act": act})


func acting(m, a: Dictionary, t0: float, t1: float, dt: float, hero) -> void:
	# (what she lays keeps time with her picture until her blow)
	for p in a1.get("lay", []):
		if int(p["done"]) == 0 and t1 < float(a["hit"]) + 1e-6:
			p["t"] = t1 - float(a["hit"]) - dt
	match str(a["id"]):
		"princess:lash":
			if crossed(t0, t1, LASH["strike"][0]):
				sound(m, "swing", 1.0)
			if not crossed(t0, t1, LASH["hit"]):
				return
			# THE WHIP: the quarter turn round her front, its whole length
			if in_lash(m.world, m.face, act["hand"], hero.world) and open_to(hero):
				blow(m, hero, float(a["dmg"]))
			hero.kick(2.0)
		"princess:snare":
			# (as her held hands' warning ends: where the hero stands is where it will burst)
			if crossed(t0, t1, SNARE["warn"][1]):
				var p := peril(m, "princess:snare", hero.world, {"t": -(float(a["hit"]) - float(SNARE["warn"][1])), "hit": SNARE["burst"][0], "dur": SNARE["sink"][1],
					"dmg": m._roll() * float(a["dmg"]), "life": SNARE["life"], "struck": -1.0, "broken": -1.0, "held": false, "wither": -1.0})
				a1["lay"] = [p]
			if crossed(t0, t1, a["hit"]):
				for p in a1.get("lay", []):
					p["done"] = 1
				hero.kick(2.0)
				sound(m, "slam", 0.5)
		"princess:eleven":
			# (her arms spread: the lines marked, across her arena along the floor's way nearest the hero's from her, the middle one
			# through him)
			if crossed(t0, t1, ELEVEN["warn"][0]):
				var d: Vector2 = hero.world - m.world
				var u := Vector2(signf(d.x) if d.x != 0.0 else 1.0, 0.0) if absf(d.x) >= absf(d.y) else Vector2(0.0, signf(d.y) if d.y != 0.0 else 1.0)
				var first := _lay_eleven(m, a, hero, u, 0.0, 0.0)
				if not first.is_empty():
					a1["lay"] = [first]
				# (MORE SWANS: in her third phase a second flight, half a gap over, a little after; its clock runs by itself, behind)
				if phase_in() >= int(FIGHT["twice"]):
					_lay_eleven(m, a, hero, u, FIGHT["shift"], FIGHT["late"])
			if crossed(t0, t1, a["hit"]):
				for p in a1.get("lay", []):
					p["done"] = 1
				sound(m, "gust", 0.8)
		"princess:vow":
			if not crossed(t0, t1, a["hit"]):
				return
			# THE RING OF SILENCE bursts out round her: whoever is inside struck as it bursts; it holds, going with her
			peril(m, "princess:vow", m.world, {"hit": 0.0, "dur": float(VOW["hold"]) + float(VOW["fade"]), "dmg": 0.0})
			if hero.world.distance_to(m.world) <= float(VOW["r"]) and open_to(hero):
				blow(m, hero, float(a["dmg"]))
			hero.kick(2.0)
		"princess:leap":
			# (at the hero: where he stands as it springs is where it comes down)
			if int(act.get("a", 0)) == 1 and crossed(t0, t1, RIDE["spring"]):
				var to := leap_at(m, hero.world)
				a1["tx"] = to.x
				a1["ty"] = to.y
				act["x"] = to.x
				act["y"] = to.y
				_face_to(m, to)
			# CARRIED THROUGH THE AIR from where it sprang to where it comes down
			if t1 > float(RIDE["air"][0]):
				var u := clamp01((t1 - float(RIDE["air"][0])) / (float(RIDE["air"][1]) - float(RIDE["air"][0])))
				m.world = Vector2(a1["sx"], a1["sy"]).lerp(Vector2(a1["tx"], a1["ty"]), u)
			if not crossed(t0, t1, a["hit"]):
				return
			# ITS FOREHOOVES COME DOWN, the fog bursting round them
			var f := hoof_at(m.face, m.world)
			if hero.world.distance_to(f) <= float(RIDE["r"]) + HERO_R * 0.5 and open_to(hero):
				blow(m, hero, float(a["dmg"]))
			hero.kick(3.0)
			sound(m, "slam", 0.55)


## The Eleven's lines laid through where the hero stands (`shift` across, `late` after): its mark, or {} where none run there.
func _lay_eleven(m, a: Dictionary, hero, u: Vector2, shift: float, late: float) -> Dictionary:
	var lines := eleven_lines(m.mgr.map, hero.world, u, shift)
	if lines.is_empty():
		return {}
	var end := 0.0
	for l in lines:
		end = maxf(end, float(l["go"]) + (float(l["u1"]) - float(l["u0"])) / float(ELEVEN["speed"]))
	var warn: float = float(a["hit"]) - float(ELEVEN["warn"][0])
	var p := peril(m, "princess:eleven", hero.world, {"fx": u.x, "fy": u.y, "t": -warn - late, "hit": 0.0, "dur": end + 0.6, "dmg": m._roll() * float(a["dmg"]),
		"a": warn + late, "lines": lines})
	return p


func end(m, a: Dictionary, _hero) -> void:
	a1.erase("lay")
	match str(a["id"]):
		"princess:lash":
			# (MORE THREAD: her lash again at once, while the row lasts)
			if int(a1.get("ln", 0)) > 0:
				a1["ln"] = int(a1["ln"]) - 1
				a1["lq"] = 1
				m._cd = 0.0
		"princess:ride":
			m._cd = 0.0
		"princess:leap":
			a1["rn"] = int(a1.get("rn", 0)) + 1
			m._cd = 0.0
		"princess:unride":
			a1["ri"] = 0
			a1["re"] = 0.0
			# (struck down on her steed: it has faded; now she falls)
			if int(a1.get("fall", 0)) == 1:
				a1["fall"] = 0
				m.life = 0.0
				m._die()
				return
	# (her waits, by her phase: sooner as it goes)
	var i := -1
	for k in ACTS.size():
		if ACTS[k]["id"] == a["id"]:
			i = k
	if i >= 0 and float(a["cooldown"]) > 0.0 and cds.size() > i:
		cds[i] = float(cds[i]) * float(FIGHT["cd"][phase_in() - 1])
	# (she hovers a moment, then darts off)
	a1["gk"] = 0
	a1["hv"] = 0.0


## (on her steed she is not brought below 1: struck down to it, the steed fades first)
func life_floor(_m) -> float:
	return 1.0 if riding() else 0.0


## (as her steed fades under her, falling, nothing reaches her)
func reachable(_m) -> bool:
	return int(a1.get("fall", 0)) == 0


## (carried through the air on her steed's leap: over what stands under it)
func aloft(_m) -> bool:
	return _id() == "princess:leap" and float(act["t"]) > float(RIDE["air"][0]) and float(act["t"]) < float(RIDE["air"][1])


func died(m) -> void:
	# (what of hers was still to come does not come; her snare withers and sinks, letting him go; her ring thins away)
	for p in m.mgr.perils.list:
		if p.get("src") != m or not str(p.get("a1", "")).begins_with("princess:"):
			continue
		var t: float = p["t"]
		match str(p["a1"]):
			"princess:snare":
				if t < float(SNARE["burst"][0]):
					p["dur"] = minf(float(p["dur"]), maxf(0.0, t))
				elif float(p["broken"]) < 0.0 and float(p["wither"]) < 0.0 and t < float(SNARE["sink"][0]):
					p["wither"] = t
					p["held"] = false
					p["dur"] = t + float(SNARE["sink"][1]) - float(SNARE["sink"][0])
			"princess:eleven":
				# (swans not yet set off do not come; those flying harm no more)
				if t < 0.0:
					p["dur"] = t
				else:
					p["done"] = int(p["done"]) | 2
					for l in p["lines"]:
						l["done"] = true
						if float(l["go"]) > t:
							l["go"] = INF
			"princess:vow":
				p["done"] = 1
				p["t"] = maxf(t, float(VOW["hold"]))
			"princess:swans", "princess:warn":
				p["dur"] = t
	a1.erase("lay")
	# HER SWANS FLY OFF OVER THE WALL, AND SHE WHISPERS AS SHE FALLS
	peril(m, "princess:fall", m.world, {"hit": 0.0, "dur": float(DIES["long"]) + 0.6, "a": swans(), "done": 0})
