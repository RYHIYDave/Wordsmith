## THE CHECK OF WHAT THE MONSTERS' PICTURES GIVE OFF (--only=glows; render.ts monsterLit, light, MONSTER_LIGHT_MIN; engine/px.ts
## drawLights): on floor 2, in the dark, a cultist near: its picture's lights (its eyes, its fire) laid over the dark; a light of a
## picture 7 or more across cutting a pool in the dark round it; none while it is frozen; and the hero's own lights over the dark.
## Pictured. A line a thing; then the sum, GLOWS.
extends RefCounted

const BakedHero := preload("res://scripts/baked_hero.gd")

const Words := preload("res://scripts/words.gd")
const Iso := preload("res://scripts/iso.gd")

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


## FRENZIED ON THE PRISON'S BOSSES (--only=bossrage; game.ts updateMonsters `rage`, game/bosses.ts step): each of floors 2 to 5's
## that fights by its own script (the Headsman; the Chained One and the Stoker; the Amalgamation and the mini fleshmancers; the
## Fleshmancer and the keybearers), given Frenzied and brought to half its life, runs down its wait and its acts' waits faster
## by the game's rage (1 + FRENZY.monster x a half); the Fleshmancer, hurt, by his hurry on top; without it, at its plain pace.
func bossrage(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var fm: float = Words.data()["frenzy"]["monster"]
	var kinds := {"floor2": ["headsman"], "floor3": ["chained", "stoker"], "floor4": ["amalgam", "minifm"], "floor5": ["fleshmancer", "minifm", "keyblade", "keyflame"]}
	var dt := 0.1
	for place in kinds:
		M.way_depth = maxi(M.way_depth, int(place.substr(5)))
		await M.go_to(place, "down")
		await M._wait(0.8)
		for kind in kinds[place]:
			var m = null
			for q in M._monsters.list:
				if is_instance_valid(q) and not q.dead and q.kind == kind:
					m = q
					break
			if m == null or m.h2 == null:
				_line(false, "%s: no %s with its own script" % [place, kind])
				continue
			var ai = m.h2
			# (its own acts' waits begun, nothing under way, nothing ready: one step of it, its waits measured)
			var res := []
			# (the Fleshmancer at three tenths of his life, under his hurry's line; the rest at half)
			var share := 0.3 if kind == "fleshmancer" else 0.5
			for frenzied in [false, true]:
				m.words = ["frenzied"] if frenzied else []
				m.half = []
				m.life = m.max_life * share
				m.curse_t = 0.0
				if ai.get("cds") != null and (ai.cds as Array).is_empty():
					ai.step(m, 0.0, h)
				if ai.get("act") != null:
					ai.act = null
				m.state = "chase"
				m._cd = 100.0
				var has_cds: bool = ai.get("cds") != null and not (ai.cds as Array).is_empty()
				if has_cds:
					for k in ai.cds.size():
						ai.cds[k] = 100.0
				ai.step(m, dt, h)
				res.append([(100.0 - m._cd) / dt, (100.0 - float(ai.cds[0])) / dt if has_cds else -1.0])
			var want := 1.0 + fm * (1.0 - share)
			var hurry := 1.0
			if kind == "fleshmancer":
				hurry = float(ai.HURRY["by"]) if share < float(ai.HURRY["at"]) else 1.0
			var ok: bool = absf(res[0][0] - hurry) < 1e-3 and absf(res[1][0] - want * hurry) < 1e-3
			if res[0][1] >= 0.0:
				ok = ok and absf(res[0][1] - hurry) < 1e-3 and absf(res[1][1] - want * hurry) < 1e-3
			_line(ok, "%s's %s at %d%% of its life: its wait run down x%.3f, its acts' x%.3f; Frenzied, x%.3f and x%.3f (the game: x%.3f%s)" % [place, kind, roundi(share * 100.0), res[0][0], res[0][1], res[1][0], res[1][1], want * hurry, (", his hurry x%.2f in it" % hurry) if hurry != 1.0 else ""])
			m.words = []
	h.unhurt = false
	print("BOSSRAGE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## SEEN THROUGH ON FLOORS 1 TO 5 (--only=veil; render.ts veil): a big thing that stands (60 game pixels across and 70 high and
## more) drawn at SEEN_THROUGH while the hero is behind it and it covers his middle, his head or his feet; solid again once he is
## in front; and for him alone, not for a monster behind it (the game's seenFoes are the open ground's). On floor 4 and on
## floor 2 (the great bell, in the first kind of look). Pictured.
func veil(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	for place in ["floor3", "floor4", "floor5", "floor2"]:
		M.way_depth = maxi(M.way_depth, int(place.substr(5)))
		await M.go_to(place, "down")
		await M._wait(0.8)
		var look = M.look
		var tall: Array = look._tall
		# (the big things he can stand behind and in front of: open floor a tile behind it and a tile before it)
		var spots: Array = []
		for q in tall:
			var pic: Dictionary = look._pics[q["key"]]
			var at: Vector2 = ((q["box"] as Rect2).position + pic["anchor"]) / 2.0
			var dsum: float = q["d"]
			var dif: float = at.x / 16.0
			var w0 := Vector2((dsum + dif) / 2.0, (dsum - dif) / 2.0)
			var back: Vector2 = w0 - Vector2(0.7, 0.7)
			var front: Vector2 = w0 + Vector2(0.9, 0.9)
			if M.map.walkable(floori(back.x), floori(back.y)) and M.map.walkable(floori(front.x), floori(front.y)) and look.covering(back).has(tall.find(q)):
				spots.append([q, back, front])
		_line(not tall.is_empty(), "%s: %d big things to be seen through, %d he can stand behind" % [place, tall.size(), spots.size()])
		if spots.is_empty():
			continue
		var e: Dictionary = spots[0][0]
		for m in M._monsters.list:
			if is_instance_valid(m):
				m.process_mode = Node.PROCESS_MODE_DISABLED
		h.world = spots[0][1]
		await M._wait(0.4)
		var a_behind := _alpha_of(e)
		await M._snap("%s/v_%s_behind.png" % [dir, place])
		_line(look.seen_through() >= 1 and absf(a_behind - 0.38) < 1e-3, "%s: he behind %s, its picture over him: drawn at %.2f (the game's SEEN_THROUGH 0.38)" % [place, e["key"], a_behind])
		h.world = spots[0][2]
		await M._wait(0.2)
		var a_front := _alpha_of(e)
		await M._snap("%s/v_%s_in_front.png" % [dir, place])
		_line(absf(a_front - 1.0) < 1e-3, "%s: he in front of it: solid again (%.2f)" % [place, a_front])
		# (a monster in sight behind it, he away in front: not seen through, his alone)
		var mon = null
		for m in M._monsters.list:
			if is_instance_valid(m) and not m.dead:
				mon = m
				break
		if mon != null:
			mon.world = spots[0][1]
			mon.seen = true
			await M._wait(0.2)
			_line(absf(_alpha_of(e) - 1.0) < 1e-3, "%s: a monster behind it (%s), he in front: solid (%.2f), as the game's veil is his alone" % [place, mon.kind, _alpha_of(e)])
	h.unhurt = false
	print("VEIL: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


func _alpha_of(e: Dictionary) -> float:
	var node = e["node"]
	if int(e["k"]) >= 0:
		return float(node.alpha[int(e["k"])])
	return float(node.modulate.a) if e.get("mod", false) else float(node.self_modulate.a)


## FLOOR 9'S SIDE BOSSES' PICTURES FETCHED AS THEIR LAIRS ARE ENTERED (--only=lairfetch; monsters.gd FETCH_AT, baked_figure.gd
## fetch): as the Pinewood begins, none of the Troll Chieftain's nor the Mist Wolf's sheets are held; come to the camp, the
## chieftain's are taken in (off the game's thread) and he is drawn, the wolf's still not; come to the glade, the wolf's.
func lairfetch(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M.way_depth = maxi(M.way_depth, 9)
	await M.go_to("floor9", "down")
	await M._wait(1.5)
	var who := {}
	for m in M._monsters.list:
		if is_instance_valid(m) and m.kind in ["warchief", "mistwolf"]:
			who[m.kind] = m
	var held := func(m) -> int:
		var k := 0
		for i in m.art.sheets.size():
			if m.art.sheets[i] != null or (m.art._asked.has(i) and ResourceLoader.load_threaded_get_status(m.art._paths[i]) == ResourceLoader.THREAD_LOAD_LOADED):
				k += 1
		return k
	var all_of := func(m) -> int:
		return m.art.sheets.size()
	_line(who.size() == 2, "floor 9's two side bosses: %s" % [who.keys()])
	if who.size() < 2:
		return
	var tc = who["warchief"]
	var mw = who["mistwolf"]
	_line(tc.art.deferred and mw.art.deferred and not tc.art.fetched and not mw.art.fetched and held.call(tc) == 0 and held.call(mw) == 0,
		"as the Pinewood begins (he %.0f tiles from the chieftain, %.0f from the wolf): none of their %d and %d sheets held" % [h.world.distance_to(tc.world), h.world.distance_to(mw.world), all_of.call(tc), all_of.call(mw)])
	# (to the camp's edge: the chieftain's taken in, the wolf's not)
	var camp = M.map.area("lair")
	var glade = M.map.area("side")
	for m in M._monsters.list:
		if is_instance_valid(m) and m != tc and m != mw:
			m.process_mode = Node.PROCESS_MODE_DISABLED
	var near_camp: Vector2 = M._free_near(Vector2(camp["blob"]["x"], camp["blob"]["y"]))
	h.world = near_camp
	M.sight.see_all()
	await M._w_until(func(): return held.call(tc) == all_of.call(tc), 10.0)
	await M._wait(0.6)
	await M._snap(dir + "/lf_the_camp.png")
	_line(tc.art.fetched and held.call(tc) == all_of.call(tc) and not mw.art.fetched and held.call(mw) == 0,
		"in the chieftain's camp: his %d sheets in hand (%d), the wolf's still none (%d)" % [all_of.call(tc), held.call(tc), held.call(mw)])
	h.world = M._free_near(Vector2(glade["blob"]["x"], glade["blob"]["y"]))
	await M._w_until(func(): return held.call(mw) == all_of.call(mw), 10.0)
	await M._wait(0.6)
	await M._snap(dir + "/lf_the_glade.png")
	_line(mw.art.fetched and held.call(mw) == all_of.call(mw), "in the wolf's glade: its %d sheets in hand (%d)" % [all_of.call(mw), held.call(mw)])
	h.unhurt = false
	print("LAIRFETCH: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE BOSSES' CALLED LINES IN THEIR OWN VOICES (--only=voices; game/boss_calls.ts, engine/audio.ts speakBoss; tools/godot_voices.mjs):
## every take a sound the Godot side can play; the Warden (floor 1, his moves), the Chained One (floor 3, his own script), the Rat
## King (floor 12) and the King (floor 19, the act scripts) each begin a big move: its line over him and heard aloud; another
## within 5 s neither shown nor heard; the King's charge, his basic blow, not again within 20 s.
func voices(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var V: Dictionary = preload("res://scripts/monsters.gd").voices()
	var files := 0
	var bad_files: Array = []
	for kind in V["voices"]:
		for line in V["voices"][kind]:
			for f in V["voices"][kind][line]:
				files += 1
				var st = load("res://assets/voices/" + str(f))
				if not (st is AudioStream) or st.get_length() <= 0.2:
					bad_files.append(f)
	_line(files == 88 and bad_files.is_empty(), "%d bosses, %d takes of their lines, each a sound to play (%s)" % [V["voices"].size(), files, "all" if bad_files.is_empty() else str(bad_files)])
	var said := func() -> Array:
		return M._monsters.said_aloud.back() if not M._monsters.said_aloud.is_empty() else []
	for place in ["floor1", "floor3", "floor12", "floor19"]:
		M.way_depth = maxi(M.way_depth, int(place.substr(5)))
		await M.go_to(place, "down")
		await M._wait(0.8)
		var b = M._d_boss()
		if b == null:
			_line(false, "%s: no boss" % place)
			continue
		var before: int = M._monsters.said_aloud.size()
		var want := ""
		h.world = M._free_near(b.world + Vector2(3.0, 0.0))
		await M._wait(0.2)
		if b.kind == "warden":
			var i: int = b._moves.map(func(mv): return mv["id"]).find("bolts")
			b._start(i, h, b.world.distance_to(h.world))
			want = str(V["calls"]["warden"]["bolts"])
		elif b.kind == "chained":
			var i: int = b.h2.ACTS.map(func(a): return a["id"]).find("hook")
			b.h2._start(b, i, h)
			want = str(b.h2.CALLS["hook"])
		else:
			var A: Array = b.h2.acts()
			var id := "ratking:words" if b.kind == "ratking" else "gking:charge"
			var i: int = A.map(func(a): return a["id"]).find(id)
			b.h2.start_act(b, A, i, h)
			want = str(V["calls"][b.kind][id])
		await M._wait(0.1)
		var got: Array = said.call()
		_line(M._monsters.said_aloud.size() == before + 1 and got == [b.kind, want] and b._said == want,
			"%s: %s calls out \"%s\", over him (\"%s\") and aloud (%s)" % [place, b.kind, want, b._said, got])
		await M._snap("%s/vo_%s.png" % [dir, place])
		# (again within 5 s: nothing)
		if b.kind == "warden":
			var i: int = b._moves.map(func(mv): return mv["id"]).find("slam")
			b._start(i, h, b.world.distance_to(h.world))
		elif b.kind == "chained":
			b.h2.act = null
			b.h2._start(b, b.h2.ACTS.map(func(a): return a["id"]).find("whirl"), h)
		else:
			b.h2.act = {}
			var A: Array = b.h2.acts()
			var id2 := "ratking:roll" if b.kind == "ratking" else "gking:decree"
			b.h2.start_act(b, A, A.map(func(a): return a["id"]).find(id2), h)
		await M._wait(0.1)
		_line(M._monsters.said_aloud.size() == before + 1, "%s: another of his moves within 5 s: not called (%d heard)" % [place, M._monsters.said_aloud.size() - before])
		if b.kind == "gking":
			# (6 s on, his charge again: his basic blow's line not within 20 s; another big move's is)
			b._called_at -= 6.0
			var A: Array = b.h2.acts()
			b.h2.start_act(b, A, A.map(func(a): return a["id"]).find("gking:charge"), h)
			await M._wait(0.1)
			var n1: int = M._monsters.said_aloud.size()
			b.h2.start_act(b, A, A.map(func(a): return a["id"]).find("gking:decree"), h)
			await M._wait(0.1)
			_line(n1 == before + 1 and M._monsters.said_aloud.size() == before + 2 and said.call()[1] == V["calls"]["gking"]["gking:decree"],
				"the King, 6 s on: his charge (his basic blow) not called again within 20 s; his Decree is (\"%s\")" % [said.call()[1]])
	h.unhurt = false
	print("VOICES: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE WALLS SEEN THROUGH FOR THE MONSTERS BEHIND THEM (--only=wallsee; render.ts wallVeil): on floors 1 to 5 a wall between the eye
## and a monster in sight, near it on the screen, fades to faint as it does for him (narrower: 30 game pixels either side of it);
## out of sight, it does not, and the wall comes back whole. On floor 4, he in front of it; pictured.
func wallsee(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M.way_depth = maxi(M.way_depth, 4)
	await M.go_to("floor4", "down")
	await M._wait(0.8)
	var st = M.look.stands if M.look != null else M._monsters.stands
	var mon = null
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss:
			mon = m
			break
	for m in M._monsters.list:
		if is_instance_valid(m):
			m.process_mode = Node.PROCESS_MODE_DISABLED
	# (a wall with open floor behind it and before it: the monster a tile and a half behind its face, he four tiles before it)
	var pick := -1
	var mw := Vector2.ZERO
	var hw := Vector2.ZERO
	for i in st._walls.size():
		var top: Vector2 = st._tops[i]
		var d: float = st._depths[i]
		var dif: float = top.x / 32.0
		var w := Vector2((d - 1.5 + dif) / 2.0, (d - 1.5 - dif) / 2.0)
		var f := w + Vector2(3.0, 3.0)
		if M.map.walkable(floori(w.x), floori(w.y)) and M.map.walkable(floori(f.x), floori(f.y)) and st._backs[i].z == 0:
			pick = i
			mw = w
			hw = f
			break
	_line(pick >= 0 and mon != null, "a wall with floor behind it (%d of %d walls), and a monster (%s)" % [pick, st._walls.size(), mon.kind if mon != null else "-"])
	if pick < 0 or mon == null:
		return
	var wall: Sprite2D = st._walls[pick]
	# (in sight, as it would be to him from beside it in the room behind the wall: his sight held still while he stands before it)
	if M.sight != null:
		M.sight.process_mode = Node.PROCESS_MODE_DISABLED
	h.world = hw
	mon.world = mw
	mon.position = Vector2((mw.x - mw.y) * 32.0, (mw.x + mw.y) * 16.0)
	mon.seen = true
	mon.visible = true
	await M._wait(0.6)
	var a_seen: float = wall.modulate.a
	await M._snap(dir + "/ws_behind_the_wall.png")
	_line(absf(a_seen - st.FAINT) < 1e-3, "the monster in sight behind it, he in front: the wall faint (%.2f; the game's 0.2)" % a_seen)
	mon.seen = false
	await M._wait(0.6)
	var a_unseen: float = wall.modulate.a
	_line(absf(a_unseen - 1.0) < 1e-3, "out of sight: the wall whole again (%.2f)" % a_unseen)
	h.unhurt = false
	print("WALLSEE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## WHAT STANDS BEHIND RAISED GROUND, CUT OFF BY IT (--only=behind; render.ts hide, blockPath; hide_clip.gd): on floor 4 (ledges and
## stairs) he stands on low floor just behind raised ground: his picture left out where the raised block before him is; out on
## open floor he is whole; a monster the same; and the floor's own standing things behind raised ground cut off as they stand.
func behind(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M.way_depth = maxi(M.way_depth, 4)
	await M.go_to("floor4", "down")
	await M._wait(0.8)
	var map = M.map
	var HC := preload("res://scripts/hide_clip.gd")
	_line(HC.has_relief(map) and M.look.clipped > 0, "floor 4 has ledges; %d of its look's standing things are cut off behind them" % M.look.clipped)
	# (a place on the floor where the ground before it stands higher than it (raised ground, or the floor's edge before sunken
	# floor), and open floor a few tiles off where nothing hides him)
	var spot := Vector2.ZERO
	var open := Vector2.ZERO
	for i in map.w * map.h:
		var tx: int = i % map.w
		var ty: int = i / map.w
		if tx < 4 or ty < 4 or not map.walkable(tx, ty) or map.stair[i] != 0:
			continue
		var c := Vector2(tx + 0.5, ty + 0.5)
		if HC.blocks(map, c.x, c.y, map.lift_at(c.x, c.y)).is_empty():
			continue
		for o in [Vector2(-3, -3), Vector2(-3, 0), Vector2(0, -3), Vector2(3, 0), Vector2(0, 3)]:
			var q: Vector2 = c + o
			if map.walkable(floori(q.x), floori(q.y)) and HC.blocks(map, q.x, q.y, map.lift_at(q.x, q.y)).is_empty():
				spot = c
				open = q
				break
		if spot != Vector2.ZERO:
			break
	_line(spot != Vector2.ZERO, "a place where the ground before it stands higher (%.1f, %.1f, its ground %.0f), open floor beside it (%.1f, %.1f)" % [spot.x, spot.y, map.lift_at(spot.x, spot.y), open.x, open.y])
	if spot == Vector2.ZERO:
		return
	for m in M._monsters.list:
		if is_instance_valid(m):
			m.process_mode = Node.PROCESS_MODE_DISABLED
	h.world = spot
	await M._wait(0.4)
	var hn: int = h.material.get_shader_parameter("n") if h.material is ShaderMaterial else 0
	await M._snap(dir + "/bh_behind_the_ledge.png")
	_line(hn > 0 and h._sprite.use_parent_material, "he behind it: cut off by %d block(s) of the raised ground before him" % hn)
	h.world = open
	await M._wait(0.4)
	var hn2: int = h.material.get_shader_parameter("n") if h.material is ShaderMaterial else 0
	_line(hn2 == 0, "out on open floor: whole (%d)" % hn2)
	var mon = null
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead:
			mon = m
			break
	if mon != null:
		mon.world = spot
		mon._place()
		var mn: int = mon._sprite.material.get_shader_parameter("n") if mon._sprite.material is ShaderMaterial else 0
		h.world = spot + Vector2(-1.5, 1.5)
		await M._wait(0.3)
		await M._snap(dir + "/bh_a_monster_behind.png")
		mon.world = open
		mon._place()
		var mn2: int = mon._sprite.material.get_shader_parameter("n") if mon._sprite.material is ShaderMaterial else 0
		_line(mn > 0 and mn2 == 0, "a %s behind it cut off by %d block(s); on open floor whole (%d)" % [mon.kind, mn, mn2])
	h.unhurt = false
	print("BEHIND: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## TOUCH, FOR A PHONE (--only=touch; touch.gd): fingers on the screen, as a phone gives them. The left thumb's stick walks him at full
## speed; a tap on the right strikes at the one the aim help locks onto (its gold ring); a hold whirls while it is held; a swipe
## lunges the way it goes; the pause button and the ATTACKS switch in the pause panel, pressed; in town a touch on a service
## walks him to it and uses it; the flask, pressed, drinks. Pictured.
func touch(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var T = M._touch
	T.set_mode("auto")
	var vp: Viewport = M.get_viewport()
	var win := func(p: Vector2) -> Vector2:
		return vp.get_final_transform() * (p * 2.0)
	var finger := func(i: int, p: Vector2, down: bool) -> void:
		var e := InputEventScreenTouch.new()
		e.index = i
		e.pressed = down
		e.position = win.call(p)
		Input.parse_input_event(e)
	var drag := func(i: int, p: Vector2) -> void:
		var e := InputEventScreenDrag.new()
		e.index = i
		e.position = win.call(p)
		Input.parse_input_event(e)
	M.way_depth = maxi(M.way_depth, 2)
	# (his Lunge open: moves open by level)
	h.practice = true
	await M.go_to("floor2", "down")
	await M._wait(1.0)
	for m in M._monsters.list:
		if is_instance_valid(m):
			m.process_mode = Node.PROCESS_MODE_DISABLED
	# THE STICK: down on the left, pushed right
	var was: Vector2 = h.world
	finger.call(0, Vector2(70, 200), true)
	await M._wait(0.05)
	drag.call(0, Vector2(100, 200))
	await M._wait(0.6)
	var went: Vector2 = h.world - was
	var screen_way := Iso.to_screen(went.x, went.y)
	await M._snap(dir + "/t01_the_stick.png")
	_line(T.on and T.stick["active"] and h.auto_dir.distance_to(Vector2(1, 0)) < 0.01 and went.length() > 0.5 and screen_way.x > absf(screen_way.y) * 2.0,
		"the left thumb's stick, pushed right: he walks right on the screen at full speed (%.2f tiles in 0.6 s)" % went.length())
	finger.call(0, Vector2(100, 200), false)
	await M._wait(0.2)
	# A TAP on the right: the quick attack at the one locked onto (a monster set before him, awake)
	var mon = null
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss:
			mon = m
			break
	mon.world = M._free_near(h.world + h.face * 1.4)
	mon.seen = true
	mon.state = "chase"
	mon.process_mode = Node.PROCESS_MODE_DISABLED
	await M._wait(0.2)
	finger.call(1, Vector2(380, 150), true)
	await M._wait(0.05)
	finger.call(1, Vector2(380, 150), false)
	await M._wait(0.12)
	var struck: bool = h._act == "strike" or (h.kit != null and not h.kit.attack.is_empty())
	await M._snap(dir + "/t02_a_tap.png")
	_line(T.lock == mon and str(T.asked[0]) == "quick" and struck, "a tap on the right: the quick attack, at the %s the aim help is locked onto (its ring)" % mon.kind)
	await M._wait(0.6)
	# A HOLD: the slow attack, kept going while held
	finger.call(1, Vector2(380, 150), true)
	await M._wait(0.45)
	var whirling: bool = h._act == "whirl"
	await M._snap(dir + "/t03_a_hold.png")
	finger.call(1, Vector2(380, 150), false)
	await M._wait(0.6)
	_line(whirling and h._act != "whirl", "a hold: the Whirlwind while held (%s), over once let go (%s)" % [whirling, h._act])
	# A SWIPE: the lunge, the way it goes (from open floor, 5 tiles of it to the right on the screen)
	await M._wait(0.5)
	var rw := Vector2(1, -1).normalized()
	for i in M.map.w * M.map.h:
		var c := Vector2(i % M.map.w + 0.5, i / M.map.w + 0.5)
		var ok := true
		for k in 6:
			var q: Vector2 = c + rw * float(k)
			if not M.map.walkable(floori(q.x), floori(q.y)):
				ok = false
				break
		if ok and c.distance_to(h.world) < 30.0:
			h.world = c
			break
	await M._wait(0.3)
	was = h.world
	finger.call(1, Vector2(330, 150), true)
	await M._wait(0.03)
	drag.call(1, Vector2(360, 150))
	await M._wait(0.03)
	drag.call(1, Vector2(390, 150))
	finger.call(1, Vector2(390, 150), false)
	var lunged := false
	for k in 12:
		await M._wait(0.02)
		lunged = lunged or h._act == "lunge"
	await M._wait(0.5)
	went = h.world - was
	screen_way = Iso.to_screen(went.x, went.y)
	var asked_at: Vector2 = T.asked[1] if T.asked.size() > 1 and T.asked[1] is Vector2 else Vector2.ZERO
	var meant := Iso.to_screen(asked_at.x - was.x, asked_at.y - was.y)
	_line(str(T.asked[0]) == "evade" and lunged and meant.x > absf(meant.y), "a swipe to the right: the Lunge, toward a point right of him on the screen (%.1f tiles gone)" % went.length())
	# THE PAUSE BUTTON, and the ATTACKS switch in its panel
	var W := floorf(M._mini.size.x / 2.0)
	finger.call(2, Vector2(W - 11, M._mini.MH + 13), true)
	await M._wait(0.05)
	finger.call(2, Vector2(W - 11, M._mini.MH + 13), false)
	await M._wait(0.2)
	var paused: bool = M._mini.open == "pause"
	var aim_hit := Rect2()
	for hh in M._mini._hits:
		if hh[1] == "aim":
			aim_hit = hh[0]
	await M._snap(dir + "/t04_the_pause_panel.png")
	var before: String = T.mode
	finger.call(2, aim_hit.get_center(), true)
	await M._wait(0.05)
	finger.call(2, aim_hit.get_center(), false)
	await M._wait(0.2)
	_line(paused and aim_hit.size.x > 0.0 and before == "auto" and T.mode == "tap" and T.label() == "ATTACKS: WHERE YOU TAP",
		"the pause button pressed: the panel, with ATTACKS: AUTO AIM on a phone; pressed, %s" % T.label())
	T.mode = "auto"
	M._mini.show_panel("")
	await M._wait(0.3)
	# THE FLASK, pressed: he drinks
	h.life = h.max_life * 0.4
	var pots: int = M.loot.potions
	var fl: Rect2 = M._hud._flask
	finger.call(3, fl.get_center(), true)
	await M._wait(0.05)
	finger.call(3, fl.get_center(), false)
	await M._wait(0.3)
	_line(fl.size.x == 26.0 and M.loot.potions == pots - 1, "the flask, drawn larger for a finger (%d), pressed: he drinks (%d left of %d)" % [int(fl.size.x), M.loot.potions, pots])
	# IN TOWN: a touch on a service walks him there and uses it
	await M.go_to("town", "start")
	await M._wait(1.0)
	var st: Dictionary = {}
	for s0 in M.town.data["stations"]:
		if str(s0["kind"]) == "armourer":
			st = s0
	var sw := Vector2(float(st["x"]), float(st["y"]))
	var cam: Camera2D = vp.get_camera_2d()
	var tl: Vector2 = cam.get_screen_center_position() - vp.get_visible_rect().size / 2.0
	var sp: Vector2 = (Iso.to_screen(sw.x, sw.y) - tl) / 2.0 - Vector2(0, 20)
	finger.call(0, sp, true)
	await M._wait(0.05)
	finger.call(0, sp, false)
	await M._wait(0.2)
	var walking: bool = not T.errand.is_empty()
	await M._w_until(func(): return T.errand.is_empty(), 10.0)
	await M._wait(0.5)
	await M._snap(dir + "/t05_the_armourer.png")
	_line(walking and str(T.asked[0]) == "used" and str(T.asked[1]) == "armourer" and M._inv.visible, "in town, a touch on the armourer: he walks there and uses him (his shelves open: %s)" % M._inv.visible)
	if M._inv.visible:
		M._inv.toggle()
	T.set_mode("auto")
	h.unhurt = false
	print("TOUCH: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## WHAT THE HERO AND THE TOWN'S PEOPLE SAY (--only=speech; speech.gd): in town, walking up to the armourer, his greeting over him
## and heard (its chance made sure for the check); on floor 2, the Headsman killed by a Strike, the hero's word on it (a boss always
## earns one), one of the lines that fit; his line as he comes into a dungeon. Each shown on its slip and heard. Pictured.
func speech(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var S = M._speech
	var V: Dictionary = S.V
	_line(V.has("hero") and V["hero"].has(h.cls) and V.has("town"), "the voices' table: %d of %s's lines, %d of the town's" % [V.get("hero", {}).get(h.cls, {}).size(), h.cls, V.get("town", {}).values().reduce(func(n, t): return n + t.size(), 0)])
	await M.go_to("town", "start")
	await M._wait(1.0)
	S.V["tags"]["chance"] = 1.0
	var at = S._where(M.town, "armourer")
	# (from where he comes into town, far from him, up to him)
	var n0: int = S.heard.size()
	var far: bool = h.world.distance_to(at) > 3.2
	h.world = M._free_near(at + Vector2(1.6, 0.6))
	await M._wait(0.4)
	await M._snap(dir + "/sp01_the_armourer.png")
	var got: Array = S.heard.back() if S.heard.size() > n0 else []
	_line(far and not got.is_empty() and got[0] == "armourer" and V["tags"]["lines"]["armourer"].has(got[1]) and S.tag.get("who", "") == "armourer",
		"in town, walking up to the armourer: \"%s\" over him, and heard in his voice" % [got[1] if got.size() > 1 else "-"])
	# HIS WORD ON A BIG KILL
	M.way_depth = maxi(M.way_depth, 2)
	await M.go_to("floor2", "down")
	await M._wait(1.0)
	var b = M._d_boss()
	b.last_skill = 0
	n0 = S.heard.size()
	# (struck down as the game's checks strike a boss down, his wait over: the kill itself)
	b._die()
	await M._wait(0.3)
	await M._snap(dir + "/sp02_the_word_on_a_kill.png")
	got = S.heard.back() if S.heard.size() > n0 else []
	var fits: Array = (V["quips"]["boss"] as Array) + (V["quips"]["any"] as Array) + (V["quips"]["cls"][h.cls] as Array) + (V["quips"]["skill"].get(h.loadout.id(0), []) as Array)
	for l in V["quips"]["attr"].values():
		fits += l
	for l in V["quips"]["weapon"].values():
		fits += l
	for l in V["quips"]["word"].values():
		fits += l
	_line(b.dead and not got.is_empty() and fits.has(got[1]) and S.quip.get("text", "") == got[1], "the Headsman killed by a Strike: his word on it, \"%s\", over him and heard" % [got[1] if got.size() > 1 else "-"])
	# HIS LINE AS HE COMES INTO A DUNGEON
	await M._wait(3.0)
	n0 = S.heard.size()
	S.arrived()
	await M._wait(1.0)
	await M._snap(dir + "/sp03_coming_in.png")
	got = S.heard.back() if S.heard.size() > n0 else []
	_line(not got.is_empty() and V["arrival"][h.cls].has(got[1]), "coming into a dungeon: \"%s\", 0.75 s after he is there" % [got[1] if got.size() > 1 else "-"])
	h.unhurt = false
	print("SPEECH: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])

