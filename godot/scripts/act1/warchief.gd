## THE TROLL CHIEFTAIN (floor 9's side boss, in his camp), as the game fights him (game/act1_rules/f9_bosses.ts RULES_CHIEF,
## CHIEF_ACTS, F9_TUNE.chief, rage, knock, under, strideGap, rushSkid, footfall; art/f9_bosses_moves.ts CHIEF_MOVES, CHIEF_PLAY,
## chiefCarry; art/f9_bosses_fx.ts CHIEF_LANDS, SLAM_CRACK, SMASH_RING, RUSH_LANE, ROAR_RING; render/act1_fx/f9_bosses.ts). His
## moves as he picked them and saw them filmed (docs/mockups/f9_side_bosses/README.md). What he shares with the Mist Wolf (his
## frame, his squaring up, his marks, the beat of his heavy blows): f9_boss.gd.
##   HIS WALK: 1.3 tiles a second, a round of 1 s; as near as 3.8 tiles, off again beyond 4.5; the floor shaking at each footfall
##     (two a round, the screen kicked 0.8) within 10 tiles of him.
##   THE CLUB SMASH (his blow, within 5.22 tiles; list `attack`, 2.9 s): wound up, whirled and held over his head; down at
##     1.32 s 4.32 tiles before him: a hero within 1.3 + 0.3 of where it lands, or within 0.6 + 0.3 of the line under the club
##     as it comes down (from 1.15 tiles before him to there), is struck, x1.4, and thrown back 1.8 of a heavy blow's step.
##   THE GROUND SLAM (1.2 to 7.18 tiles; list `slam`, 2.6 s; every 7 s, first 3 s): up in the air (carried 11 of his lengths on)
##     and down at 1.02 s 2.53 tiles before him; a crack runs out from there along the lane before him, 5.05 tiles in 0.3 s:
##     a hero within 0.5 + 0.3 of its middle line, from 0.61 tiles behind where it lands to 0.23 past its front, struck as it
##     reaches him (no later than 0.45 s), x1.2, thrown back 1.2.
##   THE BULL ROAR, HIS WAR CRY (within 9 tiles; list `warcry`, 3.3 s; every 18 s, first 7 s; never while his rage is on): at
##     0.97 s a hero within 2.68 + 0.3 of him is struck, x0.5, and thrown back 1.8; then THE RAGE for 9 s ("roars, enraged"): his
##     moves 1.3 times quicker (his acts' clocks, his waits and his moves' readiness), his feet 1.45 times faster; then three
##     heavy strides at you (no nearer than a tile from you).
##   THE BULL RUSH (2.6 to 6.9 tiles; list `rush`, 2.6 s; every 9 s, first 5 s): the lane marked, pawing (the ground shaken at
##     0.52 and 0.76 s), and down it at a run from 1.15 s (carried 178 of his lengths, 6.8 tiles; once he has struck you only a
##     tenth of what is left): whoever he runs into before 1.5 s is struck, x1.6, and thrown back 3.6.
extends "res://scripts/act1/f9_boss.gd"

