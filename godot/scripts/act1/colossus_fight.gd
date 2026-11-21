## THE SWAMP COLOSSUS: HIS FIGHT'S RULES (floor 10's boss, the Drowned Eye redone), line for line as the game has them
## (game/colossus_fight.ts ColossusFight and its numbers; COLOSSUS on and GAZE2_AIMED on, as the game starts). His words, 7 Nov
## 2026: “start with just tentacles coming up, kill both of them, then he emerges with three.  kill the three with extra attacks
## from the main body, final phase he uses the magic, maybe keep three tentacles.  kill the tentacles and his body.  flasks reset in
## between each phase for now”; the water slams, the shovel, and his pick for all of it, “Yes, nowhere safe (Recommended)”. Every
## time and length here is the art chat's, read off its frames (30 a second); what hurts, how hard, how often and when his phases
## change are these rules.
##   WHERE: THE STONE, a rectangle 17 tiles across the screen by 11 deep, its far long edge open on the black water: `u` along it
##     from its left end (0 to 17), `v` across it from its back edge by the water (0) to its near edge (11); the water at v < 0.
##     Points of it here are Vector2(u, v).
##   PHASE 1: his two tentacles bursting up as the hero first steps onto the stone (after the water lies still 1.2 s and boils),
##     each slamming the stone along a line laid toward him (its warning held through the wind-up; the hit on frame 28, lying to
##     60, struck anywhere along it while it lies); a slam every 2 of their stand loops at most, each resting 0 to 1 loops.
##   BETWEEN: the last of a phase's tentacles killed, the flasks refilled at once; his change begins no sooner than 1 s after, as
##     his stand comes round.
##   PHASE 2 (from his entrance, 9 s, his three tentacles bursting up at 7.4 s): the slams, resting 1 to 2 loops; THE WATER SLAMS
##     every 7 to 9 s (first 4 s in), left, right, both: a wave rolling across the whole stone (6.12 tiles a second, its front
##     leading at the back), hurting once as it goes over him and shoving him a tile; both at once crash in the middle near the back
##     (a plume hurting within 2.4 tiles, then a surge slowing him to 60% half the stone wide); THE SHOVEL every 14 to 18 s (first
##     10 s in): he sinks, the water boils off the end he comes up at, he bursts up there gaping and four tentacles scrape along the
##     stone toward his maw, one along each edge in turn, knocking the hero 6.5 tiles toward it; too near his maw he twitches and
##     snaps shut (x3); HIS BODY'S OWN ATTACKS between, by turns, every 5 to 7 s (first 6 s in): THE BILE ARC (landing where the
##     hero stood, a burning pool) and THE GAZE (aimed along the nearest of seven aims, swept 32 degrees either side; his middle
##     tentacle ducks under it).
##   PHASE 3 (his slide forward, 4.8 s, gripping the stone's edge): no tentacles; his eye in reach; his eye's GAZE and EYE SLAM by
##     turns (0.6 to 1.2 s between, first 1.5 s in), each at the nearest of the baked aims and spots; the siege's bolts raining on
##     the stone every 2.6 s (three, the first where the hero stands) while the cult's pillars burn, or where none stand.
##   Nothing hurts the hero while he rolls or leaps through (the game's dodge), and what he goes through has passed him.
## It says what happens as events ({"t": ...}, the game's FightEvent); the game (colossus.gd) runs it on floor 10.
extends RefCounted

const FPS := 30.0
const D := PI / 180.0

static func fr(n: float) -> float:
	return n / FPS

## (COLOSSUS.on, GAZE2_AIMED.on: as the game starts)
const GAZE2_AIMED := true

# --- THE PLACE ---

## The stone: tiles along it (u) and across it (v).
const STONE := {"w": 17.0, "d": 11.0}
## His middle at his place: out in the water, at the middle of the stone's length.
const HIS_PLACE := Vector2(8.5, -7.9)
## Where his tentacles stand: their roots this far out in the water from the stone's back edge, along it at these.
const ROOT_OUT := 1.38
const ROOTS := {1: [8.5 - 2.83, 8.5 + 2.83], 2: [8.5 - 5.66, 8.5, 8.5 + 5.66], 3: [8.5 - 5.66, 8.5, 8.5 + 5.66]}
## The turns each tentacle's slam is drawn for (degrees from straight across the stone, + toward its right end), every `step`.
const TURNS := {"step": 3, 1: [Vector2(-75, 78), Vector2(-78, 75)], 2: [Vector2(-60, 78), Vector2(-78, 78), Vector2(-78, 60)]}

# --- HIS TENTACLES' MOVES ---

const ARM := {"stand": 45.0 / FPS, "r": 1.05, "burst": 32.0 / FPS, "death": 90.0 / FPS}
const SLAM := {"long": 74.0 / FPS, "hit": 28.0 / FPS, "drag": 42.0 / FPS, "lying": [28.0 / FPS, 60.0 / FPS], "width": 1.1}
const SMASH := {"long": 74.0 / FPS, "hit": 28.0 / FPS}
const WAVE := {"off": 1.02, "speed": 6.12, "slant": 0.35, "face": 0.8, "die": 3.57, "knock": 1.0}
const CRASH := {"v": 0.87, "r": 2.4, "hit": 0.1, "surge": [0.35, 3.2], "half": 6.9, "slow": 0.6}

# --- HIS BODY'S MOVES ---

