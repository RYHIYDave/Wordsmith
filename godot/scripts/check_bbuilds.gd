## THE BRAWLER'S BUILDS, CHECKED AND PICTURED (heroes/brawler3.gd: `--only=bbuilds --bbuilds=1 --shots=<dir>`). On floor 2, the
## Brawler remade and his builds on: the new stones in his tree, read on the TALENTS page, and the three stances only one at a time;
## then each played against skeletons held where they are set: Flurry, three punches a tap, quicker and lighter (and with Quick Hands
## a globe each); the Cannon Kick, the one his push kick strikes flying into the rest; Stepping Stones, one jump's flying blow
## springing on to two more; Fire Stance's burning floor where he lands; Lightning Stance's arcs off a kick, and Thunder Knee's
## passing on what they kill; Poison Stance's poisoned punches, and Viper Jab's poison passed on to one he drives it into; The Last
## Round, three globes lit and a swipe free. A line a step (OK or WRONG), and pictures.
extends "res://scripts/check_brawler2.gd"

const B3 := preload("res://scripts/heroes/brawler3.gd")


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("BBUILDS %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/c%02d_%s.png" % [dir, shot, name])


## (for the film of the check, `--write-movie`: where each of the moves shown begins and ends, in frames drawn)
func _mark(name: String) -> void:
	print("BBUILDS FILM %s %d" % [name, Engine.get_frames_drawn()])


## The TALENTS page, talent `id` read on its card, the way to it taken.
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


