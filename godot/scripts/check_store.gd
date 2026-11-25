## THE STORE'S PICTURES (--only=store --scene=<name> [--cls=<hero>] --shots=<dir>): the Google Play page's screenshots (his word,
## 25 Nov 2026, “How about the app for google play store?”). The game held sideways as a phone shows it (TAP, HOLD, SWIPE), a hero
## of the floor's level with his talent points spent and words in his moves, no lessons and no names across the screen, the fight
## going; one scene a run, its picture <dir>/store_<scene>.png (1920x1080).
##   chained  floor 3, the Chained One calls out his hook as the hero whirls (Warrior, Flame and Power in his moves)
##   queen    floor 18, the Glass Queen's pier glasses shatter across the hall (any hero)
##   wilds    floor 7, a pack of the Wilds and the hero's big move among them (any hero)
##   king     floor 19, the King charges down his throne room at the hero
##   town     the town by night, the hero by the wordsmith's ring
##   gear     the gear screen, his words set in his moves
extends RefCounted

const CheckCity := preload("res://scripts/check_city.gd")
const Talents := preload("res://scripts/talents.gd")

var M
var h


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M._touch.on = true
	M.loot.taught = true
	# (walked enough that the first lesson, how to walk, is behind him)
	h.walked = 500.0
	var scene: String = M._arg("scene")
	match scene:
		"chained":
			await _ready_hero(9, ["fire"], ["power"])
			await _go("floor3")
			var b = M._d_boss()
			_alone(b, 0.0)
			h.world = M._spot_near(b.world, 2.6, h.world)
			await M._wait(0.8)
			var i: int = b.h2.ACTS.map(func(a): return a["id"]).find("hook")
			b.h2._start(b, i, h)
			h.auto_whirl = true
			await M._wait(0.55)
			M._hud.card = {}
			M._hud.floor_card = {}
			M.guide._speak = {}
			await M._wait(0.05)
			await M._snap("%s/store_chained.png" % M._arg("shots"))
			h.auto_whirl = false
		"queen":
			await _ready_hero(18, ["frost"], ["lightning"])
			await _go("floor18")
			var q = null
			for o in M._monsters.list:
				if is_instance_valid(o) and o.boss and o.kind == "gqueen":
					q = o
			_alone(q, 0.0)
			h.world = M._spot_near(q.world, 5.0, h.world)
			await M._wait(2.5)
			var A: Array = q.h2.acts()
			var k: int = A.map(func(a): return a["id"]).find("gqueen:shatter")
			CheckCity._ready_only(q, maxi(k, 0))
			await M._wait(1.6)
			h.auto_attack = true
			await M._wait(0.3)
			M._hud.card = {}
			M._hud.floor_card = {}
			M.guide._speak = {}
			await M._wait(0.05)
			await M._snap("%s/store_queen.png" % M._arg("shots"))
		"wilds":
			await _ready_hero(12, ["poison"], ["lightning"])
			await _go("floor7")
			var near = _nearest_pack()
			if near != null:
				# (the Ranger stands off from the pack, the pack coming at him, his arrows flying into it: him clear of them; no
				# Volley, his word, 25 Nov 2026: “I don't like the volley for both rangers”)
				h.world = M._spot_near(near.world, 6.5, h.world)
				for o in M._monsters.list:
					if is_instance_valid(o) and not o.dead and o.world.distance_to(near.world) < 7.0:
						M._monsters.wake(o)
				h.face = (near.world - h.world).normalized()
			await M._wait(0.5)
			for i in 9:
				h.auto_attack = true
				await M._wait(0.1)
			M._hud.card = {}
			M._hud.floor_card = {}
			M.guide._speak = {}
			await M._wait(0.05)
			await M._snap("%s/store_wilds.png" % M._arg("shots"))
		"king":
			await _ready_hero(19, ["piercing"], ["lightning"])
			await _go("floor19")
			var k = M._d_boss()
			_alone(k, 0.0)
			h.world = M._spot_near(k.world + Vector2(2.0, 2.0), 6.0, h.world)
			await M._wait(1.0)
			# (the Ranger rolls aside, his trap left where he stood; the King charges; the Ranger looses arrows at him)
			var to_k: Vector2 = (k.world - h.world).normalized()
			h.auto_lunge = h.world + Vector2(-to_k.y, to_k.x) * 2.5
			await M._wait(0.4)
			var A: Array = k.h2.acts()
			k.h2.start_act(k, A, A.map(func(a): return a["id"]).find("gking:charge"), h)
			h.face = (k.world - h.world).normalized()
			for i in 4:
				h.auto_attack = true
				await M._wait(0.1)
			M._hud.card = {}
			M._hud.floor_card = {}
			M.guide._speak = {}
			await M._wait(0.05)
			await M._snap("%s/store_king.png" % M._arg("shots"))
		"town":
			await _ready_hero(14, ["fire"], ["frost"])
			await M.go_to("town", "start")
			await M._wait(2.0)
			M._hud.floor_card = {}
			await M._wait(0.4)
			M._hud.card = {}
			M._hud.floor_card = {}
			M.guide._speak = {}
			await M._wait(0.05)
			await M._snap("%s/store_town.png" % M._arg("shots"))
		"gear":
			await _ready_hero(16, ["fire", "lightning"], ["power"])
			# (words won and not yet set, in his bag of words)
			for w in ["frost", "poison", "swift", "heavy", "vast"]:
				M.loot.give_word(w)
			await M._wait(1.5)
			M._hud.floor_card = {}
			M._inv.open_on(0)
			await M._wait(0.6)
			M._hud.card = {}
			M._hud.floor_card = {}
			M.guide._speak = {}
			await M._wait(0.05)
			await M._snap("%s/store_gear.png" % M._arg("shots"))
	print("STORE: %s" % scene)