const BODY := {"stand": 90.0 / FPS}
const ENTRANCE := {"long": 270.0 / FPS, "armsUp": 222.0 / FPS}
const CHANGE3 := {"slide": 24.0 / FPS, "grip": (24.0 + 103.0) / FPS, "long": (24.0 + 120.0) / FPS, "armsUp": INF}
const SHOVEL := {
	"long": 352.0 / FPS, "tell": [22.0 / FPS, 56.0 / FPS], "burst": 56.0 / FPS, "gape": [84.0 / FPS, 300.0 / FPS], "back": 300.0 / FPS,
	"armsUp": 318.0 / FPS,
	"hooks": [{"at": 84.0 / FPS, "edge": "back"}, {"at": 128.0 / FPS, "edge": "near"}, {"at": 190.0 / FPS, "edge": "back"}, {"at": 234.0 / FPS, "edge": "near"}],
	"out": 4.72,
}
const HOOK := {
	"start": 1.79, "stop": 0.64, "scrape": [8.0 / FPS, 53.0 / FPS], "speed": (17.0 + 1.79 - 0.64) / (45.0 / FPS),
	"thick": 1.3, "reach": {"back": 6.75, "near": 6.64}, "knock": 6.5, "knockSecs": 1.0 / 3.0,
}
const SNAP := {"deep": 2.35, "across": [1.84, 9.8], "shut": 7.0 / FPS, "long": 31.0 / FPS, "last": 268.0 / FPS, "again": 0.6}

# --- PHASE 3, HIS EYE AND HIS SPELLS ---

const FORWARD := {"u": 8.5, "v": -3.67, "eye": 5.19, "r": 1.6}
const EYE3 := {
	"gazeAt": Vector2(8.15, -0.05),
	"aims": [-80, -60, -40, -20, 0, 20, 40, 60, 80],
	"struckFrom": [0, 15, 30, 45, 60, 75],
	"struck": 20.0 / FPS,
	"kindle": [2.0 / FPS, 7.0 / FPS, 12.0 / FPS],
	"ward": 12.0 / FPS,
	"pillars": [Vector2(-0.9, 6.05), Vector2(17.9, 6.05), Vector2(8.5, 11.9)],
}
## His eye's slam lands only at one of these (the nearest the hero): round his eye's place at 1.8 and 3.4 tiles every 30 degrees.
static var EYE3_SPOTS: Array = _spots()

static func _spots() -> Array:
	var out: Array = []
	for d in [1.8, 3.4]:
		for a in [-90, -60, -30, 0, 30, 60, 90]:
			out.append(Vector2(8.5 + d * sin(a * D), 1.52 + d * cos(a * D)))
	return out

const GAZE := {"warn": 0.9, "sweep": 1.2, "half": 32.0, "width": 0.9, "long": 102.0 / FPS}
const BODY2 := {
	"at": 24, "every": [5.0, 7.0], "first": 6.0,
	"bile": {"release": 28.0 / FPS, "land": 49.0 / FPS, "long": 65.0 / FPS, "splash": 2.2, "pool": {"r": 1.9, "spread": 0.2, "hold": 1.4, "life": 3.0, "tick": 0.5}},
	"gazeAt": Vector2(8.15, -4.28),
	"aims": [-60, -40, -20, 0, 20, 40, 60],
	"lim": 85.0,
}
const EYE_SLAM := {"warn": 28.0 / FPS, "hit": 28.0 / FPS, "r": 1.5, "reach": 4.0, "up": 2.2, "long": 2.8}
const EYE_PACE := {"rest": [0.6, 1.2], "first": 1.5}
const RAIN := {"every": 2.6, "n": 3, "near": 1.5, "far": 3.5, "warn": 1.1, "r": 1.0}
const BODY_HIT := {"r": 4.4}

# --- HOW HARD, HOW OFTEN ---

## How hard each hurts, times his own blow (the boss's base blow, as the game reckons it on floor 10).
const HURTS := {"slam": 1.2, "wave": 1.0, "crash": 1.8, "scrape": 0.9, "snap": 3.0, "rain": 1.0, "gaze": 1.1, "eye": 1.4, "bile": 1.3, "pool": 0.3}
## EACH PHASE: a slam on the stone at most every `gap` of their stand loops, each tentacle resting `rest` loops between its moves
## (his 8 Nov 22:32, “The tentacles hit too often.”, his pick “Half as often (Recommended)”); the water slams every `water` seconds
## (the first `waterFirst` in); the shovel every `shovel` seconds after the last (the first `shovelFirst` in).
const PACE := {
	1: {"gap": 2, "rest": [0, 1], "water": null, "waterFirst": 0.0, "shovel": null, "shovelFirst": 0.0},
	2: {"gap": 2, "rest": [1, 2], "water": [7.0, 9.0], "waterFirst": 4.0, "shovel": [14.0, 18.0], "shovelFirst": 10.0},
	3: {"gap": 2, "rest": [0, 1], "water": null, "waterFirst": 0.0, "shovel": null, "shovelFirst": 0.0},
}
## Each tentacle's life and his body's, as shares of a full bar (each phase a bar of its own).
const LIFE := {1: 0.5, 2: 1.0 / 3.0, 3: 1.0 / 3.0, "body": 1.0}
## HIS WAKING (his 8 Nov 22:34: “I want you to walk on the platform and see nothing, then bubbles, then two tentacles and the eye lurking.”)
const WAKE := {"still": 1.2, "rise": 4.2, "lurk": [3.4, 4.8]}
## HIS DEATH (the art's eye_death.ts): frames from the killing blow; `long` in all, seconds; the screen's shakes at its beats.
const DEATH := {"burst": 36, "tear": 58, "roar": 64, "melt": [96, 196], "teeth": [100, 180], "sink": [176, 250], "boil": [170, 300], "gone": 250, "still": 316, "long": 12.5,
	"shakes": [[0, 5], [36, 14], [58, 7], [64, 6], [176, 3]]}
const BETWEEN := {"least": 1.0}
## The hero's size on the stone (tiles round him: the game's TUNE.heroRadius).
const HERO_R := 0.3

# --- THE STONE IN THE WORLD (game/act1_layout.ts lays it: its middle at `at`, the world point; the screen's axes) ---

static func stone_to_world(at: Vector2, u: float, v: float) -> Vector2:
	var du := u - STONE["w"] / 2.0
	var dv := v - STONE["d"] / 2.0
	return Vector2(at.x + (du + dv) / sqrt(2.0), at.y + (dv - du) / sqrt(2.0))

static func world_to_stone(at: Vector2, x: float, y: float) -> Vector2:
	var dx := x - at.x
	var dy := y - at.y
	return Vector2(STONE["w"] / 2.0 + (dx - dy) / sqrt(2.0), STONE["d"] / 2.0 + (dx + dy) / sqrt(2.0))

