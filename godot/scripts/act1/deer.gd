## THE TWISTED DEER (floor 9), as the game fights it with its BRAMBLE CHARGE and its gore by Movement 9, as the game starts
## (game/act1_rules/deer.ts RULES, BRAMBLE_ACTS, CHARGE_PERIL, HEDGE_STING, runFrom, hedgeTo, standing, hedgeWall; art/action_f9_
## pinewood.ts GORE9, CHARGE, CHARGE_HIT, CHARGE_STRIKE, chargeCarry, chargeAt, HEDGE, HEDGE_AT, hedgeUp, HEDGE_GONE; DEER_BRAMBLE
## on: game/enemy_moves.ts). His doc's table: "An antler gore; a rearing stomp.", made more by his review of 31 Oct 2026:
## “Bramble charge, in place of the stomp: lowers its antlers and charges down a marked lane, leaving a hedge of thorns along its
## path that stays a few seconds.” A medium mob: two attacks.
##   ITS LIMP: 1.8 tiles a second, stopping at any frame; as near as 1.0 tile, off again beyond 1.25.
##   THE GORE (its basic blow, within 1.6 tiles; list `attack`, 1.6 s): its head dropped low, held; in two frames it lunges and
##     hooks its antlers up through you at 0.633 s: a hero in the strip -0.2 to 1.75 tiles before it and 0.9 to either side is
##     struck, x1, and knocked back 0.8 of a heavy blow's step; the screen kicked 2.
##   THE BRAMBLE CHARGE (2.5 to 7 tiles, with 2.4 tiles of clear run toward him; list `charge`, 2.5 s; every 7 s, first 3 s
##     after waking): at 0.27 s it takes the way to him: THE LANE marked from it through there (deer:charge, its clock the
##     charge's), 7.6 tiles long, 0.7 to either side; it stamps twice (0.45, 0.6 s) and holds; in two frames it bursts off (0.93
##     to 1.0 s: 0.9 then 1.9 tiles) and gallops down the lane at 11 tiles a second for 0.37 s, braking over 0.18 s, 6.96 tiles
##     in all, or to where a wall cuts its run: a hero within 0.85 of its middle line as it comes by is struck, once, x1.3, and
##     thrown aside a whole heavy blow's step, the screen kicked 3. Behind it, A HEDGE OF BRAMBLE: a clump every 0.42 tiles of
##     its path from 0.3 tiles to 0.3 short of where it stopped, each bursting up 0.05 s after its hind feet have gone by it,
##     standing until 5.72 s into the charge; a wall 0.4 to either side of the lane's middle that the hero cannot cross while it
##     stands (put out the shortest way that does not cross it); against it its thorns sting him, x0.25 of the charge's blow,
##     every 0.5 s (not as it bursts up round him). Stopped before it bursts off, none of it; stopped as it runs, no further.
extends "res://scripts/act1/act1.gd"