## His level, the ring lit, every talent point spent (no NEW TALENT waiting), and words set in front of and behind his tap.
func _ready_hero(lv: int, front: Array, behind: Array) -> void:
	var L = M.loot
	L.level = lv
	L.ring_lit = true
	L.points = 0
	L.derive()
	h.loadout.set_level(lv, true)
	var guard := 0
	while Talents.spent(h.cls, h.talents) < Talents.points(L.talent_level()) and guard < 40:
		guard += 1
		var took := false
		for t in Talents.tree(h.cls)["talents"]:
			var id: String = t["id"]
			if Talents.ported(h.cls, id) and Talents.take_problem(h.cls, L.talent_level(), h.talents, id) == "":
				h.talents.append(id)
				took = true
				break
		if not took:
			break
	h.talents_changed()
	for w in front:
		h.loadout.put(0, "front", w)
	for w in behind:
		h.loadout.put(0, "behind", w)
	h.loadout.refresh()
	await M._wait(0.2)


func _go(place: String) -> void:
	M.way_depth = maxi(M.way_depth, int(place.substr(5)))
	await M.go_to(place, "down")
	await M._wait(1.2)
	M._hud.floor_card = {}
	if M.sight != null:
		M.sight.see_all()


## Only `keep` and what stands within `r` tiles of it left on the floor (0: only it).
func _alone(keep, r: float) -> void:
	for o in M._monsters.list:
		if is_instance_valid(o) and o != keep and (r <= 0.0 or o.world.distance_to(keep.world) > r):
			o.queue_free()


## The nearest monster that has two more of its kind near it.
func _nearest_pack():
	var best = null
	var bd := 1e9
	for o in M._monsters.list:
		if not is_instance_valid(o) or o.dead or o.boss:
			continue
		var n := 0
		for p in M._monsters.list:
			if is_instance_valid(p) and p != o and not p.dead and p.world.distance_to(o.world) < 5.0:
				n += 1
		var d: float = o.world.distance_to(h.world)
		if n >= 2 and d < bd:
			bd = d
			best = o
	return best
