## THE FOOTMEN (floor 17, the Masque), as the game fights them (game/act1_rules/footman.ts; art/masque_footmen_moves.ts,
## masque_footmen_fx.ts; render/act1_fx/footman.ts). His picks: how they move, “Brisk and stiff (Recommended)”, and their pictures.
##   THE MARCH: 2.8 tiles a second, a step each 0.23 s; they stop 2.4 tiles off.
##   THE TRAY FLUNG (his basic blow, 2.3 s, from 1.5 to 6 tiles off): coiled and held, its way out and back marked (a strip 6 tiles
##     before him); it leaves his hand at 26/30 s, flies out along its loop (six tiles out, 2.3 across) and back into his hand at
##     1.84 s: the hero within 0.75 of it where it passes struck, once a throw.
##   THE CANDELABRUM (every 7 s, the first after 2; 2.1 s, from within 2.8 tiles): raised and held, its wedge marked; brought down at
##     28/30 s and the fire fan bursts out before him, from 0.55 to 3.3 tiles out, 120 degrees across: whoever is in it struck, x1.3.
## The tray in flight and the fire are the art's own pictures (act3/marks17.gd footman:show).
extends "res://scripts/act3/hc.gd"

const TILE3 := 39.191835884530846
const MK := preload("res://scripts/act3/marks17.gd")
const THROW := {"warn": [0.44, 0.74], "hit": 0.8666666666666667, "catch": 1.84}
const SWING := {"warn": [0.48, 0.8], "hit": 0.9333333333333333}
const TRAY := {"hit": 0.75, "reach": 6.0}
## (FOOTMAN_TUNE.fire: FIRE_FX near and r, a third of a tile more; its spread, 120 degrees, and a little more)
const FIRE := {"near": 21.555509736491967 / TILE3, "far": 117.57550765359254 / TILE3 + 0.3, "half": 60.0 * PI / 180.0 + 0.08}
const GAIT := {"pace": 2.8, "cycle": 0.23, "setOff": 0.0, "halt": 0.0, "stopAt": 2.4, "slack": 0.4, "trueBack": true}
const ACTS := [
	{"id": "footman:tray", "clip": "attack", "long": 2.3, "hit": 0.8666666666666667, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.6, "near": 1.5, "far": 6.0},
	{"id": "footman:fire", "clip": "candelabrum", "long": 2.1, "hit": 0.9333333333333333, "dmg": 1.3, "cooldown": 7.0, "first": 2.0, "after": 0.6, "near": 0.0, "far": 2.8},
]


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## Where his tray is, `t` seconds after it left his hand (the art's trayFlight, a frame each thirtieth of a second: fx.json ft_tray).
static func tray_at(m, t: float, tab: Array) -> Vector2:
	if tab.is_empty():
		return m.world
	var c: Array = tab[clampi(roundi(t * 30.0), 0, tab.size() - 1)]
	var f: Vector2 = m.face
	return m.world + f * float(c[0]) + Vector2(f.y, -f.x) * float(c[1])


## Is the hero in his fire fan?
func in_fire(m, hero) -> bool:
	var r := rel(m, hero)
	var d := r.length()
	return d >= float(FIRE["near"]) and d <= float(FIRE["far"]) and absf(atan2(r.y, r.x)) <= float(FIRE["half"])


func start(m, a: Dictionary, _hero) -> void:
	a1["tray_hit"] = 0
	var id := str(a["id"])
	if id == "footman:tray":
		warn(m, id, float(THROW["warn"][0]) - 0.2, THROW["hit"], [[0.4, TRAY["reach"], -1.3, 1.3]], [])
	else:
		warn(m, id, float(SWING["warn"][0]) - 0.2, SWING["hit"], [], [[-float(FIRE["half"]), FIRE["half"], FIRE["far"]]])
	# (what of it is pictured beside him: the tray in flight, the fire)
	peril(m, "footman:show", m.world, {"dur": 1e9, "act": act})


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if str(a["id"]) == "footman:tray":
		if crossed(t0, t1, THROW["hit"]):
			sound(m, "swing", 0.5)
		if crossed(t0, t1, THROW["catch"]):
			sound(m, "hit", 0.3)
		# (in flight: where it passes him, it strikes, once)
		if t1 > float(THROW["hit"]) and t0 < float(THROW["catch"]) and int(a1.get("tray_hit", 0)) == 0:
			var tab: Array = m.mgr.perils._fx["tables"].get("ft_tray", [])
			var p := tray_at(m, t1 - float(THROW["hit"]), tab)
			var p0 := tray_at(m, maxf(0.0, t0 - float(THROW["hit"])), tab)
			if MK.seg_dist(hero.world, p0, p) <= float(TRAY["hit"]) and open_to(hero):
				a1["tray_hit"] = 1
				blow(m, hero, float(a["dmg"]))
		return
	if crossed(t0, t1, float(SWING["hit"]) - 0.06):
		sound(m, "swing", 0.5)
	if crossed(t0, t1, SWING["hit"]):
		sound(m, "fire", 0.6)
		if in_fire(m, hero) and open_to(hero):
			blow(m, hero, float(a["dmg"]))