## (RULES.gait)
const GAIT := {"pace": 1.8, "cycle": 1.0 / 16.0, "setOff": 0.0, "halt": 0.0, "stopAt": 1.0, "slack": 0.25, "trueBack": false}
## (BRAMBLE_ACTS)
const ACTS := [
	{"id": "deer:gore", "clip": "attack", "long": 1.6, "hit": 19.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": 1.6},
	{"id": "deer:charge", "clip": "charge", "long": 2.5, "hit": 1.0, "dmg": 1.3, "cooldown": 7.0, "first": 3.0, "after": 0.6, "near": 2.5, "far": 7.0},
]
## (GORE9; CHARGE; HEDGE; HEDGE_STING)
const GORE := {"reach": 1.6, "half": 0.9, "knock": 0.8}
const CHARGE := {"hit": 1.0, "strike": [28.0 / 30.0, 1.0], "aim": 0.27, "stamps": [0.45, 0.6], "launch": [0.9, 1.9], "pace": 11.0, "run": 0.37, "stop": 0.18,
	"until": 1.0 + 0.37 + 0.18, "lane": 7.6, "half": 0.7}
const FR := 1.0 / 30.0
const HEDGE := {"from": 0.3, "step": 0.42, "late": 0.05, "rise": 0.12, "half": 0.4, "fade": 0.6, "stays": 4.0}
const STING := {"share": 0.25, "every": 0.5}
## (art/act1_figs/deer.ts CLUMP_FRAMES, WRITHE: each clump's pictures, and how long its writhing takes to go round)
const CLUMP := {"rise": 4, "stand": 12, "wither": 6}
const WRITHE := TAU / 2.4

static var _carried := -1.0
static var _at: Array = []
static var _up: Array = []
static var _gone := 0.0


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


# --- its charge's own sums (art/action_f9_pinewood.ts) ---

## chargeCarry: how far the game has carried it down its lane, `t` seconds into the charge (tiles).
static func carry(t: float) -> float:
	var s0: float = CHARGE["strike"][0]
	var s1: float = CHARGE["strike"][1]
	var l0: float = CHARGE["launch"][0]
	var l1: float = CHARGE["launch"][1]
	var pace: float = CHARGE["pace"]
	if t <= s0:
		return 0.0
	if t < s0 + FR:
		return l0 * ((t - s0) / FR)
	if t < s1:
		return l0 + (l1 - l0) * ((t - s0 - FR) / FR)
	var r := t - s1
	if r < float(CHARGE["run"]):
		return l1 + pace * r
	var u := minf(float(CHARGE["stop"]), r - float(CHARGE["run"]))
	return l1 + pace * float(CHARGE["run"]) + pace * u - (pace * u * u) / (2.0 * float(CHARGE["stop"]))


## CHARGE_CARRIED: how far it has gone when it stops (6.96 tiles).
static func carried_most() -> float:
	if _carried < 0.0:
		_carried = carry(float(CHARGE["until"]) + 1.0)
	return _carried


## chargeAt: the seconds into the charge it has been carried `d` tiles (its first moment there).
static func charge_at(d: float) -> float:
	var lo := 0.0
	var hi: float = CHARGE["until"]
	if d >= carried_most():
		return hi
	for i in 40:
		var mid := (lo + hi) / 2.0
		if carry(mid) < d:
			lo = mid
		else:
			hi = mid
	return hi


## HEDGE_AT: where along its path each clump stands; hedgeUp: when each bursts up; HEDGE_GONE: when the hedge is gone.
static func _hedge() -> void:
	if not _at.is_empty():
		return
	var d: float = HEDGE["from"]
	while d <= carried_most() - 0.3 + 1e-6:
		_at.append(d)
		_up.append(charge_at(d + 0.6) + float(HEDGE["late"]))
		d += float(HEDGE["step"])
	_gone = float(_up[_up.size() - 1]) + float(HEDGE["rise"]) + float(HEDGE["stays"])


static func hedge_at() -> Array:
	_hedge()
	return _at


static func hedge_up(j: int) -> float:
	_hedge()
	return _up[j]


static func hedge_gone() -> float:
	_hedge()
	return _gone


## hedgeTo: how many of the hedge's clumps stand along its path, as far as it ran.
static func hedge_to(run: float) -> int:
	var n := 0
	for d in hedge_at():
		if float(d) <= run - 0.3 + 1e-6:
			n += 1
	return n


## standing: whether clump `j` stands `t` seconds into the charge: up, and not yet withered.
static func standing(j: int, t: float) -> bool:
	return t >= hedge_up(j) + float(HEDGE["rise"]) * 0.5 and t < hedge_gone() - 0.1


## clumpFrame (art/act1_figs/deer.ts): which of clump `j`'s pictures is seen `t` seconds into the charge (-1: none).
static func clump_frame(j: int, t: float) -> int:
	var s := t - hedge_up(j)
	var left := hedge_gone() - t
	if s < 0.0 or left <= 0.0:
		return -1
	if s < float(HEDGE["rise"]):
		return mini(int(CLUMP["rise"]) - 1, floori((s / float(HEDGE["rise"])) * int(CLUMP["rise"])))
	if left < float(HEDGE["fade"]):
		return int(CLUMP["rise"]) + int(CLUMP["stand"]) + mini(int(CLUMP["wither"]) - 1, floori(((float(HEDGE["fade"]) - left) / float(HEDGE["fade"])) * int(CLUMP["wither"])))
	var u := fposmod(t / WRITHE, 1.0)
	return int(CLUMP["rise"]) + mini(int(CLUMP["stand"]) - 1, floori(u * int(CLUMP["stand"])))


## runFrom: how far it can run from `at` along `u` before a wall, to `most` tiles.
static func run_from(m, at: Vector2, u: Vector2, r: float, most: float) -> float:
	var d := 0.0
	while d < most and m.mgr.clear(at.x + u.x * (d + 0.1), at.y + u.y * (d + 0.1), r):
		d += 0.1
	return minf(d, most)


# --- its rules ---

func can(m, a: Dictionary, _dist: float, _los: bool) -> bool:
	# (its charge only with a clear run before it, toward him)
	if a["id"] != "deer:charge":
		return true
	var d: Vector2 = m.mgr.hero.world - m.world
	var u := d / (d.length() if d.length() > 0.0 else 1.0)
	return run_from(m, m.world, u, minf(m.r, 0.42), 2.5) >= 2.4


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var free := open_to(hero)
	if a["id"] == "deer:gore":
		if not crossed(t0, t1, a["hit"]):
			return
		var r := rel(m, hero)
		if free and r.x > -0.2 and r.x <= float(GORE["reach"]) + HERO_R * 0.5 and absf(r.y) <= float(GORE["half"]):
			blow(m, hero, a["dmg"])
			knock(hero, m.world, GORE["knock"])
		hero.kick(2.0)
		sound(m, "swing", 0.7)
		return
	# THE BRAMBLE CHARGE
	for T in CHARGE["stamps"]:
		if crossed(t0, t1, T):
			sound(m, "slam", 0.3)
	if crossed(t0, t1, CHARGE["aim"]):
		# (the way to him now: the lane marked from it, to its length or a wall)
		var d: Vector2 = hero.world - m.world
		var u := d / (d.length() if d.length() > 0.0 else 1.0)
		m.face = u
		act["x"] = m.world.x
		act["y"] = m.world.y
		a1["run"] = run_from(m, m.world, u, minf(m.r, 0.42), carried_most())
		a1["struck"] = 0
		peril(m, "deer:charge", m.world, {"t": CHARGE["aim"], "hit": CHARGE["hit"], "dur": hedge_gone(), "dmg": m._roll() * float(a["dmg"]), "fx": u.x, "fy": u.y, "d": a1["run"]})
	if crossed(t0, t1, CHARGE["hit"]):
		sound(m, "swing", 0.8)
		hero.kick(2.0)
	if t1 <= float(CHARGE["strike"][0]) or not a1.has("run"):
		return
	# (the game carries it down its lane)
	var run: float = a1["run"]
	var c0 := minf(carry(t0), run)
	var c1 := minf(carry(t1), run)
	var from := Vector2(act["x"], act["y"])
	m.world = from + m.face * c1
	# (a hero in its lane as it comes by: struck, once, and thrown aside)
	if int(a1["struck"]) == 0 and free and c1 > c0:
		var dh: Vector2 = hero.world - from
		var along: float = dh.dot(m.face)
		var aside: float = -dh.x * m.face.y + dh.y * m.face.x
		if absf(aside) <= float(CHARGE["half"]) + HERO_R * 0.5 and along >= c0 - 0.6 and along <= c1 + 0.6:
			a1["struck"] = 1
			blow(m, hero, a["dmg"])
			var s := 1.0 if aside >= 0.0 else -1.0
			knock(hero, from + m.face * along + Vector2(m.face.y * s * 0.05, -m.face.x * s * 0.05), 1.0)
			hero.kick(3.0)


func end(_m, _a: Dictionary, _hero) -> void:
	a1.erase("run")


# --- its hedge (deer.ts peril, hedgeWall; stepped by marks9.gd) ---

## A step of its charge's mark: stopped before it ran its lane, no further; stopped before it burst off, none of it; then the
## hedge's wall: he is kept on his side of it, and against it its thorns sting. False: it is gone.
static func step_hedge(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var src = p.get("src")
	var going: bool = src != null and is_instance_valid(src) and not src.dead and src.state == "act" and src.h2.act != null and src.h2.acts()[src.h2.act["i"]]["id"] == "deer:charge"
	if not going and t < float(CHARGE["until"]):
		if t < float(CHARGE["hit"]):
			p["dur"] = t
			return
		p["d"] = minf(float(p["d"]), carry(t))
	var hero = P.hero
	var h: Vector2 = hero.world
	var at := Vector2(p["x"], p["y"])
	var f := Vector2(p["fx"], p["fy"])
	var dh := h - at
	var along := dh.dot(f)
	var aside := -dh.x * f.y + dh.y * f.x
	var up: Array = []
	for j in hedge_to(p["d"]):
		if standing(j, t):
			up.append(float(hedge_at()[j]))
	if up.is_empty():
		p["c"] = signf(aside) if absf(aside) > 1e-3 else float(p["c"])
		return
	var r := HERO_R
	var lo: float = up.min() - float(HEDGE["step"]) / 2.0 - r
	var hi: float = up.max() + float(HEDGE["step"]) / 2.0 + r
	var band: float = float(HEDGE["half"]) + r
	var in_wall := absf(aside) < band and along > lo and along < hi
	if not in_wall:
		if absf(aside) >= band:
			p["c"] = signf(aside)
		return
	# (in it: put out the shortest way that does not cross it, onto open floor)
	var ways: Array = []
	var sides: Array = [float(p["c"])] if float(p["c"]) != 0.0 else ([1.0, -1.0] if aside >= 0.0 else [-1.0, 1.0])
	for s in sides:
		ways.append([_on(at, f, along, s * (band + 0.01)), absf(s * (band + 0.01) - aside)])
	var end := lo - 0.01 if along - lo < hi - along else hi + 0.01
	ways.append([_on(at, f, end, aside), absf(end - along)])
	ways.sort_custom(func(u, v): return float(u[1]) < float(v[1]))
	var out: Vector2 = ways[0][0]
	for w in ways:
		if P.map.fits(w[0].x, w[0].y, r * 0.9, false, false):
			out = w[0]
			break
	hero.world = out
	# (its thorns, against it: not as it bursts up round him, thrown aside by the deer)
	var near: float = up[0]
	for v in up:
		if absf(float(v) - along) < absf(near - along):
			near = v
	var j_near: int = hedge_at().find(near)
	if t - hedge_up(j_near) > 0.3 and t >= float(p["b"]) and open_to(hero):
		p["b"] = t + float(STING["every"])
		P._hurt(p, float(p["dmg"]) * float(STING["share"]), hero.world)


static func _on(at: Vector2, f: Vector2, al: float, aside: float) -> Vector2:
	return Vector2(at.x + f.x * al - f.y * aside, at.y + f.y * al + f.x * aside)
