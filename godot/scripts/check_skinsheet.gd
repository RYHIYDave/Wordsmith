## EVERY UNIQUE WEAPON ON ITS HERO, PICTURED (`--only=skinsheet --shots=<dir>`): each hero in turn holding his own weapon and then
## each of his unique ones (skins.gd), from two sides, for a sheet to tell them apart by (his question, 24 Nov 2026: “Do any of
## these uniques resemble other unique weapons too closely to be able to distinguish them on the character?”).
extends RefCounted


func run(M, h, dir: String) -> void:
	var Sk := preload("res://scripts/skins.gd")
	var L = M.loot
	M.go_to("floor5", "start")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	for o in M._monsters.list:
		if is_instance_valid(o):
			o.world = h.world + Vector2(40, 40)
			o._place()
	var each := {
		"warrior": Sk.WARRIOR_KIND.keys(), "ranger": Sk.OF_UNIQUE["ranger"].keys(), "mage": Sk.OF_UNIQUE["mage"].keys(),
		"warlock": Sk.OF_UNIQUE["warlock"].keys(), "tinkerer": Sk.OF_UNIQUE["tinkerer"].keys(), "brawler": Sk.OF_UNIQUE["brawler"].keys(),
	}
	for c in each:
		for u in [""] + each[c]:
			M.set_class(c, true)
			L.level = 20
			if c == "warrior":
				var kind: String = Sk.WARRIOR_KIND.get(u, "")
				h.talents = [] if kind == "" else ["battleaxe" if kind == "axe" else "warhammer"]
				h.arm()
			if u != "":
				L.gear["mainhand"] = L.unique_piece(u)
				L.derive()
			await M._wait(0.5)
			var k := 0
			for f in [Vector2(1, 0), Vector2(0, -1)]:
				h._turn(f)
				await M._wait(0.25)
				await M._snap("%s/%s__%s__%d.png" % [dir, c, u if u != "" else "0own", k])
				k += 1
			print("SKINSHEET %s %s: %s" % [c, u, h.skin])
		h.talents = []
