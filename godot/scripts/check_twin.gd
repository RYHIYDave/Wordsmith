## TWIN ON THE WILDS' MONSTERS (monster.gd TWIN_ACTS, perils.gd TWIN_ACTS; TO_LOOK_AT 26): `--only=twin`. Floor 9's Volatile
## Twin Fog Wolf, alone with the hero beside it, for 12 s with Twin's second blow and 12 s without: every blow that reaches him
## (hero.gd last_blow), and how many came 0.2 to 0.4 s after another, at what share of it. Then a Vast monster's swing
## (monster.gd _far) and a Vast mark's ring (perils.gd wide).
extends RefCounted

const Mon := preload("res://scripts/monster.gd")
const Perils := preload("res://scripts/perils.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("TWIN %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


## Every blow on him in `secs` s, at [time, raw], the wolf kept beside him and him kept whole.
func _blows(wolf, spot: Vector2, secs: float) -> Array:
	var got: Array = []
	var was = h.last_blow
	var t := 0.0
	while t < secs:
		h.life = h.max_life
		h.world = spot
		h._invuln = 0.0
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		if not is_same(h.last_blow, was) and h.last_blow is Dictionary and not h.last_blow.is_empty():
			was = h.last_blow
			got.append([t, float(h.last_blow.get("raw", 0.0))])
	return got


func _pairs(got: Array) -> Array:
	var out: Array = []
	for i in range(1, got.size()):
		var gap: float = got[i][0] - got[i - 1][0]
		if gap >= 0.2 and gap <= 0.4:
			out.append([gap, got[i][1] / maxf(0.001, got[i - 1][1])])
	return out


func run(main, hero, _d: String) -> void:
	M = main
	h = hero
	await M.go_to("floor9", "down")
	await _wait(1.6)
	h.unhurt = false
	h.walked = 1000.0
	M.loot.taught = true
	var wolf = null
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and o.kind == "wolf" and o.words.has("twin") and not o.half.has("twin"):
			wolf = o
			break
	_line(wolf != null, "floor 9's Twin fog wolf, its pack's leader (Twin whole): %s" % ("found" if wolf != null else "none"))
	if wolf == null:
		print("TWIN: %d checks, %d wrong %s" % [n, bad.size(), str(bad)])
		return
	_line(wolf.twin() > 0.0, "its Twin's share of its blow, its second: %.2f" % wolf.twin())
	for o in M._monsters.list:
		if is_instance_valid(o) and o != wolf and not o.dead:
			o.world = Vector2(-400, -400)
			o.state = "sleep"
			o._place()
	var spot: Vector2 = wolf.world + Vector2(0.6, 0.0)
	if not M.map.walkable(floori(spot.x), floori(spot.y)):
		spot = wolf.world - Vector2(0.6, 0.0)
	M._monsters.wake(wolf)
	h.world = spot
	await _wait(0.5)
	Mon.TWIN_ACTS = true
	var on: Array = await _blows(wolf, spot, 12.0)
	Mon.TWIN_ACTS = false
	var off: Array = await _blows(wolf, spot, 12.0)
	Mon.TWIN_ACTS = true
	var p_on := _pairs(on)
	var p_off := _pairs(off)
	var shares := p_on.map(func(p): return "%.2f" % p[1])
	_line(on.size() > 0 and p_on.size() >= 2, "Twin's second blow on: %d blows reached him in 12 s, %d of them 0.2 to 0.4 s after another (each that share of it: %s)" % [on.size(), p_on.size(), ", ".join(shares.slice(0, 6))])
	_line(p_off.size() < p_on.size(), "off, as the browser game: %d blows in 12 s, %d of them so soon after another" % [off.size(), p_off.size()])
	# (a mark of its: a warned ring laid on him; it strikes, then again 0.28 s after)
	wolf.world = Vector2(-400, -400)
	wolf.state = "sleep"
	wolf._place()
	await _wait(0.4)
	var P = wolf.mgr.perils
	var marks: Array = []
	for k in 2:
		Perils.TWIN_ACTS["on"] = k == 0
		P.warn(spot.x, spot.y, 1.0, 0.3, 5.0, wolf)
		marks.append((await _blows(wolf, spot, 1.0)).size())
	Perils.TWIN_ACTS["on"] = true
	_line(marks[0] == 2 and marks[1] == 1, "a warned ring of its laid on him: %d blows with Twin's second, %d without" % [marks[0], marks[1]])
	# (VAST: a move's swing reaches as far as its one blow, Vast's more)
	var vk = null
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and o.has_method("_far") and not o.words.has("vast"):
			vk = o
			break
	if vk != null:
		var w0: Array = vk.words.duplicate()
		var plain: float = vk._far()
		vk.words = w0 + ["vast"]
		var wide: float = vk._far()
		Mon.VAST_SWING = false
		var old: float = vk._far()
		Mon.VAST_SWING = true
		vk.words = w0
		_line(wide > plain and is_equal_approx(old, plain), "a %s's move's swing reaches %.2f beyond its body; with Vast %.2f (the browser game: %.2f)" % [vk.kind, plain, wide, old])
		# (a Vast monster's mark: the ring it is drawn as, the ring it strikes)
		vk.words = w0 + ["vast"]
		var k: float = vk.mgr.perils.wide(vk)
		vk.words = w0
		_line(k > 1.0, "a Vast monster's marked ring drawn %.2f times as wide, and its blow strikes as wide (qgolem hammer, chained rings, Rampage)" % k)
	print("TWIN: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
