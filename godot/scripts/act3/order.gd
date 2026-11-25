## THE SILENT ORDER (floor 17 as cloaked guests at the ball; floor 19 the armed last, floor 20 the last masks), as the game fights them
## (game/act1_rules/order.ts; art/silent_order_moves.ts, silent_order_fx.ts; render/act1_fx/order.ts). His picks: how they move,
## “Still, then sudden (Recommended)”; on 19, “A fan of three on 19 (Recommended)”.
##   THE RUN: 5.5 tiles a second, the upper body as still as they stand; they stop 2.2 tiles off.
##   THE RUSH ("still, then sudden"; 0.9 s): from 6 to 13 tiles off him, every 3.5 s (the first after 1.5), still, a flick of a crouch,
##     then flung 4.5 tiles at him in 0.2 s, landed (the art's rushCarry: fx.json od_rush).
##   THE CURVED KNIFE (their basic blow, 2.0 s, from 1.8 to 7.5 tiles off): drawn, raised and held, its line marked; thrown at 28/30 s
##     along their forward, 20 tiles a second, 8 tiles, then it falls and lies (the art's knifeAt: od_knife): the hero within 0.6 of it
##     in flight struck, once. The armed last (form 1) throw three, 35 degrees apart; the three strike him once at most.
##   THE HUSHING PALM (every 8 s, the first after 2; 2.0 s, from within 5 tiles): coiled and held, its cone marked; thrust out at
##     28/30 s, the grey wave bursting over a cone 5.5 tiles out and 100 degrees across: whoever is in it struck, x1.2, and HUSHED 3 s.
## The knife and the wave are the art's own pictures (act3/marks17.gd order:knife, order:show).
extends "res://scripts/act3/hc.gd"

const TILE3 := 39.191835884530846
const THROW := {"warn": [0.46, 0.8666666666666667], "hit": 0.9333333333333333}
const PALM := {"warn": [0.44, 0.8666666666666667], "hit": 0.9333333333333333}
const KNIFE := {"speed": 20.0, "reach": 8.0, "hit": 0.6, "lies": 0.7}
const RUSH := {"near": 6.0, "far": 13.0, "every": 3.5}
## (ORDER_TUNE.palm: PALM_WAVE reach and from in tiles; its half-width, 50 degrees, and a little more)
const WAVE := {"reach": 215.55509736491965 / TILE3, "from": 6.0 / TILE3, "half": 50.0 * PI / 180.0 + 0.06, "hush": 3.0, "long": 1.4}
const GAIT := {"pace": 5.5, "cycle": 10.0 / 30.0 / 2.0, "setOff": 0.0, "halt": 0.0, "stopAt": 2.2, "slack": 0.4, "trueBack": true}
const ACTS := [
	{"id": "order:knife", "clip": "knife", "long": 2.0, "hit": 0.9333333333333333, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.6, "near": 1.8, "far": 7.5},
	{"id": "order:palm", "clip": "attack", "long": 2.0, "hit": 0.9333333333333333, "dmg": 1.2, "cooldown": 8.0, "first": 2.0, "after": 0.6, "near": 0.0, "far": 215.55509736491965 / 39.191835884530846 - 0.5},
	{"id": "order:rush", "clip": "rush", "long": 0.9, "hit": 0.5, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.1, "near": 0.0, "far": 999.0, "forced": true},
]
const RUSH_I := 2

static var _throws := 0


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## The ways their knives fly (degrees off the way they face): the armed last's three, one for the others (fanOf).
static func knives_of(m) -> Array:
	return [-35.0, 0.0, 35.0] if int(m.form) == 1 else [0.0]


## A way `deg` degrees off its facing, as [its forward share, its left share] (a warning's strip along it: act3/marks16.gd).
static func way_of(deg: float) -> Array:
	var r := deg_to_rad(deg)
	return [cos(r), -sin(r)]


## Is the hero in the grey wave's cone?
func in_palm(m, hero) -> bool:
	var r := rel(m, hero)
	var d := r.length()
	return d >= float(WAVE["from"]) - 0.3 and d <= float(WAVE["reach"]) + 0.3 and absf(atan2(r.y, r.x)) <= float(WAVE["half"])


func tick(_m, dt: float, _dist: float, _hero) -> bool:
	a1["rush_cd"] = float(a1.get("rush_cd", 1.5)) - dt
	return false


func forced(m) -> int:
	# (still, then sudden: from far off, flung at him)
	var d: float = m.world.distance_to(m.mgr.hero.world)
	if float(a1.get("rush_cd", 1.5)) > 0.0 or d < float(RUSH["near"]) or d > float(RUSH["far"]):
		return -1
	return RUSH_I


func start(m, a: Dictionary, _hero) -> void:
	var id := str(a["id"])
	match id:
		"order:rush":
			a1["rush_cd"] = RUSH["every"]
			a1["carried"] = 0.0
		"order:knife":
			var strips: Array = []
			for deg in knives_of(m):
				var w := way_of(deg)
				strips.append([0.3, 8.0, -0.5, 0.5, w[0], w[1]])
			warn(m, id, float(THROW["warn"][0]) - 0.2, THROW["hit"], strips, [])
		"order:palm":
			warn(m, id, float(PALM["warn"][0]) - 0.2, PALM["hit"], [], [[-float(WAVE["half"]), WAVE["half"], WAVE["reach"]]])
			peril(m, "order:show", m.world, {"dur": 1e9, "act": act})


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	match str(a["id"]):
		"order:rush":
			# (carried along their forward as the art's rushCarry says, so far as the floor lets them)
			var tab: Array = m.mgr.perils._fx["tables"].get("od_rush", [])
			var want: float = float(tab[clampi(roundi(t1 * 30.0), 0, tab.size() - 1)]) if not tab.is_empty() else 0.0
			var was: float = a1.get("carried", 0.0)
			var n := maxi(1, ceili(absf(want - was) / 0.1))
			for i in n:
				var p: Vector2 = m.world + m.face * ((want - was) / n)
				# (room for its whole body, not its middle's tile alone: rushed half into a wall it stood there; the bug hunt's fifth round)
				if not m.mgr.clear(p.x, p.y, m.r):
					break
				m.world = p
			a1["carried"] = want
		"order:knife":
			if not crossed(t0, t1, a["hit"]):
				return
			# (one knife; the armed last's three, fanned, each its own way)
			_throws += 1
			var dmg: float = m._roll() * float(a["dmg"])
			for deg in knives_of(m):
				var r := deg_to_rad(deg)
				var f := Vector2(m.face.x * cos(r) - m.face.y * sin(r), m.face.x * sin(r) + m.face.y * cos(r))
				var q := peril(m, "order:knife", m.world + f * 0.4, {"hit": 0.0, "dur": float(KNIFE["reach"]) / float(KNIFE["speed"]) + float(KNIFE["lies"]),
					"dmg": dmg, "b": deg, "c": _throws})
				q["fx"] = f.x
				q["fy"] = f.y
		"order:palm":
			if crossed(t0, t1, a["hit"]) and in_palm(m, hero) and open_to(hero):
				blow(m, hero, float(a["dmg"]))
				hero.hush(WAVE["hush"])
