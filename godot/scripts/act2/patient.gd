## THE HUSHED PATIENTS OF THE HOUSE OF QUIET (floor 14), as the game fights them (game/act1_rules/patient.ts RULES, PATIENT).
##   THEIR SHUFFLE: 0.8 tiles a second, stopping at any frame; 1.1 tiles off, and 0.3 nearer.
##   THE SILENT SCREAM (their one blow, within 1.6 tiles; list `attack`, 1.5 s): it bursts out of them at 0.7 s, from 0.49 tiles before
##     them, its front rolling out to 1.8 tiles in 0.6 s, 34 degrees to either side: whoever it passes is struck x1, once.
##   THEIR BEDS: one laid near a ward bed lies in it (as the floor's monsters.json has it, its `a1`), drawn lying (list `abed`), facing as
##     the bed has it; struck, or the hero passing within 3.5 tiles in its sight (at a moment of its own), it RISES (list `rise`, 2.3 s:
##     its feet on the floor at 1.32 s, stood at 1.96, carried 0.36 tiles on clear of the bed's iron). In its bed, and rising, it is not
##     brought down until it has stood.
extends "res://scripts/act1/act1.gd"

const GAIT := {"pace": 0.8, "cycle": 1.0 / 8.0, "setOff": 0.0, "halt": 0.0, "stopAt": 1.1, "slack": 0.3, "trueBack": true}
const SCREAM := {"hit": 21.0 / 30.0, "from": 0.4927, "r0": 0.15, "reach": 1.8, "half": 34.0 * PI / 180.0, "long": 0.6}
const RISE := {"long": 2.3, "feet": 1.32, "up": 1.96, "pass": 3.5, "most": 0.6, "step": 0.36}
const ACTS := [
	{"id": "patient:scream", "clip": "attack", "long": 1.5, "hit": 21.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.6, "near": 0.0, "far": 1.6},
	{"id": "patient:rise", "clip": "rise", "long": 2.3, "hit": 1.96, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.2, "near": 0.0, "far": 0.0, "forced": true},
]


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func spawned(m) -> void:
	# (lying in the bed the game laid it in, or on its feet)
	a1 = m.a1_in.duplicate() if int(m.a1_in.get("bed", 0)) == 1 else {"bed": 0}


## screamFront: how far the scream's front has rolled out, `u` seconds after it; -1 once it is gone.
static func scream_front(u: float) -> float:
	if u < 0.0 or u >= float(SCREAM["long"]):
		return -1.0
	var c := clampf((u / float(SCREAM["long"])) * 1.25, 0.0, 1.0)
	return float(SCREAM["r0"]) + (float(SCREAM["reach"]) - float(SCREAM["r0"])) * c * c * (3.0 - 2.0 * c)


## screamFrom: where the scream's burst leaves the mouth.
static func scream_from(m) -> Vector2:
	return beside(m.world, m.face, 1, SCREAM["from"], 0.0)


## Bring it up out of its bed now, or `wait` seconds from now.
func call_up(wait: float) -> void:
	if int(a1.get("bed", 0)) != 1 or int(a1.get("go", 0)) != 0:
		return
	a1["go"] = 1
	a1["wait"] = wait


func tick(m, dt: float, dist: float, hero) -> bool:
	if int(a1.get("bed", 0)) == 2 and (act == null or ACTS[act["i"]]["id"] != "patient:rise"):
		# (its rising broken off: it is up at once, where its rising would have left it, clear of the bed)
		m.world = Vector2(a1["lx"], a1["ly"]) + Vector2(a1["bfx"], a1["bfy"]) * float(RISE["step"])
		a1["bed"] = 0
	if int(a1.get("bed", 0)) != 1:
		return false
	# (in its bed it lies as the bed has it, whatever else)
	m.face = Vector2(a1["bfx"], a1["bfy"])
	if int(a1.get("go", 0)) == 0:
		if _struck < 0.5:
			call_up(0.0)
		elif dist <= float(RISE["pass"]) and m.mgr.sees(m.world, hero.world):
			call_up(m.own_seed * float(RISE["most"]))
		else:
			return true
	a1["wait"] = float(a1["wait"]) - dt
	return float(a1["wait"]) > 0.0


func forced(_m) -> int:
	return 1 if (int(a1.get("bed", 0)) == 1 and int(a1.get("go", 0)) == 1 and float(a1.get("wait", 0.0)) <= 0.0) else -1


func start(m, a: Dictionary, _hero) -> void:
	if a["id"] != "patient:rise":
		return
	# (it rises facing as it lay, the way its picture of rising is drawn)
	m.face = Vector2(a1["bfx"], a1["bfy"])
	act["hand"] = hand_of(true, m.face)
	a1["bed"] = 2



## (broken off: what its end puts right, put right: act1.gd broken)
func broken(m, a: Dictionary, hero) -> void:
	end(m, a, hero)

func end(_m, a: Dictionary, _hero) -> void:
	if a["id"] == "patient:rise":
		a1["bed"] = 0


## (struck in bed it rises first: it is not brought down until it has stood)
func life_floor(_m) -> float:
	var bed := int(a1.get("bed", 0))
	if bed == 0:
		return 0.0
	return 1.0 if (bed == 1 or (act != null and ACTS[act["i"]]["id"] == "patient:rise" and float(act["t"]) < float(RISE["up"]))) else 0.0


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] == "patient:rise":
		# (leaning out, pushing off the bed and up: carried on clear of its iron as they stand)
		var k := func(t: float) -> float: return clampf((t - float(RISE["feet"])) / (float(RISE["up"]) - float(RISE["feet"])), 0.0, 1.0)
		m.world += m.face * (float(k.call(t1)) - float(k.call(t0))) * float(RISE["step"])
		return
	if a["id"] != "patient:scream":
		return
	var hit: float = SCREAM["hit"]
	if crossed(t0, t1, hit):
		# (its burst over the floor: act2/marks14.gd patient:scream)
		peril(m, "patient:scream", scream_from(m), {"dur": SCREAM["long"]})
	# THE SILENT SCREAM: its front rolls out across the floor before them; whoever it passes is struck, once
	var end := hit + float(SCREAM["long"])
	if int(act.get("b", 0)) != 0 or t1 < hit or t0 >= end:
		return
	var f1 := scream_front(minf(float(SCREAM["long"]) - 1e-6, t1 - hit))
	var f0 := -INF if t0 < hit else scream_front(t0 - hit)
	if f0 < 0.0 and t0 >= hit:
		f0 = SCREAM["reach"]
	if f1 < 0.0:
		return
	var o := scream_from(m)
	var r := from_figure(o, m.face, 1, hero.world)
	var d := r.length()
	var inFan := d <= HERO_R or absf(atan2(r.y, r.x)) <= float(SCREAM["half"]) + atan2(HERO_R, maxf(d, 1e-6))
	var near := d - HERO_R
	if not inFan or near > f1 or near <= f0:
		return
	act["b"] = 1
	if open_to(hero):
		blow(m, hero, float(a["dmg"]))


## (render/act1_fx/patient.ts sprite: in its bed, lying)
func shown(m) -> Dictionary:
	if int(a1.get("bed", 0)) != 1 or not m.art.has("abed"):
		return {}
	return {"list": "abed", "i": floori(m._anim_t * m.art.fps("abed")) % maxi(1, m.art.count(0, "abed"))}
