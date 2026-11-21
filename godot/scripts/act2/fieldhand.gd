## THE FIELDHANDS OF THE MILLRACE (floor 13), reapers and gleaners, as the game fights them with their new move on (game/act1_rules/
## fieldhand.ts RULES, BOOM_ACTS: FIELD_HARVEST on; art/action_f11_field.ts). His pick of 2 Nov 2026, 07:46: "Sickle boomerang
## (Recommended)", offered as: the sickle thrown spinning out in a wide curve and back to the hand. Dodge it going out and coming back.
##   THEIR SHUFFLE: 0.9 tiles a second, stopping at any frame; 0.95 tiles off, and 0.25 nearer.
##   THE SICKLE BOOMERANG (from 2 to 6 tiles; list `attack`, 3 s): turned along the floor's way nearest him, drawn back far, the way it
##     will fly marked on the ground from 0.12 s (a loop out to their left, round, and back on their right); flung at 0.767 s, spinning
##     out along the curve and back to the hand at 2.267 s; a hero within 0.75 of it struck x1, once going out and once coming back;
##     caught, they stagger a step back.
##   A REAPER OR A GLEANER, by its own seed: as the floor's monsters.json carries each one's figure and name.
extends "res://scripts/act1/act1.gd"

const GAIT := {"pace": 0.9, "cycle": 1.0 / 8.0, "setOff": 0.0, "halt": 0.0, "stopAt": 0.95, "slack": 0.25, "trueBack": true}
## (BOOM, BOOM_HIT, BOOM_CATCH, BOOM_BACK)
const BOOM := {"mark": 0.12, "fly": 1.5, "out": 6.0, "wide": 1.9, "dip": 10.0, "r": 0.75, "long": 3.0, "near": 2.0, "far": 6.0}
const BOOM_HIT := 23.0 / 30.0
const BOOM_CATCH := 23.0 / 30.0 + 1.5
const ACTS := [
	{"id": "fieldhand:boom", "clip": "attack", "long": 3.0, "hit": BOOM_HIT, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.8, "near": 2.0, "far": 6.0},
]
## (where the sickle leaves the hand and comes back to it: sickleOf(skeletonAt(BOOM_REAPER, 'attack', BOOM_HIT / BOOM_CATCH)).mid, in
## tiles before them and to their left, and their own lengths up)
const A := Vector3(1.066988342126029, -0.003578609928425261, 39.45489119454666)
const B := Vector3(0.3038725467058524, -0.7759742105478585, 45.85973971183595)
## (BOOM_BACK: a step back as it is caught, their own lengths; TILE3 of them a tile)
const BACK := -5.0
const TILE3 := 39.191835884530846
## (art/act1_figs/fieldhand.ts SICKLE_N, CURVE_LAY, CURVE_GONE)
const SICKLE_N := 45
const CURVE_LAY := 8
const CURVE_GONE := 16


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## boomAt: where the sickle is `t` seconds into the move while it is away (tiles before them, to their left; its height); null else.
static func boom_at(t: float):
	if not (t > BOOM_HIT + 1e-6 and t < BOOM_CATCH - 1e-6):
		return null
	var u := (t - BOOM_HIT) / float(BOOM["fly"])
	var mx := (A.x + B.x) / 2.0
	return Vector4(A.x + (B.x - A.x) * u + (float(BOOM["out"]) - mx) * sin(PI * u), A.y + (B.y - A.y) * u + float(BOOM["wide"]) * sin(2.0 * PI * u),
		A.z + (B.z - A.z) * u - float(BOOM["dip"]) * sin(PI * u), u)


## boomStrikes: whether it strikes a hero `x` before them and `y` to their left at `t`: "out", "back", or "".
static func boom_strikes(t: float, x: float, y: float) -> String:
	var p = boom_at(t)
	if p == null or Vector2(x - p.x, y - p.y).length() > float(BOOM["r"]):
		return ""
	return "out" if p.w < 0.5 else "back"


## sickleFrame, curveFrame: which of their pictures `t` seconds in (-1: none).
static func sickle_frame(t: float) -> int:
	return -1 if (t <= BOOM_HIT or t >= BOOM_CATCH) else mini(SICKLE_N - 1, floori((t - BOOM_HIT) * 30.0))


static func curve_frame(t: float) -> int:
	if t < float(BOOM["mark"]) or t >= BOOM_CATCH:
		return -1
	if t < BOOM_HIT:
		return mini(CURVE_LAY - 1, floori(((t - float(BOOM["mark"])) / 0.24) * CURVE_LAY))
	return CURVE_LAY - 1 + mini(CURVE_GONE, floori(((t - BOOM_HIT) / float(BOOM["fly"])) * CURVE_GONE))


## The way their picture faces (one of the floor's four, as backView and flipped choose it).
static func axis_of(f: Vector2) -> Vector2:
	var back := f.x + f.y < -0.2
	var flip := f.x - f.y < 0.0
	return (Vector2(-1, 0) if flip else Vector2(0, -1)) if back else (Vector2(0, 1) if flip else Vector2(1, 0))


func start(m, a: Dictionary, _hero) -> void:
	if a["id"] == "fieldhand:boom":
		m.face = axis_of(m.face)
		act["hand"] = hand_of(true, m.face)
		# (the curve and the sickle drawn by the marks: act2/marks13.gd fieldhand:boom)
		peril(m, "fieldhand:boom", m.world, {"dur": BOOM_CATCH})


func end(m, a: Dictionary, _hero) -> void:
	# (caught, staggered a step back)
	if a["id"] != "fieldhand:boom":
		return
	var back := BACK / TILE3
	var to: Vector2 = m.world + m.face * back
	if m.mgr.clear(to.x, to.y, minf(m.r, 0.42)):
		m.world = to


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] != "fieldhand:boom":
		return
	if crossed(t0, t1, BOOM_HIT):
		sound(m, "whirl", 0.4)
	if t1 <= BOOM_HIT or t0 >= BOOM_CATCH or not open_to(hero):
		return
	var r := rel(m, hero)
	var pass_ := boom_strikes(minf(t1, BOOM_CATCH - 1e-3), r.x, r.y)
	var bit := 1 if pass_ == "out" else (2 if pass_ == "back" else 0)
	var b := int(act.get("b", 0))
	if bit != 0 and (b & bit) == 0:
		act["b"] = b | bit
		blow(m, hero, float(a["dmg"]))
