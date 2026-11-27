## THE TINKERER'S BUILDS, CHECKED AND PICTURED (heroes/tinkerer_builds.gd: `--only=tbuilds --tbuilds=1 --shots=<dir>`). On floor 2,
## skeletons held where they are set: her words (Bomb Toss, her tree's, her Contraption's, her uniques'); her toss a lit bomb going
## off as a bomb's blast where it lands; Tesla Fence, lightning between two Contraptions striking the one between them and not one
## off the line; Coin Toss, five coins for five gold striking the one before her, harder with more gold, a bomb as ever with too
## little gold, and Contraption or Coin Toss, only one. A line a step (OK or WRONG), pictures, and marks for a film of it.
extends "res://scripts/check_brawler2.gd"

const TB := preload("res://scripts/heroes/tinkerer_builds.gd")
const Words := preload("res://scripts/words.gd")


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("TBUILDS %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/k%02d_%s.png" % [dir, shot, name])


func _mark(name: String) -> void:
	print("TBUILDS FILM %s %d" % [name, Engine.get_frames_drawn()])


func _page(id: String, taken: Array, name: String) -> void:
	h.talents = taken.duplicate()
	var inv = M._inv
	if not inv.visible:
		inv.toggle()
	inv._page = "talents"
	inv._tal.sel = id
	inv.queue_redraw()
	await _run(0.35)
	await _snap(name)
	inv.toggle()
	await _run(0.2)


func _take(list: Array) -> void:
	h.talents = list.duplicate()
	h.talents_changed()


func _lay(at: Array) -> void:
	h.world = home
	h._place()
	h._turn(way)
	K.clear()
	K.swing_t = 0.0
	h.life = h.max_life
	var left := Vector2(way.y, -way.x)
	for k in pack.size():
		var m = pack[k]
		if m.dead:
			continue
		m.max_life = 100000.0
		m.life = 100000.0
		if k < at.size():
			_put(m, home + way * float(at[k][0]) + left * float(at[k][1]))
		else:
			_put(m, home - way * (6.0 + k) + left * 6.0)


