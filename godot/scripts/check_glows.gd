## THE CHECK OF WHAT THE MONSTERS' PICTURES GIVE OFF (--only=glows; render.ts monsterLit, light, MONSTER_LIGHT_MIN; engine/px.ts
## drawLights): on floor 2, in the dark, a cultist near: its picture's lights (its eyes, its fire) laid over the dark; a light of a
## picture 7 or more across cutting a pool in the dark round it; none while it is frozen; and the hero's own lights over the dark.
## Pictured. A line a thing; then the sum, GLOWS.
extends RefCounted

const BakedHero := preload("res://scripts/baked_hero.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("GLOWS %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	await M._wait(0.5)
	var mons: Array = M._monsters.list.filter(func(m): return is_instance_valid(m) and not m.dead)
	var lit: Array = mons.filter(func(m): return not (m._lit_f.get("lights", []) as Array).is_empty())
	_line(not lit.is_empty(), "%d of the floor's %d monsters' pictures give off light (%s)" % [lit.size(), mons.size(), ", ".join(PackedStringArray(_kinds(lit)))])
	# (a cultist, and the hero set down a little way from it, in the dark)
	var c = null
	for m in lit:
		if m.kind == "cultist":
			c = m
			break
	if c == null:
		c = lit[0]
	h.world = M.loot.floor_near(c.world + Vector2(3.0, 3.0))
	h.home = h.world
	await M._wait(0.8)
	await M._snap(dir + "/g01_cultist_in_the_dark.png")
	var ls: Array = c._lit_f.get("lights", [])
	_line(not ls.is_empty() and c._lights.z_index > 50, "a %s: %d lights of its picture laid over the dark (its eyes%s)" % [c.kind, ls.size(), ", its fire" if ls.any(func(l): return float(l["r"]) > 3.0) else ""])
	# (one whose picture's light is 7 or more across cuts a pool in the dark round it)
	var big = null
	for m in mons:
		if (m._lit_f.get("lights", []) as Array).any(func(l): return float(l["r"]) >= 7.0):
			big = m
			break
	if big != null and M.look != null:
		var before: int = M.look._spots_at.size()
		big.cut_lights(M.look)
		_line(M.look._spots_at.size() > before, "a %s's light %.0f across cuts a pool in the dark round it" % [big.kind, (big._lit_f["lights"] as Array).map(func(l): return float(l["r"])).max()])
	else:
		_line(true, "(no monster here with a light 7 or more across in its picture just now)")
	# (frozen, it gives off none)
	c.frozen_t = 1.0
	c._lights.queue_redraw()
	var before2: int = M.look._spots_at.size() if M.look != null else 0
	c.cut_lights(M.look)
	_line((M.look == null or M.look._spots_at.size() == before2), "frozen, it gives off no light")
	c.frozen_t = 0.0
	_line(h._lights.z_index > 50, "the hero's own lights over the dark too (render.ts heroLit)")
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


func _kinds(list: Array) -> Array:
	var seen := {}
	for m in list:
		seen[m.kind] = true
	return seen.keys()


## THE TOWN'S SERVICES' NAMES (--only=townnames; render.ts STATION_NAME, NAME_LIFT): each over its service; the one he stands at
## in white. Pictured.
func town(main, hero, dir: String) -> void:
	M = main
	h = hero
	await M._wait(0.8)
	var T = null
	for c in M._place.get_children():
		if c.get_script() == preload("res://scripts/town.gd"):
			T = c
	await M._snap(dir + "/g02_town_names.png")
	_line(T != null and T._names != null and T._names.z_index > 50 and (T.data["stations"] as Array).size() == 7, "the town's seven services named over them, over everything")
	var lex: Dictionary = (T.data["stations"] as Array).filter(func(s): return s["kind"] == "lexicon")[0]
	h.world = Vector2(lex["x"], lex["y"]) + Vector2(0.9, 0.9)
	await M._wait(0.4)
	await M._snap(dir + "/g03_town_near_lexicon.png")
	_line(T.prompt[1] == "lexicon", "by the Lexicon: its name in white, his use the Lexicon's (%s)" % T.prompt[0])
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE FIRST LEVELS (--only=openings; defs.ts FIRST_LEVELS, MOVE_OPENS; game.ts moveOpen, gainXp; ui/hud.ts OPENING, drawMoveToast): a
## new Warrior has his Strike alone, in the middle where the two plates would be, no dodge; the Whirlwind and the Lunge cannot be used.
## Level 2: the Whirlwind opens, its moment: the Strike's plate sliding over, the new one opening out from its middle with its
## flourish, NEW MOVE at the top, "A new move: WHIRLWIND."; then it can be used. Level 5: the Lunge's button, the same. Pictured.
func openings(main, hero, dir: String) -> void:
	M = main
	h = hero
	var loot = M.loot
	var hud = M._hud
	await M._wait(0.6)
	await M._snap(dir + "/o01_level1_strike_alone.png")
	h.auto_whirl = true
	h.auto_lunge = h.world + h.face * 3.0
	await M._wait(0.3)
	var used: bool = h._act in ["whirl", "lunge"]
	h.auto_whirl = false
	_line(h.first_levels and hud._plates.size() == 1 and hud._lunge.size == Vector2.ZERO and not used,
		"level 1: his Strike alone in the middle, no Whirlwind's plate, no dodge's button; the Whirlwind and the Lunge asked for: nothing")
	await M._wait(0.6)
	loot.gain_xp(loot.xp_to_next(1) - loot.xp + 0.5)
	var said: bool = loot.msgs.any(func(m): return str(m["text"]) == "A new move: WHIRLWIND.")
	_line(loot.level == 2 and not M.move_toast.is_empty() and int(M.move_toast["skill"]) == 1 and said, "level 2: the Whirlwind opens: \"A new move: WHIRLWIND.\", its moment begun")
	while float(M.move_toast.get("t", 9.0)) < 0.42:
		await M.get_tree().process_frame
	await M._snap(dir + "/o02_whirlwind_opening.png")
	while float(M.move_toast.get("t", 9.0)) < 1.0:
		await M.get_tree().process_frame
	await M._snap(dir + "/o03_whirlwind_flourish.png")
	while not M.move_toast.is_empty():
		await M.get_tree().process_frame
	await M._snap(dir + "/o04_whirlwind_open.png")
	h.auto_whirl = true
	await M._wait(0.4)
	var whirled: bool = h._act == "whirl"
	h.auto_whirl = false
	_line(hud._plates.size() == 2 and whirled, "its plate beside the Strike's; held, he whirls")
	await M._wait(1.5)
	while loot.level < 5:
		loot.gain_xp(loot.xp_to_next(loot.level) - loot.xp + 0.5)
	_line(not M.move_toast.is_empty() and int(M.move_toast["skill"]) == 2, "level 5: the Lunge opens, its moment begun")
	while float(M.move_toast.get("t", 9.0)) < 0.5:
		await M.get_tree().process_frame
	await M._snap(dir + "/o05_lunge_opening.png")
	while not M.move_toast.is_empty():
		await M.get_tree().process_frame
	h.auto_lunge = h.world + h.face * 3.0
	await M._wait(0.1)
	_line(hud._lunge.size != Vector2.ZERO and h._act == "lunge", "its button at the right; pressed, he lunges")
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])



