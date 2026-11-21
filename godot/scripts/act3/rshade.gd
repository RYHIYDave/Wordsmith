## THE RIME SHADE (floor 20, the Quiet Tower), as the game fights it (game/act1_rules/rshade.ts; art/rime_shade.ts, rime_shade_moves.ts,
## rime_shade_fx.ts; render/act1_fx/rshade.ts). His picks: “Rime Shade (Recommended)”, offered as a hunched figure of frost and fog,
## icicles for fingers, its breath sending a creeping line of rime along the floor that freezes you in place if it reaches you; then
## “Yes, and lying rime slows (Recommended)”.
##   IT DRIFTS at 1.8 tiles a second, its feet never on the floor; it comes no nearer than 3.2 tiles.
##   THE RIME BREATH (2.5 s, from up to 5.6 tiles off): it straightens and draws in its breath; from 0.25 s THE LINE IT WILL SEND IS
##     MARKED on the floor, straight at where he stood then; it breathes out (25/30 s), and THE RIME CREEPS down the line at 3.5 tiles
##     a second (he runs 4.6). WHERE ITS FRONT REACHES HIM he is struck and FROZEN IN PLACE 0.8 s; dodging through it, neither. Once
##     frozen, no line freezes him again for a second after he is let go.
##   THE RIME LIES where the front has passed, 3 s, melting from where it began: it slows whoever stands in it (0.4 of his pace).
##   Killed or stopped before it breathes out, its mark is gone with it.
## Its line and the frost over him: act3/marks20.gd (painted as the game paints them: act3/rime_paint.gd).
extends "res://scripts/act3/hc.gd"

const BREATH := {"mark": 0.25, "hit": 25.0 / 30.0}
const LINE := {"from": 0.45, "long": 6.0, "half": 0.5, "pace": 3.5, "lies": 3.0}
const FROZEN := {"hold": 0.8, "shatter": 0.32}
const TUNE := {"far": 5.6, "stopAt": 3.2, "grace": 1.0, "slow": 0.4}
const LINE_GONE := 6.0 / 3.5 + 3.0
const GAIT := {"pace": 1.8, "cycle": 1.0 / 10.0, "setOff": 0.0, "halt": 0.0, "stopAt": 3.2, "slack": 0.8, "trueBack": true}
const ACTS := [
	{"id": "rshade:breath", "clip": "attack", "long": 2.5, "hit": 25.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.6, "after": 2.0, "near": 0.0, "far": 5.6},
]


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## onLine: the hero's place on a line: tiles along it from where it was breathed, and to its side.
static func on_line(p: Dictionary, at: Vector2) -> Vector2:
	var d := at - Vector2(p["x"], p["y"])
	return Vector2(d.x * float(p["fx"]) + d.y * float(p["fy"]), d.x * float(p["fy"]) - d.y * float(p["fx"]))


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	# (the line marked straight at where he stands now, and kept: its clock 0 as it breathes out)
	if crossed(t0, t1, BREATH["mark"]):
		var to: Vector2 = hero.world - m.world
		var f: Vector2 = to.normalized() if to.length() > 1e-6 else m.face
		peril(m, "rshade:line", m.world, {"fx": f.x, "fy": f.y, "t": -(float(BREATH["hit"]) - float(BREATH["mark"])), "dur": LINE_GONE + 0.1,
			"dmg": m._roll() * float(a["dmg"]), "b": float(LINE["from"]) - 0.2})
		sound(m, "frost", 0.25)
	if crossed(t0, t1, BREATH["hit"]):
		sound(m, "frost", 0.5)
