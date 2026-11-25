## THE BUG HUNT'S FINDS, FIXED (24 Nov 2026, his ask: “I'd like some agents to run the game and look for bugs”): `--only=bughunt
## --shots=<dir>`. Frostbite redone on monsters: four carrying it freeze him no more often than one does; Cauterize redone on a
## monster: it sears its wounds once, its own way, not also the old way; the evasive move's long name kept off the slow attack's
## plate (pictured); floor 5's cage walked into once it is down. And from the damage test: Brand in front makes a burn twice as hot
## once, not again on each crit (it grew to millions); a monster's meld makes his burn or poison worse once a burn, not each blow;
## Twin's two waves aimed so the nearer crosses the spot she aims at (heroes/mage.gd TWIN_AIM). The second round's: a monster's meld
## deepens his curse, lengthens his root or shock once while it lasts (Omen, Manacle, Stormglass); Miasma worsens a poison once;
## Brand's heat on a burn not passed on by Searing nor lit again by Rekindle; no royal's crest on a kind's called-up, split or risen;
## Strangler doubles a poison once however often it is held; floor 10's name and the quest banner pictured (hud.gd BANNER_CLEAR).
## The third round's: the Brawler's blows hold no boss; his moves are uses for their words, his jump gives its own, Twin echoes;
## a cursed one's burn and poison passed on at its death neither heated again nor dosed past their most; the Unfinished's pictures
## from behind; the Curse's echo kept to his sight; the demon the man again in town and as he falls. The fourth round's: a
## talent undone kept on reload; the Unsigned Pact lets go with life regen; the Burning Verse's mark goes with its burns; a tap
## on him on a phone changes him; no change in town, nor the Bound Demon there. The frost Mage's: a monster's Flash Freeze or
## Icebreaker not again for four seconds; Whiteout, Frostlock, Slowburn once a chill, freeze, burn; a worn-off chill not back deep.
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const FoeWords := preload("res://scripts/foe_words.gd")
const Words := preload("res://scripts/words.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("BUGHUNT %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func _near(k: int) -> Array:
	var alive: Array = M._monsters.list.filter(func(o): return is_instance_valid(o) and not o.dead and not o.boss)
	alive.sort_custom(func(a, b): return a.world.distance_to(h.world) < b.world.distance_to(h.world))
	return alive.slice(0, k)


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M.loot.ring_lit = true
	M.loot.taught = true
	if OS.get_environment("WS_BH_FROM") == "6":
		await _round6(dir)
		print("BUGHUNT: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
		return
	if OS.get_environment("WS_BH_FROM") == "5":
		await _round5(dir)
		print("BUGHUNT: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
		return
	if OS.get_environment("WS_BH_FROM") == "4":
		await _round4(dir)
		await _round4b(dir)
		print("BUGHUNT: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
		return
	await M.go_to("floor8", "start")
	await _wait(1.0)
	# FROSTBITE: one carrier, then four, him chilled all the while; how long he is held of six seconds
	var held := []
	var ms: Array = _near(4)
	for o in ms:
		o.words = []
	for k in [1, 4]:
		var on: Array = ms.slice(0, k)
		for i in on.size():
			on[i].words = ["frostbite"] + FoeWords.parts_of("frostbite")
			on[i].world = h.world + Vector2(1.5, 0.0).rotated(i * 1.3)
			on[i].stun_for(30.0)
		h.foe_hi.erase("rd_fb")
		h.held = 0.0
		var t := 0.0
		var ht := 0.0
		while t < 6.0:
			await M.get_tree().process_frame
			var dt: float = M.get_process_delta_time()
			t += dt
			h.chill_t = 3.0
			h.chill_k = 0.2
			if h.held > 0.0:
				ht += dt
		held.append(ht)
		for o in on:
			o.words = []
		h.held = 0.0
		h.chill_t = 0.0
		await _wait(0.6)
	_line(held[0] > 0.5 and held[1] < held[0] * 1.5, "Frostbite on monsters: held %.1f s of 6 by one carrier, %.1f s by four (no more often for more of them)" % held)
	# CAUTERIZE: brought low, it sears once, its own way (15% back); not the old searing (35%) as well
	var m = _near(1)[0]
	m.words = ["cauterize"] + FoeWords.parts_of("cauterize")
	m.max_life = 10000.0
	m.life = 4000.0
	m.stun_for(30.0)
	await _wait(0.3)
	m.life = 2000.0
	var most := 0.0
	var t2 := 0.0
	var last: float = m.life
	var ups := 0
	while t2 < 3.0:
		await M.get_tree().process_frame
		t2 += M.get_process_delta_time()
		if m.life > last + 1.0:
			ups += 1
			most = maxf(most, m.life)
		last = m.life
	_line(M52.is_redo("cauterize") and ups == 1 and most <= 2000.0 + 0.16 * 10000.0, "Cauterize on a monster at a fifth of its life: seared %d time(s), up to %d of 10000 (its own 15%%, not 35%% more)" % [ups, int(most)])
	m.words = []
	# BRAND IN FRONT (the damage test): ten critical hits on a burning one make its burn twice as hot, not 2^10 times
	m.max_life = 1.0e9
	m.life = 1.0e9
	h.loadout.front[0] = ["brand", null]
	h.loadout._r = [null, null, null]
	m.set_alight(100.0, 30.0)
	var d0: float = m.burn_dps
	for k in 10:
		h.m52.struck(m, 0, 100.0, true, m.world, true, true, false, false, false)
	var d1: float = m.burn_dps
	# (its burn out and lit again: twice as hot again, once)
	m.burn_t = 0.0
	h.m52.status_end(m, "burn")
	m.set_alight(100.0, 30.0)
	for k in 5:
		h.m52.struck(m, 0, 100.0, true, m.world, true, true, false, false, false)
	var d2: float = m.burn_dps
	# (Rekindle lights it again as it goes out: its own fire, not Brand's double of it; a crit then twice that, once)
	m.m52["rekindle"] = 1
	m.burn_t = 0.02
	await _wait(0.15)
	var d3: float = m.burn_dps
	for k in 5:
		h.m52.struck(m, 0, 100.0, true, m.world, true, true, false, false, false)
	var d4: float = m.burn_dps
	_line(is_equal_approx(d1, d0 * 2.0) and is_equal_approx(d2, 200.0) and m.burn_t > 0.0 and d3 <= 100.5 and d4 <= 200.5, "Brand: ten crits on a burning one, its burn %d a second to %d (twice, once); burned out and lit again, five crits, %d; lit again by Rekindle %d, five crits, %d" % [int(d0), int(d1), int(d2), int(d3), int(d4)])
	h.loadout.front[0] = [null, null]
	h.loadout._r = [null, null, null]
	m.burn_t = 0.0
	# A MONSTER'S MELD ON HIS BURN (Cremate, Flashfire, a Brand crit and the rest): five blows, worse once
	h.burn_t = 10.0
	h.burn_dps = 100.0
	for k in 5:
		h.worse("burn", "cremate", 1.5)
	var hb1: float = h.burn_dps
	h.poison_t = 10.0
	h.poison_dps = 100.0
	for k in 5:
		h.worse("poison", "strangler", 2.0, true)
	var hp1: float = h.poison_dps
	var ht1: float = h.poison_t
	# (both run out as they do, in his own time)
	h.burn_t = 0.01
	h.poison_t = 0.01
	await _wait(0.2)
	h.burn_t = 10.0
	h.burn_dps = 100.0
	h.worse("burn", "cremate", 1.5)
	_line(is_equal_approx(hb1, 150.0) and is_equal_approx(hp1, 200.0) and is_equal_approx(ht1, 5.0) and is_equal_approx(h.burn_dps, 150.0), "his burn after five blows of Cremate %d (from 100), his poison after five of Strangler %d over %.1f s (from 100 over 10); a new burn, worse again: %d" % [int(hb1), int(hp1), ht1, int(h.burn_dps)])
	h.burn_t = 0.0
	h.poison_t = 0.0
	# THE BUG HUNT'S SECOND ROUND: a monster's meld on his curse, his root, his shock: ten blows, worse once while it lasts
	var mo = _near(1)[0]
	var rows: Array = []
	for c in [["omen", "hex_t", "hex_more", 0.2, 1.5], ["manacle", "root_t", "root_t", 1.0, 2.0], ["stormglass", "shock_t", "shock_t", 1.0, 1.5]]:
		mo.words = [c[0]] + FoeWords.parts_of(c[0])
		h.set(c[1], 3.0 if c[1] != c[2] else float(c[3]))
		if c[1] != c[2]:
			h.set(c[2], float(c[3]))
		for k in 10:
			h._invuln = 0.0
			h.hurt_by(1.0, "phys", mo.words, {}, mo)
			# (his root and shock held as they were, all but what the meld does, as the blows' own may set them again)
			if c[1] == c[2]:
				h.set(c[1], maxf(float(h.get(c[1])), 0.01))
		rows.append([c[0], float(h.get(c[2])), float(c[3]) * float(c[4])])
		h.set(c[1], 0.0)
		await _wait(0.1)
	mo.words = []
	h.hex_more = 0.0
	_line(rows.all(func(r): return float(r[1]) <= float(r[2]) + 0.25), "ten blows of a monster carrying each: " + ", ".join(rows.map(func(r): return "%s %.2f (once: %.2f)" % [r[0], r[1], r[2]])))
	# MIASMA IN FRONT: ten hits on a poisoned one among the poisoned, its poison worse once
	var two: Array = _near(3)
	var mm = two[0]
	mm.max_life = 1.0e9
	mm.life = 1.0e9
	for o in two:
		o.world = mm.world + Vector2(0.5, 0.0) * two.find(o)
		o.dose(50.0, 30.0)
	h.loadout.front[0] = ["miasma", null]
	h.loadout._r = [null, null, null]
	var q0: float = mm.poison_dps
	for k in 10:
		h.m52.struck(mm, 0, 100.0, false, mm.world, true, false, false, false, false)
	var q1: float = mm.poison_dps
	h.loadout.front[0] = [null, null]
	h.loadout._r = [null, null, null]
	_line(q1 <= q0 * 1.81 and q1 > 0.0, "Miasma: ten hits on a poisoned one beside two more, its poison %d a second to %d (once, %d at most)" % [int(q0), int(q1), int(q0 * 1.8)])
	# STRANGLER IN FRONT (the Ranger's round): one poisoned, held, let go and held again three times; its poison twice once, not again
	var sm = _near(1)[0]
	sm.max_life = 1.0e9
	sm.life = 1.0e9
	h.loadout.front[0] = ["strangler", null]
	h.loadout._r = [null, null, null]
	h.m52.struck(sm, 0, 10.0, false, sm.world, true, false, false, false, false)
	sm.dose(100.0, 60.0)
	var g0: float = sm.poison_dps
	for k in 3:
		sm.bind_t = 1.0
		await _wait(0.3)
		sm.bind_t = 0.0
		await _wait(0.3)
	var g1: float = sm.poison_dps
	h.loadout.front[0] = [null, null]
	h.loadout._r = [null, null, null]
	_line(sm.m52.has("strangler") and g1 > g0 * 1.5 and g1 <= g0 * 2.01 + 1.0, "Strangler: a poison of %d a second on one held and let go three times: %d (twice, once; as it was, %d)" % [int(g0), int(g1), int(g0 * 8.0)])
	# A CURSED ONE'S BURN AND POISON PASSED ON AT ITS DEATH (the Warlock's round, monsters.gd spread_burns): a line of six, each struck
	# by a crit of Brand and dosed eight times, then passing its burn and poison to the next: twice as hot once, eight doses deep, each
	var line6: Array = _near(6)
	var at6: Vector2 = h.world + Vector2(30.0, 0.0)
	for o in line6:
		o.words = []
		o.max_life = 1.0e9
		o.life = 1.0e9
		o.world = at6
		o.stun_for(60.0)
	h.loadout.front[0] = ["brand", null]
	h.loadout._r = [null, null, null]
	line6[0].set_alight(100.0, 30.0)
	for j in 8:
		line6[0].dose(10.0, 30.0)
	var burns6: Array = []
	var pois6: Array = []
	for k in line6.size():
		var o = line6[k]
		h.m52.struck(o, 0, 100.0, true, o.world, true, true, false, false, false)
		if k > 0:
			for j in 8:
				o.dose(10.0, 30.0)
		burns6.append(int(o.burn_dps))
		pois6.append(int(o.poison_dps))
		if k + 1 < line6.size():
			var nx = line6[k + 1]
			nx.world = o.world + Vector2(1.0, 0.0)
			nx.burn_t = 0.0
			nx.poison_t = 0.0
			nx.poison_dps = 0.0
			nx.poison_n = 0
			for o2 in line6.slice(k + 2):
				o2.world = at6 + Vector2(0.0, 20.0)
			M._monsters.spread_burns(o)
			o.world = at6 + Vector2(0.0, -20.0)
	h.loadout.front[0] = [null, null]
	h.loadout._r = [null, null, null]
	_line(burns6[-1] <= burns6[0] + 1 and pois6[-1] <= pois6[0] * 1.5 + 1, "a cursed one's burn and poison passed on, hop by hop: burns %s, poisons %s (as it was, 200 to 6,400; 40 to 240)" % [str(burns6), str(pois6)])
	# THE EVASIVE MOVE'S LONG NAME: the longest melds on it in front and behind; pictured
	M.loot.level = 20
	h.loadout.front[2] = ["pressurepoint", "flashfreeze"]
	h.loadout.behind[2] = ["feedingfrenzy", "constellation"]
	h.loadout.front[1] = ["reverb", "twin"]
	h.loadout.behind[1] = ["pressurepoint", null]
	h.loadout._r = [null, null, null]
	await _wait(0.5)
	await M._snap(dir + "/bughunt_hud_long_name.png")
	# FLOOR 5'S CAGE: down, walked into from before it (not set on it), it takes him up
	h.loadout.front[2] = [null, null]
	h.loadout.behind[2] = [null, null]
	h.loadout.front[1] = [null, null]
	h.loadout.behind[1] = [null, null]
	h.loadout._r = [null, null, null]
	await M.go_to("floor5", "start")
	await _wait(1.0)
	var W = M.ways
	var went := false
	var walk := -1
	if W != null and W.way_kind() == "shaft":
		for o in M._monsters.list:
			if is_instance_valid(o) and o.boss:
				o.damage(o.life + o.shield + 10.0, "phys", false, false, [], false, false, -1)
		await _wait(1.0)
		var st0: String = W.state
		# (the Fleshmancer's own fight may keep him from falling to one blow: the way opened as his death opens it)
		if W.state != "opening" and W.state != "open":
			W._boss_dead = true
			W._open()
		var t3 := 0.0
		while t3 < 15.0 and W.state != "open":
			await M.get_tree().process_frame
			t3 += M.get_process_delta_time()
		var goal := Vector2(float(W._w["shaft"]["x"]) + 0.5, float(W._w["shaft"]["y"]) + 0.5)
		walk = M.map.walk[floori(goal.y) * M.map.w + floori(goal.x)]
		h.world = goal + Vector2(0.0, 1.2)
		var here: String = M.place
		var t4 := 0.0
		while t4 < 5.0 and not M._going and M.place == here:
			await M.get_tree().process_frame
			t4 += M.get_process_delta_time()
			var wd: Vector2 = goal - h.world
			h.auto_dir = preload("res://scripts/iso.gd").to_screen(wd.x, wd.y).normalized() if wd.length() > 0.02 else Vector2.ZERO
		h.auto_dir = Vector2.ZERO
		went = M._going or M.place != here
	_line(went and walk == 1, "floor 5's cage down (way %s): its tile walked (%d), and walked into from before it, it takes him up (%s)" % [W.state if W != null else "none", walk, went])
	# TWIN'S WAVES (the damage test: the Frost Mage's Shivering Twin Wave struck nothing 4.5 tiles before her): as they now fly, and
	# aimed (heroes/mage.gd TWIN_AIM), how far each passes from the spot she aims at, against its own reach and an enemy's
	var Mage := preload("res://scripts/heroes/mage.gd")
	var was: bool = Mage.TWIN_AIM
	M.set_class("mage", true)
	h = M.hero
	h.loadout.front[0] = ["shiver", "twin"]
	h.loadout._r = [null, null, null]
	await _wait(0.3)
	var miss := {}
	for on in [false, true]:
		Mage.TWIN_AIM = on
		h.kit.shots.clear()
		var from: Vector2 = h.world
		var to: Vector2 = from + Vector2(4.5, 0.0)
		h.kit._deliver(0, from, to, 1.0, false)
		var near := INF
		for sh in h.kit.shots:
			var p0 := Vector2(sh["x"], sh["y"])
			var v := Vector2(sh["vx"], sh["vy"]).normalized()
			# (where it is as it comes level with the aimed spot: its distance from it)
			var along: float = (to - p0).dot(v)
			near = minf(near, (p0 + v * along).distance_to(to) - float(sh["r"]))
		miss[on] = near
		h.kit.shots.clear()
	Mage.TWIN_AIM = was
	_line(miss[true] < 0.0, "Twin's waves 4.5 tiles out, the nearer's edge from the aimed spot: as now %.2f tiles (an enemy's middle 0.42 in misses past 0.42), aimed %.2f (over it)" % [miss[false], miss[true]])
	# THE ROYALS' CRESTS (the second round): floor 16, whose packs royals touch; what its kinds are made as when one is called up, split
	# or risen carries no royal's crest nor rune
	# (the cage's ride up, above, may still be going: a way taken while one is going is not taken)
	var tg := 0.0
	while M._going and tg < 15.0:
		await M.get_tree().process_frame
		tg += M.get_process_delta_time()
	await M.go_to("floor16", "start")
	var tw := 0.0
	while tw < 15.0 and (M._monsters == null or M._monsters.list.is_empty() or M.place != "floor16"):
		await M.get_tree().process_frame
		tw += M.get_process_delta_time()
	await _wait(0.5)
	var crowned: Array = []
	var touched := 0
	for o in M._monsters.list:
		if is_instance_valid(o) and o.get("royal") != null and str(o.get("royal")) != "":
			touched += 1
	for kind in M._monsters._plain:
		var t: Dictionary = M._monsters._plain[kind]
		if t.has("royal") or not (t.get("carries", []) as Array).is_empty():
			crowned.append(kind)
	_line(crowned.is_empty() and touched > 0 and M._monsters._plain.size() > 0, "floor 16 (%d of its monsters a royal's): the kinds as called up, split or risen, a royal's crest or rune on none of %d %s" % [touched, M._monsters._plain.size(), str(crowned)])
	# THE QUEST'S BANNER OVER FLOOR 10'S NAME (the Ranger's round: "The Sunken Fen, Level 1"): as now, and clear of it (hud.gd
	# BANNER_CLEAR, pictures first), pictured
	var Hud := preload("res://scripts/hud.gd")
	var hud_was: bool = Hud.BANNER_CLEAR
	await M.go_to("floor10", "start")
	tw = 0.0
	while tw < 15.0 and M.place != "floor10":
		await M.get_tree().process_frame
		tw += M.get_process_delta_time()
	# (the floor's own name across the screen as he comes in, gone first; the first lesson, to walk, learnt)
	M.hero.walked = 99999
	await _wait(6.0)
	for on in [false, true]:
		Hud.BANNER_CLEAR = on
		M.guide._speak = {"who": "mystic", "t": 99.0, "back": true}
		M.guide._place = M.place
		await _wait(1.0)
		await M._snap(dir + "/bughunt_banner_%s.png" % ("clear" if on else "now"))
	Hud.BANNER_CLEAR = hud_was
	_line(FileAccess.file_exists(dir + "/bughunt_banner_now.png") and FileAccess.file_exists(dir + "/bughunt_banner_clear.png"), "floor 10's name and the quest's banner pictured, as now and clear of it")
	# THE BRAWLER (the third round): his blows hold no boss; his moves are uses (Flurry grows); his jump gives its words (Swiftness,
	# Guarding); Twin behind echoes his blows
	M.set_class("brawler", true)
	h = M.hero
	M.loot.level = 40
	M.loot.derive()
	h.talents = ["vstiffjab", "vknockdown", "vlauncher", "vfullset", "vswitchkick", "vwallslam", "vaftershock", "vthunderknee"]
	h.talents_changed()
	tg = 0.0
	while M._going and tg < 15.0:
		await M.get_tree().process_frame
		tg += M.get_process_delta_time()
	await M.go_to("floor8", "start")
	await _wait(1.0)
	# (one free to be struck: not a chained rare on his stakes, nor shut in a room)
	var free: Array = _near(12).filter(func(o): return not M._monsters.shut_in(o))
	var bo = free[0] if not free.is_empty() else _near(1)[0]
	var spot2: Vector2 = h.world
	var mx := {"stun": 0.0, "stagger": 0.0}
	var rounds := {}
	for as_boss in [true, false]:
		bo.boss = as_boss
		bo.max_life = 1.0e8
		bo.life = 1.0e8
		bo.stun_t = 0.0
		bo.stagger_t = 0.0
		var ms2 := {"stun": 0.0, "stagger": 0.0}
		var t6 := 0.0
		var k6 := 0
		while t6 < 3.0:
			await M.get_tree().process_frame
			t6 += M.get_process_delta_time()
			h.world = spot2
			bo.world = spot2 + Vector2(1.2, 0.0)
			h.life = h.max_life
			ms2["stun"] = maxf(ms2["stun"], bo.stun_t)
			ms2["stagger"] = maxf(ms2["stagger"], bo.stagger_t)
			if k6 % 5 == 0:
				if (k6 / 5) % 3 == 2:
					h.auto_whirl = true
				else:
					h.auto_attack = true
			k6 += 1
		rounds[as_boss] = ms2
	bo.boss = false
	_line(float(rounds[true]["stun"]) == 0.0 and float(rounds[true]["stagger"]) == 0.0 and float(rounds[false]["stun"]) + float(rounds[false]["stagger"]) > 0.0, "the Brawler's punches and kicks, 3 s: on a boss stun %.1f s, stagger %.1f s at most; on one not a boss %.1f, %.1f" % [rounds[true]["stun"], rounds[true]["stagger"], rounds[false]["stun"], rounds[false]["stagger"]])
	# (Flurry in front of his punch; Twin behind it, of Echoes: the blows on it with and without)
	# (the rest near him gone, so that it is the one his blows go to)
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and o != bo and not o.boss and o.world.distance_to(spot2) < 14.0:
			o.damage(o.life + o.shield + 10.0, "phys", false, false, [], false, false, -1)
	await _wait(0.5)
	var blows_by: Array = []
	var fl := 0
	# (bare-handed his blows do nothing to count: a weapon's worth of harm)
	h.stats["dmg_min"] = 40.0
	h.stats["dmg_max"] = 50.0
	for w in [[null, null], ["flurry", null], [null, "twin"]]:
		h.loadout.front[0] = [w[0], null]
		h.loadout.behind[0] = [w[1], null]
		h.loadout._r = [null, null, null]
		await _wait(0.5)
		var nb := 0
		var lst7: float = bo.life
		var t7 := 0.0
		var k7 := 0
		while t7 < 3.0:
			await M.get_tree().process_frame
			t7 += M.get_process_delta_time()
			h.world = spot2
			bo.world = spot2 + Vector2(1.2, 0.0)
			bo.waits = false
			bo.speed = 0.0
			bo.state = "recover"
			bo._t = 1e9
			bo._cd = 1e9
			bo.life = maxf(bo.life, 1.0e7)
			h.life = h.max_life
			if bo.life < lst7 - 0.5:
				nb += 1
			lst7 = bo.life
			if k7 % 5 == 0:
				h.auto_attack = true
			k7 += 1
		blows_by.append(nb)
		if w[0] == "flurry":
			fl = h.m52.flurry_n
	h.loadout.front[0] = [null, null]
	h.loadout.behind[0] = [null, null]
	# (his jump: Guarding in front of it, Swiftness behind)
	h.loadout.front[2] = ["guarding", null]
	h.loadout.behind[2] = ["swift", null]
	h.loadout._r = [null, null, null]
	await _wait(0.5)
	h.haste = 0.0
	h.shield = 0.0
	h.kit.charges[2] = maxi(1, h.kit.charges[2])
	h.mana = h.max_mana
	var u2: int = h.uses[2]
	h.auto_lunge = h.world + Vector2(-2.0, 0.0)
	var hs := 0.0
	var sh2 := 0.0
	var t8 := 0.0
	while t8 < 2.0:
		await M.get_tree().process_frame
		t8 += M.get_process_delta_time()
		hs = maxf(hs, h.haste)
		sh2 = maxf(sh2, h.shield)
	h.loadout.front[2] = [null, null]
	h.loadout.behind[2] = [null, null]
	h.loadout._r = [null, null, null]
	_line(h.uses[2] > u2 and hs > 0.0 and sh2 > 0.0 and fl > 2 and blows_by[2] > blows_by[0], "the Brawler's moves as uses: his jump with Guarding and Swiftness, haste %.1f, shield %d; Flurry's blows %d after his punches (2 at first); blows landed in 3 s with nothing %d, Flurry %d, Twin behind %d" % [hs, int(sh2), fl, blows_by[0], blows_by[1], blows_by[2]])
	# THE WARLOCK'S ROUND: floor 6's Unfinished turned away (its wall pictures from the front only); the Curse's echo kept to where he
	# could see; the demon the man again come into town and as he falls
	tg = 0.0
	while M._going and tg < 15.0:
		await M.get_tree().process_frame
		tg += M.get_process_delta_time()
	await M.go_to("floor6", "start")
	await _wait(1.0)
	var unf = null
	for o in M._monsters.list:
		if is_instance_valid(o) and str(o.kind) == "unfinished":
			unf = o
	var backs: Array = []
	var fronts := 0
	if unf != null:
		for list in ["fusedStand", "fusedSlam", "fusedStomp", "fusedHurl", "fusedRockslide", "fusedReel", "tearFree"]:
			fronts += unf.art.count(0, list)
			backs.append(unf.art.count(1, list))
	_line(unf != null and fronts > 0 and backs.all(func(c): return int(c) > 0), "floor 6's Unfinished turned away: its wall pictures from behind %s (the front's where it has none; was an error each frame)" % str(backs))
	M.set_class("warlock", true)
	h = M.hero
	M.loot.level = 30
	M.loot.derive()
	await _wait(0.3)
	# (the Curse's echo: a spot behind a wall, 2 tiles past the first wall in any of the eight ways, as far as 9 tiles)
	var o6: Vector2 = h.world
	var aim6 := Vector2.INF
	for k in 8:
		var u := Vector2.RIGHT.rotated(TAU * k / 8.0)
		for d in range(1, 7):
			var p: Vector2 = o6 + u * float(d)
			if not h._clear(p.x, p.y):
				aim6 = o6 + u * float(d + 2)
				break
		if aim6 != Vector2.INF:
			break
	var landed: Vector2 = h.kit._reach_point(aim6, 9.0, o6) if aim6 != Vector2.INF else o6
	_line(aim6 != Vector2.INF and M._monsters.sees(o6, landed), "the Warlock's Curse echoed at a spot behind a wall from where he threw it: lands at %s, in his sight from there (%s); it went through" % [str(landed), str(M._monsters.sees(o6, landed))])
	await _round4(dir)
	await _round4b(dir)
	await _round5(dir)
	await _round6(dir)
	M.set_class("warlock", true)
	h = M.hero
	M.loot.level = 30
	M.loot.derive()
	await _wait(0.3)
	# (the demon: come into town as it, then fallen as it)
	h.kit._become("demon")
	h.kit.pact = 30.0
	tg = 0.0
	while M._going and tg < 15.0:
		await M.get_tree().process_frame
		tg += M.get_process_delta_time()
	await M.go_to("town", "start")
	await _wait(0.5)
	var town_form: String = h.kit.form
	await M.go_to("floor2", "start")
	await _wait(0.5)
	h.kit._become("demon")
	h.kit.pact = 30.0
	h.unhurt = false
	h._fall()
	var fall_form: String = h.kit.form
	var fall_pact: float = h.kit.pact
	_line(town_form == "man" and fall_form == "man" and fall_pact == 0.0, "the Warlock as the demon: come into town, %s; fallen, %s, his pact %d" % [town_form, fall_form, int(fall_pact)])
	print("BUGHUNT: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE FOURTH ROUND'S, THE WARLOCK'S (alone: WS_BH_FROM=4): on floor 6, the Warlock at level 30.
func _round4(dir: String) -> void:
	if str(h.cls) != "warlock" or not str(M.place).begins_with("floor"):
		var tg0 := 0.0
		while M._going and tg0 < 15.0:
			await M.get_tree().process_frame
			tg0 += M.get_process_delta_time()
		await M.go_to("floor6", "start")
		await _wait(1.0)
		M.set_class("warlock", true)
		h = M.hero
		M.loot.level = 30
		M.loot.derive()
		await _wait(0.3)
	var tg := 0.0
	# THE FOURTH ROUND'S, THE FROST MAGE'S: a monster's Flash Freeze or Icebreaker freezes him not again for four seconds, however
	# many strike; Whiteout deepens a chill by his frenzy once, not on each hit; Frostlock and Slowburn lengthen every freeze and
	# burn, not the first alone; a chill worn off comes back no deeper than it is made
	var hold4: Array = []
	var carriers: Array = _near(4)
	for word in ["flashfreeze", "icebreaker"]:
		var kw := func(w: String) -> float: return 1.0 if w == word else 0.0
		h.foe_hi.erase("freeze_at")
		h.held = 0.0
		var t4 := 0.0
		var ht4 := 0.0
		var next := 0.0
		var nb := 0
		while t4 < 8.0:
			await M.get_tree().process_frame
			var dt: float = M.get_process_delta_time()
			t4 += dt
			h.chill_t = 3.0
			h.chill_k = 0.3
			if t4 >= next and not carriers.is_empty():
				next += 0.125
				M._foe.after_blow(kw, carriers[nb % carriers.size()], 10.0, [])
				nb += 1
			if h.held > 0.0:
				ht4 += dt
		hold4.append(ht4)
		h.held = 0.0
		h.frozen_t = 0.0
		h.chill_t = 0.0
	_line(carriers.size() == 4 and hold4[0] < 2.5 and hold4[1] < 2.5, "four monsters striking eight times a second with Flash Freeze, then Icebreaker, him chilled: held %.1f s and %.1f s of 8 (was 6.4 and 6.9)" % hold4)
	var fm = carriers[0] if not carriers.is_empty() else null
	var wo: Array = []
	var fl: Array = []
	var sb: Array = []
	var stale := -1.0
	if fm != null:
		fm.waits = false
		if fm.state == "sleep":
			fm.wake_up()
		fm.stun_for(60.0)
		h.loadout.front[0] = ["whiteout", null]
		h.loadout._r = [null, null, null]
		h.frenzy = 3
		h.frenzy_t = 30.0
		fm.chill_t = 2.5
		fm.chill = 0.3
		fm.m52.erase("whiteout_add")
		for n8 in 8:
			h.m52.struck(fm, 0, 10.0, false, fm.world, true, false, true, false, false)
			wo.append(snappedf(fm.chill, 0.01))
		h.loadout.front[0] = ["frostlock", null]
		h.loadout._r = [null, null, null]
		for n3 in 3:
			fm.still_t = 30.0
			fm.frozen_t = 0.0
			fm.freeze_immune = 0.0
			fm.chill_t = 2.5
			fm.chill = 0.3
			h.m52.struck(fm, 0, 10.0, false, fm.world, true, fm.burn_t > 0.0, true, false, false)
			fl.append(snappedf(fm.frozen_t, 0.01))
			var tw := 0.0
			while fm.frozen_t > 0.0 and tw < 4.0:
				await M.get_tree().process_frame
				tw += M.get_process_delta_time()
		h.loadout.front[0] = ["slowburn", null]
		h.loadout._r = [null, null, null]
		for n3 in 3:
			fm.still_t = 30.0
			fm.burn_t = 0.0
			fm.set_alight(1.0, 3.0)
			h.m52.struck(fm, 0, 10.0, false, fm.world, true, fm.burn_t > 0.0, true, false, false)
			sb.append(snappedf(fm.burn_t, 0.01))
			fm.burn_t = 0.02
			await _wait(0.2)
		h.loadout.front[0] = [null, null]
		h.loadout._r = [null, null, null]
		h.frenzy = 0
		fm.chill = 0.9
		fm.chill_t = 0.0
		h.m52.rd._chill(fm, 2.0, 0.3)
		stale = fm.chill
	var wo_ok: bool = not wo.is_empty() and float(wo.max()) <= 0.3 + 0.06 * 3 + 0.011
	var fl_ok: bool = fl.size() == 3 and float(fl[1]) >= float(fl[0]) - 0.02 and float(fl[2]) >= float(fl[0]) - 0.02 and float(fl[0]) > 0.6
	var sb_ok: bool = sb.size() == 3 and float(sb[1]) >= float(sb[0]) - 0.05 and float(sb[2]) >= float(sb[0]) - 0.05 and float(sb[0]) > 3.0
	_line(wo_ok and fl_ok and sb_ok and absf(stale - 0.3) < 0.001, "Whiteout, frenzy 3, eight hits on one chilled 0.30: %s (was to 0.90); Frostlock's freezes %s, Slowburn's burns %s (was the first alone longer); a chill of 0.9 worn off, chilled 0.3 again: %.2f" % [str(wo), str(fl), str(sb), stale])
	# THE FOURTH ROUND'S, THE WARLOCK'S: undoing a talent kept on reload; the Unsigned Pact lets him go with life regen; the Burning
	# Verse's mark goes with its burns; a tap on him on a touch screen changes him; no change in town, the Bound Demon left behind
	var Tal := preload("res://scripts/talents.gd")
	var order := ["branded", "hexchain", "blazingarm", "terribleroar", "hunger", "feast", "bloodlust", "hellwave", "damnedsouls", "souldebt"]
	var tk: Array = Tal.starting("warlock")
	var legal := true
	for id in order:
		legal = legal and Tal.take_problem("warlock", 50, tk, id) == ""
		tk.append(id)
	var undo_ok: bool = Tal.unlearn_problem("warlock", tk, "branded") == ""
	var after_undo: Array = tk.filter(func(x): return x != "branded")
	var back: Array = Tal.clean("warlock", 50, after_undo)
	_line(legal and undo_ok and back.size() == after_undo.size(), "talents: ten taken, Branded undone (allowed %s): %d of %d back from a save (was 2)" % [str(undo_ok), back.size(), after_undo.size()])
	var Lw = M.loot
	var up = Lw.unique_piece("unsignedpact")
	var up_slot: String = "ring1" if up != null and up["slot"] == "ring" else (str(up["slot"]) if up != null else "")
	var was_up = Lw.gear.get(up_slot) if up != null else null
	if up != null:
		Lw.gear[up_slot] = up
		Lw.derive()
		h.uniques_changed()
	h.unhurt = false
	h.kit._become("demon")
	h.kit.pact = 0.0
	var floor_k: float = float(h.uniques.ut["pact"]["floor"])
	h.life = h.max_life * (floor_k + 0.03)
	h.stats["life_regen"] = h.max_life * 0.004
	var tu := 0.0
	var fed := false
	while tu < 6.0 and h.kit.form == "demon" and h.kit.change.is_empty():
		await M.get_tree().process_frame
		tu += M.get_process_delta_time()
		fed = fed or h.kit.feeding
	var let_go: bool = h.kit.form == "man" or not h.kit.change.is_empty()
	_line(up != null and fed and let_go, "the Unsigned Pact with life regen (%.1f a second): fed %s, let him go at %.2f of his life after %.1f s (fed for ever)" % [float(h.stats["life_regen"]), str(fed), h.life / h.max_life, tu])
	h.kit.turn_man()
	h.unhurt = true
	h.life = h.max_life
	Lw.gear[up_slot] = was_up
	var bv = Lw.unique_piece("burningverse")
	var bv_slot: String = "ring1" if bv != null and bv["slot"] == "ring" else (str(bv["slot"]) if bv != null else "")
	var was_bv = Lw.gear.get(bv_slot) if bv != null else null
	if bv != null:
		Lw.gear[bv_slot] = bv
	Lw.derive()
	h.uniques_changed()
	var mv0: Array = _near(1)
	var vm = mv0[0] if not mv0.is_empty() else null
	var verse_off := false
	var later_t := -1.0
	if vm != null:
		vm.waits = false
		if vm.state == "sleep":
			vm.wake_up()
		vm.curse_t = 2.0
		vm.burn_t = 2.0
		vm.burn_dps = 1.0
		await _wait(0.3)
		var marked: bool = vm.verse
		vm.burn_t = 0.0
		vm.hell_t = 0.0
		vm.curse_t = 0.0
		await _wait(0.2)
		verse_off = marked and not vm.verse
		vm.burn_t = 1.0
		vm.burn_dps = 1.0
		await _wait(1.6)
		later_t = vm.burn_t
	_line(vm != null and verse_off and later_t <= 0.0, "the Burning Verse: its mark gone with its burns %s; an uncursed burn after goes out (%.1f s left; it stayed)" % [str(verse_off), later_t])
	if bv != null:
		Lw.gear[bv_slot] = was_bv
		Lw.derive()
		h.uniques_changed()
	# (a tap on him on a touch screen, his pact full)
	var T = M._touch
	var finger := func(i: int, pt: Vector2, down: bool) -> void:
		var e := InputEventScreenTouch.new()
		e.index = i
		e.pressed = down
		e.position = pt
		Input.parse_input_event(e)
	var taps := []
	for md in ["auto", "tap"]:
		T.set_mode(md)
		h.kit.turn_man()
		h.kit.pact = 30.0
		await _wait(0.3)
		var sp: Vector2 = h.get_global_transform_with_canvas().origin + Vector2(0, -40)
		var win: Vector2 = M.get_viewport().get_final_transform() * sp
		finger.call(1, win, true)
		await _wait(0.08)
		finger.call(1, win, false)
		await _wait(0.4)
		taps.append(not h.kit.change.is_empty() or h.kit.form == "demon")
		await _wait(2.6)
	if dir != "":
		h.kit.turn_man()
		h.kit.pact = 30.0
		await _wait(0.3)
		await M._snap(dir + "/bughunt_tap_him.png")
	T.set_mode("auto")
	h.kit.turn_man()
	_line(taps.all(func(x): return x), "a touch screen: his pact full, a tap on him changes him, aiming auto and tap %s (nothing pressed R)" % str(taps))
	# (no change in town; the Bound Demon torn out does not follow him there)
	var tal0: Array = h.talents.duplicate()
	h.talents = Tal.starting("warlock") + ["terribleroar", "hunger", "bounddemon"]
	h.talents_changed()
	h.kit.pact = 30.0
	h.kit._tear_out()
	var torn: bool = not h.kit.bound.is_empty()
	tg = 0.0
	while M._going and tg < 15.0:
		await M.get_tree().process_frame
		tg += M.get_process_delta_time()
	await M.go_to("town", "start")
	await _wait(0.5)
	var bound_town: bool = not h.kit.bound.is_empty()
	h.talents = Tal.starting("warlock")
	h.talents_changed()
	h.kit.pact = 30.0
	h.auto_change = true
	await _wait(0.5)
	var town_change: bool = not h.kit.change.is_empty() or h.kit.form == "demon"
	_line(torn and not bound_town and not town_change, "town: the Bound Demon torn out on floor 6 there too %s (it stood by him); his pact full, R changed him %s (drawn the man with the demon's moves)" % [str(bound_town), str(town_change)])
	h.kit.turn_man()
	h.talents = tal0
	h.talents_changed()
	# (the quest's rune over the armourer, as now and clear of his name: act1/quest610.gd MARK_CLEAR, pictures first)
	if dir != "" and M.town != null:
		var Q6 := preload("res://scripts/act1/quest610.gd")
		h.kit.pact = 30.0
		var fur_was: String = M.loot.furnace
		M.loot.furnace = "out"
		for st in M.town.data["stations"]:
			if st["kind"] == "armourer":
				h.world = Vector2(float(st["x"]) + 1.6, float(st["y"]) - 0.6)
		var touch_was: bool = M._touch.on
		M._touch.on = false
		var mc_was: bool = Q6.MARK_CLEAR
		var WK := preload("res://scripts/heroes/warlock.gd")
		var ht_was: bool = WK.HINT_TOWN_OFF
		for on in [false, true]:
			Q6.MARK_CLEAR = on
			WK.HINT_TOWN_OFF = on
			await _wait(1.2)
			await M._snap(dir + ("/mark_clear.png" if on else "/mark_now.png"))
		Q6.MARK_CLEAR = mc_was
		WK.HINT_TOWN_OFF = ht_was
		M._touch.on = touch_was
		M.loot.furnace = fur_was


func _go4(where: String) -> void:
	M.loot.offer = ""
	if M._inv != null and M._inv.visible:
		M._inv.toggle()
	var tg := 0.0
	while M._going and tg < 15.0:
		await M.get_tree().process_frame
		tg += M.get_process_delta_time()
	await M.go_to(where, "start")
	await _wait(1.0)
	if M.sight != null:
		M.sight.see_all()


func _hero4(cls: String, talents: Array, picks := {}) -> void:
	M.set_class(cls, true)
	h = M.hero
	M.loot.level = 40
	h.talents = preload("res://scripts/talents.gd").starting(cls) + talents
	for k in picks:
		h.picks[k] = picks[k]
	h.talents_changed()
	M.loot.derive()
	h.life = h.max_life
	await _wait(0.3)


func _wear4(id: String) -> void:
	var it = M.loot.unique_piece(id)
	if it == null:
		return
	M.loot.gear["ring1" if it["slot"] == "ring" else str(it["slot"])] = it
	M.loot.derive()
	h.uniques_changed()


## THE FOURTH ROUND'S, THE RANGER'S (with WS_BH_FROM=4 too): the words a use answers on every hero's attacks; Venom's poison passed
## down a chain with its doses; a companion let go takes its picture with it, and each has a place of its own; the Snare holds an
## elite as every stun does.
func _round4b(dir: String) -> void:
	# (Guarding and Frenzied in front of the quick attack, Swift behind: a shield, a frenzy and haste from its uses, each hero)
	var rows: Array = []
	var all_ok := true
	for cls in ["ranger", "mage", "tinkerer", "warlock"]:
		await _hero4(cls, [])
		await _go4("floor11")
		var near: Array = _near(1)
		if near.is_empty():
			all_ok = false
			continue
		var o = near[0]
		o.max_life = 1.0e8
		o.life = 1.0e8
		o.speed = 0.0
		o.world = M._free_near(h.world + h.face * 3.0)
		M._monsters.wake(o)
		h.loadout.front[0] = ["guarding", "frenzied"]
		h.loadout.behind[0] = ["swift", null]
		h.loadout._r = [null, null, null]
		h.shield = 0.0
		h.haste = 0.0
		h.frenzy = 0
		var got := [0.0, 0.0, 0]
		var u0: int = h.uses[0]
		var t := 0.0
		while t < 3.0:
			await M.get_tree().process_frame
			t += M.get_process_delta_time()
			h.mana = h.max_mana
			h.life = h.max_life
			h.touch_aim = {0: o.world}
			h.auto_attack = true
			got[0] = maxf(got[0], h.shield)
			got[1] = maxf(got[1], h.haste)
			got[2] = maxi(got[2], h.frenzy)
		h.touch_aim = {}
		h.auto_attack = false
		h.loadout.front[0] = [null, null]
		h.loadout.behind[0] = [null, null]
		h.loadout._r = [null, null, null]
		var uses: int = h.uses[0] - u0
		rows.append("%s %d uses: shield %d, haste %d, frenzy %d" % [cls, uses, int(got[0]), int(got[1]), int(got[2])])
		all_ok = all_ok and uses > 0 and got[0] > 0.0 and got[1] > 0.0 and got[2] > 0
	_line(all_ok, "Guarding and Frenzied in front of the quick attack, Swift behind: %s (all 0 but the Warrior's and the Brawler's)" % "; ".join(rows))
	# (VENOM: eight poisoned ones dying in turn where the next stands)
	await _hero4("ranger", ["keeneye", "venom"])
	await _go4("floor13")
	var ms: Array = M._monsters.list.filter(func(q): return is_instance_valid(q) and not q.dead and not q.boss and not M._monsters.shut_in(q) and q.chained == 0)
	ms.sort_custom(func(a, b): return a.world.distance_to(h.world) < b.world.distance_to(h.world))
	ms = ms.slice(0, 6)
	var spot: Vector2 = M._free_near(h.world + h.face * 3.0)
	for q in ms:
		q.world = spot
		q.speed = 0.0
		q.max_life = 1.0e7
		q.life = 1.0e7
		q.state = "chase"
		q.seen = true
		q.stun_for(60.0)
	h.world = M._spot_near(spot, 6.0, h.world)
	var tops: Array = []
	for q in ms:
		for k in 8:
			q.dose(100.0)
		tops.append(int(q.poison_dps))
		q.last_skill = 0
		q.damage(q.life + q.shield + 10.0, "phys", false, false, [], false, false, 0)
		await _wait(0.4)
	var one_most: float = 100.0 * Words.poison_most(h) * (1.0 + float(h.stats.get("poison_pct", 0.0)) / 100.0)
	_line(ms.size() >= 4 and float(tops.max()) <= one_most * 1.5, "Venom: %d poisoned ones, eight doses of 100 each, dying in turn where the next stands: their poisons %s a second (one's most %d; was to 7,886)" % [ms.size(), str(tops), int(one_most)])
	# (THE COMPANIONS in town: picked again and again, the Pack Collar's wolf picked for the hunt too)
	await _hero4("ranger", ["keeneye", "huntcompanion", "wildcompanion"], {"pet:hunt": "hawk", "pet:wild": "bat"})
	await _go4("town")
	var C = M._companions
	_wear4("packcollar")
	await _wait(0.6)
	C.pick_collar("wolf")
	await _wait(0.6)
	C.pick("fox")
	await _wait(0.6)
	C.pick("tortoise")
	await _wait(0.6)
	C.pick("wolf")
	await _wait(1.0)
	var st = M._monsters.get("stands") if M._monsters != null else null
	var pics: int = st.get_children().filter(func(c): return not c.is_queued_for_deletion() and c.get("come") != null and c.get("shadow") != null).size() if st != null else -1
	var seats: Array = C.pets.map(func(q): return int(q["seat"]))
	var twice := false
	for k in seats.size():
		if seats.count(seats[k]) > 1:
			twice = true
	if dir != "":
		await M._snap(dir + "/companions_town.png")
	_line(pics == C.pets.size() and not twice and C.pets.size() == 3, "companions in town, picked four times, the collar's wolf picked for the hunt: %d out, %d pictures (each pick left one more), places %s (two on one)" % [C.pets.size(), pics, str(seats)])
	# (THE SNARE: thrown at an elite as fast as he can, 12 s)
	await _hero4("ranger", ["widetraps", "snare", "huntcompanion"], {"pet:hunt": "wolf"})
	await _go4("floor14")
	var ms2: Array = M._monsters.list.filter(func(q): return is_instance_valid(q) and not q.dead and not q.boss and not M._monsters.shut_in(q) and q.chained == 0)
	ms2.sort_custom(func(a, b): return a.world.distance_to(h.world) < b.world.distance_to(h.world))
	var held := 0.0
	if not ms2.is_empty():
		var e = ms2[0]
		for q in ms2.slice(1, 12):
			q.damage(q.life + q.shield + 10.0, "phys", false, false, [], false, false, -1)
		e.elite = true
		e.max_life = 1.0e8
		e.life = 1.0e8
		var at0: Vector2 = h.world
		e.world = M._free_near(at0 + Vector2(3.0, 0.0))
		M._monsters.wake(e)
		await _wait(0.3)
		var t5 := 0.0
		var k5 := 0
		while t5 < 12.0:
			await M.get_tree().process_frame
			var dt5: float = M.get_process_delta_time()
			t5 += dt5
			k5 += 1
			h.world = at0
			h.life = h.max_life
			if e.stun_t > 0.0 or e.bind_t > 0.0:
				held += dt5
			if k5 % 2 == 0:
				h.touch_aim = {0: e.world}
				h.auto_attack = true
		h.touch_aim = {}
		h.auto_attack = false
	_line(not ms2.is_empty() and held < 12.0 * 0.6, "the Snare thrown at an elite as fast as he can, 12 s: held %.1f s (was 11.4; an elite held half as long, as by every stun, and as Binding not again for 2 s)" % held)


## THE FIFTH ROUND'S (with WS_BH_FROM=5 alone): the Tinkerer's golem set down only where its body has room, a refused Contraption no
## use; the Warrior's Whirl and Lunge with the last words; a monster's Pin not again at once; Shiver not again for four seconds on an
## elite; Fervor forgotten with the floor; the Brawler's combo cancelled in his jump's crouch, his uses as his blows are made, the last
## words on his punches.
func _round5(dir: String) -> void:
	# (THE GOLEM: put down where open ground has no room for it (a prop, a slanted wall, water): it comes out again where it may stand)
	await _hero4("tinkerer", [])
	await _go4("floor8")
	var K = h.kit
	K._whistle(1, h.world + h.face * 2.0, 1.0, 1)
	await _wait(0.8)
	var bad_spot := Vector2.INF
	for r in range(1, 12):
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if bad_spot != Vector2.INF or maxi(absi(dx), absi(dy)) != r:
					continue
				var q := Vector2(floori(h.world.x) + dx + 0.5, floori(h.world.y) + dy + 0.5)
				if h.map.open_at(floori(q.x), floori(q.y)) and not M._monsters.clear(q.x, q.y, 0.3):
					bad_spot = q
	var gl: Array = K._up()
	var stood := false
	if not gl.is_empty() and bad_spot != Vector2.INF:
		gl[0]["x"] = bad_spot.x
		gl[0]["y"] = bad_spot.y
		await _wait(0.6)
		stood = K._stands(Vector2(gl[0]["x"], gl[0]["y"]))
	var near_ok: bool = bad_spot != Vector2.INF and K._stands(K._stand_near(bad_spot))
	_line(not gl.is_empty() and bad_spot != Vector2.INF and stood and near_ok, "the golem put down on open ground with no room for it (%s, floor 8): out again where it may stand %s (it stood in walls and props and fired)" % [str(bad_spot), str(stood)])
	# (A CONTRAPTION REFUSED: three standing, none past its first shot: no use, no boons)
	await _hero4("tinkerer", ["contraptions"])
	var ci := -1
	for k in 3:
		if h.loadout.id(k) == "contraption":
			ci = k
	var refused_ok := false
	var why_c := ""
	if ci >= 0:
		h.loadout.front[ci] = ["guarding", null]
		h.loadout._r = [null, null, null]
		for k in 3:
			h.kit._throw_contraption(ci, h.world, h.world + h.face * 2.0, 1.0)
		h.shield = 0.0
		var u0: int = h.uses[ci]
		h.uses[ci] += 1
		h.kit._deliver(ci, h.world, h.world + h.face * 2.0, 1.0, true)
		var standing_n: int = h.kit.contraptions.filter(func(q): return float(q["broke"]) < 0.0).size()
		refused_ok = h.uses[ci] == u0 and h.shield == 0.0 and standing_n == 3
		why_c = "move %d, uses %d to %d, shield %d, standing %d" % [ci, u0, h.uses[ci], int(h.shield), standing_n]
		h.loadout.front[ci] = [null, null]
		h.loadout._r = [null, null, null]
	_line(ci >= 0 and refused_ok, "a Contraption refused (three standing, none past its first shot): no use counted, no Guarding shield (it was a use): %s" % why_c)
	# (THE WARRIOR: Mirroring in front of his Whirl and of his Lunge: a reflection of each)
	await _hero4("warrior", [])
	await _go4("floor11")
	h.loadout.front[1] = ["mirroring", null]
	h.loadout.front[2] = ["mirroring", null]
	h.loadout._r = [null, null, null]
	h.last._heard.clear()
	h._land_whirl1()
	await _wait(0.3)
	var whirl_m: bool = h.last._heard.has("mirror_swing")
	h.last._heard.clear()
	h._begin_lunge(h.world + h.face * 3.0)
	await _wait(0.8)
	var lunge_m: bool = h.last._heard.has("mirror_swing")
	h.loadout.front[1] = [null, null]
	h.loadout.front[2] = [null, null]
	h.loadout._r = [null, null, null]
	_line(whirl_m and lunge_m, "Mirroring in front of the Warrior's Whirl %s and his Lunge %s: a reflection of each (the Strike alone had one)" % [str(whirl_m), str(lunge_m)])
	# (PIN: four monsters carrying it striking him eight times a second for 8 s: rooted how long, how long at most at once)
	var pins: Array = _near(4)
	var kp := func(w: String) -> float: return 1.0 if w == "pin" else 0.0
	h.root_t = 0.0
	h.root_again = 0.0
	var rooted := 0.0
	var most_root := 0.0
	var tp := 0.0
	var nextp := 0.0
	var np := 0
	while tp < 8.0:
		await M.get_tree().process_frame
		var dtp: float = M.get_process_delta_time()
		tp += dtp
		h.life = h.max_life
		if tp >= nextp and not pins.is_empty():
			nextp += 0.125
			M._foe.after_blow(kp, pins[np % pins.size()], 10.0, [])
			np += 1
		if h.root_t > 0.0:
			rooted += dtp
		most_root = maxf(most_root, h.root_t)
	h.root_t = 0.0
	_line(pins.size() == 4 and rooted < 4.0 and most_root < 1.3, "four monsters with Pin striking eight times a second, 8 s: rooted %.1f s, a root at most %.1f s (was 8.4 of 10, a root grown to 2.8)" % [rooted, most_root])
	# (SHIVER: ten crits on an elite in 5 s: frozen how long)
	var sv: Array = _near(1)
	var frozen_for := 0.0
	if not sv.is_empty():
		var e = sv[0]
		e.elite = true
		e.max_life = 1.0e8
		e.life = 1.0e8
		e.freeze_immune = 0.0
		e.waits = false
		if e.state == "sleep":
			e.wake_up()
		e.speed = 0.0
		h.loadout.front[0] = ["shiver", null]
		h.loadout._r = [null, null, null]
		var ts := 0.0
		var nexts := 0.0
		while ts < 5.0:
			await M.get_tree().process_frame
			var dts: float = M.get_process_delta_time()
			ts += dts
			if ts >= nexts:
				nexts += 0.5
				h.melds.struck8(e, 0, true, false)
			if e.frozen_t > 0.0:
				frozen_for += dts
		h.loadout.front[0] = [null, null]
		h.loadout._r = [null, null, null]
	_line(not sv.is_empty() and frozen_for < 2.0, "Shiver, ten crits on an elite in 5 s: frozen %.1f s (as every freeze, not again for 4 s; it was 4.0 of 4.9)" % frozen_for)
	# (FERVOR and IMPLODE: gone with the floor)
	h.melds.fervor_t = 3.0
	h.melds.fervor_n = 2.0
	h.melds.implosions = [{"t": 1.0}]
	h.fresh_place()
	_line(h.melds.fervor_t == 0.0 and h.melds.implosions.is_empty(), "Fervor's fury and Implode's bursts to come, the floor left: %.1f s, %d left (1.24 s went on)" % [h.melds.fervor_t, h.melds.implosions.size()])
	# (THE BRAWLER: his combo cancelled in his jump's crouch, then a tap: it is the jump's fire move, no error)
	await _hero4("brawler", [])
	await _go4("floor11")
	var B = h.kit
	B.charges[2] = 1
	h.mana = h.max_mana
	B._press("swipe", h.world + h.face * 2.0)
	if B.mv.is_empty() and not B.queue.is_empty():
		B._start()
	h.auto_change = true
	await M.get_tree().process_frame
	await M.get_tree().process_frame
	var gl_after: int = B.globes.size()
	var went: bool = B._press("tap")
	_line(gl_after == 1 and went and B.globes.size() >= 1 and str(B.globes[0]) in ["punchFire", "kickFire", "jump"], "the Brawler's combo cancelled in his jump's crouch: the jump's globe kept (%d), a tap then %s, globes %s (was a script error)" % [gl_after, str(went), str(B.globes)])
	await _wait(1.5)
	# (his uses as his blows are made: three quick taps, no use till each blow; then three)
	B.queue = []
	B.globes = []
	B.done = []
	B.mv = {}
	var u0b: int = h.uses[0]
	B._press("tap")
	B._press("tap")
	B._press("tap")
	var at_press: int = h.uses[0] - u0b
	var tb := 0.0
	while tb < 3.0 and (not B.queue.is_empty() or not B.mv.is_empty()):
		await M.get_tree().process_frame
		tb += M.get_process_delta_time()
	var at_blows: int = h.uses[0] - u0b
	_line(at_press == 0 and at_blows == 3, "the Brawler's three quick taps: uses as pressed %d, as the blows were made %d (it was 3 at the press)" % [at_press, at_blows])
	# (Mirroring in front of his punch: a reflection)
	await _wait(1.0)
	h.loadout.front[0] = ["mirroring", null]
	h.loadout._r = [null, null, null]
	h.last._heard.clear()
	B.globes = []
	B.done = []
	B._press("tap")
	await _wait(0.8)
	var punch_m: bool = h.last._heard.has("mirror_swing")
	h.loadout.front[0] = [null, null]
	h.loadout._r = [null, null, null]
	_line(punch_m, "Mirroring in front of the Brawler's punch: a reflection %s (his blows never had the last words)" % str(punch_m))


## THE SIXTH ROUND'S (WS_BH_FROM=6 alone): home by the waypoint leaves the floor behind; the Brawler's kick and jump wait for their
## levels; the Warlock as the demon told his own new move; his armour reckoned by an endless level's depth; the death screen names
## the endless level.
func _round6(dir: String) -> void:
	await _hero4("warlock", [])
	await _go4("floor2")
	h.kit._become("demon")
	h.burn_t = 3.0
	h.burn_dps = 10.0
	h.poison_t = 3.0
	h.poison_dps = 10.0
	h.root_t = 2.0
	var tg := 0.0
	while M._going and tg < 15.0:
		await M.get_tree().process_frame
		tg += M.get_process_delta_time()
	M.go_warp("town")
	await _wait(0.5)
	_line(str(M.place) == "town" and h.burn_t <= 0.0 and h.poison_t <= 0.0 and h.root_t <= 0.0 and h.kit.form == "man", "home by the waypoint burning, poisoned, rooted, the demon: in %s burn %.1f, poison %.1f, root %.1f, %s (they went home with him)" % [str(M.place), h.burn_t, h.poison_t, h.root_t, h.kit.form])
	# (the Warlock as the demon: his own move in its place, not the demon's)
	h.kit._become("demon")
	var own: String = h.loadout.own_id(1)
	var shown: String = h.loadout.id(1)
	h.kit.turn_man()
	_line(own != shown and own == str(Words.data()["classes"]["warlock"]["moves"][1]), "the Warlock as the demon, his second place: his own %s, the demon's %s (told DAMNING as a new move)" % [own, shown])
	# (the Brawler at level 1: no kick, no jump before their levels)
	await _hero4("brawler", [])
	M.loot.level = 1
	M.loot.derive()
	h.first_levels = true
	await _go4("floor2")
	var B = h.kit
	B.queue = []
	B.globes = []
	B.mv = {}
	B.charges[2] = 1
	var u1: int = h.uses[1]
	var u2: int = h.uses[2]
	B._press("hold")
	B._press("swipe", h.world + h.face * 2.0)
	var none: bool = B.queue.is_empty() and B.globes.is_empty() and h.uses[1] == u1 and h.uses[2] == u2
	h.first_levels = false
	M.loot.level = 40
	M.loot.derive()
	_line(none, "the Brawler at level 1: a hold and a swipe make nothing, globes %s (his kick and jump worked, hidden)" % str(B.globes))
	# (his armour at Endless 50: by the level's depth)
	var was_e: int = M.endless
	var was_in: bool = M.in_endless
	M.endless = 50
	M.in_endless = true
	var pd: float = h._power_depth()
	var want: float = float(M.endless_power())
	h.stats["armor"] = 366.0
	var cut: float = h.armour_cut()
	M.endless = was_e
	M.in_endless = was_in
	_line(absf(pd - want) < 0.01 and cut < 0.3, "his armour on Endless 50: reckoned at depth %d (the level's, %d), 366 armour cuts %d%% (by floor 2's, 75%%)" % [int(pd), int(want), roundi(cut * 100.0)])
	# (the death screen, fallen on Endless 44)
	var fe: int = M.fall_endless
	var fl: Dictionary = M.fall_lost
	M.fall_endless = 44
	M.fall_lost = {}
	var rows: Array = M.death_info().get("rows", [])
	M.fall_endless = fe
	M.fall_lost = fl
	_line(rows.size() > 1 and str(rows[1]) == "Fell in Endless 44", "the death screen, fallen on Endless 44: %s (was Fell in dungeon 12)" % (str(rows[1]) if rows.size() > 1 else "-"))
	# (A CRAWLER stunned on its climb up: up after it, not hidden for good)
	await _hero4("warrior", [])
	await _go4("floor7")
	var cr = null
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and "crawler" in str(o.kind) and o.h2 != null and int(o.h2.a1.get("hid", 0)) == 1:
			cr = o
			break
	var hid_after := -1
	var climbed := false
	if cr != null:
		h.unhurt = true
		h.world = M._spot_near(cr.world, 3.0, h.world)
		M._monsters.wake(cr)
		var tc := 0.0
		while tc < 6.0 and int(cr.h2.a1.get("hid", 0)) != 2:
			await M.get_tree().process_frame
			tc += M.get_process_delta_time()
			cr.h2.a1["wait"] = 0.0
		climbed = int(cr.h2.a1.get("hid", 0)) == 2
		if climbed:
			cr.stun_for(0.4)
			await _wait(3.0)
			hid_after = int(cr.h2.a1.get("hid", 0))
	_line(cr != null and climbed and hid_after == 0, "a crawler stunned on its climb up: hidden %d three seconds after (it stayed hidden, unkillable; climbing %s)" % [hid_after, str(climbed)])
	# (PIERCING'S MELDS on the Ranger's shot: its line on through the first it strikes)
	await _hero4("ranger", [])
	await _go4("floor11")
	var tgt: Array = _near(2)
	h.loadout.front[0] = ["bodkin", null]
	h.loadout._r = [null, null, null]
	var thr: float = float(h.loadout.r(0).get("through", 0.0))
	h.last._heard.clear()
	if not tgt.is_empty():
		var o0 = tgt[0]
		o0.max_life = 1.0e8
		o0.life = 1.0e8
		o0.world = M._free_near(h.world + h.face * 3.0)
		M._monsters.wake(o0)
		var tp := 0.0
		while tp < 2.5 and not h.last._heard.has("pierce_shot"):
			await M.get_tree().process_frame
			tp += M.get_process_delta_time()
			h.touch_aim = {0: o0.world}
			h.auto_attack = true
		h.touch_aim = {}
		h.auto_attack = false
	h.loadout.front[0] = [null, null]
	h.loadout._r = [null, null, null]
	_line(thr > 0.0 and h.last._heard.has("pierce_shot"), "Bodkin (a Piercing meld) on the Ranger's shot: its line on through the first it strikes %s (through %.2f; a shot never reached it)" % [str(h.last._heard.has("pierce_shot")), thr])
	# (HIS PICKS, 25 Nov 2026: the Brawler's kicks as hard as his punches; his jump lands with a blow; endless softer past 20)
	await _hero4("brawler", [])
	await _go4("floor11")
	var kp: float = float(h.loadout.r(1)["dmg_mult"]) / maxf(0.0001, float(h.loadout.r(0)["dmg_mult"]))
	var kw: float = float(Words.skill(h.loadout.id(1))["dmg"]) / maxf(0.0001, float(Words.skill(h.loadout.id(0))["dmg"]))
	_line(absf(kp - kw) < 0.01, "the Brawler's kick against his punch: %.2f of it (the moves' own shares %.2f; it was half that)" % [kp, kw])
	var jt: Array = _near(1)
	var jl0 := 0.0
	var jl1 := 0.0
	if not jt.is_empty():
		var jo = jt[0]
		jo.max_life = 1.0e7
		jo.life = 1.0e7
		jo.speed = 0.0
		jo.waits = false
		M._monsters.wake(jo)
		h.world = M._spot_near(jo.world, 1.2, h.world)
		var JB = h.kit
		JB.queue = []
		JB.globes = []
		JB.done = []
		JB.mv = {}
		JB.charges[2] = 1
		h.mana = h.max_mana
		jl0 = jo.life
		JB._press("swipe", jo.world)
		var tj := 0.0
		while tj < 2.5 and (not JB.queue.is_empty() or not JB.mv.is_empty()):
			await M.get_tree().process_frame
			tj += M.get_process_delta_time()
		await _wait(0.2)
		jl1 = jo.life
	_line(not jt.is_empty() and jl1 < jl0, "the Brawler's jump comes down by a monster: its life %d to %d (his jump struck nothing)" % [int(jl0), int(jl1)])
	var e_was: int = M.endless
	M.endless = 50
	var t50: float = M.endless_tough()
	M.endless = 20
	var t20: float = M.endless_tough()
	M.endless = e_was
	_line(absf(t20 - pow(1.1, 19)) < 0.01 and absf(t50 - pow(1.1, 19) * pow(1.03, 30)) < 0.01, "endless monsters past level 20: x%.1f at Endless 20 as before, x%.1f at Endless 50 (was x106.7)" % [t20, t50])
