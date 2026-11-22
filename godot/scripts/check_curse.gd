## HIS CURSE THROWN (heroes/warlock.gd CURSE_RANGED; off till his yes to these pictures: `--only=curse --shots=<dir>`): the Warlock
## on floor 5 and a pack of five some seven tiles off. As the game has it, his Curse round him (4.5 tiles) reaches none of them;
## thrown, the streak of smoke to where he aims and the chains from there curse every one within 3.5 tiles of it. Its card. Lines of
## what each comes to.
extends RefCounted

const Warlock := preload("res://scripts/heroes/warlock.gd")

var M
var h
var dir := ""
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("CURSE %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


## Five of the floor's own, `far` tiles before him in a knot, held where they stand, none cursed.
func _pack(far: float) -> Array:
	var pool: Array = []
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and not o.boss and o.state != "rise":
			pool.append(o)
	pool.sort_custom(func(a, b): return a.world.distance_to(h.world) < b.world.distance_to(h.world))
	# (the rest of the floor's monsters put away, out of the picture)
	for o in pool.slice(5):
		o.world = Vector2(-400, -400)
		o.state = "sleep"
		o.speed = 0.0
		o._cd = 1e9
		o._place()
	var out: Array = []
	var spots := [Vector2(0, 0), Vector2(0.9, 0.6), Vector2(-0.8, 0.7), Vector2(0.7, -0.9), Vector2(-0.6, -0.8)]
	for k in mini(5, pool.size()):
		var m = pool[k]
		m.world = h.world + Vector2(far, 0) + spots[k]
		m._place()
		m.max_life = maxf(m.max_life, 100000.0)
		m.life = m.max_life
		m.curse_t = 0.0
		m.curse_dps = 0.0
		m.speed = 0.0
		m.state = "recover"
		m._t = 1e9
		m._cd = 1e9
		out.append(m)
	return out


## The nearest spot with open floor from 2 tiles behind him to 11 before him (+x), 3 each side: he is set there, facing +x.
func _open_line() -> void:
	var at := Vector2i(floori(h.world.x), floori(h.world.y))
	for r in 60:
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if maxi(absi(dx), absi(dy)) != r:
					continue
				var c := at + Vector2i(dx, dy)
				var clear := true
				for y in range(-3, 4):
					for x in range(-2, 12):
						if not h.map.open_at(c.x + x, c.y + y):
							clear = false
							break
					if not clear:
						break
				if clear:
					h.world = Vector2(c.x + 0.5, c.y + 0.5)
					h.face = Vector2(1, 0)
					return


func _cursed(pack: Array) -> int:
	return pack.filter(func(m): return is_instance_valid(m) and m.curse_t > 0.0).size()


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	M.go_to("floor5", "start")
	await _wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	M.set_class("warlock", true)
	M._kit_look()
	M.loot.level = 20
	M.loot.points = 0
	# (his talents spent, the guide's lessons his: neither prompt over the pictures; none of them touches his Curse)
	h.talents = ["hunger", "feast", "terribleroar", "bloodlust"]
	for f in ["met", "quick", "slow", "evade", "flask"]:
		M.guide.set(f, true)
	M.loot.taught = true
	h.walked = 100000.0
	h.unhurt = true
	_open_line()
	# (the floor's name gone from the screen first; what the floor's monsters had set going gone off)
	_pack(7.0)
	await _wait(4.0)
	h.life = h.max_life
	var kit = h.kit
	var was: bool = Warlock.CURSE_RANGED
	# --- AS THE GAME HAS IT: round him ---
	Warlock.CURSE_RANGED = false
	var pack := _pack(7.0)
	await _wait(0.3)
	kit.charges[1] = 1
	kit._use_skill(1, pack[0].world)
	await _wait(0.36)
	await M._snap(dir + "/curse01_round_him.png")
	var round_him := _cursed(pack)
	_line(round_him == 0, "as the game has it, round him (4.5 tiles): a pack seven tiles off, %d of %d cursed" % [round_him, pack.size()])
	await _wait(0.6)
	# --- THROWN ---
	Warlock.CURSE_RANGED = true
	Warlock.curse_card()
	h.loadout._r = [null, null, null]
	pack = _pack(7.0)
	await _wait(0.3)
	kit.charges[1] = 1
	kit._use_skill(1, pack[0].world)
	await _wait(0.42)
	await M._snap(dir + "/curse02_thrown.png")
	await _wait(0.2)
	await M._snap(dir + "/curse03_landed.png")
	await _wait(0.25)
	await M._snap(dir + "/curse04_cursed.png")
	var thrown := _cursed(pack)
	_line(thrown == pack.size(), "thrown at the pack seven tiles off: %d of %d cursed, struck (life %d of %d)" % [thrown, pack.size(), pack[0].life, pack[0].max_life])
	# (no farther than CURSE_REACH: aimed at twenty tiles, it lands nine off at most)
	await _wait(0.6)
	pack = _pack(14.0)
	await _wait(0.3)
	kit.charges[1] = 1
	kit._use_skill(1, h.world + Vector2(20.0, 0.0))
	await _wait(0.7)
	var far := _cursed(pack)
	_line(far == 0, "aimed twenty tiles off, it lands no farther than %.0f: a pack fourteen off, %d cursed" % [Warlock.CURSE_REACH, far])
	# (its card)
	var card: String = str(preload("res://scripts/words.gd").data()["skills"]["curse"]["desc"])
	_line(card == Warlock.CURSE_CARD, "its card: \"%s\"" % card)
	M._inv.toggle()
	await _wait(0.3)
	M._inv._page = "attacks"
	M._inv._focus = 1
	M._inv.queue_redraw()
	await _wait(0.3)
	await M._snap(dir + "/curse05_attacks_page.png")
	M._inv._page = "gear"
	M._inv.toggle()
	Warlock.CURSE_RANGED = was
	print("CURSE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