## The jetty down from the middle of the near edge.
const JETTY := {"half": 1.1, "long": 3.6, "in": 2.4, "out": 3.2}

static func on_stone_or_jetty(p: Vector2) -> bool:
	if p.x >= 0.0 and p.x <= STONE["w"] and p.y >= 0.0 and p.y <= STONE["d"]:
		return true
	return absf(p.x - STONE["w"] / 2.0) <= JETTY["half"] and p.y > STONE["d"] - 0.5 and p.y <= STONE["d"] + JETTY["long"]

static func on_stone(p: Vector2) -> bool:
	return p.x >= 0.0 and p.x <= STONE["w"] and p.y >= 0.0 and p.y <= STONE["d"]

# --- LINES ON THE STONE ---

static func root_at(u: float) -> Vector2:
	return Vector2(u, -ROOT_OUT)

## The line a tentacle rooted at `u` slams along at turn `deg`: {a, b, len}.
static func slam_line(u: float, deg: float) -> Dictionary:
	var dx := sin(deg * D)
	var dy := cos(deg * D)
	var s0 := ROOT_OUT / dy
	var s1 := (STONE["d"] + ROOT_OUT) / dy
	if dx > 1e-9:
		s1 = minf(s1, (STONE["w"] - u) / dx)
	if dx < -1e-9:
		s1 = minf(s1, -u / dx)
	return {"a": Vector2(u + dx * s0, -ROOT_OUT + dy * s0), "b": Vector2(u + dx * s1, -ROOT_OUT + dy * s1), "len": s1}

## The drawn turn of a tentacle rooted at `u` (its turns `range`) nearest the line toward `to`.
static func turn_toward(u: float, range_: Vector2, to: Vector2) -> float:
	var deg := atan2(to.x - u, to.y + ROOT_OUT) / D
	var snapped := roundf(deg / TURNS["step"]) * TURNS["step"]
	return maxf(range_.x, minf(range_.y, snapped))

## How far `p` is from the line `s`.
static func off_line(p: Vector2, s: Dictionary) -> float:
	var e: Vector2 = s["b"] - s["a"]
	var l2 := e.length_squared()
	if l2 == 0.0:
		l2 = 1.0
	var k := clampf((p - s["a"]).dot(e) / l2, 0.0, 1.0)
	return p.distance_to(s["a"] + e * k)

## Where a wave's front is along the stone at depth `v`, `t` seconds after its smash.
static func wave_front(from: String, t: float, v: float) -> float:
	var along: float = -WAVE["off"] + WAVE["speed"] * t - WAVE["slant"] * clampf(v, 0.0, STONE["d"])
	return along if from == "l" else STONE["w"] - along

static func hook_covers(edge: String, v: float) -> bool:
	return v - HERO_R < HOOK["reach"]["back"] if edge == "back" else v + HERO_R > STONE["d"] - HOOK["reach"]["near"]

## Where a scraping hook's front is along the stone, `t` seconds after it began, toward his `end` (INF: not on it).
static func hook_front(end: String, t: float) -> float:
	if t < HOOK["scrape"][0] or t >= HOOK["scrape"][1]:
		return INF
	var went: float = HOOK["speed"] * (t - HOOK["scrape"][0])
	return STONE["w"] + HOOK["start"] - went if end == "l" else -HOOK["start"] + went

static func in_snap(end: String, p: Vector2) -> bool:
	var in_from: float = p.x if end == "l" else STONE["w"] - p.x
	return in_from - HERO_R < SNAP["deep"] and p.y + HERO_R > SNAP["across"][0] and p.y - HERO_R < SNAP["across"][1]

## The baked spot nearest a place (its index).
static func eye_spot_near(p: Vector2) -> int:
	var best := 0
	var bd := INF
	for i in EYE3_SPOTS.size():
		var d: float = p.distance_to(EYE3_SPOTS[i])
		if d < bd:
			bd = d
			best = i
	return best

## The baked aim nearest the line to a place from the gaze's middle (its index).
static func gaze_aim_near(p: Vector2) -> int:
	var at: Vector2 = EYE3["gazeAt"]
	var toward := atan2(p.x - at.x, p.y - at.y) / D
	var best := 0
	var aims: Array = EYE3["aims"]
	for i in aims.size():
		if absf(aims[i] - toward) < absf(aims[best] - toward):
			best = i
	return best

## (Phase 2) The baked aim nearest the line to a place from the water under his eye at his place (its index).
static func gaze2_aim_near(p: Vector2) -> int:
	var at: Vector2 = BODY2["gazeAt"]
	var toward := atan2(p.x - at.x, p.y - at.y) / D
	var best := 0
	var aims: Array = BODY2["aims"]
	for i in aims.size():
		if absf(aims[i] - toward) < absf(aims[best] - toward):
			best = i
	return best

## A gaze's beam crosses the hero this step (from `was` to its `t` seconds).
static func gaze_crosses(E, was: float, hero: Vector2) -> bool:
	var k0: float = (was - GAZE["warn"]) / GAZE["sweep"]
	var k1: float = (E.t - GAZE["warn"]) / GAZE["sweep"]
	var deg := atan2(hero.x - E.at.x, hero.y - E.at.y) / D
	var lo: float = E.a0 + (E.a1 - E.a0) * maxf(0.0, k0)
	var hi: float = E.a0 + (E.a1 - E.a0) * minf(1.0, k1)
	var far: float = hero.distance_to(E.at)
	if far == 0.0:
		far = 1.0
	var slack := atan((GAZE["width"] / 2.0 + HERO_R) / far) / D
	return deg >= minf(lo, hi) - slack and deg <= maxf(lo, hi) + slack

## How far round a pool of his bile is, `s` seconds after it landed.
static func pool_r(s: float) -> float:
	var P: Dictionary = BODY2["bile"]["pool"]
	if s < 0.0 or s >= P["life"]:
		return 0.0
	if s < P["spread"]:
		return P["r"] * s / P["spread"]
	if s < P["hold"]:
		return P["r"]
	return P["r"] * (1.0 - (s - P["hold"]) / (P["life"] - P["hold"]))

