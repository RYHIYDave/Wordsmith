## THE INKLINGS OF THE GREAT LIBRARY (floor 15), as the game fights them (game/act1_rules/inkling.ts RULES, INKLING; art/inklings.ts,
## inklings_moves.ts, inkling_shots.ts: the Order's ink, spilled across the library's floors, got up and walking).
##   THEIR SCUTTLE: 1.3 tiles a second, stopping at any frame; 0.7 tiles off, and 0.2 nearer.
##   THE INK LASH (their one blow, within 0.95 tiles; list `attack`, 1.3 s): both claws raked down across before them at 0.6 s: a hero
##     from 0.2 behind them to 0.95 before them, 0.5 either side, is struck x1.
##   THE MELT (the hero in sight 2.6 to 9 tiles off, its last melt 6 to 9 s behind it, the first 1.5 to 3 s after it wakes; list
##     `melt`, 0.9 s): run down into a pool of ink, out of reach from 0.45 s on.
##   AS A POOL (nothing of the figure seen: its pool is, act2/marks15.gd inkling:pool) it slides along the floor toward the hero, 2.2
##     tiles a second, the way the floor lets it, under others, out of reach; it RISES (list `rise`, 1.1 s, in reach again from 0.45 s)
##     before him once within 0.9 tiles of him, or after 4.5 s, or held up, turned to him.
extends "res://scripts/act1/act1.gd"

const GAIT := {"pace": 1.3, "cycle": 1.0 / 12.0, "setOff": 0.0, "halt": 0.0, "stopAt": 0.7, "slack": 0.2, "trueBack": true}
const LASH := {"long": 1.3, "hit": 18.0 / 30.0, "reach": 0.8, "half": 0.5}
const MELT := {"long": 0.9, "gone": 0.45}
const RISE := {"long": 1.1, "up": 0.45}
const POOL := {"from": 2.6, "to": 9.0, "again": [6.0, 9.0], "first": [1.5, 3.0], "speed": 2.2, "near": 0.9, "most": 4.5}
const ACTS := [
	{"id": "inkling:lash", "clip": "attack", "long": 1.3, "hit": 18.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.55, "near": 0.0, "far": 0.95},
	{"id": "inkling:melt", "clip": "melt", "long": 0.9, "hit": 0.45, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true},
	{"id": "inkling:rise", "clip": "rise", "long": 1.1, "hit": 0.45, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.15, "near": 0.0, "far": 99.0, "forced": true},
]
const I_MELT := 1
const I_RISE := 2


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## (`sunk`: 0 up, 1 melting, 2 a pool going about, 3 rising; `mcd`, seconds before it may melt again; `pt`, how long it has gone
## about as a pool; `vx`, `vy`, the pool's way and pace, for its picture)
func spawned(_m) -> void:
	a1 = {"sunk": 0, "mcd": -1.0, "pt": 0.0, "vx": 0.0, "vy": 0.0}


## inkSunk: ink on the floor now, out of reach (melted far enough, a pool, or not yet risen far enough).
func sunk() -> bool:
	var s := int(a1.get("sunk", 0))
	if s == 0:
		return false
	if s == 2:
		return true
	var t: float = act["t"] if act != null else 0.0
	return t >= float(MELT["gone"]) if s == 1 else t < float(RISE["up"])


func reachable(_m) -> bool:
	return not sunk()


func forced(m) -> int:
	var hero = m.mgr.hero
	if float(a1["mcd"]) < 0.0:
		a1["mcd"] = randf_range(POOL["first"][0], POOL["first"][1])
	if int(a1["sunk"]) != 0 or float(a1["mcd"]) > 0.0 or not hero.alive:
		return -1
	var d: float = m.world.distance_to(hero.world)
	if d < float(POOL["from"]) or d > float(POOL["to"]) or not m.mgr.sees(m.world, hero.world):
		return -1
	return I_MELT


func start(_m, a: Dictionary, _hero) -> void:
	if a["id"] == "inkling:melt":
		a1["sunk"] = 1
	elif a["id"] == "inkling:rise":
		a1["sunk"] = 3


func end(m, a: Dictionary, _hero) -> void:
	if a["id"] == "inkling:melt":
		# (only the pool left: it goes about as one)
		a1.merge({"sunk": 2, "pt": 0.0, "vx": 0.0, "vy": 0.0}, true)
		peril(m, "inkling:pool", m.world, {"dur": 1e9})
	elif a["id"] == "inkling:rise":
		a1["sunk"] = 0
		a1["mcd"] = randf_range(POOL["again"][0], POOL["again"][1])


func tick(m, dt: float, dist: float, hero) -> bool:
	if float(a1["mcd"]) > 0.0 and int(a1["sunk"]) == 0:
		a1["mcd"] = maxf(0.0, float(a1["mcd"]) - dt)
	if int(a1["sunk"]) != 2:
		return false
	# A POOL OF INK, sliding along the floor toward the hero, the way the floor lets it
	a1["pt"] = float(a1["pt"]) + dt
	m.state = "chase"
	var los: bool = dist < 2.5 and m.mgr.sees(m.world, hero.world)
	var v: Vector2 = (hero.world - m.world) / maxf(dist, 1e-6) if los else m.mgr.flow_dir(m.world)
	var sp: float = float(POOL["speed"]) * m.slow()
	var x0: Vector2 = m.world
	if dist > float(POOL["near"]) and v != Vector2.ZERO:
		var step := minf(sp * dt, dist - float(POOL["near"]))
		slide(m, v * step)
		m.face = v
	var moved: float = m.world.distance_to(x0)
	var vel: Vector2 = (m.world - x0) / dt if dt > 0.0 else Vector2.ZERO
	a1["vx"] = vel.x
	a1["vy"] = vel.y
	# (before him, or slid its while, or held up: it rises)
	var now: float = hero.world.distance_to(m.world)
	if now <= float(POOL["near"]) + 0.02 or float(a1["pt"]) >= float(POOL["most"]) or (float(a1["pt"]) > 0.3 and moved < sp * dt * 0.2):
		a1["vx"] = 0.0
		a1["vy"] = 0.0
		start_act(m, ACTS, I_RISE, hero)
		return true
	return true


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] != "inkling:lash" or not crossed(t0, t1, a["hit"]):
		return
	# (both claws raked down across before them, crossing: whoever they close across is struck)
	var r := rel(m, hero)
	if r.x > -0.2 and r.x <= float(LASH["reach"]) + HERO_R * 0.5 and absf(r.y) <= float(LASH["half"]) and open_to(hero):
		blow(m, hero, a["dmg"])
	sound(m, "swing", 0.35)


## (render/act1_fx/inkling.ts hidden: going about as a pool, nothing of the figure is drawn)
func shown(_m) -> Dictionary:
	return {"hide": true} if int(a1.get("sunk", 0)) == 2 else {}
