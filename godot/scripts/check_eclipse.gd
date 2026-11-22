## THE CARRION QUEEN'S ECLIPSE ENDS WITH HER (act1/queen_marks.gd): `--only=eclipse`. On floor 7, her Eclipse begun; 2.5 s in (its
## dark fallen) she dies: the light comes back within half a second, and no dive of her flock comes after.
extends RefCounted

const QR := preload("res://scripts/act1/queen.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("ECLIPSE %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		h.life = h.max_life
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func run(main, hero, _d: String) -> void:
	M = main
	h = hero
	M.go_to("floor7", "start")
	await _wait(1.6)
	h.unhurt = true
	h.walked = 1000.0
	M.loot.taught = true
	var q = null
	for m in M._monsters.list:
		if is_instance_valid(m) and m.kind == "queen":
			q = m
	if q == null:
		_line(false, "no Carrion Queen on floor 7")
		return
	var P = M._monsters.perils
	var E: Dictionary = QR.ECLIPSE
	h.world = q.world + Vector2(-4.0, 0.0)
	q.speed = 0.0
	q._cd = 1e9
	q.h2.peril(q, "queen:eclipse", q.world, {"dur": float(E["hit"]) + float(E["dark"]) + float(E["back"]), "b": 7, "c": float(E["hit"]) + float(E["first"]), "dmg": 1.0, "a": q.id})
	await _wait(2.5)
	var dark: bool = QR.eclipse_now(P) != null
	q._die()
	await _wait(0.6)
	var still = QR.eclipse_now(P)
	var dives: int = P.list.filter(func(p): return p.get("a1", "") == "queen:vdive" and float(p["t"]) < 0.0).size()
	_line(dark and still == null and dives == 0, "her Eclipse fallen (%s), she dies 2.5 s in: 0.6 s after, the Eclipse %s, %d dives of her flock coming" % [dark, "gone" if still == null else "still on (%.1f s of %.1f)" % [still["t"], still["dur"]], dives])
	print("ECLIPSE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