static func eye_home() -> Vector2:
	return Vector2(FORWARD["u"], FORWARD["v"] + FORWARD["eye"])

# --- WHAT IT KEEPS ---

class Arm:
	var id := 0
	## Which of the phase's: 0 left (or phase 1's left), 1 middle (or phase 1's right), 2 right.
	var k := 0
	var u := 0.0
	var side := "l"
	var range_ := Vector2.ZERO
	## rise, stand, slam, smash, under, duck, dying, dead
	var state := "rise"
	var t := 0.0
	var rest := 0
	var turn := 0.0
	var line = null
	var landed := false
	var ready := 0
	var pair := false

class Wave:
	var from := "l"
	var t := 0.0
	var meets := false
	var passed := false

class Shovel:
	var end := "l"
	var t := 0.0
	var hooks: Array = []
	var snap := -1.0
	var snapping := false
	var snapped := false
	var snaps := 0
	var snap_end := -9.0

class EyeMove:
	var kind := "gaze"
	var t := 0.0
	var a0 := 0.0
	var a1 := 0.0
	var at := Vector2.ZERO
	var landed := false
	var pic := 0

class BodyMove:
	var kind := "bile"
	var t := 0.0
	var at := Vector2.ZERO
	var a0 := 0.0
	var a1 := 0.0
	var landed := false
	var pic := -1

class Pool:
	var u := 0.0
	var v := 0.0
	var t := 0.0
	var burn := 0.0

class Rain:
	var u := 0.0
	var v := 0.0
	var t := 0.0

var ph := 1
## idle, fight, between, change, won
var mode := "idle"
var time := 0.0
var ph_t := 0.0
## His stand's clock (or his lurk's), seconds.
var body := 0.0
var arms: Array = []
var waves: Array = []
var shovel: Shovel = null
var rains: Array = []
var eye: EyeMove = null
var eye_in := 0.0
var slam_rounds := 99
## Seconds since the hero stepped onto the stone while he wakes; -1 once his tentacles have risen.
var wake_t := -1.0
## (Phase 3) His eye struck at rest: {t, from}; empty: none.
var struck := {}
## (Phase 3) The siege's bolts fall (the game's: while a pillar burns, or where none stand).
var siege := true
var body2: BodyMove = null
var body2_in := INF
var body2_next := "bile"
var pools: Array = []
var eye_next := "gaze"
var water_in := 0.0
var water_next := "l"
var shovel_in := 0.0
var rain_in := 0.0
## A crash: {t, hit, surge}; empty: none.
var crash := {}
var between_t := 0.0
## The pillars burn (phase 3): his ward holds.
var shielded := false
var _next_id := 1
## The tentacles' clock (seconds): their stands are frames of it; set to 0 as they rise.
var arm_clock := 0.0


## The hero has come onto the stone: phase 1, its two tentacles bursting up.
func begin() -> Array:
	var ev: Array = []
	if mode != "idle":
		return ev
	mode = "fight"
	wake_t = 0.0
	_start_phase(1, ev)
	return ev


func _start_phase(p: int, ev: Array) -> void:
	ph = p
	ph_t = 0.0
	mode = "fight"
	var P: Dictionary = PACE[p]
	water_in = P["waterFirst"] if P["water"] != null else INF
	water_next = "l"
	shovel_in = P["shovelFirst"] if P["shovel"] != null else INF
	rain_in = RAIN["every"] if p == 3 else INF
	eye_in = EYE_PACE["first"] if p == 3 else INF
	body2_in = BODY2["first"] if p == 2 else INF
	body2 = null
	var all_dead := true
	for a in arms:
		if a.state != "dead":
			all_dead = false
	if p < 3 and wake_t < 0.0 and all_dead:
		_raise_arms(p, ev)
	elif p == 2:
		# (his entrance ends on his tentacles' stand's first frame: their clock begins again with the phase)
		arm_clock = 0.0
	ev.append({"t": "phase", "ph": p})


func _raise_arms(p: int, ev: Array) -> void:
	var turns: Array = TURNS[1] if p == 1 else TURNS[2]
	arms = []
	var roots: Array = ROOTS[p]
	for k in roots.size():
		var a := Arm.new()
		a.id = _next_id
		_next_id += 1
		a.k = k
		a.u = roots[k]
		a.side = ("l" if k == 0 else "r") if p == 1 else ["l", "m", "r"][k]
		a.range_ = turns[k]
		ev.append({"t": "armUp", "id": a.id})
		arms.append(a)
	arm_clock = 0.0


## Whether the hero's blows reach this tentacle now.
func arm_struck(a: Arm) -> bool:
	return a.state == "stand" or a.state == "slam" or a.state == "smash" or (a.state == "rise" and a.t >= ARM["burst"] * 0.4)


## Where the hero's blows reach a tentacle: round its root, and (lying after a slam) along its line.
func arm_shape(a: Arm) -> Dictionary:
	var lying = a.line if a.state == "slam" and a.line != null and a.t >= SLAM["lying"][0] and a.t < SLAM["lying"][1] else null
	return {"root": root_at(a.u), "r": ARM["r"], "lying": lying}


## Whether the hero's blows reach his body now, and where it is (phase 3 only): {at, r}; empty: not.
func body_struck() -> Dictionary:
	if ph != 3 or mode != "fight":
		return {}
	var E := eye
	if E != null and E.kind == "slam" and E.landed and E.t < EYE_SLAM["up"]:
		return {"at": E.at, "r": FORWARD["r"]}
	return {"at": eye_home(), "r": FORWARD["r"]}


func arm_of(id: int) -> Arm:
	for a in arms:
		if a.id == id:
			return a
	return null


## The game: a tentacle's life is gone.
func arm_killed(id: int) -> Array:
	var ev: Array = []
	var a := arm_of(id)
	if a == null or a.state == "dying" or a.state == "dead":
		return ev
	a.state = "dying"
	a.t = 0.0
	a.line = null
	ev.append({"t": "armDies", "id": id})
	var all := true
	for q in arms:
		if q.state != "dying" and q.state != "dead":
			all = false
	if ph < 3 and mode == "fight" and all:
		mode = "between"
		between_t = 0.0
		waves = []
		crash = {}
		rains = []
		body2 = null
		ev.append({"t": "flasks"})
	return ev