## (his own lengths to a length; CHIEF_PLAY.walk)
const CK := 1.5
const WALK := {"pace": 1.3, "frames": 12, "fps": 12}
## (RULES_CHIEF.gait)
const GAIT := {"pace": 1.3, "cycle": 1.0, "setOff": 0.0, "halt": 0.0, "stopAt": 3.8, "slack": 0.7, "trueBack": true}
## (CHIEF_LANDS: where the smash and the slam land, his own lengths forward and to his left)
const LANDS := {"smash": [112.97779374833533, -6.0], "slam": [66.13376522735801, -4.0]}
## (SMASH_RING, SLAM_CRACK, RUSH_LANE, ROAR_RING; F9_TUNE.under, underHalf)
const SMASH_RING := 34.0
const CRACK := {"back": 8.0, "long": 132.0, "runs": 0.3, "half": 13.0}
const ROAR_RING := 70.0
const UNDER := 30.0
const UNDER_HALF := 0.6
## (CHIEF_ACTS: each move's length and blow its pictures', CHIEF_MOVES; how far each reaches, his marks' own lengths)
const ACTS := [
	{"id": "warchief:smash", "clip": "attack", "long": 2.9, "hit": 1.32, "dmg": 1.4, "cooldown": 0.0, "first": 0.6, "after": 0.8, "near": 0.0, "far": 5.224030421075327},
	{"id": "warchief:slam", "clip": "slam", "long": 2.6, "hit": 1.02, "dmg": 1.2, "cooldown": 7.0, "first": 3.0, "after": 0.9, "near": 1.2, "far": 7.1832285253659975},
	{"id": "warchief:rush", "clip": "rush", "long": 2.6, "hit": 1.45, "dmg": 1.6, "cooldown": 9.0, "first": 5.0, "after": 1.0, "near": 2.6, "far": 6.8953761194255865},
	{"id": "warchief:warcry", "clip": "warcry", "long": 3.3, "hit": 0.97, "dmg": 0.5, "cooldown": 18.0, "first": 7.0, "after": 0.6, "near": 0.0, "far": 9.0},
]
## (F9_TUNE.knock, rage, strideGap, rushSkid, footfall; square.chief)
const KNOCK := {"smash": 1.8, "slam": 1.2, "rush": 3.6, "roar": 1.8}
const RAGE := {"lasts": 9.0, "quick": 1.3, "fast": 1.45}
const STRIDE_GAP := 1.0
const RUSH_SKID := 0.1
const FOOTFALL := {"by": 0.8, "near": 10.0}
const SQ := {"near": 1.3, "far": 0.5}
## (defs.ts MSG.foe)
const FOE := Color("#ff8a3a")
## (chiefCarry: how far each move has carried him, his own lengths, 120 to a second; the smash nowhere)
const CARRY := {
	"slam": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0.0044, 0.0174, 0.0389, 0.0685, 0.1063, 0.1518, 0.2049, 0.2655, 0.3332, 0.408, 0.4895, 0.5776, 0.6722, 0.7729, 0.8795,
		0.992, 1.11, 1.2334, 1.3619, 1.4954, 1.6336, 1.7764, 1.9235, 2.0748, 2.2299, 2.3888, 2.5513, 2.717, 2.8859, 3.0576,
		3.2321, 3.409, 3.5883, 3.7696, 3.9528, 4.1377, 4.3241, 4.5117, 4.7004, 4.89, 5.0802, 5.2709, 5.4618, 5.6528, 5.8436,
		6.034, 6.2238, 6.4129, 6.601, 6.7879, 6.9734, 7.1573, 7.3394, 7.5195, 7.6974, 7.8729, 8.0458, 8.2158, 8.3828, 8.5466,
		8.7069, 8.8636, 9.0165, 9.1653, 9.3098, 9.4499, 9.5853, 9.7158, 9.8413, 9.9615, 10.0762, 10.1852, 10.2883, 10.3853,
		10.476, 10.5602, 10.6377, 10.7083, 10.7717, 10.8279, 10.8765, 10.9173, 10.9502, 10.975, 10.9914, 10.9993, 11, 11, 11, 11,
		11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
		11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
		11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
		11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
		11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
		11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
		11, 11, 11, 11, 11, 11],
	"warcry": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1.3333, 2.6667, 4, 5.3333, 6.6667, 8,
		9.3333, 10.6667, 12, 13.3333, 14.6667, 16, 17.3333, 18.6667, 20, 21.3333, 22.6667, 24, 25.3333, 26.6667, 28, 29.3333,
		30.6667, 32, 33.3333, 34.6667, 36, 37.3333, 38.6667, 40, 41.3333, 42.6667, 44, 45.3333, 46.6667, 48, 49.1667, 50.3333,
		51.5, 52.6667, 53.8333, 55, 56.1667, 57.3333, 58.5, 59.6667, 60.8333, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62,
		62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62,
		62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62,
		62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62],
	"rush": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2.2222, 8.0278, 13.8333, 18.9722, 24.1111, 29.25,
		34.3889, 39.5278, 44.6667, 49.8056, 54.9444, 60.0833, 65.2222, 70.3611, 75.5, 80.6389, 85.7778, 90.9167, 96.0556,
		101.194, 106.333, 111.472, 116.611, 121.75, 126.889, 132.028, 137.167, 142.306, 147.444, 152.583, 157.722, 162.861, 168,
		169.898, 171.346, 172.406, 173.138, 173.602, 173.86, 173.972, 173.999, 174.324, 174.825, 175.278, 175.685, 176.05,
		176.374, 176.66, 176.911, 177.128, 177.314, 177.472, 177.603, 177.711, 177.797, 177.864, 177.914, 177.95, 177.975,
		177.989, 177.997, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178,
		178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178,
		178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178,
		178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178,
		178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178],
}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## (keep: `base` his own pace; `rage` seconds of his rage left; `step` how far through his walk's half round; what f9_boss.gd keeps)
func spawned(m) -> void:
	a1 = {"base": m.speed, "rage": 0.0, "step": 0.0}


func can(_m, a: Dictionary, _dist: float, _los: bool) -> bool:
	# (no war cry while the last one's rage is on him)
	if a["id"] == "warchief:warcry":
		return not raging()
	return true


func start(m, a: Dictionary, hero) -> void:
	begin(m, a, hero, "warchief:fx:")