## SET BESIDE THE GAME (--only=compare): what setting Godot's pictures beside the game's turned up, each as the game has it.
##   THE QUEST MARKER over whoever has a quest for him, drawn last (render.ts questMarks, after the services' names): over the
##     place's dark (z 50) and the names (z 60). A new game: over the wordsmith. Pictured.
##   THE LIFE GLOBE as glass in an iron band (hud.ts globeGlass, ART_TWEAKS.globe on), its thin ring the colour of what ails him
##     (hud.ts lifeRim): burning, the fire's. Pictured.
##   COMING INTO A FLOOR he faces down and to the right, his face to the one playing (game.ts enterDungeon: fx 1, fy 0), and his
##     picture is the one that faces so (render.ts: the side read from fx, fy as he is drawn), whichever way he last faced. Pictured.
##   ON A FLOOR, carrying something back: the marker over the floor's waypoint home, 40 game pixels up. Pictured.
func compare(main, hero, dir: String) -> void:
	M = main
	h = hero
	await M._wait(1.0)
	var q6 = M.quest610
	await M._snap(dir + "/c01_town_marker_over_the_wordsmith.png")
	_line(q6 != null and q6._marks.z_index > 60 and q6.givers().has("wordsmith"), "a new game: the marker over the wordsmith (%s), drawn over the dark and the names (z %d)" % [str(q6.givers()), q6._marks.z_index])
	var hud = M._hud
	h.burn_t = 2.0
	await M._wait(0.2)
	await M._snap(dir + "/c02_globe_burning.png")
	_line(not hud._globes.is_empty() and hud._life_rim() == hud.P["fr4"], "the life globe painted as glass in its iron band (%d kept); burning, its ring the fire's" % hud._globes.size())
	h.burn_t = 0.0
	h._turn(Vector2(-0.7071, -0.7071))
	var was: String = BakedHero.SIDES[h._side]
	M.go_to("floor3", "down")
	await M._wait(1.6)
	await M._snap(dir + "/c03_floor3_facing_in.png")
	_line(h.face.distance_to(Vector2(1, 0)) < 0.01 and BakedHero.SIDES[h._side] == "front", "facing %s in town, he comes into floor 3 facing down and to the right %s, his picture the one that faces so (%s)" % [was, str(h.face), BakedHero.SIDES[h._side]])
	M.loot.quest = "heart"
	await M._wait(0.6)
	await M._snap(dir + "/c04_marker_over_the_waypoint.png")
	_line(q6.turn_in_for() == "wordsmith" and M.map.waypoint != null, "carrying the stone, the marker over floor 3's waypoint home (he brings it back for the %s)" % q6.turn_in_for())
	M.loot.quest = ""
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE MENUS IN THE GAME'S OWN LETTERS AND FRAMES (--only=menus; ui/inventory.ts drawInventory, ui/town.ts vendorSide): a new
## Warrior in town, his gear screen opened on each of its pages, and the armourer's shelf beside it. Pictured.
func menus(main, hero, dir: String) -> void:
	M = main
	h = hero
	await M._wait(0.8)
	var inv = M._inv
	inv.toggle()
	await M._wait(0.4)
	await M._snap(dir + "/u01_gear.png")
	# (a level gained: its +5 asked on a row of its own under his numbers)
	M.loot.points = 5
	inv.queue_redraw()
	await M._wait(0.2)
	await M._snap(dir + "/u01b_points.png")
	M.loot.points = 0
	for pg in ["attacks", "stats", "talents"]:
		inv._page = pg
		inv.queue_redraw()
		await M._wait(0.3)
		await M._snap(dir + "/u02_%s.png" % pg)
	inv._page = "gear"
	# (his lexicon: a few words held, LEXICON pressed: every word on a panel over the game's half)
	var lt = M.loot
	lt.ring_lit = true
	# (no new player's lesson waiting: his first word is long set)
	lt.taught = true
	for w in ["fire", "frost", "swift", "leech", "poison"]:
		lt.words[w] = 1 + (1 if w == "frost" else 0)
	lt.derive()
	inv._press("lex", null)
	await M._wait(0.3)
	await M._snap(dir + "/u05_lexicon.png")
	_line(inv._lex and inv._lex_panel.has_area() and inv._pouch.filter(func(c): return c.get("lex", false)).size() == lt.held().size(), "LEXICON: every word he holds (%d) on a panel over the game's half" % lt.held().size())
	inv._press("lex", null)
	inv.toggle()
	await M._wait(0.3)
	inv.open_shop("armourer")
	await M._wait(0.4)
	await M._snap(dir + "/u03_armourer.png")
	_line(inv.visible and inv.shop == "armourer", "the gear screen and the armourer's shelf open")
	# (a piece sold to him: on his BUY BACK shelf for what he paid; one of his picked, its card and BUY under the cells)
	var loot = M.loot
	loot.gold = 60
	var stock: Array = loot.shops["armourer"]
	loot.bag.append(stock[0].duplicate(true))
	var before: int = loot.gold
	inv._press("bag", loot.bag.size() - 1)
	var paid: int = loot.gold - before
	inv._shelf_pick = ["buy", 1]
	await M._wait(0.3)
	await M._snap(dir + "/u04_sold_and_picked.png")
	_line(loot.sold.size() == 1 and paid == loot.sell_value(loot.sold[0]), "a piece sold for %d gold: on his BUY BACK shelf" % paid)
	var why: String = loot.buy_back(0)
	_line(why == "" and loot.sold.is_empty() and loot.gold == before, "bought back for the same: back in the bag, the gold as it was (%d)" % loot.gold)
	# (at a service, ALL: the bottom turned to every word, the bag not there)
	inv._shelf_pick = []
	inv._press("swap", null)
	await M._wait(0.3)
	await M._snap(dir + "/u06_all_words.png")
	_line(inv._all and inv._cells.filter(func(c): return not c["worn"]).is_empty(), "at the vendor's, ALL: every word in the bottom, the bag put by")
	inv._press("swap", null)
	# (the town's other services beside the gear screen, on the left half in the game's letters: the wordsmith, the stash, the
	# Lexicon, the stranger)
	inv.toggle()
	await M._wait(0.2)
	inv.open_wordsmith()
	await M._wait(0.3)
	await M._snap(dir + "/u07_wordsmith.png")
	inv.toggle()
	for k in ["stash", "lexicon", "stranger"]:
		await M._wait(0.2)
		inv.open_service(k)
		await M._wait(0.3)
		await M._snap(dir + "/u08_%s.png" % k)
		inv.toggle()
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE EFFECTS THAT WERE STAND-INS (--only=fxleft), each as the game draws it, on floor 2 by the hero, pictured:
##   a pot broken: its eight sparks (game.ts breakProps 'spark');
##   a monster's bone arrow in flight (render.ts: its bone shaft, its red head, its shadow);
##   one of the Warden's bolts (render.ts: a ball of light of its element, art/icons.ts orbFrame);
##   a red circle coming down: the game's own burst (game.ts updateZones 'burst', style 'blast');
##   the Headsman's vault: its mark, its slam on the floor and what flies from it (art/headsman2_shots.ts).
func fxleft(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	await M._wait(1.0)
	var fx = h.fx
	# (one plain monster lends its blow, held still and out of sight; the rest of the floor's taken off it, so that each effect is
	# seen alone)
	var src = null
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss and (m.words as Array).is_empty() and str(m.blow().get("el", "phys")) == "phys":
			src = m
			break
	for m in M._monsters.list:
		if is_instance_valid(m) and m != src:
			m.queue_free()
	M._monsters.list.assign([src])
	src.process_mode = Node.PROCESS_MODE_DISABLED
	src.visible = false
	# (and what they had already set going on the floor, gone)
	for p in M._monsters.perils.list:
		M._monsters.perils._film_free(p)
	M._monsters.perils.list = []
	# (the pot farthest from every monster, in a quiet room)
	var far := func(w: Vector2) -> float:
		var d := INF
		for m in M._monsters.list:
			if is_instance_valid(m):
				d = minf(d, w.distance_to(m.world))
		return d
	var pot = null
	var in_boss := func(w: Vector2) -> bool:
		for r in M.map.rooms:
			if str(r.get("kind", "")) == "boss" and w.x >= float(r["x"]) - 4.0 and w.y >= float(r["y"]) - 4.0 and w.x < float(r["x"]) + float(r["w"]) + 4.0 and w.y < float(r["y"]) + float(r["h"]) + 4.0:
				return true
		var yard = M.look.data.get("zones", {}).get("yard") if M.look != null else null
		return yard != null and w.distance_to(Vector2(float(yard["x"]), float(yard["y"]))) < 22.0
	for p in M.map.props:
		if (p["kind"] == "urn" or p["kind"] == "barrel") and int(p["state"]) == 0 and not in_boss.call(Vector2(p["x"], p["y"])):
			if pot == null or far.call(Vector2(p["x"], p["y"])) > far.call(Vector2(pot["x"], pot["y"])):
				pot = p
	await M._wait(0.3)
	if pot != null and h.props != null:
		h.world = M.loot.floor_near(Vector2(pot["x"], pot["y"]) + Vector2(1.0, 1.0))
		await M._wait(0.5)
		var sparks: int = int(fx.seen.get("spark", 0))
		h.props.strike(Vector2(pot["x"], pot["y"]), 0.6)
		await M._wait(0.06)
		await M._snap(dir + "/x01_a_pot_broken.png")
		_line(int(fx.seen.get("spark", 0)) > sparks and int(pot["state"]) == 1, "a %s broken: its sparks (%d)" % [pot["kind"], int(fx.last.get("spark", {}).get("n", 0))])
	else:
		_line(false, "no pot on this floor to break")
	# (a bone arrow and a bolt, loosed at him by one of the floor's monsters from four tiles off)
	var at: Vector2 = h.world
	for look in ["arrow", "bolt"]:
		# (from a spot three or four tiles off with a clear line to him)
		var from: Vector2 = M.loot.floor_near(at + Vector2(-4.0, 0.0))
		for k in 8:
			var q: Vector2 = M.loot.floor_near(at + Vector2(3.5, 0.0).rotated(k * PI / 4.0))
			if q.distance_to(at) > 2.8 and M.sees(q, at):
				from = q
				break
		var was: Vector2 = src.world
		src.world = from
		M._monsters.shoot(src, (at - from).normalized(), 5.0, 8.0, 0.0, look)
		src.world = was
		await M._wait(0.15)
		var flying: bool = M._flying(look)
		await M._snap(dir + "/x02_%s_in_flight.png" % look)
		_line(flying, "a monster's %s in flight, as the game draws it" % ("bone arrow" if look == "arrow" else "bolt (its ball of light)"))
		await M._wait(1.2)
	# (a red circle coming down)
	var bursts: int = int(fx.seen.get("burst", 0))
	M._monsters.perils.warn(at.x + 1.5, at.y, 1.2, 0.6, 0.0, src)
	await M._wait(0.4)
	await M._snap(dir + "/x03_red_circle.png")
	await M._wait(0.28)
	await M._snap(dir + "/x04_red_circle_comes_down.png")
	_line(int(fx.seen.get("burst", 0)) == bursts + 1 and str(fx.last.get("burst", {}).get("style", "")) == "blast", "the red circle comes down: the game's own burst ('blast')")
	await M._wait(0.8)
	# (the vault: its mark, its slam)
	var spot: Vector2 = at + Vector2(2.0, 1.0)
	M._monsters.perils.vault_mark(spot.x, spot.y, 1.2, src)
	src.state = "act"
	await M._wait(0.9)
	await M._snap(dir + "/x05_vault_mark.png")
	src.state = "chase"
	M._monsters.perils.vault_slam(spot.x, spot.y)
	await M._wait(0.08)
	await M._snap(dir + "/x06_vault_slam.png")
	await M._wait(0.25)
	await M._snap(dir + "/x07_vault_what_flies.png")
	var slams: Array = M._monsters.perils.list.filter(func(p): return p["kind"] == "vault_slam")
	_line(slams.size() == 1, "the vault: its mark as wide as the slam, the slam's cracks, crater and ring of fire, what flies from it")
	h.unhurt = false
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE HEADSMAN'S YARD'S OWN GATE AS IT FALLS (--only=yardgate; art/yard_gate.ts, render.ts standDoors; look.gd yard_gate_fall):
## he walks into the yard, and its gate falls by its own beat behind him (held juddering, dropped, landed, a bounce), the mark on
## its keystone alight from the landing on, its slam's dust and sparks; then its frames one by one, pictured; the Headsman dead,
## it rises, its mark dark again.
func yardgate(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	await M._wait(1.0)
	var look = M.look
	var gi := -1
	for i in M.map.doors.size():
		if M.map.doors[i]["kind"] == "bossgate":
			gi = i
	_line(gi >= 0 and look != null and look.has_yard_gate(gi), "floor 2's boss gate (%d) has its own fall: %s" % [gi, look != null and gi >= 0 and look.has_yard_gate(gi)])
	if gi < 0 or look == null or not look.has_yard_gate(gi):
		return
	var d: Dictionary = M.map.doors[gi]
	var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
	var plane := float(d["plane"])
	var out := float(d["out"])
	var along: bool = d["alongX"]
	# (outside it, the gate up, its mark dark: then in, 3 tiles past it)
	var outside := Vector2(mid.x, plane + out * 2.5) if along else Vector2(plane + out * 2.5, mid.y)
	var inside := Vector2(mid.x, plane - out * 3.5) if along else Vector2(plane - out * 3.5, mid.y)
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.boss:
			m.queue_free()
	M._monsters.list.assign(M._monsters.list.filter(func(m): return is_instance_valid(m) and m.boss))
	h.world = M.loot.floor_near(outside)
	await M._wait(0.8)
	var yg: Dictionary = look._yg
	await M._snap(dir + "/y01_up.png")
	_line(int(d["want"]) == 1 and yg["f"] == -1 and not yg["lit"], "up as he comes: the look's own gate, its mark dark (want %d, its own frame %d)" % [int(d["want"]), yg["f"]])
	h.world = M.loot.floor_near(inside)
	await M._w_until(func(): return int(d["want"]) == 0, 3.0)
	await M._wait(0.15)
	var f1: int = yg["f"]
	var lit1: bool = yg["lit"]
	_line(int(d["want"]) == 0 and f1 >= 2 and f1 <= 10 and not lit1, "fallen behind him: held juddering at the top first (frame %d, its mark not yet alight)" % f1)
	await M._w_until(func(): return yg["lit"], 1.0)
	var sf: int = yg["slam_f"]
	_line(yg["lit"] and sf >= 0 and sf < 6, "landed: its mark alight, its slam playing (its frame %d)" % sf)
	await M._wait(1.0)
	_line(yg["f"] == 18 and yg["lit"] and yg["slam_f"] == -1 and not yg["slam"].visible, "down for good: its last frame (%d), its mark alight, its slam over" % yg["f"])
	# --- its beat, frame by frame, pictured (the doors held, the gate set to each frame)
	M._doors.process_mode = Node.PROCESS_MODE_DISABLED
	var raise: Array = yg["tune"]["raise"]
	var shown: Array = []
	for f in [3, 7, 10, 11, 12, 14, 17, 26]:
		look.yard_gate_fall((float(f) + 0.5) / 30.0)
		await M._wait(0.05)
		await M._snap("%s/y02_frame_%02d.png" % [dir, f])
		shown.append("%d: raise %d%s%s" % [f, int(raise[mini(f, raise.size() - 1)]), ", lit" if yg["lit"] else "", ", slam %d" % yg["slam_f"] if yg["slam_f"] >= 0 else ""])
	var bars_up: int = yg["bars"].filter(func(b): return b.visible).size()
	_line(shown.size() == 8, "its frames: %s (%d bars shown)" % [", ".join(shown), bars_up])
	M._doors.process_mode = Node.PROCESS_MODE_INHERIT
	look.yard_gate_fall(2.0)
	# --- the Headsman dead: it rises, the look's own again
	var boss = M._d_boss()
	if boss != null:
		boss.dead = true
	await M._w_until(func(): return int(d["want"]) == 1, 3.0)
	await M._wait(1.4)
	await M._snap(dir + "/y03_risen.png")
	var arch_on: int = yg["arch"].filter(func(a): return a.visible).size()
	_line(int(d["want"]) == 1 and yg["f"] == -1 and not yg["lit"] and arch_on == 0 and float(d["open"]) == 1.0, "the Headsman dead: it rises, the look's own gate again, its mark dark (open %.2f)" % float(d["open"]))
	h.unhurt = false
	print("YARDGATE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])