## The game: his body's life is gone (phase 3): the fight is won.
func body_killed() -> Array:
	if mode == "won":
		return []
	mode = "won"
	for a in arms:
		if a.state != "dead":
			a.state = "dying"
	return [{"t": "won"}]


## How much of his pace the hero has here (the crash's surge slows him).
func pace_at(p: Vector2) -> float:
	if not crash.is_empty() and crash["t"] >= CRASH["surge"][0] and crash["t"] < CRASH["surge"][1] and absf(p.x - STONE["w"] / 2.0) < CRASH["half"]:
		return CRASH["slow"]
	return 1.0


## A step of the fight: `hero` where he stands on the stone, `dodging` while he rolls or leaps through.
func step(dt: float, hero: Vector2, dodging: bool) -> Array:
	var ev: Array = []
	if mode == "idle":
		return ev
	time += dt
	ph_t += dt
	var body_was := body
	body += dt
	var body_round := floorf(body / BODY["stand"]) > floorf(body_was / BODY["stand"])
	var clock_was := arm_clock
	arm_clock += dt
	var arm_round := floorf(arm_clock / ARM["stand"]) > floorf(clock_was / ARM["stand"])
	# (his waking: his two tentacles burst up when it is time)
	if wake_t >= 0.0:
		wake_t += dt
		if wake_t >= WAKE["still"] and wake_t - dt < WAKE["still"]:
			ev.append({"t": "stir"})
		if wake_t >= WAKE["rise"]:
			wake_t = -1.0
			_raise_arms(1, ev)
	_step_arms(dt, hero, dodging, arm_round, ev)
	_step_waves(dt, hero, dodging, ev)
	_step_shovel(dt, hero, dodging, ev)
	_step_rain(dt, hero, dodging, ev)
	_step_body2(dt, hero, dodging, body_was, ev)
	if mode == "between":
		between_t += dt
		if between_t >= BETWEEN["least"] and body_round:
			mode = "change"
			ph_t = 0.0
			body = 0.0
			shovel = null
			waves = []
			ev.append({"t": "change", "to": ph + 1})
	elif mode == "change":
		var C: Dictionary = ENTRANCE if ph == 1 else CHANGE3
		if C["armsUp"] < C["long"] and ph_t >= C["armsUp"] and ph_t - dt < C["armsUp"]:
			_raise_arms(ph + 1, ev)
		if ph == 2 and ph_t >= CHANGE3["slide"] and ph_t - dt < CHANGE3["slide"]:
			ev.append({"t": "slide"})
		if ph == 2 and ph_t >= CHANGE3["grip"] and ph_t - dt < CHANGE3["grip"]:
			ev.append({"t": "grip"})
		if ph_t >= C["long"]:
			# (into phase 2 his stand begins again; into phase 3 it runs on from his slide, as the art's take has it)
			if ph == 1:
				body = 0.0
			_start_phase(ph + 1, ev)
	elif mode == "fight":
		if ph == 3:
			_step_eye(dt, hero, dodging, body_round, ev)
		else:
			_direct(dt, hero, arm_round, body_round, ev)
	return ev


# --- his tentacles ---

func _step_arms(dt: float, hero: Vector2, dodging: bool, arm_round: bool, ev: Array) -> void:
	for a in arms:
		var was: float = a.t
		a.t += dt
		if a.state == "rise" and a.t >= ARM["burst"]:
			a.state = "stand"
			a.t = 0.0
			a.rest = _rest_for()
		elif a.state == "dying" and a.t >= ARM["death"]:
			a.state = "dead"
			ev.append({"t": "armGone", "id": a.id})
		elif a.state == "slam" and a.line != null:
			if not a.landed and a.t >= SLAM["hit"]:
				a.landed = true
				ev.append({"t": "slam", "id": a.id, "line": a.line})
				if not dodging and off_line(hero, a.line) < SLAM["width"] / 2.0 + HERO_R:
					ev.append({"t": "hurt", "by": "slam", "mult": HURTS["slam"], "du": 0.0, "dv": 0.0, "secs": 0.0})
			if was < SLAM["drag"] and a.t >= SLAM["drag"]:
				ev.append({"t": "drag", "id": a.id})
			if a.t >= SLAM["long"]:
				_back_to_stand(a)
		elif a.state == "smash":
			if not a.landed and a.t >= SMASH["hit"]:
				a.landed = true
				var from := "l" if a.side == "l" else "r"
				ev.append({"t": "smash", "id": a.id, "from": from})
				var w := Wave.new()
				w.from = from
				w.t = a.t - SMASH["hit"]
				w.meets = a.pair
				waves.append(w)
			if a.t >= SMASH["long"]:
				_back_to_stand(a)
	if arm_round:
		for a in arms:
			if a.state == "stand":
				a.ready += 1


func _back_to_stand(a: Arm) -> void:
	a.state = "stand"
	a.t = 0.0
	a.line = null
	a.landed = false
	a.ready = 0
	a.rest = _rest_for()


func _rest_for() -> int:
	var r: Array = PACE[ph]["rest"]
	return randi_range(int(r[0]), int(r[1]))


# --- the director: who moves next ---

