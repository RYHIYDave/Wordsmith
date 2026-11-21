## THE KING'S KNIGHTS (floor 19, the Keep), as the game fights them with their new move on (game/act1_rules/kknight.ts, the rallying
## banner: KNIGHT_BANNER; art/kings_knights_moves.ts, kings_knights_fx.ts, action_f16_knight.ts; render/act1_fx/kknight.ts). His picks:
## “Huge and slow, one each”, “Bigger still”, “Really big”, then “Yes, that's them (Recommended)”; the banner, “The rallying banner”,
## and its reach about twice as big, 7 tiles.
##   THEY WALK at 1.5 tiles a second, slow and heavy.
##   THE CLEAVE (his blow, 2.3 s, within 7.5): fists high, the line it will crack marked; the blade comes down at 34/30 s and THE FLOOR
##     CRACKS on out in a line to 8 tiles, 2.1 across: whoever stands on it struck, x1.4.
##   THE BANNER, once a knight (from 1.5 to 6 tiles off, the first after 2): drawn off his back, unfurled, held aloft, the shockwave's
##     reach marked; at 41/30 s driven into the floor before him to his left: a SHOCKWAVE, a hero within 2.2 of it struck (x0.6) and
##     knocked; IT STANDS: while it stands every enemy within 7 tiles of it hits a third harder (monster.gd _roll); his blows cut it down
##     (three of them). After the move he is his look without it (form 1: kknight_1).
## What they leave: act3/marks19.gd (kknight:crack, kknight:banner).
extends "res://scripts/act3/hc.gd"

const TILE3 := 39.191835884530846
const CLEAVE := {"warn": [0.6, 1.0], "hit": 1.1333333333333333}
const CRACK := {"from": 109.58893601986223 / 39.191835884530846 - 0.4, "reach": 8.0, "wide": 2.1, "long": 2.1, "hold": 1.5, "burst": 0.45, "open": 0.06666666666666667}
const BANNER := {"raised": 0.9, "hit": 1.3666666666666667, "wave": 2.2, "knock": 0.6, "reach": 7.0, "at": Vector2(1.0799270656527187, 0.759948675829691)}
const RALLY := 1.3
const LIFE := 3
const GAIT := {"pace": 1.5, "cycle": 36.0 / 30.0, "setOff": 0.3, "halt": 0.3, "stopAt": 2.8, "slack": 0.8, "trueBack": true}
const ACTS := [
	{"id": "kknight:cleave", "clip": "attack", "long": 2.3, "hit": 1.1333333333333333, "dmg": 1.4, "cooldown": 0.0, "first": 0.5, "after": 0.8, "near": 0.0, "far": 7.5},
	{"id": "kknight:banner", "clip": "banner", "long": 2.6, "hit": 1.3666666666666667, "dmg": 0.6, "cooldown": 0.0, "first": 2.0, "after": 0.8, "near": 1.5, "far": 6.0},
]


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## onCrack: whether `p` is on the crack laid from `s` along `f`.
static func on_crack(s: Vector2, f: Vector2, p: Vector2) -> bool:
	var d := p - s
	var fwd := d.dot(f)
	var side := absf(-d.x * f.y + d.y * f.x)
	return fwd >= float(CRACK["from"]) - 0.3 and fwd <= float(CRACK["reach"]) + 0.2 and side <= float(CRACK["wide"]) / 2.0


## RALLY: how much harder one hits now: a third more within 7 tiles of a standing banner.
static func rally_of(m) -> float:
	if m.mgr == null or m.mgr.perils == null:
		return 1.0
	for p in m.mgr.perils.list:
		if str(p.get("a1", "")) == "kknight:banner" and float(p["d"]) < 0.0 and float(p["t"]) >= 0.0 and m.world.distance_to(Vector2(p["x"], p["y"])) <= float(BANNER["reach"]):
			return RALLY
	return 1.0


func can(m, a: Dictionary, _dist: float, _los: bool) -> bool:
	# (one banner a knight)
	return str(a["id"]) != "kknight:banner" or int(m.form) == 0


func start(m, a: Dictionary, _hero) -> void:
	if str(a["id"]) == "kknight:cleave":
		warn(m, "kknight:cleave", float(CLEAVE["warn"][0]) - 0.2, CLEAVE["hit"], [[CRACK["from"], CRACK["reach"], -float(CRACK["wide"]) / 2.0, float(CRACK["wide"]) / 2.0]], [])
	else:
		# (the shockwave's reach marked round where it will go in, as it is held aloft)
		var at: Vector2 = BANNER["at"]
		var w := beside(m.world, m.face, act["hand"], at.x, at.y)
		peril(m, "kknight:bannerwarn", w, {"dur": 1e9, "act": act})


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if str(a["id"]) == "kknight:cleave":
		if not crossed(t0, t1, a["hit"]):
			return
		sound(m, "slam", 0.9)
		hero.kick(5.0)
		if on_crack(m.world, m.face, hero.world) and open_to(hero):
			blow(m, hero, float(a["dmg"]))
		peril(m, "kknight:crack", m.world, {"dur": CRACK["long"], "hit": 0.0})
		return
	if not crossed(t0, t1, BANNER["hit"]):
		return
	# PLANTED: the shockwave; and it stands
	var at: Vector2 = BANNER["at"]
	var r := from_figure(m.world, m.face, act["hand"], hero.world)
	if Vector2(r.x - at.x, r.y - at.y).length() <= float(BANNER["wave"]) and open_to(hero):
		blow(m, hero, float(a["dmg"]))
		knock(hero, m.world + m.face * at.x, float(BANNER["knock"]))
	var w := beside(m.world, m.face, act["hand"], at.x, at.y)
	peril(m, "kknight:banner", w, {"dur": 1e9, "a": m.id, "b": -1.0, "c": 0, "d": -1.0})
	hero.kick(4.0)
	sound(m, "slam", 0.8)
	m.form = 1
	m.mgr.look_to(m, "kknight_1")
