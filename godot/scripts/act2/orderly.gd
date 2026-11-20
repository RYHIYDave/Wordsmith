## THE ORDERLIES OF THE HOUSE OF QUIET (floor 14), as the game fights them with their new moves on (game/act1_rules/orderly.ts RULES,
## GURNEY_ACTS: ORDERLY_GURNEY on; art/action_f11_orderly.ts).
##   THEIR TRUDGE: 0.8 tiles a second, stopping at any frame; 1.3 tiles off, and 0.3 nearer.
##   THE MALLET BLOW (their basic, within 2.2 tiles; list `attack`, 2.3 s): held high, brought down in two frames at 0.867 s, its head
##     into the floor 1.44 tiles before them: within 1.5 of there, or in its way (from 0.3 tiles before them, 0.7 either side), struck
##     x1 and knocked back 0.6; the floor cracked there (orderly:slam).
##   THE GURNEY CHARGE (from 2.5 to 8 tiles; every 7 s, the first 2.5 s in; list `gurney`, 2.3 s): the gurney stands before him; at
##     0.3 s he takes the way to the hero and the lane is marked from him through there (10 tiles, to a wall); at 0.967 s his mallet
##     slams into its end and it careers off down the lane (9 tiles a second, slowing), striking a hero in its way and CRASHING on him,
##     or at the lane's end or a wall: within 1.5 of the crash, struck x1.5 and knocked back 1.0 (orderly:gurney).
extends "res://scripts/act1/act1.gd"

const GAIT := {"pace": 0.8, "cycle": 1.0 / 8.0, "setOff": 0.0, "halt": 0.0, "stopAt": 1.3, "slack": 0.3, "trueBack": true}
const BLOW_HIT := 26.0 / 30.0
const BLOW9 := {"raised": 0.36, "long": 2.3, "r": 1.5, "from": 0.3, "half": 0.7, "knock": 0.6}
## (blowAt(): where its head goes into the floor, tiles before him and to his left, measured off its picture)
const BLOW_AT := Vector2(1.439815953160281, -0.12193782681095164)
const SLAM_MARK := 1.6
const GURNEY_HIT := 29.0 / 30.0
const GURNEY := {"at": 1.6712664390864393, "long": 1.4799000529315036, "wide": 0.6123724356957946, "aim": 0.3, "lane": 10.0, "half": 0.8,
	"pace": 9.0, "slow": 0.25, "r": 1.5, "knock": 1.0, "lies": 1.6, "near": 2.5, "far": 8.0}
const ACTS := [
	{"id": "orderly:blow", "clip": "attack", "long": 2.3, "hit": BLOW_HIT, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.7, "near": 0.0, "far": 2.2},
	{"id": "orderly:gurney", "clip": "gurney", "long": 2.3, "hit": GURNEY_HIT, "dmg": 1.5, "cooldown": 7.0, "first": 2.5, "after": 0.9, "near": 2.5, "far": 8.0},
]


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## blowStrikes: whether the blow strikes a hero `x` before him and `y` to his left.
static func blow_strikes(x: float, y: float) -> bool:
	return Vector2(x, y).distance_to(BLOW_AT) <= float(BLOW9["r"]) or (x >= float(BLOW9["from"]) and x <= BLOW_AT.x and absf(y - BLOW_AT.y) <= float(BLOW9["half"]))


## gurneyGone: how far the gurney has careered, `t` seconds after the slam.
static func gurney_gone(t: float) -> float:
	return 0.0 if t <= 0.0 else float(GURNEY["pace"]) * t * (1.0 - float(GURNEY["slow"]) * minf(1.0, t / 1.2) * 0.5)


## gurneyDown: where its middle is (tiles on from where it stood before him), until it crashes.
static func gurney_down(p: Dictionary) -> float:
	return minf(float(p["d"]), gurney_gone(maxf(0.0, float(p["t"]))))


## gurneyStrikes: whether the gurney, `d` tiles on, strikes a hero `x` before the orderly and `y` across the lane.
static func gurney_strikes(d: float, x: float, y: float) -> bool:
	return absf(y) <= float(GURNEY["half"]) and absf(x - (float(GURNEY["at"]) + d)) <= float(GURNEY["long"]) / 2.0 + 0.2


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] == "orderly:blow":
		if crossed(t0, t1, BLOW9["raised"]):
			sound(m, "swing", 0.4)
		if not crossed(t0, t1, float(a["hit"])):
			return
		var r := rel(m, hero)
		if open_to(hero) and blow_strikes(r.x, r.y):
			blow(m, hero, float(a["dmg"]))
			knock(hero, m.world, float(BLOW9["knock"]))
		peril(m, "orderly:slam", beside(m.world, m.face, act["hand"], BLOW_AT.x, BLOW_AT.y), {"dur": SLAM_MARK})
		hero.kick(3.0)
		sound(m, "slam", 0.7)
		return
	if a["id"] != "orderly:gurney":
		return
	if crossed(t0, t1, float(GURNEY["aim"])):
		# (the way to him now: the lane marked, the gurney's run to its end or a wall)
		var to: Vector2 = hero.world - m.world
		m.face = to / to.length() if to.length() > 0.0 else m.face
		var run := 0.0
		var most := float(GURNEY["lane"]) - float(GURNEY["at"]) - float(GURNEY["long"]) / 2.0
		while run < most:
			var p: Vector2 = m.world + m.face * (float(GURNEY["at"]) + run + float(GURNEY["long"]) / 2.0 + 0.1)
			if not m.mgr.clear(p.x, p.y, float(GURNEY["wide"]) / 2.0):
				break
			run += 0.1
		peril(m, "orderly:gurney", m.world, {"t": -(GURNEY_HIT - float(GURNEY["aim"])), "hit": 1e9, "dur": 1e9, "dmg": m._roll() * float(a["dmg"]), "d": minf(run, most)})
	if crossed(t0, t1, float(a["hit"])):
		hero.kick(2.0)
		sound(m, "slam", 0.6)