func _direct(dt: float, hero: Vector2, arm_round: bool, body_round: bool, ev: Array) -> void:
	water_in -= dt
	shovel_in -= dt
	if shovel != null:
		return
	var moving := body2 != null
	for a in arms:
		if a.state == "slam" or a.state == "smash" or a.state == "rise" or a.state == "duck":
			moving = true
	# THE SHOVEL: due, his tentacles still, no wave rolling, as his stand comes round
	if shovel_in <= 0.0:
		if not moving and waves.is_empty() and body_round:
			_begin_shovel(ev)
		return
	if not arm_round:
		return
	slam_rounds += 1
	var stand: Array = []
	for a in arms:
		if a.state == "stand":
			stand.append(a)
	for a in stand:
		if a.rest > 0:
			a.rest -= 1
	var ready: Array = stand.filter(func(a): return a.rest <= 0)
	# (the longest ready first; of those as long, in their order, as the game's sort keeps them)
	ready.sort_custom(func(x, y): return x.ready > y.ready or (x.ready == y.ready and x.k < y.k))
	if ready.is_empty():
		return
	# THE WATER SLAMS, in his order, one wave at a time
	if water_in <= 0.0 and waves.is_empty():
		var L: Arm = null
		var R: Arm = null
		for a in arms:
			if a.state != "dying" and a.state != "dead":
				if a.side == "l" and L == null:
					L = a
				if a.side == "r" and R == null:
					R = a
		var want := water_next
		if want == "both" and not (L != null and R != null):
			want = "l" if L != null else "r"
		if want == "l" and L == null:
			want = "r" if R != null else "l"
		if want == "r" and R == null:
			want = "l" if L != null else "r"
		var who: Array = [L, R] if want == "both" else [L if want == "l" else R]
		var all_ready := true
		for a in who:
			if a == null or a.state != "stand" or a.rest > 0:
				all_ready = false
		if all_ready:
			for a in who:
				_begin_smash(a, who.size() == 2, ev)
			water_next = "r" if water_next == "l" else ("both" if water_next == "r" else "l")
			var w = PACE[ph]["water"]
			water_in = randf_range(w[0], w[1]) if w != null else INF
			return
		if L == null and R == null:
			water_in = INF
	# A SLAM ON THE STONE: one warning laid at a time, and no sooner than its gap after the last
	for a in arms:
		if (a.state == "slam" or a.state == "smash") and a.t < SLAM["hit"]:
			return
	if slam_rounds < int(PACE[ph]["gap"]):
		return
	slam_rounds = 0
	_begin_slam(ready[0], hero, ev)


func _begin_slam(a: Arm, hero: Vector2, ev: Array) -> void:
	a.state = "slam"
	a.t = 0.0
	a.landed = false
	a.turn = turn_toward(a.u, a.range_, hero)
	var L := slam_line(a.u, a.turn)
	a.line = {"a": L["a"], "b": L["b"]}
	ev.append({"t": "warn", "id": a.id, "line": a.line})


func _begin_smash(a: Arm, pair: bool, ev: Array) -> void:
	a.state = "smash"
	a.pair = pair
	a.t = 0.0
	a.landed = false
	a.line = null
	ev.append({"t": "smashWarn", "id": a.id, "from": "l" if a.side == "l" else "r"})


# --- the waves and the crash ---

func _step_waves(dt: float, hero: Vector2, dodging: bool, ev: Array) -> void:
	for w in waves:
		w.t += dt
		if w.passed:
			continue
		var front := wave_front(w.from, w.t, hero.y)
		if w.meets:
			front = minf(front, STONE["w"] / 2.0) if w.from == "l" else maxf(front, STONE["w"] / 2.0)
		var ahead: float = front - (hero.x - HERO_R) if w.from == "l" else hero.x + HERO_R - front
		if ahead >= 0.0 and ahead < WAVE["face"] + 2.0 * HERO_R:
			w.passed = true
			if not dodging:
				ev.append({"t": "hurt", "by": "wave", "mult": HURTS["wave"], "du": WAVE["knock"] if w.from == "l" else -WAVE["knock"], "dv": 0.0, "secs": 0.25})
		elif ahead >= WAVE["face"] + 2.0 * HERO_R:
			w.passed = true
	# both at once: they meet in the middle
	var meet: Array = waves.filter(func(w): return w.meets)
	if meet.size() == 2 and crash.is_empty() and meet[0].t >= (STONE["w"] / 2.0 + WAVE["off"]) / WAVE["speed"]:
		crash = {"t": 0.0, "hit": false, "surge": false}
		ev.append({"t": "crash", "u": STONE["w"] / 2.0, "v": CRASH["v"]})
		waves = waves.filter(func(w): return not w.meets)
	var gone: float = (STONE["w"] + WAVE["off"] + WAVE["die"]) / WAVE["speed"] + (WAVE["slant"] * STONE["d"]) / WAVE["speed"]
	waves = waves.filter(func(w): return w.t < gone)
	if not crash.is_empty():
		crash["t"] += dt
		if not crash["hit"] and crash["t"] >= CRASH["hit"]:
			crash["hit"] = true
			if not dodging and hero.distance_to(Vector2(STONE["w"] / 2.0, CRASH["v"])) < CRASH["r"] + HERO_R:
				ev.append({"t": "hurt", "by": "crash", "mult": HURTS["crash"], "du": 0.0, "dv": 1.2, "secs": 0.3})
		if not crash["surge"] and crash["t"] >= CRASH["surge"][0]:
			crash["surge"] = true
			ev.append({"t": "surge", "on": true})
		if crash["t"] >= CRASH["surge"][1]:
			crash = {}
			ev.append({"t": "surge", "on": false})


# --- the shovel and the snap ---

func _begin_shovel(ev: Array) -> void:
	var S := Shovel.new()
	S.end = "l" if randf() < 0.5 else "r"
	for h in SHOVEL["hooks"]:
		S.hooks.append({"edge": h["edge"], "passed": false})
	shovel = S
	for a in arms:
		if a.state == "stand":
			a.state = "under"
			a.t = 0.0
	ev.append({"t": "sink", "end": S.end})


