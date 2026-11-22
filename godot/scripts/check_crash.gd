## THE CRASH OF THE COLOSSUS'S TWO WAVES SLOWS HIM (hero.gd surge_k; act1/colossus_fight.gd pace_at, CRASH.slow): `--only=crash`.
## On floor 10, the fight begun with him on the stone, a crash's surge running where he stands: his pace 60% of what it was; out
## of it, whole again.
extends RefCounted

const F := preload("res://scripts/act1/colossus_fight.gd")
const C := preload("res://scripts/act1/colossus.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("CRASH %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		h.life = h.max_life
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func run(main, hero, _d: String) -> void:
	M = main
	h = hero
	M.go_to("floor10", "start")
	await _wait(1.6)
	h.unhurt = true
	h.walked = 1000.0
	M.loot.taught = true
	var eye = null
	for m in M._monsters.list:
		if is_instance_valid(m) and m.boss:
			eye = m
	if eye == null:
		_line(false, "no boss on floor 10")
		return
	var S: Vector2 = C.stone_of(eye)
	var whole: float = h.walk_pace()
	h.world = F.stone_to_world(S, F.STONE["w"] / 2.0, 2.0)
	M._monsters.wake(eye)
	var f = null
	var t := 0.0
	while t < 6.0 and f == null:
		h.life = h.max_life
		h.world = F.stone_to_world(S, F.STONE["w"] / 2.0, 2.0)
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		f = eye.h2.a1.get("fight") if eye.h2 != null and eye.h2.get("a1") != null else null
	if f == null:
		_line(false, "the fight not begun with him on the stone")
		return
	f.crash = {"t": 1.0, "hit": true, "surge": true}
	await _wait(0.1)
	var slowed: float = h.walk_pace()
	f.crash = {}
	await _wait(0.1)
	var after: float = h.walk_pace()
	_line(absf(slowed / whole - F.CRASH["slow"]) < 0.01 and absf(after - whole) < 0.01, "in the crash's surge his pace %.2f tiles a second (of %.2f: x%.2f); out of it %.2f" % [slowed, whole, slowed / whole, after])
	print("CRASH: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
