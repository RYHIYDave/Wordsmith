## THE BOOKWARDENS OF THE GREAT LIBRARY (floor 15), as the game fights them with their new moves on (game/act1_rules/bookwarden.ts
## RULES, BARRAGE_ACTS: WARDEN_BARRAGE on; art/action_f11_warden.ts SLAM9, BARRAGE, bookAt, bookStrikes): the Order's men-at-arms,
## masked, with the chained tome.
##   THEIR TRUDGE: 0.85 tiles a second, stopping at any frame; 1.7 tiles off, and 0.3 nearer.
##   THE TOME SLAM (their basic, within 2.6 tiles; list `attack`, 2.1 s): whirled over their head, brought flat onto the floor in two
##     frames at 0.867 s, its middle 1.86 tiles before them and 0.31 to their right: a hero in its dust (1.7 round it, stretched 1.15
##     out of its sides and 0.8 along their way) is struck x1 and shoved back 0.6; its cracks and loose pages lie 1.8 s
##     (bookwarden:mark).
##   THE BOOK BARRAGE (from 2 to 8 tiles; every 7 s, the first 2.5 s in; list `barrage`, 2.5 s): nine books torn up off the floor
##     round them and wheeling round at head height; from 1.067 s flung one after another, 0.08 s apart, each at where the hero is
##     as it goes, a little fanned (4 degrees), 11 tiles a second, 8.5 tiles: a hero within 0.5 of a book as it flies is struck by
##     it, x0.5 each; they come down and lie a moment (bookwarden:barrage, act2/marks15.gd).
extends "res://scripts/act1/act1.gd"

const GP := preload("res://scripts/act2/gp.gd")
const GAIT := {"pace": 0.85, "cycle": 1.0 / 8.0, "setOff": 0.0, "halt": 0.0, "stopAt": 1.7, "slack": 0.3, "trueBack": true}
const SLAM_HIT := 26.0 / 30.0
const SLAM9 := {"long": 2.1, "reach": 1.7, "side": 1.15, "along": 0.8, "knock": 0.6, "mark": 1.8}
## (slamAt9: where the tome lies flat on the floor at the slam, tiles before him and to his left, measured off his picture)
const SLAM_AT := Vector2(1.8635858716849114, -0.3133128051494277)
const BARRAGE_HIT := 32.0 / 30.0
const BARRAGE := {"up": 0.4, "rise": [0.12, 0.6], "n": 9, "lie": 1.25, "ring": 1.05, "every": 0.08, "pace": 11.0, "fan": 4.0, "far": 8.5,
	"r": 0.5, "lies": 1.2, "long": 2.5, "near": 2.0, "far0": 8.0}
const BARRAGE_DONE := 3.9793939393939395
const ACTS := [
	{"id": "bookwarden:slam", "clip": "attack", "long": 2.1, "hit": SLAM_HIT, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.6, "near": 0.0, "far": 2.6},
	{"id": "bookwarden:barrage", "clip": "barrage", "long": 2.5, "hit": BARRAGE_HIT, "dmg": 0.5, "cooldown": 7.0, "first": 2.5, "after": 0.8, "near": 2.0, "far": 8.0},
]


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## slamStrikes: whether a hero `x` before him and `y` to his left is in the slam's dust.
static func slam_strikes(x: float, y: float) -> bool:
	var u := (x - SLAM_AT.x) / (float(SLAM9["reach"]) * float(SLAM9["along"]))
	var v := (y - SLAM_AT.y) / (float(SLAM9["reach"]) * float(SLAM9["side"]))
	return u * u + v * v <= 1.0


## bookGoes: when book `i` goes (seconds into the barrage).
static func book_goes(i: int) -> float:
	return BARRAGE_HIT + i * float(BARRAGE["every"])