func _step_shovel(dt: float, hero: Vector2, dodging: bool, ev: Array) -> void:
	var S := shovel
	if S == null:
		return
	var was := S.t
	S.t += dt
	var passes := func(at: float) -> bool: return was < at and S.t >= at
	if passes.call(SHOVEL["burst"]):
		ev.append({"t": "burst", "end": S.end})
	var hooks: Array = SHOVEL["hooks"]
	for i in hooks.size():
		var h: Dictionary = hooks[i]
		if passes.call(h["at"]):
			ev.append({"t": "hook", "edge": h["edge"], "end": S.end})
		if passes.call(h["at"] + HOOK["scrape"][0]):
			ev.append({"t": "scrape", "edge": h["edge"], "end": S.end})
		var H: Dictionary = S.hooks[i]
		if H["passed"]:
			continue
		var front := hook_front(S.end, S.t - h["at"])
		if front == INF:
			continue
		if not hook_covers(h["edge"], hero.y):
			continue
		# the hook goes toward his end: it is over the hero from its front reaching him until its back has gone by
		var over: bool
		var gone: bool
		if S.end == "l":
			over = hero.x + HERO_R >= front and hero.x - HERO_R <= front + HOOK["thick"]
			gone = front + HOOK["thick"] < hero.x - HERO_R
		else:
			over = hero.x - HERO_R <= front and hero.x + HERO_R >= front - HOOK["thick"]
			gone = front - HOOK["thick"] > hero.x + HERO_R
		if gone:
			H["passed"] = true
		elif over:
			H["passed"] = true
			if not dodging:
				var to_end: float = hero.x - HERO_R if S.end == "l" else STONE["w"] - hero.x - HERO_R
				var k := clampf(to_end, 0.0, HOOK["knock"])
				ev.append({"t": "hurt", "by": "scrape", "mult": HURTS["scrape"], "du": -k if S.end == "l" else k, "dv": 0.0, "secs": HOOK["knockSecs"]})
	# THE SNAP: the hero too near his gaping maw
	if S.snapping:
		S.snap += dt
		if not S.snapped and S.snap >= SNAP["shut"]:
			S.snapped = true
			ev.append({"t": "snap", "end": S.end})
			if not dodging and in_snap(S.end, hero):
				ev.append({"t": "hurt", "by": "snap", "mult": HURTS["snap"], "du": 1.0 if S.end == "l" else -1.0, "dv": 0.0, "secs": 0.3})
		if S.snap >= SNAP["long"]:
			S.snapping = false
			S.snap = -1.0
			S.snap_end = S.t
	elif S.t >= SHOVEL["gape"][0] and S.t < SNAP["last"] and S.t - S.snap_end >= SNAP["again"] and in_snap(S.end, hero):
		S.snapping = true
		S.snap = 0.0
		S.snapped = false
		S.snaps += 1
		ev.append({"t": "twitch", "end": S.end})
	if passes.call(SHOVEL["back"]):
		ev.append({"t": "back"})
	if passes.call(SHOVEL["armsUp"]):
		for a in arms:
			if a.state == "under":
				a.state = "rise"
				a.t = 0.0
				ev.append({"t": "armUp", "id": a.id})
		# (they come up with him as the art's shovel has them, their stands on its clock)
		arm_clock = fmod(SHOVEL["armsUp"], ARM["stand"])
	if S.t >= SHOVEL["long"] and not S.snapping:
		shovel = null
		body = 0.0
		var sh = PACE[ph]["shovel"]
		shovel_in = randf_range(sh[0], sh[1]) if sh != null else INF


# --- phase 3: his eye's attacks, by turns ---

func _step_eye(dt: float, hero: Vector2, dodging: bool, body_round: bool, ev: Array) -> void:
	if not struck.is_empty():
		struck["t"] += dt
		if struck["t"] >= EYE3["struck"]:
			struck = {}
	var E := eye
	if E == null:
		# (each begun as his stand comes round, as baked)
		eye_in -= dt
		if eye_in > 0.0 or not body_round:
			return
		struck = {}
		if eye_next == "gaze":
			# (laid along the baked aim nearest the hero, swept from its one side to its other as the art paints it)
			var j := gaze_aim_near(hero)
			var aim: float = EYE3["aims"][j]
			eye = EyeMove.new()
			eye.kind = "gaze"
			eye.a0 = aim - GAZE["half"]
			eye.a1 = aim + GAZE["half"]
			eye.at = EYE3["gazeAt"]
			eye.pic = j
			ev.append({"t": "gazeWarn", "a0": eye.a0, "a1": eye.a1})
		else:
			# (on the baked spot nearest the hero: all within EYE_SLAM.reach of his eye)
			var i := eye_spot_near(hero)
			eye = EyeMove.new()
			eye.kind = "slam"
			eye.at = EYE3_SPOTS[i]
			eye.pic = i
			ev.append({"t": "eyeWarn", "u": eye.at.x, "v": eye.at.y})
		eye_next = "slam" if eye_next == "gaze" else "gaze"
		return
	var was := E.t
	E.t += dt
	if E.kind == "gaze":
		if was < GAZE["warn"] and E.t >= GAZE["warn"]:
			ev.append({"t": "gaze"})
		if not E.landed and E.t >= GAZE["warn"] and E.t < GAZE["warn"] + GAZE["sweep"] and gaze_crosses(E, was, hero):
			E.landed = true
			if not dodging:
				ev.append({"t": "hurt", "by": "gaze", "mult": HURTS["gaze"], "du": 0.0, "dv": 0.0, "secs": 0.0})
		if E.t >= GAZE["long"]:
			_end_eye()
	else:
		if not E.landed and E.t >= EYE_SLAM["hit"]:
			E.landed = true
			ev.append({"t": "eyeSlam", "u": E.at.x, "v": E.at.y})
			if not dodging and hero.distance_to(E.at) < EYE_SLAM["r"] + HERO_R:
				ev.append({"t": "hurt", "by": "eye", "mult": HURTS["eye"], "du": 0.0, "dv": 0.0, "secs": 0.0})
		if E.t >= EYE_SLAM["long"]:
			_end_eye()


# --- phase 2: his body's own attacks, the bile arc and the gaze; his bile's pools ---

