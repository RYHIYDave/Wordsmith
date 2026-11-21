## THE HUSHED GARDENERS (floor 16, the Swan Gardens), as the game fights them with its new moves on (game/act1_rules/gardener.ts
## LUNGER, PALACE, mixCrowd; art/action_f16_gardener.ts LUNGE, snapAt, lungeStrikes, LUNGE_TRAVEL_TILES; render/act1_fx/gardener.ts).
## His answers to the art chat, 28 Oct 2026: “A gardener and a groom (Recommended)”, “Knight's size, in crowds (Recommended)”, “Rush
## at you”; and his pick of 2 Nov 2026, 07:46, “Shear lunge”.
##   THE RUSH: 1.6 tiles a second, ten frames round at fifteen a second; he stops where a foot comes down, 2.6 tiles off.
##   A CROWD OF THE TWO: one laid in a pack is a gardener or a groom by its number (even a gardener, odd a groom).
##   THE SHEAR LUNGE (his one attack, from within 3.6 tiles, only where the lawn is clear before him; 2.8 s): sunk into a deep
##     crouch, the shears out low and opened their widest, the lane marked before him from 0.15 s, held; flung low and long through
##     the air, the blades SNAPPING SHUT at 35/30 s: whoever is in the lane (3.8 tiles long, 0.85 to either side, from where he
##     began) or within 1.2 of where they shut (4.17 before him, 0.16 to his left) is struck, x1.1; a spray of cut grass there
##     (1.8 s); stumbling on, he is 3.36 tiles on from where he began as it ends.
extends "res://scripts/act3/hc.gd"

const GAIT := {"pace": 1.6, "cycle": 1.0 / 3.0, "setOff": 0.0, "halt": 0.0, "stopAt": 2.6, "slack": 0.3, "trueBack": true}
const LUNGE := {"mark": 0.15, "hit": 35.0 / 30.0, "lane": 3.8, "half": 0.85, "snap": 1.2, "far": 3.6, "travel": 3.35721725415588, "snap_at": Vector2(4.168478900691857, 0.1641068331769556)}
const ACTS := [
	{"id": "gardener:lunge", "clip": "attack", "long": 2.8, "hit": 35.0 / 30.0, "dmg": 1.1, "cooldown": 0.0, "first": 0.0, "after": 0.8, "near": 0.0, "far": 3.6},
]


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## (mixCrowd: one laid in a pack is a gardener or a groom in turn by its number: the floor's monsters come from the game already
## mixed, tools/godot_export.ts, so nothing more is done here)


## (clearLunge) Whether the lawn is clear for him to be flung across and stumble on, the way `f`.
static func clear_lunge(m, f: Vector2) -> bool:
	var d := 0.3
	while d <= float(LUNGE["travel"]) + 0.2:
		if not m.mgr.clear(m.world.x + f.x * d, m.world.y + f.y * d, minf(m.r, 0.35), false):
			return false
		d += 0.25
	return true


func can(m, _a: Dictionary, dist: float, _los: bool) -> bool:
	var h = m.mgr.hero
	return clear_lunge(m, (h.world - m.world) / maxf(dist, 1e-6))


func start(m, _a: Dictionary, _hero) -> void:
	# (where he began: the lane and the snap are from there)
	act["a"] = m.world.x
	act["b"] = m.world.y
	var s: Vector2 = LUNGE["snap_at"]
	warn(m, "gardener:lunge", LUNGE["mark"], LUNGE["hit"], [[0.0, LUNGE["lane"], -float(LUNGE["half"]), float(LUNGE["half"])],
		[s.x - float(LUNGE["snap"]), s.x + float(LUNGE["snap"]), s.y - float(LUNGE["snap"]), s.y + float(LUNGE["snap"])]], [])


## lungeStrikes: in THE LANE (from where he was to its end, `half` to either side), or within `snap` of where the blades shut.
static func strikes(x: float, y: float) -> bool:
	var s: Vector2 = LUNGE["snap_at"]
	return (x >= 0.0 and x <= float(LUNGE["lane"]) and absf(y) <= float(LUNGE["half"])) or Vector2(x - s.x, y - s.y).length() <= float(LUNGE["snap"])


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if crossed(t0, t1, float(LUNGE["hit"]) - 0.12):
		sound(m, "swing", 0.5)
	if not crossed(t0, t1, float(LUNGE["hit"])):
		return
	var from := Vector2(act["a"], act["b"])
	var r := from_figure(from, m.face, act["hand"], hero.world)
	if strikes(r.x, r.y) and open_to(hero):
		blow(m, hero, float(a["dmg"]))
	var s: Vector2 = LUNGE["snap_at"]
	var w := beside(from, m.face, act["hand"], s.x, s.y)
	peril(m, "gardener:clip", w, {"dur": 1.8})
	sound(m, "slam", 0.35)


func end(m, _a: Dictionary, _hero) -> void:
	# (stumbled on and straightened, 3.36 tiles on: he is moved there, as far as the lawn lets him)
	var x0: Vector2 = Vector2(act["a"], act["b"]) if act != null and act.has("a") else m.world
	var d: float = LUNGE["travel"]
	while d >= 0.0:
		var p: Vector2 = x0 + m.face * d
		if m.mgr.clear(p.x, p.y, minf(m.r, 0.42), false):
			m.world = p
			break
		d -= 0.1