## Where book `i` wheels round him (before it goes), `t` seconds in: {x, y (tiles before him, to his left), z (picture pixels up),
## spin, flying, since, lying, cover}.
static func _wheeling(i: int, t: float) -> Dictionary:
	var n: int = BARRAGE["n"]
	var r0: float = BARRAGE["rise"][0]
	var r1: float = BARRAGE["rise"][1]
	var a0 := (float(i) / n) * TAU + 0.4
	var rise := clamp01((t - r0 - i * 0.025) / (r1 - r0 - n * 0.025))
	var k := rise * rise * (3.0 - 2.0 * rise)
	var a := a0 + 1.6 * maxf(0.0, t - r0) + 0.6 * pow(maxf(0.0, t - float(BARRAGE["up"])), 2.0)
	var r := float(BARRAGE["lie"]) + (float(BARRAGE["ring"]) - float(BARRAGE["lie"])) * k
	var z := 2.0 + (52.0 + 14.0 * sin(i * 2.3) - 2.0) * k + (1.4 * sin(t * 31.0 + i * 1.7) if k > 0.99 else 0.0)
	return {"x": cos(a) * r, "y": sin(a) * r, "z": z, "spin": k * (2.0 + i) + t * 3.0 * k, "flying": false, "since": 0.0, "lying": false, "cover": i % 3}


## bookAt: where book `i` is `t` seconds into the barrage; `aims[i]`: where the hero was as it went (null before).
static func book_at(i: int, t: float, aims: Array, now: Vector2) -> Dictionary:
	var go := book_goes(i)
	if t < go:
		return _wheeling(i, t)
	var from := _wheeling(i, go)
	var aim: Vector2 = aims[i] if aims[i] != null else now
	var fan := ((GP.hash(i, 1, 1401) - 0.5) * 2.0 * float(BARRAGE["fan"]) * PI) / 180.0
	var base := atan2(aim.y - float(from["y"]), aim.x - float(from["x"])) + fan
	var s := t - go
	var far: float = BARRAGE["far"]
	var d := minf(far, s * float(BARRAGE["pace"]))
	var dx := cos(base)
	var dy := sin(base)
	var fly_long := far / float(BARRAGE["pace"])
	var to := Vector2(float(from["x"]) + dx * far, float(from["y"]) + dy * far)
	if s < fly_long:
		# (dropping a little as it flies, from head height to a man's chest)
		return {"x": float(from["x"]) + dx * d, "y": float(from["y"]) + dy * d, "z": float(from["z"]) - 18.0 * pow(s / fly_long, 2.0),
			"spin": float(from["spin"]) + s * 22.0, "flying": true, "since": s, "lying": false, "cover": from["cover"]}
	# (come down: skidding a little, lying)
	var u := s - fly_long
	var sk := minf(0.5, u * 3.0) * (1.0 - minf(1.0, u * 2.0) / 2.0)
	var z := maxf(1.5, float(from["z"]) - 18.0 - 160.0 * u * u)
	return {"x": to.x + dx * sk, "y": to.y + dy * sk, "z": z, "spin": float(from["spin"]) + fly_long * 22.0 + minf(u, 0.25) * 12.0,
		"flying": false, "since": s, "lying": z <= 1.6, "cover": from["cover"]}


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] == "bookwarden:barrage":
		if crossed(t0, t1, 0.12):
			# (the nine books: their clock the barrage's, `aims` where the hero was as each went: act2/marks15.gd)
			var aims: Array = []
			aims.resize(int(BARRAGE["n"]))
			peril(m, "bookwarden:barrage", m.world, {"t": 0.12, "dur": BARRAGE_DONE, "dmg": m._roll() * float(a["dmg"]), "a": m.id, "aims": aims})
		if crossed(t0, t1, BARRAGE["up"]):
			sound(m, "gust", 0.4)
		if crossed(t0, t1, a["hit"]):
			sound(m, "swing", 0.7)
		return
	if crossed(t0, t1, 0.32):
		sound(m, "swing", 0.5)
	if not crossed(t0, t1, a["hit"]):
		return
	# FLAT ON THE FLOOR in two frames: whoever is in its dust is struck, and shoved back off the book
	var r := rel(m, hero)
	var b := beside(m.world, m.face, act["hand"], SLAM_AT.x, SLAM_AT.y)
	if open_to(hero) and slam_strikes(r.x, r.y):
		var was: float = hero.life
		blow(m, hero, a["dmg"])
		if hero.life < was:
			knock(hero, b, SLAM9["knock"])
	peril(m, "bookwarden:mark", b, {"dur": SLAM9["mark"], "done": 1})
	hero.kick(3.0)
	sound(m, "slam", 0.6)