func _step_body2(dt: float, hero: Vector2, dodging: bool, body_was: float, ev: Array) -> void:
	var P: Dictionary = BODY2["bile"]["pool"]
	for p in pools:
		p.t += dt
		if not dodging and p.t >= p.burn and hero.distance_to(Vector2(p.u, p.v)) < pool_r(p.t):
			p.burn = p.t + P["tick"]
			ev.append({"t": "hurt", "by": "pool", "mult": HURTS["pool"], "du": 0.0, "dv": 0.0, "secs": 0.0})
	pools = pools.filter(func(p): return p.t < P["life"])
	if ph != 2 or mode != "fight":
		return
	var B := body2
	if B == null:
		body2_in -= dt
		if body2_in > 0.0 or shovel != null or shovel_in <= 0.0:
			return
		# (as his stand comes to the frame the art's takes begin on)
		var at: float = BODY2["at"] / FPS
		if not (floorf((body - at) / BODY["stand"]) > floorf((body_was - at) / BODY["stand"])):
			return
		var mid: Arm = null
		for a in arms:
			if a.side == "m":
				mid = a
				break
		if body2_next == "gaze":
			# (his middle tentacle stands in the arc: the gaze waits for it to stand, and it ducks under through it)
			if mid != null and mid.state != "stand" and mid.state != "dying" and mid.state != "dead":
				return
			var o: Vector2 = BODY2["gazeAt"]
			body2 = BodyMove.new()
			body2.kind = "gaze"
			body2.at = o
			if GAZE2_AIMED:
				# (along the nearest aim pictured, its sides held where the art holds them)
				var j := gaze2_aim_near(hero)
				var aim: float = BODY2["aims"][j]
				body2.a0 = maxf(-BODY2["lim"], aim - GAZE["half"])
				body2.a1 = minf(BODY2["lim"], aim + GAZE["half"])
				body2.pic = j
			else:
				var toward := atan2(hero.x - o.x, hero.y - o.y) / D
				body2.a0 = toward - GAZE["half"]
				body2.a1 = toward + GAZE["half"]
			if mid != null and mid.state == "stand":
				mid.state = "duck"
				mid.t = 0.0
			ev.append({"t": "gazeWarn", "a0": body2.a0, "a1": body2.a1})
		else:
			body2 = BodyMove.new()
			body2.kind = "bile"
			body2.at = Vector2(clampf(hero.x, 0.0, STONE["w"]), clampf(hero.y, 0.0, STONE["d"]))
			ev.append({"t": "bileWarn", "u": body2.at.x, "v": body2.at.y})
		body2_next = "bile" if body2_next == "gaze" else "gaze"
		return
	var was := B.t
	B.t += dt
	if B.kind == "bile":
		var L: Dictionary = BODY2["bile"]
		if was < L["release"] and B.t >= L["release"]:
			ev.append({"t": "retch"})
		if not B.landed and B.t >= L["land"]:
			B.landed = true
			ev.append({"t": "bile", "u": B.at.x, "v": B.at.y})
			if not dodging and hero.distance_to(B.at) < L["splash"] + HERO_R:
				ev.append({"t": "hurt", "by": "bile", "mult": HURTS["bile"], "du": 0.0, "dv": 0.0, "secs": 0.0})
			var q := Pool.new()
			q.u = B.at.x
			q.v = B.at.y
			q.t = B.t - L["land"]
			q.burn = P["tick"]
			pools.append(q)
		if B.t >= L["long"]:
			_end_body2()
	else:
		if was < GAZE["warn"] and B.t >= GAZE["warn"]:
			ev.append({"t": "gaze"})
		if not B.landed and B.t >= GAZE["warn"] and B.t < GAZE["warn"] + GAZE["sweep"] and gaze_crosses(B, was, hero):
			B.landed = true
			if not dodging:
				ev.append({"t": "hurt", "by": "gaze", "mult": HURTS["gaze"], "du": 0.0, "dv": 0.0, "secs": 0.0})
		if B.t >= GAZE["long"]:
			_end_body2()


func _end_body2() -> void:
	body2 = null
	body2_in = randf_range(BODY2["every"][0], BODY2["every"][1])
	for a in arms:
		if a.state == "duck":
			a.state = "stand"
			a.t = 0.0


func _end_eye() -> void:
	eye = null
	eye_in = randf_range(EYE_PACE["rest"][0], EYE_PACE["rest"][1])


## The game: his eye took a blow (phase 3). At rest it flinches (pictured from the nearest of his stand's frames baked), not again
## until most of a flinch is over.
func eye_hit() -> void:
	if ph != 3 or mode != "fight" or eye != null:
		return
	if not struck.is_empty() and struck["t"] < EYE3["struck"] * 0.6:
		return
	var c := fmod(body * 30.0, 90.0)
	var from: int = EYE3["struckFrom"][0]
	var d := func(x: float) -> float: return minf(absf(c - x), 90.0 - absf(c - x))
	for s in EYE3["struckFrom"]:
		if d.call(s) < d.call(from):
			from = s
	struck = {"t": 0.0, "from": from}


# --- phase 3: the siege's bolts ---

func _step_rain(dt: float, hero: Vector2, dodging: bool, ev: Array) -> void:
	for r in rains:
		var was: float = r.t
		r.t += dt
		if was < RAIN["warn"] and r.t >= RAIN["warn"]:
			ev.append({"t": "rain", "u": r.u, "v": r.v})
			if not dodging and hero.distance_to(Vector2(r.u, r.v)) < RAIN["r"] + HERO_R:
				ev.append({"t": "hurt", "by": "rain", "mult": HURTS["rain"], "du": 0.0, "dv": 0.0, "secs": 0.0})
	rains = rains.filter(func(r): return r.t < RAIN["warn"] + 0.4)
	if ph != 3 or mode != "fight" or not siege:
		return
	rain_in -= dt
	if rain_in > 0.0:
		return
	rain_in = RAIN["every"]
	for i in int(RAIN["n"]):
		var u := hero.x
		var v := hero.y
		if i > 0:
			var ang := randf_range(0.0, TAU)
			var far := randf_range(RAIN["near"], RAIN["far"])
			u = clampf(u + cos(ang) * far, 0.5, STONE["w"] - 0.5)
			v = clampf(v + sin(ang) * far, 0.5, STONE["d"] - 0.5)
		var q := Rain.new()
		q.u = u
		q.v = v
		rains.append(q)
		ev.append({"t": "rainWarn", "u": u, "v": v})