## Her tap at `at`, pressed again till it is thrown or a second has gone by.
func _tap_at(at: Vector2) -> void:
	var s0: int = h.uses[0]
	for k in 12:
		if h.uses[0] > s0:
			return
		h._turn((at - h.world).normalized())
		h.touch_aim[0] = at
		h.auto_attack = true
		await _run(0.1)
	h.touch_aim.erase(0)


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	TB.on = true
	Talents.D = {}
	Talents.ready_up()
	M.set_class("tinkerer", true)
	M.loot.level = 30
	M.go_to("floor2", "down")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	M.loot.level = 50
	M.loot.derive()
	K = h.kit
	h.walked = 5.0
	home = h.world
	way = _open_way(home)
	var near: Array = []
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.elite and not m.boss and m.kind == "skeleton":
			near.append(m)
	if near.size() < 4:
		for m in M._monsters.list:
			if is_instance_valid(m) and not m.dead and not m.elite and not m.boss and not near.has(m):
				near.append(m)
	near.sort_custom(func(a, b) -> bool: return a.world.distance_to(home) < b.world.distance_to(home))
	pack = near.slice(0, 4)
	for o in M._monsters.list:
		if is_instance_valid(o) and not pack.has(o):
			o.queue_free()
	if pack.size() < 4:
		_line(false, "floor 2 has no four to set out (%d)" % pack.size())
		return
	var A = pack[0]
	var B = pack[1]
	# --- HER WORDS ---
	var S: Dictionary = Words.data()["skills"]
	_line(S["vialtoss"]["name"] == "Bomb Toss" and S["vialtoss"]["desc"] == TB.SKILL["vialtoss"]["desc"] and S["contraption"]["desc"] == TB.SKILL["contraption"]["desc"],
		"her move: \"%s\": \"%s\"; her Contraption's card: \"%s\"" % [S["vialtoss"]["name"], S["vialtoss"]["desc"], S["contraption"]["desc"]])
	var tree: Dictionary = Talents.tree("tinkerer")
	var words_ok := true
	var said: Array = []
	for t in tree["talents"]:
		if TB.TEXT.has(t["id"]) and t["id"] != "contraptions":
			words_ok = words_ok and t["text"] == TB.TEXT[t["id"]]
		said.append(t["name"] + ": " + t["text"])
		words_ok = words_ok and not ("vial" in str(t["text"]).to_lower() or "vial" in str(t["name"]).to_lower())
	var path_name := ""
	for p in tree["paths"]:
		if p["id"] == "vials":
			path_name = p["name"]
	_line(words_ok and path_name == "BOMBS" and Talents.of("tinkerer", "clustervials")["name"] == "Cluster Bombs", "her tree says bombs, never vials (%s), its path %s, %s" % [words_ok, path_name, Talents.of("tinkerer", "clustervials")["name"]])
	var L = M.loot
	var sticky: Array = M._inv.does_of(L.unique_piece("stickywrench"))
	var foreman: Array = M._inv.does_of(L.unique_piece("foremanswrench"))
	_line(sticky == TB.DOES["stickywrench"] and foreman == TB.DOES["foremanswrench"], "her uniques: \"%s\" / \"%s\"" % [" ".join(sticky), " ".join(foreman)])
	await _page("clustervials", ["bombsaway"], "tree_cluster_bombs")
	await _page("teslafence", ["bombsaway", "clustervials", "tar", "madmixture", "contraptions"], "tree_tesla_fence")
	await _page("cointoss", ["bombsaway", "fortune"], "tree_coin_toss")
	# --- THE BOMB TOSS: a lit bomb, a bomb's blast ---
	_take([])
	_lay([[4.0, 0.0]])
	await _run(0.3)
	var look = K.look
	var a0: float = A.life
	_mark("bomb_in")
	await _tap_at(A.world)
	var lit := false
	var blast := false
	for k in 40:
		await _run(1.0 / 30.0)
		for l in look.lobs:
			if l.has("fuse"):
				lit = true
		for b in look.big_blasts:
			if b.get("kind", "") == "bomb":
				blast = true
		if k == 6:
			await _snap("bomb_flying")
		if blast:
			break
	await _run(0.15)
	await _snap("bomb_blast")
	await _run(0.8)
	_mark("bomb_out")
	_line(lit and blast and A.life < a0, "her toss: a lit bomb in the air (%s), a bomb's blast where it landed (%s), the one there struck (%.0f to %.0f)" % [lit, blast, a0, A.life])
	# --- TESLA FENCE ---
	_take(["bombsaway", "clustervials", "tar", "madmixture", "contraptions", "teslafence"])
	_lay([[3.0, 0.0], [3.0, 2.8]])
	await _run(0.3)
	var left := Vector2(way.y, -way.x)
	var c1: Vector2 = home + way * 3.0 - left * 1.6
	var c2: Vector2 = home + way * 3.0 + left * 1.6
	_put(A, home + way * 3.0)
	_put(B, home + way * 3.0 + left * 3.2)
	_mark("fence_in")
	K._throw_contraption(0, h.world, c1, 1.0)
	K._throw_contraption(0, h.world, c2, 1.0)
	a0 = A.life
	var b0: float = B.life
	await _run(float(K._C()["set"]) + 1.6)
	await _snap("tesla_fence")
	await _run(0.6)
	_mark("fence_out")
	var a_lost: float = a0 - A.life
	var b_lost: float = b0 - B.life
	_take(["bombsaway", "clustervials", "tar", "madmixture", "contraptions"])
	K.clear()
	_put(A, home + way * 3.0)
	a0 = A.life
	K._throw_contraption(0, h.world, c1, 1.0)
	K._throw_contraption(0, h.world, c2, 1.0)
	await _run(float(K._C()["set"]) + 1.6)
	var a_plain: float = a0 - A.life
	K.clear()
	_line(a_lost > a_plain and b_lost <= a_plain + 0.01, "Tesla Fence: the one between two Contraptions struck by their lightning (%.0f lost, %.0f without the fence, their own shots); the one off the line no more than their shots (%.0f)" % [a_lost, a_plain, b_lost])
	# --- COIN TOSS ---
	_take(["bombsaway", "fortune", "cointoss"])
	_lay([[3.0, 0.0]])
	await _run(0.3)
	L.gold = 1000
	var k1000: float = K.coin_k()
	a0 = A.life
	_mark("coins_in")
	await _tap_at(A.world)
	var coins := 0
	for s in K.shots:
		if s.get("look", "") == "coin":
			coins += 1
	var gold_after: int = L.gold
	await _run(0.12)
	await _snap("coin_toss")
	await _run(0.8)
	_line(coins == 5 and gold_after == 995 and A.life < a0 and absf(k1000 - 2.0) < 0.01, "Coin Toss: a tap threw %d coins for %d gold (1000 to %d), the one before her struck (%.0f to %.0f); at 1,000 gold they strike %.1f times as hard" % [coins, 1000 - gold_after, gold_after, a0, A.life, k1000])
	L.gold = 10000
	var kmost: float = K.coin_k()
	L.gold = 2
	_lay([[3.0, 0.0]])
	await _run(0.3)
	var lobs0: int = K.vials.size()
	await _tap_at(A.world)
	var bombed: bool = K.vials.size() > lobs0
	await _run(1.2)
	_mark("coins_out")
	_line(absf(kmost - float(TB.COIN["most"])) < 0.01 and bombed and L.gold == 2, "Coin Toss: at 10,000 gold %.1f times at most; with 2 gold, a bomb as ever (%s), no gold spent (%d)" % [kmost, bombed, L.gold])
	var p1: String = Talents.take_problem("tinkerer", 50, ["bombsaway", "fortune", "cointoss", "clustervials", "tar", "madmixture"], "contraptions")
	var p2: String = Talents.take_problem("tinkerer", 50, ["bombsaway", "fortune"], "cointoss")
	_line(p1 != "" and p2 == "", "Contraption with Coin Toss taken: \"%s\"; Coin Toss after Fortune: \"%s\"" % [p1, p2])
	print("TBUILDS DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else ": " + str(bad)])
