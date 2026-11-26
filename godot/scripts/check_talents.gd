## THE CHECK OF THE SKILL TREES (--only=talents; main.gd's shot mode sends it here): their rules as the game's (game/talents.ts),
## and the TALENTS page (ui/talents.ts) for each class, pictured, a line a step (OK or WRONG):
##   the points: none till level 5, one every five levels, ten at most; the next point's level;
##   the way: where a tree begins is open, the rest once one joined to it by a line is his, before it or after it (both ways);
##   the Warrior's three weapons: one of them his, free, from level 1, only one, a weapon's path its own, IRON once a weapon is his;
##   undoing: not while one taken hangs on it alone; a list made safe (another class's, twice, out of order, more than the level);
##   the page for each of the six: its shape, its paths' captions, a talent taken lit, one open, its card read.
extends RefCounted

const Talents := preload("res://scripts/talents.gd")

var M
var h
var n := 0
var bad: Array = []
var dir := ""
var shot := 0


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("TALENTS %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/t%02d_%s.png" % [dir, shot, name])


func _run(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	# (this check reads his tree as a new Warrior has it: the greatsword alone, his Whirl his own)
	Talents.checks_whirlwind = false
	dir = d
	Talents.ready_up()
	var D := Talents.D
	# THE POINTS
	var pts := [Talents.points(1), Talents.points(4), Talents.points(5), Talents.points(9), Talents.points(10), Talents.points(50), Talents.points(99)]
	_line(pts == [0, 0, 1, 1, 2, 10, 10] and Talents.next_level(1) == 5 and Talents.next_level(12) == 15 and Talents.next_level(50) == -1,
		"a point every %d levels, %d at most: at levels 1, 4, 5, 9, 10, 50, 99 %s; the next at 5 from 1, at 15 from 12, none from 50" % [D["every"], D["max"], pts])
	var sizes := {}
	for c in D["trees"]:
		sizes[c] = (D["trees"][c]["talents"] as Array).size()
	_line(sizes.size() == 6 and D["switches"]["talents2"] and D["switches"]["warriorTree2"] and D["switches"]["bothWays"] and D["switches"]["companions"],
		"six trees as the game has them (%s), its switches as released (the remade talents, the Warrior's weapons, the lines both ways, the Ranger's companions)" % sizes)
	# THE WAY: where a tree begins, and both ways along a line
	var r1 := Talents.open("ranger", [], "huntsfocus") if not Talents.of("ranger", "huntsfocus").is_empty() else false
	var starts: Array = []
	var after := ""
	var before := ""
	for t in Talents.tree("mage")["talents"]:
		if (t["from"] as Array).is_empty():
			starts.append(t["id"])
		elif after == "":
			after = t["id"]
			before = t["from"][0]
	var start_open := true
	for s in starts:
		start_open = start_open and Talents.open("mage", [], s)
	_line(start_open and not Talents.open("mage", [], after) and Talents.open("mage", [before], after) and Talents.open("mage", [after], before),
		"where the Mage's tree begins (%s) is open; %s not till one joined to it is hers; %s once %s is, and %s once %s is (both ways)" % [starts, after, after, before, before, after])
	# THE WARRIOR'S WEAPONS
	var iron_first := ""
	for t in Talents.tree("warrior")["talents"]:
		if t["path"] == "iron" and (t["from"] as Array).is_empty():
			iron_first = t["id"]
	var w1 := Talents.take_problem("warrior", 50, [], "battleaxe")
	var w2 := Talents.take_problem("warrior", 50, ["greatsword"], "battleaxe")
	var w3 := Talents.take_problem("warrior", 50, [], iron_first)
	var w4 := Talents.open("warrior", ["greatsword"], iron_first)
	var w5 := Talents.open("warrior", ["greatsword", "sweepingcut", "drilledleap"], "honededge") and not Talents.open("warrior", ["greatsword", "sweepingcut", "drilledleap", "honededge"], "redmist")
	_line(w1 == "" and w2 == "" and w3 == "Pick your weapon first" and w4 and w5 and Talents.warrior_weapon([]) == "greatsword" and Talents.warrior_weapon(["warhammer"]) == "warhammer",
		"his weapon: the battle axe open ('%s'), and in the greatsword's place ('%s'); IRON's %s waits for one ('%s'), open once the greatsword is his (%s); a join open from his path, the axe's beyond it not his (%s)" % [w1, w2, iron_first, w3, w4, w5])
	# THE WARRIOR'S WEAPON, FREE (his word of 22 Nov 2026): his from level 1, no point, swapped for nothing while nothing more on its
	# path is his
	var f1 := Talents.starting("warrior")
	var f2 := Talents.take_problem("warrior", 1, ["greatsword"], "battleaxe")
	var f3 := Talents.take_problem("warrior", 1, ["greatsword"], "sweepingcut")
	var f4 := Talents.take_problem("warrior", 5, ["greatsword"], "sweepingcut")
	var f4b := Talents.take_problem("warrior", 10, ["greatsword"], "sweepingcut")
	var f5 := Talents.take_problem("warrior", 50, ["greatsword", "sweepingcut"], "warhammer")
	var f6 := Talents.swap_out("warrior", ["battleaxe"], "warhammer")
	var f7 := Talents.spent("warrior", ["warhammer", "heavyhead"])
	var f8 := Talents.starting("mage")
	_line(f1 == ["greatsword"] and f2 == "" and f3 == "Next point at level 5" and f4 == "" and f4b == "" and f5 == "Undo the greatsword's talents first" and f6 == "battleaxe" and f7 == 1 and f8 == [],
		"his weapon a pre-point, no talent: the greatsword his as he starts (%s); at level 1 the battle axe in its place ('%s'); his first point at level 5, as every hero's ('%s'; at level 5: '%s'; at 10: '%s'); not swapped while more on its path is his ('%s'); the hammer in the axe's place (%s out); a weapon and one talent, %d point spent; a Mage starts with none (%s)" % [f1, f2, f3, f4, f4b, f5, f6, f7, f8])
	# THE ATTACKS CHANGED, A TWIG EACH (talents.gd TWIGS): Whirlwind off Sweeping Cut, not open before it; the branch on up never
	# needing it; Twin Axes off Rend, Tremors off Heavy Head; each a small stone
	var tw1 := Talents.take_problem("warrior", 50, ["greatsword"], "gswhirlwind")
	var tw2 := Talents.take_problem("warrior", 50, ["greatsword", "sweepingcut"], "gswhirlwind")
	var tw3 := Talents.take_problem("warrior", 50, ["greatsword", "sweepingcut"], "drilledleap")
	var tw4: bool = Talents.of("warrior", "twinaxes")["from"] == ["rend"] and Talents.of("warrior", "tremors")["from"] == ["heavyhead"] and not Talents.of("warrior", "gswhirlwind")["big"]
	_line(tw1 == "Take one joined to it first" and tw2 == "" and tw3 == "" and tw4,
		"the attacks changed, each a twig off its branch: Whirlwind with the greatsword alone '%s', after Sweeping Cut '%s'; the branch on up without it '%s'; Twin Axes off Rend, Tremors off Heavy Head, small stones (%s)" % [tw1, tw2, tw3, tw4])
	# EVERY CLASS'S ATTACK SWAPS, A TWIG EACH (talents.gd TWIGS, RELINK): each a small stone joined only to its path's talent,
	# not open before it, open after; nothing else joined to it, so no path runs through it. The Tinkerer's Mark II in Gun Arm's
	# place on the Golem's ring, Fortune joined to Bombs Away alone
	var bad: Array = []
	var n_tw := 0
	for c in ["ranger", "mage", "tinkerer"]:
		for id in Talents.TWIGS[c]:
			n_tw += 1
			var mn: String = Talents.TWIGS[c][id]["from"]
			var t: Dictionary = Talents.of(c, id)
			var others := false
			for o in Talents.tree(c)["talents"]:
				if o["id"] != id and o["id"] != mn and ((o["from"] as Array).has(id) or (o["joined"] as Array).has(id)):
					others = true
			if t["from"] != [mn] or t["joined"] != [mn] or t["big"] or not (Talents.of(c, mn)["joined"] as Array).has(id) or others \
					or Talents.take_problem(c, 50, [], id) == "" or Talents.take_problem(c, 50, [mn], id) != "":
				bad.append("%s %s" % [c, id])
	var mk := Talents.take_problem("tinkerer", 50, ["bombsaway", "lightningrod", "shrapnel"], "markii")
	var pr := Talents.take_problem("tinkerer", 50, ["bombsaway", "lightningrod", "shrapnel", "markii"], "prospector")
	var ring: bool = Talents.of("tinkerer", "markii")["at"] == [0, 2] and Talents.of("tinkerer", "fortune")["joined"] == ["bombsaway"]
	_line(bad.is_empty() and n_tw == 8 and mk == "" and pr == "" and ring,
		"every class's attack swaps a twig off its path (%d: Snare, Snipe, Rally, Ball, Beam, Spear, Contraption, Gun Arm; wrong %s); Mark II on the Golem's ring after Shrapnel '%s', Prospector after it '%s', Fortune off Bombs Away alone (%s)" % [n_tw, bad, mk, pr, ring])
	# UNDOING, AND A LIST MADE SAFE
	var u1 := Talents.unlearn_problem("warrior", ["greatsword", "sweepingcut"], "greatsword")
	var u2 := Talents.unlearn_problem("warrior", ["greatsword", "sweepingcut"], "sweepingcut")
	var cl := Talents.clean("warrior", 7, ["greatsword", "greatsword", "kindling", "sweepingcut"])
	var cl2 := Talents.clean("warrior", 3, ["sweepingcut"])
	_line(u1 == "Take another to swap" and u2 == "" and cl == ["greatsword", "sweepingcut"] and cl2 == ["greatsword"],
		"the greatsword not undone but swapped ('%s'), Sweeping Cut undone (''); a save's list made safe at level 7: %s; an old one with no weapon, at level 3: %s" % [u1, cl, cl2])
	# (WS_TALENTS_ONLY=warlock or ranger: his talents in play alone, for a change to them)
	if OS.get_environment("WS_TALENTS_ONLY") == "ranger":
		await _ranger()
		# (his Venom among the moves to learn)
		await _learn()
		print("TALENTS DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " %s" % [bad]])
		return
	if OS.get_environment("WS_TALENTS_ONLY") == "warlock":
		await _warlock()
		print("TALENTS DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " %s" % [bad]])
		return
	if OS.get_environment("WS_TALENTS_ONLY") == "tinkerer":
		await _tinkerer()
		print("TALENTS DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " %s" % [bad]])
		return
	# THE WARRIOR'S TALENTS IN PLAY (game.ts, TALENTS2's rules)
	await _warrior()
	# THE WARRIOR'S BATTLE AXE AND WARHAMMER, their moves and their talents
	await _arms()
	# THE VETERAN'S TALENTS
	await _veteran()
	# THE WARLOCK'S TALENTS
	await _warlock()
	# THE TINKERER'S TALENTS
	await _tinkerer()
	# THE RANGER'S TALENTS
	await _ranger()
	# THE MAGE'S TALENTS
	await _mage()
	# THE MAGE'S AND THE RANGER'S MOVES TO LEARN, and Venom
	await _learn()
	# THE PAGE, for each class
	var inv = M._inv
	for cls in ["warrior", "ranger", "mage", "warlock", "tinkerer", "brawler"]:
		M.set_class(cls, true)
		M.loot.level = 50
		M.loot.points = 0
		var tree := Talents.tree(cls)
		# (a talent taken where the tree begins, as the game would have it: the Warrior his greatsword)
		var first := "greatsword" if cls == "warrior" else ""
		if first == "":
			for t in tree["talents"]:
				if (t["from"] as Array).is_empty():
					first = t["id"]
					break
		h.talents = [first]
		if not inv.visible:
			inv.toggle()
		inv._page = "talents"
		var read := ""
		for t in tree["talents"]:
			if Talents.open(cls, h.talents, t["id"]):
				read = t["id"]
				break
		inv._tal.sel = read
		await _run(0.3)
		await _snap("%s_tree" % cls)
		var lay: Dictionary = inv._tal.lay
		var inside := true
		var page: Rect2 = lay["r"]
		for nd in lay["nodes"]:
			inside = inside and page.grow(2.0).encloses(nd["r"])
		_line(lay["cls"] == cls and lay["nodes"].size() == tree["talents"].size() and inside and not inv._tal.card.is_empty(),
			"the %s's tree on the TALENTS page: %s, %d talents inside the page, %d captions; %s taken, %s read on its card" % [cls, tree["shape"], lay["nodes"].size(), lay["labels"].size(), first, read])
	# THE WARRIOR'S WEAPON, FREE, ON THE PAGE: a new Warrior at level 1, his greatsword his; the battle axe's card, TAKE (FREE) on it;
	# pressed, the axe his for nothing, his moves the axe's, no point spent
	M.set_class("warrior", true)
	M.loot.level = 1
	M.loot.points = 0
	h.talents_changed()
	if not inv.visible:
		inv.toggle()
	inv._page = "talents"
	inv._tal.sel = "battleaxe"
	await _run(0.3)
	await _snap("warrior_level1_axe_card")
	var free_take: bool = Talents.take_problem("warrior", 1, h.talents, "battleaxe") == ""
	inv._tal_press("tal_take", "battleaxe")
	await _run(0.3)
	await _snap("warrior_level1_axe_taken")
	inv._tal.sel = "greatsword"
	await _run(0.3)
	await _snap("warrior_level1_back_to_greatsword_card")
	var back_ok: bool = Talents.take_problem("warrior", 1, h.talents, "greatsword") == ""
	var wl: Dictionary = inv._tal.lay
	var pre_r: Rect2 = wl.get("pre", Rect2())
	var in_row: bool = pre_r.size.x > 0.0
	for wid in ["greatsword", "battleaxe", "warhammer"]:
		var wn: Dictionary = wl["at"].get(wid, {})
		in_row = in_row and wn.get("weapon", false) and pre_r.grow(1.0).encloses(wn["r"])
	_line(h.talents == ["battleaxe"] and free_take and back_ok and h.weapon == "battleaxe" and h.loadout.id(0) == "cleave" and Talents.spent("warrior", h.talents) == 0 and Talents.next_point("warrior", 1, h.talents) == 5 and in_row,
		"a new Warrior at level 1: his weapons a row of their own under his tree (%s), the battle axe in the greatsword's place (%s), his tap now %s, no point spent (his first at level %d); the greatsword his again as freely (%s)" % [in_row, h.talents, h.loadout.id(0), Talents.next_point("warrior", 1, h.talents), back_ok])
	inv._tal_press("tal_take", "greatsword")
	if inv.visible:
		inv.toggle()
	print("TALENTS DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " %s" % [bad]])


## A monster of the floor brought before him, awake, whole and ordinary (or an elite), `d` tiles the way he faces.
func _foe(d: float, elite := false):
	var mm = null
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and not o.boss and o.state != "rise" and (mm == null or (o.world.distance_to(h.world) < mm.world.distance_to(h.world))):
			mm = o
	if mm == null:
		return null
	mm.world = h.world + h.face * d
	mm.life = mm.max_life
	mm.elite = elite
	mm.cracks = 0
	mm.stun_t = 0.0 if mm.get("stun_t") != null else 0.0
	return mm


func _warrior() -> void:
	M.set_class("warrior", true)
	M.loot.level = 50
	h.life = h.max_life
	h.face = Vector2(1, 0)
	await _run(0.2)
	# Executioner, and the guard of Thick Skin and Bulwark
	var m = _foe(1.0)
	if m == null:
		_line(false, "no monster on the floor to try the Warrior's talents on")
		return
	h.talents = ["greatsword"]
	m.life = m.max_life * 0.2
	var k0: float = h._talent_hit_mult(m)
	h.talents = ["greatsword", "sweepingcut", "drilledleap", "footwork", "executioner"]
	var k1: float = h._talent_hit_mult(m)
	m.life = m.max_life * 0.5
	var k2: float = h._talent_hit_mult(m)
	_line(k0 == 1.0 and k1 == 2.0 and k2 == 1.0, "Executioner: double on one under a quarter of its life (%.1f), not over it (%.1f), nothing without it (%.1f)" % [k1, k2, k0])
	h.talents = ["greatsword", "thickskin", "shieldwall", "secondwind", "bulwark"]
	h.life = h.max_life * 0.4
	var g_low: float = h._talent_guard()
	h.life = h.max_life
	var g_high: float = h._talent_guard()
	_line(absf(g_low - 0.7 * g_high) < 0.001 and g_high <= 1.0 and g_high >= 0.7, "Thick Skin: below half his life 30%% less (%.2f of %.2f); Bulwark: %.0f%% less for those close round him now" % [g_low, g_high, (1.0 - g_high) * 100.0])
	# Master Stroke: every fourth hit landed a certain critical
	h.talents = ["greatsword", "sweepingcut", "drilledleap", "footwork", "mastertop"]
	h._strokes = 0
	h.stats["crit_chance"] = 0.0
	var crits := []
	for n in 8:
		m.life = m.max_life
		var before: int = h._strokes
		h.hit_monster(m, 0, 0.01, false)
		crits.append(before == 3)
	_line(crits == [false, false, false, true, false, false, false, true] and h._strokes == 0, "Master Stroke: his 4th and 8th hits certain criticals, the count begun again (%s)" % [crits])
	# Honed Edge: a critical bleeds
	h.talents = ["greatsword", "sweepingcut", "drilledleap", "honededge"]
	# (life enough to take a critical hit and bleed after it: at 2.5 times a regular hit (loot.gd CRIT_DOUBLE) it fell to the one)
	var mx0: float = m.max_life
	m.max_life = 1e6
	m.life = m.max_life
	m.bleed_t = 0.0
	h.stats["crit_chance"] = 100.0
	h.hit_monster(m, 0, 0.5, false)
	h.stats["crit_chance"] = 5.0
	m.max_life = mx0
	m.life = minf(m.life, mx0)
	_line(m.bleed_t > 2.9 and m.bleed_dps > 0.0, "Honed Edge: a critical hit makes it bleed half the hit again over 3 s (%.1f a second for %.1f s)" % [m.bleed_dps, m.bleed_t])
	# Giant Slayer: an elite's cracks, more from everything
	h.talents = ["greatsword", "sweepingcut", "drilledleap", "giantslayer"]
	m = _foe(1.0, true)
	for n in 12:
		m.life = m.max_life
		h.hit_monster(m, 0, 0.01, false)
	_line(m.cracks == 10, "Giant Slayer: each hit on an elite cracks its guard, ten at most (%d)" % m.cracks)
	m.elite = false
	m.cracks = 0
	# Resolute: not knocked back, not slowed
	h.talents = ["greatsword", "thickskin", "shieldwall", "secondwind", "bulwark", "resolute"]
	h._knock_t = 0.0
	h.knock(Vector2(1, 0), 2.0)
	h.chill(2.0, 0.5)
	_line(h._knock_t == 0.0 and h._slow_t <= 0.0, "Resolute: a blow's knock does nothing, nor a chill (%.2f, %.2f)" % [h._knock_t, h._slow_t])
	# Unbreakable: once in a dungeon, a killing blow leaves him at 1 life
	h.talents = ["greatsword", "thickskin", "shieldwall", "secondwind", "bulwark", "unbreakable"]
	h.unbroken = false
	h._invuln = 0.0
	var kept: bool = h.unhurt
	h.unhurt = false
	h.stats["block_chance"] = 0.0
	h.shield = 0.0
	h.life = 5.0
	h.hurt(9999.0, true)
	var first: bool = h.alive and h.life == 1.0
	var said := "after the first: alive %s, life %.1f, shielded %.1f s" % [h.alive, h.life, h._invuln]
	h._invuln = 0.0
	h.hurt(9999.0, true)
	var second: bool = not h.alive
	said += "; after the second: alive %s" % h.alive
	h.alive = true
	h.unhurt = kept
	h.life = h.max_life
	_line(first and second, "Unbreakable: the first killing blow leaves him at 1 life, shielded; the second in the same dungeon kills him (%s)" % said)
	h._invuln = 0.0
	# Second Wind: a flask throws back what is near, and nothing hurts him for a second
	m = _foe(1.0)
	var was: Vector2 = m.world
	M.loot.potions = 3
	h.life = h.max_life * 0.5
	M.loot.drink()
	await _run(0.4)
	_line(h._invuln > 0.0 or m.world.distance_to(h.world) > was.distance_to(h.world) + 0.5, "Second Wind: a flask drunk, the one near thrown back (%.1f tiles to %.1f) and nothing hurts him a second" % [was.distance_to(h.world), m.world.distance_to(h.world)])
	# Footwork: a kill makes the Lunge ready again
	h.talents = ["greatsword", "sweepingcut", "drilledleap", "footwork"]
	h._lunge_cd = 3.0
	m = _foe(1.0)
	h.killed(m)
	_line(h._lunge_cd == 0.0, "Footwork: a kill makes the Lunge ready again at once")
	h.talents = []


## `k` monsters of the floor, the nearest him, each brought where `at` says (tiles: [ahead, to his left]), awake, whole, ordinary, held
## still (stunned) where `hold`.
func _foes(at: Array, hold := false) -> Array:
	var out: Array = []
	var pool: Array = []
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and not o.boss and o.state != "rise":
			pool.append(o)
	pool.sort_custom(func(a, b): return a.world.distance_to(h.world) < b.world.distance_to(h.world))
	var left := Vector2(h.face.y, -h.face.x)
	for k in mini(at.size(), pool.size()):
		var mm = pool[k]
		var a: Array = at[k]
		mm.world = h.world + h.face * float(a[0]) + left * float(a[1])
		mm.max_life = maxf(mm.max_life, 100000.0)
		mm.life = mm.max_life
		mm.elite = false
		mm.cracks = 0
		mm.daze = 0.0
		mm.bleed_t = 0.0
		mm.bleed_dps = 0.0
		mm.stagger_cd = 0.0
		mm.stun_t = 30.0 if hold else 0.0
		out.append(mm)
	return out


## His tree taken as given, made his (hero.gd talents_changed: his weapon's moves and pictures).
func _take(list: Array) -> void:
	h.talents = list.duplicate()
	h.talents_changed()


## The nearest place to him with open floor all round, 4 tiles every way: he is set there, facing down the floor's +x.
func _open_ground() -> void:
	var best := Vector2.INF
	var at := Vector2i(floori(h.world.x), floori(h.world.y))
	for r in 40:
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if maxi(absi(dx), absi(dy)) != r:
					continue
				var c := at + Vector2i(dx, dy)
				var clear := true
				for y in range(-4, 5):
					for x in range(-6, 7):
						if not h.map.open_at(c.x + x, c.y + y):
							clear = false
							break
					if not clear:
						break
				if clear:
					best = Vector2(c.x + 0.5, c.y + 0.5)
					break
			if best != Vector2.INF:
				break
		if best != Vector2.INF:
			break
	if best != Vector2.INF:
		h.world = best
	h.face = Vector2(1, 0)


func _arms() -> void:
	M.set_class("warrior", true)
	M.loot.level = 50
	h.life = h.max_life
	await _run(0.2)
	var start: Vector2 = h.world
	_open_ground()
	await _run(0.1)
	# THE BATTLE AXE PICKED: its three moves on his buttons, his pictures the axe's, his greatsword made a battle axe
	_take(["battleaxe"])
	var kit = h.kit
	var ids: Array = [h.loadout.id(0), h.loadout.id(1), h.loadout.id(2)]
	var mh: Dictionary = M.loot.gear["mainhand"]
	var skills: Array = M._hud._skills().map(func(x): return x["id"])
	_line(kit != null and kit.weapon == "battleaxe" and ids == ["cleave", "axethrow", "chop"] and h.art.count(0, 116) > 0 and skills == ids and mh["kind"] == "Battle Axe" and str(mh["name"]).contains("Battle Axe") and str(mh["icon"]).begins_with("battleaxe:"),
		"the battle axe his first point: his moves %s (the bar's %s), his pictures the axe's (%d frames running empty-handed), his greatsword made a %s, '%s' (%s)" % [ids, skills, h.art.count(0, 116), mh["kind"], mh["name"], mh["icon"]])
	# CLEAVE: every enemy in its arc struck; REND, each bleeds a third of the hit again over 3 s
	var two := _foes([[1.0, 0.0], [1.0, 0.85]], true)
	if two.size() < 2:
		_line(false, "not two monsters on the floor to try the Cleave on")
		return
	var w0: float = two[1].life
	h._strike(0, h.world, h.face, 1.0, 0, false, 1.7)
	var both: bool = two[0].life < two[0].max_life and two[1].life < w0
	_take(["battleaxe", "rend"])
	two = _foes([[1.0, 0.0], [1.0, 0.85]], true)
	h._strike(0, h.world, h.face, 1.0, 0, false, 1.7)
	_line(both and two[0].bleed_t > 2.9 and two[1].bleed_t > 2.9 and two[0].bleed_dps > 0.0,
		"Cleave: the one before him and the one beside struck in its arc (%s); Rend: each bleeds (%.1f and %.1f a second for %.1f s)" % [both, two[0].bleed_dps, two[1].bleed_dps, two[0].bleed_t])
	# THE AXE THROWN: his hands empty; it flies through the one in its way, turns, strikes it again coming back, and is caught
	_take(["battleaxe"])
	kit = h.kit
	var m = _foes([[3.0, 0.0]], true)[0]
	kit._use_skill(1, h.world + h.face * 6.0)
	var empty_at_once: bool = kit.hands_empty
	var out_hit := false
	var back_hit := false
	var t := 0.0
	var appeared := false
	var caught := false
	var tapped := false
	while t < 3.0:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		for p in kit.shots:
			if p.get("look", "") == "axe" and (p["hit"] as Array).has(m):
				if p["back"]:
					back_hit = true
				else:
					out_hit = true
		if not tapped and t > 0.6 and kit.hands_empty:
			# (a tap while it flies: an axe appears in his hands and he Cleaves)
			tapped = true
			kit._use_basic(h.world + h.face)
			appeared = kit.appear and not kit.hands_empty
		if kit.caught_t >= 0.0 or (tapped and not kit._axe_out()):
			caught = true
			break
	await _snap("axe_back")
	_line(empty_at_once and out_hit and back_hit and appeared and caught and not kit._axe_out(),
		"Axe Throw: his hands empty as he throws (%s); it strikes the one in its way going (%s) and coming back (%s); a tap while it flies and an axe appears in his hands (%s); back, it is gone into his hands (%s)" % [empty_at_once, out_hit, back_hit, appeared, caught])
	# TWIN AXES: two thrown, one to each side of his aim, each for less
	await _run(0.5)
	_take(["battleaxe", "twinaxes"])
	kit = h.kit
	kit.charges[1] = 1
	kit._use_skill(1, h.world + h.face * 6.0)
	await _run(0.45)
	var axes: Array = kit.shots.filter(func(p): return p.get("look", "") == "axe")
	var spread := 0.0
	if axes.size() == 2:
		spread = rad_to_deg(absf(Vector2(axes[0]["vx"], axes[0]["vy"]).angle_to(Vector2(axes[1]["vx"], axes[1]["vy"]))))
	await _snap("twin_axes")
	_line(axes.size() == 2 and absf(spread - 28.0) < 0.5 and absf(float(axes[0]["dmg"]) - 0.65) < 0.01,
		"Twin Axes: %d thrown, %.1f degrees apart, each for %.2f of the throw" % [axes.size(), spread, float(axes[0]["dmg"]) if axes.size() > 0 else 0.0])
	await _run(2.0)
	# LEAPING CHOP: a crouch, then the leap; the axe comes down 1.5 tiles before where he lands
	_take(["battleaxe"])
	kit = h.kit
	_open_ground()
	var from: Vector2 = h.world
	kit._use_evasive(h.world + h.face * 4.0, Vector2.ZERO)
	m = _foes([[5.5, 0.0]], true)[0]
	await _run(0.1)
	var stayed: bool = h.world.distance_to(from) < 0.01 and not kit.move.is_empty()
	var crouch_pic: Array = kit.picture(0)
	await _run(0.6)
	_line(stayed and crouch_pic[0] == 123 and kit.move.is_empty() and h.world.distance_to(from) > 3.5 and m.life < m.max_life and kit.land_t >= 0.0,
		"Leaping Chop: he crouches where he stands first (%s, picture %s), then leaps %.1f tiles, and the axe brought down before him strikes the one there (%s)" % [stayed, crouch_pic, h.world.distance_to(from), m.life < m.max_life])
	# RED MIST, HEADLONG: a kill, faster, and Leaping Chop ready again
	_take(["battleaxe", "rend", "redmist", "headlong"])
	kit = h.kit
	kit.charges[2] = 0
	kit.cd[2] = 3.0
	var pace0: float = h.frenzy_pace()
	h.red_mist = 0
	h.red_mist_t = 0.0
	m = _foes([[1.0, 0.0]])[0]
	h.killed(m)
	h.killed(m)
	_line(kit.charges[2] == 1 and kit.cd[2] == 0.0 and h.red_mist == 2 and absf(h.frenzy_pace() - pace0 * 1.16) < 0.001,
		"Red Mist: two kills, %d stacks, his swings %.0f%% faster; Headlong: Leaping Chop ready again at once (%d)" % [h.red_mist, (h.frenzy_pace() / pace0 - 1.0) * 100.0, kit.charges[2]])
	h.red_mist_t = 0.0
	# THE WARHAMMER PICKED
	_take(["warhammer"])
	kit = h.kit
	ids = [h.loadout.id(0), h.loadout.id(1), h.loadout.id(2)]
	mh = M.loot.gear["mainhand"]
	_line(kit != null and kit.weapon == "warhammer" and ids == ["smash", "quake", "charge"] and h.art.count(0, 124) > 0 and mh["kind"] == "Warhammer",
		"the warhammer instead: his moves %s, his pictures the hammer's (%d frames of the charge's crouch), his weapon a %s, '%s'" % [ids, h.art.count(0, 124), mh["kind"], mh["name"]])
	# SMASH: on its spot, knocked back a little and dazed; a second soon after stuns
	_open_ground()
	m = _foes([[1.4, 0.0]])[0]
	var was: Vector2 = m.world
	h._strike(0, h.world, h.face, 1.0, 0, false, 1.4)
	var pushed: float = m.world.distance_to(was)
	var daze1: float = m.daze
	m.stun_t = 0.0
	var nx: Vector2 = was + h.face * 0.4
	h._strike(0, h.world, h.face, 1.0, 0, false, 1.4)
	_line(m.life < m.max_life and absf(pushed - 0.4) < 0.01 and absf(daze1 - 0.6) < 0.01 and m.stun_t > 0.0 and m.daze == 0.0,
		"Smash: the one on its spot struck, knocked %.2f tiles back, dazed %.2f; a second blow soon after stuns it (%.1f s)" % [pushed, daze1, m.stun_t])
	# HEAVY HEAD: Smash stuns half a second; WIDE SWING: the half circle before him
	_take(["warhammer", "heavyhead"])
	m = _foes([[1.4, 0.0]])[0]
	h._strike(0, h.world, h.face, 1.0, 0, false, 1.4)
	var hh: float = m.stun_t
	two = _foes([[1.4, 0.0], [0.6, 1.0]])
	w0 = two[1].life
	h._strike(0, h.world, h.face, 1.0, 0, false, 1.4)
	var spared: bool = two[1].life == w0
	_take(["warhammer", "heavyhead", "bulldozer", "wideswing"])
	two = _foes([[1.4, 0.0], [0.6, 1.0]])
	h._strike(0, h.world, h.face, 1.0, 0, false, 1.4)
	_line(hh >= 0.5 and spared and two[1].life < two[1].max_life,
		"Heavy Head: Smash stuns (%.1f s); the one beside him spared by the spot (%s), struck with Wide Swing (%s)" % [hh, spared, two[1].life < two[1].max_life])
	# EARTHQUAKE: the ground before him quakes in the floor's stone, the slam ring left to it; what stands there struck and stunned
	_take(["warhammer"])
	kit = h.kit
	m = _foes([[1.4, 0.0]])[0]
	var slams: int = int(M.fx.seen.get("burst", 0))
	kit._use_skill(1, h.world + h.face * 2.0)
	await _run(0.75)
	await _snap("quake")
	var look = kit.look
	var one_quake: bool = look != null and look.quakes.size() == 1
	_line(one_quake and m.life < m.max_life and m.stun_t > 0.0 and int(M.fx.seen.get("burst", 0)) > slams,
		"Earthquake: the ground quakes before him in the floor's stone (%s, %s), the one on it struck and stunned (%.1f s)" % [look.quakes.size() if look != null else -1, look._stone() if look != null else "", m.stun_t])
	await _run(2.0)
	# TREMORS: three shakes, each wider and weaker
	_take(["warhammer", "tremors"])
	kit = h.kit
	kit.charges[1] = 1
	kit._use_skill(1, h.world + h.face * 2.0)
	await _run(1.4)
	look = kit.look
	var qs: Array = look.quakes.map(func(q): return q["q"]) if look != null else []
	_line(qs == [0, 1, 2], "Tremors: the ground shakes three times, each its own (%s)" % [qs])
	await _run(2.0)
	# SHOULDER CHARGE, BULLDOZER: what it strikes carried along before him and stunned where he stops
	_take(["warhammer", "heavyhead", "bulldozer"])
	kit = h.kit
	_open_ground()
	from = h.world
	m = _foes([[1.5, 0.0]])[0]
	kit._use_evasive(h.world + h.face * 5.0, Vector2.ZERO)
	await _run(0.45)
	await _snap("charge")
	await _run(0.5)
	var ahead: float = (m.world - h.world).dot(h.face)
	_line(kit.move.is_empty() and m.life < m.max_life and ahead > 0.5 and ahead < 1.5 and m.stun_t > 0.0 and h.world.distance_to(from) > 3.5,
		"Shoulder Charge: struck in his way, carried along before him (%.1f tiles before him where he stops), stunned there (%.1f s)" % [ahead, m.stun_t])
	# BACK TO THE GREATSWORD: his tree undone, his own moves, pictures and weapon again
	_take([])
	mh = M.loot.gear["mainhand"]
	_line(h.kit == null and h.weapon == "greatsword" and h.loadout.id(1) == "whirl" and mh["kind"] == "Greatsword",
		"his tree undone: the greatsword's moves again (%s), its pictures, his weapon a %s, '%s'" % [h.loadout.id(0), mh["kind"], mh["name"]])
	# (he and the monsters let go as they were for the others' checks)
	h.world = start
	h.face = Vector2(1, 0)
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead:
			o.stun_t = 0.0
			o.daze = 0.0


func _veteran() -> void:
	M.set_class("brawler", true)
	M.loot.level = 50
	h.life = h.max_life
	h.face = Vector2(1, 0)
	await _run(0.3)
	var kit = h.kit
	var T: Dictionary = Talents.D["vetTalents"]
	# Light on His Feet: his jump's wait a third shorter
	h.talents = ["vlightfeet"]
	kit.cd[2] = 0.0
	kit.charges[2] = 1
	kit._press("swipe", h.world + h.face)
	var wait_l: float = kit.cd[2]
	kit.mv = {}
	kit.queue = []
	kit.globes = []
	kit.done = []
	h.talents = []
	kit.cd[2] = 0.0
	kit.charges[2] = 1
	kit._press("swipe", h.world + h.face)
	var wait_0: float = kit.cd[2]
	kit.mv = {}
	kit.queue = []
	kit.globes = []
	kit.done = []
	_line(absf(wait_l - wait_0 * float(T["lightFeet"]["wait"])) < 0.01, "Light on His Feet: his jump's wait %.2f s, a third less than %.2f s" % [wait_l, wait_0])
	# Fire Starter: landed from a dodge jump, his next tap comes out in fire
	h.talents = ["vlightfeet", "vfirestarter"]
	kit.fire_ready = true
	kit._press("tap", h.world + h.face)
	var fired: bool = not kit.globes.is_empty() and kit.globes[0] == "punchFire" and not kit.fire_ready
	kit.queue = []
	kit.globes = []
	_line(fired, "Fire Starter: after the dodge jump his next tap is in fire (%s), the jump not spent" % [kit.globes])
	# Guard Up: between blows a blow from in front does half harm, from behind full
	h.talents = ["vstiffjab", "vguardup"]
	kit.mv = {}
	var front: float = kit.guard_k(h.world + h.face)
	var back: float = kit.guard_k(h.world - h.face)
	_line(front == 0.5 and back == 1.0, "Guard Up: a blow from in front does half harm (%.1f), from behind all of it (%.1f)" % [front, back])
	# Long Legs: his kicks reach a tile further
	var m: Dictionary = kit.R["roundkick"]
	var o: Vector2 = h.world
	var a: Vector2 = h.face
	var left := Vector2(a.y, -a.x)
	var far: float = float(m["force"]["reach"]) + 0.6 + 0.3
	var no_legs: float = kit._reach(m, o, a, left, o + a * far, 0.3, 0.0)
	var legs: float = kit._reach(m, o, a, left, o + a * far, 0.3, float(T["longLegs"]["more"]))
	_line(no_legs < 0.0 and legs >= 0.0, "Long Legs: a round kick reaches one %.1f tiles off with them (frame %.1f), not without (%.1f)" % [far, legs, no_legs])
	h.talents = []


func _warlock() -> void:
	M.set_class("warlock", true)
	M.loot.level = 50
	h.life = h.max_life
	h.face = Vector2(1, 0)
	await _run(0.3)
	var kit = h.kit
	var T: Dictionary = Talents.D["warlockTalents"]
	var m = _foe(1.0)
	var o = null
	for q in M._monsters.list:
		if is_instance_valid(q) and q != m and not q.dead and not q.boss and q.state != "rise":
			o = q
			break
	if m == null or o == null:
		_line(false, "two monsters wanted to try the Warlock's talents on")
		return
	o.world = m.world + Vector2(0, 0.8)
	o.life = o.max_life
	# Branded: his bolt curses what it hits
	h.talents = ["branded"]
	m.curse_t = 0.0
	kit.pact = 0.0
	h.hit_monster(m, 0, 0.1, false)
	_line(m.curse_t > 0.0, "Branded: his Hellfire Bolt curses what it hits (%.1f s)" % m.curse_t)
	# Blazing Arm: with his pact full, his bolt bursts, cursing and striking all near it
	h.talents = ["branded", "hexchain", "blazingarm"]
	o.curse_t = 0.0
	var before: float = o.life
	kit.pact = float(kit.W["pact"]["full"])
	m.curse_t = 0.0
	h.hit_monster(m, 0, 0.1, false)
	_line(o.curse_t > 0.0 and o.life < before, "Blazing Arm: his pact full, the bolt bursts: the one beside it cursed (%.1f s) and struck (%.0f to %.0f)" % [o.curse_t, before, o.life])
	# (and only from the one the bolt itself struck: one its fire's burst caught round it sets off no burst and no chain of its own)
	for q in [m, o]:
		q.hell_t = 0.0
		q.burn_t = 0.0
		q.curse_dps = 0.0
		q.curse_t = 3.0
	await _run(0.3)
	var m0: float = m.life
	kit.splashing = true
	h.hit_monster(o, 0, 0.1, true)
	kit.splashing = false
	m.hell_t = 0.0
	await _run(0.3)
	_line(m.life == m0, "a burst's catch: one caught in his bolt's burst sets off no Blazing Arm and no Hex Chain of its own (the one beside it %.0f, then %.0f)" % [m0, m.life])
	kit.pact = 0.0
	# Withering: cursed, they move and strike at half speed
	h.talents = ["branded", "hexchain", "blazingarm", "withering"]
	o.curse_t = 3.0
	var slowed: float = o.rage()
	o.curse_t = 0.0
	var whole: float = o.rage()
	_line(absf(slowed - whole * float(T["withering"]["pace"])) < 0.001, "Withering: a cursed one's pace %.2f, %.2f uncursed" % [slowed, whole])
	# Soul Debt and Pyre: a cursed one dying fills a tenth of his pact, and bursts in hellfire
	h.talents = ["branded", "hexchain", "blazingarm", "withering", "pyre", "souldebt"]
	kit.pact = 0.0
	m.curse_t = 3.0
	before = o.life
	kit.on_kill(m)
	var filled: float = kit.pact
	await _run(0.2)
	_line(absf(filled - float(kit.W["pact"]["full"]) * float(T["soulDebt"]["share"])) < 0.01 and o.life < before, "Soul Debt: a cursed one's death fills a tenth of his pact (%.1f of %.0f); Pyre: it bursts, the one beside struck (%.0f to %.0f)" % [filled, kit.W["pact"]["full"], before, o.life])
	# Phantom Step: his smoke step leaves his shadow where he stood; the enemies near go after it
	h.talents = ["branded", "hexchain", "phantomstep"]
	h.monsters.decoys.clear()
	var from: Vector2 = h.world
	kit.charges[2] = 1
	kit._use_evasive(h.world + Vector2(3.0, 0.0), Vector2(1, 0))
	await _run(0.5)
	o.world = from + Vector2(0.0, 1.5)
	var drawn = h.monsters.decoy_for(o)
	await _snap("warlock_phantom_step")
	_line(h.monsters.decoys.size() == 1 and kit._shadows.size() == 1 and drawn != null, "Phantom Step: his shadow left where he stood (%d), the one near it drawn to it for %.0f s" % [kit._shadows.size(), float(T["phantom"]["secs"])])
	await _run(2.0)
	_line(h.monsters.decoys.is_empty() and kit._shadows.is_empty(), "Phantom Step: two seconds on, his shadow and its pull gone")
	# The demon's kills: Hunger, Feast, Bloodlust
	h.talents = ["hunger", "feast", "bloodlust"]
	kit.form = "demon"
	kit.pact = 10.0
	kit.lust = 0
	h.life = h.max_life * 0.5
	var life0: float = h.life
	m.curse_t = 0.0
	kit.on_kill(m)
	var rk: float = kit.rate_k()
	_line(kit.pact > 10.0 and h.life > life0 and kit.lust == 1 and rk > 1.0, "the demon's kill: Hunger puts back pact (10 to %.1f), Feast heals him (%.0f to %.0f), Bloodlust quickens its rakes (x%.2f)" % [kit.pact, life0, h.life, rk])
	kit.form = "man"
	kit.lust = 0
	kit.pact = 0.0
	h.life = h.max_life
	h.talents = []
	await _warlock_tree()


## The Warlock's last four: Terrible Roar, Hellwave, Damned Souls, the Bound Demon.
func _warlock_tree() -> void:
	M.set_class("warlock", true)
	M.loot.level = 50
	h.life = h.max_life
	await _run(0.2)
	var start: Vector2 = h.world
	_open_ground()
	M._kit_look()
	await _run(0.2)
	var kit = h.kit
	var full: float = kit.W["pact"]["full"]
	# TERRIBLE ROAR: the change's roar curses all it throws back, and they run from him
	_take(["hunger", "terribleroar"])
	var two := _foes([[1.2, 0.0], [0.0, 1.4]])
	kit.pact = full
	h.auto_change = true
	await _run(float(kit.W["change"]["secs"]) + 0.15)
	var d0: float = two[0].world.distance_to(h.world)
	var cursed: bool = two[0].curse_t > 0.0 and two[1].curse_t > 0.0
	var fleeing: bool = two[0].flee_t > 0.0 and two[1].flee_t > 0.0
	await _run(0.5)
	await _snap("warlock_terrible_roar")
	_line(kit.form == "demon" and cursed and fleeing and two[0].world.distance_to(h.world) > d0 + 0.3,
		"Terrible Roar: changed, his roar curses both it threw back (%s), and they run from him (%s; %.1f tiles to %.1f)" % [cursed, fleeing, d0, two[0].world.distance_to(h.world)])
	# HELLWAVE: every third rake throws a wave of hellfire on ahead, burning what it meets
	_take(["hunger", "terribleroar", "hellwave"])
	var m = _foes([[3.0, 0.0]], true)[0]
	m.hell_t = 0.0
	var life0: float = m.life
	kit.rakes = 0
	for k in 3:
		kit._rake_done(h.world, h.face, 1.0)
	var waves: int = kit.hellwaves.size()
	await _run(0.35)
	await _snap("warlock_hellwave")
	_line(waves == 1 and m.life < life0 and m.hell_t > 0.0, "Hellwave: the third rake throws a wave of hellfire (%d), the one ahead struck and burning (%.1f s)" % [waves, m.hell_t])
	# DAMNED SOULS: one the demon kills rises as a burning soul that flies into the nearest enemy
	_take(["hunger", "feast", "damnedsouls"])
	two = _foes([[1.0, 0.0], [3.0, 1.0]], true)
	two[1].curse_t = 0.0
	two[1].hell_t = 0.0
	kit.on_kill(two[0])
	var raised: int = kit.souls.size()
	await _run(0.15)
	await _snap("warlock_damned_soul")
	await _run(0.5)
	_line(raised == 1 and kit.souls.is_empty() and two[1].curse_t > 0.0 and two[1].hell_t > 0.0, "Damned Souls: the demon's kill rises as a soul (%d) that flew into the one near, cursing it and setting it alight" % raised)
	# THE BOUND DEMON: the demon tears out beside him and fights while he stays a man, till the pact runs dry
	kit._become("man")
	kit.change = {}
	_take(["hunger", "feast", "bloodlust", "bounddemon"])
	kit.pact = full
	h.auto_change = true
	await _run(0.1)
	var out: bool = not kit.bound.is_empty() and kit.form == "man"
	m = _foes([[2.5, 1.0]], true)[0]
	m.curse_t = 0.0
	life0 = m.life
	await _run(1.6)
	await _snap("warlock_bound_demon")
	var struck: bool = m.life < life0 and m.curse_t > 0.0
	var drawn: bool = kit.look != null and kit.look._bound_node != null and is_instance_valid(kit.look._bound_node)
	kit.pact = 0.05
	await _run(0.3)
	var burnt: bool = not kit.bound.is_empty() and kit.bound["act"] == "out"
	await _run(1.2)
	_line(out and struck and drawn and burnt and kit.bound.is_empty() and kit.pact == 0.0,
		"Bound Demon: torn out beside him while he stays a man (%s), drawn among the figures (%s), it went for the one near, struck and cursed it (%s); its pact dry, it burnt out (%s) and was gone" % [out, drawn, struck, burnt])
	_take([])
	kit.pact = 0.0
	h.world = start
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead:
			o.stun_t = 0.0
			o.flee_t = 0.0


func _tinkerer() -> void:
	M.set_class("tinkerer", true)
	M.loot.level = 50
	h.life = h.max_life
	h.face = Vector2(1, 0)
	# (her look, as a place built with her in it has it: main.gd _build)
	var kl = load("res://scripts/heroes/tinkerer_look.gd").new()
	kl.kit = h.kit
	kl.loot = M.loot
	M._place.add_child(kl)
	M._place.move_child(kl, M.fx.get_index() + 1)
	h.kit.look = kl
	await _run(0.3)
	var kit = h.kit
	var T: Dictionary = Talents.D["tinkerTalents"]
	var m = _foe(1.5)
	if m == null:
		_line(false, "no monster to try the Tinkerer's talents on")
		return
	# Fortune: 1% of her gold, as a percent
	h.talents = ["bombsaway", "fortune"]
	var gold0: int = M.loot.gold
	M.loot.gold = 1000
	var k: float = h._talent_hit_mult(m)
	M.loot.gold = gold0
	_line(absf(k - 1.1) < 0.001, "Fortune: with 1,000 gold she hits x%.2f" % k)
	# The Big One and Mad Mixture: every fifth vial a big one; each a brew
	h.talents = ["bombsaway", "clustervials", "tar", "madmixture", "alchemy", "thebigone"]
	kit.vials_thrown = 0
	kit._since_big = 0
	kit._big_at = -1e9
	var bigs := []
	var brews := {}
	for n in 10:
		var v := {}
		h._clock += 1.0
		kit._brew(v)
		bigs.append(v.get("big", false))
		brews[v.get("brew", "")] = true
	_line(bigs == [false, false, false, false, true, false, false, false, false, true] and not brews.has(""), "The Big One: the 5th and 10th vials big, a vial a second (%s); Mad Mixture: each a brew (%s)" % [bigs, brews.keys()])
	# (BIG_ONE_WAIT, on at his yes: no big one sooner than BIG_ONE_SECS after the last; ten vials thrown at once, only the 5th big)
	if kit.BIG_ONE_WAIT:
		kit._since_big = 0
		kit._big_at = -1e9
		var fast := []
		for n in 10:
			var v := {}
			h._clock += 0.2
			kit._brew(v)
			fast.append(v.get("big", false))
		_line(fast == [false, false, false, false, true, false, false, false, false, false], "The Big One no sooner than %.0f s after the last: ten vials in two seconds, only the 5th big (%s)" % [kit.BIG_ONE_SECS, fast])
	# Tar and Cluster Vials: a vial bursting leaves a puddle and breaks into three little ones
	kit.tars.clear()
	kit.vials.clear()
	var at: Vector2 = m.world
	kit._vial_bursts({"x0": h.world.x, "y0": h.world.y, "x1": at.x, "y1": at.y, "t": 0.0, "flight": 0.5, "skill": 0, "frac": 0.01, "wake": false})
	var littles: int = kit.vials.filter(func(v): return v.get("little", false)).size()
	m.world = at
	var crawl: float = kit.tar_k(m)
	_line(kit.tars.size() == 1 and littles == int(T["cluster"]["n"]) and absf(crawl - float(T["tar"]["crawl"])) < 0.001,
		"Tar: a puddle where it burst, what walks in it at %.0f%% of its pace; Cluster Vials: %d little ones bouncing out" % [crawl * 100.0, littles])
	h.talents = ["bombsaway", "clustervials", "tar", "madmixture", "alchemy", "thebigone"]
	await _run(0.45)
	await _snap("tinkerer_tar_and_little_vials")
	kit.vials.clear()
	await _run(0.2)
	# Alchemy: what her vials kill always drops gold
	var drops0: int = M.loot._drops.size()
	var foe = _foe(1.5)
	kit.brewing = true
	var golds := 0
	for n in 4:
		var before: int = M.loot._drops.filter(func(d): return d.get("kind") == "gold").size()
		M.loot.on_kill(foe)
		golds += 1 if M.loot._drops.filter(func(d): return d.get("kind") == "gold").size() > before else 0
	kit.brewing = false
	_line(golds == 4, "Alchemy: each of four kills by her vials dropped gold (%d of 4)" % golds)
	# Mark II: she whistles out a second Golem, at her other side (on open ground, the floor's monsters away)
	_open_ground()
	h.talents = ["bombsaway", "markii"]
	kit.golems = []
	kit._whistle(1, h.world + Vector2(3, 0), 0.01, 1)
	kit._whistle(1, h.world + Vector2(3, 0), 0.01, 1)
	var seats: Array = kit.golems.map(func(q): return int(q["seat"]))
	_line(seats == [0, 1] and kit.golems.size() == 2, "Mark II: two Golems whistled out, at her one side and her other (seats %s)" % [seats])
	var g: Dictionary = kit.golems[0]
	kit.golems = [g]
	g["act"] = "stand"
	g["x"] = h.world.x + 2.0
	g["y"] = h.world.y
	# Growth Serum: a vial bursting by her Golem makes it grow, twice as big and twice as strong
	h.talents = ["bombsaway", "growthserum"]
	kit._vial_bursts({"x0": h.world.x, "y0": h.world.y, "x1": float(g["x"]) + 0.5, "y1": float(g["y"]), "t": 0.0, "flight": 0.5, "skill": 0, "frac": 0.01, "wake": false})
	await _run(0.3)
	await _snap("tinkerer_growth_serum")
	_line(float(g["grow_t"]) > 0.0 and kit.golem_might(g) == float(T["growth"]["strong"]) and absf(kit.golem_body(g) - 0.5 * float(T["growth"]["big"])) < 1e-6 and kit.golem_grow(g) > 1.5,
		"Growth Serum: a vial bursting by it made it grow, x%.0f as strong, its body %.1f tiles round, drawn x%.1f" % [kit.golem_might(g), kit.golem_body(g), kit.golem_grow(g)])
	g["grow_t"] = 0.0
	# Lightning Rod and Prospector, on its big shot (his word: it only shoots, the big shot in its ground pound's place)
	h.talents = ["bombsaway", "lightningrod", "prospector"]
	h.monsters.decoys.clear()
	var foe2 = _foe(1.5)
	foe2.world = Vector2(g["x"], g["y"]) + Vector2(0, 2.0)
	var piles0: int = M.loot._drops.filter(func(q): return q.get("kind") == "gold").size()
	var coin0: int = M.loot.gold
	g["ax"] = float(g["x"]) + 4.0
	g["ay"] = float(g["y"])
	kit._charged_shot(g, "shell", 1.0, 0.01)
	var d = h.monsters.decoy_for(foe2)
	# (counted as it bursts, before she can walk over them: its flight is 4 tiles at 20 a second)
	var piles := [0]
	for n in 12:
		await _run(0.04)
		piles[0] = maxi(piles[0], M.loot._drops.filter(func(q): return q.get("kind") == "gold").size() - piles0 + (1 if M.loot.gold > coin0 else 0))
	_line(h.monsters.decoys.size() == 1 and d != null and piles[0] > 0,
		"Lightning Rod: its big shot makes it a decoy for %.0f s, what is within %.0f tiles goes after it; Prospector: its shell dug up %d piles of gold where it burst" % [float(T["rod"]["secs"]), float(T["rod"]["near"]), piles[0]])
	h.monsters.decoys.clear()
	# Gun Arm (his word: the cannon swapped for the tesla coil): it zaps the nearest every second, leaping on; its hold a beam;
	# her tap and hold grows with Intelligence
	h.talents = ["bombsaway", "lightningrod", "gunarm"]
	h.talents_changed()
	var z1 = _foe(1.5)
	z1.world = Vector2(g["x"], g["y"]) + Vector2(3.0, 0.0)
	z1.seen = true
	if z1.state == "sleep":
		z1.state = "chase"
	z1.stun_for(5.0)
	var zl0: float = z1.life
	g["zap_t"] = 0.0
	kit._tesla_coil(g, 0.05)
	var zapped: bool = z1.life < zl0
	await _run(0.06)
	await _snap("tinkerer_tesla_zap")
	var bl0: float = z1.life
	g["fx"] = 1.0
	g["fy"] = 0.0
	kit._charged_shot(g, "beam", 1.0, 0.01)
	var beamed: bool = z1.life < bl0
	g["act"] = "charge"
	g["act_t"] = 1.1
	g["held"] = 1.0
	g["did"] = true
	await _run(0.15)
	await _snap("tinkerer_tesla_beam")
	g["act"] = "stand"
	var card: String = Talents.of("tinkerer", "gunarm")["text"]
	_line(kit.arm_of() == "tesla" and zapped and beamed and h.loadout.grows[1] == "int" and Talents.of("tinkerer", "gunarm")["pick"] == null and card.contains("tesla coil"),
		"Gun Arm: its cannon swapped for the tesla coil (%s): its zap struck the one 3 tiles off (%.0f to %.0f), its beam struck it (%.0f to %.0f); her tap and hold grows with %s; its card: \"%s\"" % [kit.arm_of(), zl0, bl0, bl0, z1.life, h.loadout.grows[1], card])
	# THE CONTRAPTION (her tap, in her Vial Toss's place), its pick BOMBS: thrown down, it sets up and lobs her little bombs at the
	# one before it; a fourth thrown puts the oldest out of action; its pick ENERGY: bolts of energy
	kit.golems = []
	h.talents = ["bombsaway", "contraptions"]
	h.picks["contraptions"] = "bombs"
	h.talents_changed()
	var tap_is: String = h.loadout.id(0)
	var grows_b: String = h.loadout.grows[0]
	var cf = _foe(5.0)
	cf.seen = true
	if cf.state == "sleep":
		cf.state = "chase"
	cf.max_life = maxf(cf.max_life, 100000.0)
	cf.life = cf.max_life
	cf.stun_for(30.0)
	kit.contraptions.clear()
	kit.vials.clear()
	kit._throw_contraption(0, h.world, h.world + h.face * 2.5, 0.5)
	await _run(0.2)
	await _snap("tinkerer_contraption_thrown")
	var con: Dictionary = kit.contraptions[0] if not kit.contraptions.is_empty() else {}
	await _run(1.2)
	await _snap("tinkerer_contraption_set")
	var cl0: float = cf.life
	var lobbed := false
	for n in 60:
		await _run(0.05)
		if kit.vials.any(func(v): return v.get("bomb", false)):
			lobbed = true
			break
	await _run(0.2)
	await _snap("tinkerer_contraption_bomb")
	var blown := false
	for n in 40:
		await _run(0.05)
		if cf.life < cl0:
			blown = true
			break
	await _run(0.1)
	await _snap("tinkerer_contraption_blast")
	_line(tap_is == "contraption" and grows_b == "dex" and not con.is_empty() and lobbed and blown,
		"Contraption: in her tap's place (%s, growing with %s), thrown down it set up and lobbed a little bomb at the one before it, struck (%.0f to %.0f)" % [tap_is, grows_b, cl0, cf.life])
	# (a fourth thrown puts the oldest out of action, now it is past its first shot)
	for n in 3:
		kit._throw_contraption(0, h.world, h.world + h.face * 2.0 + Vector2(-h.face.y, h.face.x) * (n - 1) * 1.2, 0.5)
	var standing: int = kit.contraptions.filter(func(q): return float(q["broke"]) < 0.0).size()
	_line(float(con.get("broke", -1.0)) >= 0.0 and standing == 3, "Contraption: a fourth thrown put the oldest out of action (falling apart: %s), three standing (%d)" % [float(con.get("broke", -1.0)) >= 0.0, standing])
	await _run(0.3)
	await _snap("tinkerer_contraption_breaks")
	# (its pick ENERGY: bolts of energy at the nearest, growing with Intelligence)
	h.picks["contraptions"] = "energy"
	h.talents_changed()
	var grows_e: String = h.loadout.grows[0]
	kit.contraptions.clear()
	kit.vials.clear()
	cf.life = cf.max_life
	kit._throw_contraption(0, h.world, h.world + h.face * 2.5, 0.5)
	await _run(1.4)
	var el0: float = cf.life
	var bolted := false
	for n in 60:
		await _run(0.05)
		if cf.life < el0:
			bolted = true
			break
	await _snap("tinkerer_contraption_bolt")
	_line(grows_e == "int" and bolted, "Contraption, its pick ENERGY (growing with %s): its bolt of energy struck the one before it (%.0f to %.0f)" % [grows_e, el0, cf.life])
	h.talents = []
	h.picks.erase("contraptions")
	h.talents_changed()
	kit.golems = []
	kit.contraptions.clear()
	kit.vials.clear()
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead:
			o.stun_t = 0.0


func _ranger() -> void:
	M.set_class("ranger", true)
	M.loot.level = 50
	h.life = h.max_life
	h.face = Vector2(1, 0)
	await _run(0.3)
	var kit = h.kit
	var T: Dictionary = Talents.D["tune"]
	var m = _foe(2.0)
	if m == null:
		_line(false, "no monster to try the Ranger's talents on")
		return
	# Light Step and Windrunner: three rolls held; a kill gives one back
	h.talents = ["fleet", "windrunner", "steadyaim", "quickdraw", "longshot", "lightstep"]
	h.talents_changed()
	var most: int = kit.max_charges[2]
	kit.charges[2] = 1
	kit.on_kill(m)
	_line(most == 3 and kit.charges[2] == 2, "Light Step: his roll holds %d charges; Windrunner: a kill gives one back (1 to %d)" % [most, kit.charges[2]])
	# Fleet: loosing an arrow no longer slows him
	kit.attack = {"skill": 0, "age": 0.0, "wind": 0.1, "t": 0.5}
	var fleet: float = kit.walk_slow()
	h.talents = []
	var slowed: float = kit.walk_slow()
	kit.attack = {}
	_line(fleet == 1.0 and slowed < 1.0, "Fleet: shooting he walks at %.0f%%, %.0f%% without it" % [fleet * 100.0, slowed * 100.0])
	# Keen Eye and Hunter's Mark: a sleeping one's first arrow a certain critical; a spent mark a triple one
	h.talents = ["keeneye", "steadyaim", "fleet", "quickdraw", "longshot", "lightstep", "huntersmark"]
	h.stats["crit_chance"] = 0.0
	m.life = m.max_life
	m.state = "sleep"
	var before: float = m.life
	h.hit_monster(m, 0, 0.02, false)
	var keen: bool = M.fx.last.get("hit", {}).get("crit", false) if M.fx != null else false
	m.state = "chase"
	h.stats["crit_chance"] = 5.0
	_line(keen, "Keen Eye: his arrow at one that has not noticed him a certain critical (%.0f to %.0f)" % [before, m.life])
	# Steady Aim: a second stood still, his next arrow goes through every enemy in its line
	kit.still_t = 1.5
	kit.shots.clear()
	kit._deliver(0, h.world, h.world + h.face * 4.0, 1.0, true)
	var pierce: bool = not kit.shots.is_empty() and bool(kit.shots[0]["pierce"])
	_line(pierce and kit.still_t == 0.0, "Steady Aim: stood still a second, his next arrow goes through all in its line")
	# Quick Draw: every fifth arrow fires twice
	kit.shots.clear()
	kit._draws = 0
	kit.quick_n = 0
	for n in 4:
		kit._deliver(0, h.world, h.world + h.face * 4.0, 1.0, true)
	await _run(0.2)
	var after4: int = kit.quick_n
	kit._deliver(0, h.world, h.world + h.face * 4.0, 1.0, true)
	await _run(0.2)
	_line(after4 == 0 and kit.quick_n == 1, "Quick Draw: four arrows loosed once each (%d again), the fifth loosed again a moment after (%d)" % [after4, kit.quick_n])
	kit.shots.clear()
	# Minefield: each roll lays three traps in a fan
	h.talents = ["fleet", "windrunner", "steadyaim", "quickdraw", "longshot", "lightstep", "huntersmark", "widetraps", "minefield"]
	h.talents_changed()
	kit.traps.clear()
	kit.charges[2] = 3
	# (what is near him held where it stands, so that none walks onto the traps before they are counted: with stuns made rare
	# (monster.gd STUNS_RARE) the ones the checks before had stunned were up again and sprang them)
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead:
			o.speed = 0.0
			o.state = "recover"
			o._t = 1e9
			o._cd = 1e9
	kit._use_evasive(h.world + Vector2(2, 0), Vector2(1, 0))
	await _run(0.4)
	_line(kit.traps.size() == 3, "Minefield: a roll lays three traps in a fan (%d)" % kit.traps.size())
	kit.traps.clear()
	# Split Shot: an arrow that kills splits into three that fly on
	h.talents = ["fleet", "windrunner", "steadyaim", "quickdraw", "longshot", "lightstep", "huntersmark", "splitshot"]
	m = _foe(2.0)
	m.life = 1.0
	kit.shots.clear()
	var p := {"x": h.world.x, "y": h.world.y, "vx": 10.0, "vy": 0.0, "r": 0.3, "dist": 8.0, "dmg": 50.0, "element": "phys", "pierce": false, "hit": [], "volley": false,
		"skill": 0, "trail": 0.0, "words": [], "age": 0.0, "n": 0, "flown": 0.0, "look": "arrow"}
	kit._shot_hit(p, m)
	_line(m.dead and kit.shots.size() == int(T["splitShot2"]["n"]), "Split Shot: the arrow that killed it splits into %d, flying on" % kit.shots.size())
	kit.shots.clear()
	h.talents = []
	h.talents_changed()


func _mage() -> void:
	M.set_class("mage", true)
	M.loot.level = 50
	h.life = h.max_life
	h.face = Vector2(1, 0)
	# (her look, as a place built with her in it has it)
	var kl = load("res://scripts/heroes/mage_look.gd").new()
	kl.kit = h.kit
	kl.loot = M.loot
	M._place.add_child(kl)
	M._place.move_child(kl, M.fx.get_index() + 1)
	h.kit.look = kl
	await _run(0.3)
	var kit = h.kit
	var T: Dictionary = Talents.D["tune"]
	var m = _foe(1.5)
	var o = null
	for q in M._monsters.list:
		if is_instance_valid(q) and q != m and not q.dead and not q.boss and q.state != "rise":
			o = q
			break
	if m == null or o == null:
		_line(false, "two monsters wanted to try the Mage's talents on")
		return
	o.world = m.world + Vector2(0, 0.8)
	o.life = o.max_life
	# (a way from her with clear floor for four and a half tiles, for what slides and what is struck)
	var way := Vector2(1, 0)
	for k in 16:
		var u := Vector2(cos(k * TAU / 16.0), sin(k * TAU / 16.0))
		var clear := true
		for d in range(1, 10):
			var p: Vector2 = h.world + u * d * 0.5
			clear = clear and M.map.fits(p.x, p.y, 0.45)
		if clear:
			way = u
			break
	h.face = way
	m.world = h.world + way * 1.2
	m.face = way
	o.world = m.world + way * 1.4
	o.face = way
	# Kindling: her fire leaves the ground burning where it hits
	h.talents = ["kindling"]
	var burns0: int = h.wakes.list.filter(func(z): return z["kind"] == "burn").size()
	var r0: Dictionary = h.loadout.r(0)
	var was_el = r0["element"]
	r0["element"] = "fire"
	h.hit_monster(m, 0, 0.01, false)
	r0["element"] = was_el
	var burns1: int = h.wakes.list.filter(func(z): return z["kind"] == "burn").size()
	_line(burns1 == burns0 + 1, "Kindling: her fire hit leaves the ground burning (%d patch to %d)" % [burns0, burns1])
	# Shatter: frozen ones take twice as much
	h.talents = ["bittercold", "deepfreeze", "frostwarp", "rime", "shatter"]
	m.frozen_t = 1.0
	var k_frozen: float = h._talent_hit_mult(m)
	m.frozen_t = 0.0
	_line(k_frozen == float(T["shatter"]), "Shatter: a frozen one takes x%.0f" % k_frozen)
	# Deep Freeze: a frozen one struck slides away, freezing what it touches
	h.talents = ["bittercold", "deepfreeze"]
	o.frozen_t = 0.0
	o.freeze_immune = 0.0
	m.world = h.world + way * 1.2
	o.world = m.world + way * 1.4
	m.frozen_t = 1.0
	m.life = m.max_life
	h.hit_monster(m, 0, 0.001, false)
	await _run(0.5)
	_line(o.frozen_t > 0.0, "Deep Freeze: struck frozen, it slid away and froze the one it met (%.1f s)" % o.frozen_t)
	# Bitter Cold: what strikes her is chilled
	o.chill_t = 0.0
	var kept: bool = h.unhurt
	h.unhurt = true
	h._invuln = 0.0
	h.hurt_by(5.0, "phys", [], {}, o)
	h.unhurt = kept
	_line(o.chill_t > 1.9 and o.chill >= 0.5, "Bitter Cold: what strikes her is chilled to half its pace for two seconds (%.1f s)" % o.chill_t)
	# Overload: a shocked one dying passes its shock to the three nearest
	h.talents = ["charged", "forking", "stormwarp", "overload"]
	o.world = m.world + Vector2(0, 1.0)
	o.shock_t = 0.0
	m.shock_t = 1.5
	kit.on_kill(m)
	_line(o.shock_t > 0.0, "Overload: a shocked one dying passes its shock on (%.1f s)" % o.shock_t)
	# Charged: a charge gathered walking; her next hit lets it go, a bolt leaping between them
	kit.charge = 1.0
	o.life = o.max_life
	var life_o: float = o.life
	m.life = m.max_life
	h.hit_monster(m, 0, 0.001, false)
	_line(kit.charge == 0.0 and o.life < life_o, "Charged: the charge goes off with her hit, leaping to the one beside (%.0f to %.0f)" % [life_o, o.life])
	# The Aura: her tap turns it on round her; FROST shields her and chills those in it
	h.talents = ["bittercold", "deepfreeze", "aura"]
	h.picks = {"aura": "frost"}
	kit.aura = {"on": 0.0, "wait": 0.0, "tick": 0.0, "shield_back": 0.0}
	h.shield = 0.0
	h.auto_change = true
	o.chill_t = 0.0
	o.state = "chase"
	o.world = h.world + Vector2(1.5, 0)
	await _run(0.6)
	var on: Dictionary = kit.aura_now()
	await _snap("mage_frost_aura")
	_line(not on.is_empty() and on["kind"] == "frost" and h.shield > 0.0 and o.chill_t > 0.0, "the Aura, frost: on round her (%s), a shield (%.0f), the one in it chilled" % [on.get("kind", "off"), h.shield])
	kit.aura = {"on": 0.0, "wait": 0.0, "tick": 0.0, "shield_back": 0.0}
	h.picks = {"aura": "fire"}
	h.auto_change = true
	await _run(0.4)
	await _snap("mage_fire_aura")
	kit.aura = {"on": 0.0, "wait": 0.0, "tick": 0.0, "shield_back": 0.0}
	h.picks = {}
	h.talents = []
	h.shield = 0.0


## THE MAGE'S AND THE RANGER'S MOVES TO LEARN (game/swap_moves.ts): set on the ATTACKS page, made by their rules, drawn; and Venom.
func _learn() -> void:
	M.set_class("mage", true)
	M.loot.level = 50
	h.life = h.max_life
	h.shield = 0.0
	h.shield_t = 0.0
	await _run(0.2)
	var start: Vector2 = h.world
	_open_ground()
	M._kit_look()
	await _run(0.2)
	var kit = h.kit
	# BALL: learned, set on her tap from the ATTACKS page; a comet that bursts on the first it hits, the one beside struck too
	_take(["kindling", "ball"])
	var tap0: Array = h.move_choices(0)
	var changed: bool = h.change_move(0)
	var bar: Array = M._hud._skills().map(func(x): return x["id"])
	var two := _foes([[3.0, 0.0], [3.4, 0.9]], true)
	var lives: Array = [two[0].life, two[1].life]
	kit._deliver(0, h.world, h.world + h.face * 3.0, 1.0, true)
	await _run(0.45)
	await _snap("mage_ball")
	var look = kit.look
	_line(tap0 == ["wave", "ball"] and changed and h.loadout.id(0) == "ball" and bar[0] == "ball" and h.picks.get("@tap") == "ball" and two[0].life < lives[0] and two[1].life < lives[1] and look != null and not look.splashes.is_empty(),
		"Ball: learned, her tap's choices %s, CHANGE made it her tap (the bar's %s); the comet burst on the first (%s) and the one beside it (%s), its splash on the floor" % [tap0, bar, two[0].life < lives[0], two[1].life < lives[1]])
	await _run(0.6)
	# SPEAR: through every one in its line
	_take(["bittercold", "spear"])
	h.picks["@tap"] = "spear"
	h.swap()
	two = _foes([[2.5, 0.0], [4.5, 0.0]], true)
	lives = [two[0].life, two[1].life]
	kit._deliver(0, h.world, h.world + h.face * 3.0, 1.0, true)
	await _run(0.12)
	await _snap("mage_spear")
	await _run(0.3)
	_line(h.loadout.id(0) == "spear" and two[0].life < lives[0] and two[1].life < lives[1], "Spear: a crystal lance through both in its line (%s, %s)" % [two[0].life < lives[0], two[1].life < lives[1]])
	# BEAM: only held; while held it burns along its line, she is drawn holding it; let go, its wait begins
	_take(["charged", "beam"])
	var hold0: Array = h.move_choices(1)
	h.change_move(1)
	var m = _foes([[3.0, 0.0]], true)[0]
	var life0: float = m.life
	kit.charges[1] = 1
	kit.hold_auto = true
	kit._use_skill(1, h.world + h.face * 4.0)
	await _run(0.6)
	var held: bool = not kit.channel.is_empty() and not look.held.is_empty() and kit.picture(0)[0] == 41
	await _snap("mage_beam")
	kit.hold_auto = false
	await _run(0.1)
	var waited := 0
	while not kit.channel.is_empty() and waited < 30:
		await M.get_tree().process_frame
		waited += 1
	_line(hold0 == ["orb", "beam"] and h.loadout.id(1) == "beam" and held and m.life < life0 and kit.channel.is_empty() and kit.cd[1] > 0.0,
		"Beam: on her hold (%s), held it burns along its line (%s), the one in it struck (%s); let go, it ends and its wait begins (%.1f s)" % [hold0, held, m.life < life0, kit.cd[1]])
	h.picks = {}
	_take([])
	# THE RANGER
	M.set_class("ranger", true)
	M.loot.level = 50
	await _run(0.2)
	_open_ground()
	M._kit_look()
	await _run(0.2)
	kit = h.kit
	# SNARE: in his Shot's place; thrown, what walks in is held, then it bursts
	_take(["widetraps", "snare"])
	m = _foes([[3.0, 0.0]])[0]
	life0 = m.life
	kit._deliver(0, h.world, h.world + h.face * 3.0, 1.0, true)
	var snares: int = kit.traps.filter(func(t): return t.get("snare", false)).size()
	await _run(0.04)
	await _snap("ranger_snare")
	await _run(0.36)
	var held_fast: bool = m.stun_t > 1.0
	await _run(2.2)
	_line(h.loadout.id(0) == "snare" and snares == 1 and held_fast and m.life < life0, "Snare: his Shot's place; one lies where it was thrown (%d), the one that walked in held fast (%s), then it burst (%s)" % [snares, held_fast, m.life < life0])
	# SNIPE: in his Volley's place; held, it draws to full; let go, a harder, wider, faster arrow that knocks back
	_take(["splitshot", "snipe"])
	m = _foes([[4.0, 0.0]], true)[0]
	life0 = m.life
	kit.charges[1] = 1
	kit.hold_auto = true
	kit._use_skill(1, h.world + h.face * 4.0)
	await _run(1.2)
	var mid: Dictionary = kit.snipe_draw()
	await _snap("ranger_snipe_draw")
	await _run(0.8)
	var full: Dictionary = kit.snipe_draw()
	var was: Vector2 = m.world
	kit.hold_auto = false
	await _run(0.05)
	var arrows: Array = kit.shots.filter(func(p): return p.has("snipe"))
	var k: float = float(arrows[0]["snipe"]) if not arrows.is_empty() else -1.0
	await _snap("ranger_snipe_loosed")
	await _run(0.5)
	_line(h.loadout.id(1) == "snipe" and not mid.is_empty() and float(mid["power"]) > 0.5 and float(mid["power"]) < 1.0 and not full.is_empty() and float(full["power"]) == 1.0 and k == 1.0 and m.life < life0 and m.world.distance_to(h.world) > was.distance_to(h.world) + 0.3,
		"Snipe: his Volley's place; drawn %.0f%% at 1.2 s, full at 2 s; let go, the arrow at its fullest (%.1f) struck and knocked back (%.1f tiles to %.1f)" % [float(mid.get("power", 0.0)) * 100.0, k, was.distance_to(h.world), m.world.distance_to(h.world)])
	# RALLY: with Snipe too, his Volley's place is his pick of the two; his call lasts five seconds
	_take(["splitshot", "snipe", "windrunner", "rally"])
	var holds: Array = h.move_choices(1)
	h.change_move(1)
	kit.charges[1] = 1
	kit._use_skill(1, h.world + h.face)
	await _run(0.45)
	await _snap("ranger_rally")
	_line(holds == ["snipe", "rally"] and h.loadout.id(1) == "rally" and not kit.rally_now().is_empty(), "Rally: with Snipe, his pick of the two (%s); called, it lasts %.1f s more" % [holds, float(kit.rally_now().get("left", 0.0))])
	# VENOM: a poisoned enemy that dies bursts in a cloud of its poison
	_take(["keeneye", "venom"])
	m = _foes([[2.0, 0.0]])[0]
	m.poison_t = 3.0
	m.poison_dps = 6.0
	var clouds: int = h.wakes.list.filter(func(z): return z["kind"] == "venom").size()
	h.killed(m)
	var after: int = h.wakes.list.filter(func(z): return z["kind"] == "venom").size()
	_line(after == clouds + 1, "Venom: a poisoned one dying leaves a cloud of its poison (%d to %d)" % [clouds, after])
	# (and with it his poison adds up eight doses deep, four without: words.gd POISON_TREE)
	var pv = _foes([[2.5, 0.6]])[0]
	pv.poison_t = 0.0
	for k2 in 10:
		pv.dose(1.0)
	var with_v: int = pv.poison_n
	_take(["keeneye"])
	pv.poison_t = 0.0
	for k2 in 10:
		pv.dose(1.0)
	var without_v: int = pv.poison_n
	pv.poison_t = 0.0
	_line(with_v == 8 and without_v == 4, "Venom: ten doses on one, %d add up with it, %d without" % [with_v, without_v])
	h.picks = {}
	_take([])
	h.world = start
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead:
			o.stun_t = 0.0