func tick(m, dt: float, dist: float, hero) -> bool:
	# THE RAGE: his moves quicker, his feet faster, ready sooner
	if float(a1.get("rage", 0.0)) > 0.0:
		a1["rage"] = maxf(0.0, float(a1["rage"]) - dt)
		m.speed = float(a1["base"]) * float(RAGE["fast"])
		var more := dt * (float(RAGE["quick"]) - 1.0)
		m._cd -= more
		for k in cds.size():
			cds[k] -= more
	else:
		m.speed = a1["base"]
	var reach := tiles(LANDS["smash"][0], CK)
	var squaring := square_up(m, dt, hero, SQ["near"], reach + float(SQ["far"]), WALK["pace"])
	# (the floor shaking at each footfall as he walks, two a turn of his walk; felt near him)
	if m.state == "act" or mode != "walk":
		a1["step"] = 0.0
		return squaring
	a1["step"] = float(a1["step"]) + dt * m.speed / float(WALK["pace"])
	var every := float(WALK["frames"]) / float(WALK["fps"]) / 2.0
	if float(a1["step"]) >= every:
		a1["step"] = float(a1["step"]) - every
		if dist < float(FOOTFALL["near"]):
			hero.kick(FOOTFALL["by"])
	return squaring


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var move := move_of(a["id"])
	var h: Vector2 = hero.world
	var p := act_peril()
	# (the ground he covers: his war cry's strides at you no further than up to you; his bull rush, once it has struck you, only
	# skidding on a little)
	var x0: Vector2 = m.world
	var d := tiles(carry_of(CARRY.get(move, []), t1) - carry_of(CARRY.get(move, []), t0), CK)
	var to: Vector2 = h - m.world
	var ahead: float = to.dot(m.face)
	var beside: float = absf(to.x * m.face.y - to.y * m.face.x)
	if move == "warcry" and beside < m.r + HERO_R and ahead > 0.0:
		d = minf(d, maxf(0.0, ahead - (m.r + HERO_R + STRIDE_GAP)))
	if move == "rush" and not p.is_empty() and (int(p["d"]) & 1) != 0:
		d *= RUSH_SKID
	carried(m, d)
	if p.is_empty():
		return
	var free := open_to(hero)
	if crossed(t0, t1, a["hit"]):
		beat(m, hero, move)
		sound(m, "boss_roar" if move == "warcry" else "hit", 0.9 if move == "warcry" else 0.8)
	match move:
		"smash":
			if crossed(t0, t1, 0.4):
				sound(m, "swing", 0.4)
			if crossed(t0, t1, a["hit"]) and free:
				# (on its ring where the club lands; and under the club as it comes down, between him and there)
				var c := spot(p, CK, LANDS["smash"][0], LANDS["smash"][1])
				var n := spot(p, CK, UNDER, LANDS["smash"][1])
				if h.distance_to(c) <= tiles(SMASH_RING, CK) + HERO_R or near_line(h, n, c) <= UNDER_HALF + HERO_R:
					_strike(m, hero, p, 1, 1.0, KNOCK["smash"], c)
		"slam":
			# (the crack running out along the lane: struck as it reaches him)
			if t1 >= float(a["hit"]) and (int(p["d"]) & 1) == 0 and free:
				var cf: float = LANDS["slam"][0]
				var cl: float = LANDS["slam"][1]
				var front := cf - float(CRACK["back"]) + minf(1.0, (t1 - float(a["hit"])) / float(CRACK["runs"])) * float(CRACK["long"])
				var r := Stoker.in_frame(int(p["a"]), Vector2(p["x"], p["y"]), h)
				var f := r.x * TILE3 / CK
				var l := r.y * TILE3 / CK
				if f >= cf - float(CRACK["back"]) - 8.0 and f <= front + 6.0 and absf(l - cl) <= float(CRACK["half"]) + HERO_R * TILE3 / CK and t1 - float(a["hit"]) < float(CRACK["runs"]) + 0.15:
					_strike(m, hero, p, 1, 1.0, KNOCK["slam"], spot(p, CK, f, cl))
		"warcry":
			if crossed(t0, t1, a["hit"]):
				# (the roar: those near him struck and thrown; the rage on him)
				if free and h.distance_to(m.world) <= tiles(ROAR_RING, CK) + HERO_R:
					_strike(m, hero, p, 1, 1.0, KNOCK["roar"], m.world)
				a1["rage"] = RAGE["lasts"]
				peril(m, "warchief:rage", m.world, {"dur": 1e9})
				if m.mgr.loot != null:
					m.mgr.loot.say("%s roars, enraged" % m.title, FOE)
		"rush":
			if crossed(t0, t1, 0.52) or crossed(t0, t1, 0.76):
				hero.kick(1.0)
			if crossed(t0, t1, 1.15):
				sound(m, "swing", 0.7)
			# (whoever he runs into, as he runs: struck and thrown)
			if t1 > 1.15 and t0 < 1.5 and (int(p["d"]) & 1) == 0 and free and near_line(h, x0, m.world) <= m.r + HERO_R:
				_strike(m, hero, p, 1, 1.0, KNOCK["rush"], m.world - m.face)
	a1["px"] = m.world.x
	a1["py"] = m.world.y


## (struck from where the blow lands; thrown back away from him)
func _strike(m, hero, p: Dictionary, bit: int, mult: float, knock_by: float, from: Vector2) -> void:
	p["d"] = int(p["d"]) | bit
	strike_hero(m, hero, p, mult, from)
	if knock_by > 0.0:
		knock(hero, m.world, knock_by)