## The pack set out where `at` says, each (ahead, to his left) of home along his way; the rest of the pack far off.
func _lay(at: Array) -> void:
	h.world = home
	h._place()
	h._turn(way)
	K._clear_own()
	K.charges[2] = 1
	K.cd[2] = 0.0
	var left := Vector2(way.y, -way.x)
	for k in pack.size():
		var m = pack[k]
		m.max_life = 100000.0
		m.life = 100000.0
		m.poison_t = 0.0
		m.poison_dps = 0.0
		m.burn_t = 0.0
		m.stagger_cd = 0.0
		m.stagger_t = 0.0
		if k < at.size():
			_put(m, home + way * float(at[k][0]) + left * float(at[k][1]))
		else:
			_put(m, home - way * (6.0 + k) + left * 6.0)


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	B2.on = true
	B3.on = true
	Talents._b2_tree = {}
	M.set_class("brawler", true)
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
	if near.size() < 5:
		for m in M._monsters.list:
			if is_instance_valid(m) and not m.dead and not m.elite and not m.boss and not near.has(m):
				near.append(m)
	near.sort_custom(func(a, b) -> bool: return a.world.distance_to(home) < b.world.distance_to(home))
	pack = near.slice(0, 5)
	for o in M._monsters.list:
		if is_instance_valid(o) and not pack.has(o):
			o.queue_free()
	if pack.size() < 5:
		_line(false, "floor 2 has no five to set out (%d)" % pack.size())
		return
	var A = pack[0]
	var B = pack[1]
	var C = pack[2]
	var D = pack[3]
	var E = pack[4]
	# --- HIS TREE ---
	var tree: Dictionary = Talents.tree("brawler")
	for id in B3.NODES:
		var N: Dictionary = B3.NODES[id]
		var t: Dictionary = Talents.of("brawler", id)
		var joined := true
		for f in N["from"]:
			joined = joined and (Talents.of("brawler", f)["joined"] as Array).has(id)
		_line(not t.is_empty() and t["text"] == N["text"] and joined and Talents.ported("brawler", id),
			"%s in his tree, off %s, joined to it: \"%s\"" % [N["name"], " or ".join(N["from"]), t.get("text", "")])
	var p_flurry: String = Talents.take_problem("brawler", 50, ["vstiffjab"], "vflurry")
	var p_two: String = Talents.take_problem("brawler", 50, ["vlightfeet", "vfirestarter", "vfirestance", "vswitchkick", "vlonglegs"], "vlightningstance")
	var p_one: String = Talents.take_problem("brawler", 50, ["vswitchkick", "vlonglegs"], "vlightningstance")
	_line(p_flurry == "" and p_two != "" and p_one == "", "Flurry straight after Stiff Jab (\"%s\"); a second stance refused (\"%s\"); the first taken freely (\"%s\")" % [p_flurry, p_two, p_one])
	_line(Talents.of("brawler", "vviperjab")["text"] == B3.TEXT["vviperjab"] and Talents.of("brawler", "vthunderknee")["text"] == B3.TEXT["vthunderknee"],
		"Viper Jab and Thunder Knee build on their stances: \"%s\" / \"%s\"" % [Talents.of("brawler", "vviperjab")["text"], Talents.of("brawler", "vthunderknee")["text"]])
	await _page("vflurry", ["vstiffjab"], "tree_flurry")
	await _page("vsteppingstones", ["vlightfeet"], "tree_stepping_stones")
	await _page("vcannonkick", ["vswitchkick"], "tree_cannon_kick")
	await _page("vpoisonstance", ["vstiffjab", "vviperjab"], "tree_poison_stance")
	await _page("vfirestance", ["vlightfeet", "vfirestarter"], "tree_fire_stance")
	await _page("vlightningstance", ["vswitchkick", "vlonglegs"], "tree_lightning_stance")
	await _page("vviperjab", ["vstiffjab"], "tree_viper_jab")
	await _page("vthunderknee", ["vswitchkick", "vlonglegs", "vaftershock"], "tree_thunder_knee")
	# --- FLURRY: one tap, three punches, quicker, each lighter ---
	h.talents = ["vstiffjab"]
	_lay([[1.6, 0.0]])
	await _run(0.3)
	var t0 := Time.get_ticks_msec()
	await _press("tap")
	await _press("tap")
	await _press("tap")
	await _run(4.0, func(): return _played())
	var plain_ms := Time.get_ticks_msec() - t0
	h.talents = ["vstiffjab", "vflurry"]
	_lay([[1.6, 0.0]])
	await _run(0.3)
	var a0: float = A.life
	var seen: Array = []
	var o := {"snapped": false, "flurry": true}
	t0 = Time.get_ticks_msec()
	await _press("tap")
	await _run(4.0, func():
		if not K.mv.is_empty() and (seen.is_empty() or seen.back() != K.mv["id"]):
			seen.append(K.mv["id"])
			o["flurry"] = bool(o["flurry"]) and K.mv.get("flurry", false)
		return _played() and seen.size() >= 3)
	var flurry_ms := Time.get_ticks_msec() - t0
	_line(seen == ["jab", "cross", "hook"] and bool(o["flurry"]) and A.life < a0 and flurry_ms < plain_ms,
		"Flurry: one tap threw %s (%s), the one before him struck (%.0f to %.0f), in %d ms (three taps without it: %d ms)" % [seen, "all Flurry punches" if o["flurry"] else "not all Flurry", a0, A.life, flurry_ms, plain_ms])
	_line(is_equal_approx(float(B3.FLURRY["share"]), 0.6) and int(B3.FLURRY["n"]) == 3, "Flurry: each punch for %.0f%% of a punch, %d a tap" % [float(B3.FLURRY["share"]) * 100.0, int(B3.FLURRY["n"])])
	h.talents = ["vstiffjab", "vquickhands", "vflurry"]
	_lay([[1.6, 0.0]])
	await _run(0.3)
	_mark("flurry_in")
	await _press("tap")
	await _run(0.35)
	await _snap("flurry")
	await _run(4.0, func(): return _played())
	await _run(0.6)
	_mark("flurry_out")
	_line(K.globes == ["punch", "punch", "punch"], "Flurry with Quick Hands: one tap, three punch globes lit (%s)" % [K.globes])
	# --- CANNON KICK: the push kick sends the one it kicks flying into the rest ---
	h.talents = ["vswitchkick", "vcannonkick"]
	_lay([[1.5, 0.0], [3.6, 0.2], [5.2, -0.2], [3.0, 3.5]])
	await _run(0.3)
	var lives: Array = [A.life, B.life, C.life, D.life]
	var from_a: Vector2 = A.world
	var b_at: Vector2 = B.world
	K.done = ["roundkick"]
	K.idle = 0.0
	await _press("hold")
	o = {"pushed": false, "snapped": false}
	await _run(2.0, func():
		if not K.mv.is_empty() and K.mv["id"] == "push":
			o["pushed"] = true
		return _played() and A.thrown.is_empty())
	var pushed: bool = o["pushed"]
	_line(pushed and A.world.distance_to(from_a) > 3.0 and B.life < float(lives[1]) and C.life < float(lives[2]) and D.life == float(lives[3]) and B.world.distance_to(b_at) > 0.3,
		"Cannon Kick: his push kick (%s) sent the first flying %.1f tiles; the two in its way struck (%.0f, %.0f lost) and knocked aside (%.1f tiles), the one off its way untouched (%.0f lost)" % [pushed, A.world.distance_to(from_a), float(lives[1]) - B.life, float(lives[2]) - C.life, B.world.distance_to(b_at), float(lives[3]) - D.life])
	_lay([[1.5, 0.0], [3.6, 0.2], [5.2, -0.2]])
	await _run(0.3)
	_mark("cannon_in")
	K.done = ["roundkick"]
	K.idle = 0.0
	await _press("hold")
	await _run(3.0, func(): return not A.thrown.is_empty())
	await _run(0.12)
	await _snap("cannon_kick_flying")
	await _run(2.0, func(): return _played() and A.thrown.is_empty())
	await _run(0.8)
	_mark("cannon_out")
	h.talents = ["vswitchkick", "vwallslam", "vcannonkick"]
	_lay([[1.5, 0.0], [3.6, 0.0]])
	await _run(0.3)
	K.done = ["roundkick"]
	K.idle = 0.0
	await _press("hold")
	o = {"stun": 0.0, "stagger": 0.0}
	await _run(2.0, func():
		o["stun"] = maxf(float(o["stun"]), A.stun_t)
		o["stagger"] = maxf(float(o["stagger"]), A.stagger_t)
		return _played() and A.thrown.is_empty())
	_line(float(o["stun"]) > 0.0 or float(o["stagger"]) > 0.0, "Cannon Kick with Wall Slam: the one sent flying into another held, as Wall Slam holds now that stuns are rare (stunned %.1f s, staggered %.1f s)" % [float(o["stun"]), float(o["stagger"])])
	# --- STEPPING STONES: a swipe again during a flying blow springs on, free and quicker, up to three ---
	h.talents = ["vlightfeet", "vsteppingstones"]
	_lay([[4.0, 0.0], [7.5, 0.0], [11.2, 0.0], [17.0, 0.0]])
	K.globes = ["punch"]
	await _run(0.2)
	lives = [A.life, B.life, C.life, D.life]
	var jumps0: int = h.uses[2]
	await _press("swipe", A.world)
	o = {"blows": 0, "last": -1, "asked": 0, "times": [], "t": 0.0, "hops": []}
	await _run(8.0, func():
		o["t"] = float(o["t"]) + M.get_process_delta_time()
		if not K.mv.is_empty() and int(K.mv["n"]) != int(o["last"]) and B2.FLYING.has(K.mv["id"]):
			o["last"] = K.mv["n"]
			o["blows"] = int(o["blows"]) + 1
			(o["times"] as Array).append(o["t"])
			(o["hops"] as Array).append(int(K.mv.get("hops", 0)))
		# (a swipe again once each blow is in the air, at the next one along)
		if not K.mv.is_empty() and B2.FLYING.has(K.mv["id"]) and int(o["asked"]) < int(o["blows"]) and float(K.mv["f"]) > 2.0 and int(o["asked"]) < 2:
			o["asked"] = int(o["asked"]) + 1
			h.auto_lunge = [B, C][int(o["asked"]) - 1].world
		return _played() and float(o["t"]) > 0.5)
	var blows: int = o["blows"]
	var tt: Array = o["times"]
	var first_long: float = float(tt[1]) - float(tt[0]) if tt.size() >= 3 else 0.0
	var second_long: float = float(tt[2]) - float(tt[1]) if tt.size() >= 3 else 0.0
	_line(blows == 3 and A.life < float(lives[0]) and B.life < float(lives[1]) and C.life < float(lives[2]) and D.life == float(lives[3]) and h.uses[2] == jumps0 + 1 and o["hops"] == [0, 1, 2],
		"Stepping Stones: a swipe, then two more as he flew, %d flying blows (%s); the three struck (%.0f, %.0f, %.0f lost), the one far off not (%.0f lost); one jump spent in all (%d)" % [blows, o["hops"], float(lives[0]) - A.life, float(lives[1]) - B.life, float(lives[2]) - C.life, float(lives[3]) - D.life, h.uses[2] - jumps0])
	_line(second_long > 0.0 and second_long < first_long * 0.75, "Stepping Stones: a spring on played quicker (the first blow till the next %.2f s, the spring on till the third %.2f s)" % [first_long, second_long])
	_lay([[4.0, 0.0], [7.5, 0.0], [11.2, 0.0]])
	K.globes = ["punch"]
	await _run(0.2)
	var b0: float = B.life
	await _press("swipe", A.world)
	o = {"blows": 0, "last": -1}
	await _run(6.0, func():
		if not K.mv.is_empty() and int(K.mv["n"]) != int(o["last"]):
			o["last"] = K.mv["n"]
			o["blows"] = int(o["blows"]) + 1
		return _played())
	_line(int(o["blows"]) == 1 and B.life == b0, "Stepping Stones, no swipe again: the one blow, he comes down as ever (%d; the next one along untouched, %.0f lost)" % [int(o["blows"]), b0 - B.life])
	_lay([[4.0, 0.0], [7.5, 0.0], [11.2, 0.0]])
	K.globes = ["punch"]
	await _run(0.2)
	_mark("stones_in")
	await _press("swipe", A.world)
	o = {"blows": 0, "last": -1, "asked": 0, "snapped": false}
	await _run(6.0, func():
		if not K.mv.is_empty() and int(K.mv["n"]) != int(o["last"]) and B2.FLYING.has(K.mv["id"]):
			o["last"] = K.mv["n"]
			o["blows"] = int(o["blows"]) + 1
		if not K.mv.is_empty() and B2.FLYING.has(K.mv["id"]) and int(o["asked"]) < int(o["blows"]) and float(K.mv["f"]) > 2.0 and int(o["asked"]) < 2:
			o["asked"] = int(o["asked"]) + 1
			h.auto_lunge = [B, C][int(o["asked"]) - 1].world
		return int(o["blows"]) >= 2 and float(K.mv.get("f", 0.0)) > 3.0)
	await _snap("stepping_stones_second")
	await _run(6.0, func():
		if not K.mv.is_empty() and int(K.mv["n"]) != int(o["last"]) and B2.FLYING.has(K.mv["id"]):
			o["last"] = K.mv["n"]
			o["blows"] = int(o["blows"]) + 1
		if not K.mv.is_empty() and B2.FLYING.has(K.mv["id"]) and int(o["asked"]) < int(o["blows"]) and float(K.mv["f"]) > 2.0 and int(o["asked"]) < 2:
			o["asked"] = int(o["asked"]) + 1
			h.auto_lunge = [B, C][int(o["asked"]) - 1].world
		return _played())
	await _run(0.6)
	_mark("stones_out")
	# --- FIRE STANCE: the floor burning where a flying blow comes down ---
	h.talents = ["vlightfeet", "vfirestarter", "vfirestance"]
	_lay([[4.0, 0.0]])
	K.globes = ["punch"]
	await _run(0.2)
	a0 = A.life
	_mark("fire_in")
	await _press("swipe", A.world)
	await _run(3.0, func(): return _played())
	var burning := false
	for z in h.wakes.list:
		if str(z.get("kind", "")) == "burn" and Vector2(z["x"], z["y"]).distance_to(h.world) < 2.0:
			burning = true
	await _run(0.4)
	await _snap("fire_stance")
	await _run(1.2)
	_mark("fire_out")
	_line(burning and A.life < a0, "Fire Stance: where his hammerfist came down, the floor burning (%s); the one there struck (%.0f to %.0f)" % [burning, a0, A.life])
	h.talents = ["vlightfeet", "vfirestarter"]
	_lay([[4.0, 0.0]])
	K.globes = ["punch"]
	await _run(float(B3.FIRE["secs"]) + 0.5)
	K.globes = ["punch"]
	await _press("swipe", A.world)
	await _run(3.0, func(): return _played())
	burning = false
	for z in h.wakes.list:
		if str(z.get("kind", "")) == "burn" and Vector2(z["x"], z["y"]).distance_to(h.world) < 2.0:
			burning = true
	_line(not burning, "without Fire Stance, no burning floor (%s)" % burning)
	# --- POISON STANCE: every punch poisons; Viper Jab passes it on ---
	h.talents = ["vstiffjab", "vguardup", "vpoisonstance"]
	_lay([[1.5, 0.0]])
	await _run(0.3)
	K.done = []
	_mark("poison_in")
	await _press("tap")
	await _press("tap")
	o = {"cross": false}
	await _run(2.0, func():
		if not K.mv.is_empty() and K.mv["id"] == "cross":
			o["cross"] = true
		return _played())
	_line(bool(o["cross"]) and A.poison_t > 0.0, "Poison Stance: a cross (%s) poisoned the one it struck (%.1f s of poison)" % [o["cross"], A.poison_t])
	await _snap("poison_stance")
	await _run(1.0)
	_mark("poison_out")
	h.talents = ["vstiffjab"]
	_lay([[1.5, 0.0]])
	await _run(0.3)
	K.done = ["jab"]
	K.idle = 0.0
	await _press("tap")
	await _run(2.0, func(): return _played())
	_line(A.poison_t <= 0.0, "without Poison Stance, a cross poisons nothing (%.1f s)" % A.poison_t)
	h.talents = ["vstiffjab", "vviperjab", "vpoisonstance", "vswitchkick"]
	_lay([[1.5, 0.0], [2.6, 0.0]])
	await _run(0.3)
	A.dose(50.0, 5.0)
	var b_poison: float = B.poison_t
	await _press("hold")
	await _run(2.0, func(): return _played())
	_line(b_poison <= 0.0 and B.poison_t > 0.0, "Viper Jab in Poison Stance: the poisoned one his kick drove into another passed its poison on (%.1f s, before %.1f s)" % [B.poison_t, b_poison])
	# --- LIGHTNING STANCE: a kick's arcs, and Thunder Knee passing on what they kill ---
	h.talents = ["vswitchkick", "vwallslam", "vlightningstance"]
	_lay([[1.5, 0.0], [3.5, 0.8], [3.9, -0.8], [7.5, 0.0]])
	await _run(0.3)
	lives = [A.life, B.life, C.life, D.life]
	_mark("lightning_in")
	await _press("hold")
	await _run(0.35)
	await _snap("lightning_stance")
	await _run(2.0, func(): return _played())
	await _run(0.6)
	_mark("lightning_out")
	_line(B.life < float(lives[1]) and C.life < float(lives[2]) and D.life == float(lives[3]),
		"Lightning Stance: a round kick's lightning arced to the two nearest (%.0f, %.0f lost), not to the one beyond (%.0f lost)" % [float(lives[1]) - B.life, float(lives[2]) - C.life, float(lives[3]) - D.life])
	h.talents = ["vswitchkick", "vwallslam", "vaftershock", "vthunderknee", "vlightningstance"]
	_lay([[1.5, 0.0], [3.5, 0.8], [3.9, -0.8], [6.3, 0.9]])
	await _run(0.3)
	B.life = 1.0
	B.max_life = 1.0
	var d0: float = D.life
	await _press("hold")
	await _run(2.0, func(): return _played())
	_line(B.dead and D.life < d0, "Thunder Knee in Lightning Stance: the one the lightning killed (%s) passed it on to the next (%.0f lost)" % [B.dead, d0 - D.life])
	# --- THE LAST ROUND: three globes lit, a swipe free ---
	var L = M.loot
	var it: Dictionary = L.unique_piece("lastround")
	L.gear["mainhand"] = it
	L.derive()
	h.talents = []
	_lay([[4.0, 0.0]])
	await _run(0.2)
	K.charges[2] = 0
	K.cd[2] = 5.0
	K.globes = ["punch", "kick", "punch"]
	await _press("swipe", A.world)
	var free: bool = not K.mv.is_empty() and B2.FLYING.has(K.mv["id"]) and K.charges[2] == 0
	await _run(3.0, func(): return _played())
	_lay([[4.0, 0.0]])
	await _run(0.2)
	K.charges[2] = 0
	K.cd[2] = 5.0
	K.globes = ["punch", "kick"]
	await _press("swipe", A.world)
	var denied: bool = K.mv.is_empty() and K.globes == ["punch", "kick"]
	await _run(1.0)
	var card: Array = M._inv.does_of(it)
	_line(free and denied and card == [B3.LAST_ROUND], "The Last Round: three globes lit, no jump left, the swipe flew free (%s); two lit, no jump, it did not (%s); its card \"%s\"" % [free, denied, " ".join(card)])
	L.gear["mainhand"] = null
	L.derive()
	B3.on = false
	Talents._b2_tree = {}
	print("BBUILDS DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else ": " + str(bad)])
